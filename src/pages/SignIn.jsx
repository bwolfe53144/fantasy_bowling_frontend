import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import { signIn, forgotPassword } from "../utils/api";
import LoadingScreen from "../../components/LoadingScreen";
import Modal from "../../components/Modal";
import { useModal } from "../../hooks/useModal";
import "../styles/Signin.css";

const Signin = () => {
  const { login, loading } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [showForgotForm, setShowForgotForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animationPaused, setAnimationPaused] = useState(false);

  const navigate = useNavigate();
  const [modalProps, showModal] = useModal();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await signIn(form);
      login(data.token);

      // Pause animation when modal shows
      setAnimationPaused(true);

      await showModal({
        title: "Sign In Successful!",
        message: `Welcome back, ${form.username}.`,
        confirmText: "OK",
      });

      // Resume animation if staying on page (optional)
      setAnimationPaused(false);

      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.error || "An unexpected error occurred.");
      setAnimationPaused(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotSuccess("");
    setError("");

    try {
      await forgotPassword({ email: forgotEmail });
      setForgotSuccess("Check your email for password reset instructions. Might be in spam if you do not see it.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send password reset email.");
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="signin-page">
      {/* Bowling animation */}
      <div className={`bowling-alley ${animationPaused ? "paused" : ""}`}>
        <div className="ball"></div>
        <div className="fantasy-title fade-in-title">Fantasy Bowling</div>
        <div className="pins">
          {[...Array(10)].map((_, i) => (
            <div className="pin" id={`pin${i + 1}`} key={i}></div>
          ))}
        </div>
      </div>

      <div className="signin-container">
        {!showForgotForm ? (
          <>
            <form className="signin-form" onSubmit={handleSubmit}>
              <h2>Sign In</h2>
              {error && <p className="error">{error}</p>}

              <input
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
              />

              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-btn"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button type="submit">Sign In</button>
            </form>

            <p>
              <button
                className="link-button"
                type="button"
                onClick={() => {
                  setShowForgotForm(true);
                  setError("");
                  setForgotSuccess("");
                }}
              >
                Forgot Password?
              </button>
            </p>

            <a className="home-link" href="/">
              ← Back to Home
            </a>
          </>
        ) : (
          <form className="signin-form" onSubmit={handleForgotSubmit}>
            <h2>Reset Password</h2>
            {error && <p className="error">{error}</p>}
            {forgotSuccess && <p className="success">{forgotSuccess}</p>}

            <input
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />

            <button type="submit">Send Reset Email</button>
            <button
              className="link-button"
              type="button"
              onClick={() => {
                setShowForgotForm(false);
                setError("");
                setForgotSuccess("");
              }}
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {/* Modal */}
      {modalProps && <Modal {...modalProps} />}
    </div>
  );
};

export default Signin;