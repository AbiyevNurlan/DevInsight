import React, { useState } from 'react';
import {
  findInterviewSlots,
  getInterviewerWorkload,
  rescheduleInterview,
} from '../../services/aiRecruitmentService';

const SmartSchedulerPage: React.FC = () => {
  const [payload, setPayload] = useState<any>({
    candidateTimezone: 'Asia/Baku',
    preferredTimeOfDay: 'MORNING',
    durationMinutes: 60,
    panelSize: 2,
    priority: 'HIGH',
    interviewerTimezones: ['Asia/Baku', 'Europe/Berlin'],
  });
  const [interviewId, setInterviewId] = useState(1);
  const [newDateTime, setNewDateTime] = useState(new Date().toISOString().slice(0, 19));
  const [interviewerId, setInterviewerId] = useState(1);
  const [result, setResult] = useState<any>(null);

  const findSlots = async () => {
    try { setResult(await findInterviewSlots(payload)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const doReschedule = async () => {
    try { setResult(await rescheduleInterview(interviewId, newDateTime)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const loadWorkload = async () => {
    try { setResult(await getInterviewerWorkload(interviewerId)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Smart Interview Scheduler</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <textarea
          value={JSON.stringify(payload, null, 2)}
          onChange={(e) => { try { setPayload(JSON.parse(e.target.value)); } catch { } }}
          rows={16}
          className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono text-sm"
        />
        <div className="space-y-3">
          <button onClick={findSlots} className="px-3 py-2 rounded bg-blue-600 text-white">Find Slots</button>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={interviewId} onChange={(e) => setInterviewId(Number(e.target.value))} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
            <input value={newDateTime} onChange={(e) => setNewDateTime(e.target.value)} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
          </div>
          <button onClick={doReschedule} className="px-3 py-2 rounded bg-amber-600 text-white">Reschedule</button>
          <div className="flex gap-2">
            <input type="number" value={interviewerId} onChange={(e) => setInterviewerId(Number(e.target.value))} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
            <button onClick={loadWorkload} className="px-3 py-2 rounded bg-violet-600 text-white">Workload</button>
          </div>
          <pre className="p-3 rounded bg-black/40 border border-zinc-800 text-xs text-zinc-200 overflow-auto max-h-[440px]">
            {result ? JSON.stringify(result, null, 2) : 'No result yet'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default SmartSchedulerPage;
