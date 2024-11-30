var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Variables
var port = process.env.PORT || 3005;

// Import routes
var timeslotsController = require('./controller/timeslots.js');

// MongoDB URI
const mongoURI = 'mongodb://localhost:27017/FindMyDentistDevelopmentDB';

// Connect to MongoDB
mongoose.connect(mongoURI).catch(function(err) {
    console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
    console.error(err.stack);
    process.exit(1);
}).then(function() {
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);
});

// Create Express app
var app = express();

// Use body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
app.use(timeslotsController);

// Parse requests of content-type 'application/json'
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Error handler (i.e., when exception is thrown) must be registered last
var env = app.get('env');

// eslint-disable-next-line no-unused-vars
app.use(function(err, req, res, next) {
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

// Start server
app.listen(port, function(err) {
    if (err) throw err;
    console.log(`Timeslots listening on port ${port}, in ${env} mode`);
    console.log(`Backend: http://localhost:${port}/api/`);
    console.log(`Frontend (production): http://localhost:${port}/`);
});

module.exports = app;
