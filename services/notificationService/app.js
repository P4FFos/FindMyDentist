var express = require('express');
var bodyParser = require('body-parser');
var database = require('../../database/database.js');

// Variables
var port = process.env.PORT || 3001;

// Import routes
var notificationsController = require('./controller/notifications.js');
const notificationsHandler = require('./service/NotificationHandler.js');
const notificationsSender = require ('./service/NotificationSender.js')

// Initialize databases
(async () => {
    await database.initConnections();

    // Push DB to controllers
    notificationsController.setDatabase(database.getCurrentDB());
    
    // console.log(`Controller database updated with ${database.getCurrentDB()}`);
    database.dbEvents.on('dbSwitch', (newDB) => {
        console.log('Database switched. Updating controller...');
        notificationsController.setDatabase(newDB);
    });
})();

// Create Express app
var app = express();

// Use body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
app.use(notificationsController);
app.use(notificationsHandler);
app.use(notificationsSender);

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

app.listen(port, function(err) {
    if (err) throw err;
    console.log(`Notification Service listening on port ${port}, in ${env} mode`);
    console.log(`Backend: http://localhost:${port}/api/`);
    console.log(`Frontend (production): http://localhost:${port}/`);
});

module.exports = app;
