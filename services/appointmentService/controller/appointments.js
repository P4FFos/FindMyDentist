// Imports
var express = require('express');
var router = express.Router();

// Import models
const Appointment = require('../model/appointment');
const Timeslot = require("../../timeslotService/model/timeslot");

// Import configured MQTT client
const client = require('../../../mqtt/mqtt-config');

// MQTT client connection
client.on('connect', () => {
    console.log('Connected to MQTT broker');
    setInterval(() => {
        const payload = JSON.stringify({
            serviceName: 'Appointments Service',
            status: 'alive',
            timestamp: Date.now(),
        });
        client.publish('services/heartbeat', payload);
    }, 1000);
    client.subscribe('appointments/create');
    client.subscribe('appointments/get/all');
    client.subscribe('appointments/system/get/all');
    client.subscribe('appointments/delete');
    client.subscribe('appointments/dentist/get/all');
});

// MQTT client message handling
client.on('message', async (topic, message) => {
    try {
        const payload = JSON.parse(message.toString());
        switch (topic) {
            case 'appointments/create':
                await handleAppointmentCreate(payload);
                break;
            case 'appointments/system/get/all':
                await handleGetAllSystemAppointments(payload);
                break;
            case 'appointments/get/all':
                await handleGetAllAppointments(payload);
                break;
            case 'appointments/dentist/get/all':
                await handleGetAllDentistAppointments(payload);
                break;
            case 'appointments/delete':
                await handleAppointmentDelete(payload);
                break;
        }
    } catch (error) {
        console.error('Error handling message:', error);
    }
});

// Create an appointment
async function handleAppointmentCreate(payload) {
    try {
        const timeslot = Timeslot.findById(payload.timeslotId);
        if (timeslot && !timeslot.isBooked) {
            const appointment = new Appointment(payload);
            await appointment.save();

            client.publish('timeslots/update', JSON.stringify({timeslotId: payload.timeslotId, isBooked: true}));
            client.publish('patients/update', JSON.stringify({action: 'add appointment', patientId: payload.patientId,
                appointment: appointment, appointmentId: appointment._id}));
            client.publish('appointments/create/response', JSON.stringify({
                status: 'success', appointment,
            }));
        } else {
            client.publish('appointments/create/response', JSON.stringify({
                status: 'error',
                message: 'Timeslot is already booked or unavailable'
            }));
        }
    } catch (error) {
        client.publish('appointments/create/response', JSON.stringify({status: 'error', message: error.message}));
    }
}

// Get all system appointments
async function handleGetAllSystemAppointments(payload) {
    try {
        const appointments = await Appointment.find({});
        if (appointments) {
            client.publish('appointments/system/get/all/response', JSON.stringify({status: 'success', appointments}));
        } else {
            client.publish('appointments/system/get/all/response', JSON.stringify({
                status: 'error',
                message: 'Appointments cannot be fetched'
            }));
        }
    } catch (error) {
        client.publish('appointments/system/get/all/response', JSON.stringify({status: 'error', message: error.message}));
    }
}

// Get all appointments of a patient
async function handleGetAllAppointments(payload) {
    try {
        const appointments = await Appointment.find({patientId: payload.patientId});
        if (appointments) {
            client.publish('appointments/get/all/response', JSON.stringify({status: 'success', appointments}));
        } else {
            client.publish('appointments/get/all/response', JSON.stringify({
                status: 'error',
                message: 'Appointments cannot be fetched'
            }));
        }
    } catch (error) {
        client.publish('appointments/get/all/response', JSON.stringify({status: 'error', message: error.message}));
    }
}

// Get all appointments for a dentist
async function handleGetAllDentistAppointments(payload) {
    try {
        const appointments = await Appointment.find({dentistId: payload.dentistId});
        if (appointments) {
            client.publish('appointments/dentist/get/all/response', JSON.stringify({status: 'success', appointments}));
        } else {
            client.publish('appointments/dentist/get/all/response', JSON.stringify({
                status: 'error',
                message: 'Appointments cannot be fetched'
            }));
        }
    } catch (error) {
        client.publish('appointments/dentist/get/all/response', JSON.stringify({status: 'error', message: error.message}));
    }
}

// Delete an appointment
async function handleAppointmentDelete(payload) {
    try {
        const appointment = await Appointment.findByIdAndDelete(payload.appointmentId);

        if (appointment) {
            client.publish('timeslots/update', JSON.stringify({timeslotId: payload.timeslotId, isBooked: false}));
            client.publish('patients/update', JSON.stringify({action: 'delete appointment', patientId: payload.patientId,
                appointment: appointment, appointmentId: payload.appointmentId}));
            client.publish('appointments/delete/response', JSON.stringify({
                status: 'success',
                message: 'Appointment was deleted successfully',
                appointment,
                recipientEmail: appointment.patientEmail
            }));
        } else {
            client.publish('appointments/delete/response', JSON.stringify({
                status: 'error',
                message: 'Appointment cannot be deleted'
            }));
        }
    } catch (error) {
        client.publish('appointments/delete/response', JSON.stringify({status: 'error', message: error.message}));
    }
}

module.exports = router;
