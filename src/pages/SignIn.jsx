import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import { signIn } from "../utils/api";
import LoadingScreen from "../../components/LoadingScreen";
import "../styles/Signin.css";

const Signin = () => {
  const { login, loading } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await signIn(form);
      alert("Sign in successful!");
      login(data.token);
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.error || "An unexpected error occurred.");
    }
  };

  if (loading) {
    return  <LoadingScreen />
  }

  return (
    <div className="signin-page">
      {/* Bowling animation header */}
      <div className="bowling-alley">
        <div className="ball"></div>
        <div className="fantasy-title fade-in-title">Fantasy Bowling</div>
        <div className="pins">
          {[...Array(10)].map((_, i) => (
            <div className="pin" id={`pin${i + 1}`} key={i}></div>
          ))}
        </div>
      </div>

      {/* Signin form */}
      <div className="signin-container">
        <form className="signin-form" onSubmit={handleSubmit}>
          <h2>Sign In</h2>
          {error && <p className="error">{error}</p>}
          <input name="username" placeholder="Username" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <button type="submit">Sign In</button>
          <a className="home-link" href="/">← Back to Home</a>
        </form>
      </div>
    </div>
  );
};

export default Signin;