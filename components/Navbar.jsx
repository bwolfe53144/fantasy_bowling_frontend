import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../src/utils/AuthContext";
import { getCurrentWeek } from "../src/utils/api";
import { getThemeColors } from '../src/utils/themeColors';   

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const [currentWeek, setCurrentWeek] = useState(null);

  useEffect(() => {
    async function fetchCurrentWeek() {
      try {
        const response = await getCurrentWeek();
        setCurrentWeek(response.data.currentWeek);
      } catch (error) {
        console.error("Error fetching current week:", error);
      }
    }
    fetchCurrentWeek();
  }, []);

  // Get the theme colors based on the user's selected theme
  const theme = getThemeColors(user?.color); 

  const navStyle = {
    backgroundColor: theme.backgroundColor,   
    color: theme.color,
  };

  const iconFill = theme.color;  

  const navItems = [
    { to: "/", label: "Home", icon: HomeIcon },
  
    ...(user?.role 
      ? [{ to: "/profile", label: "Profile", icon: AccountIcon }]
      : []),
  
    ...(user?.role === "MANAGER" || user?.role === "ADMIN" || user?.role === "SUPERADMIN"
      ? [{ to: `/roster/week/${currentWeek}`, label: "Roster", icon: RosterIcon }]
      : []),
  
    { to: `/schedule/${currentWeek ?? 1}`, label: "Schedule", icon: CalendarIcon },
    { to: "/stats", label: "Stats", icon: ChartIcon },
    { to: "/players", label: "Available Players", icon: PlayersIcon },
    { to: "/leaderboard", label: "Leaderboard", icon: TrophyIcon },
  
    ...(user
      ? [{ to: "/forum", label: "Forum", icon: ForumIcon }]
      : []),
  
    { to: "/rules", label: "Rules", icon: BowlingIcon },
  ];

  return (
    <nav className="navbar" style={navStyle} role="navigation" aria-label="Main navigation">
      {navItems.map(({ to, label, icon: Icon }) => (
        <Link key={label} to={to} aria-label={`Go to ${label} page`}>
          <button className="navBtn" style={{ color: iconFill }}>
            <Icon fill={iconFill} />
            <span style={{ color: iconFill }}>{label}</span>
          </button>
        </Link>
      ))}
    </nav>
  );
};

export default Navbar;

const svgProps = {
  width: 32,
  height: 32,
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
};

const HomeIcon = ({ fill }) => (
  <svg {...svgProps} fill={fill}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
);

const AccountIcon = ({ fill }) => (
  <svg {...svgProps} fill={fill}><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8V22h19.2v-2.8c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
);

const RosterIcon = ({ fill }) => (
  <svg {...svgProps} fill={fill}><path d="M16 11c1.7 0 3-1.3 3-3S17.7 5 16 5s-3 1.3-3 3 1.3 3 3 3zm-8 0c1.7 0 3-1.3 3-3S9.7 5 8 5 5 6.3 5 8s1.3 3 3 3zm0 2c-2.3 0-7 1.2-7 3.5V19h14v-2.5C15 14.2 10.3 13 8 13zm8 0c-.3 0-.7 0-1 .1 1.2.8 2 1.9 2 3.4V19h6v-2.5c0-2.3-4.7-3.5-7-3.5z"/></svg>
);

const CalendarIcon = ({ fill }) => (
  <svg {...svgProps} fill={fill}><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>
);

const ChartIcon = ({ fill }) => (
  <svg {...svgProps} fill={fill}><path d="M9 17H7V10H9V17M13 17H11V7H13V17M17 17H15V13H17V17M19 19H5V5H19V19.1M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z"/></svg>
);

const PlayersIcon = ({ fill }) => (
  <svg {...svgProps} fill={fill}><path d="M19 17V19H7V17S7 13 13 13 19 17 19 17M16 8A3 3 0 1 0 13 11A3 3 0 0 0 16 8M19.2 13.06A5.6 5.6 0 0 1 21 17V19H24V17S24 13.55 19.2 13.06M18 5A2.91 2.91 0 0 0 17.11 5.14A5 5 0 0 1 17.11 10.86A2.91 2.91 0 0 0 18 11A3 3 0 0 0 18 5M8 10H5V7H3V10H0V12H3V15H5V12H8Z"/></svg>
);

const TrophyIcon = ({ fill }) => (
  <svg {...svgProps} fill={fill}><path d="M17 4V2H7v2H2v4c0 3.1 2.5 5.6 5.6 5.9C8.7 15.4 10 17 10 19v1H6v2h12v-2h-4v-1c0-2 1.3-3.6 2.4-5.1 3.1-.3 5.6-2.8 5.6-5.9V4h-5zM4 8V6h3v4c0 .7.1 1.4.3 2.1C5.4 11.7 4 10 4 8zm16 0c0 2-1.4 3.7-3.3 4.1.2-.7.3-1.4.3-2.1V6h3v2z"/></svg>
);

const ForumIcon = ({ fill }) => (
  <svg {...svgProps} fill={fill}><path d="M20 2H4c-1.1 0-2 .9-2 2v14l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 9H6V9h12v2zm0-3H6V6h12v2z"/></svg>
);

const BowlingIcon = ({ fill }) => (
  <svg {...svgProps} fill={fill}><path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12.5,11A1.5,1.5 0 0,0 11,12.5A1.5,1.5 0 0,0 12.5,14A1.5,1.5 0 0,0 14,12.5A1.5,1.5 0 0,0 12.5,11M12,5A2,2 0 0,0 10,7A2,2 0 0,0 12,9A2,2 0 0,0 14,7A2,2 0 0,0 12,5M5.93,8.5C5.38,9.45 5.71,10.67 6.66,11.22C7.62,11.78 8.84,11.45 9.4,10.5C9.95,9.53 9.62,8.31 8.66,7.76C7.71,7.21 6.5,7.53 5.93,8.5Z"/></svg>
);