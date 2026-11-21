# Leave Management – Backend

REST API built with **Node.js, Express, SQLite (better-sqlite3) and JWT auth**.

## Run it

```bash
npm install
npm run seed             # creates demo admin + employee accounts
npm start                # http://localhost:5000
```

A `.env` file is included (copy of `.env.example`). Change `JWT_SECRET` before deploying.
Requires Node.js 18+. The SQLite file (`leave.db`) is created automatically.

Demo logins (after `npm run seed`):

| Role     | Email                 | Password      |
|----------|-----------------------|---------------|
| Admin    | admin@company.com     | admin123      |
| Employee | employee@company.com  | employee123   |

## Business rules
- Only weekdays (Mon-Fri) count toward leave days.
- Default yearly allowance: Casual 12, Sick 10, Earned 15 (edit in `src/db.js`).
- Pending + approved requests count against the balance.
- Overlapping pending/approved requests are rejected.
- Employees can cancel their own pending requests; admins approve or reject.

## API

All routes except register/login need `Authorization: Bearer <token>`.

| Method | Route                     | Who      | Purpose |
|--------|---------------------------|----------|---------|
| POST   | /api/auth/register        | public   | Create employee account |
| POST   | /api/auth/login           | public   | Log in, returns token |
| GET    | /api/auth/me              | user     | Current user |
| GET    | /api/leaves/types         | user     | Leave types |
| GET    | /api/leaves/balance       | user     | Balance per type this year |
| GET    | /api/leaves               | user     | My requests |
| POST   | /api/leaves               | user     | Apply `{leave_type_id,start_date,end_date,reason}` |
| DELETE | /api/leaves/:id           | user     | Cancel my pending request |
| GET    | /api/admin/leaves?status= | admin    | All requests |
| PATCH  | /api/admin/leaves/:id     | admin    | `{status:"approved"|"rejected",comment}` |
| GET    | /api/admin/employees      | admin    | Employees + days taken |

## Structure
```
src/
  server.js        app setup
  db.js            schema + default leave types
  seed.js          demo accounts
  utils.js         working-day calculation
  middleware/auth.js
  routes/{auth,leaves,admin}.js
```
