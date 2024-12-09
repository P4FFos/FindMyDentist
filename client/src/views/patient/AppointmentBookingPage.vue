<template>
  <div>
    <h1>Book an Appointment with Dr. {{ doctorName }}</h1>
    <h2>Available timeslots:</h2>
    <ul>
      <li v-for="timeslot in availableTimeslots" :key="timeslot.id">
        <p> Timeslot: {{ timeslot.date }} {{ timeslot.time }} {{ timeslot.isBooked }}</p>
        <button @click="selectTimeslot(timeslot)">Select</button>
      </li>
    </ul>
    <h2>Unavailable timeslots:</h2>
    <ul>
      <li v-for="timeslot in unavailableTimeslots" :key="timeslot.id">
        <p> Timeslot: {{ timeslot.time }}</p>
        <button @click="notifyWhenAvailable(timeslot)">Notify me when available</button>
      </li>
    </ul>
    <button @click="bookAppointment" :disabled="!selectedTimeslot">Book Appointment</button>

    <h2>My Appointments:</h2>
    <ul>
      <li v-for="appointment in appointments" :key="appointment._id">
        <p>Appointment with Dr. {{ doctorName }} at {{ appointment.time }}</p>
        <button @click="cancelAppointment(appointment._id)">Cancel</button>
      </li>
    </ul>

    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import mqtt from 'mqtt';

export default {
  name: 'appointmentBooking',
  props: {
    dentistId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      doctorName: '',
      patientId: localStorage.getItem('patientId') || '',
      email: '',
      selectedTimeslot: null,
      availableTimeslots: [],
      unavailableTimeslots: [],
      appointments: [],
      message: '',
      mqttClient: null,
    };
  },
  methods: {
    // Connect to the MQTT broker and subscribe to the topics
    setupMqttClient() {
      this.mqttClient = mqtt.connect('ws://localhost:8080')
      this.mqttClient.on('connect', () => {
        console.log('MQTT connected')
        this.mqttClient.subscribe('timeslots/get/available/response')
        this.mqttClient.subscribe('timeslots/get/unavailable/response')
        this.mqttClient.subscribe('patients/get/response');
        this.mqttClient.subscribe('dentists/get/response');
        this.mqttClient.subscribe('appointments/get/all/response')
        this.mqttClient.subscribe('appointments/create/response')
        this.mqttClient.subscribe('appointments/delete/response')
      });

      this.mqttClient.on('message', (topic, message) => {
        try {
          const response = JSON.parse(message.toString())
          switch (topic) {
            case 'timeslots/get/available/response':
              if (response.status === 'success') {
                this.availableTimeslots = response.timeslots
                this.message = 'Available timeslots were fetched successfully'
              }
              break;
            case 'timeslots/get/unavailable/response':
              if (response.status === 'success') {
                this.unavailableTimeslots = response.timeslots
                this.message = 'Unavailable timeslots were fetched successfully'
              }
              break;
            case 'patients/get/response':
              if (response.status === 'success') {
                this.email = response.email
              }
              break;
            case 'dentists/get/response':
              if (response.status === 'success') {
                this.doctorName = `${response.dentist.firstName} ${response.dentist.secondName}`
              }
              break;
            case 'appointments/get/all/response':
              if (response.status === 'success') {
                this.appointments = response.appointments
              }
              break;
            case 'appointments/create/response':
              if (response.status === 'success') {
                console.log('appointment was created')
                this.message = 'Appointment was created successfully'
                this.getTimeslots();
                this.getAppointments();
              }
              break;
            case 'appointments/delete/response':
              if (response.status === 'success') {
                this.getAppointments()
                this.message = 'Appointment was deleted successfully'
              }
              break;
            default:
              console.log('Unhandled topic:', topic)
          }
        } catch (error) {
          console.error('Error handling MQTT message:', error)
        }
      });
    },
    // Publish a message to the MQTT broker to get all timeslots
    getTimeslots() {
      const availablePayload = {
        dentistId: this.dentistId,
        isBooked: false,
      };
      this.mqttClient.publish('timeslots/get/available', JSON.stringify(availablePayload))

      const unavailablePayload = {
        dentistId: this.dentistId,
        isBooked: true,
      }
      this.mqttClient.publish('timeslots/get/unavailable', JSON.stringify(unavailablePayload))
    },
    // Publish a message to the MQTT broker to get the patient email
    getPatientEmail() {
      const payload = {patientId: this.patientId}
      this.mqttClient.publish('patients/get', JSON.stringify(payload))
    },
    // Publish a message to the MQTT broker to get the doctor name
    getDoctorName() {
      const payload = {dentistId: this.dentistId}
      this.mqttClient.publish('dentists/get', JSON.stringify(payload))
    },
    // Publish a message to the MQTT broker to get all appointments
    getAppointments() {
      const payload = {patientId: this.patientId}
      this.mqttClient.publish('appointments/get/all', JSON.stringify(payload))
    },
    // Select a timeslot for booking
    selectTimeslot(timeslot) {
      this.selectedTimeslot = timeslot
    },
    // Publish a message to the MQTT broker to book an appointment
    bookAppointment() {
      const payload = {

        time: this.selectedTimeslot.time,
        dentistId: this.dentistId,
        patientId: this.patientId,
        timeslotId: this.selectedTimeslot._id,
        email: this.email,
      }
      this.mqttClient.publish('appointments/create', JSON.stringify(payload))
      console.log('booking request was sent')
    },
    // Publish a message to the MQTT broker to cancel an appointment
    cancelAppointment(appointmentId) {
      const payload = {appointmentId: appointmentId, email: this.email}
      this.mqttClient.publish('appointments/delete', JSON.stringify(payload))
    },
    // Notify the patient when a timeslot becomes available
    notifyWhenAvailable(timeslot) {
      this.message = `You will be notified when timeslot ${timeslot.time} becomes available`
    },
  },
  // Fetch the doctor name, patient email, timeslots, and appointments
  mounted() {
    this.setupMqttClient()
    this.getDoctorName()
    this.getTimeslots()
    this.getPatientEmail()
    this.getAppointments()
  },
  beforeDestroy() {
    if (this.mqttClient) {
      this.mqttClient.unsubscribe('timeslots/get/available/response')
      this.mqttClient.unsubscribe('timeslots/get/unavailable/response')
      this.mqttClient.unsubscribe('patients/get/response');
      this.mqttClient.unsubscribe('dentists/get/response');
      this.mqttClient.unsubscribe('appointments/get/all/response')
      this.mqttClient.unsubscribe('appointments/create/response')
      this.mqttClient.unsubscribe('appointments/delete/response')
      this.mqttClient.end();
    }
  }
};
</script>

<style>

</style>
