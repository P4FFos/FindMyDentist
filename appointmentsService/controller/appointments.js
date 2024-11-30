var express = require('express');
var router = express.Router();

const Appointment = require('../model/appointment');
const Timeslot = require("../../timeslotsService/model/timeslot");

const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://test.mosquitto.org:1883');

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

client.on('message', async (topic, message) => {
    if (topic === 'appointments/create') {
        try {
            const payload = JSON.parse(message.toString());
            const timeslot = await Timeslot.findById(payload.timeslotId);
            const appointment = new Appointment(payload);
            await appointment.save();
            timeslot.isBooked = true;
            await timeslot.save();

            client.publish('appointments/create/response', JSON.stringify({ status: 'success', appointment }));
        } catch (error) {
            client.publish('appointments/create/response', JSON.stringify({ status: 'error', message: error.message }));
        }
    } else if (topic === 'appointments/get/all') {
        try {
            const payload = JSON.parse(message.toString());
            const appointments = await Appointment.find({patientId: payload.patientId});
            if (appointments) {
                client.publish('appointments/get/all/response', JSON.stringify({ status: 'success', appointments }));
            } else {
                client.publish('appointments/get/all/response', JSON.stringify({ status: 'error', message: 'Appointments cannot be fetched' }));
            }
        } catch (error) {
            client.publish('appointments/get/all/response', JSON.stringify({ status: 'error', message: error.message }));
        }
    } else if (topic === 'appointments/delete') {
        try {
            const payload = JSON.parse(message.toString());
            const appointment = await Timeslot.findByIdAndDelete(payload.appointmentId);
            const timeslot = await Timeslot.findById(appointment.timeslotId);
            if (timeslot) {
                timeslot.isBooked = false;
                await timeslot.save();
            }
            if (appointment) {
                client.publish('appointments/delete/response', JSON.stringify({ status: 'success', message: 'Appointment was deleted successfully' }));
            } else {
                client.publish('appointments/delete/response', JSON.stringify({ status: 'error', message: 'Appointment cannot be deleted' }));
            }
        } catch (error) {
            client.publish('appointments/delete/response', JSON.stringify({ status: 'error', message: error.message }));
        }
    }
});

module.exports = router;
