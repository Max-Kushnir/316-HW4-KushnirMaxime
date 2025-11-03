/*
    This is our http api, which we use to send requests to
    our back-end API. Note we`re using the Axios library
    for doing this, which is an easy to use AJAX-based
    library. We could (and maybe should) use Fetch, which
    is a native (to browsers) standard, but Axios is easier
    to use when sending JSON back and forth and it`s a Promise-
    based API which helps a lot with asynchronous communication.
    
    @author McKilla Gorilla
*/

const BASE_URL = 'http://localhost:4000/store';

const request = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
        const error = new Error('Request failed');
        error.response = { data, status: response.status };
        throw error;
    }

    return { data, status: response.status };
};

// THESE ARE ALL THE REQUESTS WE`LL BE MAKING, ALL REQUESTS HAVE A
// REQUEST METHOD (like get) AND PATH (like /top5list). SOME ALSO
// REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// WORK, AND SOME REQUIRE DATA, WHICH WE WE WILL FORMAT HERE, FOR WHEN
// WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// CUSTOM FILTERS FOR QUERIES
export const createPlaylist = (newListName, newSongs, userEmail) => {
    return request('/playlist/', {
        // SPECIFY THE PAYLOAD
        method: 'POST',
        body: JSON.stringify({
            name: newListName,
            songs: newSongs,
            ownerEmail: userEmail
        })
    });
};

export const deletePlaylistById = (id) => {
    return request(`/playlist/${id}`, {
        method: 'DELETE'
    });
};

export const getPlaylistById = (id) => request(`/playlist/${id}`);
export const getPlaylistPairs = () => request('/playlistpairs/');
export const updatePlaylistById = (id, playlist) => {
    return request(`/playlist/${id}`, {
        // SPECIFY THE PAYLOAD
        method: 'PUT',
        body: JSON.stringify({
            playlist : playlist
        })
    });
};

const apis = {
    createPlaylist,
    deletePlaylistById,
    getPlaylistById,
    getPlaylistPairs,
    updatePlaylistById
}

export default apis
