import { createDecision, getDecisions, updateDecision, deleteDecision, getMemories } from "../db/firestore.js";
import { generateMemoryInsight } from "../services/aiService.js";

export const addDecision = async (req, res) => {
  const uid = req.uid;
  const { title, description, emotion, outcome, tags } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Title is required." });
  }

  const decision = await createDecision({
    uid,
    title: title.trim(),
    description: description?.trim() || "",
    emotion: emotion || "neutral",
    outcome: outcome?.trim() || null,
    tags: Array.isArray(tags) ? tags : [],
  });

  res.status(201).json({ decision });
};

export const listDecisions = async (req, res) => {
  const uid = req.uid;
  const { limit } = req.query;
  const decisions = await getDecisions({ uid, limit: limit ? Number(limit) : 50 });
  res.json({ decisions });
};

export const patchDecision = async (req, res) => {
  const uid = req.uid;
  const { id } = req.params;
  const decision = await updateDecision({ uid, id, updates: req.body });
  res.json({ decision });
};

export const removeDecision = async (req, res) => {
  const uid = req.uid;
  const { id } = req.params;
  await deleteDecision({ uid, id });
  res.json({ message: "Decision removed." });
};

export const getInsights = async (req, res) => {
  const uid = req.uid;
  const [memories, decisions] = await Promise.all([
    getMemories({ uid, limit: 20 }),
    getDecisions({ uid, limit: 15 }),
  ]);
  const insight = await generateMemoryInsight({ memories, decisions });
  res.json({ insight });
};
