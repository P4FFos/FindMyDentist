// Imports
const express = require('express');
const router = express.Router();
const mqtt = require('mqtt');

// Import models
const Dentist = require('../model/dentist.js');

// MQTT client initialization
const client = require('../../mqtt/mqtt-config');

// MQTT client connection
client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('dentists/create', (err) => {
        if (err) {
            console.error('Failed to subscribe to topic', err);
        }
    });
    client.subscribe('dentists/get/login', (err) => {
        if (err) {
            console.error('Failed to subscribe to topic', err);
        }
    });
    client.subscribe('dentists/get/all', (err) => {
        if (err) {
            console.error('Failed to subscribe to topic', err);
        }
    });
    client.subscribe('dentists/get', (err) => {
        if (err) {
            console.error('Failed to subscribe to topic', err);
        }
    });
});

// MQTT client message handling
client.on('message', async (topic, message) => {
    if (topic === 'dentists/create') {
        try {
            const payload = JSON.parse(message.toString());
            const existingDentistEmail = await Dentist.findOne({email: payload.email});

            if (existingDentistEmail) {
                client.publish('dentists/create/response', JSON.stringify({
                    status: 'error',
                    message: 'Dentist Account with this email already exists'
                }));
                return;
            }

            const dentist = new Dentist(payload);
            await dentist.save();
            client.publish('dentists/create/response', JSON.stringify({status: 'success', dentist}));
        } catch (error) {
            client.publish('dentists/create/response', JSON.stringify({status: 'error', message: error.message}));
        }
    } else if (topic === 'dentists/get/login') {
        try {
            const payload = JSON.parse(message.toString());
            const dentist = await Dentist.findOne({email: payload.email, password: payload.password});
            if (dentist) {
                client.publish('dentists/get/login/response', JSON.stringify({status: 'success', dentist}));
            } else {
                client.publish('dentists/get/login/response', JSON.stringify({
                    status: 'error',
                    message: 'Invalid dentist credentials'
                }));
            }
        } catch (error) {
            client.publish('dentists/get/login/response', JSON.stringify({status: 'error', message: error.message}));
        }
    } else if (topic === 'dentists/get/all') {
        try {
            const dentists = await Dentist.find();
            if (dentists) {
                client.publish('dentists/get/all/response', JSON.stringify({status: 'success', dentists}));
            } else {
                client.publish('dentists/get/all/response', JSON.stringify({
                    status: 'error',
                    message: 'Dentists cannot be fetched'
                }));
            }
        } catch (error) {
            client.publish('dentists/get/all/response', JSON.stringify({status: 'error', message: error.message}));
        }
    } else if (topic === 'dentists/get') {
        try {
            const payload = JSON.parse(message.toString());
            const dentist = await Dentist.findById(payload.dentistId);
            if (dentist) {
                client.publish('dentists/get/response', JSON.stringify({status: 'success', dentist}));
            } else {
                client.publish('dentists/get/response', JSON.stringify({
                    status: 'error',
                    message: 'Dentist cannot be fetched'
                }));
            }
        } catch (error) {
            client.publish('dentists/get/response', JSON.stringify({status: 'error', message: error.message}));
        }
    }
});

module.exports = router;
