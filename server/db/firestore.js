import { db } from "../config/firebase.js";

const collections = {
  messages: db.collection("messages"),
  uploadedDocuments: db.collection("uploaded_documents"),
  memories: db.collection("memories"),
  decisions: db.collection("decisions"),
  contexts: db.collection("contexts"),
};

// ─── Messages ────────────────────────────────────────────────────────────────

export const createMessage = async ({ role, content, metadata = {} }) => {
  const createdAt = new Date().toISOString();
  const payload = { role, content, metadata, createdAt };
  const document = await collections.messages.add(payload);
  return { id: document.id, ...payload };
};

export const getMessages = async ({ limit, ascending = true, contextId } = {}) => {
  const direction = ascending ? "asc" : "desc";
  let query = collections.messages.orderBy("createdAt", direction);
  if (contextId) query = query.where("metadata.contextId", "==", contextId);
  if (limit) query = query.limit(limit);
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const clearMessages = async (contextId) => {
  let query = collections.messages;
  if (contextId) {
    const snapshot = await query.where("metadata.contextId", "==", contextId).get();
    if (snapshot.empty) return 0;
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    return snapshot.size;
  }
  const snapshot = await query.get();
  if (snapshot.empty) return 0;
  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  return snapshot.size;
};

// ─── Uploaded Documents ───────────────────────────────────────────────────────

export const createUploadedDocument = async ({ title, content, sourceType }) => {
  const createdAt = new Date().toISOString();
  const payload = { title, content, sourceType, createdAt };
  const document = await collections.uploadedDocuments.add(payload);
  return { id: document.id, ...payload };
};

export const getUploadedDocuments = async ({ limit } = {}) => {
  let query = collections.uploadedDocuments.orderBy("createdAt", "desc");
  if (limit) query = query.limit(limit);
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ─── Memories ─────────────────────────────────────────────────────────────────

export const createMemory = async ({ title, content, type, tags = [], url, contextId }) => {
  const createdAt = new Date().toISOString();
  const payload = { title, content, type, tags, url: url || null, contextId: contextId || null, createdAt };
  const document = await collections.memories.add(payload);
  return { id: document.id, ...payload };
};

export const getMemories = async ({ limit = 50, type, contextId } = {}) => {
  let query = collections.memories.orderBy("createdAt", "desc");
  if (type) query = query.where("type", "==", type);
  if (contextId) query = query.where("contextId", "==", contextId);
  if (limit) query = query.limit(limit);
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const deleteMemory = async (id) => {
  await collections.memories.doc(id).delete();
};

// ─── Decisions ────────────────────────────────────────────────────────────────

export const createDecision = async ({ title, description, emotion, outcome, tags = [] }) => {
  const createdAt = new Date().toISOString();
  const payload = { title, description, emotion, outcome: outcome || null, tags, createdAt };
  const document = await collections.decisions.add(payload);
  return { id: document.id, ...payload };
};

export const getDecisions = async ({ limit = 50 } = {}) => {
  let query = collections.decisions.orderBy("createdAt", "desc");
  if (limit) query = query.limit(limit);
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateDecision = async (id, updates) => {
  await collections.decisions.doc(id).update(updates);
  const doc = await collections.decisions.doc(id).get();
  return { id: doc.id, ...doc.data() };
};

export const deleteDecision = async (id) => {
  await collections.decisions.doc(id).delete();
};

// ─── Context Spaces ───────────────────────────────────────────────────────────

export const createContext = async ({ name, description, color }) => {
  const createdAt = new Date().toISOString();
  const payload = { name, description: description || "", color: color || "sky", createdAt, updatedAt: createdAt };
  const document = await collections.contexts.add(payload);
  return { id: document.id, ...payload };
};

export const getContexts = async () => {
  const snapshot = await collections.contexts.orderBy("updatedAt", "desc").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateContext = async (id, updates) => {
  const updatedAt = new Date().toISOString();
  await collections.contexts.doc(id).update({ ...updates, updatedAt });
  const doc = await collections.contexts.doc(id).get();
  return { id: doc.id, ...doc.data() };
};

export const deleteContext = async (id) => {
  await collections.contexts.doc(id).delete();
};
