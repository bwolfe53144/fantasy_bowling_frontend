import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { loginUser } from "../utils/api";

export default function SignIn() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userData = await loginUser({ email, password });
      setUser(userData);
      setModalOpen(true); // show modal instead of alert
    } catch (error) {
      console.error("Login failed:", error);
      // Optionally: show an error modal or toast here
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    navigate("/"); // go to home after closing modal
  };

  return (
    <div className="signInPage">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign In</button>
      </form>

      {/* Success Modal */}
      {modalOpen && (
        <div className="modalOverlay">
          <div className="modalContent">
            <p className="modal-p">Sign in successful!</p>
            <div className="modalActions">
              <button
                onClick={closeModal}
                className="modal-cancel-button"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}