//frontend\src\pages\DashboardPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { listUsers } from "../api/users";
import GeneratePanel from "../components/GeneratePanel";
import UsersPanel from "../components/UsersPanel";
import RecordsTable from "../components/RecordsTable";
import ChangePasswordPanel from "../components/ChangePasswordPanel";

const TABS = [
  { id: "generate", label: "Generate" },
  { id: "users", label: "Users" },
  { id: "records", label: "Records" },
  { id: "account", label: "Account" },
];

export default function DashboardPage() {
  const { username, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [recordsRefresh, setRecordsRefresh] = useState(0);
  const [activeTab, setActiveTab] = useState("generate");

  const loadUsers = useCallback(async () => {
    try {
      const data = await listUsers();
      setUsers(data);
    } catch {
      /* 401 handled by interceptor */
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function handleAssigned() {
    loadUsers();
    setRecordsRefresh((k) => k + 1);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-brand">
          <span className="app-mark">KWS</span>
          <span className="app-header-title">Number Allocation</span>
        </div>
        <div className="app-header-actions">
          <span className="app-user">{username}</span>
          <button className="btn-ghost" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <nav className="tab-nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={"tab" + (activeTab === t.id ? " active" : "")}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="tab-content">
        {activeTab === "generate" && (
          <div className="view-narrow">
            <GeneratePanel users={users} onAssigned={handleAssigned} />
          </div>
        )}
        {activeTab === "users" && (
          <div className="view-medium">
            <UsersPanel users={users} onChanged={loadUsers} />
          </div>
        )}
        {activeTab === "records" && (
          <div className="view-wide">
            <RecordsTable users={users} refreshKey={recordsRefresh} />
          </div>
        )}
        {activeTab === "account" && (
          <div className="view-narrow">
            <ChangePasswordPanel />
          </div>
        )}
      </main>
    </div>
  );
}
