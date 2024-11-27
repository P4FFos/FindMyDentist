<template>
  <div>
    <h1>Book an Appointment with Dr. {{ doctorName }}</h1>
    <h2>Available timeslots:</h2>
    <ul>
      <li v-for="timeslot in timeslots" :key="timeslot.id">
        <p> Timeslot: {{ timeslot.time }}</p>
        <button @click="selectTimeslot(timeslot)">Select</button>
      </li>
    </ul>
    <button @click="bookAppointment" :disabled="!selectedTimeslot">Book Appointment</button>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import { Api } from '../../Api.js'

export default {
  name: 'appointmentBooking',
  props: {
    dentistId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      doctorName: '',
      patient: '',
      email: '',
      selectedTimeslot: null,
      appointments: [],
      timeslots: [],
      message: ''
    };
  },
  methods: {
    async getTimeslots() {
      try {
        const response = await Api.get(`/v1/dentists/${this.dentistId}/timeslots/available`);
        this.timeslots = response.data.timeslots;
      } catch (error) {
        this.message = `Error: ${error}`;
      }
    },
    async getPatientEmail() {
      this.patient = localStorage.getItem('patientId');
      try {
        const response = await Api.get(`/v1/patients/${this.patient}`);
        this.email = response.data.email;
      } catch (error) {
        this.message = `Error: ${error}`;
      }
    },
    async getDoctorName() {
      try {
        const response = await Api.get(`/v1/dentists/${this.dentistId}`);
        const dentist = response.data;
        this.doctorName = `${dentist.firstName} ${dentist.secondName}`;
      } catch (error) {
        this.message = `Error: ${error}`;
      }
    },
    selectTimeslot(timeslot) {
      this.selectedTimeslot = timeslot;
    },
    async bookAppointment() {
      try {
        this.patient = localStorage.getItem('patientId');
        await this.getPatientEmail();
        const response = await Api.post(`/v1/dentists/${this.dentistId}/appointments/booking`, {
          patient: this.patient,
          timeslotId: this.selectedTimeslot._id,
          email: this.email
        });
        this.message = response.data.message;
      } catch (error) {
        this.message = `Error: ${error.response.data.message}`;
      }
    }
  },
  mounted() {
    this.getTimeslots();
    this.getDoctorName();
  }
}
</script>

<style>

</style>
