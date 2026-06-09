//frontend\src\components\GeneratePanel.jsx
import { useState, useEffect } from "react";
import { assignNumber } from "../api/numbers";

export default function GeneratePanel({ users, onAssigned }) {
  const [userId, setUserId] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Default the dropdown to the first user once users have loaded.
  useEffect(() => {
    if (!userId && users.length > 0) {
      setUserId(String(users[0].id));
    }
  }, [users, userId]);

  async function handleGenerate() {
    setError("");
    setResult(null);
    if (!userId) {
      setError("Choose a user first.");
      return;
    }
    setBusy(true);
    try {
      const created = await assignNumber(Number(userId), note.trim());
      setResult(created);
      setNote("");
      onAssigned();
    } catch (err) {
      setError(err.response?.data?.error || "Could not generate a number.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <h2 className="card-title">Generate a number</h2>

      {users.length === 0 ? (
        <p className="muted">Add a user first, then you can assign numbers.</p>
      ) : (
        <>
          <label className="field">
            <span className="field-label">Assign to</span>
            <select value={userId} onChange={(e) => setUserId(e.target.value)}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Note (optional)</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Vehicle inspection batch"
            />
          </label>

          <button className="btn-primary" onClick={handleGenerate} disabled={busy}>
            {busy ? "Generating…" : "Generate & assign"}
          </button>

          {error && <div className="inline-error">{error}</div>}

          {result && (
            <div className="generate-result">
              <span className="result-number">{result.number}</span>
              <span className="result-text">assigned to {result.user_name}</span>
            </div>
          )}
        </>
      )}
    </section>
  );
}
