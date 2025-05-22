import mongoose from "mongoose";

const clickDetailSchema = new mongoose.Schema({
  ip: String,
  city: String,
  region: String,
  country: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const urlSchema = new mongoose.Schema({
  full_url: {
    type: String,
    required: true,
  },
  short_url: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  clicks: {
    type: Number,
    required: true,
    default: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  clickDetails: [clickDetailSchema], // Add this to store geolocation info
});

const shortUrl = mongoose.model("shortUrl", urlSchema);

export default shortUrl;
