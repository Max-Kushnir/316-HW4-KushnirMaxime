const dotenv = require('dotenv');
dotenv.config();

/**
 * Database Manager Factory
 * Loads the appropriate database implementation based on DB_TYPE environment variable
 */
function getDatabaseManager() {
    const dbType = process.env.DB_TYPE || 'mongodb';

    if (dbType === 'mongodb') {
        const MongoDBManager = require('./mongodb');
        return new MongoDBManager();
    } else if (dbType === 'postgresql') {
        const PostgreSQLManager = require('./postgresql');
        return new PostgreSQLManager();
    } else {
        throw new Error(`Unsupported database type: ${dbType}`);
    }
}

module.exports = getDatabaseManager();
