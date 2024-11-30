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
            message: '',
            client: null
          };
        },
        methods: {
            async getTimeslots() {
              this.client = mqtt.connect('ws://test.mosquitto.org:8080/mqtt');
              this.client.on('connect', () => {
                  this.client.subscribe('timeslots/get/all/response', (err) => {
                      if (err) {
                          console.error('Subscription error:', err);
                      }
                  });

                  const payload = {
                    dentistId: this.dentistId
                  };

                  this.client.publish('timeslots/get/all', JSON.stringify(payload), (err) => {
                      if (err) {
                          console.error('Publish error:', err);
                      }
                  });
              })
              this.client.on('message', (topic, message) => {
                try {
                  if (topic === 'timeslots/get/all/response') {
                      const response = JSON.parse(message.toString())
                      if (response.status === 'success') {
                          this.timeslots = response.timeslots
                          this.message =  'timeslot were fetched succesfuly'
                      }
                  }
                } catch (error) {
                    this.message = `Error: ${error}`
                }
              })
            },
            async createTimeslot() {
                this.client = mqtt.connect('ws://test.mosquitto.org:8080/mqtt');
                this.client.on('connect', () => {
                    this.client.subscribe('timeslots/create/response', (err) => {
                        if (err) {
                            console.error('Subscription error:', err);
                        }
                    });

                    const payload = {
                      dentistId: this.dentistId,
                      date: this.timeslotDate,
                      time: this.timeslotTime,
                      isBooked: false
                    };

                    this.client.publish('timeslots/create', JSON.stringify(payload), (err) => {
                        if (err) {
                            console.error('Publish error:', err);
                        }
                    });
                })
                this.client.on('message', (topic, message) => {
                    try {
                        if (topic === 'timeslots/create/response') {
                            const response = JSON.parse(message.toString())
                            if (response.status === 'success') {
                                this.getTimeslots()
                                this.message = 'timeslot was created!';
                            }
                        }
                    } catch (error) {
                        this.message = `Error creating timeslot: ${error}`
                    }
                })
            },
            async deleteTimeslot(timeslot) {
                this.client = mqtt.connect('ws://test.mosquitto.org:8080/mqtt');
                this.client.on('connect', () => {
                    this.client.subscribe('timeslots/delete/response', (err) => {
                        if (err) {
                            console.error('Subscription error:', err);
                        }
                    });

                    const payload = {
                      timeslotId: timeslot._id
                    };

                    this.client.publish('timeslots/delete', JSON.stringify(payload), (err) => {
                        if (err) {
                            console.error('Publish error:', err);
                        }
                    });
                })
                this.client.on('message', (topic, message) => {
                    try {
                        if (topic === 'timeslots/delete/response') {
                            const response = JSON.parse(message.toString())
                            if (response.status === 'success') {
                                this.getTimeslots()
                                this.message =  'timeslot was deleted succesfuly'
                            }
                        }
                    } catch (error) {
                        this.message = `Error deleting timeslot: ${error}`
                    }
                })
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
