import { clearMessages, getMessages } from "../db/firestore.js";

export const getHistory = async (req, res) => {
  const contextId = req.query.contextId || null;
  res.json({
    messages: await getMessages({ ascending: true, contextId }),
  });
};

export const deleteHistory = async (req, res) => {
  const contextId = req.query.contextId || null;
  const deletedCount = await clearMessages(contextId);
  res.json({
    message: "Chat history cleared successfully.",
    deletedCount,
  });
};
