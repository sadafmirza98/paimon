const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "/api");

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const fetchHistory = () => request("/history");

export const clearHistory = () =>
  request("/history", {
    method: "DELETE",
  });

export const sendMessage = (message) =>
  request("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

export const uploadDocument = ({ title, content, file }) => {
  const formData = new FormData();

  if (title) {
    formData.append("title", title);
  }

  if (content) {
    formData.append("content", content);
  }

  if (file) {
    formData.append("file", file);
  }

  return request("/upload", {
    method: "POST",
    body: formData,
  });
};
