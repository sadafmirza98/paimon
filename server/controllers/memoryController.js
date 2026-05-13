import { createMemory, getMemories, deleteMemory } from "../db/firestore.js";

export const addMemory = async (req, res) => {
  const uid = req.uid;
  const { title, content, type, tags, url, contextId } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Title is required." });
  }

  const memory = await createMemory({
    uid,
    title: title.trim(),
    content: content?.trim() || "",
    type: type || "note",
    tags: Array.isArray(tags) ? tags : [],
    url: url?.trim() || null,
    contextId: contextId || null,
  });

  res.status(201).json({ memory });
};

export const listMemories = async (req, res) => {
  const uid = req.uid;
  const { type, contextId, limit } = req.query;
  const memories = await getMemories({
    uid,
    type: type || undefined,
    contextId: contextId || undefined,
    limit: limit ? Number(limit) : 50,
  });
  res.json({ memories });
};

export const removeMemory = async (req, res) => {
  const uid = req.uid;
  const { id } = req.params;
  await deleteMemory({ uid, id });
  res.json({ message: "Memory removed." });
};
