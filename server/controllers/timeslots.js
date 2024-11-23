var express = require('express');
var router = express.Router();

const Timeslot = require('../models/timeslot');
const mqttPublicationCenter = require('../mqtt/publicationCenter');

/*
    TODO:
    implement database interactions for each endpoint using schemas defined in the models;
    Fix error handling accordingly( change if statements);
*/

//-----------------------------------------------------------------GET-------------------------------------------------------------------------------//

// Get all timeslots
router.get('/api/v1/timeslots', async function (req, res, next) {
    try {
        let timeslots = await Timeslot.find();
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
router.get('/api/v1/timeslots/available', async function (req, res, next) {
    try {
        var timeslots = await Timeslot.find({ isBooked: false });
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

// Get all unavailable timeslots
router.get('/api/v1/timeslots/unavailable', async function (req, res, next) {
    try {
        var timeslots = await Timeslot.find({ isBooked: true });
        mqttPublicationCenter.publishMessage('timeslots/unavailable/response', JSON.stringify({
            status: 'success',
            message: 'Unavailable timeslots fetched successfully',
            timeslots
        }));
        res.status(200).json({
            "message": "Timeslots fetched successfully",
            "timeslots": timeslots
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
router.post('/api/v1/timeslots', async function (req, res, next) {
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

router.delete('/api/v1/timeslots', async function (req, res, next) {
    try {
        await Timeslot.collection.drop();
        return res.json({ "message": "Timeslots deleted" });
    } 
    catch (err) {
        return next(err);
    }

});


module.exports = router;
