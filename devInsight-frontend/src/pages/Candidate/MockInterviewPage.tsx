import React, { useState } from 'react';
import {
  endMockSession,
  getMockNextQuestion,
  getMockSessionReport,
  startMockInterview,
  submitMockAnswer,
} from '../../services/aiRecruitmentService';

const MockInterviewPage: React.FC = () => {
  const [sessionId, setSessionId] = useState('');
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<any>(null);

  const start = async () => {
    try {
      const data = await startMockInterview({
        candidateId: 1,
        jobTitle: 'Java Developer',
        difficulty: 'MEDIUM',
        domain: 'BACKEND',
        technologies: ['Java', 'Spring Boot', 'SQL'],
        adaptiveDifficulty: true,
      });
      setResult(data);
      if (data?.data?.sessionId) setSessionId(data.data.sessionId);
      if (data?.sessionId) setSessionId(data.sessionId);
    } catch (e: any) {
      setResult({ success: false, message: e?.response?.data?.message || e.message });
    }
  };

  const sendAnswer = async () => {
    try { setResult(await submitMockAnswer(sessionId, answer)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const next = async () => {
    try { setResult(await getMockNextQuestion(sessionId)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const report = async () => {
    try { setResult(await getMockSessionReport(sessionId)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const end = async () => {
    try { setResult(await endMockSession(sessionId)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Mock Interview Coach</h1>
      <div className="flex flex-wrap gap-2">
        <button onClick={start} className="px-3 py-2 rounded bg-blue-600 text-white">Start Session</button>
        <input value={sessionId} onChange={(e) => setSessionId(e.target.value)} placeholder="Session ID" className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
        <button onClick={next} className="px-3 py-2 rounded bg-emerald-600 text-white">Next Question</button>
        <button onClick={report} className="px-3 py-2 rounded bg-violet-600 text-white">Get Report</button>
        <button onClick={end} className="px-3 py-2 rounded bg-rose-600 text-white">End Session</button>
      </div>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer..."
        rows={5}
        className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
      />
      <button onClick={sendAnswer} className="px-3 py-2 rounded bg-amber-600 text-white">Submit Answer</button>
      <pre className="p-3 rounded bg-black/40 border border-zinc-800 text-xs text-zinc-200 overflow-auto max-h-[500px]">
        {result ? JSON.stringify(result, null, 2) : 'No result yet'}
      </pre>
    </div>
  );
};

export default MockInterviewPage;
