const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getToken = () => localStorage.getItem("token");
export const setToken = (t) => (t ? localStorage.setItem("token", t) : localStorage.removeItem("token"));

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error("Cannot reach the server. Check that the backend is running.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "Request failed.");
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),
  register: (name, email, password) => request("/auth/register", { method: "POST", body: { name, email, password } }),
  me: () => request("/auth/me"),
  types: () => request("/leaves/types"),
  balance: () => request("/leaves/balance"),
  myLeaves: () => request("/leaves"),
  apply: (payload) => request("/leaves", { method: "POST", body: payload }),
  cancel: (id) => request(`/leaves/${id}`, { method: "DELETE" }),
  adminLeaves: (status) => request(`/admin/leaves${status ? `?status=${status}` : ""}`),
  decide: (id, status, comment) => request(`/admin/leaves/${id}`, { method: "PATCH", body: { status, comment } }),
  employees: () => request("/admin/employees"),
};
