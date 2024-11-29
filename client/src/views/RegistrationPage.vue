<template>
  <div class="register">
    <h1>Register</h1>
    <div>
      <button @click="selectUserType('patient')">Patient</button>
      <button @click="selectUserType('dentist')">Dentist</button>
    </div>
    <form @submit.prevent="register">
      <label for="firstName">First Name:</label>
      <input type="text" v-model="firstName" required />

      <label for="secondName">Second Name:</label>
      <input type="text" v-model="secondName" required />

      <label for="email">Email:</label>
      <input type="email" v-model="email" required />

      <label for="password">Password:</label>
      <input type="password" v-model="password" required />

      <label v-if="userType === 'patient'" for="phone">Phone:</label>
      <input v-if="userType === 'patient'" type="text" v-model="phone" required />

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
      message: ''
    };
  },
  methods: {
    selectUserType(type) {
      this.userType = type;
    },
    async register() {
      const client = mqtt.connect('ws://test.mosquitto.org:8080/mqtt');

      client.on('connect', () => {
        const payload = {
          firstName: this.firstName,
          secondName: this.secondName,
          email: this.email,
          password: this.password
        };
        if (this.userType === 'patient') {
          payload.phone = this.phone;
          client.publish('patients/register', JSON.stringify(payload));
        } else {
          client.publish('dentists/register', JSON.stringify(payload));
        }
      });

      client.on('message', (topic, message) => {
        if (topic === 'patients/register/response') {
          const response = JSON.parse(message.toString());
          if (response.status === 'success') {
            this.message = 'Registration successful!';
            this.$router.push('/login');
          } else {
            this.message = `Error: ${response.message}`;
          }
          client.end();
        } else if (topic === 'dentists/register/response') {
          const response = JSON.parse(message.toString());
          if (response.status === 'success') {
            this.message = 'Registration successful!';
            this.$router.push('/login');
          } else {
            this.message = `Error: ${response.message}`;
          }
          client.end();
        }
      });

      if (this.userType === 'patient') {
        client.subscribe('patients/register/response');
      } else {
        client.subscribe('dentists/register/response');
      }
    }
  }
}
</script>

<style>

</style>
