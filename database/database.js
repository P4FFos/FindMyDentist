const mongoose = require('mongoose');

var mainDBURI = process.env.DATABASE_URL || 'mongodb://localhost:27017/FindMyDentistDevelopmentDB';
var backupDBURI = process.env.BACKUP_DATABASE_URL || 'mongodb://localhost:27017/FindMyDentistBackupDB';

// MongoDB connections
let mainDB = null;
let backupDB = null;
let currentDB = null;

// Connect to MongoDB
const initConnections = async () => {
    // Connect to main DB
    try {
        mainDB = await mongoose.createConnection(mainDBURI);
        console.log(`Connected to main MongoDB Database with URI: ${mainDBURI}`);
        currentDB = mainDB;
    } catch (error) {
        console.error(`Failed to connect to main MongoDB with URI: ${mainDBURI}`);
        console.error(err.stack);
        process.exit(1);
    }

    // Connect to backup DB
    try {
        backupDB = await mongoose.createConnection(backupDBURI);
        if (mainDB){
            console.log(`Backup MongoDB Database with URI: ${backupDBURI} is connected and on standby`);
        } else {
            console.log(`Connected to backup MongoDB Database with URI: ${backupDBURI}`);
        }

    } catch (error) {
        console.error(`Failed to connect to backup MongoDB with URI: ${backupDBURI}`);
    }

    if (!mainDB || !backupDB) {
        throw new Error('One or more databases are not initialized for synchronization.');
    }

    startHeartbeat();
};

// Heartbeat check
const heartbeatCheck = async () => {
    try {
        if (mainDB) {
            await mainDB.db.admin().ping(); // Ping main database if it's available
            if (currentDB !== mainDB) {
                syncDatabase(mainDB);
                currentDB = mainDB;
                console.log(`Main database is back online. Switching to Main.`);
            } else{
                //console.log(`Main database is still available`) // For testing/monitoring/logging purposes
            }
        }
    } catch (error) {
        console.error(`Main database unavailable. Switching to Backup.`);
        currentDB = backupDB;
    }
};

// Ping every 5 seconds
const startHeartbeat = () => {
    setInterval(heartbeatCheck, 5000);
};

const getCurrentDB = () => {
    if (!currentDB) {
        throw new Error('Database not initialized yet!');
    }
    return currentDB;
};

module.exports = {
    initConnections,
    getCurrentDB
};    