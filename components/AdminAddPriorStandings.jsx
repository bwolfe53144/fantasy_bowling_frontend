import { useState } from "react";
import { addPriorYearStanding } from "../src/utils/api";

const AdminAddPriorStandings = ({ teams, users }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    year: "",
    place: "",
    wins: "",
    losses: "",
    ties: "",
    pointsFor: "",
    pointsAgainst: "",
    streak: "",
    captainName: "",
    captainUserId: "",
    teamId: "",
    teamName: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "teamId") {
      const selectedTeam = teams.find((team) => team.id === value);
      setForm({
        ...form,
        teamId: value,
        teamName: selectedTeam ? selectedTeam.name : "",
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async () => {
    const required = [
      "year",
      "place",
      "wins",
      "losses",
      "ties",
      "pointsFor",
      "pointsAgainst",
      "captainName",
      "teamName",
    ];
    const missing = required.filter((f) => !form[f]);
    if (missing.length) {
      setErrorMessage(`Missing fields: ${missing.join(", ")}`);
      setShowErrorModal(true);
      return;
    }

    try {
      const res = await addPriorYearStanding(form);
      if (res.status === 201) {
        setShowSuccessModal(true);
        setForm({
          ...form,
          place: "",
          wins: "",
          losses: "",
          ties: "",
          pointsFor: "",
          pointsAgainst: "",
          streak: "",
        });
      } else {
        throw new Error("Unexpected response");
      }
    } catch (err) {
      setErrorMessage("Error submitting prior year standing");
      setShowErrorModal(true);
      console.error(err);
    }
  };

  return (
    <div className="admin-section">
      <button
        className="admin-button"
        onClick={() => setShowForm((prev) => !prev)}
        style={{ marginBottom: "1rem" }}
      >
        {showForm ? "Hide Add Prior Standing 🔽" : "Add Prior Year Standing 🔼"}
      </button>

      {showForm && (
        <div className="admin-form">
          <input
            type="number"
            name="year"
            placeholder="Year"
            value={form.year}
            onChange={handleChange}
          />
          <input
            type="number"
            name="place"
            placeholder="Place"
            value={form.place}
            onChange={handleChange}
          />
          <input
            type="number"
            name="wins"
            placeholder="Wins"
            value={form.wins}
            onChange={handleChange}
          />
          <input
            type="number"
            name="losses"
            placeholder="Losses"
            value={form.losses}
            onChange={handleChange}
          />
          <input
            type="number"
            name="ties"
            placeholder="Ties"
            value={form.ties}
            onChange={handleChange}
          />
          <input
            type="number"
            name="pointsFor"
            placeholder="Points For"
            value={form.pointsFor}
            onChange={handleChange}
          />
          <input
            type="number"
            name="pointsAgainst"
            placeholder="Points Against"
            value={form.pointsAgainst}
            onChange={handleChange}
          />
          <input
            type="text"
            name="streak"
            placeholder="Streak (optional)"
            value={form.streak}
            onChange={handleChange}
          />
          <input
            type="text"
            name="captainName"
            placeholder="Captain Name"
            value={form.captainName}
            onChange={handleChange}
          />
          <input
            type="text"
            name="teamName"
            placeholder="Team Name"
            value={form.teamName}
            onChange={handleChange}
          />

          <select name="teamId" value={form.teamId} onChange={handleChange}>
            <option value="">(Optional) Link to Team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>

          <select
            name="captainUserId"
            value={form.captainUserId}
            onChange={handleChange}
          >
            <option value="">(Optional) Link to Captain User</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          <button className="admin-button" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h2>Success!</h2>
            <p>Prior year standing added successfully.</p>
            <div className="modalActions">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="modal-cancel-button"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h2>Error</h2>
            <p>{errorMessage}</p>
            <div className="modalActions">
              <button
                onClick={() => setShowErrorModal(false)}
                className="modal-cancel-button"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAddPriorStandings;