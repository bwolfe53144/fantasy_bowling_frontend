import { useEffect, useContext, useState } from "react";
import { AuthContext } from "./utils/AuthContext";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingScreen from "../components/LoadingScreen.jsx";

const Other = () => {
  const { user, players, loading} = useContext(AuthContext); // Use loading from context
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  if (loading) {
    return  <LoadingScreen />
  }
  
  return (
    <div className="pageContainer">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar />
        <div className="mainPage">Other Page</div>
        <Footer />
        </div>
  );
};

export default Other;