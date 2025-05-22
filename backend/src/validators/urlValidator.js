import { check } from "express-validator";

export const urlValidator = [
  check("url", "Please provide a valid URL").matches(
    /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/
  ),
  check("customUrl")
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage("Custom URL must be between 3 and 20 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      "Custom URL can only contain letters, numbers, hyphens, and underscores"
    ),
];
