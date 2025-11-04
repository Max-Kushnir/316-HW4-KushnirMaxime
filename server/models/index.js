/**
 * Models export file
 * Exports either Mongoose or Sequelize models based on DB_TYPE environment variable
 */
const dotenv = require('dotenv');
dotenv.config();

const dbType = process.env.DB_TYPE || 'mongodb';

if (dbType === 'postgresql') {
    // Export Sequelize models
    const { sequelize, User, Playlist, Song } = require('./sequelize-index');
    module.exports = { sequelize, User, Playlist, Song };
} else {
    // Export Mongoose models
    const User = require('./user-model');
    const Playlist = require('./playlist-model');
    module.exports = { User, Playlist };
}
