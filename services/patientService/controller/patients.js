// Imports
const express = require('express');
const router = express.Router();

// Import models
const Patient = require('../model/patient.js');

// MQTT client initialization
const client = require('../../../mqtt/mqtt-config');

// MQTT client connection
client.on('connect', () => {
    console.log('Connected to MQTT broker');
    setInterval(() => {
        const payload = JSON.stringify({
            serviceName: 'Patient Service',
            status: 'alive',
            timestamp: Date.now(),
        });
        client.publish('services/heartbeat', payload);
    }, 1000);
    client.subscribe('patients/create');
    client.subscribe('patients/get/login');
    client.subscribe('patients/get');
    client.subscribe('patients/get/all');
    client.subscribe('patients/update');
});

// MQTT client message handling
client.on('message', async (topic, message) => {
    try {
        const payload = JSON.parse(message.toString());
        switch (topic) {
            case 'patients/update':
                await handlePatientUpdate(payload);
                break;
            case 'patients/create':
                await handlePatientCreate(payload);
                break;
            case 'patients/get/login':
                await handlePatientLogin(payload);
                break;
            case 'patients/get':
                await handleGetPatient(payload);
                break;
            case 'patients/get/all':
                await handleGetAllPatients();
                break;
        }
    } catch (error) {
        console.error('Error handling message:', error);
    }
});

// Update a patient
async function handlePatientUpdate(payload) {
    try {
        switch (payload.action) {
            case 'add appointment':
                await addAppointment({ patientId: payload.patientId, appointment: payload.appointment });
                break;

            case 'delete appointment':
                await deleteAppointment({ patientId: payload.patientId, appointmentId: payload.appointmentId });
                break;

            default:
                throw new Error();
        }
    } catch (error) {
        client.publish('patients/update/response', JSON.stringify({
            status: 'error',
            message: error.message
        }));
    }
}

// Function to add an appointment
async function addAppointment({ patientId, appointment }) {
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(
            patientId,
            { $push: { appointments: appointment } },
            { new: true }
        );

        if (updatedPatient) {
            client.publish('patients/update/response', JSON.stringify({
                status: 'success',
                patient: updatedPatient
            }));
        } else {
            throw new Error('Patient not found (404)');
        }
    } catch (error) {
        throw new Error(`Failed to add appointment: ${error.message}`);
    }
}

// Function to delete an appointment
async function deleteAppointment({ patientId, appointmentId }) {
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(
            patientId,
            { $pull: { appointments: { _id: appointmentId } } },
            { new: true }
        );

        if (updatedPatient) {
            client.publish('patients/update/response', JSON.stringify({
                status: 'success',
                patient: updatedPatient
            }));
        } else {
            throw new Error('Patient not found (404)');
        }
    } catch (error) {
        throw new Error(`Failed to delete appointment: ${error.message}`);
    }
}


// Create a patient
async function handlePatientCreate(payload) {
    try {
        const existingPatientEmail = await Patient.findOne({ email: payload.email });
        if (existingPatientEmail) {
            client.publish('patients/create/response', JSON.stringify({
                status: 'error',
                message: 'Patient Account with this email already exists. Try again with a different email'
            }));
            return;
        }
        const patient = new Patient(payload);
        await patient.save();
        client.publish('patients/create/response', JSON.stringify({
            status: 'success',
            message: `Patient ${patient._id} was registered`,
            patient
        }));
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
                message: 'Invalid patient credentials. Try again'
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
                message: 'Patient is not found (404). Try again'
            }));
        }
    } catch (error) {
        client.publish('patients/get/response', JSON.stringify({ status: 'error', message: error.message }));
    }
}

// Get all patients
async function handleGetAllPatients() {
    try {
        const patients = await Patient.find({});
        client.publish('patients/get/all/response', JSON.stringify({
            status: 'success',
            patients
        }));
    } catch (error) {
        client.publish('patients/get/all/response', JSON.stringify({
            status: 'error',
            message: error.message
        }));
    }
}

module.exports = router;
