<template>
  <h1>Manage your timeslots!</h1>
  <h2>created timeslots:</h2>
    <li v-for="timeslot in enrichedTimeslots" :key="timeslot._id">
      <div>
        <p>
          - Timeslot: {{ timeslot.date }} {{ timeslot.time }}
          <span v-if="timeslot.appointment">
            (Booked by {{ timeslot.appointment.patientName }})
          </span>
          <span v-else>(Not Booked)</span>
        </p>
        <button v-if="timeslot.appointment" @click="cancelAppointment(timeslot.appointment._id, timeslot._id)">
          Cancel Appointment
        </button>
        <button @click="deleteTimeslot(timeslot)" :disabled="timeslot.appointment">
          Delete
        </button>
      </div>
    </li>
  <h2>Add timeslot:</h2>
  <form @submit.prevent="createTimeslot">
    <label for="timeslotDate">Date:</label>
    <input type="date" v-model="timeslotDate" required/>

    <label for="timeslotTime">Time:</label>
    <input type="time" v-model="timeslotTime" required/>

    <button type="submit">Create</button>
  </form>
  <p v-if="message">{{ message }}</p>
</template>

<script>
import mqtt from 'mqtt';

  export default {
    name: 'TimeslotManager',
    data() {
      return {
        dentistId: '',
        patientName: '',
        timeslots: [],
        appointments: [],
        timeslotDate: null,
        timeslotTime: '',
        message: '',
        mqttClient: null,
      };
    },
    computed: {
      enrichedTimeslots() {
        return this.timeslots.map((timeslot) => {
          const appointment = this.appointments.find(
            (appt) => appt.timeslotId === timeslot._id
          );
          return {
            ...timeslot,
            appointment: appointment
              ? { ...appointment, patientName: appointment.patientName }
              : null,
          };
        });
      },
    },
    methods: {
      // Connect to the MQTT broker and subscribe to the topics
      setupMqttClient() {
        this.mqttClient = mqtt.connect('ws://localhost:8080');
        this.mqttClient.on('connect', () => {
          console.log('MQTT connected');
          this.mqttClient.subscribe('timeslots/get/all/response');
          this.mqttClient.subscribe('appointments/dentist/get/all/response');
          this.mqttClient.subscribe('timeslots/create/response');
          this.mqttClient.subscribe('timeslots/delete/response');
          this.mqttClient.subscribe('appointments/create/response');
          this.mqttClient.subscribe('appointments/delete/response');
        });

        this.mqttClient.on('message', (topic, message) => {
          try {
            const response = JSON.parse(message.toString());
            switch (topic) {
              case 'timeslots/get/all/response':
                if (response.status === 'success') {
                  this.timeslots = response.timeslots;
                  this.message = 'Timeslots were fetched successfully.';
                }
                break;
              case 'appointments/dentist/get/all/response':
                if (response.status === 'success') {
                  this.appointments = response.appointments;
                  this.message = 'Appointments were fetched successfully.';
                }
                break;
              case 'timeslots/create/response':
                if (response.status === 'success') {
                  this.getTimeslots();
                  this.message = 'Timeslot was created successfully.';
                }
                break;
              case 'timeslots/delete/response':
                if (response.status === 'success') {
                  this.getTimeslots();
                  this.message = 'Timeslot was deleted successfully.';
                }
                break;
              case 'appointments/create/response':
                if (response.status === 'success') {
                  this.getTimeslots();
                  this.getAppointments();
                  this.message = 'Appointment was created successfully.';
                }
                break;
              case 'appointments/delete/response':
                if (response.status === 'success') {
                  this.getTimeslots();
                  this.getAppointments();
                  this.message = 'Appointment was canceled successfully.';
                }
                break;
              default:
                console.log('Unhandled topic:', topic);
            }
          } catch (error) {
            console.error('Error handling MQTT message:', error);
          }
        });
      },
      // Publish a message to the MQTT broker to get all timeslots
      getTimeslots() {
        const payload = { dentistId: this.dentistId };
        this.mqttClient.publish('timeslots/get/all', JSON.stringify(payload));
      },
      // Publish a message to the MQTT broker to get all dentist appointments
      getAppointments() {
        const payload = { dentistId: this.dentistId };
        this.mqttClient.publish('appointments/dentist/get/all', JSON.stringify(payload));
      },
      // Publish a message to the MQTT broker to create a new timeslot
      createTimeslot() {
        const payload = {
          dentistId: this.dentistId,
          date: this.timeslotDate,
          time: this.timeslotTime,
          isBooked: false,
        };
        this.mqttClient.publish('timeslots/create', JSON.stringify(payload));
      },
      // Publish a message to the MQTT broker to delete a timeslot
      deleteTimeslot(timeslot) {
        const payload = { timeslotId: timeslot._id };
        this.mqttClient.publish('timeslots/delete', JSON.stringify(payload));
      },
      // Publish a message to the MQTT broker to cancel patients appointment
      cancelAppointment(appointmentId, timeslotId) {
        const payload = { appointmentId, timeslotId };
        this.mqttClient.publish('appointments/delete', JSON.stringify(payload));
        this.getTimeslots();
        this.getAppointments();
      },
    },
    // Get the dentist ID from local storage and set up the MQTT client
    mounted() {
      this.dentistId = localStorage.getItem('dentistId') || '';
      this.setupMqttClient();
      this.getTimeslots();
      this.getAppointments();
    },
    beforeDestroy() {
      if (this.mqttClient) {
        this.mqttClient.unsubscribe('timeslots/get/all/response');
        this.mqttClient.unsubscribe('appointments/dentist/get/all/response');
        this.mqttClient.unsubscribe('timeslots/create/response');
        this.mqttClient.unsubscribe('timeslots/delete/response');
        this.mqttClient.unsubscribe('appointments/create/response');
        this.mqttClient.unsubscribe('appointments/delete/response');
        this.mqttClient.end();
      }
    },
  };
  </script>

<style>

</style>
