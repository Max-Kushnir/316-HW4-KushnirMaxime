const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

// Initialize Sequelize with PostgreSQL connection
const sequelize = new Sequelize(
    process.env.PG_DATABASE,
    process.env.PG_USER,
    process.env.PG_PASSWORD,
    {
        host: process.env.PG_HOST,
        port: process.env.PG_PORT,
        dialect: 'postgres',
        logging: false
    }
);

// Import model definitions
const UserModel = require('./user-model-sequelize');
const PlaylistModel = require('./playlist-model-sequelize');
const SongModel = require('./song-model-sequelize');

// Initialize models
const User = UserModel(sequelize);
const Playlist = PlaylistModel(sequelize);
const Song = SongModel(sequelize);

// Define associations
User.hasMany(Playlist, { foreignKey: 'userId', as: 'playlists' });
Playlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Playlist.hasMany(Song, { foreignKey: 'playlistId', as: 'songs' });
Song.belongsTo(Playlist, { foreignKey: 'playlistId', as: 'playlist' });

module.exports = {
    sequelize,
    User,
    Playlist,
    Song
};
