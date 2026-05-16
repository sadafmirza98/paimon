const NAV_ITEMS = [
  { id: "chat", icon: "✦", label: "Guidance Desk" },
  { id: "timeline", icon: "◈", label: "Memory Archive" },
  { id: "decisions", icon: "⟡", label: "Decision Journal" },
  { id: "contexts", icon: "⬡", label: "Context Realms" },
  { id: "archive", icon: "⊕", label: "Knowledge Archive" },
];

const CONTEXT_COLORS = {
  sky: "#85b8ef",
  gold: "#caa25a",
  rose: "#e8a0a0",
  sage: "#8ec4a0",
  violet: "#b09ee0",
};

const LeftNav = ({ activeView, onViewChange, contexts, activeContextId, onContextSelect, user, onSignOut }) => {
  return (
    <nav className="left-nav">
      <div className="left-nav-brand">
        <div className="brand-crest">
          <img src="/paimon.png" alt="Paimon" className="brand-img" />
        </div>
        <div>
          <p className="eyebrow">Teyvat Companion</p>
          <h1 className="brand-title">Paimon</h1>
        </div>
      </div>

      <div className="nav-section">
        <p className="nav-section-label">Navigate</p>
        <ul className="nav-list">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${activeView === item.id ? "active" : ""}`}
                onClick={() => onViewChange(item.id)}
                type="button"
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {activeView === item.id && <span className="nav-active-dot" />}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {contexts.length > 0 && (
        <div className="nav-section">
          <p className="nav-section-label">Context Realms</p>
          <ul className="nav-list">
            <li>
              <button
                className={`nav-item context-item ${activeView === "chat" && !activeContextId ? "active" : ""}`}
                onClick={() => onContextSelect(null)}
                type="button"
              >
                <span className="context-dot" style={{ background: "#b09ee0" }} />
                <span className="nav-label">All Realms</span>
              </button>
            </li>
            {contexts.slice(0, 6).map((ctx) => (
              <li key={ctx.id}>
                <button
                  className={`nav-item context-item ${activeView === "chat" && activeContextId === ctx.id ? "active" : ""}`}
                  onClick={() => onContextSelect(ctx.id)}
                  type="button"
                >
                  <span
                    className="context-dot"
                    style={{ background: CONTEXT_COLORS[ctx.color] || CONTEXT_COLORS.sky }}
                  />
                  <span className="nav-label">{ctx.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="nav-footer">
        <div className="nav-footer-badge">
          <span className="footer-dot" />
          <span>Memory Active</span>
        </div>
        {user && (
          <div className="nav-user">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="nav-user-avatar"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="nav-user-info">
              <span className="nav-user-name">{user.displayName || user.email}</span>
            </div>
            <button
              className="nav-signout-btn"
              onClick={onSignOut}
              type="button"
              title="Sign out"
              aria-label="Sign out"
            >
              ⎋
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default LeftNav;
