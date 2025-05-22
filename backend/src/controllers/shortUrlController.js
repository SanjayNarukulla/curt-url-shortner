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

const getClientIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.connection.remoteAddress ||
    req.socket?.remoteAddress ||
    "0.0.0.0"
  );
};

// 🎯 POST /api/urls - Create Short URL
export const createShortUrl = async (req, res) => {
  const { url, customUrl } = req.body;

  // Double-check validation (in case express-validator missed anything)
  if (!isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    // If a custom URL is provided, check if it's already in use
    if (customUrl) {
      const existingCustomUrl = await urlSchema.findOne({
        short_url: customUrl,
      });

      if (existingCustomUrl) {
        return res.status(400).json({
          error: "This custom URL is already taken. Please choose another one.",
        });
      }
    }

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

    // 🆕 Generate or use custom short URL
    const shortUrl = customUrl || nanoid(7);
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
    const shortCode = req.params.shortUrl;
    const url = await urlSchema.findOne({ short_url: shortCode });

    if (!url) {
      return res.status(404).send("URL not found");
    }

    // 🔎 Extract IP and fetch geolocation data
    const ip = getClientIp(req);

    let geo = {};
    try {
      const geoRes = await axios.get(`http://ip-api.com/json/${ip}`);
      const { city, regionName: region, country } = geoRes.data;
      geo = { ip, city, region, country };
    } catch (geoErr) {
      console.error("Geolocation API failed:", geoErr.message);
      geo = { ip, city: "Unknown", region: "Unknown", country: "Unknown" };
    }

    // 📝 Push click details
    url.clicks += 1;
    url.clickDetails.push(geo);
    await url.save();

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
