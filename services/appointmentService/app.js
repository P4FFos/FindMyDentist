// Imports
var express = require('express');
var database = require('../../database/database.js');

// Variables
var port = process.env.PORT || 3006;

// Import routes
var appointmentBookingController = require('./controller/appointments.js');

// Initialize databases
(async () => {
    await database.initConnections();

    // Push DB to controllers
    appointmentBookingController.setDatabase(database.getCurrentDB());

    // Listen for database switch events
    // console.log(`Controller database updated with ${database.getCurrentDB()}`);
    database.dbEvents.on('dbSwitch', () => {
        console.log('Database switched. Updating controller...');
        appointmentBookingController.setDatabase(database.getCurrentDB());
    });
})();

// Create Express app
var app = express();

// Import routes
app.use(appointmentBookingController);

// Parse requests of content-type 'application/json'
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Error handler (i.e., when exception is thrown) must be registered last
var env = app.get('env');

// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
    console.error(err.stack);
    var err_res = {
        'message': err.message,
        'error': {}
    };
    if (env === 'development') {
        // Return sensitive stack trace only in dev mode
        err_res['error'] = err.stack;
    }
    res.status(err.status || 500);
    res.json(err_res);
});

// Start the server
app.listen(port, function (err) {
    if (err) throw err;
    console.log(`Appointments listening on port ${port}, in ${env} mode`);
    console.log(`Backend: http://localhost:${port}/api/`);
    console.log(`Frontend (production): http://localhost:${port}/`);
});

module.exports = app;
