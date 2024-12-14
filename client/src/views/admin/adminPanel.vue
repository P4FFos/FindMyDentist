<template>
    <div>
        <h1>Admin Panel</h1>
        <h2>System Status: {{ systemStatus }}</h2>
        <ul>
          <li v-for="(service, name) in servicesStatus" :key="name">
            <p><strong>{{ name }}</strong>: {{ service.status }} (Last updated: {{ new Date(service.timestamp).toLocaleTimeString() }})</p>
          </li>
        </ul>
        <p>Total Patients count: {{ allPatients.length }}</p>
        <!-- <p>Logged in Patients count: {{ loggedinPatients.length }}</p> -->
        <h2>All existing Patients:</h2>
        <ul>
         <li v-for="patient in allPatients" :key="patient._id">
           <h3>Patient:</h3>
           <p><strong>Name:</strong>  {{ patient.firstName }} {{ patient.secondName }}
            <strong>E-mail:</strong> {{ patient.email }} <strong>ID:</strong> {{ patient._id }}
            <strong>Appointments Count:</strong> {{ patient.appointments.length }}</p>
         </li>
        </ul>
        <!-- <h2>Patients currently logged in:</h2>
        <ul>
         <li v-for="patient in loggedinPatients" :key="patient._id">
           <p>  <strong>Patient:</strong> Name: {{ patient.firstName }} {{ patient.secondName }} id: {{ patient._id }}</p>
         </li>
        </ul> -->
        <h2>All System Appointments:</h2>
        <ul>
         <li v-for="appointment in systemAppointments" :key="appointment._id">
           <h3>Appointment:</h3>
           <p><strong>Patient:</strong> {{ appointment.patientId }}
            <strong>Dentist:</strong> {{ appointment.dentistId }} <strong>Timeslot:</strong> {{ appointment.timeslotId }}
            <strong>ID:</strong> {{ appointment._id }}</p>
         </li>
        </ul>
    </div>
</template>

<script>
import mqtt from 'mqtt';

export default {
  name: 'adminpanel',
  data() {
    return {
        systemStatus: '',
        allPatients: [],
        loggedinPatients: [],
        systemAppointments: [],
        mqttClient: null,
        servicesStatus: {},
    };
  },
  methods: {
    // Set up the MQTT client
    setupMqttClient() {
      this.mqttClient = mqtt.connect('ws://localhost:8080');
      this.mqttClient.on('connect', () => {
        this.mqttClient.subscribe('patients/get/login/response');
        this.mqttClient.subscribe('patients/create/response');
        this.mqttClient.subscribe('patients/get/all/response');
        this.mqttClient.subscribe('appointments/system/get/all/response')
        this.mqttClient.subscribe('appointments/create/response')
        this.mqttClient.subscribe('appointments/delete/response')
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
              case 'patients/create/response':
                  if (response.status === 'success') {
                    this.getPatients();
                  }
                  break;
              case 'patients/get/login/response':
                  if (response.status === 'success') {
                    this.loggedinPatients.push(response.patient)
                  }
                  break;
              case 'appointments/system/get/all/response':
                  if (response.status === 'success') {
                    this.systemAppointments = response.appointments
                  }
                  break;
              case 'appointments/create/response':
                  if (response.status === 'success') {
                    this.getPatients();
                    this.getAppointments();
                  }
                  break;
              case 'appointments/delete/response':
                  if (response.status === 'success') {
                    this.getPatients();
                    this.getAppointments();
                  }
                  break;
              case 'services/heartbeat':
                  this.updateServiceStatus(response);
                  break;
              default:
                  console.log('Unhandled topic:', topic)
            }
        } catch (error) {
            console.error('Error handling MQTT message:', error)
        }
      });
    },
    updateServiceStatus(heartbeat) {
        if(heartbeat){
          const { serviceName, status, timestamp } = heartbeat;
          if (!this.servicesStatus[serviceName]) {
              this.servicesStatus[serviceName] = { status, timestamp };
          } else {
              this.servicesStatus[serviceName].status = status;
              this.servicesStatus[serviceName].timestamp = timestamp;
          }
          const serviceCount = Object.keys(this.servicesStatus).length;
          if(serviceCount < 5){
              this.systemStatus = '🤔 some service is missing'
          } else {
              this.systemStatus = '👍 all services are available'
          }
        } else {
            this.systemStatus = '💀 no services are available'
        }
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
      this.mqttClient.unsubscribe('patients/get/all');
      this.mqttClient.unsubscribe('patients/create/response');
      this.mqttClient.unsubscribe('appointments/system/get/all/response');
      this.mqttClient.unsubscribe('appointments/create/response');
      this.mqttClient.unsubscribe('appointments/delete/response');
      this.mqttClient.unsubscribe('services/heartbeat');
      this.mqttClient.end();
    }
  }
}
</script>

<style>

</style>
