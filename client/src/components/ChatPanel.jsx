import { useEffect, useRef, useState } from "react";
import { clearHistory, fetchHistory, sendMessage } from "../api";

const ChatPanel = ({ activeContextId, contexts, onMemorySaved }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [error, setError] = useState("");
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef(null);

  const activeContext = contexts?.find((c) => c.id === activeContextId);

  useEffect(() => {
    setHistoryLoaded(false);
    const loadHistory = async () => {
      try {
        const data = await fetchHistory(activeContextId);
        setMessages(data.messages);
      } catch (err) {
        setError(err.message);
      } finally {
        setHistoryLoaded(true);
      }
    };
    loadHistory();
  }, [activeContextId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatLoading]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isChatLoading) return;

    setError("");
    setIsChatLoading(true);

    try {
      const data = await sendMessage(trimmedInput, activeContextId);
      setMessages((current) => [...current, data.userMessage, data.assistantMessage]);
      setInput("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleClearHistory = async () => {
    if (isClearingHistory || isChatLoading) return;
    setError("");
    setIsClearingHistory(true);
    try {
      await clearHistory(activeContextId);
      setMessages([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsClearingHistory(false);
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-title-group">
          <p className="eyebrow">Astral Conversation</p>
          <h2 className="chat-heading">
            {activeContext ? activeContext.name : "Paimon's Guidance Desk"}
          </h2>
          <p className="chat-subtitle">
            {activeContext
              ? activeContext.description || "Context-aware memory companion"
              : "Ask naturally. Paimon remembers your memories, notes, and context."}
          </p>
        </div>
        <div className="chat-header-actions">
          <div className="header-badge">
            <span className="header-badge-dot" />
            Memory Active
          </div>
          <button
            className="button ghost-button clear-btn"
            type="button"
            onClick={handleClearHistory}
            disabled={isClearingHistory || isChatLoading || (messages.length === 0 && historyLoaded)}
          >
            {isClearingHistory ? "Clearing..." : "Clear"}
          </button>
        </div>
      </div>

      <section className="messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-sigil">✦</div>
            <h3>Begin your journey</h3>
            <p>
              {activeContext
                ? `You're in the "${activeContext.name}" realm. Ask anything — Paimon has your context.`
                : "Ask a question, save a memory, or start a new context realm."}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <article key={message.id} className={`message-bubble ${message.role}`}>
              <span className="message-role">
                {message.role === "user" ? "You" : "✦ Paimon"}
              </span>
              <p className="message-copy">{message.content}</p>
              <span className="message-time">
                {message.createdAt
                  ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : ""}
              </span>
            </article>
          ))
        )}

        {isChatLoading && (
          <article className="message-bubble assistant loading">
            <span className="message-role">✦ Paimon</span>
            <div className="typing-dots">
              <span /><span /><span />
            </div>
          </article>
        )}

        <div ref={messagesEndRef} />
      </section>

      <form className="composer" onSubmit={handleSubmit}>
        <div className="composer-shell">
          <textarea
            className="composer-input"
            rows="2"
            placeholder={activeContext ? `Ask Paimon about ${activeContext.name}...` : "Ask Paimon anything..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button className="button send-btn" type="submit" disabled={isChatLoading}>
          <span className="send-icon">✦</span>
          <span>Send</span>
        </button>
      </form>

      {error && <p className="status error">{error}</p>}
    </div>
  );
};

export default ChatPanel;
