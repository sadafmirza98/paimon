import { useState } from "react";
import { deleteContext, saveContext } from "../api";

const COLORS = [
  { value: "sky", label: "Sky", hex: "#85b8ef" },
  { value: "gold", label: "Gold", hex: "#caa25a" },
  { value: "rose", label: "Rose", hex: "#e8a0a0" },
  { value: "sage", label: "Sage", hex: "#8ec4a0" },
  { value: "violet", label: "Violet", hex: "#b09ee0" },
];

const ContextRealms = ({ contexts, onContextsChange, onContextSelect }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: "sky" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError("");
    try {
      await saveContext({ name: form.name.trim(), description: form.description.trim(), color: form.color });
      setForm({ name: "", description: "", color: "sky" });
      setShowForm(false);
      await onContextsChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteContext(id);
      await onContextsChange();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="panel-view">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Context Realms</p>
          <h2>Your Knowledge Spaces</h2>
          <p className="panel-subtitle">
            Each realm keeps its own memories, chat history, and context.
          </p>
        </div>
        <button className="button" type="button" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Cancel" : "⬡ New Realm"}
        </button>
      </div>

      {showForm && (
        <form className="memory-form card" onSubmit={handleSave}>
          <input
            className="input"
            placeholder="Realm name (e.g. AWS Study, Side Project, Life Goals)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <textarea
            className="textarea"
            rows="2"
            placeholder="What is this realm for? (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="color-picker">
            <p className="form-label">Realm color</p>
            <div className="color-options">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`color-swatch ${form.color === c.value ? "selected" : ""}`}
                  style={{ background: c.hex }}
                  onClick={() => setForm({ ...form, color: c.value })}
                  title={c.label}
                />
              ))}
            </div>
          </div>
          <button className="button secondary" type="submit" disabled={saving}>
            {saving ? "Creating realm..." : "⬡ Create Realm"}
          </button>
        </form>
      )}

      {error && <p className="status error">{error}</p>}

      {contexts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-sigil">⬡</div>
          <h3>No realms yet</h3>
          <p>Create context spaces for different projects, studies, or life areas. Paimon will remember everything within each realm.</p>
        </div>
      ) : (
        <div className="realms-grid">
          {contexts.map((ctx) => {
            const color = COLORS.find((c) => c.value === ctx.color)?.hex || "#85b8ef";
            return (
              <div key={ctx.id} className="realm-card card" style={{ "--realm-color": color }}>
                <div className="realm-card-header">
                  <div className="realm-orb" style={{ background: color }} />
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(ctx.id)}
                    type="button"
                  >✕</button>
                </div>
                <h3 className="realm-name">{ctx.name}</h3>
                {ctx.description && <p className="realm-description">{ctx.description}</p>}
                <p className="realm-date">
                  Created {new Date(ctx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
                <button
                  className="button realm-enter-btn"
                  type="button"
                  onClick={() => onContextSelect(ctx.id)}
                  style={{ background: `linear-gradient(135deg, ${color}33, ${color}66)`, color: "var(--text-main)", border: `1px solid ${color}66` }}
                >
                  Enter Realm →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContextRealms;
