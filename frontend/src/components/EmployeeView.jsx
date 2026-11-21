import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import BalanceLedger from "./BalanceLedger.jsx";
import ApplyForm from "./ApplyForm.jsx";
import StatusPill from "./StatusPill.jsx";

export default function EmployeeView() {
  const [types, setTypes] = useState([]);
  const [balance, setBalance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [t, b, l] = await Promise.all([api.types(), api.balance(), api.myLeaves()]);
      setTypes(t); setBalance(b); setLeaves(l);
    } catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function cancel(id) {
    if (!confirm("Cancel this leave request?")) return;
    try { await api.cancel(id); load(); } catch (e) { setError(e.message); }
  }

  return (
    <div className="grid">
      <div className="col">
        <BalanceLedger balance={balance} />
        <section>
          <h2>Your requests</h2>
          {error && <p className="error">{error}</p>}
          {leaves.length === 0 ? (
            <p className="empty">No leave requested yet. Use the form to book your first day off.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Type</th><th>Dates</th><th>Days</th><th>Status</th><th>Manager note</th><th></th></tr></thead>
                <tbody>
                  {leaves.map((l) => (
                    <tr key={l.id}>
                      <td>{l.leave_type}</td>
                      <td>{l.start_date === l.end_date ? l.start_date : `${l.start_date} to ${l.end_date}`}</td>
                      <td>{l.days}</td>
                      <td><StatusPill status={l.status} /></td>
                      <td>{l.admin_comment || "—"}</td>
                      <td>{l.status === "pending" && <button className="btn ghost small" onClick={() => cancel(l.id)}>Cancel</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      <aside className="col side"><ApplyForm types={types} onApplied={load} /></aside>
    </div>
  );
}
