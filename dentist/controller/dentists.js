const express = require('express');
const router = express.Router();
const Dentist = require('../model/dentist.js');
const Patient = require('../../patient/model/patient.js');

// create specific dentist
router.post('/api/v1/dentists', async function (req, res, next) {
    try {
        const existingDentistEmail = await Dentist.findOne({ email: req.body.email });
        const existingPatientEmail = await Patient.findOne({ email: req.body.email });

        if (existingDentistEmail || existingPatientEmail) {
            return res.status(409).json({ "message": "Dentist Account with this email already exists" });
        }

        const dentist = new Dentist(req.body);
        await dentist.save();
        res.status(201).json(dentist);
    } catch (error) {
        return next(error);
    }
});

// get all dentists
router.get('/api/v1/dentists', async function (req, res, next) {
    var dentists;
    try {
        dentists = await Dentist.find();
        if (!dentists) {
            return res.status(404).json({ "message": "Dentist account with this email does not exist" });
        }
    } catch (error) {
        return next(error);
    }
    res.json(dentists);
});

// get specific dentist
router.get('/api/v1/dentists/:dentistID', async function(req, res, next) {
    var dentistID = req.params.dentistID;
    try {
        var dentist = await Dentist.findById(dentistID);
        if (!dentist) {
            return res.status(404).json({"message": "Dentist not found"});
        }
        res.status(200).json(dentist);
    } catch (error) {
        return next(error);
    }
});

// delete specific dentist
router.delete('/api/v1/dentists/:dentistID', async function (req, res, next) {
    var dentistID = req.params.dentistID;
    try {
        var dentist = await Dentist.findByIdAndDelete(dentistID);
        if (!dentist) {
            return res.status(404).json({ "message": "Dentist with the provided ID does not exist." });
        }
        res.json(dentist);
    } catch (error) {
        return next(error);
    }
});

// delete all dentists
router.delete('/api/v1/dentists', async function (req, res, next) {
    try {
        await Dentist.deleteMany({});
        res.json({message: 'All dentist accounts deleted successfully'});
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
