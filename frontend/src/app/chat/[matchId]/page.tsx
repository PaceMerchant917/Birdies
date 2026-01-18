'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { getMessages, sendMessage, getMe, type Message, type ApiError } from '../../../lib/api';

export default function ChatPage({ params }: { params: { matchId: string } }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      // Get current user ID
      getMe().then((response) => {
        setCurrentUserId(response.user.id);
      }).catch(console.error);

      // Load initial messages
      loadMessages();

      // Set up polling every 2 seconds
      pollingIntervalRef.current = setInterval(() => {
        loadMessages(true); // Silent refresh
      }, 2000);

      // Clean up interval on unmount
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [isAuthenticated, params.matchId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async (silent: boolean = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      const response = await getMessages(params.matchId);
      setMessages(response.messages);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error?.message || 'Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      await sendMessage(params.matchId, newMessage.trim());
      setNewMessage('');
      
      // Immediately refresh messages
      await loadMessages(true);
    } catch (err) {
      const apiError = err as ApiError;
      alert(apiError.error?.message || 'Failed to send message');
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mobile-container placeholder-page">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mobile-container chat-page">
      {/* Header */}
      <header className="chat-header">
        <Link href="/matches" className="back-button">
          ← Back
        </Link>
        <h1>Chat</h1>
        <div style={{ width: '40px' }}></div>
      </header>

      {/* Messages */}
      <main className="chat-content">
        {loading ? (
          <div className="chat-placeholder">
            <div className="placeholder-icon">⏳</div>
            <p>Loading messages...</p>
          </div>
        ) : error ? (
          <div className="chat-placeholder">
            <div className="placeholder-icon">⚠️</div>
            <p>{error}</p>
            <button onClick={() => loadMessages()} style={{ marginTop: '20px', padding: '10px 20px' }}>
              Try Again
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-placeholder">
            <div className="placeholder-icon">💬</div>
            <p>No messages yet. Say hi!</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => {
              const isCurrentUser = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`message ${isCurrentUser ? 'message-sent' : 'message-received'}`}
                >
                  <div className="message-bubble">
                    <p>{message.body}</p>
                    <span className="message-time">
                      {new Date(message.createdAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Message Input */}
      <form className="chat-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          maxLength={2000}
        />
        <button type="submit" disabled={!newMessage.trim() || sending}>
          {sending ? '...' : '➤'}
        </button>
      </form>

      <style jsx>{`
        .chat-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #f9f9f9;
        }

        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.95);
          color: #000000;
          flex-shrink: 0;
          border-bottom: 0.5px solid #e5e5e7;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .chat-header h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .back-button {
          color: #000000;
          text-decoration: none;
          font-weight: 500;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .back-button:active {
          background: #f2f2f7;
          transform: scale(0.95);
        }

        .chat-content {
          flex: 1;
          overflow-y: auto;
          background: #f9f9f9;
          padding: 16px;
        }

        .chat-placeholder {
          text-align: center;
          padding: 80px 24px;
          color: #8e8e93;
        }

        .placeholder-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .message {
          display: flex;
          animation: slideIn 0.2s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-sent {
          justify-content: flex-end;
        }

        .message-received {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 75%;
          padding: 12px 16px;
          border-radius: 20px;
          word-wrap: break-word;
        }

        .message-sent .message-bubble {
          background: #000000;
          color: white;
          border-bottom-right-radius: 6px;
        }

        .message-received .message-bubble {
          background: white;
          color: #2c2c2e;
          border-bottom-left-radius: 6px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          border: 0.5px solid #e5e5e7;
        }

        .message-bubble p {
          margin: 0 0 4px 0;
          font-size: 16px;
          line-height: 1.4;
        }

        .message-time {
          font-size: 11px;
          opacity: 0.6;
          font-weight: 500;
        }

        .chat-input {
          display: flex;
          gap: 10px;
          padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
          background: rgba(255, 255, 255, 0.95);
          border-top: 0.5px solid #e5e5e7;
          flex-shrink: 0;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .chat-input input {
          flex: 1;
          padding: 12px 16px;
          border: 0.5px solid #d1d1d6;
          border-radius: 24px;
          font-size: 16px;
          outline: none;
          background: #f9f9f9;
          color: #000000;
          transition: all 0.2s ease;
        }

        .chat-input input:focus {
          border-color: #000000;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
        }

        .chat-input button {
          width: 44px;
          height: 44px;
          border-radius: 22px;
          border: none;
          background: #000000;
          color: white;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-input button:active:not(:disabled) {
          transform: scale(0.9);
        }

        .chat-input button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
