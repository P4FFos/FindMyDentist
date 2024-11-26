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
import { Api } from '../Api.js'

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      role: 'patient',
      message: ''
    };
  },
  methods: {
    async login() {
      try {
        const response = await Api.get('/v1/patients')
        const patients = response.data
        const patient = patients.find(patient => patient.email === this.email && patient.password === this.password)

        const responseDentist = await Api.get('/v1/dentists')
        const dentists = responseDentist.data
        const dentist = dentists.find(dentist => dentist.email === this.email && dentist.password === this.password)

        if (patient) {
          localStorage.setItem('patientId', patient._id)
          this.$router.push('/patient_main')
        } else {
          this.message = 'Invalid credentials'
        }

        if (dentist) {
          localStorage.setItem('dentistId', dentist._id)
          this.$router.push(`/dentist/${dentist._id}/managing`)
        } else {
          this.message = 'Invalid credentials'
        }
      } catch (error) {
        this.message = 'Unable to login. Please try again'
      }
    }
  }
}
</script>

<style>

</style>
