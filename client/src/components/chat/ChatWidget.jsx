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
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-[#3B4A6B] text-white text-sm font-medium rounded hover:bg-[#4A5B80] transition-colors duration-150"
          id="chat-toggle"
        >
          <MessageSquare size={16} />
          Assistant
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-[#E5E5E5] z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5]">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-[#3B4A6B]" />
              <span className="text-sm font-semibold text-[#171717]">ContentFlow Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="xs" onClick={handleClear} aria-label="Clear chat">
                <Trash2 size={14} />
              </Button>
              <Button variant="ghost" size="xs" onClick={() => setIsOpen(false)} aria-label="Close chat">
                <X size={16} />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare size={24} className="mx-auto mb-3 text-[#D4D4D4]" />
                <p className="text-sm text-[#737373]">Ask about content, delays, or standup summaries.</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] text-sm rounded px-3 py-2 ${
                    msg.role === 'user'
                      ? 'bg-[#3B4A6B] text-white'
                      : 'bg-[#F5F5F5] text-[#171717] border border-[#E5E5E5]'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#A3A3A3] rounded-full animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-[#A3A3A3] rounded-full animate-pulse [animation-delay:150ms]" />
                    <div className="w-1.5 h-1.5 bg-[#A3A3A3] rounded-full animate-pulse [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-[#E5E5E5]">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 text-sm px-3 py-2 border border-[#E5E5E5] rounded bg-white text-[#171717] placeholder-[#A3A3A3] focus:outline-none focus:border-[#3B4A6B] transition-colors duration-150"
                id="chat-input"
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
