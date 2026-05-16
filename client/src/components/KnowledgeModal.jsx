import { useEffect, useRef, useState } from "react";
import { fetchDocument } from "../api";

const KnowledgeModal = ({ docMeta, onClose, onDelete, onForget, onRestore }) => {
  const [full, setFull] = useState(null);
  const [loading, setLoading] = useState(true);
  const dialogRef = useRef(null);

  // Open native dialog on mount
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Lazy-load full content only when modal opens
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchDocument(docMeta.id);
        if (!cancelled) setFull(data.document);
      } catch {
        if (!cancelled) setFull(docMeta);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [docMeta]);

  // Close on Escape (native dialog handles this, but we sync state)
  useEffect(() => {
    const el = dialogRef.current;
    const onCancel = (e) => { e.preventDefault(); onClose(); };
    el?.addEventListener("cancel", onCancel);
    return () => el?.removeEventListener("cancel", onCancel);
  }, [onClose]);

  // Close on backdrop click
  const handleClick = (e) => {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (rect && (
      e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top  || e.clientY > rect.bottom
    )) {
      onClose();
    }
  };

  const doc = full || docMeta;
  const isForgotten = docMeta.forgotten;

  return (
    <dialog ref={dialogRef} className="km-dialog" onClick={handleClick} aria-label={`Knowledge entry: ${docMeta.title}`}>
      <div className="km-modal card">
        <button className="delete-btn km-close" onClick={onClose} type="button" aria-label="Close">✕</button>

        <p className="eyebrow">Knowledge Entry</p>
        <h3 className="km-title">{doc.title}</h3>

        <p className="km-date">
          {new Date(doc.createdAt).toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric",
          })}
          {doc.sourceType && <span className="km-source"> · {doc.sourceType}</span>}
        </p>

        {isForgotten && (
          <div className="km-forgotten-notice">
            ◈ This entry is forgotten — Paimon won&apos;t use it in responses.
          </div>
        )}

        <div className="km-content-box">
          {loading ? (
            <div className="typing-dots"><span /><span /><span /></div>
          ) : (
            <p className="km-content">{doc.content}</p>
          )}
        </div>

        <div className="km-actions">
          {isForgotten ? (
            <button
              className="button ghost-button"
              type="button"
              onClick={() => onRestore(doc.id)}
            >
              ✦ Restore to Memory
            </button>
          ) : (
            <button
              className="button ghost-button"
              type="button"
              onClick={() => onForget(doc.id)}
            >
              ◈ Forget Knowledge
            </button>
          )}
          <button
            className="button km-delete-btn"
            type="button"
            onClick={() => onDelete(doc.id)}
          >
            ✕ Delete Entry
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default KnowledgeModal;
