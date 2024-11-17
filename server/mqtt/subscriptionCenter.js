const client = require('../mqtt-config');

// Subscribe function
function subscribeToTopic(topic, callback) {
    // Subscribe to speciifc topic
    client.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
            console.error(`Failed to subscribe to ${topic}:`, err);
        } else {
            console.log(`Successfully subscribed to ${topic}`);
        }
    });

    client.on('message', (receivedTopic, message) => {
        if (receivedTopic === topic) {
            // Parse the message to a JavaScript object
            const parsedMessage = JSON.parse(message.toString());
            callback(parsedMessage);
        }
    });
}

// Export function
module.exports = {
    subscribeToTopic
};