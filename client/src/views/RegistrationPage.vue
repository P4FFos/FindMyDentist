<template>
  <div class="register">
    <h1>Register</h1>
    <div>
      <button @click="selectUserType('patient')">Patient</button>
      <button @click="selectUserType('dentist')">Dentist</button>
    </div>
    <form @submit.prevent="register">
      <label for="firstName">First Name:</label>
      <input type="text" v-model="firstName" required/>

      <label for="secondName">Second Name:</label>
      <input type="text" v-model="secondName" required/>

      <label for="email">Email:</label>
      <input type="email" v-model="email" required/>

      <label for="password">Password:</label>
      <input type="password" v-model="password" required/>

      <label v-if="userType === 'patient'" for="phone">Phone:</label>
      <input v-if="userType === 'patient'" type="text" v-model="phone" required/>

      <label v-if="userType === 'dentist'" for="latitude">Latitude:</label>
      <input v-if="userType === 'dentist'" type="text" v-model="latitude" required/>

      <label v-if="userType === 'dentist'" for="longitude">Longitude:</label>
      <input v-if="userType === 'dentist'" type="text" v-model="longitude" required/>

      <button type="submit">Register</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import mqtt from 'mqtt';

export default {
  name: 'Register',
  data() {
    return {
      userType: 'patient',
      firstName: '',
      secondName: '',
      email: '',
      phone: '',
      password: '',
      latitude: '',
      longitude: '',
      message: '',
      mqttClient: null
    };
  },
  methods: {
    // Set the user type
    selectUserType(type) {
      this.userType = type;
    },
    // Setup the MQTT client
    setupMqttClient() {
      this.mqttClient = mqtt.connect('ws://test.mosquitto.org:8080/mqtt');
      this.mqttClient.on('connect', () => {
        console.log('MQTT connected');
        this.mqttClient.subscribe('patients/create/response');
        this.mqttClient.subscribe('dentists/create/response');
      });

      this.mqttClient.on('message', (topic, message) => {
        const response = JSON.parse(message.toString());
        if (topic === 'patients/create/response') {
          if (response.status === 'success') {
            this.message = 'Registration successful!';
            this.$router.push('/login');
          } else {
            this.message = `Error: ${response.message}`;
          }
        } else if (topic === 'dentists/create/response') {
          if (response.status === 'success') {
            this.message = 'Registration successful!';
            this.$router.push('/login');
          } else {
            this.message = `Error: ${response.message}`;
          }
        }
      });
    },
    // Connect to the MQTT broker and publish the registration data
    async register() {
      const payload = {
        firstName: this.firstName,
        secondName: this.secondName,
        email: this.email,
        password: this.password
      };
      if (this.userType === 'patient') {
        payload.phone = this.phone;
        this.mqttClient.publish('patients/create', JSON.stringify(payload));
      } else if (this.userType === 'dentist') {
        payload.location = {
          latitude: this.latitude,
          longitude: this.longitude
        };
        this.mqttClient.publish('dentists/create', JSON.stringify(payload));
      }
    }
  }, mounted() {
    this.setupMqttClient();
  }
}
</script>

<style>

</style>