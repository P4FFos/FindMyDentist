<template>
  <div class="adminPage">
    <div v-if="!isAuthenticated" class="password-protection">
      <h2>Enter Password</h2>
      <input
          type="password"
          v-model="passwordInput"
          placeholder="Enter admin password"
          @keyup.enter="validatePassword"
      />
      <button @click="validatePassword">Submit</button>
    </div>
    <div v-show="isAuthenticated" class="admin-panel">
      <h1>Analytics</h1>
      <div class="section">
        <h2>System Status: {{ systemStatus }}</h2>
        <li v-for="(service, name) in servicesStatus" :key="name">
          <p><strong>{{ name }}</strong>: {{ service.status }} (Last updated:
            {{ new Date(service.timestamp).toLocaleTimeString() }})</p>
        </li>
        <h3>Logs:</h3>
        <div style="overflow:scroll; height:200px;" class="sub-section">
          <li v-for="log in systemLogs" class="log">
            <p>{{ log }}</p>
          </li>
        </div>
      </div>
      <div class="section">
        <h2>Patients</h2>
        <p><strong>Patients count:</strong> {{ allPatients.length }}</p>
        <div style="overflow:scroll; height:400px;">
          <li v-for="patient in allPatients" :key="patient._id" class="list-item">
          <p><strong>Name:</strong> {{ patient.firstName }} {{ patient.secondName }}
            <strong>E-mail:</strong> {{ patient.email }} <strong>ID:</strong> {{ patient._id }}
            <strong>Appointments Count:</strong> {{ patient.appointments.length }}</p>
          </li>
        </div>
      </div>
      <div class="section">
        <h2>Appointments</h2>
        <canvas class="chart" ref="AppointmentsChart"></canvas>
        <p><strong>Appointments count:</strong> {{ systemAppointments.length }}</p>
        <h3>Active Appointments</h3>
        <div style="overflow:scroll; height:400px;" class="sub-section">
          <li v-for="appointment in systemAppointments" :key="appointment._id" class="list-item">
          <p><strong>Patient:</strong> {{ appointment.patientId }}
            <strong>Dentist:</strong> {{ appointment.dentistId }} <strong>Timeslot:</strong> {{ appointment.timeslotId }}
            <strong>ID:</strong> {{ appointment._id }}</p>
          </li>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import mqtt from 'mqtt';
import Chart from 'chart.js/auto';

export default {
  name: 'admin-panel',
  data() {
    return {
      systemStatus: '',
      passwordInput: '',
      systemLogs: [],
      allPatients: [],
      loggedInPatients: [],
      systemAppointments: [],
      cancelledSystemAppointments: [],
      mqttClient: null,
      servicesStatus: {},
      ctx: null,
      chartInstance: null,
      doughnutChartOptions: {
        responsive: false,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      },
      isAuthenticated: false,
      correctPassword: 'admin123',
    };
  },
  watch: {
    systemAppointments() {
      this.updateAppointmentChart();
    },
    cancelledSystemAppointments() {
      this.updateAppointmentChart();
    },
  },
  methods: {
    // Validate the password entered by the user
    validatePassword() {
      if (this.passwordInput === this.correctPassword) {
        this.isAuthenticated = true;
      }
    },
    // Connect to the MQTT broker and subscribe to the topics
    setupMqttClient() {
      this.mqttClient = mqtt.connect('ws://localhost:8080');
      this.mqttClient.on('connect', () => {
        this.mqttClient.subscribe('dentists/get/all/response');
        this.mqttClient.subscribe('dentists/create/response');
        this.mqttClient.subscribe('patients/get/login/response');
        this.mqttClient.subscribe('patients/create/response');
        this.mqttClient.subscribe('patients/get/all/response');
        this.mqttClient.subscribe('appointments/system/get/all/response');
        this.mqttClient.subscribe('appointments/create/response');
        this.mqttClient.subscribe('appointments/delete/response');
        this.mqttClient.subscribe('timeslots/get/available/response');
        this.mqttClient.subscribe('timeslots/create/response');
        this.mqttClient.subscribe('timeslots/delete/response');
        this.mqttClient.subscribe('services/heartbeat')
      });

      this.mqttClient.on('message', (topic, message) => {
        try {
          const response = JSON.parse(message.toString())
          switch (topic) {
            case 'patients/get/all/response':
              if (response.status === 'success') {
                this.allPatients = response.patients
              }
              break;
            case 'appointments/system/get/all/response':
              if (response.status === 'success') {
                this.systemAppointments = response.appointments;
                this.$nextTick(() => {
                    if (!this.chartInstance) {
                        this.initAppointmentChart();
                    }
                });
              }
              break;
            case 'dentists/create/response':
              this.systemLogs.push(`${new Date().toLocaleTimeString()} /${topic} [response] status: ${response.status} message: ${response.message}`);
              break;
            case 'dentists/get/all/response':
              this.systemLogs.push(`${new Date().toLocaleTimeString()} /${topic} [response] status: ${response.status} message: ${response.message}`);
              break;
            case 'patients/create/response':
              if (response.status === 'success') {
                this.getPatients();
                this.systemLogs.push(`${new Date().toLocaleTimeString()} /${topic} [response] status: ${response.status} message: ${response.message}`);
              }
              break;
            case 'patients/get/login/response':
              if (response.status === 'success') {
                this.loggedInPatients.push(response.patient)
                this.systemLogs.push(`${new Date().toLocaleTimeString()} Patient ${response.patient.firstName} ${response.patient.secondName} logged in`);
              }
              break;
            case 'appointments/create/response':
              if (response.status === 'success') {
                this.getPatients();
                this.getAppointments();
                this.systemLogs.push(`${new Date().toLocaleTimeString()} /${topic} [response] status: ${response.status} message: ${response.message}`);
              }
              break;
            case 'appointments/delete/response':
              if (response.status === 'success') {
                this.getPatients();
                this.saveCanceledAppointments(response.appointment);
                this.getAppointments();
                this.systemLogs.push(`${new Date().toLocaleTimeString()} /${topic} [response] status: ${response.status} message: ${response.message}`);
              }
              break;
            case 'timeslots/get/available/response':
              this.systemLogs.push(`${new Date().toLocaleTimeString()} /${topic} [response] status: ${response.status} message: ${response.message}`);
              break;
            case 'timeslots/create/response':
              this.systemLogs.push(`${new Date().toLocaleTimeString()} /${topic} [response] status: ${response.status} message: ${response.message}`);
              break;
            case 'timeslots/delete/response':
              this.systemLogs.push(`${new Date().toLocaleTimeString()} /${topic} [response] status: ${response.status} message: ${response.message}`);
              break;
            case 'services/heartbeat':
              this.updateServiceStatus(response);
              break;
            default:
          }
        } catch (error) {
          this.systemLogs.push('Error handling MQTT message:', error);
        }
      });
    },
    // Initialize Appointment chart
    initAppointmentChart() {
      const canvas = this.$refs.AppointmentsChart;
      if (canvas) {
        canvas.width = 400;
        canvas.height = 400;

        this.ctx = canvas.getContext('2d');
        this.chartInstance = new Chart(this.ctx, {
          type: 'doughnut',
          data: {
            labels: ['Cancelled Appointments', 'Active Appointments'],
            datasets: [
              {
                label: 'Appointments',
                data: [this.cancelledSystemAppointments.length, this.systemAppointments.length],
                backgroundColor: ['#e81e4b', '#1888AE'],
                hoverOffset: 8,
              },
            ],
          },
          options: this.doughnutChartOptions,
        });
      } else {
        console.error('Canvas element not found.');
      }
    },
    // Update Appointment chart data dynamically
    updateAppointmentChart() {
      if (this.chartInstance) {
        this.chartInstance.destroy();

        const canvas = this.$refs.AppointmentsChart;
        if (canvas) {
            this.ctx = canvas.getContext('2d');
            this.chartInstance = new Chart(this.ctx, {
            type: 'doughnut',
            data: {
                labels: ['Cancelled Appointments', 'Active Appointments'],
                datasets: [
                {
                    label: 'Appointments',
                    data: [this.cancelledSystemAppointments.length, this.systemAppointments.length],
                    backgroundColor: ['#e81e4b', '#1888AE'],
                    hoverOffset: 8,
                },
                ],
            },
            options: this.doughnutChartOptions,
            });
        } else {
            console.error('Canvas element not found.');
        }
      } else {
        console.error('Chart instance is not initialized.');
      }
    },
    // Update the status of the services
    updateServiceStatus(heartbeat) {
      if (heartbeat) {
        const {serviceName, status, timestamp} = heartbeat;
        if (!this.servicesStatus[serviceName]) {
          this.servicesStatus[serviceName] = {status, timestamp};
        } else {
          this.servicesStatus[serviceName].status = status;
          this.servicesStatus[serviceName].timestamp = timestamp;
        }
        const serviceCount = Object.keys(this.servicesStatus).length;
        if (serviceCount < 5) {
          this.systemStatus = '🤔 some service is missing'
        } else {
          this.systemStatus = '👍 all services are available'
        }
      } else {
        this.systemStatus = '💀 no services are available'
      }
    },
    // Update Appointments statistics
    saveCanceledAppointments(appointment) {
        this.cancelledSystemAppointments.push(appointment)
    },
    // Publish a message to the MQTT broker to get all timeslots
    getPatients() {
      const payload = {}
      this.mqttClient.publish('patients/get/all', JSON.stringify(payload))
    },
    // Publish a message to the MQTT broker to get all appointments
    getAppointments() {
      const payload = {}
      this.mqttClient.publish('appointments/system/get/all', JSON.stringify(payload))
    },
  },
  mounted() {
    this.setupMqttClient();
    this.getPatients();
    this.getAppointments();

    setInterval(() => {
      const now = Date.now();
      for (const service in this.servicesStatus) {
        if (now - this.servicesStatus[service].timestamp > 5000) {
          this.servicesStatus[service].status = 'disconnected';
        }
      }
    }, 5000);
  },
  beforeDestroy() {
    if (this.mqttClient) {
      this.mqttClient.unsubscribe('dentists/get/all/response');
      this.mqttClient.unsubscribe('dentists/create/response');
      this.mqttClient.unsubscribe('patients/get/login/response');
      this.mqttClient.unsubscribe('patients/create/response');
      this.mqttClient.unsubscribe('patients/get/all/response');
      this.mqttClient.unsubscribe('appointments/system/get/all/response');
      this.mqttClient.unsubscribe('appointments/create/response');
      this.mqttClient.unsubscribe('appointments/delete/response');
      this.mqttClient.unsubscribe('timeslots/get/available/response');
      this.mqttClient.unsubscribe('timeslots/create/response');
      this.mqttClient.unsubscribe('timeslots/delete/response');
      this.mqttClient.unsubscribe('services/heartbeat')
      this.mqttClient.end();
    }
  }
}
</script>

<style scoped>
.adminPage {
    background-color: #e3e3e3;
}
.password-protection {
    background-color: white;
}
.section {
    background-color: white;
    border-radius: 10px;
    margin: 1rem;
    padding: 1.5rem;
}
.sub-section {
    border-radius: 10px;
    background-color: #f5f5f5;
}
.sub-section .list-item {
    background-color: white;
}
.admin-panel {
  display: flex;
  flex-direction: column;
  justify-content: left;
}
.chart {
  display: block;
  margin: 0 auto;
  width: 100%;
  height: 100%;
}
.list-item {
    background-color: #f5f5f5;
    border-radius: 20px;
    padding: 0.5rem;
    margin: 0.5rem;
}
.log {
    margin: 0.2rem;
    margin-left: 0.5rem;
}
</style>
