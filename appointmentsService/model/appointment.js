const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  dentistId: { type: String, required: true },
  patient: { type: String, required: true },
  timeslot: { type: String, required: true },
  isBooked: { type: Boolean, default: false }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
