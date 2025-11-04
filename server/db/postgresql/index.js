const DatabaseManager = require('../DatabaseManager');
const { sequelize, User, Playlist, Song } = require('../../models/sequelize-index');

/**
 * PostgreSQL Database Manager
 * Implements all database operations using Sequelize ORM
 */
class PostgreSQLManager extends DatabaseManager {
    constructor() {
        super();
        this.sequelize = sequelize;
        this.User = User;
        this.Playlist = Playlist;
        this.Song = Song;
    }

    async connect() {
        try {
            await this.sequelize.authenticate();
            console.log('PostgreSQL connected successfully');
            return this.sequelize;
        } catch (error) {
            console.error('PostgreSQL connection error:', error.message);
            throw error;
        }
    }

    async disconnect() {
        await this.sequelize.close();
    }

    async initialize() {
        await this.connect();
        // Sync models with database (create tables if they don't exist)
        await this.sequelize.sync({ alter: false });
        return this.sequelize;
    }

    // User operations
    async findUserById(id) {
        return await this.User.findByPk(id);
    }

    async findUserByEmail(email) {
        return await this.User.findOne({ where: { email: email } });
    }

    async createUser(userData) {
        return await this.User.create(userData);
    }

    async addPlaylistToUser(userId, playlistId) {
        // In PostgreSQL, the relationship is managed via foreign key in Playlist table
        // So this is a no-op, but we return the user for consistency
        const user = await this.User.findByPk(userId);
        return user;
    }

    // Playlist operations
    async findPlaylistById(id) {
        return await this.Playlist.findByPk(id, {
            include: [{
                model: this.Song,
                as: 'songs'
            }]
        });
    }

    async findPlaylistsByOwnerEmail(email) {
        return await this.Playlist.findAll({
            where: { ownerEmail: email },
            include: [{
                model: this.Song,
                as: 'songs'
            }]
        });
    }

    async findAllPlaylists() {
        return await this.Playlist.findAll({
            include: [{
                model: this.Song,
                as: 'songs'
            }]
        });
    }

    async createPlaylist(playlistData) {
        const { songs, ...playlistFields } = playlistData;

        // Create the playlist first
        const playlist = await this.Playlist.create(playlistFields);

        // Then create songs if they exist
        if (songs && songs.length > 0) {
            const songsToCreate = songs.map(song => ({
                ...song,
                playlistId: playlist.id
            }));
            await this.Song.bulkCreate(songsToCreate);
        }

        // Return playlist with songs
        return await this.findPlaylistById(playlist.id);
    }

    async updatePlaylist(id, playlistData) {
        const playlist = await this.Playlist.findByPk(id);

        if (playlist) {
            // Update playlist fields
            if (playlistData.name !== undefined) {
                playlist.name = playlistData.name;
            }
            await playlist.save();

            // Update songs if provided
            if (playlistData.songs !== undefined) {
                // Delete existing songs
                await this.Song.destroy({ where: { playlistId: id } });

                // Create new songs
                if (playlistData.songs.length > 0) {
                    const songsToCreate = playlistData.songs.map(song => ({
                        ...song,
                        playlistId: id
                    }));
                    await this.Song.bulkCreate(songsToCreate);
                }
            }
        }

        // Return updated playlist with songs
        return await this.findPlaylistById(id);
    }

    async deletePlaylist(id) {
        // Delete associated songs first
        await this.Song.destroy({ where: { playlistId: id } });

        // Then delete the playlist
        const playlist = await this.Playlist.findByPk(id);
        if (playlist) {
            await playlist.destroy();
        }
        return playlist;
    }

    // Helper methods
    getUserId(user) {
        return user.id;
    }

    getPlaylistId(playlist) {
        return playlist.id;
    }
}

module.exports = PostgreSQLManager;
