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
        console.log(`Connected to backup MongoDB Database with URI: ${backupDBURI}`);
    } catch (error) {
        console.error(`Failed to connect to backup MongoDB with URI: ${backupDBURI}`);
    }

    if (!mainDB || !backupDB) {
        throw new Error('One or more databases are not initialized for synchronization.');
    } else{
        // Sync backupDB with mainDB
        await syncDatabase(backupDB);
    }

};

// Copy data from current active database
const syncDatabase = async (database) => {
    try {

        // Get all collections
        const collections = await currentDB.listCollections();

        for (const { name } of collections) {
            const backupCollection = database.collection(name);

            // Store the documents (in an array) from the collection of the main database
            const documents = await currentDB.collection(name).find({}).toArray();

            // Clean/remove all documents from the collection of the backup database
            await backupCollection.deleteMany({});
            if (documents.length) {
                // Insert the documents into the backup Collection
                await backupCollection.insertMany(documents);
            }

            console.log(`Synchronized collection: ${name}`);
        }

        console.log(`${database.name} successfully synchronized.`);
        startHeartbeat();
    } catch (error) {
        console.error(`${database.name} synchronization failed: ${error.message}`);
    }
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
                console.log(`Main database is still available`) // For testing/monitoring purposes
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