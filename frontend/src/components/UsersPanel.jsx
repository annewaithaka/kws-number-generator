//frontend\src\components\UsersPanel.jsx
import { useState } from "react";
import { createUser, updateUser, deleteUser } from "../api/users";

const MAX_USERS = 9;

export default function UsersPanel({ users, onChanged }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  async function handleAdd() {
    setError("");
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    try {
      await createUser({ name: name.trim(), email: email.trim() || null });
      setName("");
      setEmail("");
      onChanged();
    } catch (err) {
      setError(err.response?.data?.error || "Could not add the user.");
    }
  }

  function startEdit(u) {
    setEditingId(u.id);
    setEditName(u.name);
    setEditEmail(u.email || "");
    setError("");
  }

  async function saveEdit(id) {
    setError("");
    if (!editName.trim()) {
      setError("Name is required.");
      return;
    }
    try {
      await updateUser(id, { name: editName.trim(), email: editEmail.trim() || null });
      setEditingId(null);
      onChanged();
    } catch (err) {
      setError(err.response?.data?.error || "Could not save changes.");
    }
  }

  async function handleDelete(u) {
    if (!window.confirm(`Delete ${u.name}?`)) return;
    setError("");
    try {
      await deleteUser(u.id);
      onChanged();
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete the user.");
    }
  }

  const atCap = users.length >= MAX_USERS;

  return (
    <section className="card">
      <h2 className="card-title">
        Users <span className="count-badge">{users.length}/{MAX_USERS}</span>
      </h2>

      {error && <div className="inline-error">{error}</div>}

      <ul className="user-list">
        {users.map((u) => (
          <li key={u.id} className="user-row">
            {editingId === u.id ? (
              <div className="user-edit">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Name"
                />
                <input
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Email (optional)"
                />
                <div className="row-actions">
                  <button className="btn-small btn-primary" onClick={() => saveEdit(u.id)}>
                    Save
                  </button>
                  <button className="btn-small btn-ghost" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="user-info">
                  <span className="user-name">{u.name}</span>
                  <span className="user-meta">
                    {u.email || "no email"} · {u.assignment_count} number
                    {u.assignment_count === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="row-actions">
                  <button className="btn-small btn-ghost" onClick={() => startEdit(u)}>
                    Edit
                  </button>
                  <button className="btn-small btn-ghost" onClick={() => handleDelete(u)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
        {users.length === 0 && <li className="muted">No users yet.</li>}
      </ul>

      {atCap ? (
        <p className="muted">Maximum of {MAX_USERS} users reached.</p>
      ) : (
        <div className="user-add">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional)"
          />
          <button className="btn-small btn-primary" onClick={handleAdd}>
            Add
          </button>
        </div>
      )}
    </section>
  );
}
