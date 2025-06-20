export default function EditTeamName({ visible, name, setName, onSubmit, onCancel, onShowInput, buttonStyle }) {
  return !visible ? (
    <button style={buttonStyle} onClick={onShowInput}>Change Team Name</button>
  ) : (
    <div>
      <input
        type="text"
        placeholder="Enter new team name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginRight: "0.5rem" }}
      />
      <button style={buttonStyle} onClick={onSubmit}>Submit</button>
      <button className="cancelButton" onClick={onCancel}>Cancel</button>
    </div>
  );
}