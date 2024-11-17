const NotificationSender = require('../NotificationService/NotificationSender');
const { subscribeToTopic } = require('../mqtt/subscriptionCenter');

const notificationSender = new NotificationSender();

// Subscribe to MQTT topic for booking
subscribeToTopic('patients/book/response', async (data) => {
    data = JSON.parse(data);

    // Check if the booking was successful
    if (data.status === 'success') {
        const { recipientEmail, appointment } = data;
        await notificationSender.sendBookingNotification(recipientEmail, appointment.patient, appointment.timeslot);
    }
});

// Subscribe to MQTT topic for cancellation
subscribeToTopic('patients/cancel/response', async (data) => {
    data = JSON.parse(data);

    // Check if the cancellation was successful
    if (data.status === 'success') {
        const { recipientEmail, appointmentId } = data;
        await notificationSender.sendCancellationNotification(recipientEmail, appointmentId);
    }
});

console.log('Subscription handler initialized');