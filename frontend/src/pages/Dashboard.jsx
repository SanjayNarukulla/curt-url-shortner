import { useEffect, useState } from "react";
import axios from "axios";
import UrlForm from "../components/UrlForm";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export default function Dashboard() {
  const { logout } = useAuth();
  const [urls, setUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showQR, setShowQR] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(null);

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
      alert("Session expired. Please log in again.");
      logout();
      return;
    }

    try {
      const res = await axios.get(`${BASE_URL}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUrls(res.data);
    } catch (error) {
      console.error("Fetch Error:", error.message);
      alert("Failed to fetch URLs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleDelete = async (id) => {
    const token = getToken();
    if (!token) return;

    setDeleteLoading(id);
    try {
      await axios.delete(`${BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUrls();
    } catch (error) {
      console.error("Delete Error:", error.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleRedirect = (shortUrl) => {
    window.open(shortUrl, "_blank", "noopener,noreferrer");
    setTimeout(fetchUrls, 1500);
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
  };

  const handleShowQR = (urlId) => {
    setShowQR(showQR === urlId ? null : urlId);
  };

  const handleShowAnalytics = (urlId) => {
    setShowAnalytics(showAnalytics === urlId ? null : urlId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const AnalyticsModal = ({ url }) => {
    if (!url.analytics || url.analytics.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No analytics data available yet.</p>
        </div>
      );
    }

    // Group analytics by country
    const countryStats = url.analytics.reduce((acc, curr) => {
      const country = curr.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    // Get top countries
    const topCountries = Object.entries(countryStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-purple-800">Analytics for {url.short_url}</h3>
            <button
              onClick={() => setShowAnalytics(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Summary Stats */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-700 mb-3">Summary</h4>
              <div className="space-y-2">
                <p>Total Clicks: <span className="font-semibold">{url.clicks}</span></p>
                <p>Unique Countries: <span className="font-semibold">{Object.keys(countryStats).length}</span></p>
              </div>
            </div>

            {/* Top Countries */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-700 mb-3">Top Countries</h4>
              <div className="space-y-2">
                {topCountries.map(([country, count]) => (
                  <div key={country} className="flex justify-between">
                    <span>{country}</span>
                    <span className="font-semibold">{count} clicks</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="md:col-span-2 bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-700 mb-3">Recent Activity</h4>
              <div className="space-y-3">
                {url.analytics.slice(-5).reverse().map((entry, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{formatDate(entry.timestamp)}</span>
                      <span className="font-medium">{entry.country || 'Unknown'}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      <span>{entry.browser} on {entry.os}</span>
                      {entry.device !== 'Unknown' && <span> • {entry.device}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-purple-800 mb-1">
              🎯 CURT
            </h1>
            <p className="text-purple-600">
              Shorten, manage and track your URLs effortlessly
            </p>
          </div>
          <button
            onClick={logout}
            className="cursor-pointer px-6 py-2 bg-gradient-to-r from-red-400 to-red-600 text-white font-semibold rounded-lg shadow-md hover:from-red-500 hover:to-red-700 transition-all duration-300"
          >
            Logout
          </button>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8 border-l-4 border-purple-400 mb-8">
          <UrlForm fetchUrls={fetchUrls} />
        </div>

        <div className="bg-white shadow-2xl rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-purple-50">
            <h2 className="text-2xl font-semibold text-purple-800">
              📋 Your URLs
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          ) : urls.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">😕</div>
              <p className="text-gray-500 text-lg font-semibold">
                No URLs created yet.
              </p>
              <p className="text-gray-400">Start by shortening a URL above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-purple-700">
                      Long URL
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-purple-700">
                      Short URL
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-purple-700">
                      Clicks
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-purple-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  <AnimatePresence>
                    {urls.map((url) => (
                      <motion.tr
                        key={url._id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="hover:bg-purple-50 transition-all duration-300"
                      >
                        <td className="px-6 py-4">
                          <div className="max-w-md truncate text-gray-800">
                            {url.full_url}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleRedirect(url.short_url)}
                              className="cursor-pointer text-indigo-600 hover:underline font-medium"
                            >
                              {url.short_url}
                            </button>
                            <button
                              onClick={() => handleCopyUrl(url.short_url)}
                              className="cursor-pointer text-gray-500 hover:text-indigo-500"
                              title="Copy URL"
                            >
                              📋
                            </button>
                            <button
                              onClick={() => handleShowQR(url._id)}
                              className="cursor-pointer text-gray-500 hover:text-indigo-500"
                              title="Show QR Code"
                            >
                              📱
                            </button>
                            <button
                              onClick={() => handleShowAnalytics(url._id)}
                              className="cursor-pointer text-gray-500 hover:text-indigo-500"
                              title="Show Analytics"
                            >
                              📊
                            </button>
                          </div>
                          {showQR === url._id && url.qrCode && (
                            <div className="mt-4 p-4 bg-white rounded-lg shadow-lg">
                              <img
                                src={url.qrCode}
                                alt="QR Code"
                                className="w-32 h-32 mx-auto"
                              />
                              <p className="text-center text-sm text-gray-600 mt-2">
                                Scan to visit
                              </p>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                            {url.clicks} clicks
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(url._id)}
                            disabled={deleteLoading === url._id}
                            className={`cursor-pointer inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-lg ${
                              deleteLoading === url._id
                                ? "bg-red-200 text-red-500 cursor-not-allowed"
                                : "bg-red-100 hover:bg-red-200 text-red-700"
                            } transition`}
                          >
                            {deleteLoading === url._id ? (
                              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              "🗑 Delete"
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

      {/* Analytics Modal */}
      <AnimatePresence>
        {showAnalytics && (
          <AnalyticsModal url={urls.find(url => url._id === showAnalytics)} />
        )}
      </AnimatePresence>
    </div>
  );
}
