import React, { useState } from 'react';
import {
  createInterviewFeedback,
  finalizeInterviewFeedback,
  shareInterviewFeedback,
} from '../../services/aiRecruitmentService';

const FeedbackWorkbenchPage: React.FC = () => {
  const [interviewId, setInterviewId] = useState(1);
  const [feedbackId, setFeedbackId] = useState(1);
  const [payload, setPayload] = useState<any>({
    score: 82,
    comments: 'Strong technical depth, improve communication brevity.',
    recommendations: 'Advance to next round',
  });
  const [result, setResult] = useState<any>(null);

  const create = async () => {
    try { setResult(await createInterviewFeedback(interviewId, payload)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const finalize = async () => {
    try { setResult(await finalizeInterviewFeedback(feedbackId)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const share = async () => {
    try { setResult(await shareInterviewFeedback(feedbackId)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Feedback Workbench</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <input type="number" value={interviewId} onChange={(e) => setInterviewId(Number(e.target.value))} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
          <textarea
            value={JSON.stringify(payload, null, 2)}
            onChange={(e) => { try { setPayload(JSON.parse(e.target.value)); } catch { } }}
            rows={10}
            className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono"
          />
          <div className="flex gap-2">
            <button onClick={create} className="px-3 py-2 rounded bg-blue-600 text-white">Create Feedback</button>
            <input type="number" value={feedbackId} onChange={(e) => setFeedbackId(Number(e.target.value))} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
            <button onClick={finalize} className="px-3 py-2 rounded bg-emerald-600 text-white">Finalize</button>
            <button onClick={share} className="px-3 py-2 rounded bg-violet-600 text-white">Share</button>
          </div>
        </div>
        <pre className="p-3 rounded bg-black/40 border border-zinc-800 text-xs text-zinc-200 overflow-auto max-h-[520px]">
          {result ? JSON.stringify(result, null, 2) : 'No result yet'}
        </pre>
      </div>
    </div>
  );
};

export default FeedbackWorkbenchPage;
