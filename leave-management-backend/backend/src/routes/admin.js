const express = require("express");
const db = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, requireAdmin);

// All requests (optionally ?status=pending)
router.get("/leaves", (req, res) => {
  const { status } = req.query;
  const params = [];
  let where = "";
  if (status) {
    where = "WHERE r.status = ?";
    params.push(status);
  }
  const rows = db
    .prepare(
      `SELECT r.*, t.name AS leave_type, u.name AS employee_name, u.email AS employee_email
       FROM leave_requests r
       JOIN leave_types t ON t.id = r.leave_type_id
       JOIN users u ON u.id = r.user_id
       ${where}
       ORDER BY (r.status = 'pending') DESC, r.start_date ASC`
    )
    .all(...params);
  res.json(rows);
});

// Approve or reject
router.patch("/leaves/:id", (req, res) => {
  const { status, comment } = req.body || {};
  if (!["approved", "rejected"].includes(status))
    return res.status(400).json({ error: "Status must be 'approved' or 'rejected'." });

  const row = db.prepare("SELECT * FROM leave_requests WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Leave request not found." });
  if (row.status !== "pending")
    return res.status(400).json({ error: `This request is already ${row.status}.` });

  db.prepare(
    `UPDATE leave_requests
     SET status = ?, admin_comment = ?, decided_by = ?, decided_at = datetime('now')
     WHERE id = ?`
  ).run(status, (comment || "").trim() || null, req.user.id, row.id);
  res.json(db.prepare("SELECT * FROM leave_requests WHERE id = ?").get(row.id));
});

// Employee list with this year's usage
router.get("/employees", (req, res) => {
  const year = String(new Date().getFullYear());
  const rows = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.role,
        COALESCE(SUM(CASE WHEN r.status = 'approved' AND substr(r.start_date,1,4) = ? THEN r.days END), 0) AS days_taken
       FROM users u LEFT JOIN leave_requests r ON r.user_id = u.id
       GROUP BY u.id ORDER BY u.name`
    )
    .all(year);
  res.json(rows);
});

module.exports = router;
