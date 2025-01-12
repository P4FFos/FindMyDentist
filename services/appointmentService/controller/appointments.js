// Imports
var express = require('express');
var router = express.Router();

// Import models
const Appointment = require('../model/appointment');
const Timeslot = require("../../timeslotService/model/timeslot");


// Import configured MQTT client
const client = require('../../../mqtt/mqtt-config');

let currentDB = null;
var AppointmentModel = null;
var TimeslotsModel= null;

router.setDatabase = function(db) {
  currentDB = db;

  // Set models
  setAppointmentModel();
  setTimeslotsModel();
};

function setAppointmentModel() {
    if (currentDB) {
        console.log('Setting AppointmentModel with DB:', currentDB.name);
        // Check if the model already exists on the connection
        if (currentDB.models['Appointment']) {
            AppointmentModel = currentDB.models['Appointment'];
        } else {
            AppointmentModel = currentDB.model('Appointment', Appointment.schema);
        }
    } else {
        console.error('Error: currentDB is undefined');
    }
}

function setTimeslotsModel() {
    if (currentDB) {
        // console.log('Setting TimeslotModel with DB:', currentDB.name); Logging
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
            serviceName: 'Appointments Service',
            status: 'alive',
            timestamp: Date.now(),
        });
        client.publish('services/heartbeat', payload, { qos: 1 });
    }, 1000);
    client.subscribe('appointments/create', { qos: 1 });
    client.subscribe('appointments/get/all', { qos: 1 });
    client.subscribe('appointments/system/get/all', { qos: 1 });
    client.subscribe('appointments/delete', { qos: 1 });
    client.subscribe('appointments/dentist/get/all', { qos: 1 });
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
        const timeslot = TimeslotsModel.findById(payload.timeslotId);
        if (timeslot && !timeslot.isBooked) {
            const appointment = new AppointmentModel(payload);
            await appointment.save();

            client.publish('timeslots/update', JSON.stringify({timeslotId: payload.timeslotId, isBooked: true}), { qos: 1 });
            client.publish('patients/update', JSON.stringify({action: 'add appointment', patientId: payload.patientId,
                appointment: appointment, appointmentId: appointment._id}), { qos: 1 });
            client.publish('appointments/create/response', JSON.stringify({
                status: 'success',
                message: `Appointment for timeslot: ${appointment.timeslotId} was created`,
                appointment
            }), { qos: 1 });
        } else {
            client.publish('appointments/create/response', JSON.stringify({
                status: 'error',
                message: 'Timeslot is already booked or unavailable'
            }), { qos: 1 });
        }
    } catch (error) {
        client.publish('appointments/create/response', JSON.stringify({status: 'error', message: error.message}), { qos: 1 });
    }
}

// Get all system appointments
async function handleGetAllSystemAppointments(payload) {
    try {
        const appointments = await AppointmentModel.find({});
        if (appointments) {
            client.publish('appointments/system/get/all/response', JSON.stringify({status: 'success', appointments}), { qos: 1 });
        } else {
            client.publish('appointments/system/get/all/response', JSON.stringify({
                status: 'error',
                message: 'Appointments cannot be fetched'
            }), { qos: 1 });
        }
    } catch (error) {
        client.publish('appointments/system/get/all/response', JSON.stringify({status: 'error', message: error.message}), { qos: 1 });
    }
}

// Get all appointments of a patient
async function handleGetAllAppointments(payload) {
    try {
        const appointments = await AppointmentModel.find({patientId: payload.patientId});
        if (appointments) {
            client.publish('appointments/get/all/response', JSON.stringify({status: 'success', appointments}), { qos: 1 });
        } else {
            client.publish('appointments/get/all/response', JSON.stringify({
                status: 'error',
                message: 'Appointments cannot be fetched'
            }), { qos: 1 });
        }
    } catch (error) {
        client.publish('appointments/get/all/response', JSON.stringify({status: 'error', message: error.message}), { qos: 1 });
    }
}

// Get all appointments for a dentist
async function handleGetAllDentistAppointments(payload) {
    try {
        const appointments = await AppointmentModel.find({dentistId: payload.dentistId});
        if (appointments) {
            client.publish('appointments/dentist/get/all/response', JSON.stringify({status: 'success', appointments}), { qos: 1 });
        } else {
            client.publish('appointments/dentist/get/all/response', JSON.stringify({
                status: 'error',
                message: 'Appointments cannot be fetched'
            }), { qos: 1 });
        }
    } catch (error) {
        client.publish('appointments/dentist/get/all/response', JSON.stringify({status: 'error', message: error.message}), { qos: 1 });
    }
}

// Delete an appointment
async function handleAppointmentDelete(payload) {
    try {
        const appointment = await AppointmentModel.findByIdAndDelete(payload.appointmentId);

        if (appointment) {
            client.publish('timeslots/update', JSON.stringify({timeslotId: payload.timeslotId, isBooked: false}), { qos: 1 });
            client.publish('patients/update', JSON.stringify({action: 'delete appointment', patientId: payload.patientId,
                appointment: appointment, appointmentId: payload.appointmentId}), { qos: 1 });
            client.publish('appointments/delete/response', JSON.stringify({
                status: 'success',
                message: `Appointment  for timeslot: ${appointment.timeslotId} was deleted`,
                appointment,
                recipientEmail: appointment.patientEmail
            }), { qos: 1 });
        } else {
            client.publish('appointments/delete/response', JSON.stringify({
                status: 'error',
                message: 'Appointment cannot be deleted'
            }), { qos: 1 });
        }
    } catch (error) {
        client.publish('appointments/delete/response', JSON.stringify({status: 'error', message: error.message}), { qos: 1 });
    }
}

module.exports = router;
