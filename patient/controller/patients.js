// Imports
const express = require('express');
const router = express.Router();

// Import models
const Patient = require('../model/patient.js');

// MQTT client initialization
const client = require('../../mqtt/mqtt-config');

// MQTT client connection
client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('patients/create');
    client.subscribe('patients/get/login');
    client.subscribe('patients/get');
});

// MQTT client message handling
client.on('message', async (topic, message) => {
    try {
        const payload = JSON.parse(message.toString());
        switch (topic) {
            case 'patients/create':
                await handlePatientCreate(payload);
                break;
            case 'patients/get/login':
                await handlePatientLogin(payload);
                break;
            case 'patients/get':
                await handleGetPatient(payload);
                break;
        }
    } catch (error) {
        console.error('Error handling message:', error);
    }
});

// Create a patient
async function handlePatientCreate(payload) {
    try {
        const existingPatientEmail = await Patient.findOne({ email: payload.email });
        if (existingPatientEmail) {
            client.publish('patients/create/response', JSON.stringify({
                status: 'error',
                message: 'Patient Account with this email already exists'
            }));
            return;
        }
        const patient = new Patient(payload);
        await patient.save();
        client.publish('patients/create/response', JSON.stringify({ status: 'success', patient }));
    } catch (error) {
        client.publish('patients/create/response', JSON.stringify({ status: 'error', message: error.message }));
    }
}

// Login a patient
async function handlePatientLogin(payload) {
    try {
        const patient = await Patient.findOne({ email: payload.email, password: payload.password });
        if (patient) {
            client.publish('patients/get/login/response', JSON.stringify({ status: 'success', patient }));
        } else {
            client.publish('patients/get/login/response', JSON.stringify({
                status: 'error',
                message: 'Invalid patient credentials'
            }));
        }
    } catch (error) {
        client.publish('patients/get/login/response', JSON.stringify({ status: 'error', message: error.message }));
    }
}

// Get a patient
async function handleGetPatient(payload) {
    try {
        const patient = await Patient.findById(payload.patientId);
        if (patient) {
            client.publish('patients/get/response', JSON.stringify({ status: 'success', patient }));
        } else {
            client.publish('patients/get/response', JSON.stringify({
                status: 'error',
                message: 'Patient cannot be fetched'
            }));
        }
    } catch (error) {
        client.publish('patients/get/response', JSON.stringify({ status: 'error', message: error.message }));
    }
}

module.exports = router;
