import { check } from "express-validator";

export const urlValidator = [
  check("url", "Please provide a valid URL").matches(
    /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/
  ),
];


