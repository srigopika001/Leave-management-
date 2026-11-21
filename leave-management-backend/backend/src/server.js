require("dotenv").config();
const express = require("express");
const cors = require("cors");

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Copy .env.example to .env and set it.");
  process.exit(1);
}

require("./db");
const app = express();

app.use(cors());
app.use(express.json());
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/leaves", require("./routes/leaves"));
app.use("/api/admin", require("./routes/admin"));
app.use("/auth", require("./routes/auth"));
app.use("/leaves", require("./routes/leaves"));
app.use("/admin", require("./routes/admin"));
app.use((req, res) => res.status(404).json({ error: "Route not found." }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Leave API running on http://localhost:${port}`));
