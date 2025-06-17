import { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../src/utils/AuthContext";
import { getThemeColors } from "../src/utils/themeColors";

const Header = ({ isMenuOpen, onToggleMenu }) => {
  const { user, loading, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const clickLogout = async () => {
    logout();
    navigate("/");
  };

  const clickSignin = async () => {
    login();
    navigate("/signin");
  };

  const clickSignup = async () => {
    navigate("/signup");
  };

  if (loading) return null;

  const { backgroundColor, color } = getThemeColors(user?.color);

  const headerStyle = {
    backgroundColor,
    color,
    position: "relative", // to position hamburger absolutely inside
  };

  const buttonStyle = {
    backgroundColor,
    color,
    border: `2px solid ${color}`,
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
    marginLeft: "1rem",
    fontWeight: "bold",
  };

  return (
    <div className="header" style={headerStyle}>
      {/* Hamburger Button */}
      <button
        className={`hamburger ${isMenuOpen ? "open" : ""}`}
        onClick={() => onToggleMenu(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>
  
      {user ? (
        <>
          <div className="headerLeft">
            {user.avatarUrl && (
              <img src={user.avatarUrl} alt={`${user.firstname}'s avatar`} className="avatar" />
            )}
            <h2 className="greeting">Welcome, {user.firstname}!</h2>
          </div>
  
          <div className="headerRight">
            {(user.role === "ADMIN" || user.role === "SUPERADMIN") && (
              <Link to="/admin">
                <button className="headerBtn adminBtn" style={buttonStyle}>
                  Admin
                </button>
              </Link>
            )}
            <button className="headerBtn" onClick={clickLogout} style={buttonStyle}>
              Log Out
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="headerLeft">
            <h2>Welcome, Guest!</h2>
          </div>
          <div className="headerRight">
            <button className="headerBtn" onClick={clickSignin} style={buttonStyle}>
              Sign In
            </button>
            <button className="headerBtn" onClick={clickSignup} style={buttonStyle}>
              Sign Up
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Header;