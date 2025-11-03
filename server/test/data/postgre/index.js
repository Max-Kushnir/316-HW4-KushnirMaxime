const dotenv = require('dotenv').config({ path: __dirname + '/../../../.env' });

async function clearTable(model, tableName) {
    try {
        await model.destroy({ where: {}, truncate: true });
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
    const { Playlist, User } = require('../../../models');
    const testData = require("../example-db-data.json");

    console.log("Resetting the Postgres DB");
    await clearTable(Playlist, "Playlist");
    await clearTable(User, "User");
    await fillTable(User, "User", testData.users);
    await fillTable(Playlist, "Playlist", testData.playlists);
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