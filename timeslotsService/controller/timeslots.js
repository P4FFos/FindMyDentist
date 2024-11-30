var express = require('express');
var router = express.Router();

const Timeslot = require('../model/timeslot');
const Dentist = require('../../dentist/model/dentist');

const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://test.mosquitto.org:1883');

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
    client.subscribe('timeslots/delete', (err) => {
        if (err) {
            console.error('Failed to subscribe to topic', err);
        }
    });
});

// Get all available timeslots
router.get('/api/v1/dentists/:dentistID/timeslots/available', async function (req, res, next) {
    var dentistID = req.params.dentistID;
    try {
      var availableTimeslots = await Timeslot.find({
        dentistId: dentistID,
        isBooked: false
      });

      mqttPublicationCenter.publishMessage('timeslots/available/response', JSON.stringify({
        status: 'success',
        message: 'Available timeslots fetched successfully',
        availableTimeslots
      }));

      res.status(200).json({
        message: "Timeslots fetched successfully",
        timeslots: availableTimeslots
      });
    } catch(error) {
      mqttPublicationCenter.publishMessage('timeslots/available/response', JSON.stringify({
          status: 'success',
          message: 'Server error',
          error: error.message
      }));
      return next(error);
    }
});

// Get all unavailable timeslots
router.get('/api/v1/dentists/:dentistID/timeslots/unavailable', async function (req, res, next) {
    var dentistID = req.params.dentistID;
    try {
        var unavailableTimeslots = await Timeslot.find({
            dentistId: dentistID,
            isBooked: true
        });
        mqttPublicationCenter.publishMessage('timeslots/unavailable/response', JSON.stringify({
            status: 'success',
            message: 'Unavailable timeslots fetched successfully',
            timeslots: unavailableTimeslots
        }));
        res.status(200).json({
            "message": "Timeslots fetched successfully",
            "timeslots": unavailableTimeslots
        });
    } catch(error) {
      mqttPublicationCenter.publishMessage('timeslots/unavailable/response', JSON.stringify({
          status: 'success',
          message: 'Server error',
          error: error.message
      }));
      return next(error);
    }
});

client.on('message', async (topic, message) => {
    if (topic === 'timeslots/create') {
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
            const timeslots = await Timeslot.find({dentistId: payload.dentistId});
            if (timeslots) {
                client.publish('timeslots/get/all/response', JSON.stringify({ status: 'success', timeslots }));
            } else {
                client.publish('timeslots/get/all/response', JSON.stringify({ status: 'error', message: 'Timeslots cannot be fetched' }));
            }
        } catch (error) {
            client.publish('timeslots/get/all/response', JSON.stringify({ status: 'error', message: error.message }));
        }
    } else if (topic === 'timeslots/delete') {
        try {
            const payload = JSON.parse(message.toString());
            const timeslot = await Timeslot.findByIdAndDelete(payload.timeslotId);
            if (timeslot) {
                client.publish('timeslots/delete/response', JSON.stringify({ status: 'success', message: 'Timeslot was deleted successfully' }));
            } else {
                client.publish('timeslots/delete/response', JSON.stringify({ status: 'error', message: 'Timeslots cannot be deleted' }));
            }
        } catch (error) {
            client.publish('timeslots/delete/response', JSON.stringify({ status: 'error', message: error.message }));
        }
    }
});

module.exports = router;
