const mongoose = require('mongoose');

const NotificationRequestSchema = new mongoose.Schema({
    patientId: { type: String, required: true },
    timeslotId: { type: String, required: true },
    email: { type: String, required: true },
});

module.exports = mongoose.model('NotificationRequest', NotificationRequestSchema);