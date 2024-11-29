const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Patient = require('../model/patient.js');
const Dentist = require('../../dentist/model/dentist.js');

// create specific patient
router.post('/api/v1/patients', async function (req, res, next) {
    try {
        const existingPatientEmail = await Patient.findOne({ email: req.body.email });
        // const existingDentistEmail = await Dentist.findOne({ email: req.body.email });

        if (existingPatientEmail /*|| existingDentistEmail*/) {
            return res.status(409).json({ "message": "Patient Account with this email already exists" });
        }

        const patient = new Patient(req.body);
        await patient.save();
        res.status(201).json(patient);
    } catch (error) {
        return next(error);
    }
});

// get specific patient
router.get('/api/v1/patients/:patientID', async function(req, res, next) {
    var patientID = req.params.patientID;
    try {
        var patient = await Patient.findById(patientID);
        if (!patient) {
            return res.status(404).json({"message": "Patient not found"});
        }
        res.status(200).json(patient);
    } catch (error) {
        return next(error);
    }
});

// get all patients
router.get('/api/v1/patients', async function (req, res, next) {
    var patients;
    try {
        patients = await Patient.find();
        if (!patients) {
            return res.status(404).json({ "message": "Patient account with this email does not exist" });
        }
    } catch (error) {
        return next(error);
    }
    res.json(patients);
});

// delete specific patient
router.delete('/api/v1/patients/:patientID', async function (req, res, next) {
    var patientID = req.params.patientID;
    try {
        var patient = await Patient.findByIdAndDelete(patientID);
        if (!patient) {
            return res.status(404).json({ "message": "Patient with the provided ID does not exist." });
        }
        res.json(patient);
    } catch (error) {
        return next(error);
    }
});

// delete all patients
router.delete('/api/v1/patients', async function (req, res, next) {
    try {
        await Patient.deleteMany({});
        res.json({message: 'All patients accounts deleted successfully'});
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
