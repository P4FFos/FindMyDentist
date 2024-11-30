<template>
    <h1>Manage your timeslots!</h1>
    <h2>created timeslots:</h2>
    <li v-for="timeslot in timeslots">
          <div>
              <p> - Timeslot: {{ timeslot.date }} {{ timeslot.time }}</p>
              <button  @click="deleteTimeslot(timeslot)">Delete</button>
          </div>
      </li>
    <h2>Add timeslot:</h2>
    <form @submit.prevent="createTimeslot">
      <label for="timeslotDate">Date:</label>
      <input type="date" v-model="timeslotDate" required />

      <label for="timeslotTime">Time:</label>
      <input type="time" v-model="timeslotTime" required />

      <button type="submit">Create</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </template>

<script>
import mqtt from 'mqtt';

export default {
  name: 'timeslotManager',
  data() {
    return {
      dentistId: '',
      timeslots: [],
      timeslotDate: null,
      timeslotTime: '',
      message: '',
      mqttClient: null,
    };
  },
  methods: {
    setupMqttClient() {
      this.mqttClient = mqtt.connect('ws://test.mosquitto.org:8080/mqtt');
      this.mqttClient.on('connect', () => {
        console.log('MQTT connected');
        this.mqttClient.subscribe('timeslots/get/all/response');
        this.mqttClient.subscribe('timeslots/create/response');
        this.mqttClient.subscribe('timeslots/delete/response');
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
            default:
              console.log('Unhandled topic:', topic);
          }
        } catch (error) {
          console.error('Error handling MQTT message:', error);
        }
      });
    },
    getTimeslots() {
      const payload = {
        dentistId: this.dentistId,
      };
      this.mqttClient.publish('timeslots/get/all', JSON.stringify(payload));
    },
    createTimeslot() {
      const payload = {
        dentistId: this.dentistId,
        date: this.timeslotDate,
        time: this.timeslotTime,
        isBooked: false,
      };
      this.mqttClient.publish('timeslots/create', JSON.stringify(payload));
    },
    deleteTimeslot(timeslot) {
      const payload = {
        timeslotId: timeslot._id,
      };
      this.mqttClient.publish('timeslots/delete', JSON.stringify(payload));
    },
  },
  mounted() {
    this.dentistId = localStorage.getItem('dentistId') || '';
    this.setupMqttClient();
    this.getTimeslots();
  },
};
</script>

  <style>

  </style>
