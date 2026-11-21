# Leave Management – Frontend

React + Vite single-page app for the Leave Desk system.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

Start the **backend** first (it runs on http://localhost:5000). If your API is elsewhere,
edit `VITE_API_URL` in `.env`.

Production build: `npm run build` (output in `dist/`).

## Screens
- **Login / Register**
- **Employee:** day-by-day balance ledger, request leave form, request history with cancel
- **Admin:** approve or reject pending requests with a note, filter by status, team summary

Demo logins (after running `npm run seed` in the backend):
- employee@company.com / employee123
- admin@company.com / admin123
