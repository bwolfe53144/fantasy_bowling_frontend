import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import { FaStar, FaRegStar } from "react-icons/fa";
import { getMessages, getStarredMessages, starMessage, deleteMessage } from "../utils/api";
import { getThemeColors } from "../utils/themeColors";
import '../styles/Forum.css';

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const Forum = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [starredMessages, setStarredMessages] = useState([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [page, setPage] = useState(1);
  const [starredPage, setStarredPage] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const messagesPerPage = 5;
  const starredPerPage = 5;

  const { backgroundColor, color, buttonBackground, buttonColor, extraBackground } = getThemeColors(user?.color);

  const buttonStyle = {
    backgroundColor: buttonBackground,
    color: buttonColor,
    minWidth: "90px",
    border: "none",
    cursor: "pointer",
  };

  const extraBackgroundStyle = {
    backgroundColor: extraBackground,
    padding: "1rem",
    borderRadius: "6px",
    marginTop: "1rem",
  };

  const getDisabledStyle = (isDisabled) => ({
    backgroundColor: isDisabled ? "#ccc" : backgroundColor,
    color: isDisabled ? "#666" : color,
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.6 : 1,
    border: "none",
    borderRadius: "10px",
    padding: ".8rem",
    transition: "all 0.3s ease",
    minWidth: "100px",
    textAlign: "center",
  });

  const totalStarredPages = Math.ceil(starredMessages.length / starredPerPage);
  const paginatedStarred = starredMessages.slice(
    (starredPage - 1) * starredPerPage,
    starredPage * starredPerPage
  );

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await getMessages(user.id, page, messagesPerPage);
      setMessages(res.data.messages || []);
      setTotalMessages(res.data.totalMessages || 0);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  }, [user?.id, page]);

  const fetchStarredMessages = useCallback(async () => {
    try {
      const res = await getStarredMessages(user.id);
      const flatMessages = res.data.map((entry) => entry.message);
      setStarredMessages(flatMessages);
    } catch (error) {
      console.error("Error fetching starred messages", error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchStarredMessages();
    }
  }, [user, fetchMessages, fetchStarredMessages]);

  const handleStar = async (messageId) => {
    try {
      await starMessage(messageId, user.id);
      fetchMessages();
      fetchStarredMessages();
    } catch (error) {
      console.error("Error starring message", error);
    }
  };

  const handleDelete = async (messageId) => {
    const confirmed = window.confirm("Are you sure you want to delete this message?");
    if (!confirmed) return;

    try {
      await deleteMessage(messageId, user.id);
      fetchMessages();
      fetchStarredMessages();
    } catch (error) {
      console.error("Error deleting message", error);
    }
  };

  const handleEdit = (messageId) => {
    navigate(`/edit-message/${messageId}`);
  };

  const goToPreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const goToNextPage = () => {
    const totalPages = Math.ceil(totalMessages / messagesPerPage);
    if (page < totalPages) setPage(page + 1);
  };

  // Check if user can delete a message (posted within 10 mins or admin role)
  const canDelete = (message) => {
    const postedTime = new Date(message.createdAt).getTime();
    const currentTime = Date.now();
    const timeDifference = currentTime - postedTime;

    return (
      timeDifference <= 10 * 60 * 1000 ||
      ["admin", "superadmin"].includes(user.role.toLowerCase())
    );
  };

  const getAuthorName = (message) => {
    if (message.author) {
      return `${message.author.firstname} ${message.author.lastname}`;
    }
    return message.userId ? "Unknown Author" : "Author Unknown";
  };

  const isMessageStarred = (messageId) =>
    starredMessages.some((msg) => msg.id === messageId);

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="pageContainer forumPage">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage">
        <div className="messageContainer">
          <h2 className="forumTitle">All Messages</h2>
          <button style={buttonStyle} className="postButton" onClick={() => navigate("/new-message")}>Post a New Message</button>
          {messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            <ul className="messagesList">
              {messages.map((message) => (
                <li key={message.id} className="messageItem">
                  <div>
                    <div className="messageHeader">
                      <div className="messageTitle">{message.title}</div>
                      <button
                        className={`star-button ${isMessageStarred(message.id) ? "starred" : ""}`}
                        onClick={() => handleStar(message.id)}
                      >
                        {isMessageStarred(message.id) ? <FaStar /> : <FaRegStar />}
                      </button>
                    </div>
                    <p className="authorName">By: {getAuthorName(message)}</p>
                    <p className="messageDate">Posted: {formatDate(message.createdAt)}</p>
                    <p>
                      {message.content.length > 100
                        ? `${message.content.slice(0, 100)}...`
                        : message.content}
                    </p>
                    <p>
                      {message.comments?.length === 0
                        ? ""
                        : message.comments?.length === 1
                          ? "1 comment"
                          : `${message.comments?.length} comments`}
                    </p>
                    <button style={buttonStyle} className="messageButton" onClick={() => navigate(`/message/${message.id}`)}>View Post</button>
                    {user.id === message.userId && (
                      <button style={buttonStyle} onClick={() => handleEdit(message.id)}>Edit</button>
                    )}
                    {canDelete(message) && (
                      <button style={buttonStyle} className="messageButton" onClick={() => handleDelete(message.id)}>Delete</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {totalMessages > messagesPerPage && (
            <div className="pagination" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                style={getDisabledStyle(page === 1)}
                onClick={goToPreviousPage}
                disabled={page === 1}
              >
                Previous
              </button>

              <span style={{ minWidth: '30px', textAlign: 'center' }}>Page {page}</span>

              <button
                style={getDisabledStyle(page >= Math.ceil(totalMessages / messagesPerPage))}
                onClick={goToNextPage}
                disabled={page >= Math.ceil(totalMessages / messagesPerPage)}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {starredMessages.length > 0 && (
          <div style={extraBackgroundStyle} className="starredMessages">
            <h2 className="forumTitle">Starred Messages</h2>
            <ul>
              {paginatedStarred.map((message) => (
                <li key={message.id}>
                  <div className="messageHeader">
                    <h2>{message.title}</h2>
                    <button
                      className="star-button starred"
                      onClick={() => handleStar(message.id)}
                    >
                      <FaStar />
                    </button>
                  </div>
                  <p className="authorName">By: {getAuthorName(message)}</p>
                  <p className="messageDate">Posted: {formatDate(message.createdAt)}</p>
                  <p>
                    {message.content.length > 100
                      ? `${message.content.slice(0, 100)}...`
                      : message.content}
                  </p>                  <button style={buttonStyle}
                    className="messageButton"
                    onClick={() => navigate(`/message/${message.id}`)}
                  >
                    View Post
                  </button>
                  {user.id === message.userId && (
                    <button style={buttonStyle}
                      className="messageButton"
                      onClick={() => handleEdit(message.id)}
                    >
                      Edit
                    </button>
                  )}
                  {canDelete(message) && (
                    <button style={buttonStyle}
                      className="messageButton"
                      onClick={() => handleDelete(message.id)}
                    >
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {starredMessages.length > starredPerPage && (
              <div className="pagination" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  style={getDisabledStyle(starredPage === 1)}
                  onClick={() => setStarredPage(starredPage - 1)}
                  disabled={starredPage === 1}
                >
                  Previous
                </button>

                <span style={{ minWidth: '30px', textAlign: 'center' }}>Page {starredPage}</span>

                <button
                  style={getDisabledStyle(starredPage >= totalStarredPages)}
                  onClick={() => setStarredPage(starredPage + 1)}
                  disabled={starredPage >= totalStarredPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Forum;