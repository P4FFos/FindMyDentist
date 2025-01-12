const mongoose = require('mongoose');

const timeslotSchema = new mongoose.Schema({
    dentistId: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    isBooked: { type: Boolean, default: false }
}, { _id: true });

const Timeslot = mongoose.model('Timeslot', timeslotSchema);

module.exports = Timeslot;
