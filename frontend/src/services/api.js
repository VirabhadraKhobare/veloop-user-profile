import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authApi = {
  getCurrentUser: () => api.get("/auth/me"),
  login: (credentials) => api.post("/auth/login", credentials),
  register: (details) => api.post("/auth/register", details),
  logout: () => api.post("/auth/logout"),
  updateProfile: (details) => api.patch("/auth/me", details),
};

export const profileApi = {
  me: () => api.get("/profile/me"),
};

export const rewardsApi = {
  summary: () => api.get("/rewards/summary"),
  transactions: (params) => api.get("/rewards/transactions", { params }),
};

export const achievementsApi = {
  all: () => api.get("/achievements"),
  mine: () => api.get("/achievements/my"),
  summary: () => api.get("/achievements/summary"),
};

export const referralsApi = {
  summary: () => api.get("/referrals/summary"),
  list: () => api.get("/referrals"),
};

export const withdrawalsApi = {
  summary: () => api.get("/withdrawals/summary"),
  list: () => api.get("/withdrawals"),
  create: (details) => api.post("/withdrawals", details),
};

export const adminApi = {
  dashboard: () => api.get("/admin/dashboard"),
  users: (params) => api.get("/admin/users", { params }),
  user: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, details) => api.patch(`/admin/users/${id}/status`, details),
  withdrawals: () => api.get("/admin/withdrawals"),
  updateWithdrawal: (id, details) => api.patch(`/admin/withdrawals/${id}`, details),
  auditLogs: (params) => api.get("/admin/audit-logs", { params }),
};

export default api;
