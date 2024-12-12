// Imports
var express = require('express');
var router = express.Router();

// Import models
const NotificationRequest = require('../model/NotificationRequest');

// MQTT client initialization
const client = require('../../mqtt/mqtt-config');

// MQTT client connection
client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('notifications/create');
});


// MQTT client message handling
client.on('message', async (topic, message) => {
    try {
        const payload = JSON.parse(message.toString());
        switch (topic) {
            case 'notifications/create':
                await handleCreateNotificationRequest(payload);
                break;
        }
    } catch (error) {
        console.error('Error handling message:', error);
    }
});

// Create a notification request
async function handleCreateNotificationRequest(payload) {
    try {
        const notificationRequest = new NotificationRequest(payload);
        await notificationRequest.save();
        const responsePayload = { status: 'success', notificationRequest };
        client.publish('notifications/create/response', JSON.stringify(responsePayload));
    } catch (error) {
        const errorPayload = { status: 'error', message: error.message };
        client.publish('notifications/create/response', JSON.stringify(errorPayload));
    }
}

module.exports = router;