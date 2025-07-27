import { Link } from "react-router-dom";

const Footer = ({ page }) => {
  // Opens URL in a new tab or the device's default browser
  const openExternalLink = (url) => {
    if (window && window.open) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      // Fallback: Just navigate
      window.location.href = url;
    }
  };

  return (
    <div className={`footer ${page === "rules" ? "rules" : ""} ${page === "about" ? "about" : ""}`}>
      <Link to="/about" className="aboutLink">
        About
      </Link>

      <a
        href="https://www.facebook.com/groups/1780323492061614"
        target="_blank"
        rel="noopener noreferrer"
        className="footer-button"
        aria-label="Join us on Facebook"
        title="Facebook Group"
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <img className="footImg" src="/facebook.png" alt="Facebook" />
      </a>

      <button
        className="footer-button"
        onClick={() => openExternalLink("https://www.discord.com")}
        aria-label="Join our Discord server"
        title="Discord Server"
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <img className="footImg discord" src="/discord.png" alt="Discord" />
      </button>

      <button
        className="footer-button"
        onClick={() => openExternalLink("https://github.com/bwolfe53144")}
        aria-label="View my GitHub profile"
        title="GitHub"
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <img className="footImg" src="/github.png" alt="GitHub" />
      </button>
    </div>
  );
};

export default Footer;