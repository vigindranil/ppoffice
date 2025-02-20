"use client";

export default function UnderConstruction() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Under Progress</h1>
      <p className="text-lg text-gray-600 mb-8">
        This page is yet to be built. Please check back later.
      </p>
      <div className="animate-pulse">
        <svg
          className="w-16 h-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
          />
        </svg>
      </div>
    </div>
  );
}
