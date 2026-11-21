require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./db");

const users = [
  ["Admin Manager", "admin@company.com", "admin123", "admin"],
  ["Demo Employee", "employee@company.com", "employee123", "employee"],
];
const insert = db.prepare(
  "INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
);
users.forEach(([n, e, p, r]) => insert.run(n, e, bcrypt.hashSync(p, 10), r));
console.log("Seeded demo accounts:\n  admin@company.com / admin123\n  employee@company.com / employee123");
