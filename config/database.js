var mongoose = require('mongoose');

const mongoURI = process.env.DATABASE_URL || 'mongodb://localhost:27017/FindMyDentistDevelopmentDB';

// Connect to MongoDB
const connectToDatabase = async () => {
    mongoose.connect(mongoURI).catch(function(err) {
        console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
        console.error(err.stack);
        process.exit(1);
    }).then(function() {
        console.log(`Connected to MongoDB with URI: ${mongoURI}`); // mistake when forward porting
    });
};

module.exports = { connectToDatabase };
