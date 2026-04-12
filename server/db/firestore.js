import { db } from "../config/firebase.js";

const collections = {
  messages: db.collection("messages"),
  uploadedDocuments: db.collection("uploaded_documents"),
};

export const createMessage = async ({ role, content, metadata = {} }) => {
  const createdAt = new Date().toISOString();
  const payload = { role, content, metadata, createdAt };
  const document = await collections.messages.add(payload);

  return {
    id: document.id,
    ...payload,
  };
};

export const getMessages = async ({ limit, ascending = true } = {}) => {
  const direction = ascending ? "asc" : "desc";
  let query = collections.messages.orderBy("createdAt", direction);

  if (limit) {
    query = query.limit(limit);
  }

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const createUploadedDocument = async ({
  title,
  content,
  sourceType,
}) => {
  const createdAt = new Date().toISOString();
  const payload = { title, content, sourceType, createdAt };
  const document = await collections.uploadedDocuments.add(payload);

  return {
    id: document.id,
    ...payload,
  };
};

export const getUploadedDocuments = async ({ limit } = {}) => {
  let query = collections.uploadedDocuments.orderBy("createdAt", "desc");

  if (limit) {
    query = query.limit(limit);
  }

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
