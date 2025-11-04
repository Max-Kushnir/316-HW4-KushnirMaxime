import { beforeAll, afterAll, expect, test, describe } from 'vitest';
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../.env' });

// Import the DatabaseManager (will use DB_TYPE from .env)
const dbManager = require('../db');

/**
 * Vitest test script for the Playlister app's Database Manager.
 * Tests work with both MongoDB and PostgreSQL based on DB_TYPE in .env
 *
 * Tests one case per DatabaseManager method:
 *  - Connection methods: connect, initialize
 *  - User operations: findUserById, findUserByEmail, createUser, addPlaylistToUser
 *  - Playlist operations: findPlaylistById, findPlaylistsByOwnerEmail, findAllPlaylists,
 *                        createPlaylist, updatePlaylist, deletePlaylist
 *  - Helper methods: getUserId, getPlaylistId
 */

let testUserId = null;
let testPlaylistId = null;

/**
 * Executed once before all tests are performed.
 */
beforeAll(async () => {
    console.log(`\n=== Testing with ${process.env.DB_TYPE} ===\n`);
    await dbManager.initialize();
});

/**
 * Executed once after all tests are performed.
 */
afterAll(async () => {
    await dbManager.disconnect();
});

describe('Database Connection Tests', () => {
    test('Test #1) Initialize database connection', async () => {
        // Connection already initialized in beforeAll
        // Just verify dbManager exists
        expect(dbManager).toBeDefined();
    });
});

describe('User Operations Tests', () => {
    test('Test #2) Create a User', async () => {
        const testUser = {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@vitest.com',
            passwordHash: '$2a$10$testHashForVitestUser'
        };

        const createdUser = await dbManager.createUser(testUser);
        testUserId = dbManager.getUserId(createdUser);

        expect(createdUser).toBeDefined();
        expect(createdUser.firstName).toBe('Test');
        expect(createdUser.lastName).toBe('User');
        expect(createdUser.email).toBe('test@vitest.com');
        expect(testUserId).toBeDefined();
    });

    test('Test #3) Find User by ID', async () => {
        const foundUser = await dbManager.findUserById(testUserId);

        expect(foundUser).toBeDefined();
        expect(foundUser.firstName).toBe('Test');
        expect(foundUser.lastName).toBe('User');
        expect(foundUser.email).toBe('test@vitest.com');
    });

    test('Test #4) Find User by Email', async () => {
        const foundUser = await dbManager.findUserByEmail('test@vitest.com');

        expect(foundUser).toBeDefined();
        expect(foundUser.firstName).toBe('Test');
        expect(foundUser.lastName).toBe('User');
        expect(dbManager.getUserId(foundUser)).toBe(testUserId);
    });

    test('Test #5) Get User ID helper method', async () => {
        const user = await dbManager.findUserById(testUserId);
        const userId = dbManager.getUserId(user);

        expect(userId).toBe(testUserId);
    });
});

describe('Playlist Operations Tests', () => {
    test('Test #6) Create a Playlist', async () => {
        const testPlaylist = {
            name: 'Test Playlist',
            ownerEmail: 'test@vitest.com',
            userId: testUserId,
            songs: [
                {
                    title: 'Test Song 1',
                    artist: 'Test Artist',
                    year: 2024,
                    youTubeId: 'testId123'
                },
                {
                    title: 'Test Song 2',
                    artist: 'Another Artist',
                    year: 2023,
                    youTubeId: 'testId456'
                }
            ]
        };

        const createdPlaylist = await dbManager.createPlaylist(testPlaylist);
        testPlaylistId = dbManager.getPlaylistId(createdPlaylist);

        expect(createdPlaylist).toBeDefined();
        expect(createdPlaylist.name).toBe('Test Playlist');
        expect(createdPlaylist.ownerEmail).toBe('test@vitest.com');
        expect(testPlaylistId).toBeDefined();
    });

    test('Test #7) Add Playlist to User', async () => {
        const updatedUser = await dbManager.addPlaylistToUser(testUserId, testPlaylistId);

        expect(updatedUser).toBeDefined();
    });

    test('Test #8) Find Playlist by ID', async () => {
        const foundPlaylist = await dbManager.findPlaylistById(testPlaylistId);

        expect(foundPlaylist).toBeDefined();
        expect(foundPlaylist.name).toBe('Test Playlist');
        expect(foundPlaylist.ownerEmail).toBe('test@vitest.com');
    });

    test('Test #9) Find Playlists by Owner Email', async () => {
        const playlists = await dbManager.findPlaylistsByOwnerEmail('test@vitest.com');

        expect(playlists).toBeDefined();
        expect(Array.isArray(playlists)).toBe(true);
        expect(playlists.length).toBeGreaterThan(0);

        const testPlaylist = playlists.find(p =>
            dbManager.getPlaylistId(p).toString() === testPlaylistId.toString()
        );
        expect(testPlaylist).toBeDefined();
        expect(testPlaylist.name).toBe('Test Playlist');
    });

    test('Test #10) Find All Playlists', async () => {
        const allPlaylists = await dbManager.findAllPlaylists();

        expect(allPlaylists).toBeDefined();
        expect(Array.isArray(allPlaylists)).toBe(true);
        expect(allPlaylists.length).toBeGreaterThan(0);
    });

    test('Test #11) Update Playlist', async () => {
        const updatedData = {
            name: 'Updated Test Playlist',
            songs: [
                {
                    title: 'Updated Song',
                    artist: 'Updated Artist',
                    year: 2025,
                    youTubeId: 'updatedId789'
                }
            ]
        };

        const updatedPlaylist = await dbManager.updatePlaylist(testPlaylistId, updatedData);

        expect(updatedPlaylist).toBeDefined();
        expect(updatedPlaylist.name).toBe('Updated Test Playlist');
    });

    test('Test #12) Get Playlist ID helper method', async () => {
        const playlist = await dbManager.findPlaylistById(testPlaylistId);
        const playlistId = dbManager.getPlaylistId(playlist);

        expect(playlistId.toString()).toBe(testPlaylistId.toString());
    });

    test('Test #13) Delete Playlist', async () => {
        const deletedPlaylist = await dbManager.deletePlaylist(testPlaylistId);

        expect(deletedPlaylist).toBeDefined();

        // Verify it's deleted by trying to find it
        const foundPlaylist = await dbManager.findPlaylistById(testPlaylistId);
        expect(foundPlaylist).toBeNull();
    });
});

// Note: We don't test disconnect() here as it's called in afterAll
