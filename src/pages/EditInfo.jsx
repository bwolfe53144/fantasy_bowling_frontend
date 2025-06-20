import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../utils/AuthContext";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import EditTeamName from "../../components/EditTeamName";
import ColorSelector from "../../components/ColorSelector";
import AvatarUploader from "../../components/AvatarUploader";
import EmailSubscription from "../../components/EmailSubscription";
import { validateEmail, submitAvatar, saveEmailSubscription } from "../utils/profileHelpers";
import { updateColor, changeTeamName } from "../utils/api";
import { getThemeColors } from "../utils/themeColors";
import "../styles/EditInfo.css"

export default function EditInfo() {
  const { user, loading } = useContext(AuthContext);
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPerson, setIsPerson] = useState("true");
  const [favoriteColor, setFavoriteColor] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [teamNameEditVisible, setTeamNameEditVisible] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const { buttonBackground, buttonColor } = getThemeColors(user?.color);

  const buttonStyle = {
    backgroundColor: buttonBackground,
    color: buttonColor,
    maxWidth: "200px",
    minHeight: "50px",
    textAllign: "center",
    borderRadius: "12px",
  };

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  useEffect(() => {
    if (user?.color) setFavoriteColor(user.color);
    if (user?.team?.name) setNewTeamName(user.team.name);
    if (user?.email) setEmailInput(user.email);
    if (user?.emailSubscribed !== undefined)
      setEmailSubscribed(user.emailSubscribed);
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!avatarFile) return alert("Please select an avatar file");
    try {
      await submitAvatar({ avatarFile, user, isPerson, favoriteColor });
      alert("Avatar uploaded successfully!");
      setPreviewUrl(null);
      setAvatarFile(null);
      setFavoriteColor("");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload avatar");
    }
  };

  const handleColorChange = async (e) => {
    const newColor = e.target.value;
    setFavoriteColor(newColor);
    try {
      await updateColor(user.id, newColor);
    } catch (error) {
      console.error("Failed to update color:", error);
      alert("Failed to save favorite color.");
    }
  };

  const handleTeamNameChange = async () => {
    if (!newTeamName.trim()) return alert("Team name cannot be empty.");
    try {
      await changeTeamName(user.id, newTeamName);
      alert("Team name updated successfully!");
      setTeamNameEditVisible(false);
    } catch (error) {
      console.error("Team name update failed:", error);
      if (error.response?.status === 409) {
        alert("That team name is already taken. Please choose another.");
      } else {
        alert("Error changing team name.");
      }
    }
  };

  const handleSubscriptionToggle = async () => {
    if (!emailInput.trim()) {
      setEmailError("Please enter your email to subscribe.");
      return;
    }

    if (!validateEmail(emailInput)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    try {
      await saveEmailSubscription(user.id, emailInput.trim(), !emailSubscribed);
      setEmailSubscribed(!emailSubscribed);
      setEmailError("");
      alert(
        !emailSubscribed
          ? "Subscribed to email notifications!"
          : "Unsubscribed from email notifications."
      );
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Failed to update email subscription.");
    }
  };

  const handleEmailBlur = async () => {
    if (!emailInput.trim() || !emailSubscribed) return;

    if (!validateEmail(emailInput)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    try {
      await saveEmailSubscription(user.id, emailInput.trim(), true);
      setEmailError("");
    } catch (error) {
      console.error("Failed to save email:", error);
      setEmailError("Failed to save email address.");
    }
  };

  if (loading) {
    return  <LoadingScreen />
  }

  return (
    <div className="pageContainer">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
      <div className="mainPage editInfo">
        <h1>Edit Team Info</h1>
        {/* Team Name Editor */}
        <EditTeamName
          visible={teamNameEditVisible}
          name={newTeamName}
          setName={setNewTeamName}
          onSubmit={handleTeamNameChange}
          onCancel={() => setTeamNameEditVisible(false)}
          onShowInput={() => setTeamNameEditVisible(true)}
          buttonStyle={buttonStyle}
        />
        {/* Color Picker */}
        <h2>Pick A Color Scheme</h2>
        <ColorSelector value={favoriteColor} onChange={handleColorChange} />
        {/* Type Selector */}
        <h2>Upload Team Avatar</h2>
        <div className="radioGroup">
          <label style={{ marginRight: 10 }}>
            <input
              type="radio"
              name="type"
              value="true"
              checked={isPerson === "true"}
              onChange={() => setIsPerson("true")}
            />{" "}
            Person
          </label>
          <label>
            <input
              type="radio"
              name="type"
              value="false"
              checked={isPerson === "false"}
              onChange={() => setIsPerson("false")}
            />{" "}
            Object
          </label>
        </div>
        {/* Avatar Uploader */}
        <AvatarUploader
          previewUrl={previewUrl}
          onFileChange={handleFileChange}
          onUpload={handleUpload}
          disabled={loading || !avatarFile}
          buttonStyle={buttonStyle}
        />
        {/* Email Subscription */}
        <EmailSubscription
          email={emailInput}
          subscribed={emailSubscribed}
          onEmailChange={(e) => setEmailInput(e.target.value)}
          onToggle={handleSubscriptionToggle}
          error={emailError}
          onBlur={handleEmailBlur}
        />
      </div>
      <Footer />
    </div>
  );
}