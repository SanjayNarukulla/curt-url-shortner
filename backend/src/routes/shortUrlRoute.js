import express from "express";
import {
  createShortUrl,
  redirectToFullUrl,
  getUserUrls,
  deleteUrl,
  getUrlAnalytics,
} from "../controllers/shortUrlController.js";

import protect from "../middleware/auth.js";
import { urlValidator } from "../validators/urlValidator.js"; // 👈 Assuming this file exports the validator
import { validationResult } from "express-validator";

const router = express.Router();

// Helper middleware to check validation errors
const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Public route for redirection
router.get("/:shortUrl", redirectToFullUrl);

// Protected Routes
router.post("/", protect, urlValidator, runValidation, createShortUrl);
router.get("/", protect, getUserUrls);
router.get("/analytics/:id", protect, getUrlAnalytics);
router.delete("/:id", protect, deleteUrl);

export default router;
