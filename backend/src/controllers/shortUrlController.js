import { nanoid } from "nanoid";
import urlSchema from "../models/shortUrlModel.js";

// ✅ Better internal URL validation using URL API
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

// 🎯 POST /api/urls - Create Short URL
export const createShortUrl = async (req, res) => {
  const { url } = req.body;

  // Double-check validation (in case express-validator missed anything)
  if (!isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    // 🔍 Check if user already shortened the same URL
    const existing = await urlSchema.findOne({
      full_url: url,
      user: req.user.id,
    });

    if (existing) {
      return res.status(200).json({
        fullUrl: existing.full_url,
        shortUrl: `${process.env.BASE_URL}/${existing.short_url}`,
        createdAt: existing.createdAt,
      });
    }

    // 🆕 Generate new short URL
    const shortUrl = nanoid(7);
    const newUrl = new urlSchema({
      full_url: url,
      short_url: shortUrl,
      user: req.user.id,
    });

    const savedUrl = await newUrl.save();

    res.status(201).json({
      fullUrl: savedUrl.full_url,
      shortUrl: `${process.env.BASE_URL}/${savedUrl.short_url}`,
      createdAt: savedUrl.createdAt,
    });
  } catch (error) {
    console.error("Create URL Error:", error.message);
    res.status(500).send("Server Error");
  }
};

// 🔁 GET /:shortUrl - Redirect to original URL and increment clicks
export const redirectToFullUrl = async (req, res) => {
  try {
    const url = await urlSchema.findOne({ short_url: req.params.shortUrl });

    if (!url) {
      return res.status(404).send("URL not found");
    }

    // Increment the click count
    url.clicks += 1;
    await url.save();

    // Redirect to the full URL
    return res.redirect(url.full_url);
  } catch (error) {
    console.error("Redirect Error:", error.message);
    res.status(500).send("Server Error");
  }
};


// 📋 GET /api/urls - Get all URLs for a user
export const getUserUrls = async (req, res) => {
  try {
    const urls = await urlSchema
      .find({ user: req.user.id })
      .sort({ createdAt: -1 });

    const baseUrl = process.env.BASE_URL; // e.g. "http://localhost:5000/"

    const urlsWithFullShortUrl = urls.map((url) => ({
      ...url.toObject(),
      short_url: baseUrl + url.short_url, // append short code to base URL
    }));

    res.status(200).json(urlsWithFullShortUrl);
  } catch (error) {
    console.error("Fetch URLs Error:", error.message);
    res.status(500).send("Server Error");
  }
};


// 🗑 DELETE /:id - Delete a URL by ID
export const deleteUrl = async (req, res) => {
  try {
    const url = await urlSchema.findById(req.params.id);

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    // 🔐 Ensure user owns the URL
    if (url.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await url.deleteOne();
    res.status(200).json({ message: "URL deleted" });
  } catch (error) {
    console.error("Delete URL Error:", error.message);
    res.status(500).send("Server Error");
  }
};
