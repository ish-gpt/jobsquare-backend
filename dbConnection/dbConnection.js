const { MongoClient } = require('mongodb');

let dbInstance = null;

async function connectToDb() {
    try {
        if (!dbInstance) {
            const url = 'mongodb://localhost:27017';
            const client = new MongoClient(url);

            await client.connect();
            console.log("Connected to MongoDB");
            dbInstance = client.db('jobsquare-backend');
        } else {
            return dbInstance;
        }
    } catch (error) {
        console.log("error-occured", error);
    }
}

function getInstance() {
    try {
        if (!dbInstance) {
            throw new error('Db instance not found or it is not created properly')
        }
        return dbInstance;
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    connectToDb, getInstance
}