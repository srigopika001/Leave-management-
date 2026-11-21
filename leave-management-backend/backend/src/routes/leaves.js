const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { countWorkingDays, isValidDate } = require("../utils");

const router = express.Router();
router.use(requireAuth);

// List leave types
router.get("/types", (req, res) => {
  res.json(db.prepare("SELECT * FROM leave_types ORDER BY id").all());
});

// Balance per leave type for the current year
router.get("/balance", (req, res) => {
  const year = String(new Date().getFullYear());
  const rows = db
    .prepare(
      `SELECT t.id, t.name, t.days_per_year AS total,
        COALESCE(SUM(CASE WHEN r.status = 'approved' THEN r.days END), 0) AS used,
        COALESCE(SUM(CASE WHEN r.status = 'pending' THEN r.days END), 0) AS pending
       FROM leave_types t
       LEFT JOIN leave_requests r
         ON r.leave_type_id = t.id AND r.user_id = ? AND substr(r.start_date, 1, 4) = ?
       GROUP BY t.id ORDER BY t.id`
    )
    .all(req.user.id, year);
  res.json(rows.map((r) => ({ ...r, remaining: r.total - r.used - r.pending })));
});

// My leave requests
router.get("/", (req, res) => {
  const rows = db
    .prepare(
      `SELECT r.*, t.name AS leave_type
       FROM leave_requests r JOIN leave_types t ON t.id = r.leave_type_id
       WHERE r.user_id = ? ORDER BY r.created_at DESC, r.id DESC`
    )
    .all(req.user.id);
  res.json(rows);
});

// Apply for leave
router.post("/", (req, res) => {
  const { leave_type_id, start_date, end_date, reason } = req.body || {};
  if (!leave_type_id || !start_date || !end_date)
    return res.status(400).json({ error: "Leave type, start date and end date are required." });
  if (!isValidDate(start_date) || !isValidDate(end_date))
    return res.status(400).json({ error: "Dates must be in YYYY-MM-DD format." });
  if (end_date < start_date)
    return res.status(400).json({ error: "End date cannot be before start date." });

  const type = db.prepare("SELECT * FROM leave_types WHERE id = ?").get(leave_type_id);
  if (!type) return res.status(400).json({ error: "Unknown leave type." });

  const days = countWorkingDays(start_date, end_date);
  if (days === 0)
    return res.status(400).json({ error: "The selected range only contains weekends." });

  // Overlap with existing pending/approved leave
  const overlap = db
    .prepare(
      `SELECT id FROM leave_requests
       WHERE user_id = ? AND status IN ('pending','approved')
         AND start_date <= ? AND end_date >= ?`
    )
    .get(req.user.id, end_date, start_date);
  if (overlap)
    return res.status(409).json({ error: "You already have leave booked during these dates." });

  // Balance check
  const year = start_date.slice(0, 4);
  const used = db
    .prepare(
      `SELECT COALESCE(SUM(days), 0) AS n FROM leave_requests
       WHERE user_id = ? AND leave_type_id = ? AND status IN ('pending','approved')
         AND substr(start_date, 1, 4) = ?`
    )
    .get(req.user.id, type.id, year).n;
  if (used + days > type.days_per_year)
    return res.status(400).json({
      error: `Not enough ${type.name} left. You asked for ${days} day(s) but only ${type.days_per_year - used} remain.`,
    });

  const info = db
    .prepare(
      `INSERT INTO leave_requests (user_id, leave_type_id, start_date, end_date, days, reason)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(req.user.id, type.id, start_date, end_date, days, (reason || "").trim() || null);
  res.status(201).json(db.prepare("SELECT * FROM leave_requests WHERE id = ?").get(info.lastInsertRowid));
});

// Cancel own pending request
router.delete("/:id", (req, res) => {
  const row = db
    .prepare("SELECT * FROM leave_requests WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: "Leave request not found." });
  if (row.status !== "pending")
    return res.status(400).json({ error: "Only pending requests can be cancelled." });
  db.prepare("UPDATE leave_requests SET status = 'cancelled' WHERE id = ?").run(row.id);
  res.json({ ok: true });
});

module.exports = router;
