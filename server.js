import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose
  .connect('mongodb://localhost:27017/music_library')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// MongoDB Models
const Song = mongoose.model('Song', {
  title: String,
  artist: String,
  album: String,
  duration: Number,
  genre: String,
});

const Playlist = mongoose.model('Playlist', {
  name: String,
  songs: [String],
});

// Add missing models for Albums and Artists
const Album = mongoose.model('Album', {
  title: String,
  artist: String,
  release_year: Number,
});

const Artist = mongoose.model('Artist', {
  name: String,
  country: String,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// API Routes

// Fetch all songs
app.get('/api/songs', async (req, res) => {
    try {
        const songs = await Song.find(); // Fetch all songs from the database
        res.json(songs); // Send the songs as a JSON response
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch songs' });
    }
});

// Search Songs by Name
app.get('/api/songs/search', async (req, res) => {
    const { name } = req.query;
    try {
        const songs = await Song.find({ title: new RegExp(name, 'i') }); // Case-insensitive search
        res.json(songs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search songs' });
    }
});

// Fetch all albums
app.get('/api/albums', async (req, res) => {
    try {
        const albums = await Album.find(); // Fetch all albums from the database
        res.json(albums); // Send the albums as a JSON response
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch albums' });
    }
});

// Search Albums by Name
app.get('/api/albums/search', async (req, res) => {
    const { name } = req.query;
    try {
        const albums = await Album.find({ title: new RegExp(name, 'i') }); // Case-insensitive search
        res.json(albums);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search albums' });
    }
});

// Fetch all artists
app.get('/api/artists', async (req, res) => {
    try {
        const artists = await Artist.find(); // Fetch all artists from the database
        res.json(artists); // Send the artists as a JSON response
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch artists' });
    }
});

// Search Artists by Name
app.get('/api/artists/search', async (req, res) => {
    const { name } = req.query;
    try {
        const artists = await Artist.find({ name: new RegExp(name, 'i') }); // Case-insensitive search
        res.json(artists);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search artists' });
    }
});


// Fetch all playlists
app.get('/api/playlists', async (req, res) => {
  try {
    const playlists = await Playlist.find(); // Fetch all playlists
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

// Fetch a specific playlist by ID
app.get('/api/playlists/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const playlist = await Playlist.findById(id); // Find playlist by ID
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
});

// Create a new playlist
app.post('/api/playlists', async (req, res) => {
  const { name, songs } = req.body;
  try {
    const playlist = new Playlist({ name, songs });
    await playlist.save(); // Save playlist to the database
    res.status(201).json(playlist); // Respond with the created playlist
  } catch (error) {
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Update a playlist
app.put('/api/playlists/:id', async (req, res) => {
  const { id } = req.params;
  const { songs } = req.body;
  try {
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      id,
      { songs },
      { new: true } // Return the updated document
    );
    if (!updatedPlaylist) return res.status(404).json({ error: 'Playlist not found' });
    res.json(updatedPlaylist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update playlist' });
  }
});

// Delete a playlist
app.delete('/api/playlists/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPlaylist = await Playlist.findByIdAndDelete(id);
    if (!deletedPlaylist) return res.status(404).json({ error: 'Playlist not found' });
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
