const express = require('express');
const router = express.Router();
const Patient = require('../models/patient.js');

// create specific patient
router.post('/api/v1/patients', async function (req, res, next) {
    try {
        const existingPatientEmail = await Patient.findOne({ email: req.body.email });

        if (existingPatientEmail) {
            return res.status(409).json({ "message": "Patient with this email already exists" });
        }

        const patient = new Patient(req.body);
        await patient.save();
        res.status(201).json(patient);
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
            return res.status(404).json({ "message": "Patients do not exist" });
        }
    } catch (error) {
        return next(error);
    }
    res.json(patients);
});

module.exports = router;