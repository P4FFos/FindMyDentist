const mqtt = require("mqtt");

const protocol = 'mqtt';
const host = 'test.mosquitto.org';
const port = '1883';
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`; //random id for the current client

const connectUrl = `${protocol}://${host}:${port}`;


const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
});

client.on('connect', () => {
    console.log('Publish Center connected to the broker')
});

client.on('error', (err) => {
    console.log('Broker connection error', err);
});

module.exports = client;
