const dotenv = require('dotenv').config({ path: __dirname + '/../../../.env' });

async function clearTable(model, tableName) {
    try {
        await model.destroy({ where: {}, truncate: true, cascade: true });
        console.log(tableName + " cleared");
    }
    catch (err) {
        console.log(err);
    }
}

async function fillTable(model, tableName, data) {
    for (let i = 0; i < data.length; i++) {
        await model.create(data[i]);
    }
    console.log(tableName + " filled");
}

async function resetPostgres() {
    const { Playlist, User, Song } = require('../../../models');
    const testData = require("../example-db-data.json");

    console.log("Resetting the Postgres DB");

    // Clear tables in correct order (due to foreign keys)
    await clearTable(Song, "Song");
    await clearTable(Playlist, "Playlist");
    await clearTable(User, "User");

    // Fill users (without playlist references for PostgreSQL)
    for (let i = 0; i < testData.users.length; i++) {
        const userData = {
            firstName: testData.users[i].firstName,
            lastName: testData.users[i].lastName,
            email: testData.users[i].email,
            passwordHash: testData.users[i].passwordHash
        };
        await User.create(userData);
    }
    console.log("User filled");

    // Fill playlists and their songs
    for (let i = 0; i < testData.playlists.length; i++) {
        const playlistData = testData.playlists[i];

        // Find the user by email to get their ID
        const user = await User.findOne({ where: { email: playlistData.ownerEmail } });

        // Create playlist
        const playlist = await Playlist.create({
            name: playlistData.name,
            ownerEmail: playlistData.ownerEmail,
            userId: user.id
        });

        // Create songs for this playlist
        if (playlistData.songs && playlistData.songs.length > 0) {
            for (let j = 0; j < playlistData.songs.length; j++) {
                await Song.create({
                    title: playlistData.songs[j].title,
                    artist: playlistData.songs[j].artist,
                    year: playlistData.songs[j].year,
                    youTubeId: playlistData.songs[j].youTubeId,
                    playlistId: playlist.id
                });
            }
        }
    }
    console.log("Playlist filled");
    console.log("Song filled");
}

const { sequelize } = require('../../../models');

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection established successfully');
        return sequelize.sync({ force: false });
    })
    .then(() => resetPostgres())
    .then(() => {
        console.log('Database reset complete');
        process.exit(0);
    })
    .catch(e => {
        console.error('Connection error', e.message);
        process.exit(1);
    });