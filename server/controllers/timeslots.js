var express = require('express');
var router = express.Router();

const Timeslot = require('../models/timeslot');
const mqttPublicationCenter = require('../mqtt/publicationCenter');

//-----------------------------------------------------------------GET-------------------------------------------------------------------------------//

// Get all timeslots
router.get('/api/v1/dentists/:dentistID/timeslots', async function (req, res, next) {
    var dentistID = req.params.dentistID;
    try {
        let timeslots = await Timeslot.findById(dentistID);
        res.status(200).json({
            "message": "Timeslots fetched successfully",
            "timeslots": timeslots
        });
    }
    catch (err) {
        return next(err);
    }
});

// Get all available timeslots
router.get('/api/v1/dentists/:dentistID/timeslots/available', async function (req, res, next) {
    var dentistID = req.params.dentistID;
    try {
      var availableTimeslots = await Timeslot.find({
        dentistId: dentistID,
        isBooked: false
      });

      mqttPublicationCenter.publishMessage('timeslots/available/response', JSON.stringify({
        status: 'success',
        message: 'Available timeslots fetched successfully',
        availableTimeslots
      }));

      res.status(200).json({
        message: "Timeslots fetched successfully",
        timeslots: availableTimeslots
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

// Get all unavailable timeslots
router.get('/api/v1/dentists/:dentistID/timeslots/unavailable', async function (req, res, next) {
    var dentistID = req.params.dentistID;
    try {
        var unavailableTimeslots = await Timeslot.find({
            dentistId: dentistID,
            isBooked: true
        });
        mqttPublicationCenter.publishMessage('timeslots/unavailable/response', JSON.stringify({
            status: 'success',
            message: 'Unavailable timeslots fetched successfully',
            timeslots: unavailableTimeslots
        }));
        res.status(200).json({
            "message": "Timeslots fetched successfully",
            "timeslots": unavailableTimeslots
        });
    } catch(error) {
      mqttPublicationCenter.publishMessage('timeslots/unavailable/response', JSON.stringify({
          status: 'success',
          message: 'Server error',
          error: error.message
      }));
      return next(error);
    }
});


//-----------------------------------------------------------------POST-------------------------------------------------------------------------------//

//create a timeslot
router.post('/api/v1/dentists/:dentistID/timeslots', async function (req, res, next) {
    var dentistID = req.params.dentistID;
    let newTimeslot = new Timeslot(req.body);

    try {
        await newTimeslot.save();
        return res.status(201).json(newTimeslot);
    }
    catch (err) {
        return next(err);
    }
});


//-----------------------------------------------------------------PUT-------------------------------------------------------------------------------//

//-----------------------------------------------------------------PATCH-------------------------------------------------------------------------------//

//-----------------------------------------------------------------DELETE-------------------------------------------------------------------------------//

// Delete all timeslots
router.delete('/api/v1/dentists/:dentistID/timeslots', async function (req, res, next) {
    var dentistID = req.params.dentistID;
    try {
        await Timeslot.collection.drop();
        return res.json({ "message": "Timeslots deleted" });
    }
    catch (err) {
        return next(err);
    }

});


module.exports = router;
