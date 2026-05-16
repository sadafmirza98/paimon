import { useEffect, useState } from "react";
import { fetchContexts } from "./api";
import ChatPanel from "./components/ChatPanel";
import ContextRealms from "./components/ContextRealms";
import DecisionJournal from "./components/DecisionJournal";
import Footer from "./components/Footer";
import KnowledgeArchive from "./components/KnowledgeArchive";
import KnowledgeSidebar from "./components/KnowledgeSidebar";
import LeftNav from "./components/LeftNav";
import LoginPage from "./components/LoginPage";
import MemoryTimeline from "./components/MemoryTimeline";
import RightPanel from "./components/RightPanel";
import { useAuth } from "./context/AuthContext";
import { signOutUser } from "./firebase";

const App = () => {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState("chat");
  const [activeContextId, setActiveContextId] = useState(null);
  const [contexts, setContexts] = useState([]);
  const [navOpen, setNavOpen] = useState(false);
  const [knowledgeRefresh, setKnowledgeRefresh] = useState(0);

  const loadContexts = async () => {
    try {
      const data = await fetchContexts();
      setContexts(data.contexts);
    } catch {
      // non-critical
    }
  };

  useEffect(() => {
    if (user) loadContexts();
  }, [user]);

  // Show nothing while Firebase resolves the initial auth state
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="aurora aurora-one" />
        <div className="aurora aurora-two" />
        <div className="typing-dots">
          <span /><span /><span />
        </div>
      </div>
    );
  }

  // Not signed in — show login page
  if (!user) return <LoginPage />;

  const handleContextSelect = (id) => {
    setActiveContextId(id);
    setActiveView("chat");
    setNavOpen(false);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    setActiveContextId(null);
    setNavOpen(false);
  };

  const renderMainContent = () => {
    switch (activeView) {
      case "chat":
        return <ChatPanel activeContextId={activeContextId} contexts={contexts} />;
      case "timeline":
        return <MemoryTimeline activeContextId={activeContextId} contexts={contexts} />;
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
        return <KnowledgeArchive onUploaded={() => setKnowledgeRefresh((n) => n + 1)} />;
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
      <div className="starfield" />
      <div className="shooting-stars" />
      <div className="shooting-stars-2" />

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
          user={user}
          onSignOut={signOutUser}
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

      {/* Right panel — chat context or knowledge sidebar */}
      {activeView === "chat" && (
        <RightPanel activeContextId={activeContextId} contexts={contexts} />
      )}
      {activeView === "archive" && (
        <KnowledgeSidebar refreshTrigger={knowledgeRefresh} />
      )}

      <Footer />
    </div>
  );
};

export default App;
