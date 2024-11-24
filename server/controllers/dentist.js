const express = require('express');
const router = express.Router();
const Dentist = require('../models/dentist.js');
const Patient = require('../models/patient.js');

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

module.exports = router;