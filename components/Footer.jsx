import { Link } from "react-router-dom";

const Footer = ({ page }) => {
  return (
    <div className={`footer ${page === "rules" ? "rules" : ""}`}>
      <Link to="/about" className="aboutLink">
        About
      </Link>

      <a
        href="https://www.facebook.com/groups/1780323492061614"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join us on Facebook"
        title="Facebook Group"
      >
        <img className="footImg" src="/facebook.png" alt="Facebook" />
      </a>

      <a
        href="https://www.discord.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join our Discord server"
        title="Discord Server"
      >
        <img className="footImg discord" src="/discord.png" alt="Discord" />
      </a>

      <a
        href="https://github.com/bwolfe53144"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View my GitHub profile"
        title="GitHub"
      >
        <img className="footImg" src="/github.png" alt="GitHub" />
      </a>
    </div>
  );
};

export default Footer;