const NodeMailer = require('./NodeMailer');

const mailer = new NodeMailer();

class NotificationSender {
    async sendCancellationNotification(recipientEmail) {
        const subject = 'Appointment cancelled by the dentist';
        const text = `Your appointment has been cancelled by the dentist`;
        try {
            await mailer.sendEmail(recipientEmail, subject, text);
            console.log('Cancellation notification sent');
        } catch (error) {
            console.error('Error in sending:', error);
        }
    }

    async sendAppointmentConfirmation(recipientEmail) {
        const subject = 'Appointment has been booked';
        const text = `Your appointment has been confirmed and booked`;
        try {
            await mailer.sendEmail(recipientEmail, subject, text);
            console.log('Confirmation notification sent');
        } catch (error) {
            console.error('Error in sending:', error);
        }
    }

    async sendTimeslotUpdateNotification(recipientEmail) {
        const subject = 'New timeslot is available';
        const text = `Timeslot has been updated and is now available`;
        try {
            await mailer.sendEmail(recipientEmail, subject, text);
            console.log('Timeslot notification sent');
        } catch (error) {
            console.error('Error in sending:', error);
        }
    }
}

module.exports = NotificationSender;