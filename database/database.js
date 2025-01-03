const mongoose = require('mongoose');

var mainDBURI = process.env.DATABASE_URL || 'mongodb://localhost:27017/FindMyDentistDevelopmentDB';

// MongoDB connections
let mainDB = null;
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