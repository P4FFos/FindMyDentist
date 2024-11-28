const client = require('./mqtt-config')

// Publish Message Function
function publishMessage(topic, payload) {
    client.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
        if (err) {
            console.error(`Failed to publish to ${topic}:`, err);
        } else {
            console.log(`Message published to ${topic}: ${payload}`);
        }
    });
}

// Export function
module.exports = {
    publishMessage
};
