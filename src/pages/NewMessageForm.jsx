import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import { getThemeColors } from "../utils/themeColors";
import { postMessage } from "../utils/api";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import "../styles/NewMessageForm.css";

const NewMessageForm = () => {
  const { user, loading } = useContext(AuthContext);
  const [newMessage, setNewMessage] = useState({ title: "", content: "" });
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { buttonBackground, buttonColor, extraBackground } = getThemeColors(user?.color);
    
  const buttonStyle = {
    backgroundColor: buttonBackground,
    color: buttonColor,
    minWidth: "90px",
    border: "none",
    cursor: "pointer"
  };

  const containerStyle = {
    backgroundColor: extraBackground, 
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxWidth: "600px",
    margin: "2rem auto",
  };

  useEffect(() => {
      document.body.classList.toggle("menuOpen", isMenuOpen);
      return () => document.body.classList.remove("menuOpen");
    }, [isMenuOpen]);

  const handleNewMessageSubmit = async (e) => {
    e.preventDefault();
    try {
      await postMessage({
        title: newMessage.title.trim(),
        content: newMessage.content.trim(),
        authorId: user.id,
      });
      navigate("/forum");
    } catch (error) {
      console.error("Error adding message", error);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="newMessagePage">
      <div className="pageContainer">
        <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
        <Navbar />
        <div className="mainPage">
          <div style={containerStyle}>
            <h2>
              Post a New Message
            </h2>
            <form onSubmit={handleNewMessageSubmit}>
              <input
                type="text"
                placeholder="Title"
                aria-label="Message title"
                value={newMessage.title}
                onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Content"
                aria-label="Message content"
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                required
              />
              <button style={buttonStyle} type="submit">
                Submit
              </button>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default NewMessageForm;