var express = require('express');
var router = express.Router();

const Timeslot = require('../models/timeslot');
const mqttPublicationCenter = require('../mqtt/publicationCenter');

/*
    TODO:
    implement database interactions for each endpoint using schemas defined in the models;
    Fix error handling accordingly( change if statements);
*/

// Get all available timeslots
router.get('/api/timeslots/available', async function (req, res, next) {

    try {
        var timeslots = ['12:30', '16:30', '17:50'];
        mqttPublicationCenter.publishMessage('timeslots/available/response', JSON.stringify({
            status: 'success',
            message: 'Available timeslots fetched successfully',
            timeslots
        }));
        res.status(200).json({
            "message": "Timeslots fetched successfully",
            "timeslots": timeslots
        });
    } catch(error) {
      mqttPublicationCenter.publishMessage('timeslots/available/response', JSON.stringify({
          status: 'success',
          message: 'Server error',
          error: error.message
      }));
      return next(error);
    }
});

module.exports = router;
