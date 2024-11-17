const NodeMailer = require('../NotificationService/NodeMailer'); // Corrected path

const mailer = new NodeMailer();

class NotificationSender {
    // Send booking notification to patient
    async sendBookingNotification(recipientEmail, patientName, timeslot) {
        const subject = 'Appointment booked successfully';
        const text = `Dear ${patientName}, your appointment for timeslot ${timeslot} has been booked successfully.`;
        try {
            await mailer.sendEmail(recipientEmail, subject, text);
            console.log('Booking notification sent');
        } catch (error) {
            console.error('Error in sending:', error);
        }
    }

    // Send cancellation notification to patient
    async sendCancellationNotification(recipientEmail, appointmentId) {
        const subject = 'Appointment cancelled';
        const text = `Your appointment with ID ${appointmentId} has been cancelled.`;
        try {
            await mailer.sendEmail(recipientEmail, subject, text);
            console.log('Cancellation notification sent');
        } catch (error) {
            console.error('Error in sending:', error);
        }
    }
}

module.exports = NotificationSender;