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
    document.documentElement.classList.add("rules-bg");
    document.body.classList.add("rules-bg");
    return () => {
      document.documentElement.classList.remove("rules-bg");
      document.body.classList.remove("rules-bg");
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="pageContainer rules">
      <Header onToggleMenu={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Navbar page="rules" />
      <div className="mainPage rules">
        <h1>Rules</h1>

        <h2>General Rules</h2>
        <ul>
          <li>Rosters will consist of 15 players. </li>
          <li>
            Leagues included in fantasy bowling this year will be Ren Faire (Friday Nights at Sheridan),
            Beavers Latestarters (Wednesday Nights at GRC), Cheri's Night Out (Wednesday Nights at GRC),
            Andy's Classic (Tuesday Nights at GRC), Sunday AM (Sunday Mornings at Sheridan), and Inner City (Thursday Nights at Surfside).
          </li>
          <li>
            <strong>Note:</strong> Bowlers drafted from the Sunday AM league will <strong>not</strong> be eligible
            for the fantasy playoffs since that league only runs 30 weeks and the playoffs start week 31.
          </li>
          <li>
            The leagues mentioned above as well as Heyden Classic
            (Thursday Nights at GRC) will be included for Survivor Bowling.
          </li>
          <li>Each week you will start a bowler in each position (1,2,3,4,5).</li>
          <li>
            You will also start a flex player each week. Your flex bowler can bowl anywhere in the lineup.
          </li>
          <li>Any team that drafts you can not use you the week they play you.</li>
          <li>
            Your bench players will take the spot of your starter in the case your starter doesn’t bowl that week.
            If your flex player is a bench position player as well, they will move to your missing position and your
            bench flex player will take that spot. EX: Luis bowls in the 3rd spot in your lineup and so does your flex
            bowler John. John would take Luis’s spot if Luis misses and your bench flex would take John’s spot.
          </li>
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
            Scratch Series:<br />
            series &lt; 500: 0pt<br />
            series &lt; 550: 1pt<br />
            series &lt; 600: 2pt<br />
            series &lt; 625: 7pt<br />
            series &lt; 650: 8pt<br />
            series &lt; 675: 9pt<br />
            series &lt; 700: 10pt<br />
            series &lt; 725: 15pt<br />
            series &lt; 750: 17pt<br />
            series &lt; 775: 19pt<br />
            series &lt; 800: 21pt<br />
            series &gt; 799: 30pt<br />
          </p>

          <p>
            Handicap Series:<br />
            series &lt; 0: 0pt<br />
            series &lt; 20: 1pt<br />
            series &lt; 30: 2pt<br />
            series &lt; 40: 3pt<br />
            series &lt; 50: 4pt<br />
            series &lt; 60: 9pt<br />
            series &lt; 70: 11pt<br />
            series &lt; 80: 13pt<br />
            series &lt; 90: 15pt<br />
            series &lt; 100: 17pt<br />
            series &lt; 125: 22pt<br />
            series &lt; 150: 30pt<br />
            series &gt; 150: 40pt<br />
          </p>
        </div>

        <h2>Draft</h2>
        <p>
          We will have an online draft on September 14th at 12:30 PM. I will have a draft party at my house for those interested, 
          but bring your own laptop (You can draft on your phone as well, 
          just easier to do on a computer). I'd advise against doing 
          the draft on the mobile app, it needs to get refreshed if 
          you move tabs, and sound doesn't work on there all the time. 
          The draft will be a snake draft. For example, 1 picks then 2... 
          then 2nd to last, then last, then last, then 2nd to last, ..., 
          then 2nd, then 1st. The draft order will be determined by
          your bowling average for those teams drafting themselves.
        </p>
        <p>
          You will also be able to automatically draft yourself based on how many teams we have
          and your average. For example, if there are 20 teams and I have the 30th best average, I could get myself automatically
          in the third round. Also, if you bowl in multiple leagues that are included, you can draft yourself in the previous round
          as well.
        </p>

        <h2>Free Agency</h2>
        <p>
          Looking to strengthen your lineup? Head over to the Available Players section and click the Add Player button next to any
          free agent you'd like to claim. Once you've made your selection, you'll be prompted to choose a player from your current
          roster to drop—if your claim goes through.
        </p>
        <p>
          Claims are processed at 7 AM after a minimum of 48 hours has passed since your claim. For example, if you place a claim
          at 5 AM on December 5th, it will be resolved at 7 AM on December 7th. This timing ensures fairness and gives all managers
          a chance to make claims.
        </p>
        <p>
          If multiple teams place a claim on the same player, one will be chosen at random to receive them. You can track your
          pending and completed claims anytime from your Profile page.
        </p>

        <h2>Lineups & Roster Management</h2>
        <p>
          The <strong>Regular Roster</strong> page lets you set your lineup for the entire season in advance for any weeks that haven't
          started yet. If you prefer to manage week-to-week, the <strong>Roster</strong> page allows you to update your lineup
          each week individually. This flexibility gives you full control over how you manage your team strategy.
        </p>

        <h2>Survivor League</h2>
        <p>
          The <strong>Survivor League</strong> is a special game mode where you build a "survivor" team by picking 5 bowlers from a
          league each week and ranking them from 1 to 5. Your top-ranked bowler (who bowled that week) will count as your active score.
        </p>
        <p>
          To advance each week, your chosen bowler must finish in the top 30–40% of all scores in that league. Once you use a bowler,
          they cannot be used again for the rest of the season. If your top bowler doesn’t qualify, you're eliminated!
        </p>
        <p>
          The rest of your bowlers (who weren’t used that week) remain eligible and can be used in future weeks. The game continues
          until only one team remains — the last team standing wins.
        </p>

        <h2>More Information</h2>
        <p>
          For any other questions, please check the <strong>About</strong> page (link at the bottom of the site) for additional details
          about fantasy bowling and how it works.
        </p>
      </div>
      <Footer page="rules" />
    </div>
  );
};

export default Rules;