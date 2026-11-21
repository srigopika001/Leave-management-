import { useState } from "react";
import { api } from "../api.js";

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res =
        mode === "login"
          ? await api.login(form.email, form.password)
          : await api.register(form.name, form.email, form.password);
      onAuth(res.token, res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <h1 className="brand">Leave Desk</h1>
        <p className="muted">{mode === "login" ? "Log in to book and track your time off." : "Create an employee account."}</p>

        {mode === "register" && (
          <label>Full name
            <input value={form.name} onChange={set("name")} required autoComplete="name" />
          </label>
        )}
        <label>Email
          <input type="email" value={form.email} onChange={set("email")} required autoComplete="email" />
        </label>
        <label>Password
          <input type="password" value={form.password} onChange={set("password")} required minLength={6}
                 autoComplete={mode === "login" ? "current-password" : "new-password"} />
        </label>

        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn primary" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>

        <p className="switch">
          {mode === "login" ? "New here?" : "Already registered?"}{" "}
          <button type="button" className="link" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
            {mode === "login" ? "Create an account" : "Log in"}
          </button>
        </p>
        {mode === "login" && (
          <p className="hint">Demo: employee@company.com / employee123 | admin@company.com / admin123</p>
        )}
      </form>
    </div>
  );
}
