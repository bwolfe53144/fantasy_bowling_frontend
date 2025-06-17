import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorPage = ({ code = 404, message = "Page Not Found" }) => {
  const navigate = useNavigate();

  const handleHomeRedirect = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 px-4 text-center">
      <h1 className="text-6xl font-bold text-red-500 mb-4">{code}</h1>
      <p className="text-2xl text-gray-800 mb-2">{message}</p>
      <p className="text-gray-600 mb-6">Oops! Something went wrong.</p>
      <button
        onClick={handleHomeRedirect}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Go to Home
      </button>
    </div>
  );
};

export default ErrorPage;