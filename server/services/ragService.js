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
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}...`;
};

export const saveDocument = async ({ title, content, sourceType }) => {
  return createUploadedDocument({ title, content, sourceType });
};

export const retrieveRelevantDocuments = async (question, limit = 3) => {
  const documents = await getUploadedDocuments({ limit: 25 });
  const questionTokens = tokenize(question);

  const rankedDocuments = documents
    .map((document) => {
      const haystack = tokenize(`${document.title} ${document.content}`);
      const tokenSet = new Set(haystack);
      const score = questionTokens.reduce(
        (total, token) => total + (tokenSet.has(token) ? 1 : 0),
        0,
      );

      return {
        ...document,
        score,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return right.createdAt.localeCompare(left.createdAt);
    });

  const matches = rankedDocuments.filter((document) => document.score > 0);
  const selectedDocuments =
    matches.length > 0 ? matches.slice(0, limit) : rankedDocuments.slice(0, Math.min(limit, 2));

  return selectedDocuments.map((document) => ({
    ...document,
    content: truncateContent(document.content),
  }));
};

export const buildContextBlock = (documents) => {
  if (!documents.length) {
    return "No uploaded context available.";
  }

  return documents
    .map(
      (document, index) =>
        `Document ${index + 1}: ${document.title}\n${document.content}`,
    )
    .join("\n\n");
};
