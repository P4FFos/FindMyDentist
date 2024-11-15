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
    username: 'test_client',
    password: 'test_client_password',
    reconnectPeriod: 1000,
});

client.on('connect', () => {
    console.log('Client Connected to The Broker')
});

client.on('error', () => {
    console.log('Broker connection error');
});
