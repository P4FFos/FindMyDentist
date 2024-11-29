<template>
  <div class="login">
    <h1>Login</h1>
    <div>
      <button @click="selectUserType('patient')">Patient</button>
      <button @click="selectUserType('dentist')">Dentist</button>
    </div>
    <form @submit.prevent="login">
      <label for="email">Email:</label>
      <input type="email" v-model="email" required />

      <label for="password">Password:</label>
      <input type="password" v-model="password" required />

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
      message: ''
    };
  },
  methods: {
    selectUserType(type) {
      this.userType = type;
    },
    async login() {
      const client = mqtt.connect('ws://test.mosquitto.org:8080/mqtt');

      client.on('connect', () => {
        const payload = {
          email: this.email,
          password: this.password
        };
        if (this.userType === 'patient') {
          client.publish('patients/login', JSON.stringify(payload));
        } else if (this.userType === 'dentist') {
          client.publish('dentists/login', JSON.stringify(payload));
        }
      });

      client.on('message', (topic, message) => {
        const response = JSON.parse(message.toString());
        if (topic === 'patients/login/response') {
          if (response.status === 'success') {
            localStorage.setItem('patientId', response.patient._id);
            this.$router.push('/patient_main');
          } else {
            this.message = `Error: ${response.message}`;
          }
        } else if (topic === 'dentists/login/response') {
          if (response.status === 'success') {
            localStorage.setItem('dentistId', response.dentist._id);
            console.log(response.dentist._id);
            this.$router.push(`/dentist/${response.dentist._id}/managing`);
          } else {
            this.message = `Error: ${response.message}`;
          }
        }
        client.end();
      });

      client.subscribe('patients/login/response');
      client.subscribe('dentists/login/response');
    }
  }
}
</script>

<style>

</style>
