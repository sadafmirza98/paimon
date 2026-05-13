import { useEffect, useState } from "react";
import { fetchMemories } from "../api";

const TYPE_ICONS = {
  note: "◈",
  link: "⊕",
  idea: "✦",
  goal: "⟡",
  inspiration: "⬡",
  screenshot: "◻",
};

const RightPanel = ({ activeContextId, contexts }) => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeContext = contexts?.find((c) => c.id === activeContextId);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchMemories({
          contextId: activeContextId || undefined,
          limit: 8,
        });
        setMemories(data.memories);
      } catch {
        // silent fail for right panel
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeContextId]);

  const links = memories.filter((m) => m.url);
  const recent = memories.slice(0, 5);

  return (
    <aside className="right-panel">
      <div className="right-panel-section">
        <p className="eyebrow">Active Realm</p>
        {activeContext ? (
          <div className="active-context-card">
            <h4 className="active-context-name">{activeContext.name}</h4>
            {activeContext.description && (
              <p className="active-context-desc">{activeContext.description}</p>
            )}
          </div>
        ) : (
          <p className="right-panel-empty">All realms active</p>
        )}
      </div>

      <div className="right-panel-section">
        <p className="eyebrow">Recent Memories</p>
        {loading ? (
          <div className="typing-dots small"><span /><span /><span /></div>
        ) : recent.length === 0 ? (
          <p className="right-panel-empty">No memories saved yet</p>
        ) : (
          <ul className="right-memory-list">
            {recent.map((m) => (
              <li key={m.id} className="right-memory-item">
                <span className="right-memory-icon">{TYPE_ICONS[m.type] || "◈"}</span>
                <div className="right-memory-content">
                  <span className="right-memory-title">{m.title}</span>
                  {m.content && (
                    <span className="right-memory-preview">
                      {m.content.slice(0, 60)}{m.content.length > 60 ? "..." : ""}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {links.length > 0 && (
        <div className="right-panel-section">
          <p className="eyebrow">Saved Links</p>
          <ul className="right-links-list">
            {links.slice(0, 4).map((m) => (
              <li key={m.id} className="right-link-item">
                <a href={m.url} target="_blank" rel="noopener noreferrer" className="right-link">
                  <span className="right-link-icon">⊕</span>
                  <span className="right-link-title">{m.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="right-panel-section right-panel-tip">
        <div className="paimon-tip">
          <span className="tip-icon">✦</span>
          <p className="tip-text">
            {activeContext
              ? `Paimon is focused on "${activeContext.name}". All memories and chat are scoped to this realm.`
              : "Tip: Create a Context Realm to keep memories and chats organized by project or topic."}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;
