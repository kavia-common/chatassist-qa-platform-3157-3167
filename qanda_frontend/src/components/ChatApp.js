import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  apiHealth,
  apiSendMessage,
  apiGetHistory,
  apiAuthStatus,
  apiLogin,
  apiLogout,
} from "../services/api";
import "./chat.css";

/**
 * Ocean Professional theme tokens
 */
const colors = {
  primary: "#2563EB", // blue
  secondary: "#F59E0B", // amber
  error: "#EF4444",
  background: "#f9fafb",
  surface: "#ffffff",
  text: "#111827",
};

function useAutoScroll(deps) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

function Header({ user, onLoginClick, onLogout }) {
  return (
    <header className="qa-header">
      <div className="qa-header__brand">
        <div className="qa-logo">Q&A</div>
        <div className="qa-brand-text">
          <strong>ChatAssist</strong>
          <span className="qa-brand-sub">Ocean Professional</span>
        </div>
      </div>
      <div className="qa-header__actions">
        {user ? (
          <>
            <span className="qa-user">Hi, {user.username}</span>
            <button className="btn btn-amber" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="btn btn-blue" onClick={onLoginClick}>
            Login
          </button>
        )}
      </div>
    </header>
  );
}

function LoginModal({ open, onClose, onSubmit, error }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Sign in</h3>
        <div className="form-field">
          <label>Username</label>
          <input
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="form-field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            placeholder="********"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-blue"
            onClick={() => onSubmit({ username, password })}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ open, items, activeId, onSelect, onToggle }) {
  return (
    <aside className={`qa-sidebar ${open ? "open" : ""}`}>
      <div className="qa-sidebar__header">
        <span>History</span>
        <button className="icon-btn" onClick={onToggle} aria-label="Toggle sidebar">
          {open ? "⟨" : "⟩"}
        </button>
      </div>
      <div className="qa-sidebar__content">
        {items.length === 0 ? (
          <div className="empty-state">No conversations yet.</div>
        ) : (
          items.map((it) => (
            <button
              key={it.id}
              className={`history-item ${activeId === it.id ? "active" : ""}`}
              onClick={() => onSelect(it)}
              title={it.title || "Conversation"}
            >
              <span className="dot" />
              <span className="label">{it.title || "Conversation"}</span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}

function Message({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={`msg ${isUser ? "user" : "assistant"}`}>
      <div className="msg-bubble">
        {content}
      </div>
    </div>
  );
}

function Composer({ disabled, onSend }) {
  const [value, setValue] = useState("");
  const handleSend = () => {
    const v = value.trim();
    if (!v) return;
    onSend(v);
    setValue("");
  };
  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return (
    <div className="qa-composer">
      <textarea
        rows={1}
        placeholder="Ask anything..."
        value={value}
        onKeyDown={onKey}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
      />
      <button className="btn btn-blue" disabled={disabled} onClick={handleSend}>
        Send
      </button>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function ChatApp() {
  /**
   * This component renders the full chat layout and integrates with the backend.
   */
  const [connected, setConnected] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [history, setHistory] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);
  const [user, setUser] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState("");

  const scrollRef = useAutoScroll([messages.length]);

  const canSend = useMemo(() => !pending, [pending]);

  // Initial health and auth checks
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await apiHealth();
        if (!mounted) return;
        setConnected(true);
      } catch {
        setConnected(false);
      }
      try {
        const status = await apiAuthStatus();
        if (!mounted) return;
        setUser(status?.user || null);
      } catch {
        // ignore
      }
      try {
        const hist = await apiGetHistory();
        if (!mounted) return;
        setHistory(Array.isArray(hist) ? hist : hist?.items || []);
        if (Array.isArray(hist) && hist.length > 0) {
          setActiveChat(hist[0]);
          setMessages(hist[0].messages || []);
        }
      } catch {
        // ignore history failures for now
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onLoginClick = () => {
    setLoginError("");
    setLoginOpen(true);
  };
  const onLogin = async ({ username, password }) => {
    try {
      setLoginError("");
      await apiLogin({ username, password });
      const status = await apiAuthStatus();
      setUser(status?.user || { username });
      setLoginOpen(false);
    } catch (e) {
      setLoginError(e.message || "Login failed");
    }
  };
  const onLogout = async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  };

  const onSelectHistory = (it) => {
    setActiveChat(it);
    setMessages(it.messages || []);
  };

  const onSend = async (text) => {
    setPending(true);
    const localMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, localMsg]);
    try {
      const res = await apiSendMessage({
        chat_id: activeChat ? activeChat.id : null,
        message: text,
      });

      // Expected response structure:
      // { chat_id, answer, messages?, title? }
      const answerMsg = { role: "assistant", content: res.answer || "..." };
      setMessages((prev) => [...prev, answerMsg]);

      // Update active chat and history
      const updatedChat = {
        id: res.chat_id || activeChat?.id || `temp-${Date.now()}`,
        title: res.title || activeChat?.title || text.slice(0, 30),
        messages:
          res.messages ||
          (activeChat?.messages || []).concat([localMsg, answerMsg]),
      };
      setActiveChat(updatedChat);
      setHistory((h) => {
        const others = h.filter((c) => c.id !== updatedChat.id);
        return [updatedChat, ...others];
      });
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${e.message}` },
      ]);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="qa-app" style={{ background: colors.background }}>
      <div className="qa-surface">
        <Header user={user} onLoginClick={onLoginClick} onLogout={onLogout} />
        <div className="qa-body">
          <Sidebar
            open={sidebarOpen}
            items={history}
            activeId={activeChat?.id || null}
            onSelect={onSelectHistory}
            onToggle={() => setSidebarOpen((s) => !s)}
          />
          <main className="qa-chat">
            <div className="qa-status">
              <span
                className={`dot ${connected ? "ok" : "err"}`}
                title={connected ? "Connected" : "Disconnected"}
              />
              <span className="status-text">
                {connected ? "Connected to backend" : "Backend unreachable"}
              </span>
            </div>
            <div className="qa-messages" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="hero-empty">
                  <h2>Ask anything</h2>
                  <p>Use the box below to start a conversation.</p>
                </div>
              ) : (
                messages.map((m, i) => (
                  <Message key={i} role={m.role} content={m.content} />
                ))
              )}
            </div>
            <Composer disabled={!connected || !canSend} onSend={onSend} />
          </main>
        </div>
      </div>
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSubmit={onLogin}
        error={loginError}
      />
    </div>
  );
}
