import { createContext, getContexts, updateContext, deleteContext } from "../db/firestore.js";

export const addContext = async (req, res) => {
  const uid = req.uid;
  const { name, description, color } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Name is required." });
  }

  const context = await createContext({
    uid,
    name: name.trim(),
    description: description?.trim() || "",
    color: color || "sky",
  });

  res.status(201).json({ context });
};

export const listContexts = async (req, res) => {
  const uid = req.uid;
  const contexts = await getContexts({ uid });
  res.json({ contexts });
};

export const patchContext = async (req, res) => {
  const uid = req.uid;
  const { id } = req.params;
  const context = await updateContext({ uid, id, updates: req.body });
  res.json({ context });
};

export const removeContext = async (req, res) => {
  const uid = req.uid;
  const { id } = req.params;
  await deleteContext({ uid, id });
  res.json({ message: "Context removed." });
};
