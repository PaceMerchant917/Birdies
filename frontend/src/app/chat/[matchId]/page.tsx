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
        }

        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          flex-shrink: 0;
        }

        .chat-header h1 {
          margin: 0;
          font-size: 20px;
        }

        .back-button {
          color: white;
          text-decoration: none;
          font-weight: 500;
        }

        .chat-content {
          flex: 1;
          overflow-y: auto;
          background: #f5f5f5;
          padding: 20px;
        }

        .chat-placeholder {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .placeholder-icon {
          font-size: 60px;
          margin-bottom: 20px;
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message {
          display: flex;
        }

        .message-sent {
          justify-content: flex-end;
        }

        .message-received {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 18px;
          word-wrap: break-word;
        }

        .message-sent .message-bubble {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message-received .message-bubble {
          background: white;
          color: #333;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .message-bubble p {
          margin: 0 0 4px 0;
          font-size: 15px;
          line-height: 1.4;
        }

        .message-time {
          font-size: 11px;
          opacity: 0.7;
        }

        .chat-input {
          display: flex;
          gap: 8px;
          padding: 16px 20px;
          background: white;
          border-top: 1px solid #eee;
          flex-shrink: 0;
        }

        .chat-input input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 24px;
          font-size: 15px;
          outline: none;
        }

        .chat-input input:focus {
          border-color: #667eea;
        }

        .chat-input button {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 20px;
          cursor: pointer;
          transition: transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-input button:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .chat-input button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
