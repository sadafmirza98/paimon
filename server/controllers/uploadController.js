import { deleteUploadedDocument, getUploadedDocuments, updateUploadedDocument } from "../db/firestore.js";
import { saveDocument } from "../services/ragService.js";

const getTextFromUpload = (req) => {
  if (req.file) return req.file.buffer.toString("utf-8");
  return req.body.content?.trim() || "";
};

export const uploadDocument = async (req, res) => {
  const uid = req.uid;
  const content = getTextFromUpload(req);
  const title = req.body.title?.trim() || req.file?.originalname || "Untitled document";

  if (!content) {
    return res.status(400).json({ message: "Document content is required." });
  }

  const document = await saveDocument({ uid, title, content, sourceType: req.file ? "file" : "pasted" });
  res.status(201).json({ message: "Document uploaded successfully.", document });
};

export const listDocuments = async (req, res) => {
  const uid = req.uid;
  const docs = await getUploadedDocuments({ uid });
  // Return lightweight metadata — omit full content for list view
  const list = docs.map(({ id, title, content, sourceType, createdAt, forgotten }) => ({
    id,
    title,
    summary: content ? content.slice(0, 120).replace(/\s+/g, " ").trim() + (content.length > 120 ? "…" : "") : "",
    sourceType,
    createdAt,
    forgotten: !!forgotten,
  }));
  res.json({ documents: list });
};

export const getDocument = async (req, res) => {
  const uid = req.uid;
  const docs = await getUploadedDocuments({ uid });
  const doc = docs.find((d) => d.id === req.params.id);
  if (!doc) return res.status(404).json({ message: "Not found." });
  res.json({ document: doc });
};

export const deleteDocument = async (req, res) => {
  const uid = req.uid;
  await deleteUploadedDocument({ uid, id: req.params.id });
  res.json({ message: "Document deleted." });
};

export const forgetDocument = async (req, res) => {
  const uid = req.uid;
  const doc = await updateUploadedDocument({ uid, id: req.params.id, updates: { forgotten: true } });
  res.json({ document: doc });
};

export const restoreDocument = async (req, res) => {
  const uid = req.uid;
  const doc = await updateUploadedDocument({ uid, id: req.params.id, updates: { forgotten: false } });
  res.json({ document: doc });
};
