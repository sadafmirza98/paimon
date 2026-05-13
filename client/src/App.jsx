import { useEffect, useState } from "react";
import { fetchContexts } from "./api";
import ChatPanel from "./components/ChatPanel";
import ContextRealms from "./components/ContextRealms";
import DecisionJournal from "./components/DecisionJournal";
import Footer from "./components/Footer";
import KnowledgeArchive from "./components/KnowledgeArchive";
import LeftNav from "./components/LeftNav";
import MemoryTimeline from "./components/MemoryTimeline";
import RightPanel from "./components/RightPanel";

const App = () => {
  const [activeView, setActiveView] = useState("chat");
  const [activeContextId, setActiveContextId] = useState(null);
  const [contexts, setContexts] = useState([]);
  const [navOpen, setNavOpen] = useState(false);

  const loadContexts = async () => {
    try {
      const data = await fetchContexts();
      setContexts(data.contexts);
    } catch {
      // non-critical
    }
  };

  useEffect(() => { loadContexts(); }, []);

  const handleContextSelect = (id) => {
    setActiveContextId(id);
    setActiveView("chat");
    setNavOpen(false);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    setNavOpen(false);
  };

  const renderMainContent = () => {
    switch (activeView) {
      case "chat":
        return (
          <ChatPanel
            activeContextId={activeContextId}
            contexts={contexts}
          />
        );
      case "timeline":
        return (
          <MemoryTimeline
            activeContextId={activeContextId}
            contexts={contexts}
          />
        );
      case "decisions":
        return <DecisionJournal />;
      case "contexts":
        return (
          <ContextRealms
            contexts={contexts}
            onContextsChange={loadContexts}
            onContextSelect={handleContextSelect}
          />
        );
      case "archive":
        return <KnowledgeArchive />;
      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      {/* Ambient background layers */}
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="starlight-grid" />

      {/* Mobile nav toggle */}
      <button
        className="mobile-nav-toggle"
        onClick={() => setNavOpen(!navOpen)}
        type="button"
        aria-label="Toggle navigation"
      >
        {navOpen ? "✕" : "✦"}
      </button>

      {/* Left navigation */}
      <div className={`left-nav-wrapper ${navOpen ? "open" : ""}`}>
        <LeftNav
          activeView={activeView}
          onViewChange={handleViewChange}
          contexts={contexts}
          activeContextId={activeContextId}
          onContextSelect={handleContextSelect}
        />
      </div>

      {/* Mobile overlay */}
      {navOpen && (
        <div className="nav-overlay" onClick={() => setNavOpen(false)} />
      )}

      {/* Main content */}
      <main className="main-content">
        {renderMainContent()}
      </main>

      {/* Right context panel — only show on chat view */}
      {activeView === "chat" && (
        <RightPanel
          activeContextId={activeContextId}
          contexts={contexts}
        />
      )}

      <Footer />
    </div>
  );
};

export default App;
