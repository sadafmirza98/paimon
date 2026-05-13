import { useState } from "react";
import { uploadDocument } from "../api";

const KnowledgeArchive = () => {
  const [title, setTitle] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");

  const handleUpload = async (event) => {
    event.preventDefault();
    if ((!documentText.trim() && !selectedFile) || isUploadLoading) return;

    setError("");
    setUploadStatus("");
    setIsUploadLoading(true);

    try {
      const data = await uploadDocument({
        title: title.trim(),
        content: documentText.trim(),
        file: selectedFile,
      });
      setUploadStatus(`"${data.document.title}" added to Paimon's knowledge archive.`);
      setTitle("");
      setDocumentText("");
      setSelectedFile(null);
      event.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploadLoading(false);
    }
  };

  return (
    <div className="panel-view">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Knowledge Archive</p>
          <h2>Starfell Knowledge</h2>
          <p className="panel-subtitle">
            Upload documents, notes, or lore. Paimon will use them when answering your questions.
          </p>
        </div>
      </div>

      <form className="memory-form card archive-form" onSubmit={handleUpload}>
        <div className="archive-icon-row">
          <span className="archive-sigil">⊕</span>
          <div>
            <h3 style={{ margin: 0 }}>Add to Archive</h3>
            <p className="panel-subtitle" style={{ margin: 0 }}>Paste text or upload a file</p>
          </div>
        </div>

        <input
          className="input"
          type="text"
          placeholder="Chronicle title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="textarea"
          rows="8"
          placeholder="Paste lore, study notes, project docs, or any reference text..."
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
        />
        <div className="file-upload-area">
          <input
            className="file-input"
            type="file"
            accept=".txt,.md,.text"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
          <p className="upload-hint">Supports .txt, .md, .text files up to 2MB</p>
        </div>

        <button className="button secondary" type="submit" disabled={isUploadLoading}>
          {isUploadLoading ? "Blessing the archive..." : "⊕ Add to Archive"}
        </button>

        {uploadStatus && <p className="status success">{uploadStatus}</p>}
        {error && <p className="status error">{error}</p>}
      </form>

      <div className="archive-info card">
        <h4>How the Archive Works</h4>
        <ul className="archive-tips">
          <li>✦ Uploaded documents become part of Paimon's RAG memory</li>
          <li>◈ When you ask questions, Paimon searches the archive for relevant context</li>
          <li>⟡ Great for study notes, project docs, research, and reference material</li>
          <li>⬡ The more you add, the smarter Paimon's answers become</li>
        </ul>
      </div>
    </div>
  );
};

export default KnowledgeArchive;
