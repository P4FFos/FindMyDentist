var express = require('express');
var router = express.Router();

const Appointment = require('../models/appointment');
const mqttPublicationCenter = require('../mqtt/publicationCenter');

/*
    TODO:
    implement database interactions for each endpoint using schemas defined in the models;
    Fix error handling accordingly( change if statements);
*/

// Book an appointment
router.post('/api/v1/appointments/booking', async function (req, res, next) {
    const { patient, timeslotId, email: recipientEmail } = req.body;

    try{
      if(!patient){
        res.status(404).json({"message": "Cannot book for a null patient"});
      }
      if(!timeslotId){
        res.status(404).json({"message": "Cannot book for a null timeslot"});
      }
      const appointment = {
        patient: patient,
        timeslot: timeslotId,
        isBooked: true
      };

      // Publish the appointment booking response
      mqttPublicationCenter.publishMessage('patients/book/response', JSON.stringify({
          status: 'success',
          message: 'Appointment booked successfully',
          recipientEmail,
          appointment
      }));

      res.status(201).json({"message": `Patient ${patient} booked appointment for timeslot ${timeslotId}`});
    } catch (error) {
      mqttPublicationCenter.publishMessage('patients/book/response', JSON.stringify({
          status: 'error',
          message: 'Server error',
          error: error.message
      }));
      return next(error);
    }
});

// Cancel an appointment
router.delete('/api/v1/appointments/booking/:appointmentId', async function (req, res, next) {
    const appointmentId = req.params.appointmentId;
    const recipientEmail = req.body.email;

    try {
        // Appointment cancellation booking response
        mqttPublicationCenter.publishMessage('patients/cancel/response', JSON.stringify({
            status: 'success',
            message: `appointment ${appointmentId} cancelled successfully`, recipientEmail, appointmentId
        }));
        res.status(200).json({"message": `Appointment ${appointmentId} cancelled`});
    } catch (error) {
        mqttPublicationCenter.publishMessage('patients/cancel/response', JSON.stringify({
            status: 'error',
            message: 'Server error',
            error: error.message
        }));
    }
});

module.exports = router;
