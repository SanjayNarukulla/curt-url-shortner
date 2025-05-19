import express from "express"
import {
  registerValidator,
  loginValidator,
} from "../validators/authValidators.js";
import { validationResult } from "express-validator";
import { loginUser, registerUser } from "../controllers/authController.js";

const router = express.Router()

// Register
router.post(
  "/register",
  registerValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
  registerUser
);

// Login
router.post(
  "/login",
  loginValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
  loginUser
);


export default router;