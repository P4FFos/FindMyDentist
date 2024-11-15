const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  timeslot: { type: Schema.Types.ObjectId, ref: 'Timeslot', required: true },
  isBooked: { type: Boolean, default: false }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
