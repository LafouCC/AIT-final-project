import mongoose, { Schema } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });
mongoose.connect(process.env.DSN);

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store hashed password
  preference: [{ type: String }], // List of tags or embeddings for preference
  recommendedImages: [{ type: Schema.Types.ObjectId, ref: 'Image' }] // References to Image documents
});
  
const ImageSchema = new Schema({
  url: { type: String, required: true }, // S3 URL link
  tags: [{ type: String }], // List of tags for the image
  createdBy: { type: String, required: true }, // Author of the image
  lora: [{ type: Schema.Types.ObjectId, ref: 'Lora' }], // References to LoRA model(s) used
  createdAt: { type: Date, default: Date.now } // Additional metadata
});
  
const LoraSchema = new Schema({
  url: { type: String, required: true }, // URL link to where the LoRA model is stored
  createdBy: { type: String, required: true }, // Creator of the model
  description: { type: String }, // Description of the model
  createdAt: { type: Date, default: Date.now } // Metadata for model creation date
});
  
const User = mongoose.model('User', UserSchema);
const Image = mongoose.model('Image', ImageSchema);
const Lora = mongoose.model('Lora', LoraSchema);

export { User, Image, Lora };