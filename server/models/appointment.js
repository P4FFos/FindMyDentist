const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: String, required: true },
  timeslot: { type: String, required: true },
  isBooked: { type: Boolean, default: false }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
