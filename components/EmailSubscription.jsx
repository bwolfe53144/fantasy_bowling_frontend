import React from "react";

export default function EmailSubscription({
  email,
  subscribed,
  onEmailChange,
  onToggle,
  error,
  onBlur
}) {
  return (
    <div style={{ margin: "1rem 0" }}>
      <label style={{ display: "block", marginBottom: 8 }}>
        <input type="checkbox" checked={subscribed} onChange={onToggle} /> Subscribe to stats update emails
      </label>

      {(subscribed || !email) && (
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={onEmailChange}
          onBlur={onBlur}
          style={{ marginTop: 8, width: "100%", maxWidth: 300 }}
        />
      )}

      {error && <div style={{ color: "red", marginTop: 4 }}>{error}</div>}
    </div>
  );
}