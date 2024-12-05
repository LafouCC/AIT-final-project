//code based on the official documentation: https://huggingface.co/docs/transformers.js/main/en/api/models#cliptextmodelwithprojectionfrompretrained--code--code
import { MongoClient } from 'mongodb';
import { AutoProcessor, CLIPVisionModelWithProjection, RawImage } from '@huggingface/transformers';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const url = process.env.DSN; // The MongoDB connection string
const client = new MongoClient(url, { useUnifiedTopology: true });

async function processImages() {
    await client.connect();
    const db = client.db('final_project');
    const collection = db.collection('images');

    //load model
    const processor = await AutoProcessor.from_pretrained('Xenova/clip-vit-base-patch16');
    const vision_model = await CLIPVisionModelWithProjection.from_pretrained('Xenova/clip-vit-base-patch16');
    const documents = await collection.find().toArray();

    // process all images and encode them
    const processedDocuments = await Promise.all(documents.map(async (doc) => {
        const imageUrl = doc.url;

        try {
            const image = await RawImage.read(imageUrl); 
            const imageInputs = await processor(image); 
            const { image_embeds } = await vision_model(imageInputs); 
            const imageEmbed = Array.from(image_embeds.data);

            // Return the update query to be performed
            return {
                updateOne: {
                    filter: { _id: doc._id },
                    update: { $set: { imageEmbed: imageEmbed } }
                }
            };
        } catch (error) {
            console.error(`Error processing image ${doc._id}: ${error.message}`);
            return null; // If there's an error, return null to skip it
        }
    }));

    const validUpdates = processedDocuments.filter(update => update !== null);

    // Perform all valid updates in bulk
    if (validUpdates.length > 0) {
        await collection.bulkWrite(validUpdates);
    }

    console.log('Image encoding and embedding storage complete.');
    await client.close(); // Close the MongoDB client
}

async function createVectorSearchIndex() {
    await client.connect();
    const db = client.db('final_project');
    const collection = db.collection('images');
    const indexes = await collection.listIndexes().toArray();

    const indexExists = indexes.some(index => index.name === 'default');

    if (!indexExists) {
        console.log("Creating vector search index...");

        await collection.createSearchIndex({
            name: 'default',
            mappings: {
                dynamic: true,
                fields: {
                    imageEmbed: {
                        dimensions: 512,
                        similarity: 'cosine',
                        type: 'knnVector',
                    },
                },
            },
        });

        console.log("Done.");
    } else {
        console.log("Vector search index already exists.");
    }

    await client.close();
}

// Run the functions
createVectorSearchIndex().catch(err => console.error('Error:', err));
processImages().catch(err => console.error('Error:', err));
