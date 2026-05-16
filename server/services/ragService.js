import { createUploadedDocument, getUploadedDocuments } from "../db/firestore.js";

const normalizeText = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value) =>
  normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 2);

const truncateContent = (value, maxLength = 1600) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
};

export const saveDocument = async ({ uid, title, content, sourceType }) => {
  return createUploadedDocument({ uid, title, content, sourceType });
};

export const retrieveRelevantDocuments = async (question, uid, limit = 3) => {
  const documents = await getUploadedDocuments({ uid, limit: 25 });
  const questionTokens = tokenize(question);

  const ranked = documents
    .filter((doc) => !doc.forgotten)
    .map((doc) => {
      const haystack = tokenize(`${doc.title} ${doc.content}`);
      const tokenSet = new Set(haystack);
      const score = questionTokens.reduce((total, token) => total + (tokenSet.has(token) ? 1 : 0), 0);
      return { ...doc, score };
    })
    .sort((a, b) => b.score !== a.score ? b.score - a.score : b.createdAt.localeCompare(a.createdAt));

  const matches = ranked.filter((doc) => doc.score > 0);
  const selected = matches.length > 0 ? matches.slice(0, limit) : ranked.slice(0, Math.min(limit, 2));

  return selected.map((doc) => ({ ...doc, content: truncateContent(doc.content) }));
};

export const buildContextBlock = (documents) => {
  if (!documents.length) return "No uploaded context available.";
  return documents
    .map((doc, i) => `Document ${i + 1}: ${doc.title}\n${doc.content}`)
    .join("\n\n");
};
