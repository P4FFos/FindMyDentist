const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
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

// Show a specific patient
router.get('/api/v1/patients/:email', async function (req, res, next) {
    try {
        const patient = await Patient.findOne({ email: req.params.email });
        if (!patient) {
            return res.status(404).json({ "message": "Patient with given email cannot be found" });
        }
        res.status(200).json(patient);
    } catch (error) {
        return next(error);
    }
});

// Login patient
router.post('/api/v1/patients/', async function (req, res, next) {
    try {
        const patient = await Patient.findOne({ email: req.body.email });
        if (!patient) {
            return res.status(404).json({ "message": "Patient with given email cannot be found" });
        }

        const isMatch = await bcrypt.compare(req.body.password, patient.password);
        if (!isMatch) {
            return res.status(401).json({ "message": "Invalid password" });
        }

        res.status(200).json({ "message": "Login successful" });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;