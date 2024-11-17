import { MongoClient } from 'mongodb';
import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config({ path: 'final-project-LafouCC/.env' });

// MongoDB Connection
async function connectToMongo() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error("Mongo URI not found in environment variables!");
    }
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db('final_project'); // Assuming the database name is 'final_project'
    return db;
}

// Insert images data into MongoDB
async function insertImagesToMongo(imagesRaw) {
    const db = await connectToMongo();
    const imagesCollection = db.collection('images');
    const imagesFiltered = imagesRaw.filter(image => image.nsfw === '0').slice(0, 1000); // Filter and limit to 1000 samples

    for (const row of imagesFiltered) {
        try {
            const imageDoc = {
                url: row.url,
                id: parseInt(row.id),
                imageEmbed: [], // Placeholder for image embeddings
                username: row.username,
                width: parseInt(row.width),
                height: parseInt(row.height),
                nsfw: false,
                tags: JSON.parse(row.tags), // string to an array
            };
            await imagesCollection.insertOne(imageDoc);
        } catch (error) {
            console.error(`Error processing row ${row.id}: ${error}`);
        }
    }
}

// Read CSV file and process data
function readCsvAndInsert() {
    const imagesRaw = [];

    // Read CSV data
    fs.createReadStream('images_with_tags.csv')
        .pipe(csv())
        .on('data', (row) => {
            imagesRaw.push(row);
        })
        .on('end', async () => {
            try {
                await insertImagesToMongo(imagesRaw);
                console.log("Data import complete.");
            } catch (error) {
                console.error("Error importing data:", error);
            }
        });
}

readCsvAndInsert();
