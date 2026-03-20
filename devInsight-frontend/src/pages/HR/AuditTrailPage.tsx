import React, { useState } from 'react';
import {
  getAuditTrail,
  getAuditTrailByEvent,
  getAuditTrailByTimeRange,
} from '../../services/aiRecruitmentService';

const AuditTrailPage: React.FC = () => {
  const [candidateId, setCandidateId] = useState(1);
  const [eventType, setEventType] = useState('SCORING');
  const [start, setStart] = useState('2026-01-01T00:00:00');
  const [end, setEnd] = useState('2026-12-31T23:59:59');
  const [result, setResult] = useState<any>(null);

  const byCandidate = async () => {
    try { setResult(await getAuditTrail(candidateId)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const byEvent = async () => {
    try { setResult(await getAuditTrailByEvent(eventType)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const byRange = async () => {
    try { setResult(await getAuditTrailByTimeRange(start, end)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Explainability Audit Trail</h1>
      <div className="grid md:grid-cols-4 gap-2">
        <input type="number" value={candidateId} onChange={(e) => setCandidateId(Number(e.target.value))} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
        <input value={eventType} onChange={(e) => setEventType(e.target.value)} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
        <input value={start} onChange={(e) => setStart(e.target.value)} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
        <input value={end} onChange={(e) => setEnd(e.target.value)} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
      </div>
      <div className="flex gap-2">
        <button onClick={byCandidate} className="px-3 py-2 rounded bg-blue-600 text-white">By Candidate</button>
        <button onClick={byEvent} className="px-3 py-2 rounded bg-emerald-600 text-white">By Event</button>
        <button onClick={byRange} className="px-3 py-2 rounded bg-violet-600 text-white">By Time Range</button>
      </div>
      <pre className="p-3 rounded bg-black/40 border border-zinc-800 text-xs text-zinc-200 overflow-auto max-h-[520px]">
        {result ? JSON.stringify(result, null, 2) : 'No result yet'}
      </pre>
    </div>
  );
};

export default AuditTrailPage;
