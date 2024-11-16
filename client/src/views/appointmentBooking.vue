<template>
  <div class="booking-form">
    <h2>Book an Appointment</h2>
    <form @submit.prevent="bookAppointment">
      <label for="patientId">Patient:</label>
      <input type="text" v-model="patient" required />

      <label for="timeslotId">Timeslot ID:</label>
      <input type="text" v-model="timeslotId" required />

      <button type="submit">Book Appointment</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
  import { Api } from '../Api.js'

  export default {
      name: 'appointmentBooking',
      data() {
        return {
          patient: '',
          timeslotId: '',
          message: ''
        };
      },
      methods: {
          async bookAppointment() {
              try {
                  const response = await Api.post('/appointments/booking', {
                    patient: this.patient,
                    timeslotId: this.timeslotId,
                  })
                  this.message = 'Appointment booked successfully!';
              } catch (error) {
                  this.message = `Error: ${error}`;
              }
          }
      }
  }
</script>

<style>
</style>
