/**
 * DatabaseManager - Base class defining the common interface for database operations
 * All database implementations (MongoDB, PostgreSQL) must extend this class
 * and implement all methods.
 */
class DatabaseManager {
    constructor() {
        if (new.target === DatabaseManager) {
            throw new TypeError("Cannot construct DatabaseManager instances directly");
        }
    }

    // Connection methods
    async connect() {
        throw new Error("Method 'connect()' must be implemented.");
    }

    async disconnect() {
        throw new Error("Method 'disconnect()' must be implemented.");
    }

    async initialize() {
        throw new Error("Method 'initialize()' must be implemented.");
    }

    // User operations
    async findUserById(id) {
        throw new Error("Method 'findUserById()' must be implemented.");
    }

    async findUserByEmail(email) {
        throw new Error("Method 'findUserByEmail()' must be implemented.");
    }

    async createUser(userData) {
        throw new Error("Method 'createUser()' must be implemented.");
    }

    async addPlaylistToUser(userId, playlistId) {
        throw new Error("Method 'addPlaylistToUser()' must be implemented.");
    }

    // Playlist operations
    async findPlaylistById(id) {
        throw new Error("Method 'findPlaylistById()' must be implemented.");
    }

    async findPlaylistsByOwnerEmail(email) {
        throw new Error("Method 'findPlaylistsByOwnerEmail()' must be implemented.");
    }

    async findAllPlaylists() {
        throw new Error("Method 'findAllPlaylists()' must be implemented.");
    }

    async createPlaylist(playlistData) {
        throw new Error("Method 'createPlaylist()' must be implemented.");
    }

    async updatePlaylist(id, playlistData) {
        throw new Error("Method 'updatePlaylist()' must be implemented.");
    }

    async deletePlaylist(id) {
        throw new Error("Method 'deletePlaylist()' must be implemented.");
    }

    // Helper method to get user ID from user object (handles MongoDB _id vs PostgreSQL id)
    getUserId(user) {
        throw new Error("Method 'getUserId()' must be implemented.");
    }

    getPlaylistId(playlist) {
        throw new Error("Method 'getPlaylistId()' must be implemented.");
    }
}

module.exports = DatabaseManager;
