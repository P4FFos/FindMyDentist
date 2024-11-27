var express = require('express');
var router = express.Router();

const Appointment = require('../models/appointment');
const mqttPublicationCenter = require('../mqtt/publicationCenter');
const Timeslot = require("../models/timeslot");

// Book an appointment
router.post('/api/v1/dentists/:dentistID/appointments/booking', async function (req, res, next) {
    var dentistID = req.params.dentistID;
    const { patient, timeslotId, email: recipientEmail } = req.body;

    try{
      if(!patient){
        res.status(404).json({"message": "Cannot book for a null patient"});
      }
      if(!timeslotId){
        res.status(404).json({"message": "Cannot book for a null timeslot"});
      }

      const timeslot = await Timeslot.findById(timeslotId);
      if (!timeslot) {
          return res.status(404).json({ "message": "Timeslot not found" });
      }
      timeslot.isBooked = true;
      await timeslot.save();

      const appointment = new Appointment( {
        dentistId: dentistID,
        patient: patient,
        timeslot: timeslotId,
        isBooked: true
      });
      await appointment.save();

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

// Get all patient appointment
router.get('/api/v1/patients/:patientID/appointments/booking', async function (req, res, next) {
    var patientID = req.params.patientID;
    try {
        var appointments = await Appointment.find({patient: patientID});
        res.status(200).json(appointments);
    } catch (error) {
        return next(error);
    }
});

// Cancel an appointment
router.delete('/api/v1/dentists/:dentistID/appointments/booking/:appointmentId', async function (req, res, next) {
    var dentistID = req.params.dentistID;
    const appointmentId = req.params.appointmentId;
    const recipientEmail = req.body.email;

    try {
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ "message": "Appointment not found" });
        }

        const timeslot = await Timeslot.findById(appointment.timeslot);
        if (timeslot) {
            timeslot.isBooked = false;
            await timeslot.save();
        }

        await Appointment.findByIdAndDelete(appointmentId);

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
