// Imports
var express = require('express');
var router = express.Router();

// Import models
const Timeslot = require('../model/timeslot');

// MQTT client initialization
const client = require('../../../mqtt/mqtt-config');

let currentDB = null;
var TimeslotModel = null;

router.setDatabase = function(db) {
    currentDB = db;

    // Set models
    setTimeslotModel();
};

function setTimeslotModel() {
    if (currentDB) {
        console.log('Setting TimeslotModel with DB:', currentDB.name);
        // Check if the model already exists on the connection
        if (currentDB.models['Timeslot']) {
            TimeslotModel = currentDB.models['Timeslot'];
        } else {
            TimeslotModel = currentDB.model('Timeslot', Timeslot.schema);
        }
    } else {
        console.error('Error: currentDB is undefined');
    }
}

// MQTT client connection
client.on('connect', () => {
    console.log('Connected to MQTT broker');
    setInterval(() => {
        const payload = JSON.stringify({
            serviceName: 'Timeslots Service',
            status: 'alive',
            timestamp: Date.now(),
        });
        client.publish('services/heartbeat', payload, { qos: 1 });
    }, 1000);
    client.subscribe('timeslots/update', { qos: 1 });
    client.subscribe('timeslots/create', { qos: 1 });
    client.subscribe('timeslots/get/all', { qos: 1 });
    client.subscribe('timeslots/get/available', { qos: 1 });
    client.subscribe('timeslots/get/unavailable', { qos: 1 });
    client.subscribe('timeslots/delete', { qos: 1 });
});

// MQTT client message handling
client.on('message', async (topic, message) => {
    try {
        const payload = JSON.parse(message.toString());
        switch (topic) {
            case 'timeslots/update':
                await handleTimeslotUpdate(payload);
                break;
            case 'timeslots/create':
                await handleTimeslotCreate(payload);
                break;
            case 'timeslots/get/all':
                await handleGetAllTimeslots(payload);
                break;
            case 'timeslots/get/available':
                await handleGetAvailableTimeslots(payload);
                break;
            case 'timeslots/get/unavailable':
                await handleGetUnavailableTimeslots(payload);
                break;
            case 'timeslots/delete':
                await handleTimeslotDelete(payload);
                break;
        }
    } catch (error) {
        console.error('Error handling message:', error);
    }
});

// Update a timeslot
async function handleTimeslotUpdate(payload) {
    try {
        const timeslot = await TimeslotModel.findById(payload.timeslotId);
        if (timeslot) {
            timeslot.isBooked = payload.isBooked;
            await timeslot.save();
            client.publish('timeslots/update/response', JSON.stringify({
                status: 'success',
                timeslotId: timeslot._id
            }), { qos: 1 });
        } else {
            client.publish('timeslots/update/response', JSON.stringify({
                status: 'error',
                message: 'Timeslot not found'
            }), { qos: 1 });
        }
    } catch (error) {
        client.publish('timeslots/update/response', JSON.stringify({ status: 'error', message: error.message }), { qos: 1 });
    }
}

// Create a timeslot
async function handleTimeslotCreate(payload) {
    try {
        const timeslot = new TimeslotModel(payload);
        await timeslot.save();
        client.publish('timeslots/create/response', JSON.stringify({
            status: 'success',
            message: `Timeslot ${timeslot._id} for dentist ${timeslot.dentistId} was created`,
            timeslot
        }), { qos: 1 });
    } catch (error) {
        client.publish('timeslots/create/response', JSON.stringify({ status: 'error', message: error.message }), { qos: 1 });
    }
}

// Get all timeslots of a dentist
async function handleGetAllTimeslots(payload) {
    try {
        const timeslots = await TimeslotModel.find({ dentistId: payload.dentistId });
        if (timeslots) {
            client.publish('timeslots/get/all/response', JSON.stringify({ status: 'success', timeslots }), { qos: 1 });
        } else {
            client.publish('timeslots/get/all/response', JSON.stringify({
                status: 'error',
                message: 'Timeslots cannot be fetched'
            }), { qos: 1 });
        }
    } catch (error) {
        client.publish('timeslots/get/all/response', JSON.stringify({ status: 'error', message: error.message }), { qos: 1 });
    }
}

// Get available timeslots of a dentist
async function handleGetAvailableTimeslots(payload) {
    try {
        const timeslots = await TimeslotModel.find({
            dentistId: payload.dentistId,
            isBooked: false
        });
        if (timeslots) {
            client.publish('timeslots/get/available/response', JSON.stringify({
                 status: 'success',
                 message: `Available timeslots for dentist ${payload.dentistId} were fetched`,
                 timeslots
            }), { qos: 1 });
        } else {
            client.publish('timeslots/get/available/response', JSON.stringify({
                status: 'error',
                message: 'Available timeslots cannot be fetched'
            }), { qos: 1 });
        }
    } catch (error) {
        client.publish('timeslots/get/available/response', JSON.stringify({
            status: 'error',
            message: error.message
        }), { qos: 1 });
    }
}

// Get unavailable timeslots of a dentist
async function handleGetUnavailableTimeslots(payload) {
    try {
        const timeslots = await TimeslotModel.find({
            dentistId: payload.dentistId,
            isBooked: true
        });
        if (timeslots) {
            client.publish('timeslots/get/unavailable/response', JSON.stringify({ status: 'success', timeslots }), { qos: 1 });
        } else {
            client.publish('timeslots/get/unavailable/response', JSON.stringify({
                status: 'error',
                message: 'Unavailable timeslots cannot be fetched'
            }), { qos: 1 });
        }
    } catch (error) {
        client.publish('timeslots/get/unavailable/response', JSON.stringify({
            status: 'error',
            message: error.message
        }), { qos: 1 });
    }
}

// Delete a timeslot
async function handleTimeslotDelete(payload) {
    try {
        const timeslot = await TimeslotModel.findByIdAndDelete(payload.timeslotId);
        if (timeslot) {
            client.publish('timeslots/delete/response', JSON.stringify({
                status: 'success',
                message: `Timeslot ${timeslot._id} for dentist ${timeslot.dentistId} was deleted `
            }), { qos: 1 });
        } else {
            client.publish('timeslots/delete/response', JSON.stringify({
                status: 'error',
                message: 'Timeslot cannot be deleted'
            }), { qos: 1 });
        }
    } catch (error) {
        client.publish('timeslots/delete/response', JSON.stringify({ status: 'error', message: error.message }), { qos: 1 });
    }
}

module.exports = router;
