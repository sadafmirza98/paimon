import { useEffect, useState } from "react";
import { deleteDocument, fetchDocuments, forgetDocument, restoreDocument } from "../api";
import KnowledgeModal from "./KnowledgeModal";

const KnowledgeSidebar = ({ refreshTrigger }) => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await fetchDocuments();
      setDocs(data.documents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [refreshTrigger]);

  const handleDelete = async (id) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    try {
      await deleteDocument(id);
    } catch {
      load();
    }
  };

  const handleForget = async (id) => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, forgotten: true } : d)));
    try {
      await forgetDocument(id);
    } catch {
      load();
    }
  };

  const handleRestore = async (id) => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, forgotten: false } : d)));
    try {
      await restoreDocument(id);
    } catch {
      load();
    }
  };

  const selectedDoc = docs.find((d) => d.id === selectedId) || null;

  const renderList = () => {
    if (loading) {
      return (
        <div className="loading-state" style={{ padding: "24px 0" }}>
          <div className="typing-dots"><span /><span /><span /></div>
        </div>
      );
    }
    if (error) {
      return <p className="status error">{error}</p>;
    }
    if (docs.length === 0) {
      return (
        <div className="ks-empty">
          <span className="ks-empty-sigil">⊕</span>
          <p>No archived knowledge yet</p>
        </div>
      );
    }
    return (
      <ul className="ks-list">
        {docs.map((doc) => (
          <li key={doc.id} className={`ks-item ${doc.forgotten ? "ks-item--forgotten" : ""}`}>
            <button
              type="button"
              className="ks-item-btn"
              onClick={() => setSelectedId(doc.id)}
            >
              <span className="ks-item-title">{doc.title}</span>
              {doc.summary && (
                <span className="ks-item-summary">{doc.summary}</span>
              )}
              <span className="ks-item-meta">
                {doc.forgotten && <span className="ks-forgotten-badge">forgotten</span>}
                <span className="ks-item-date">
                  {new Date(doc.createdAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <aside className="knowledge-sidebar card">
        <div className="ks-header">
          <span className="eyebrow">Saved Knowledge</span>
          <span className="ks-count">{docs.length}</span>
        </div>
        {renderList()}
      </aside>

      {selectedId && selectedDoc && (
        <KnowledgeModal
          docMeta={selectedDoc}
          onClose={() => setSelectedId(null)}
          onDelete={(id) => { handleDelete(id); setSelectedId(null); }}
          onForget={(id) => { handleForget(id); setSelectedId(null); }}
          onRestore={(id) => { handleRestore(id); setSelectedId(null); }}
        />
      )}
    </>
  );
};

export default KnowledgeSidebar;
