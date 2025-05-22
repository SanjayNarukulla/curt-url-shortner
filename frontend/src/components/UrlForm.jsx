import { useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export default function UrlForm({ fetchUrls }) {
  const [url, setUrl] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [errors, setErrors] = useState({ url: "", customUrl: "" });

  // Regex: custom alias = letters, numbers, dash, underscore, 3 to 30 chars
  const customUrlPattern = /^[a-zA-Z0-9-_]{3,30}$/;

  // Simple URL validation regex (supports http(s), domain, localhost, IP, port, query, hash)
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol (optional)
      "((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])?)\\.)+[a-zA-Z]{2,}|" + // domain
      "localhost|" + // localhost
      "\\d{1,3}(\\.\\d{1,3}){3})" + // ipv4
      "(\\:\\d+)?(\\/[-a-zA-Z\\d%@_.~+&:]*)*" + // port/path
      "(\\?[;&a-zA-Z\\d%@_.,~+&:=-]*)?" + // query string
      "(\\#[-a-zA-Z\\d_]*)?$",
    "i"
  );

  // Validation function for inputs
  const validate = () => {
    let valid = true;
    let errs = { url: "", customUrl: "" };

    if (!urlPattern.test(url)) {
      errs.url = "Please enter a valid URL.";
      valid = false;
    }

    if (customUrl.trim() && !customUrlPattern.test(customUrl)) {
      errs.customUrl =
        "Custom alias must be 3-30 characters: letters, numbers, dash or underscore only.";
      valid = false;
    }

    setErrors(errs);
    return valid;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return; // stop submission if validation fails

    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      if (!token) throw new Error("No token found");

      await axios.post(
        `${BASE_URL}/`,
        { url, customUrl: customUrl.trim() || undefined },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUrl("");
      setCustomUrl("");
      setErrors({ url: "", customUrl: "" });
      fetchUrls(); // refresh the list after successful submit
    } catch (error) {
      console.error("Submission Error:", error.message);
      alert("Invalid URL, custom alias is taken, or session expired.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-center justify-between"
      noValidate
    >
      <div className="flex-1 w-full">
        <input
          type="url"
          placeholder="Paste your long URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${
            errors.url
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          required
        />
        {errors.url && (
          <p className="text-red-500 text-sm mt-1">{errors.url}</p>
        )}
      </div>

      <div className="w-full max-w-xs">
        <input
          type="text"
          placeholder="Custom alias (optional)"
          value={customUrl}
          onChange={(e) => setCustomUrl(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${
            errors.customUrl
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          pattern="^[a-zA-Z0-9-_]{3,30}$"
          title="3-30 characters: letters, numbers, dash or underscore only"
        />
        {errors.customUrl && (
          <p className="text-red-500 text-sm mt-1">{errors.customUrl}</p>
        )}
      </div>

      <button
        type="submit"
        className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition duration-200"
      >
        ✂️ Shorten URL
      </button>
    </form>
  );
}
