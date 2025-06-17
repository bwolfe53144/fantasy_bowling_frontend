import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import { signUp } from "../utils/api";
import LoadingScreen from "../../components/LoadingScreen";
import "../styles/Signup.css";

const Signup = () => {
  const { loading } = useContext(AuthContext);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    confPassword: "",
  });
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signUp(form);
      alert("Signup successful!");
      navigate("/signin");
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors.map((error) => error.msg));
      } else {
        setErrors([err.response?.data?.error || "An error occurred"]);
      }
    }
  };

  if (loading) {
    return  <LoadingScreen />
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2>Sign Up</h2>
          {errors.length > 0 && (
            <ul className="error-list">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
          <input name="firstname" placeholder="First Name" onChange={handleChange} required />
          <input name="lastname" placeholder="Last Name" onChange={handleChange} required />
          <input name="username" placeholder="Username" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <input type="password" name="confPassword" placeholder="Confirm Password" onChange={handleChange} required />
          <button type="submit">Sign Up</button>
          <a className="home-link" href="/">← Back to Home</a>
        </form>
      </div>
    </div>
  );
};

export default Signup;