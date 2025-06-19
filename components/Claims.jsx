import { Link } from "react-router-dom";

const Claims = ({ myClaims }) => {
  if (myClaims.length === 0) {
    return <p>You have no claims currently.</p>;
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <div style={{ marginBottom: "10px" }}>
        <Link to="/my-claims">📌 View My Claimed Players ({myClaims.length})</Link>
      </div>
    </div>
  );
};

export default Claims;