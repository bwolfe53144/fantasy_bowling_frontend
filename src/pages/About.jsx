import { useEffect, useContext, useState } from "react";
import { AuthContext } from "../utils/AuthContext";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import "../styles/About.css";

const About = () => {
  const { loading } = useContext(AuthContext); // removed players since unused
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add("about-bg");
    return () => {
      document.body.classList.remove("about-bg");
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
  <div className="pageContainer about-page">
    <div className="background-overlay"></div> {/* Dark overlay for readability */}

    <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
    <Navbar />

    <main className="mainPage about-content">
      <h1>About the League</h1>
      <p>
        My name is Brian. I decided to start a fantasy bowling league for the 2023-2024 season. I have been
        playing fantasy sports for 23 years. I enjoy working with data and have a Bachelor's degree in Mathematics.
      </p>
      <p>
        Last year, I decided to learn how to make my own website, so the 2025-2026 season will be the first to
        use this website. I tried to include as many features as I could to make the user experience amazing.
      </p>

      <section className="thanks-section">
        <h2>Thanks &amp; Credits</h2>
        <p>Special thanks for the pictures and backgrounds used on this site to:</p>
        <ul>
          <li><strong>Discord</strong> by Toms Design</li>
          <li><strong>GitHub</strong> by Pengedar Seni on IconScout</li>
          <li><strong>Red bowling ball with pins</strong> — Photo by Blend Archive on Unsplash</li>
          <li><strong>Orange bowling ball with pins</strong> — Photo by Michelle McEwen on Unsplash</li>
          <li><strong>Blue bowling ball with pins</strong> — Photo by Ella Christenson on Unsplash</li>
          <li><strong>Bowling lane picture</strong> — Photo by Pavel Danilyuk</li>
        </ul>
      </section>
    </main>

    <Footer />
  </div>
);
};

export default About;