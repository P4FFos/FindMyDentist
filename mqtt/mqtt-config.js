const mqtt = require("mqtt");

const protocol = 'ws';
const host = 'localhost';
const port = '8080';
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;

const connectUrl = `${protocol}://${host}:${port}`;

const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
});

client.on('connect', () => {
    console.log(`Connected to the broker via Load Balancer at ${connectUrl}`);
});

client.on('error', (err) => {
    console.log('Broker connection error', err);
});

module.exports = client;
