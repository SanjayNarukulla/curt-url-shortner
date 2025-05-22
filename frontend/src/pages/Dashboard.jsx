import { useEffect, useState } from "react";
import axios from "axios";
import UrlForm from "../components/UrlForm";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

import UrlTable from "../components/UrlTable";
import UrlDetailsModal from "../components/UrlDetailsModal";
import AnalyticsPanel from "../components/AnalyticsPanel";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export default function Dashboard() {
  const { logout } = useAuth();
  const [urls, setUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

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
    } catch (error) {
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

  const handleShowDetails = (url) => {
    setSelectedUrl(url);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setSelectedUrl(null);
    setShowDetails(false);
  };

  const handleShowAnalytics = (url) => {
    setSelectedUrl(url);
    setShowAnalytics(true);
  };

  const handleCloseAnalytics = () => {
    setSelectedUrl(null);
    setShowAnalytics(false);
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
        <UrlTable
          urls={urls}
          isLoading={isLoading}
          deleteLoading={deleteLoading}
          onDelete={handleDelete}
          onShowDetails={handleShowDetails}
          onShowAnalytics={handleShowAnalytics}
          fetchUrls={fetchUrls}
        />

        {/* Details Modal */}
        {showDetails && selectedUrl && (
          <UrlDetailsModal url={selectedUrl} onClose={handleCloseDetails} />
        )}

        {/* Analytics Panel */}
        {showAnalytics && selectedUrl && (
          <AnalyticsPanel url={selectedUrl} onClose={handleCloseAnalytics} />
        )}
      </div>
    </div>
  );
}
