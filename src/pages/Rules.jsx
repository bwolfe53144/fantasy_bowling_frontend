import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../utils/AuthContext";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import LoadingScreen from "../../components/LoadingScreen";
import Navbar from "../../components/Navbar";
import '../styles/Rules.css';

const Rules = () => {
  const { loading } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menuOpen", isMenuOpen);
    return () => document.body.classList.remove("menuOpen");
  }, [isMenuOpen]);

  useEffect(() => {
    document.body.classList.add("rules-bg");
    return () => {
      document.body.classList.remove("rules-bg");
    };
  }, []);

  if (loading ) {
    return <LoadingScreen />;
  }

  return (
    <div className="pageContainer rules">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
        <Navbar page="rules"/>
        <div className="mainPage rules">
        <h1>Rules</h1>
        <h2>General Rules</h2>
            <ul>
                <li>Rosters will consist of 15 players. </li>
                <li>Each week you will start a bowler in each position (1,2,3,4,5).</li>
                <li>You will also start a flex player each week. 
                Your flex bowler can bowl anywhere in the lineup.</li>
                <li>Any team that drafts you can not use you the week they play you.</li> 
                <li>Your bench players will take the spot of your starter 
                in the case your starter doesn’t bowl that week. 
                If your flex player is a bench position player as well, 
                they will move to your missing position and your bench 
                flex player will take that spot. EX: Luis bowls in the 3rd spot 
                in your lineup and so does your flex bowler John. 
                John would take Luis’s spot if Luis misses and your bench 
                flex would take John’s spot.</li>
            </ul>
            <h2>Scoring</h2>
            <p>There will be scoring for each game and series based on scratch score and pins over average.</p>
            <div className="scoreText">
            <p>
                <strong>Scratch Game:</strong><br />
                Less than 100: 0pt<br />
                100–124: 1pt<br />
                125–149: 2pt<br />
                150–174: 3pt<br />
                175–198: 5pt<br />
                199–219: 7pt<br />
                220–239: 9pt<br />
                240–259: 12pt<br />
                260–278: 15pt<br />
                279–289: 18pt<br />
                290–299: 22pt<br />
                300: 30pt<br />
                </p>

                <p>
                <strong>Handicap Game:</strong><br />
                Less than 0: 0pt<br />
                0–19 over avg: 5pt<br />
                20–29 over avg: 6pt<br />
                30–39 over avg: 8pt<br />
                40–49 over avg: 10pt<br />
                50–59 over avg: 15pt<br />
                60–69 over avg: 17pt<br />
                70–79 over avg: 19pt<br />
                80–89 over avg: 21pt<br />
                90–99 over avg: 23pt<br />
                100–109 over avg: 30pt<br />
                110–124 over avg: 35pt<br />
                125+ over avg: 40pt<br />
                </p>
                <p>
                    Scratch Series:<br></br>        	
                    series &lt; 500: 0pt<br></br>        	 
                    series &lt; 550: 1pt<br></br>        	  
                    series &lt; 600: 2pt<br></br>       	   
                    series &lt; 625: 7pt<br></br>       	   
                    series &lt; 650: 8pt<br></br>       	   
                    series &lt; 675: 9pt<br></br>       	   
                    series &lt; 700: 10pt<br></br>      	  
                    series &lt; 725: 15pt<br></br>      	  
                    series &lt; 750: 17pt<br></br>      	 
                    series &lt; 775: 19pt<br></br>      	  
                    series &lt; 800: 21pt<br></br>      	 
                    series &gt; 799: 30pt<br></br>   
                </p>
                <p>
                    Handicap Series:<br></br> 
                    series &lt; 0: 0pt<br></br> 
                    series &lt; 20: 1pt<br></br> 
                    series &lt; 30: 2pt<br></br> 
                    series &lt; 40: 3pt<br></br> 
                    series &lt; 50: 4pt<br></br> 
                    series &lt; 60: 9pt<br></br> 
                    series &lt; 70: 11pt<br></br> 
                    series &lt; 80: 13pt<br></br> 
                    series &lt; 90: 15pt<br></br> 
                    series &lt; 100: 17pt<br></br> 
                    series &lt; 125: 22pt<br></br> 
                    series &lt; 150: 30pt<br></br> 
                    series &gt; 150: 40pt<br></br> 	                            
                </p>
            </div>
            <h2>Draft</h2>
            <p>
                We haven't determined the draft day or location yet. 
                The draft will be a snake draft For example, 1 picks then 2... 
                then 2nd to last, then last, then last, then 2nd to last, ... 
                , then 2nd, then 1st. 
                The draft order will be determined by your bowling average.
                We are doing it that way because you will also be able to 
                automatically draft yourself based on how many teams we have 
                and your average.
                For example, if there are 20 teams and I have the 30th best 
                average, I could get myself automatically in the second round. 
                Also, if you bowl in multiple leagues that are included, 
                you can draft yourself in the next round as well.
            </p>
            <h2>Free Agency</h2>
            <p>
            Looking to strengthen your lineup? Head over to the Available 
            Players section and click the Add Player button next to any free 
            agent you'd like to claim. Once you've made your selection, you'll 
            be prompted to choose a player from your current roster to drop—if 
            your claim goes through. Claims are processed after 48 hours, and 
            if multiple teams place a claim on the same player, one will be 
            chosen at random to receive them. You can track your pending and 
            completed claims anytime from your Profile page.
            </p>
        </div>
        <Footer page="rules"/>
        </div>
  );
};

export default Rules;