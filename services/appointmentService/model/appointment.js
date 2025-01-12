const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  dentistId: { type: String, required: true },
  patientId: { type: String, required: true },
  timeslotId: { type: String, required: true },
  patientName: { type: String, required: true },
  patientEmail: { type: String, required: true },
  time: { type: String, required: true },
});

const Appointment = mongoose.model('Appointment', appointmentSchema)

module.exports = Appointment;
