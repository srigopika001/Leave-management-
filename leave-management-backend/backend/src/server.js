require("dotenv").config();
const express = require("express");
const cors = require("cors");

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Copy .env.example to .env and set it.");
  process.exit(1);
}

require("./db");
const app = express();

app.use(cors({ origin: (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",") }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/leaves", require("./routes/leaves"));
app.use("/api/admin", require("./routes/admin"));
app.use("/auth", authRoutes);
app.use("/leaves", leaveRoutes);
app.use("/users", userRoutes);
app.use((req, res) => res.status(404).json({ error: "Route not found." }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Leave API running on http://localhost:${port}`));
