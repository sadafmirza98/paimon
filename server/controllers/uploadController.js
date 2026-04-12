import { saveDocument } from "../services/ragService.js";

const getTextFromUpload = (req) => {
  if (req.file) {
    return req.file.buffer.toString("utf-8");
  }

  return req.body.content?.trim() || "";
};

export const uploadDocument = async (req, res) => {
  const content = getTextFromUpload(req);
  const title =
    req.body.title?.trim() || req.file?.originalname || "Untitled document";

  if (!content) {
    return res.status(400).json({ message: "Document content is required." });
  }

  const document = await saveDocument({
    title,
    content,
    sourceType: req.file ? "file" : "pasted",
  });

  res.status(201).json({
    message: "Document uploaded successfully.",
    document,
  });
};
