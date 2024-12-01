<template>
  <div class="login">
    <h1>Login</h1>
    <div>
      <button @click="selectUserType('patient')">Patient</button>
      <button @click="selectUserType('dentist')">Dentist</button>
    </div>
    <form @submit.prevent="login">
      <label for="email">Email:</label>
      <input type="email" v-model="email" required/>

      <label for="password">Password:</label>
      <input type="password" v-model="password" required/>

      <button type="submit">Login</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import mqtt from 'mqtt';

export default {
  name: 'Login',
  data() {
    return {
      userType: 'patient',
      email: '',
      password: '',
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
        this.mqttClient.subscribe('patients/get/login/response');
        this.mqttClient.subscribe('dentists/get/login/response');
      });

      this.mqttClient.on('message', (topic, message) => {
        const response = JSON.parse(message.toString());
        if (topic === 'patients/get/login/response') {
          if (response.status === 'success') {
            localStorage.setItem('patientId', response.patient._id);
            this.$router.push('/patient_main');
          } else {
            this.message = `Error: ${response.message}`;
          }
        } else if (topic === 'dentists/get/login/response') {
          if (response.status === 'success') {
            localStorage.setItem('dentistId', response.dentist._id);
            this.$router.push(`/dentist/${response.dentist._id}/managing`);
          } else {
            this.message = `Error: ${response.message}`;
          }
        }
      });
    },
    // Connect to the MQTT broker and subscribe to the topics to login
    async login() {
      const payload = {
        email: this.email,
        password: this.password
      };
      if (this.userType === 'patient') {
        this.mqttClient.publish('patients/get/login', JSON.stringify(payload));
      } else if (this.userType === 'dentist') {
        this.mqttClient.publish('dentists/get/login', JSON.stringify(payload));
      }
    }
  }, mounted() {
    this.setupMqttClient();
  }
}
</script>

<style>

</style>