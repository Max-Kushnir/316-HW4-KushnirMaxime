const DatabaseManager = require('../DatabaseManager');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Import Mongoose models
const User = require('../../models/user-model');
const Playlist = require('../../models/playlist-model');

/**
 * MongoDB Database Manager
 * Implements all database operations using Mongoose ODM
 */
class MongoDBManager extends DatabaseManager {
    constructor() {
        super();
        this.connection = null;
    }

    async connect() {
        try {
            await mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true });
            this.connection = mongoose.connection;
            console.log('MongoDB connected successfully');
            return this.connection;
        } catch (error) {
            console.error('MongoDB connection error:', error.message);
            throw error;
        }
    }

    async disconnect() {
        await mongoose.disconnect();
    }

    async initialize() {
        return this.connect();
    }

    // User operations
    async findUserById(id) {
        return await User.findOne({ _id: id });
    }

    async findUserByEmail(email) {
        return await User.findOne({ email: email });
    }

    async createUser(userData) {
        const newUser = new User(userData);
        return await newUser.save();
    }

    async addPlaylistToUser(userId, playlistId) {
        const user = await User.findOne({ _id: userId });
        if (user) {
            user.playlists.push(playlistId);
            await user.save();
        }
        return user;
    }

    // Playlist operations
    async findPlaylistById(id) {
        return await Playlist.findById({ _id: id });
    }

    async findPlaylistsByOwnerEmail(email) {
        return await Playlist.find({ ownerEmail: email });
    }

    async findAllPlaylists() {
        return await Playlist.find({});
    }

    async createPlaylist(playlistData) {
        const playlist = new Playlist(playlistData);
        return await playlist.save();
    }

    async updatePlaylist(id, playlistData) {
        const playlist = await Playlist.findOne({ _id: id });
        if (playlist) {
            if (playlistData.name !== undefined) {
                playlist.name = playlistData.name;
            }
            if (playlistData.songs !== undefined) {
                playlist.songs = playlistData.songs;
            }
            await playlist.save();
        }
        return playlist;
    }

    async deletePlaylist(id) {
        return await Playlist.findOneAndDelete({ _id: id });
    }

    // Helper methods
    getUserId(user) {
        return user._id;
    }

    getPlaylistId(playlist) {
        return playlist._id;
    }
}

module.exports = MongoDBManager;
