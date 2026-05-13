import { createMessage, getMessages, getMemories, getContexts } from "../db/firestore.js";
import { generateChatResponse } from "../services/aiService.js";
import { buildContextBlock, retrieveRelevantDocuments } from "../services/ragService.js";

const buildMemoryBlock = (memories) => {
  if (!memories.length) return null;
  return memories
    .slice(0, 12)
    .map((m) => `[${m.type || "note"}] ${m.title}${m.content ? ": " + m.content.slice(0, 200) : ""}${m.url ? " (link: " + m.url + ")" : ""}`)
    .join("\n");
};

export const chatWithAi = async (req, res) => {
  const uid = req.uid;
  const message = req.body.message?.trim();
  const contextId = req.body.contextId || null;

  if (!message) {
    return res.status(400).json({ message: "Message is required." });
  }

  const userMessage = await createMessage({ uid, role: "user", content: message, metadata: { contextId } });

  const [history, documents, memories, contexts] = await Promise.all([
    getMessages({ uid, limit: 10, ascending: false, contextId }).then((rows) =>
      rows.reverse().map((e) => ({ role: e.role, content: e.content }))
    ),
    retrieveRelevantDocuments(message, uid),
    getMemories({ uid, limit: 20, contextId: contextId || undefined }),
    contextId ? getContexts({ uid }) : Promise.resolve([]),
  ]);

  const activeContext = contextId ? contexts.find((c) => c.id === contextId) : null;
  const contextBlock = buildContextBlock(documents);
  const memoryBlock = buildMemoryBlock(memories);

  const answer = await generateChatResponse({ message, history, contextBlock, memoryBlock, activeContext });

  const assistantMessage = await createMessage({
    uid,
    role: "assistant",
    content: answer,
    metadata: { contextId, sources: documents.map((d) => ({ id: d.id, title: d.title })) },
  });

  res.status(201).json({
    userMessage,
    assistantMessage,
    sources: documents.map((d) => ({
      id: d.id,
      title: d.title,
      sourceType: d.sourceType,
      createdAt: d.createdAt,
    })),
  });
};
