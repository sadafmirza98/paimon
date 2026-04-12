import { getMessages } from "../db/firestore.js";

export const getHistory = async (_req, res) => {
  res.json({
    messages: await getMessages({ ascending: true }),
  });
};
