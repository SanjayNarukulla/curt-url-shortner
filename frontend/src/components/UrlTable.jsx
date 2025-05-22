import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

export default function UrlTable({
  urls,
  isLoading,
  deleteLoading,
  onDelete,
  onShowDetails,
  onShowAnalytics,
  fetchUrls,
}) {
  const handleRedirect = (shortUrl) => {
    window.open(shortUrl, "_blank", "noopener,noreferrer");
    setTimeout(fetchUrls, 1500);
  };

  const handleCopyUrl = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl);
    toast.success("URL copied to clipboard!");
  };

  return (
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
          <p className="text-gray-400 mt-1">Start by shortening a URL above</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] table-auto">
            <thead className="bg-purple-200 border-b border-purple-400">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-purple-800">
                  Long URL
                </th>
                <th className="px-6 py-4 text-left font-bold text-purple-800">
                  Short URL
                </th>
                <th className="px-6 py-4 text-left font-bold text-purple-800">
                  Clicks
                </th>
                <th className="px-6 py-4 text-right font-bold text-purple-800">
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
                          title="Open Short URL"
                          aria-label="Open Short URL"
                        >
                          {url.short_url}
                        </button>
                        <button
                          onClick={() => handleCopyUrl(url.short_url)}
                          className="cursor-pointer text-indigo-400 hover:text-indigo-700 transition"
                          title="Copy to Clipboard"
                          aria-label="Copy Short URL"
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
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onShowDetails(url)}
                          title="View Details & QR"
                          className="px-3 py-1 bg-purple-300 rounded-lg text-purple-900 hover:bg-purple-400 transition"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => onShowAnalytics(url)}
                          title="View Analytics"
                          className="px-3 py-1 bg-pink-300 rounded-lg text-pink-900 hover:bg-pink-400 transition"
                        >
                          Analytics
                        </button>
                        <button
                          onClick={() => onDelete(url._id)}
                          disabled={deleteLoading === url._id}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {deleteLoading === url._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
