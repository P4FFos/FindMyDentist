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
// import { Api } from '../Api.js'
import axios from 'axios'

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
      try {
        const endpoint = this.userType === 'patient' ? 'http://localhost:3004/api/v1/patients' : 'http://localhost:3003/api/v1/dentists';
        const payload = {
          firstName: this.firstName,
          secondName: this.secondName,
          email: this.email,
          password: this.password
        };
        if (this.userType === 'patient') {
          payload.phone = this.phone;
        }
        await axios.post(endpoint, payload);
        this.message = 'Registration successful!';
        this.$router.push('/login');
      } catch (error) {
        this.message = `Error: ${error.response.data.message || error.message}`;
      }
    }
  }
}
</script>

<style>

</style>
