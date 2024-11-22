<template>
  <div class="login">
    <h1>Login</h1>
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
import { Api } from '../../Api.js'

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      message: ''
    };
  },
  methods: {
    async login() {
      try {
        const response = await Api.post('/api/v1/patients/', {
          email: this.email,
          password: this.password
        });
        this.message = response.data.message;
      } catch (error) {
        this.message = `Error: ${error.response.data.message || error.message}`;
      }
    }
  }
}
</script>

<style>

</style>