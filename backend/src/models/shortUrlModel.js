import mongoose from "mongoose";

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
  analytics: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    referrer: String,
    userAgent: String,
    ipAddress: String,
    country: String,
    city: String,
    device: String,
    browser: String,
    os: String
  }],
  qrCode: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const shortUrl = mongoose.model("shortUrl", urlSchema);

export default shortUrl;
