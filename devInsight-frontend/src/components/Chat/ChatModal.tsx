import React, { useState, useEffect, useRef } from 'react';

export interface ChatMessage {
  id: number;
  content: string;
  type: 'USER' | 'AI_SYSTEM';
  timestamp: string;
}

export interface ChatConversation {
  id: number;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  interviewScore: number;
  messages: ChatMessage[];
  candidateName: string;
  interviewTitle: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  interviewId: number;
  interviewScore: number;
  onChatCompleted?: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  interviewId,
  interviewScore,
  onChatCompleted
}) => {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  useEffect(() => {
    if (isOpen && !conversation) {
      initializeChat();
    }
  }, [isOpen, interviewId, interviewScore]);

  const initializeChat = async () => {
    setIsInitializing(true);
    setError(null);

    try {
      const token = localStorage.getItem('devinsight_jwt');
      console.log('[ChatModal] Starting chat with:', { interviewId, interviewScore, hasToken: !!token });
      
      const url = `/api/chat/start?interviewId=${interviewId}&interviewScore=${interviewScore}`;
      console.log('[ChatModal] API URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('[ChatModal] Response status:', response.status);
      const result = await response.json();
      console.log('[ChatModal] Response data:', result);

      if (result.success) {
        setConversation(result.data);
      } else {
        setError(result.message || 'Failed to start chat');
      }
    } catch (err) {
      console.error('[ChatModal] Error starting chat:', err);
      setError('Failed to connect to chat service');
    } finally {
      setIsInitializing(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation || isLoading) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('devinsight_jwt');
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId: conversation.id,
          content: messageContent
        })
      });

      const result = await response.json();

      if (result.success) {
        // Refresh conversation to get the latest messages
        await refreshConversation();
      } else {
        setError(result.message || 'Failed to send message');
        setNewMessage(messageContent); // Restore message if failed
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      setNewMessage(messageContent); // Restore message if failed
    } finally {
      setIsLoading(false);
    }
  };

  const refreshConversation = async () => {
    if (!conversation) return;

    try {
      const token = localStorage.getItem('devinsight_jwt');
      const response = await fetch(`/api/chat/history/${conversation.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setConversation(result.data);
        if (result.data.status === 'COMPLETED') {
          onChatCompleted?.();
        }
      }
    } catch (err) {
      console.error('Error refreshing conversation:', err);
    }
  };

  const handleClose = () => {
    setConversation(null);
    setNewMessage('');
    setError(null);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 h-[600px] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-blue-500 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              🤖
            </div>
            <div>
              <h3 className="font-semibold">Post-Interview Chat</h3>
              <p className="text-sm opacity-90">Score: {interviewScore}%</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-blue-600 p-2 rounded-full transition-colors"
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {isInitializing && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Starting chat...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </div>
            </div>
          )}

          {conversation && conversation.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 shadow-sm ${
                  message.type === 'USER'
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm border'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5 ${
                    message.type === 'AI_SYSTEM' 
                      ? 'bg-gray-200 text-gray-600' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    {message.type === 'AI_SYSTEM' ? '🤖' : '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed break-words">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.type === 'USER' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg px-4 py-3 max-w-[85%] shadow-sm border rounded-bl-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm">
                    🤖
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {conversation?.status === 'COMPLETED' && (
            <div className="text-center py-6">
              <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-lg shadow-sm">
                <span className="mr-2">✅</span>
                Chat completed successfully!
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {conversation && conversation.status === 'ACTIVE' && (
          <div className="border-t bg-white p-4 rounded-b-lg">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                  rows={2}
                  disabled={isLoading}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {newMessage.length}/500 • Press Enter to send
                </div>
              </div>
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isLoading}
                className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                aria-label="Send message"
              >
                {isLoading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <span className="text-lg">📤</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatModal;