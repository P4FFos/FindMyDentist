const mongoose = require('mongoose');

// Environment variables for database URIs
const mainDBURI = process.env.DATABASE_URL || 'mongodb://localhost:27017/FindMyDentistDevelopmentDB';
const backupDBURI = process.env.BACKUP_DATABASE_URL || 'mongodb://localhost:27017/FindMyDentistBackupDB';

// Database connections
let mainDB = null;
let backupDB = null;

// Initialize the service
const init = async () => {
    try {
        // Connect to the main database
        mainDB = await mongoose.createConnection(mainDBURI);
        console.log(`Connected to main database: ${mainDBURI}`);

        // Connect to the backup database
        backupDB = await mongoose.createConnection(backupDBURI);
        console.log(`Connected to backup database: ${backupDBURI}`);
        if (!mainDB || !backupDB){

        } else{
            await syncDatabase();
            startRealTimeSync();
        }
    } catch (error) {
        console.error('Error initializing sync service:', error.message);
        process.exit(1); // Exit the process on failure
    }
};

// Function to synchronize databases
const syncDatabase = async () => {
    try {
        const collections = await mainDB.listCollections();

        for (const { name } of collections) {
            const mainCollection = mainDB.collection(name);
            const backupCollection = backupDB.collection(name);

            // Fetch all documents from the main collection
            const documents = await mainCollection.find({}).toArray();

            // Clean/remove all documents from the backup collection
            await backupCollection.deleteMany({});

            if (documents.length) {
                await backupCollection.insertMany(documents);
            }

            console.log(`Synchronized collection: ${name}`);
        }

        console.log(`Database synchronization completed.`);
    } catch (error) {
        console.error(`Error during database synchronization: ${error.message}`);
    }
};

// Function to start real-time synchronization
const startRealTimeSync = async (interval = 5000) => {
    console.log('Starting real-time sync service...');
    setInterval(async () => {
        try {
            const collections = await mainDB.listCollections();

            for (const { name } of collections) {
                const mainCollection = backupDB.collection(name);
                const backupCollection = backupDB.collection(name);

                // Fetch all documents from the main collection
                const documents = await mainCollection.find({}).toArray();

                for (const doc of documents) {
                    // Upsert each document: update if exists, insert if not
                    await backupCollection.updateOne(
                        { _id: doc._id },
                        { $set: doc },
                        { upsert: true } // Insert if it doesn't exist
                    );
                }
                // console.log(`Synchronized collection: ${name}`); // For logging/debugging
            }
        } catch (error) {
            console.error('Error during real-time sync polling:', error);
        }
    }, interval);
};

if (require.main === module) {
    init();
}

module.exports = {
    syncDatabase,
    startRealTimeSync,
};
