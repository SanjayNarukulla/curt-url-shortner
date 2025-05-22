import React from "react";
import QRCode from "react-qr-code";

export default function UrlDetailsModal({ url, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 font-bold text-xl"
          aria-label="Close Details"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4 text-purple-900">URL Details</h2>

        <div className="mb-4">
          <p className="font-semibold text-purple-700">Long URL:</p>
          <a
            href={url.full_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-700 hover:underline break-words"
          >
            {url.full_url}
          </a>
        </div>

        <div className="mb-4">
          <p className="font-semibold text-purple-700">Short URL:</p>
          <a
            href={url.short_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-700 hover:underline break-words"
          >
            {url.short_url}
          </a>
        </div>

        <div className="mb-4 flex justify-center">
          <QRCode
            value={url.short_url}
            size={160}
            bgColor="transparent"
            fgColor="#5b21b6"
          />
        </div>
      </div>
    </div>
  );
}
