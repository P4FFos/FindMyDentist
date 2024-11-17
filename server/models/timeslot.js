const mongoose = require('mongoose');

const timeslotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  time: { type: String, required: true },
  isBooked: { type: Boolean, default: false }
});

module.exports = mongoose.model('Timeslot', timeslotSchema);
