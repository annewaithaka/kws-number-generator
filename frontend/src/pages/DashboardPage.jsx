//frontend\src\pages\DashboardPage.jsx
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { username, logout } = useAuth();

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

      <main className="app-main">
        <div className="placeholder-card">
          <h2>You're signed in.</h2>
          <p>
            The dashboard — managing users, generating numbers, and the records
            table with search and export — gets built in the next step.
          </p>
        </div>
      </main>
    </div>
  );
}
