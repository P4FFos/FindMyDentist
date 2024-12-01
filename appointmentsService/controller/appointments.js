// Imports
var express = require('express');
var router = express.Router();

// Import models
const Appointment = require('../model/appointment');
const Timeslot = require("../../timeslotsService/model/timeslot");

// Import configured MQTT client
const client = require('../../mqtt/mqtt-config');

// MQTT client connection
client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('appointments/create', (err) => {
        if (err) {
            console.error('Failed to subscribe to topic', err);
        }
    });
    client.subscribe('appointments/get/all', (err) => {
        if (err) {
            console.error('Failed to subscribe to topic', err);
        }
    });
    client.subscribe('appointments/delete', (err) => {
        if (err) {
            console.error('Failed to subscribe to topic', err);
        }
    });
});

// MQTT client message handling
client.on('message', async (topic, message) => {
    if (topic === 'appointments/create') {
        try {
            const payload = JSON.parse(message.toString());
            console.log(payload);
            const timeslot = Timeslot.findById(payload.timeslotId);

            if (timeslot && !timeslot.isBooked) {
                const appointment = new Appointment(payload);
                await appointment.save();

                // timeslot.isBooked = true;
                // timeslot.save();
                client.publish('timeslots/update', JSON.stringify({ timeslotId: payload.timeslotId, isBooked: true }));
                console.log(timeslot.isBooked);
                client.publish('appointments/create/response', JSON.stringify({ status: 'success', appointment }));
            } else {
                client.publish('appointments/create/response', JSON.stringify({
                    status: 'error',
                    message: 'Timeslot is already booked or unavailable'
                }));
            }
        } catch (error) {
            client.publish('appointments/create/response', JSON.stringify({ status: 'error', message: error.message }));
        }
    } else if (topic === 'appointments/get/all') {
        try {
            const payload = JSON.parse(message.toString());
            const appointments = await Appointment.find({ patientId: payload.patientId });
            if (appointments) {
                client.publish('appointments/get/all/response', JSON.stringify({ status: 'success', appointments }));
            } else {
                client.publish('appointments/get/all/response', JSON.stringify({
                    status: 'error',
                    message: 'Appointments cannot be fetched'
                }));
            }
        } catch (error) {
            client.publish('appointments/get/all/response', JSON.stringify({ status: 'error', message: error.message }));
        }
    } else if (topic === 'appointments/delete') {
        try {
            const payload = JSON.parse(message.toString());
            const appointment = await Appointment.findByIdAndDelete(payload.appointmentId);

            if (appointment) {
                const timeslot = await Timeslot.findById(appointment.timeslotId);
                if (timeslot) {
                    timeslot.isBooked = false;
                    await timeslot.save();
                }

                client.publish('appointments/delete/response', JSON.stringify({
                    status: 'success',
                    message: 'Appointment was deleted successfully'
                }));
            } else {
                client.publish('appointments/delete/response', JSON.stringify({
                    status: 'error',
                    message: 'Appointment cannot be deleted'
                }));
            }
        } catch (error) {
            client.publish('appointments/delete/response', JSON.stringify({ status: 'error', message: error.message }));
        }
    }
});

module.exports = router;
