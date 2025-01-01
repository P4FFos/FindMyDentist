const mqtt = require("mqtt");
require('dotenv').config();

const protocol = 'mqtt';
const host = 'localhost';
const port = '1883';
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;

const connectUrl = process.env.CI_MQTT_URL || `${protocol}://${host}:${port}`;

const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
});

client.on('connect', () => {
    console.log('Connected to the broker')
});

client.on('error', (err) => {
    console.log('Broker connection error', err);
});

module.exports = client;
