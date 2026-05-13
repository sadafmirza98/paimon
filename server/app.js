import cors from "cors";
import express from "express";
import requireAuth from "./middleware/auth.js";
import chatRoutes from "./routes/chatRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import memoryRoutes from "./routes/memoryRoutes.js";
import decisionRoutes from "./routes/decisionRoutes.js";
import contextRoutes from "./routes/contextRoutes.js";

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// All routes below require a valid Firebase ID token
app.use("/api/chat", requireAuth, chatRoutes);
app.use("/api/history", requireAuth, historyRoutes);
app.use("/api/upload", requireAuth, uploadRoutes);
app.use("/api/memories", requireAuth, memoryRoutes);
app.use("/api/decisions", requireAuth, decisionRoutes);
app.use("/api/contexts", requireAuth, contextRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
});

export default app;
