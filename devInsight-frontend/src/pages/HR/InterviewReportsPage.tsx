import React, { useState } from 'react';
import {
  compareInterviewCandidates,
  generateInterviewReport,
  getInterviewExecutiveSummary,
} from '../../services/aiRecruitmentService';

const InterviewReportsPage: React.FC = () => {
  const [interviewId, setInterviewId] = useState(1);
  const [candidateId, setCandidateId] = useState(1);
  const [candidateIdsCsv, setCandidateIdsCsv] = useState('1,2');
  const [result, setResult] = useState<any>(null);

  const generate = async () => {
    try {
      setResult(
        await generateInterviewReport({
          interviewId,
          candidateId,
          reportType: 'FULL',
          includeAIExplanations: true,
          includeHiringRecommendation: true,
          includeCodeAnalysis: true,
          includeSecurityViolations: true,
        })
      );
    } catch (e: any) {
      setResult({ success: false, message: e?.response?.data?.message || e.message });
    }
  };

  const execSummary = async () => {
    try { setResult(await getInterviewExecutiveSummary(interviewId, candidateId)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const compare = async () => {
    try {
      const ids = candidateIdsCsv
        .split(',')
        .map((x) => Number(x.trim()))
        .filter((x) => !Number.isNaN(x));
      setResult(await compareInterviewCandidates(interviewId, ids));
    } catch (e: any) {
      setResult({ success: false, message: e?.response?.data?.message || e.message });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Interview Reports</h1>
      <div className="grid md:grid-cols-4 gap-2">
        <input type="number" value={interviewId} onChange={(e) => setInterviewId(Number(e.target.value))} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
        <input type="number" value={candidateId} onChange={(e) => setCandidateId(Number(e.target.value))} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
        <input value={candidateIdsCsv} onChange={(e) => setCandidateIdsCsv(e.target.value)} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
        <div className="flex gap-2">
          <button onClick={generate} className="px-3 py-2 rounded bg-blue-600 text-white">Generate</button>
          <button onClick={execSummary} className="px-3 py-2 rounded bg-emerald-600 text-white">Summary</button>
          <button onClick={compare} className="px-3 py-2 rounded bg-violet-600 text-white">Compare</button>
        </div>
      </div>
      <pre className="p-3 rounded bg-black/40 border border-zinc-800 text-xs text-zinc-200 overflow-auto max-h-[520px]">
        {result ? JSON.stringify(result, null, 2) : 'No result yet'}
      </pre>
    </div>
  );
};

export default InterviewReportsPage;
