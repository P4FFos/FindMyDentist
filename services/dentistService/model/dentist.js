const mongoose = require('mongoose');

const dentistSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    secondName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    location: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }]
});

module.exports = mongoose.model('Dentist', dentistSchema);
