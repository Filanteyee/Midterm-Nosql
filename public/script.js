const content = document.getElementById('content');

// Fetch data from the server
async function fetchData(endpoint) {
    try {
        const response = await fetch(`http://localhost:3000/api/${endpoint}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        alert('An error occurred while fetching data. Please try again.');
    }
}

// Function to handle search functionality
async function findByName(endpoint, query) {
    try {
        const response = await fetch(`http://localhost:3000/api/${endpoint}/search?name=${query}`);
        if (response.ok) {
            const results = await response.json();

            // Update the content with search results
            const content = document.getElementById('content');
            content.innerHTML = `
                <h2>Search Results</h2>
                <ul>
                    ${results.map(result => {
                        if (endpoint === 'songs') {
                            return `<li>${result.title} by ${result.artist || 'Unknown Artist'} (Album: ${result.album || 'Unknown Album'})</li>`;
                        } else if (endpoint === 'artists') {
                            return `<li>${result.name} (${result.country || 'Unknown Country'})</li>`;
                        } else if (endpoint === 'albums') {
                            return `<li>${result.title} by ${result.artist || 'Unknown Artist'} (Year: ${result.release_year || 'Unknown Year'})</li>`;
                        }
                        return `<li>${result.name}</li>`; // Default case
                    }).join('')}
                </ul>
                <button onclick="show${capitalize(endpoint)}()" class="btn">Back</button>
            `;
        } else {
            alert('No results found');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while searching. Please try again.');
    }
}

// Capitalize the first letter of a string
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Display songs
async function showSongs() {
    const songs = await fetchData('songs');
    if (!songs || songs.length === 0) {
        content.innerHTML = '<p>No songs found.</p>';
        return;
    }

    content.innerHTML = `
        <h2>Songs</h2>
        <form id="search-songs-form">
            <input type="text" id="search-songs-query" placeholder="Search for a song">
            <button type="submit" class="btn">Find</button>
        </form>
        <ul>
            ${songs.map(song => `
                <li>${song.title} by ${song.artist || 'Unknown Artist'} (Album: ${song.album || 'Unknown Album'})</li>
            `).join('')}
        </ul>
    `;

    document.getElementById('search-songs-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const query = document.getElementById('search-songs-query').value;
        findByName('songs', query);
    });
}

// Display artists
async function showArtists() {
    const artists = await fetchData('artists');
    if (!artists || artists.length === 0) {
        content.innerHTML = '<p>No artists found.</p>';
        return;
    }

    content.innerHTML = `
        <h2>Artists</h2>
        <form id="search-artists-form">
            <input type="text" id="search-artists-query" placeholder="Search for an artist">
            <button type="submit" class="btn">Find</button>
        </form>
        <ul>
            ${artists.map(artist => `
                <li>${artist.name} (${artist.country || 'Unknown Country'})</li>
            `).join('')}
        </ul>
    `;

    document.getElementById('search-artists-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const query = document.getElementById('search-artists-query').value;
        findByName('artists', query);
    });
}

// Display albums
async function showAlbums() {
    const albums = await fetchData('albums');
    if (!albums || albums.length === 0) {
        content.innerHTML = '<p>No albums found.</p>';
        return;
    }

    content.innerHTML = `
        <h2>Albums</h2>
        <form id="search-albums-form">
            <input type="text" id="search-albums-query" placeholder="Search for an album">
            <button type="submit" class="btn">Find</button>
        </form>
        <ul>
            ${albums.map(album => `
                <li>${album.title} by ${album.artist || 'Unknown Artist'} (Year: ${album.release_year})</li>
            `).join('')}
        </ul>
    `;

    document.getElementById('search-albums-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const query = document.getElementById('search-albums-query').value;
        findByName('albums', query);
    });
}

// Display playlists
async function showPlaylists() {
    const playlists = await fetchData('playlists');
    if (!playlists || playlists.length === 0) {
        content.innerHTML = '<p>No playlists found.</p>';
        return;
    }

    content.innerHTML = `
        <h2>Playlists</h2>
        <button id="create-playlist-button" class="btn">Create New Playlist</button>
        <ul>
            ${playlists.map(playlist => `
                <li>
                    <strong>${playlist.name}</strong>
                    <button onclick="togglePlaylistSongs('${playlist._id}')" class="btn">Show Songs</button>
                    <button onclick="addSongToPlaylist('${playlist._id}')" class="btn">Add Song</button>
                    <button onclick="deletePlaylist('${playlist._id}')" class="btn btn-delete">Delete Playlist</button>
                    <div id="playlist-songs-${playlist._id}" class="playlist-songs" style="display: none;">
                        <ul>
                            ${
                                Array.isArray(playlist.songs) && playlist.songs.length > 0 
                                ? playlist.songs.map(song => `
                                    <li>${song} <button onclick="deleteSongFromPlaylist('${playlist._id}', '${song}')" class="btn btn-delete">Remove</button></li>
                                `).join('') 
                                : '<li>No songs in this playlist.</li>'
                            }
                        </ul>
                    </div>
                </li>
            `).join('')}
        </ul>
        <div id="playlist-form-container" style="display:none;">
            <h3>Create New Playlist</h3>
            <form id="playlist-form">
                <input type="text" id="playlist-name" placeholder="Playlist Name" required>
                <button type="submit" class="btn">Create Playlist</button>
            </form>
        </div>
        <div id="add-song-container" style="display:none;">
            <h3>Add Song to Playlist</h3>
            <form id="add-song-form">
                <label for="song-name">Enter Song Name:</label>
                <input type="text" id="song-name" placeholder="e.g., Billie Jean" required>
                <button type="submit" class="btn">Add Song</button>
            </form>
        </div>
    `;

    document.getElementById('create-playlist-button').addEventListener('click', () => {
        document.getElementById('playlist-form-container').style.display = 'block';
    });

    document.getElementById('playlist-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('playlist-name').value;
        await fetch('http://localhost:3000/api/playlists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, songs: [] }),
        });
        showPlaylists();
    });
}

function togglePlaylistSongs(playlistId) {
    const playlistSongsDiv = document.getElementById(`playlist-songs-${playlistId}`);
    playlistSongsDiv.style.display = playlistSongsDiv.style.display === 'none' ? 'block' : 'none';
}

async function addSongToPlaylist(playlistId) {
    const addSongContainer = document.getElementById('add-song-container');
    addSongContainer.style.display = 'block';

    document.getElementById('add-song-form').onsubmit = async (event) => {
        event.preventDefault();
        const songName = document.getElementById('song-name').value;
        const playlist = await fetch(`http://localhost:3000/api/playlists/${playlistId}`).then(res => res.json());
        const updatedSongs = [...playlist.songs, songName];
        await fetch(`http://localhost:3000/api/playlists/${playlistId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ songs: updatedSongs }),
        });
        addSongContainer.style.display = 'none';
        showPlaylists();
    };
}

async function deleteSongFromPlaylist(playlistId, songName) {
    const playlist = await fetch(`http://localhost:3000/api/playlists/${playlistId}`).then(res => res.json());
    const updatedSongs = playlist.songs.filter(song => song !== songName);
    await fetch(`http://localhost:3000/api/playlists/${playlistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songs: updatedSongs }),
    });
    showPlaylists();
}

async function deletePlaylist(id) {
    await fetch(`http://localhost:3000/api/playlists/${id}`, { method: 'DELETE' });
    showPlaylists();
}

document.getElementById('songs-button').onclick = showSongs;
document.getElementById('artists-button').onclick = showArtists;
document.getElementById('albums-button').onclick = showAlbums;
document.getElementById('playlists-button').onclick = showPlaylists;
