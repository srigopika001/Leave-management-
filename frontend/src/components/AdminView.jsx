import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import StatusPill from "./StatusPill.jsx";

export default function AdminView() {
  const [filter, setFilter] = useState("pending");
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [comments, setComments] = useState({});
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [l, e] = await Promise.all([api.adminLeaves(filter === "all" ? "" : filter), api.employees()]);
      setLeaves(l); setEmployees(e);
    } catch (err) { setError(err.message); }
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  async function decide(id, status) {
    setError("");
    try { await api.decide(id, status, comments[id]); load(); } catch (e) { setError(e.message); }
  }

  return (
    <div className="grid">
      <div className="col">
        <section>
          <div className="row-between">
            <h2>Leave requests</h2>
            <div className="tabs" role="tablist">
              {["pending", "approved", "rejected", "all"].map((s) => (
                <button key={s} role="tab" aria-selected={filter === s} className={filter === s ? "tab on" : "tab"} onClick={() => setFilter(s)}>{s}</button>
              ))}
            </div>
          </div>
          {error && <p className="error">{error}</p>}
          {leaves.length === 0 ? (
            <p className="empty">Nothing {filter === "all" ? "here yet" : filter}. New requests will show up here.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Days</th><th>Reason</th><th>Status</th><th>Decision</th></tr></thead>
                <tbody>
                  {leaves.map((l) => (
                    <tr key={l.id}>
                      <td>{l.employee_name}<div className="muted small">{l.employee_email}</div></td>
                      <td>{l.leave_type}</td>
                      <td>{l.start_date === l.end_date ? l.start_date : `${l.start_date} to ${l.end_date}`}</td>
                      <td>{l.days}</td>
                      <td>{l.reason || "—"}</td>
                      <td><StatusPill status={l.status} /></td>
                      <td>
                        {l.status === "pending" ? (
                          <div className="decide">
                            <input placeholder="Note (optional)" value={comments[l.id] || ""} onChange={(e) => setComments({ ...comments, [l.id]: e.target.value })} />
                            <div>
                              <button className="btn primary small" onClick={() => decide(l.id, "approved")}>Approve</button>{" "}
                              <button className="btn danger small" onClick={() => decide(l.id, "rejected")}>Reject</button>
                            </div>
                          </div>
                        ) : (l.admin_comment || "—")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      <aside className="col side">
        <section className="panel">
          <h2>Team this year</h2>
          <ul className="team">
            {employees.map((e) => (
              <li key={e.id}><span>{e.name}</span><strong>{e.days_taken} days</strong></li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}
