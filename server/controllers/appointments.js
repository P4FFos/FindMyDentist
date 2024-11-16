var express = require('express');
var router = express.Router();

const Appointment = require('../models/appointment');
const mqtt = require('../mqtt-config');

/*
    The database related functionality will be implemented in later issues
*/

// Book an appointment
router.post('/api/appointments/booking', async function (req, res, next) {
    const { patient, timeslotId } = req.body;

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
      mqtt.publish('patients/book/response', JSON.stringify({ status: 'success', message: 'Appointment booked successfully', appointment }));
      res.status(201).json({"message": `Patient ${patient} booked appointment for timeslot ${timeslotId}`});
    } catch (error) {
      mqtt.publish('patients/book/response', JSON.stringify({ status: 'error', message: 'Server error', error: error.message }));
      return next(error);
    }
});

// // Cancel an appointment
// async function cancelAppointment(data) {
//   const { appointmentId } = data;

//   try {
//       mqtt.publish('patients/cancel/response', JSON.stringify({ status: 'success', message: `appointment ${appointmentId} cancelled successfully` }));
//   } catch (error) {
//       mqtt.publish('patients/cancel/response', JSON.stringify({ status: 'error', message: 'Server error', error: error.message }));
//   }
// }
