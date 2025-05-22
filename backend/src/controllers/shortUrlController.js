import { nanoid } from "nanoid";
import axios from "axios";
import urlSchema from "../models/shortUrlModel.js";

// Utility: Validate URL format
const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

// Utility: Get client IP address
const getClientIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0] ||
  req.connection.remoteAddress ||
  req.socket?.remoteAddress ||
  "0.0.0.0";

// 📌 POST: Create a new short URL
export const createShortUrl = async (req, res) => {
  const { url, customUrl } = req.body;

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    if (customUrl) {
      const exists = await urlSchema.findOne({ short_url: customUrl });
      if (exists) {
        return res.status(400).json({ error: "Custom URL is already taken." });
      }
    }

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

    const shortUrl = customUrl || nanoid(7);
    const newUrl = await urlSchema.create({
      full_url: url,
      short_url: shortUrl,
      user: req.user.id,
    });

    res.status(201).json({
      fullUrl: newUrl.full_url,
      shortUrl: `${process.env.BASE_URL}/${newUrl.short_url}`,
      createdAt: newUrl.createdAt,
    });
  } catch (err) {
    console.error("❌ createShortUrl Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// 🔁 GET: Redirect to full URL + Track Clicks
export const redirectToFullUrl = async (req, res) => {
  try {
    const shortUrl = req.params.shortUrl;
    const urlData = await urlSchema.findOne({ short_url: shortUrl });

    if (!urlData) return res.status(404).send("URL not found");

    const ip = getClientIp(req);

    let geo = { ip, city: "Unknown", region: "Unknown", country: "Unknown" };
    try {
      const { data } = await axios.get(`http://ip-api.com/json/${ip}`);
      const { city, regionName: region, country } = data;
      geo = { ip, city, region, country };
    } catch (geoErr) {
      console.error("🌐 Geolocation fetch failed:", geoErr.message);
    }

    urlData.clicks++;
    urlData.clickDetails.push(geo);
    await urlData.save();

    res.redirect(urlData.full_url);
  } catch (err) {
    console.error("❌ redirectToFullUrl Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// 📋 GET: Fetch URLs created by the user
export const getUserUrls = async (req, res) => {
  try {
    const urls = await urlSchema
      .find({ user: req.user.id })
      .sort({ createdAt: -1 });

    const fullUrls = urls.map((url) => ({
      ...url.toObject(),
      short_url: `${process.env.BASE_URL}/${url.short_url}`,
    }));

    res.status(200).json(fullUrls);
  } catch (err) {
    console.error("❌ getUserUrls Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// 🗑 DELETE: Remove a short URL
export const deleteUrl = async (req, res) => {
  try {
    const url = await urlSchema.findById(req.params.id);

    if (!url) return res.status(404).json({ error: "URL not found" });
    if (url.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await url.deleteOne();
    res.status(200).json({ message: "URL deleted" });
  } catch (err) {
    console.error("❌ deleteUrl Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// 📊 GET: Get analytics for a specific short URL
export const getUrlAnalytics = async (req, res) => {
  try {
    const url = await urlSchema.findById(req.params.id);

    if (!url) return res.status(404).json({ error: "URL not found" });

    res.status(200).json({
      fullUrl: url.full_url,
      shortUrl: `${process.env.BASE_URL}/${url.short_url}`,
      clicks: url.clicks,
      clickDetails: url.clickDetails,
      createdAt: url.createdAt,
    });
  } catch (err) {
    console.error("❌ getUrlAnalytics Error:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
};
