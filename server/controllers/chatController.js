import { createMessage, getMessages } from "../db/firestore.js";
import { generateChatResponse } from "../services/aiService.js";
import {
  buildContextBlock,
  retrieveRelevantDocuments,
} from "../services/ragService.js";

const saveMessage = async (role, content, metadata = {}) => {
  return createMessage({ role, content, metadata });
};

const getRecentHistory = async (limit = 8) => {
  const rows = await getMessages({ limit, ascending: false });
  return rows.reverse().map((entry) => ({
    role: entry.role,
    content: entry.content,
  }));
};

export const chatWithAi = async (req, res) => {
  const message = req.body.message?.trim();

  if (!message) {
    return res.status(400).json({ message: "Message is required." });
  }

  const userMessage = await saveMessage("user", message);
  const [history, documents] = await Promise.all([
    getRecentHistory(),
    retrieveRelevantDocuments(message),
  ]);

  const contextBlock = buildContextBlock(documents);
  const answer = await generateChatResponse({
    message,
    history,
    contextBlock,
  });

  const assistantMessage = await saveMessage("assistant", answer, {
    sources: documents.map((document) => ({
      id: document.id,
      title: document.title,
    })),
  });

  res.status(201).json({
    userMessage,
    assistantMessage,
    sources: documents.map((document) => ({
      id: document.id,
      title: document.title,
      sourceType: document.sourceType,
      createdAt: document.createdAt,
    })),
  });
};
