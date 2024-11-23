<template>
  <div class="register">
    <h1>Register</h1>
    <form @submit.prevent="register">
      <label for="firstName">First Name:</label>
      <input type="text" v-model="firstName" required />

      <label for="secondName">Second Name:</label>
      <input type="text" v-model="secondName" required />

      <label for="email">Email:</label>
      <input type="email" v-model="email" required />

      <label for="phone">Phone:</label>
      <input type="text" v-model="phone" required />

      <label for="password">Password:</label>
      <input type="password" v-model="password" required />

      <button type="submit">Register</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import { Api } from '../../Api.js'

export default {
  name: 'Register',
  data() {
    return {
      firstName: '',
      secondName: '',
      email: '',
      phone: '',
      password: '',
      message: ''
    };
  },
  methods: {
    async register() {
      try {
        await Api.post('v1/patients', {
          firstName: this.firstName,
          secondName: this.secondName,
          email: this.email,
          phone: this.phone,
          password: this.password
        });
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