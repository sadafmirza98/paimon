import {
  createDecision,
  getDecisions,
  updateDecision,
  deleteDecision,
} from "../db/firestore.js";
import { generateMemoryInsight } from "../services/aiService.js";
import { getMemories } from "../db/firestore.js";

export const addDecision = async (req, res) => {
  const { title, description, emotion, outcome, tags } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Title is required." });
  }

  const decision = await createDecision({
    title: title.trim(),
    description: description?.trim() || "",
    emotion: emotion || "neutral",
    outcome: outcome?.trim() || null,
    tags: Array.isArray(tags) ? tags : [],
  });

  res.status(201).json({ decision });
};

export const listDecisions = async (req, res) => {
  const { limit } = req.query;
  const decisions = await getDecisions({ limit: limit ? Number(limit) : 50 });
  res.json({ decisions });
};

export const patchDecision = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const decision = await updateDecision(id, updates);
  res.json({ decision });
};

export const removeDecision = async (req, res) => {
  const { id } = req.params;
  await deleteDecision(id);
  res.json({ message: "Decision removed." });
};

export const getInsights = async (req, res) => {
  const [memories, decisions] = await Promise.all([
    getMemories({ limit: 20 }),
    getDecisions({ limit: 15 }),
  ]);

  const insight = await generateMemoryInsight({ memories, decisions });
  res.json({ insight });
};
