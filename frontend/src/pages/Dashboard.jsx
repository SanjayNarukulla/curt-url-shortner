import { useEffect, useState } from "react";
import axios from "axios";
import UrlForm from "../components/UrlForm";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export default function Dashboard() {
  const { logout } = useAuth();
  const [urls, setUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const getToken = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.token;
    } catch {
      return null;
    }
  };

  const fetchUrls = async () => {
    const token = getToken();
    if (!token) {
      toast.error("Session expired. Please log in again.");
      logout();
      return;
    }

    try {
      const res = await axios.get(`${BASE_URL}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUrls(res.data);
      console.log(res.data)
    } catch (error) {
      console.error("Fetch Error:", error.message);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        logout();
      } else {
        toast.error("Failed to fetch URLs.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleDelete = async (id) => {
    const token = getToken();
    if (!token) {
      toast.error("Session expired. Please log in again.");
      logout();
      return;
    }

    setDeleteLoading(id);
    try {
      await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("URL deleted successfully.");
      fetchUrls();
    } catch (error) {
      console.error("Delete Error:", error.message);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        logout();
      } else {
        toast.error("Failed to delete URL.");
      }
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleRedirect = (shortUrl) => {
    window.open(shortUrl, "_blank", "noopener,noreferrer");
    setTimeout(fetchUrls, 1500);
  };

  const handleCopyUrl = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl);
    toast.success("URL copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-purple-900 mb-1 tracking-tight">
              🎯 CURT
            </h1>
            <p className="text-purple-700 text-sm sm:text-base max-w-md">
              Shorten, manage and track your URLs effortlessly with style!
            </p>
          </div>
          <button
            onClick={logout}
            className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold rounded-lg shadow-lg hover:from-red-600 hover:to-red-800 transition duration-300"
          >
            Logout
          </button>
        </div>

        {/* URL Form */}
        <div className="bg-white shadow-2xl rounded-3xl p-8 border-l-8 border-purple-600 mb-8">
          <UrlForm fetchUrls={fetchUrls} />
        </div>

        {/* URL List */}
        <div className="bg-white shadow-2xl rounded-3xl border border-gray-300 overflow-hidden">
          <div className="p-6 border-b border-purple-300 bg-purple-100 sticky top-0 z-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-purple-900 flex items-center gap-2">
              📋 Your URLs
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-purple-600 border-t-transparent"></div>
            </div>
          ) : urls.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="text-6xl mb-4 select-none">😕</div>
              <p className="text-gray-600 text-lg font-semibold">
                No URLs created yet.
              </p>
              <p className="text-gray-400 mt-1">
                Start by shortening a URL above
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] table-auto">
                <thead className="bg-purple-200 border-b border-purple-400">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm sm:text-base font-bold text-purple-800 tracking-wide">
                      Long URL
                    </th>
                    <th className="px-6 py-4 text-left text-sm sm:text-base font-bold text-purple-800 tracking-wide">
                      Short URL
                    </th>
                    <th className="px-6 py-4 text-left text-sm sm:text-base font-bold text-purple-800 tracking-wide">
                      Clicks
                    </th>
                    <th className="px-6 py-4 text-right text-sm sm:text-base font-bold text-purple-800 tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100 bg-white">
                  <AnimatePresence>
                    {urls.map((url, idx) => (
                      <motion.tr
                        key={url._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className={`hover:bg-purple-50 transition-colors duration-300 ${
                          idx % 2 === 0 ? "bg-purple-50" : "bg-white"
                        }`}
                      >
                        <td className="px-6 py-3 max-w-sm truncate text-purple-900 font-medium">
                          <a
                            href={url.full_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                            title={url.full_url}
                          >
                            {url.full_url}
                          </a>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3 text-indigo-700 font-semibold">
                            <button
                              onClick={() => handleRedirect(url.short_url)}
                              className="cursor-pointer hover:underline truncate max-w-[200px]"
                              title={`Open ${url.short_url}`}
                            >
                              {url.short_url}
                            </button>
                            <button
                              onClick={() => handleCopyUrl(url.short_url)}
                              className="cursor-pointer text-indigo-400 hover:text-indigo-700 transition"
                              title="Copy URL"
                            >
                              📋
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold select-none">
                            {url.clicks} clicks
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => handleDelete(url._id)}
                            disabled={deleteLoading === url._id}
                            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
                              deleteLoading === url._id
                                ? "bg-red-300 text-red-700 cursor-not-allowed"
                                : "bg-red-100 hover:bg-red-200 text-red-700"
                            }`}
                          >
                            {deleteLoading === url._id ? (
                              <div className="w-5 h-5 border-2 border-red-700 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>🗑 Delete</>
                            )}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
