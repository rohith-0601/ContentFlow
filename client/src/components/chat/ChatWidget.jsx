import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Trash2 } from 'lucide-react';
import { chatApi } from '../../lib/api';
import Button from '../ui/Button';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const loadHistory = async () => {
    try {
      const { data } = await chatApi.getHistory(50);
      setMessages(data.map((log) => ({ role: log.role, content: log.message })));
    } catch {
      // Silent fail on history load
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await chatApi.send(trimmed);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'An error occurred. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      await chatApi.clearHistory();
      setMessages([]);
    } catch {
      // Silent fail
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Toggle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          id="chat-toggle"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: '#171717',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 500,
            fontFamily: "'Inter', sans-serif",
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '2px 2px 6px rgba(0,0,0,0.04), -1px -1px 3px rgba(255,255,255,0.6)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2D2D2D';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#171717';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <MessageSquare size={15} />
          Assistant
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className="animate-slide-right"
          style={{
            position: 'fixed',
            right: 0,
            top: 0,
            bottom: 0,
            width: '380px',
            backgroundColor: '#FFFFFF',
            borderLeft: '1px solid #E5E5E5',
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.04)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid #E5E5E5',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={15} style={{ color: '#3B4A6B' }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#171717' }}>
                ContentFlow Assistant
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Button variant="ghost" size="xs" onClick={handleClear} aria-label="Clear chat">
                <Trash2 size={14} />
              </Button>
              <Button variant="ghost" size="xs" onClick={() => setIsOpen(false)} aria-label="Close chat">
                <X size={16} />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <MessageSquare size={24} style={{ margin: '0 auto 12px', color: '#D4D4D4' }} />
                <p style={{ fontSize: '13px', color: '#737373' }}>
                  Ask about content, delays, or standup summaries.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    borderRadius: '8px',
                    padding: '10px 14px',
                    ...(msg.role === 'user'
                      ? { backgroundColor: '#171717', color: '#FFFFFF' }
                      : { backgroundColor: '#F5F5F5', color: '#171717', border: '1px solid #E5E5E5' }),
                  }}
                >
                  <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    backgroundColor: '#F5F5F5',
                    border: '1px solid #E5E5E5',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {[0, 1, 2].map((n) => (
                    <div
                      key={n}
                      style={{
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#A3A3A3',
                        borderRadius: '50%',
                        animation: `pulse-dot 1.2s ease-in-out ${n * 150}ms infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E5E5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                id="chat-input"
                style={{
                  flex: 1,
                  fontSize: '13px',
                  padding: '9px 12px',
                  border: '1px solid #E5E5E5',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  color: '#171717',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  fontFamily: "'Inter', sans-serif",
                }}
                onFocus={(e) => { e.target.style.borderColor = '#3B4A6B'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E5E5'; }}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
              >
                <Send size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
