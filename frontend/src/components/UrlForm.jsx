import { useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export default function UrlForm({ fetchUrls }) {
  const [url, setUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      if (!token) throw new Error("No token found");

      await axios.post(
        `${BASE_URL}/`,
        { url },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUrl("");
      fetchUrls();
    } catch (error) {
      console.error("Submission Error:", error.message);
      alert("Invalid URL or session expired.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-center justify-between"
    >
      <input
        type="url"
        placeholder="Paste your long URL here..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <button
        type="submit"
        className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition duration-200"
      >
        ✂️ Shorten URL
      </button>
    </form>
  );
}
