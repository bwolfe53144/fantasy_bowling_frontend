import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import { getMessageById, addComment } from "../utils/api";
import { getThemeColors } from "../utils/themeColors";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import "../styles/ViewMessage.css";

const ViewMessage = () => {
  const { user, loading } = useContext(AuthContext);
  const { id } = useParams();
  const [message, setMessage] = useState(null);
  const [comment, setComment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const inputRef = useRef();

  const { buttonBackground, buttonColor, extraBackground } = getThemeColors(user?.color);

  const buttonStyle = {
    backgroundColor: buttonBackground,
    color: buttonColor,
    minWidth: "90px",
  };

  const containerStyle = {
    backgroundColor: extraBackground,
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    maxWidth: "700px",
    margin: "2rem auto",
  };

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  useEffect(() => {
    fetchMessage();
  }, [id]);

  async function fetchMessage() {
    try {
      const res = await getMessageById(id);
      setMessage(res.data);
    } catch (error) {
      console.error("Error fetching message", error);
    }
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  async function handleCommentSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (comment.trim() === "") return;

    try {
      await addComment(comment, id, user.id);
      setComment("");
      fetchMessage();
    } catch (error) {
      setErrorMessage("Failed to post comment. Please try again.");
    }
  }

  if (loading || !message) {
    return <LoadingScreen />;
  }

  return (
    <div className="viewMessagePage">
      <div className="pageContainer">
        <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
        <Navbar />
        <div className="mainPage">
          <div style={containerStyle}>
            <h2 className="viewMessageTitle">{message.title}</h2>
            <p className="viewMessageAuthor">
              {message.author?.firstname && message.author?.lastname
                ? `${message.author.firstname} ${message.author.lastname}`
                : "Unknown"}
            </p>

            <p className="viewMessageDate">Posted on {formatDate(message.createdAt)}</p>

            <p className="viewMessageContent">{message.content}</p>

            <div className="commentsSection">
              <h3>Comments</h3>
              {message.comments?.length > 0 ? (
                <ul className="commentList">
                  {message.comments.map((comment) => (
                    <li key={comment.id}>
                      {comment.content}
                      <br />
                      <span style={{ fontSize: "0.85em", color: "gray" }}>
                        —{" "}
                        {comment.author?.firstname && comment.author?.lastname
                          ? `${comment.author.firstname} ${comment.author.lastname}`
                          : "Unknown"}{" "}
                        on {formatDate(comment.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No comments yet.</p>
              )}
              <form onSubmit={handleCommentSubmit}>
                {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
                <input
                  ref={inputRef}
                  type="text"
                  aria-label="Write a comment"
                  placeholder="Write a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
                <button type="submit" style={buttonStyle}>
                  Post Comment
                </button>
              </form>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ViewMessage;