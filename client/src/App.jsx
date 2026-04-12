import { useEffect, useRef, useState } from "react";
import {
  clearHistory,
  fetchHistory,
  sendMessage,
  uploadDocument,
} from "./api";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [title, setTitle] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [error, setError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchHistory();
        setMessages(data.messages);
      } catch (requestError) {
        setError(requestError.message);
      }
    };

    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatLoading]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isChatLoading) {
      return;
    }

    setError("");
    setIsChatLoading(true);

    try {
      const data = await sendMessage(trimmedInput);
      setMessages((current) => [
        ...current,
        data.userMessage,
        data.assistantMessage,
      ]);
      setInput("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if ((!documentText.trim() && !selectedFile) || isUploadLoading) {
      return;
    }

    setError("");
    setUploadStatus("");
    setIsUploadLoading(true);

    try {
      const data = await uploadDocument({
        title: title.trim(),
        content: documentText.trim(),
        file: selectedFile,
      });

      setUploadStatus(`Saved "${data.document.title}" for RAG context.`);
      setTitle("");
      setDocumentText("");
      setSelectedFile(null);
      event.target.reset();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsUploadLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (isClearingHistory || isChatLoading) {
      return;
    }

    setError("");
    setUploadStatus("");
    setIsClearingHistory(true);

    try {
      await clearHistory();
      setMessages([]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsClearingHistory(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="starlight-grid" />

      <aside className="sidebar">
        <div className="sidebar-intro">
          <p className="eyebrow">Teyvat Companion</p>
          <div className="crest">
            <span className="crest-star">*</span>
            <span className="crest-ring" />
          </div>
          <h1>Paimon AI Chatbot</h1>
          <p className="sidebar-copy">
            A celestial guide for your notes, ideas, and questions. Upload lore,
            study material, or project docs and let Paimon answer with context.
          </p>
        </div>

        <form className="upload-card" onSubmit={handleUpload}>
          <div className="card-heading">
            <p className="eyebrow">Archive</p>
            <h2>Starfell Knowledge</h2>
          </div>
          <input
            className="input"
            type="text"
            placeholder="Chronicle title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <textarea
            className="textarea"
            rows="8"
            placeholder="Paste lore, notes, or reference text for retrieval..."
            value={documentText}
            onChange={(event) => setDocumentText(event.target.value)}
          />
          <input
            className="file-input"
            type="file"
            accept=".txt,.md,.text"
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          />
          <p className="upload-hint">
            Paimon will search these notes when answering future questions.
          </p>
          <button className="button secondary" type="submit">
            {isUploadLoading ? "Blessing the archive..." : "Add To Archive"}
          </button>
          {uploadStatus ? <p className="status success">{uploadStatus}</p> : null}
        </form>
      </aside>

      <main className="chat-panel">
        <div className="chat-header">
          <div className="chat-title-group">
            <p className="eyebrow">Astral Conversation</p>
            <h2>Paimon's Guidance Desk</h2>
            <p className="chat-subtitle">
              Ask naturally. Uploaded documents become part of Paimon's memory.
            </p>
          </div>
          <div className="header-badge">
            <span className="header-badge-dot" />
            RAG Enabled
          </div>
        </div>

        <div className="toolbar">
          <button
            className="button ghost-button"
            type="button"
            onClick={handleClearHistory}
            disabled={isClearingHistory || isChatLoading || messages.length === 0}
          >
            {isClearingHistory ? "Clearing..." : "Clear History"}
          </button>
        </div>

        <section className="messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-sigil">*</div>
              <h3>Begin your journey</h3>
              <p>
                Ask a question, summon a summary, or upload documents so Paimon
                can answer with world-aware context.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <article
                key={message.id}
                className={`message-bubble ${message.role}`}
              >
                <span className="message-role">
                  {message.role === "user" ? "You" : "Paimon"}
                </span>
                <p className="message-copy">{message.content}</p>
              </article>
            ))
          )}

          {isChatLoading ? (
            <article className="message-bubble assistant loading">
              <span className="message-role">Paimon</span>
              <div className="typing-dots">
                <span />
                <span />
                <span />
              </div>
            </article>
          ) : null}

          <div ref={messagesEndRef} />
        </section>

        <form className="composer" onSubmit={handleSubmit}>
          <div className="composer-shell">
            <textarea
              className="composer-input"
              rows="2"
              placeholder="Ask Paimon anything..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
          </div>
          <button className="button" type="submit" disabled={isChatLoading}>
            Send Wish
          </button>
        </form>

        {error ? <p className="status error">{error}</p> : null}
      </main>
    </div>
  );
};

export default App;
