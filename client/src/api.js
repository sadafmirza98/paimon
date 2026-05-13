const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "/api");

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ─── Chat ─────────────────────────────────────────────────────────────────────

export const fetchHistory = (contextId) =>
  request(`/history${contextId ? `?contextId=${contextId}` : ""}`);

export const clearHistory = (contextId) =>
  request(`/history${contextId ? `?contextId=${contextId}` : ""}`, { method: "DELETE" });

export const sendMessage = (message, contextId) =>
  request("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, contextId: contextId || null }),
  });

// ─── Upload ───────────────────────────────────────────────────────────────────

export const uploadDocument = ({ title, content, file }) => {
  const formData = new FormData();
  if (title) formData.append("title", title);
  if (content) formData.append("content", content);
  if (file) formData.append("file", file);
  return request("/upload", { method: "POST", body: formData });
};

// ─── Memories ─────────────────────────────────────────────────────────────────

export const fetchMemories = (params = {}) => {
  const qs = new URLSearchParams();
  if (params.type) qs.set("type", params.type);
  if (params.contextId) qs.set("contextId", params.contextId);
  if (params.limit) qs.set("limit", params.limit);
  const query = qs.toString();
  return request(`/memories${query ? `?${query}` : ""}`);
};

export const saveMemory = (data) =>
  request("/memories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const deleteMemory = (id) =>
  request(`/memories/${id}`, { method: "DELETE" });

// ─── Decisions ────────────────────────────────────────────────────────────────

export const fetchDecisions = () => request("/decisions");

export const saveDecision = (data) =>
  request("/decisions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const updateDecision = (id, data) =>
  request(`/decisions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const deleteDecision = (id) =>
  request(`/decisions/${id}`, { method: "DELETE" });

export const fetchInsights = () => request("/decisions/insights");

// ─── Contexts ─────────────────────────────────────────────────────────────────

export const fetchContexts = () => request("/contexts");

export const saveContext = (data) =>
  request("/contexts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const updateContext = (id, data) =>
  request(`/contexts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const deleteContext = (id) =>
  request(`/contexts/${id}`, { method: "DELETE" });
