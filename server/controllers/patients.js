const Patient = require('../models/patient');
const Appointment = require('../models/appointment');
const Timeslot = require('../models/timeslot');
const mqtt = require('../mqtt-config');

mqtt.subscribe('dentists/timeslots/available');
mqtt.subscribe('patients/book');
mqtt.subscribe('patients/cancel');

mqttClient.on('message', async (topic, message) => {
    switch (topic) {
      case 'patients/book':
        await bookAppointment(JSON.parse(message));
        break;

      case 'patients/cancel':
        await cancelAppointment(JSON.parse(message));
        break;

      case 'dentists/timeslots/available':
        await getAvailableTimeslots();
        break;
    }
  });

// Get available timeslots
async function getAvailableTimeslots() {
  try {
      const availableTimeslots = ['timeslot1', 'timeslot2', 'timeslot3', 'timeslot4', 'timeslot5']; //test appointments data
      mqttClient.publish('patients/timeslots/available', JSON.stringify({ status: 'success', timeslots: availableTimeslots }));
  } catch (error) {
      mqttClient.publish('patients/timeslots/available', JSON.stringify({ status: 'error', message: 'Server error', error: error.message }));
  }
}

// Book an appointment
async function bookAppointment(data) {
  const { patient, timeslotId } = data;

  try{
    if(patient && timeslot){
      const appointment = {
          patient: patient,
          timeslot: timeslotId,
          isBooked: true
      };
      mqttClient.publish('patients/book/response', JSON.stringify({ status: 'success', message: 'Appointment booked successfully', appointment }));
    }
  } catch (error) {
      mqttClient.publish('patients/book/response', JSON.stringify({ status: 'error', message: 'Server error', error: error.message }));
  }
}

// Cancel an appointment
async function cancelAppointment(data) {
  const { appointmentId } = data;

  try {
      mqttClient.publish('patients/cancel/response', JSON.stringify({ status: 'success', message: `appointment ${appointmentId} cancelled successfully` }));
  } catch (error) {
      mqttClient.publish('patients/cancel/response', JSON.stringify({ status: 'error', message: 'Server error', error: error.message }));
  }
}
