// Imports
var express = require('express');
var router = express.Router();

// Import models
const Timeslot = require('../model/timeslot');

// MQTT client initialization
const client = require('../../mqtt/mqtt-config');

// MQTT client connection
client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('timeslots/create', (err) => {
        if (err) {
            console.error('Failed to subscribe to topic', err);
        }
    });
    client.subscribe('timeslots/get/all', (err) => {
        if (err) {
            console.error('Failed to subscribe to topic', err);
        }
    });
    client.subscribe('timeslots/get/available', (err) => {
        if (err) {
            console.error('Failed to subscribe to topic', err);
        }
    });
    client.subscribe('timeslots/get/unavailable', (err) => {
        if (err) {
            console.error('Failed to subscribe to topic', err);
        }
    });
    client.subscribe('timeslots/delete', (err) => {
        if (err) {
            console.error('Failed to subscribe to topic', err);
        }
    });
});

// MQTT client message handling
client.on('message', async (topic, message) => {
    if (topic === 'timeslots/update') {
        try {
            const payload = JSON.parse(message.toString());
            const timeslot = await Timeslot.findById(payload.timeslotId);
            if (timeslot) {
                timeslot.isBooked = payload.isBooked;
                await timeslot.save();
                client.publish('timeslots/update/response', JSON.stringify({ status: 'success' }));
            } else {
                client.publish('timeslots/update/response', JSON.stringify({
                    status: 'error',
                    message: 'Timeslot not found'
                }));
            }
        } catch (error) {
            client.publish('timeslots/update/response', JSON.stringify({ status: 'error', message: error.message }));
        }
    } else if (topic === 'timeslots/create') {
        try {
            const payload = JSON.parse(message.toString());
            const timeslot = new Timeslot(payload);
            await timeslot.save();
            client.publish('timeslots/create/response', JSON.stringify({ status: 'success', timeslot }));
        } catch (error) {
            client.publish('timeslots/create/response', JSON.stringify({ status: 'error', message: error.message }));
        }
    } else if (topic === 'timeslots/get/all') {
        try {
            const payload = JSON.parse(message.toString());
            const timeslots = await Timeslot.find({ dentistId: payload.dentistId });
            if (timeslots) {
                client.publish('timeslots/get/all/response', JSON.stringify({ status: 'success', timeslots }));
            } else {
                client.publish('timeslots/get/all/response', JSON.stringify({
                    status: 'error',
                    message: 'Timeslots cannot be fetched'
                }));
            }
        } catch (error) {
            client.publish('timeslots/get/all/response', JSON.stringify({ status: 'error', message: error.message }));
        }
    } else if (topic === 'timeslots/get/available') {
        try {
            const payload = JSON.parse(message.toString());
            const timeslots = await Timeslot.find({
                dentistId: payload.dentistId,
                isBooked: false
            });
            if (timeslots) {
                client.publish('timeslots/get/available/response', JSON.stringify({ status: 'success', timeslots }));
            } else {
                client.publish('timeslots/get/available/response', JSON.stringify({
                    status: 'error',
                    message: 'Available timeslots cannot be fetched'
                }));
            }
        } catch (error) {
            client.publish('timeslots/get/available/response', JSON.stringify({
                status: 'error',
                message: error.message
            }));
        }
    } else if (topic === 'timeslots/get/unavailable') {
        try {
            const payload = JSON.parse(message.toString());
            const timeslots = await Timeslot.find({
                dentistId: payload.dentistId,
                isBooked: true
            });
            if (timeslots) {
                client.publish('timeslots/get/unavailable/response', JSON.stringify({ status: 'success', timeslots }));
            } else {
                client.publish('timeslots/get/unavailable/response', JSON.stringify({
                    status: 'error',
                    message: 'Unavailable timeslots cannot be fetched'
                }));
            }
        } catch (error) {
            client.publish('timeslots/get/unavailable/response', JSON.stringify({
                status: 'error',
                message: error.message
            }));
        }
    } else if (topic === 'timeslots/delete') {
        try {
            const payload = JSON.parse(message.toString());
            const timeslot = await Timeslot.findByIdAndDelete(payload.timeslotId);
            if (timeslot) {
                client.publish('timeslots/delete/response', JSON.stringify({
                    status: 'success',
                    message: 'Timeslot was deleted successfully'
                }));
            } else {
                client.publish('timeslots/delete/response', JSON.stringify({
                    status: 'error',
                    message: 'Timeslots cannot be deleted'
                }));
            }
        } catch (error) {
            client.publish('timeslots/delete/response', JSON.stringify({ status: 'error', message: error.message }));
        }
    }
});

module.exports = router;
