<template>
  <h1>Book an Appointment</h1>
  <h2>available timeslots:</h2>
  <li v-for="timeslot in timeslots">
        <div>
            <p> - Timeslot id: {{ timeslot }}</p>
        </div>
    </li>
  <div class="booking-form">
    <h2>Booking:</h2>
    <form @submit.prevent="bookAppointment(timeslotId)">
      <label for="patientId">Patient:</label>
      <input type="text" v-model="patient" required />

      <label for="timeslotId">Timeslot ID:</label>
      <input type="text" v-model="timeslotId" required />

      <button type="submit">Book Appointment</button>
    </form>
  </div>
    <li v-for="appointment in appointments">
        <div class="appointment">
            <p>Appointment id: {{ appointment }}</p>
            <button @click="cancelAppointment(appointment)"> cancel appointment</button>
        </div>
    </li>

    <p v-if="message">{{ message }}</p>
</template>

<script>
import { Api } from '../Api.js'

  export default {
      name: 'appointmentBooking',
      data() {
        return {
          patient: '',
          timeslotId: '',
          appointmentId: '',
          appointments: [],
          timeslots: [],
          message: ''
        };
      },
      methods: {
          async bookAppointment(timeslot) {
            try {
                if(this.timeslots.includes(timeslot)){
                    await Api.post('/appointments/booking', {
                    patient: this.patient,
                    timeslotId: this.timeslotId,
                    })
                    this.appointmentId = `apnt_${this.patient}_${this.timeslotId}`
                    this.appointments.push(this.appointmentId)
                    this.patient = ''
                    this.timeslotId = ''
                    this.message = `Appointment booked successfully! AppointmentId: ${this.appointmentId}`
                } else {
                    this.message = `Error: timeslot is unavailable!`
                }
            } catch (error) {
                this.message = `Error: ${error}`
            }
          },
          async cancelAppointment(appointmentId) {
            try {
                  await Api.delete(`/appointments/booking/${appointmentId}`, {})
                  this.appointments = this.appointments.filter(appointment => appointment !== appointmentId)
                  this.message = `Appointment ${this.appointmentId} was cancelled!`
              } catch (error) {
                  this.message = `Error: ${error}`
            }
          },
          async getTimeslots() {
            try {
              const response = await Api.get('/timeslots/available')
              this.timeslots = response.data.timeslots
            } catch (error) {
                this.message = `Error: ${error}`
            }
          }
      },
      mounted() {
        this.getTimeslots()
      }
  }
</script>

<style>
    .appointment {
        border-width:1px;
        border-style:solid;
        border-color:black;
        margin: 10px;
    }
</style>
