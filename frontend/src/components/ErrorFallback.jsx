// src/components/ErrorFallback.jsx
import React from "react";

export default function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-4 bg-red-100 text-red-800 rounded shadow">
      <h2 className="text-lg font-semibold">Something went wrong.</h2>
      <p>{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-2 px-4 py-1 bg-red-600 text-white rounded"
      >
        Try Again
      </button>
    </div>
  );
}
