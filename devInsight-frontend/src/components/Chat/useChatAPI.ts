import { useState, useCallback } from 'react';

interface ChatMessage {
  id: number;
  content: string;
  type: 'USER' | 'AI_SYSTEM';
  timestamp: string;
}

interface ChatConversation {
  id: number;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  interviewScore: number;
  messages: ChatMessage[];
  candidateName: string;
  interviewTitle: string;
  messageCount: number;
}

interface StartChatData {
  interviewId: number;
  interviewScore: number;
}

interface SendMessageData {
  conversationId: number;
  content: string;
}

export const useChatAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = useCallback(() => {
    return localStorage.getItem('devinsight_jwt');
  }, []);

  const startChat = useCallback(async (data: StartChatData): Promise<ChatConversation | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/chat/start?interviewId=${data.interviewId}&interviewScore=${data.interviewScore}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        setError(result.message || 'Failed to start chat');
        return null;
      }
    } catch (err) {
      console.error('Error starting chat:', err);
      setError('Failed to connect to chat service');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken]);

  const sendMessage = useCallback(async (data: SendMessageData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        return true;
      } else {
        setError(result.message || 'Failed to send message');
        return false;
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken]);

  const getChatHistory = useCallback(async (conversationId: number): Promise<ChatConversation | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/chat/history/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        setError(result.message || 'Failed to get chat history');
        return null;
      }
    } catch (err) {
      console.error('Error getting chat history:', err);
      setError('Failed to get chat history');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken]);

  const getUserConversations = useCallback(async (): Promise<ChatConversation[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch('/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        return result.data || [];
      } else {
        setError(result.message || 'Failed to get conversations');
        return [];
      }
    } catch (err) {
      console.error('Error getting conversations:', err);
      setError('Failed to get conversations');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken]);

  const completeConversation = useCallback(async (conversationId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/chat/complete/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        return true;
      } else {
        setError(result.message || 'Failed to complete conversation');
        return false;
      }
    } catch (err) {
      console.error('Error completing conversation:', err);
      setError('Failed to complete conversation');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    startChat,
    sendMessage,
    getChatHistory,
    getUserConversations,
    completeConversation,
    clearError
  };
};

export default useChatAPI;