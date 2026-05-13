import { clearMessages, getMessages } from "../db/firestore.js";

export const getHistory = async (req, res) => {
  const uid = req.uid;
  const contextId = req.query.contextId || null;
  res.json({
    messages: await getMessages({ uid, ascending: true, contextId }),
  });
};

export const deleteHistory = async (req, res) => {
  const uid = req.uid;
  const contextId = req.query.contextId || null;
  const deletedCount = await clearMessages({ uid, contextId });
  res.json({ message: "Chat history cleared successfully.", deletedCount });
};
