// Imports
const express = require('express');
const router = express.Router();

// Import models
const Dentist = require('../model/dentist.js');

// MQTT client initialization
const client = require('../../../mqtt/mqtt-config');

// MQTT client connection
client.on('connect', () => {
    console.log('Connected to MQTT broker');
    setInterval(() => {
        const payload = JSON.stringify({
            serviceName: 'Dentist Service',
            status: 'alive',
            timestamp: Date.now(),
        });
        client.publish('services/heartbeat', payload);
    }, 1000);
    client.subscribe('dentists/create');
    client.subscribe('dentists/get/login');
    client.subscribe('dentists/get/all');
    client.subscribe('dentists/get');
});

// MQTT client message handling
client.on('message', async (topic, message) => {
    try {
        const payload = JSON.parse(message.toString());
        switch (topic) {
            case 'dentists/create':
                await handleDentistCreate(payload);
                break;
            case 'dentists/get/login':
                await handleDentistLogin(payload);
                break;
            case 'dentists/get/all':
                await handleGetAllDentists();
                break;
            case 'dentists/get':
                await handleGetDentist(payload);
                break;
        }
    } catch (error) {
        console.error('Error handling message:', error);
    }
});

// Create a dentist
async function handleDentistCreate(payload) {
    try {
        const existingDentistEmail = await Dentist.findOne({ email: payload.email });
        if (existingDentistEmail) {
            client.publish('dentists/create/response', JSON.stringify({
                status: 'error',
                message: 'Dentist Account with this email already exists. Try again with a different email'
            }));
            return;
        }
        const dentist = new Dentist(payload);
        await dentist.save();
        client.publish('dentists/create/response', JSON.stringify({
            status: 'success',
            message: `Dentist ${dentist._id} was added to the system`,
            dentist
        }));
    } catch (error) {
        client.publish('dentists/create/response', JSON.stringify({ status: 'error', message: error.message }));
    }
}

// Login a dentist
async function handleDentistLogin(payload) {
    try {
        const dentist = await Dentist.findOne({ email: payload.email, password: payload.password });
        if (dentist) {
            client.publish('dentists/get/login/response', JSON.stringify({ status: 'success', dentist }));
        } else {
            client.publish('dentists/get/login/response', JSON.stringify({
                status: 'error',
                message: 'Invalid dentist credentials. Try again'
            }));
        }
    } catch (error) {
        client.publish('dentists/get/login/response', JSON.stringify({ status: 'error', message: error.message }));
    }
}

// Get all dentists
async function handleGetAllDentists() {
    try {
        const dentists = await Dentist.find();
        client.publish('dentists/get/all/response', JSON.stringify({ status: 'success', dentists }));
    } catch (error) {
        client.publish('dentists/get/all/response', JSON.stringify({ status: 'error', message: error.message }));
    }
}

// Get a dentist
async function handleGetDentist(payload) {
    try {
        const dentist = await Dentist.findById(payload.dentistId);
        if (dentist) {
            client.publish('dentists/get/response', JSON.stringify({ status: 'success', dentist }));
        } else {
            client.publish('dentists/get/response', JSON.stringify({
                status: 'error',
                message: 'Dentist is not found (404). Try again'
            }));
        }
    } catch (error) {
        client.publish('dentists/get/response', JSON.stringify({ status: 'error', message: error.message }));
    }
}

module.exports = router;
