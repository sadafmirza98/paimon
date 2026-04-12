import { useEffect, useRef, useState } from "react";
import { fetchHistory, sendMessage, uploadDocument } from "./api";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [title, setTitle] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
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

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">PERN + AI</p>
          <h1>Paimon AI Chatbot</h1>
          <p className="sidebar-copy">
            Chat with an AI assistant and ground responses with your uploaded
            notes or text files.
          </p>
        </div>

        <form className="upload-card" onSubmit={handleUpload}>
          <h2>Knowledge Upload</h2>
          <input
            className="input"
            type="text"
            placeholder="Document title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <textarea
            className="textarea"
            rows="8"
            placeholder="Paste text here for retrieval..."
            value={documentText}
            onChange={(event) => setDocumentText(event.target.value)}
          />
          <input
            className="file-input"
            type="file"
            accept=".txt,.md,.text"
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          />
          <button className="button secondary" type="submit">
            {isUploadLoading ? "Uploading..." : "Upload Context"}
          </button>
          {uploadStatus ? <p className="status success">{uploadStatus}</p> : null}
        </form>
      </aside>

      <main className="chat-panel">
        <div className="chat-header">
          <div>
            <p className="eyebrow">AI Workspace</p>
            <h2>Context-aware chat</h2>
          </div>
        </div>

        <section className="messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <h3>Start the conversation</h3>
              <p>
                Ask anything, or upload notes so the assistant can answer with
                extra context.
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
                <p>{message.content}</p>
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
          <textarea
            className="composer-input"
            rows="2"
            placeholder="Type your message..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <button className="button" type="submit" disabled={isChatLoading}>
            Send
          </button>
        </form>

        {error ? <p className="status error">{error}</p> : null}
      </main>
    </div>
  );
};

export default App;
