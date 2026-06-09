//frontend\src\components\RecordsTable.jsx
import { useState, useEffect } from "react";
import { listNumbers, downloadNumbersCsv, updateNote } from "../api/numbers";

export default function RecordsTable({ users, refreshKey }) {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [sort, setSort] = useState("date");
  const [order, setOrder] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // note editing
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  function buildParams() {
    const p = { sort, order };
    if (search.trim()) p.search = search.trim();
    if (userId) p.user_id = userId;
    return p;
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await listNumbers(buildParams());
        if (active) setRows(data);
      } catch {
        /* 401 handled by the client interceptor */
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, userId, sort, order, refreshKey]);

  function toggleSort(col) {
    if (sort === col) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSort(col);
      setOrder(col === "date" ? "desc" : "asc");
    }
  }

  function sortIndicator(col) {
    if (sort !== col) return "";
    return order === "asc" ? " \u25B2" : " \u25BC";
  }

  function fmtDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleString();
  }

  function startEdit(row) {
    setError("");
    setEditingId(row.id);
    setEditValue(row.note || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
  }

  async function saveNote(id) {
    if (editingId !== id) return; // already saved/cancelled
    const original = rows.find((r) => r.id === id)?.note || "";
    const next = editValue.trim();
    setEditingId(null);
    if (next === original) return; // nothing changed
    try {
      const updated = await updateNote(id, next);
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, note: updated.note } : r)));
    } catch (err) {
      setError(err.response?.data?.error || "Could not save the note.");
    }
  }

  return (
    <section className="card records-card">
      <div className="records-head">
        <h2 className="card-title">Records</h2>
        <button
          className="btn-ghost"
          onClick={() => downloadNumbersCsv(buildParams())}
          disabled={rows.length === 0}
        >
          Export CSV
        </button>
      </div>

      <div className="records-controls">
        <input
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search number, note, or name"
        />
        <select value={userId} onChange={(e) => setUserId(e.target.value)}>
          <option value="">All users</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="inline-error">{error}</div>}

      <div className="table-wrap">
        <table className="records-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => toggleSort("number")}>
                Number{sortIndicator("number")}
              </th>
              <th className="sortable" onClick={() => toggleSort("user")}>
                User{sortIndicator("user")}
              </th>
              <th>Note</th>
              <th className="sortable" onClick={() => toggleSort("date")}>
                Assigned{sortIndicator("date")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="mono">{r.number}</td>
                <td>{r.user_name}</td>
                <td className="note-cell">
                  {editingId === r.id ? (
                    <input
                      className="note-input"
                      value={editValue}
                      autoFocus
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveNote(r.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      onBlur={() => saveNote(r.id)}
                    />
                  ) : (
                    <button className="note-display" onClick={() => startEdit(r)}>
                      {r.note ? r.note : <span className="note-empty">Add note</span>}
                    </button>
                  )}
                </td>
                <td className="muted">{fmtDate(r.assigned_at)}</td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="empty-cell">
                  No records match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
