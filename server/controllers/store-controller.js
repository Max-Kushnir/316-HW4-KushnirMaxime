const dbManager = require('../db');
const auth = require('../auth')

createPlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const body = req.body;
    console.log("createPlaylist body: " + JSON.stringify(body));
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a Playlist',
        })
    }

    try {
        const playlist = await dbManager.createPlaylist(body);
        console.log("playlist: " + JSON.stringify(playlist));

        const user = await dbManager.findUserById(req.userId);
        console.log("user found: " + JSON.stringify(user));

        const playlistId = dbManager.getPlaylistId(playlist);
        const userId = dbManager.getUserId(user);
        await dbManager.addPlaylistToUser(userId, playlistId);

        return res.status(201).json({
            playlist: playlist
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            errorMessage: 'Playlist Not Created!'
        })
    }
}

deletePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("delete Playlist with id: " + JSON.stringify(req.params.id));
    console.log("delete " + req.params.id);

    try {
        const playlist = await dbManager.findPlaylistById(req.params.id);
        console.log("playlist found: " + JSON.stringify(playlist));

        if (!playlist) {
            return res.status(404).json({
                errorMessage: 'Playlist not found!',
            })
        }

        // DOES THIS LIST BELONG TO THIS USER?
        const user = await dbManager.findUserByEmail(playlist.ownerEmail);
        const userId = dbManager.getUserId(user);
        console.log("user._id: " + userId);
        console.log("req.userId: " + req.userId);

        if (userId == req.userId) {
            console.log("correct user!");
            await dbManager.deletePlaylist(req.params.id);
            return res.status(200).json({});
        }
        else {
            console.log("incorrect user!");
            return res.status(400).json({
                errorMessage: "authentication error"
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(404).json({
            errorMessage: 'Playlist not found!',
        })
    }
}

getPlaylistById = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("Find Playlist with id: " + JSON.stringify(req.params.id));

    try {
        const list = await dbManager.findPlaylistById(req.params.id);

        if (!list) {
            return res.status(400).json({ success: false, error: "Playlist not found" });
        }

        console.log("Found list: " + JSON.stringify(list));

        // DOES THIS LIST BELONG TO THIS USER?
        const user = await dbManager.findUserByEmail(list.ownerEmail);
        const userId = dbManager.getUserId(user);
        console.log("user._id: " + userId);
        console.log("req.userId: " + req.userId);

        if (userId == req.userId) {
            console.log("correct user!");
            return res.status(200).json({ success: true, playlist: list })
        }
        else {
            console.log("incorrect user!");
            return res.status(400).json({ success: false, description: "authentication error" });
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, error: err });
    }
}

getPlaylistPairs = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("getPlaylistPairs");

    try {
        const user = await dbManager.findUserById(req.userId);
        console.log("find user with id " + req.userId);

        const email = user.email;
        console.log("find all Playlists owned by " + email);

        const playlists = await dbManager.findPlaylistsByOwnerEmail(email);
        console.log("found Playlists: " + JSON.stringify(playlists));

        if (!playlists) {
            console.log("!playlists");
            return res
                .status(404)
                .json({ success: false, error: 'Playlists not found' })
        }

        console.log("Send the Playlist pairs");
        // PUT ALL THE LISTS INTO ID, NAME PAIRS
        let pairs = [];
        for (let key in playlists) {
            let list = playlists[key];
            let listId = dbManager.getPlaylistId(list);
            let pair = {
                _id: listId,
                name: list.name
            };
            pairs.push(pair);
        }
        return res.status(200).json({ success: true, idNamePairs: pairs })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, error: err })
    }
}

getPlaylists = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }

    try {
        const playlists = await dbManager.findAllPlaylists();

        if (!playlists || playlists.length === 0) {
            return res
                .status(404)
                .json({ success: false, error: `Playlists not found` })
        }
        return res.status(200).json({ success: true, data: playlists })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, error: err })
    }
}

updatePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const body = req.body
    console.log("updatePlaylist: " + JSON.stringify(body));
    console.log("req.body.name: " + req.body.name);

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        })
    }

    try {
        const playlist = await dbManager.findPlaylistById(req.params.id);
        console.log("playlist found: " + JSON.stringify(playlist));

        if (!playlist) {
            return res.status(404).json({
                message: 'Playlist not found!',
            })
        }

        // DOES THIS LIST BELONG TO THIS USER?
        const user = await dbManager.findUserByEmail(playlist.ownerEmail);
        const userId = dbManager.getUserId(user);
        console.log("user._id: " + userId);
        console.log("req.userId: " + req.userId);

        if (userId == req.userId) {
            console.log("correct user!");
            console.log("req.body.name: " + req.body.name);

            const updatedPlaylist = await dbManager.updatePlaylist(req.params.id, {
                name: body.playlist.name,
                songs: body.playlist.songs
            });

            console.log("SUCCESS!!!");
            const listId = dbManager.getPlaylistId(updatedPlaylist);
            return res.status(200).json({
                success: true,
                id: listId,
                message: 'Playlist updated!',
            })
        }
        else {
            console.log("incorrect user!");
            return res.status(400).json({ success: false, description: "authentication error" });
        }
    } catch (error) {
        console.log("FAILURE: " + JSON.stringify(error));
        return res.status(404).json({
            error,
            message: 'Playlist not updated!',
        })
    }
}

module.exports = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    getPlaylists,
    updatePlaylist
}
