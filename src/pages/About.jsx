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
    document.documentElement.classList.add("about-bg");
    document.body.classList.add("about-bg");
  
    return () => {
      document.documentElement.classList.remove("about-bg");
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
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
  
      <main className="mainPage about">
        <h1>About the League</h1>
        <p>
          My name is Brian. I decided to start a fantasy bowling league for the 2023–2024 season. I have been
          playing fantasy sports for 23 years. I enjoy working with data and have a Bachelor's degree in Mathematics.
        </p>
        <p>
          Last year, I decided to learn how to make my own website, so the 2025–2026 season will be the first to
          use this website. I tried to include as many features as I could to make the user experience amazing.
        </p>

        <section>
          <h2>Customization & Personalization</h2>
          <p>
            You can customize your profile and team in multiple ways! Choose your favorite color scheme, and
            switch between light and dark mode at any time. You can also upload an avatar to represent your team,
            and even choose if it's a person or an object. These personal touches help make your team truly feel
            like yours.
          </p>
        </section>

        <section>
          <h2>Stats & Player Analysis</h2>
          <p>
            The <strong>Stats</strong> page is a powerful tool for analyzing player performance. You can filter players by league,
            games bowled, position, and team. Most columns can be sorted to quickly find leaders or trends. You
            can even download a CSV file of whatever filters and sorting you apply, making it easy to keep records
            or do further analysis.
          </p>
        </section>

        <section>
          <h2>Leaderboard</h2>
          <p>
            On the <strong>Leaderboard</strong> page, you can view season high scores and top performances. You can filter by a range
            of weeks and by league to see who's leading at any point in the season. It’s a great way to track big
            games and standout players.
          </p>
        </section>
        
        <section>
          <h2>Forum & Community</h2>
          <p>
            The <strong>Forum</strong> page lets you post messages to the league and engage with other managers. You can also star
            your favorite messages, which will then show on your profile page. It’s a fun way to share updates,
            trash talk, or celebrate big wins with the community.
          </p>
        </section>

        <section className="thanks-section">
          <h2>Thanks & Credits</h2>
          <p>Special thanks for the pictures and backgrounds used on this site to:</p>
          <ul>
            <li><strong>Discord</strong> by Toms Design</li>
            <li><strong>GitHub</strong> by Pengedar Seni on IconScout</li>
            <li><strong>Red bowling ball with pins</strong> — Photo by Blend Archive on Unsplash</li>
            <li><strong>Orange bowling ball with pins</strong> — Photo by Michelle McEwen on Unsplash</li>
            <li><strong>Blue bowling ball with pins</strong> — Photo by Ella Christenson on Unsplash</li>
            <li><strong>Bowling lane picture</strong> — Photo by Pavel Danilyuk</li>
            <li><strong>Start bell</strong> sound effect — by freesound_community on Pixabay</li>
            <li><strong>Countdown</strong> sound effect — by u_lfmkadc0ha on Pixabay</li>
            <li><strong>Pick ding</strong> sound effect — by kave msri on Pixabay</li>
          </ul>
        </section>
      </main>
  
      <Footer page="about" />
    </div>
  );
};

export default About;