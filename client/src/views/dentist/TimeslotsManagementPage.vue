<template>
    <h1>Manage your timeslots!</h1>
    <h2>created timeslots:</h2>
    <li v-for="timeslot in timeslots">
          <div>
              <p> - Timeslot: {{ timeslot.date }} {{ timeslot.time }}</p>
              <button  @click="deleteTimeslot(timeslot)">Delete</button>
          </div>
      </li>
    <h2>Add timeslot:</h2>
    <form @submit.prevent="createTimeslot">
      <label for="timeslotDate">Date:</label>
      <input type="date" v-model="timeslotDate" required />

      <label for="timeslotTime">Time:</label>
      <input type="time" v-model="timeslotTime" required />

      <button type="submit">Create</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </template>

  <script>
    import mqtt from 'mqtt';

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
            dentistId: '',
            timeslotId: '',
            timeslots: [],
            timeslotDate: null,
            timeslotTime: '',
            message: ''
          };
        },
        methods: {
          async getTimeslots() {
              const client = mqtt.connect('ws://test.mosquitto.org:8080/mqtt');

              
              try {
                const response = await Api.get(`/v1/dentists/${this.dentistId}/timeslots`)
                this.timeslots = response.data.timeslots
                this.message =  'timeslot were fetched succesfuly'
              } catch (error) {
                  this.message = `Error: ${error}`
              }
            },
            async createTimeslot() {
                try {
                    const payload = {
                      dentistId: this.dentistId,
                      date: this.timeslotDate,
                      time: this.timeslotTime,
                      isBooked: false
                    };
                    await Api.post(`/v1/dentists/${this.dentistId}/timeslots`, payload);
                    this.getTimeslots()
                    this.message = 'timeslot was created!';
                } catch (error) {
                    this.message = `Error creating timeslot: ${error}`
                }
            },
            async deleteTimeslot(timeslot) {
                try {
                    await Api.delete(`/v1/dentists/${this.dentistId}/timeslots/${timeslot._id}`)
                    this.getTimeslots()
                    this.message =  'timeslot was deleted succesfuly'
                } catch (error) {
                    this.message = `Error deleting timeslot: ${error}`
                }
            }
        },
        mounted() {
          this.dentistId = localStorage.getItem("dentistId")
          this.getTimeslots()
        }
    }
  </script>

  <style>
  </style>
