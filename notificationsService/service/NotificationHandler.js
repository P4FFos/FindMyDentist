var express = require('express');
var router = express.Router();

const NotificationSender = require('./NotificationSender');
const notificationSender = new NotificationSender();
const Timeslot = require('../../timeslotsService/model/timeslot');
const Notification = require('../model/NotificationRequest');
const client = require('../../mqtt/mqtt-config');

client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('appointments/delete/response');
    client.subscribe('appointments/create/response');
    client.subscribe('timeslots/update/response');
});

client.on('message', async (topic, message) => {
    const response = JSON.parse(message.toString());

    switch (topic) {
        case 'appointments/delete/response':
            if (response.status === 'success') {
                const { recipientEmail } = response;
                console.log('Appointment deleted:', recipientEmail);
                await notificationSender.sendCancellationNotification(recipientEmail);
            }
            break;
        case 'appointments/create/response':
            if (response.status === 'success') {
                const { recipientEmail } = response;
                console.log('Appointment created:', recipientEmail);
                await notificationSender.sendAppointmentConfirmation(recipientEmail);
            }
            break;
        case 'timeslots/update/response':
            if (response.status === 'success') {
                console.log('Timeslot updated:', response.timeslotId);
                const timeslot = Timeslot.findById(response.timeslotId);
                console.log("timeslot1", timeslot)
                const notificationRequest = await Notification.find({timeslotId: response.timeslotId});
                console.log("timeslot2", notificationRequest)

                if (timeslot._id === notificationRequest.timeslotId && timeslot.isBooked === false) {
                    await notificationSender.sendTimeslotUpdateNotification(notificationRequest.email);
                    console.log("function invoked")
                }
            }
    }
});

module.exports = router;