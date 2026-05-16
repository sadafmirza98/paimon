import { db } from "../config/firebase.js";

// Collections are global — data is scoped per-user via a `uid` field on every document.

const col = {
  messages: db.collection("messages"),
  uploadedDocuments: db.collection("uploaded_documents"),
  memories: db.collection("memories"),
  decisions: db.collection("decisions"),
  contexts: db.collection("contexts"),
};

// ─── Messages ────────────────────────────────────────────────────────────────

export const createMessage = async ({ uid, role, content, metadata = {} }) => {
  const createdAt = new Date().toISOString();
  const payload = { uid, role, content, metadata, createdAt };
  const document = await col.messages.add(payload);
  return { id: document.id, ...payload };
};

export const getMessages = async ({ uid, limit, ascending = true, contextId } = {}) => {
  const direction = ascending ? "asc" : "desc";
  let query = col.messages.where("uid", "==", uid).orderBy("createdAt", direction);
  if (contextId) query = query.where("metadata.contextId", "==", contextId);
  if (limit) query = query.limit(limit);
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const clearMessages = async ({ uid, contextId }) => {
  let query = col.messages.where("uid", "==", uid);
  if (contextId) query = query.where("metadata.contextId", "==", contextId);
  const snapshot = await query.get();
  if (snapshot.empty) return 0;
  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  return snapshot.size;
};

// ─── Uploaded Documents ───────────────────────────────────────────────────────

export const createUploadedDocument = async ({ uid, title, content, sourceType }) => {
  const createdAt = new Date().toISOString();
  const payload = { uid, title, content, sourceType, createdAt, forgotten: false };
  const document = await col.uploadedDocuments.add(payload);
  return { id: document.id, ...payload };
};

export const getUploadedDocuments = async ({ uid, limit } = {}) => {
  let query = col.uploadedDocuments.where("uid", "==", uid).orderBy("createdAt", "desc");
  if (limit) query = query.limit(limit);
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const deleteUploadedDocument = async ({ uid, id }) => {
  if (!id) throw Object.assign(new Error("Document ID is required."), { statusCode: 400 });
  const doc = await col.uploadedDocuments.doc(id).get();
  if (!doc.exists || doc.data().uid !== uid) {
    throw Object.assign(new Error("Not found."), { statusCode: 404 });
  }
  await col.uploadedDocuments.doc(id).delete();
};

export const updateUploadedDocument = async ({ uid, id, updates }) => {
  if (!id) throw Object.assign(new Error("Document ID is required."), { statusCode: 400 });
  const doc = await col.uploadedDocuments.doc(id).get();
  if (!doc.exists || doc.data().uid !== uid) {
    throw Object.assign(new Error("Not found."), { statusCode: 404 });
  }
  await col.uploadedDocuments.doc(id).update(updates);
  const updated = await col.uploadedDocuments.doc(id).get();
  return { id: updated.id, ...updated.data() };
};

// ─── Memories ─────────────────────────────────────────────────────────────────

export const createMemory = async ({ uid, title, content, type, tags = [], url, contextId }) => {
  const createdAt = new Date().toISOString();
  const payload = { uid, title, content, type, tags, url: url || null, contextId: contextId || null, createdAt };
  const document = await col.memories.add(payload);
  return { id: document.id, ...payload };
};

export const getMemories = async ({ uid, limit = 50, type, contextId } = {}) => {
  let query = col.memories.where("uid", "==", uid).orderBy("createdAt", "desc");
  if (type) query = query.where("type", "==", type);
  if (contextId) query = query.where("contextId", "==", contextId);
  if (limit) query = query.limit(limit);
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const deleteMemory = async ({ uid, id }) => {
  if (!id) throw Object.assign(new Error("Memory ID is required."), { statusCode: 400 });
  const doc = await col.memories.doc(id).get();
  if (!doc.exists || doc.data().uid !== uid) {
    throw Object.assign(new Error("Not found."), { statusCode: 404 });
  }
  await col.memories.doc(id).delete();
};

// ─── Decisions ────────────────────────────────────────────────────────────────

export const createDecision = async ({ uid, title, description, emotion, outcome, tags = [] }) => {
  const createdAt = new Date().toISOString();
  const payload = { uid, title, description, emotion, outcome: outcome || null, tags, createdAt };
  const document = await col.decisions.add(payload);
  return { id: document.id, ...payload };
};

export const getDecisions = async ({ uid, limit = 50 } = {}) => {
  let query = col.decisions.where("uid", "==", uid).orderBy("createdAt", "desc");
  if (limit) query = query.limit(limit);
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateDecision = async ({ uid, id, updates }) => {
  if (!id) throw Object.assign(new Error("Decision ID is required."), { statusCode: 400 });
  const doc = await col.decisions.doc(id).get();
  if (!doc.exists || doc.data().uid !== uid) {
    throw Object.assign(new Error("Not found."), { statusCode: 404 });
  }
  await col.decisions.doc(id).update(updates);
  const updated = await col.decisions.doc(id).get();
  return { id: updated.id, ...updated.data() };
};

export const deleteDecision = async ({ uid, id }) => {
  if (!id) throw Object.assign(new Error("Decision ID is required."), { statusCode: 400 });
  const doc = await col.decisions.doc(id).get();
  if (!doc.exists || doc.data().uid !== uid) {
    throw Object.assign(new Error("Not found."), { statusCode: 404 });
  }
  await col.decisions.doc(id).delete();
};

// ─── Context Spaces ───────────────────────────────────────────────────────────

export const createContext = async ({ uid, name, description, color }) => {
  const createdAt = new Date().toISOString();
  const payload = { uid, name, description: description || "", color: color || "sky", createdAt, updatedAt: createdAt };
  const document = await col.contexts.add(payload);
  return { id: document.id, ...payload };
};

export const getContexts = async ({ uid }) => {
  const snapshot = await col.contexts.where("uid", "==", uid).orderBy("updatedAt", "desc").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateContext = async ({ uid, id, updates }) => {
  if (!id) throw Object.assign(new Error("Context ID is required."), { statusCode: 400 });
  const doc = await col.contexts.doc(id).get();
  if (!doc.exists || doc.data().uid !== uid) {
    throw Object.assign(new Error("Not found."), { statusCode: 404 });
  }
  const updatedAt = new Date().toISOString();
  await col.contexts.doc(id).update({ ...updates, updatedAt });
  const updated = await col.contexts.doc(id).get();
  return { id: updated.id, ...updated.data() };
};

export const deleteContext = async ({ uid, id }) => {
  if (!id) throw Object.assign(new Error("Context ID is required."), { statusCode: 400 });
  const doc = await col.contexts.doc(id).get();
  if (!doc.exists || doc.data().uid !== uid) {
    throw Object.assign(new Error("Not found."), { statusCode: 404 });
  }
  await col.contexts.doc(id).delete();
};
