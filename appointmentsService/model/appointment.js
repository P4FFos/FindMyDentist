const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  dentistId: { type: String, required: true },
  patientId: { type: String, required: true },
  timeslotId: { type: String, required: true }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
