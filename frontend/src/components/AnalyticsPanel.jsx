import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export default function AnalyticsPanel({ url, onClose }) {
  const [clicksData, setClicksData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.token;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchClicks = async () => {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      try {
        const res = await axios.get(`${BASE_URL}/analytics/${url._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClicksData(res.data.clickDetails || []);
        console.log(res.data.clickDetails);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClicks();
  }, [url._id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-4xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 font-bold text-xl"
          aria-label="Close Analytics"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6 text-pink-700">
          Click Analytics
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-pink-600 border-t-transparent"></div>
          </div>
        ) : clicksData.length === 0 ? (
          <p className="text-center text-gray-600">
            No click data available for this URL.
          </p>
        ) : (
          <>
            <p className="mb-4 font-semibold text-pink-800">
              Total Clicks: {clicksData.length}
            </p>

            <table className="w-full text-left border border-pink-300 rounded-md overflow-hidden">
              <thead className="bg-pink-100 text-pink-700">
                <tr>
                  <th className="px-4 py-2">Timestamp</th>
                  <th className="px-4 py-2">IP Address</th>
                  <th className="px-4 py-2">City</th>
                  <th className="px-4 py-2">Region</th>
                  <th className="px-4 py-2">Country</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-200">
                {clicksData.map((click, idx) => (
                  <tr key={idx} className="hover:bg-pink-50">
                    <td className="px-4 py-2">
                      {new Date(click.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">{click.ip}</td>
                    <td className="px-4 py-2">{click.city}</td>
                    <td className="px-4 py-2">{click.region}</td>
                    <td className="px-4 py-2">{click.country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
