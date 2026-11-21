import { useEffect, useState } from "react";
import { api, getToken, setToken } from "./api.js";
import AuthPage from "./components/AuthPage.jsx";
import EmployeeView from "./components/EmployeeView.jsx";
import AdminView from "./components/AdminView.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api
      .me()
      .then((r) => setUser(r.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  if (loading) return <p className="center-note">Loading…</p>;
  if (!user) return <AuthPage onAuth={(token, u) => { setToken(token); setUser(u); }} />;

  return (
    <div className="shell">
      <header className="topbar">
        <h1 className="brand">Leave Desk</h1>
        <div className="who">
          <span>{user.name}{user.role === "admin" ? " (admin)" : ""}</span>
          <button className="btn ghost" onClick={logout}>Log out</button>
        </div>
      </header>
      <main>{user.role === "admin" ? <AdminView /> : <EmployeeView />}</main>
    </div>
  );
}
