import { useEffect, useState } from "react";
import { deleteMemory, fetchMemories, saveMemory } from "../api";

const MEMORY_TYPES = [
  { value: "note", label: "Note", icon: "◈" },
  { value: "link", label: "Link", icon: "⊕" },
  { value: "idea", label: "Idea", icon: "✦" },
  { value: "goal", label: "Goal", icon: "⟡" },
  { value: "inspiration", label: "Inspiration", icon: "⬡" },
  { value: "screenshot", label: "Screenshot", icon: "◻" },
];

const TYPE_COLORS = {
  note: "var(--sky)",
  link: "var(--gold)",
  idea: "#b09ee0",
  goal: "#8ec4a0",
  inspiration: "#e8a0a0",
  screenshot: "#a0c4e8",
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const groupByDate = (memories) => {
  const groups = {};
  memories.forEach((m) => {
    const key = formatDate(m.createdAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  });
  return Object.entries(groups);
};

const MemoryTimeline = ({ activeContextId, contexts }) => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({ title: "", content: "", type: "note", url: "", tags: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const activeContext = contexts?.find((c) => c.id === activeContextId);

  const loadMemories = async () => {
    setLoading(true);
    try {
      const data = await fetchMemories({
        type: filterType || undefined,
        contextId: activeContextId || undefined,
      });
      setMemories(data.memories);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMemories(); }, [activeContextId, filterType]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError("");
    try {
      await saveMemory({
        title: form.title.trim(),
        content: form.content.trim(),
        type: form.type,
        url: form.url.trim(),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        contextId: activeContextId || null,
      });
      setForm({ title: "", content: "", type: "note", url: "", tags: "" });
      setShowForm(false);
      await loadMemories();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = searchQuery
    ? memories.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : memories;

  const grouped = groupByDate(filtered);

  return (
    <div className="panel-view">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Memory Archive</p>
          <h2>{activeContext ? `${activeContext.name} — Memories` : "All Memories"}</h2>
          <p className="panel-subtitle">
            {memories.length} {memories.length === 1 ? "memory" : "memories"} saved
          </p>
        </div>
        <button className="button" type="button" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Cancel" : "✦ Save Memory"}
        </button>
      </div>

      {showForm && (
        <form className="memory-form card" onSubmit={handleSave}>
          <div className="form-row">
            <input
              className="input"
              placeholder="Memory title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <select
              className="input select-input"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {MEMORY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
          </div>
          <textarea
            className="textarea"
            rows="3"
            placeholder="What do you want to remember? (optional)"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <input
            className="input"
            placeholder="URL (optional)"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />
          <input
            className="input"
            placeholder="Tags, comma separated (optional)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
          <button className="button secondary" type="submit" disabled={saving}>
            {saving ? "Saving to archive..." : "✦ Add to Archive"}
          </button>
        </form>
      )}

      <div className="timeline-controls">
        <div className="search-shell">
          <span className="search-icon">⊕</span>
          <input
            className="search-input"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-chips">
          <button
            className={`chip ${!filterType ? "active" : ""}`}
            onClick={() => setFilterType("")}
            type="button"
          >All</button>
          {MEMORY_TYPES.map((t) => (
            <button
              key={t.value}
              className={`chip ${filterType === t.value ? "active" : ""}`}
              onClick={() => setFilterType(filterType === t.value ? "" : t.value)}
              type="button"
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="status error">{error}</p>}

      {loading ? (
        <div className="loading-state">
          <div className="typing-dots"><span /><span /><span /></div>
          <p>Retrieving memories...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-sigil">◈</div>
          <h3>No memories yet</h3>
          <p>Save notes, links, ideas, and inspirations to build your archive.</p>
        </div>
      ) : (
        <div className="timeline">
          {grouped.map(([date, items]) => (
            <div key={date} className="timeline-group">
              <div className="timeline-date-marker">
                <span className="timeline-date-line" />
                <span className="timeline-date-label">{date}</span>
                <span className="timeline-date-line" />
              </div>
              <div className="memory-cards">
                {items.map((memory) => (
                  <div key={memory.id} className="memory-card card">
                    <div className="memory-card-header">
                      <div className="memory-type-badge" style={{ color: TYPE_COLORS[memory.type] || "var(--sky)" }}>
                        {MEMORY_TYPES.find((t) => t.value === memory.type)?.icon || "◈"}
                        <span>{memory.type}</span>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(memory.id)}
                        type="button"
                        title="Remove memory"
                      >✕</button>
                    </div>
                    <h4 className="memory-title">{memory.title}</h4>
                    {memory.content && <p className="memory-content">{memory.content}</p>}
                    {memory.url && (
                      <a className="memory-link" href={memory.url} target="_blank" rel="noopener noreferrer">
                        ⊕ {memory.url.length > 50 ? memory.url.slice(0, 50) + "..." : memory.url}
                      </a>
                    )}
                    {memory.tags?.length > 0 && (
                      <div className="memory-tags">
                        {memory.tags.map((tag) => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoryTimeline;
