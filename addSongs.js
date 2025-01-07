import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';

// MongoDB connection
const mongoUri = "mongodb://localhost:27017"; // Убедитесь, что MongoDB запущен
const client = new MongoClient(mongoUri);
const dbName = "music_library"; // Имя базы данных
const collectionName = "songs"; // Имя коллекции

// Spotify API credentials
const accessToken = "BQCIGmuRdBqkUW6QArMQyiL0Y4wZEHNKhw4Ik6JcFv3PwpLoQ5nhwqLGT7qBYA4XeTqy60KJXEaYsrupPnVEDBo2BiZ2GhAaYaPadAXsyZmHo6XeOVnz31zr03bVa6pOrLy6zh5iHU6i6l7IkXdyXFjOTzFl-mwifWbbNWDM5mmz_jL93ZAI9RfDLdTn6JfDTBqxx4eqKz-tCufFvhP2wClEgNkYVyxBcVlNNA"; // Вставьте ваш Access Token сюда

// Function to get tracks from Spotify
async function getSpotifyTracks(offset = 0, limit = 50) {
    const response = await fetch(`https://api.spotify.com/v1/search?q=track&type=track&limit=${limit}&offset=${offset}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const data = await response.json();
    if (data.tracks && data.tracks.items) {
        return data.tracks.items.map(track => ({
            title: track.name,
            artist: track.artists.map(artist => artist.name).join(", "),
            album: track.album.name,
            duration: track.duration_ms / 1000, // В секундах
            genre: "Unknown", // Spotify не предоставляет жанр в этом запросе
            spotify_url: track.external_urls.spotify,
        }));
    } else {
        console.error("Error fetching tracks:", data);
        return [];
    }
}

// Function to insert tracks into MongoDB
async function insertTracksIntoMongo(tracks) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Insert tracks into the collection
        const result = await collection.insertMany(tracks);
        console.log(`Inserted ${result.insertedCount} tracks into MongoDB.`);
    } catch (error) {
        console.error("Error inserting tracks into MongoDB:", error);
    } finally {
        await client.close();
    }
}

// Main function to fetch and store 1000 tracks
async function main() {
    const tracks = [];
    const batchSize = 50; // Spotify API ограничивает 50 элементов за запрос
    let offset = 0;

    console.log("Fetching tracks from Spotify...");

    // Fetch 1000 tracks in batches
    while (tracks.length < 1000) {
        const fetchedTracks = await getSpotifyTracks(offset, batchSize);
        if (fetchedTracks.length === 0) break; // Если больше нет данных, выходим из цикла

        tracks.push(...fetchedTracks);
        offset += batchSize;

        console.log(`Fetched ${tracks.length} tracks so far...`);

        // Spotify API ограничивает количество запросов, избегаем перегрузки
        await new Promise(resolve => setTimeout(resolve, 1000)); // Задержка 1 секунда между запросами
    }

    console.log(`Fetched ${tracks.length} tracks in total.`);
    console.log("Inserting tracks into MongoDB...");

    // Insert into MongoDB
    await insertTracksIntoMongo(tracks);

    console.log("Done!");
}

// Run the main function
main().catch(console.error);
