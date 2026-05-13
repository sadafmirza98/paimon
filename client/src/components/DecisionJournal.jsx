import { useEffect, useState } from "react";
import {
  deleteDecision,
  fetchDecisions,
  fetchInsights,
  saveDecision,
  updateDecision,
} from "../api";

const EMOTIONS = [
  { value: "confident", label: "Confident", icon: "✦", color: "#8ec4a0" },
  { value: "uncertain", label: "Uncertain", icon: "⟡", color: "#caa25a" },
  { value: "anxious", label: "Anxious", icon: "◈", color: "#e8a0a0" },
  { value: "excited", label: "Excited", icon: "⬡", color: "#b09ee0" },
  { value: "neutral", label: "Neutral", icon: "◻", color: "#85b8ef" },
  { value: "stressed", label: "Stressed", icon: "⊕", color: "#d4a0c0" },
];

const EMOTION_COLORS = Object.fromEntries(EMOTIONS.map((e) => [e.value, e.color]));

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const DecisionJournal = () => {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editingOutcome, setEditingOutcome] = useState(null);
  const [outcomeText, setOutcomeText] = useState("");
  const [form, setForm] = useState({ title: "", description: "", emotion: "neutral", tags: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadDecisions = async () => {
    setLoading(true);
    try {
      const data = await fetchDecisions();
      setDecisions(data.decisions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDecisions(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError("");
    try {
      await saveDecision({
        title: form.title.trim(),
        description: form.description.trim(),
        emotion: form.emotion,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setForm({ title: "", description: "", emotion: "neutral", tags: "" });
      setShowForm(false);
      await loadDecisions();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDecision(id);
      setDecisions((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveOutcome = async (id) => {
    try {
      const updated = await updateDecision(id, { outcome: outcomeText });
      setDecisions((prev) => prev.map((d) => (d.id === id ? updated.decision : d)));
      setEditingOutcome(null);
      setOutcomeText("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGetInsights = async () => {
    setInsightLoading(true);
    try {
      const data = await fetchInsights();
      setInsight(data.insight);
    } catch (err) {
      setError(err.message);
    } finally {
      setInsightLoading(false);
    }
  };

  const emotionCounts = decisions.reduce((acc, d) => {
    acc[d.emotion] = (acc[d.emotion] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="panel-view">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Decision Journal</p>
          <h2>Your Choices & Reflections</h2>
          <p className="panel-subtitle">
            {decisions.length} {decisions.length === 1 ? "decision" : "decisions"} logged
          </p>
        </div>
        <div className="panel-header-actions">
          <button
            className="button ghost-button"
            type="button"
            onClick={handleGetInsights}
            disabled={insightLoading || decisions.length === 0}
          >
            {insightLoading ? "Thinking..." : "⟡ Paimon's Insights"}
          </button>
          <button className="button" type="button" onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Cancel" : "✦ Log Decision"}
          </button>
        </div>
      </div>

      {insight && (
        <div className="insight-card card">
          <div className="insight-header">
            <span className="insight-icon">✦</span>
            <span className="eyebrow">Paimon's Reflection</span>
          </div>
          <p className="insight-text">{insight}</p>
          <button className="delete-btn" onClick={() => setInsight(null)} type="button">✕</button>
        </div>
      )}

      {decisions.length > 0 && (
        <div className="emotion-heatmap card">
          <p className="eyebrow" style={{ marginBottom: "12px" }}>Emotional Landscape</p>
          <div className="emotion-bars">
            {EMOTIONS.map((em) => {
              const count = emotionCounts[em.value] || 0;
              const pct = decisions.length > 0 ? (count / decisions.length) * 100 : 0;
              return (
                <div key={em.value} className="emotion-bar-item">
                  <span className="emotion-bar-label">{em.icon} {em.label}</span>
                  <div className="emotion-bar-track">
                    <div
                      className="emotion-bar-fill"
                      style={{ width: `${pct}%`, background: em.color }}
                    />
                  </div>
                  <span className="emotion-bar-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showForm && (
        <form className="memory-form card" onSubmit={handleSave}>
          <input
            className="input"
            placeholder="What decision are you making?"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            className="textarea"
            rows="3"
            placeholder="Describe the context, options, or reasoning..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="emotion-picker">
            <p className="form-label">How are you feeling about this?</p>
            <div className="emotion-options">
              {EMOTIONS.map((em) => (
                <button
                  key={em.value}
                  type="button"
                  className={`emotion-option ${form.emotion === em.value ? "selected" : ""}`}
                  style={form.emotion === em.value ? { borderColor: em.color, color: em.color } : {}}
                  onClick={() => setForm({ ...form, emotion: em.value })}
                >
                  {em.icon} {em.label}
                </button>
              ))}
            </div>
          </div>
          <input
            className="input"
            placeholder="Tags, comma separated (optional)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
          <button className="button secondary" type="submit" disabled={saving}>
            {saving ? "Logging decision..." : "✦ Log Decision"}
          </button>
        </form>
      )}

      {error && <p className="status error">{error}</p>}

      {loading ? (
        <div className="loading-state">
          <div className="typing-dots"><span /><span /><span /></div>
          <p>Loading journal...</p>
        </div>
      ) : decisions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-sigil">⟡</div>
          <h3>No decisions logged yet</h3>
          <p>Track important choices, emotional states, and outcomes. Paimon will find patterns over time.</p>
        </div>
      ) : (
        <div className="decisions-list">
          {decisions.map((decision) => (
            <div key={decision.id} className="decision-card card">
              <div className="decision-card-header">
                <div className="decision-meta">
                  <span
                    className="emotion-badge"
                    style={{ color: EMOTION_COLORS[decision.emotion] || "var(--sky)" }}
                  >
                    {EMOTIONS.find((e) => e.value === decision.emotion)?.icon || "◻"}
                    {decision.emotion}
                  </span>
                  <span className="decision-date">{formatDate(decision.createdAt)}</span>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(decision.id)}
                  type="button"
                >✕</button>
              </div>

              <h4
                className="decision-title"
                onClick={() => setExpandedId(expandedId === decision.id ? null : decision.id)}
                style={{ cursor: "pointer" }}
              >
                {decision.title}
              </h4>

              {expandedId === decision.id && (
                <div className="decision-expanded">
                  {decision.description && (
                    <p className="decision-description">{decision.description}</p>
                  )}

                  <div className="outcome-section">
                    <p className="form-label">Outcome / Reflection</p>
                    {editingOutcome === decision.id ? (
                      <div className="outcome-edit">
                        <textarea
                          className="textarea"
                          rows="2"
                          placeholder="How did this turn out?"
                          value={outcomeText}
                          onChange={(e) => setOutcomeText(e.target.value)}
                        />
                        <div className="outcome-actions">
                          <button
                            className="button secondary"
                            type="button"
                            onClick={() => handleSaveOutcome(decision.id)}
                          >Save</button>
                          <button
                            className="button ghost-button"
                            type="button"
                            onClick={() => { setEditingOutcome(null); setOutcomeText(""); }}
                          >Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="outcome-display"
                        onClick={() => { setEditingOutcome(decision.id); setOutcomeText(decision.outcome || ""); }}
                      >
                        {decision.outcome || <span className="outcome-placeholder">Click to add outcome...</span>}
                      </div>
                    )}
                  </div>

                  {decision.tags?.length > 0 && (
                    <div className="memory-tags">
                      {decision.tags.map((tag) => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DecisionJournal;
