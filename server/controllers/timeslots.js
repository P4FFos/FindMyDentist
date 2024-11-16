var express = require('express');
var router = express.Router();

const Timeslot = require('../models/timeslot');
const mqtt = require('../mqtt-config');

/*
    TODO:
    implement database interactions for each endpoint using schemas defined in the models;
    Fix error handling accordingly( change if statements);
*/

// Get all available timeslots
router.post('/api/timeslots/available', async function (req, res, next) {
    try {
      mqtt.publish('patients/timeslots/available', JSON.stringify({ status: 'success', message: 'Available timeslots fetched successfully', appointment }));
      res.status(200).json({"message": "Timeslots fetched successfully"});
    } catch(error) {
      mqtt.publish('patients/book/response', JSON.stringify({ status: 'error', message: 'Server error', error: error.message }));
      return next(error);
    }
});

module.exports = router;
