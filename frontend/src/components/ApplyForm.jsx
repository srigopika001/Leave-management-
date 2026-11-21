import { useState } from "react";
import { api } from "../api.js";

const today = () => new Date().toISOString().slice(0, 10);

export default function ApplyForm({ types, onApplied }) {
  const [form, setForm] = useState({ leave_type_id: "", start_date: today(), end_date: today(), reason: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.apply({ ...form, leave_type_id: Number(form.leave_type_id || types[0]?.id) });
      setForm({ ...form, reason: "" });
      onApplied();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel apply" onSubmit={submit}>
      <h2>Request leave</h2>
      <label>Leave type
        <select value={form.leave_type_id || types[0]?.id || ""} onChange={set("leave_type_id")}>
          {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </label>
      <div className="two">
        <label>From
          <input type="date" value={form.start_date} min={today()}
                 onChange={(e) => setForm({ ...form, start_date: e.target.value, end_date: e.target.value > form.end_date ? e.target.value : form.end_date })} required />
        </label>
        <label>To
          <input type="date" value={form.end_date} min={form.start_date} onChange={set("end_date")} required />
        </label>
      </div>
      <label>Reason (optional)
        <textarea rows={3} value={form.reason} onChange={set("reason")} />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn primary" disabled={busy}>{busy ? "Sending…" : "Send request"}</button>
    </form>
  );
}
