const client = require('../mqtt-config');

// Subscribe to a topic and handle messages
function subscribeToTopic(topic, callback) {
    // Subscribe to the given topic
    client.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
            console.error(`Failed to subscribe to ${topic}:`, err);
        } else {
            console.log(`Successfully subscribed to ${topic}`);
        }
    });

    // Set up the callback to handle incoming messages
    client.on('message', (receivedTopic, message) => {
        if (receivedTopic === topic) {
            // Parse the message from a Buffer to a JavaScript object
            const parsedMessage = JSON.parse(message.toString());
            callback(parsedMessage);
        }
    });
}

// Exporting the subscription function to use in other files
module.exports = {
    subscribeToTopic
};