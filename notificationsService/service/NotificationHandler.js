var express = require('express');
var router = express.Router();

const NotificationSender = require('./NotificationSender');
const notificationSender = new NotificationSender();
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
                await notificationSender.sendCancellationNotification(recipientEmail);
            }
            break;
        case 'appointments/create/response':
            if (response.status === 'success') {
                const recipientEmail = response.appointment.patientEmail;
                await notificationSender.sendAppointmentConfirmation(recipientEmail);
            }
            break;
        case 'timeslots/update/response':
            if (response.status === 'success') {
                const notificationRequests = await Notification.find({ timeslotId: response.timeslotId });

                for (const notificationRequest of notificationRequests) {
                    if (response.timeslotId === notificationRequest.timeslotId) {
                        await notificationSender.sendTimeslotUpdateNotification(notificationRequest.email);
                        await Notification.deleteOne({ _id: notificationRequest._id });
                    }
                }
            }
            break;
    }
});

module.exports = router;