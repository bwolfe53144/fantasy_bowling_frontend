import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../utils/api";
import "../styles/ResetPassword.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await resetPassword(token, { password, confirmPassword });
      setSuccessMsg(res.data.message);
      setLoading(false);

      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <div className="reset-password-page">
      <h2>Reset Password</h2>
      {error && <p className="error-message">{error}</p>}
      {successMsg && <p className="success-message">{successMsg}</p>}
      <form onSubmit={handleSubmit} className="reset-password-form">
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}