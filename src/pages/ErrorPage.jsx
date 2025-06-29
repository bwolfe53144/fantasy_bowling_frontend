import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ErrorPage.css";

const ErrorPage = ({ code = 404, message = "Page Not Found" }) => {
  const navigate = useNavigate();

  const handleHomeRedirect = () => {
    navigate("/");
  };

  return (
    <div className="error-page">
      <h1 className="error-code">{code}</h1>
      <p className="error-message">{message}</p>
      <p className="error-subtext">Oops! Something went wrong.</p>
      <button onClick={handleHomeRedirect}>
        Go to Home
      </button>
    </div>
  );
};

export default ErrorPage;