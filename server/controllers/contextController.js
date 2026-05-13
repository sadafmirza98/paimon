import {
  createContext,
  getContexts,
  updateContext,
  deleteContext,
} from "../db/firestore.js";

export const addContext = async (req, res) => {
  const { name, description, color } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Name is required." });
  }

  const context = await createContext({
    name: name.trim(),
    description: description?.trim() || "",
    color: color || "sky",
  });

  res.status(201).json({ context });
};

export const listContexts = async (req, res) => {
  const contexts = await getContexts();
  res.json({ contexts });
};

export const patchContext = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const context = await updateContext(id, updates);
  res.json({ context });
};

export const removeContext = async (req, res) => {
  const { id } = req.params;
  await deleteContext(id);
  res.json({ message: "Context removed." });
};
