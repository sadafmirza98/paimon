import { clearMessages, getMessages } from "../db/firestore.js";

export const getHistory = async (_req, res) => {
  res.json({
    messages: await getMessages({ ascending: true }),
  });
};

export const deleteHistory = async (_req, res) => {
  const deletedCount = await clearMessages();

  res.json({
    message: "Chat history cleared successfully.",
    deletedCount,
  });
};
