const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const Patient = require('../model/patient.js');
const Dentist = require('../../dentist/model/dentist.js');

const client = mqtt.connect('mqtt://test.mosquitto.org:1883');

client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('patients/create', (err) => {
        if (err) {
            console.error('Failed to subscribe to topic', err);
        }
    });
    client.subscribe('patients/get', (err) => {
        if (err) {
            console.error('Failed to subscribe to topic', err);
        }
    });
});

client.on('message', async (topic, message) => {
    if (topic === 'patients/create') {
        try {
            const payload = JSON.parse(message.toString());
            const existingPatientEmail = await Patient.findOne({ email: payload.email });

            if (existingPatientEmail) {
                client.publish('patients/create/response', JSON.stringify({ status: 'error', message: 'Patient Account with this email already exists' }));
                return;
            }

            const patient = new Patient(payload);
            await patient.save();
            client.publish('patients/create/response', JSON.stringify({ status: 'success', patient }));
        } catch (error) {
            client.publish('patients/create/response', JSON.stringify({ status: 'error', message: error.message }));
        }
    } else if (topic === 'patients/get') {
        try {
            const payload = JSON.parse(message.toString());
            const patient = await Patient.findOne({ email: payload.email, password: payload.password });
            if (patient) {
                client.publish('patients/get/response', JSON.stringify({ status: 'success', patient }));
            } else {
                client.publish('patients/get/response', JSON.stringify({ status: 'error', message: 'Invalid credentials1' }));
            }
        } catch (error) {
            client.publish('patients/get/response', JSON.stringify({ status: 'error', message: error.message }));
        }
    }
});

module.exports = router;
