var database = require('../../database/database.js');

// Database connections
let mainDB = null;
let backupDB = null;
let currentDB = null;

// Initialize the service
const init = async () => {
    try {
        await database.initConnections();
        setDatabases();
        if (!mainDB || !backupDB){

        } else{
            await syncDatabase(mainDB, backupDB);
            startRealTimeSync();
        }
    
        database.dbEvents.on('dbSwitch', (newDB) => {
            console.log('Database switched. Updating controller...');
            currentDB = newDB;
            if (currentDB != backupDB) {
                syncDatabase(backupDB, mainDB);
            }
        });

    } catch (error) {
        console.error('Error initializing sync service:', error.message);
        process.exit(1); // Exit the process on failure
    }
};

const setDatabases = () => {
    mainDB  = database.getMainDB();
    backupDB = database.getBackupDB();
    currentDB = database.getCurrentDB();
};

// Function to synchronize databases
const syncDatabase = async (sourceDB, targetDB) => {
    try {
        const collections = await sourceDB.listCollections();

        for (const { name } of collections) {
            const sourceCollection = sourceDB.collection(name);
            const targetupCollection = targetDB.collection(name);

            // Fetch all documents from the main collection
            const documents = await sourceCollection.find({}).toArray();

            // Clean/remove all documents from the backup collection
            await targetupCollection.deleteMany({});

            if (documents.length) {
                await targetupCollection.insertMany(documents);
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
                const mainCollection = mainDB.collection(name);
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
                console.log(`Synchronized collection: ${name}`); // For logging/debugging
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
