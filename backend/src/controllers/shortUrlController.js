import { nanoid } from "nanoid";
import urlSchema from "../models/shortUrlModel.js";
import QRCode from "qrcode";
import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";

// ✅ Better internal URL validation using URL API
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

// Helper function to get real IP address
function getClientIP(req) {
  // Check for proxy headers first
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // Get the first IP in the list (client IP)
    return forwardedFor.split(',')[0].trim();
  }

  // Check for other proxy headers
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return realIP;
  }

  // Get direct IP
  const remoteAddr = req.socket.remoteAddress;
  if (remoteAddr) {
    // Handle IPv6 addresses
    if (remoteAddr.includes('::ffff:')) {
      return remoteAddr.split('::ffff:')[1];
    }
    return remoteAddr;
  }

  return null;
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
        qrCode: existing.qrCode
      });
    }

    // 🆕 Generate new short URL
    const shortUrl = nanoid(7);
    const shortUrlFull = `${process.env.BASE_URL}/${shortUrl}`;
    
    // Generate QR Code
    const qrCode = await QRCode.toDataURL(shortUrlFull);

    const newUrl = new urlSchema({
      full_url: url,
      short_url: shortUrl,
      user: req.user.id,
      qrCode: qrCode
    });

    const savedUrl = await newUrl.save();

    res.status(201).json({
      fullUrl: savedUrl.full_url,
      shortUrl: shortUrlFull,
      createdAt: savedUrl.createdAt,
      qrCode: savedUrl.qrCode
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

    // Get IP address and parse user agent
    const ip = getClientIP(req);
    const userAgent = new UAParser(req.headers['user-agent']);
    const geo = ip ? geoip.lookup(ip) : null;

    // Create analytics entry
    const analyticsEntry = {
      timestamp: new Date(),
      referrer: req.headers.referer || 'Direct',
      userAgent: req.headers['user-agent'],
      ipAddress: ip || 'Unknown',
      country: geo ? geo.country : 'Unknown',
      city: geo ? geo.city : 'Unknown',
      device: userAgent.getDevice().type || 'Unknown',
      browser: userAgent.getBrowser().name || 'Unknown',
      os: userAgent.getOS().name || 'Unknown'
    };

    // Log the analytics data for debugging
    console.log('Analytics Entry:', {
      ip,
      geo,
      userAgent: userAgent.getResult()
    });

    // Increment the click count and add analytics
    url.clicks += 1;
    url.analytics.push(analyticsEntry);
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

    const baseUrl = process.env.BASE_URL;

    const urlsWithFullShortUrl = urls.map((url) => ({
      ...url.toObject(),
      short_url: baseUrl + url.short_url,
      analytics: url.analytics.map(entry => ({
        ...entry,
        timestamp: entry.timestamp.toISOString()
      }))
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
