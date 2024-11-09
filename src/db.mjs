import mongoose, { Schema } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });
mongoose.connect(process.env.DSN);

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store hashed password
  queryEmbed: { type: [Number] }, // Embedding for the last text query input
  preference: { type: [String] }, // Tags from the favoriteImages, use to recommend images with similar tags
  favoriteImages: [{ type: Schema.Types.ObjectId, ref: 'Image' }] // References to Image documents
});
  
const ImageSchema = new Schema({
  url: { type: String, required: true }, // S3 URL link
  id: { type: Number, required: true }, // Unique ID for the image
  tags: { type: [String] }, // List of tags for the image
  imageEmbed: { type: [Number], required: true }, // Embedding for the image
  username: { type: String, required: true }, // Author of the image
  width: { type: Number, required: true }, // Image width
  height: { type: Number, required: true }, // Image height
  nsfw: { type: Boolean, default: false }, // NSFW flag, default is false
  // lora: [{ type: Schema.Types.ObjectId, ref: 'Lora' }], // References to LoRA model(s) used
});
  
// const LoraSchema = new Schema({
//   url: { type: String, required: true }, // URL link to where the LoRA model is stored
//   createdBy: { type: String, required: true }, // Creator of the model
//   description: { type: String }, // Description of the model
//   createdAt: { type: Date, default: Date.now } // Metadata for model creation date
// });
  
const User = mongoose.model('User', UserSchema);
const Image = mongoose.model('Image', ImageSchema);
// const Lora = mongoose.model('Lora', LoraSchema);

export { User, Image };