import React, { useEffect, useState } from 'react';
import useChatAPI from '../../components/Chat/useChatAPI';

const PostInterviewChatPage: React.FC = () => {
  const {
    startChat,
    sendMessage,
    getChatHistory,
    getUserConversations,
    completeConversation,
    isLoading,
    error,
  } = useChatAPI();

  const [interviewId, setInterviewId] = useState(1);
  const [score, setScore] = useState(78);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [message, setMessage] = useState('Can you summarize my weak areas?');
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const loadConversations = async () => {
      const data = await getUserConversations();
      setResult(data);
      if (data?.length && data[0]?.id) setConversationId(data[0].id);
    };
    loadConversations();
  }, []);

  const begin = async () => {
    const c = await startChat({ interviewId, interviewScore: score });
    setResult(c);
    if (c?.id) setConversationId(c.id);
  };

  const pushMessage = async () => {
    if (!conversationId) return;
    const ok = await sendMessage({ conversationId, content: message });
    if (ok) {
      const updated = await getChatHistory(conversationId);
      setResult(updated);
    }
  };

  const refresh = async () => {
    if (!conversationId) return;
    setResult(await getChatHistory(conversationId));
  };

  const complete = async () => {
    if (!conversationId) return;
    await completeConversation(conversationId);
    await refresh();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Post-Interview AI Chat</h1>
      {error && <div className="text-rose-300 text-sm">{error}</div>}
      <div className="grid md:grid-cols-4 gap-2">
        <input type="number" value={interviewId} onChange={(e) => setInterviewId(Number(e.target.value))} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
        <input type="number" value={score} onChange={(e) => setScore(Number(e.target.value))} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
        <input type="number" value={conversationId || 0} onChange={(e) => setConversationId(Number(e.target.value))} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
        <button onClick={begin} disabled={isLoading} className="px-3 py-2 rounded bg-blue-600 text-white">Start Chat</button>
      </div>
      <div className="flex gap-2">
        <input value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1 px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
        <button onClick={pushMessage} disabled={isLoading} className="px-3 py-2 rounded bg-emerald-600 text-white">Send</button>
        <button onClick={refresh} disabled={isLoading} className="px-3 py-2 rounded bg-violet-600 text-white">Refresh</button>
        <button onClick={complete} disabled={isLoading} className="px-3 py-2 rounded bg-rose-600 text-white">Complete</button>
      </div>
      <pre className="p-3 rounded bg-black/40 border border-zinc-800 text-xs text-zinc-200 overflow-auto max-h-[520px]">
        {result ? JSON.stringify(result, null, 2) : 'No result yet'}
      </pre>
    </div>
  );
};

export default PostInterviewChatPage;
