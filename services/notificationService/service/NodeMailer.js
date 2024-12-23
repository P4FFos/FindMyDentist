const nodemailer = require('nodemailer');

class NodeMailer {
    // Constructor to initialize the transporter
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: '356findmydentist@gmail.com',
                pass: 'znbo dvcz uvay vawc'
            }
        });
    }

    // Function to send email
    async sendEmail(to, subject, text) {
        const mailOptions = {
            from: '356findmydentist@gmail.com',
            to,
            subject,
            text
        };

        await this.transporter.sendMail(mailOptions);
    }
}

module.exports = NodeMailer;
