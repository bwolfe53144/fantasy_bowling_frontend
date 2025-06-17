import React from "react";

export default function EditTeamName({ visible, name, setName, onSave, onCancel, buttonStyle }) {
  return !visible ? (
    <button style={buttonStyle} onClick={() => onSave(true)}>Change Team Name</button>
  ) : (
    <div>
      <input
        type="text"
        placeholder="Enter new team name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginRight: "0.5rem" }}
      />
      <button style={buttonStyle} onClick={() => onSave(false)}>Submit</button>
      <button onClick={onCancel} style={{ marginLeft: "0.5rem" }}>Cancel</button>
    </div>
  );
}