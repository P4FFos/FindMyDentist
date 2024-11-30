var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var path = require('path');
var cors = require('cors');
var history = require('connect-history-api-fallback');
var methodOverride = require('method-override');

// Variables
var port = process.env.PORT || 3004;

// Import routes
var patientController = require('./controller/patients.js');

// MongoDB URI
const mongoURI = 'mongodb://localhost:27017/FindMyDentistDevelopmentDB';

// Connect to MongoDB
mongoose.connect(mongoURI).catch(function (err) {
    console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
    console.error(err.stack);
    process.exit(1);
}).then(function () {
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);
});

// Create Express app
var app = express();

// Parse requests of content-type 'application/json'
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// HTTP request logger
app.use(morgan('dev'));

// Enable cross-origin resource sharing for frontend must be registered before api
app.options('*', cors());
app.use(cors());

// Looks for X-HTTP-Method-Override header in requests
app.use(methodOverride('X-HTTP-Method-Override'));

// Import routes
app.use(patientController);

// Parse requests of content-type 'application/json'
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get('/api', function (req, res) {
    res.json({'message': 'Welcome to the FindMyDentist!'});
});

// Catch all non-error handler for api (i.e., 404 Not Found)
app.use('/api/*', function (req, res) {
    res.status(404).json({'message': 'Not Found'});
});

// Configuration for serving frontend in production mode
// Support Vue.js HTML 5 history mode
app.use(history());

// Serve static assets
var root = path.normalize(__dirname + '/..');
var client = path.join(root, 'client', 'dist');
app.use(express.static(client));

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

// Start server
app.listen(port, function (err) {
    if (err) throw err;
    console.log(`Patient listening on port ${port}, in ${env} mode`);
    console.log(`Backend: http://localhost:${port}/api/`);
    console.log(`Frontend (production): http://localhost:${port}/`);
});

module.exports = app;
