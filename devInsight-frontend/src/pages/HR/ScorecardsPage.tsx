import React, { useState } from 'react';
import {
  explainScore,
  generateScorecard,
  getScoreFeatureImportance,
  getScoreReasonCodes,
  getScorecard,
} from '../../services/aiRecruitmentService';

const ScorecardsPage: React.FC = () => {
  const [candidateId, setCandidateId] = useState(1);
  const [jobId, setJobId] = useState(1);
  const [score, setScore] = useState(78);
  const [result, setResult] = useState<any>(null);

  const generate = async () => {
    try {
      setResult(
        await generateScorecard({
          candidateId,
          candidateName: `Candidate ${candidateId}`,
          jobId,
          jobTitle: 'Software Engineer',
          interviewData: { technical: 80, communication: 75 },
        })
      );
    } catch (e: any) {
      setResult({ success: false, message: e?.response?.data?.message || e.message });
    }
  };

  const getOne = async () => {
    try { setResult(await getScorecard(candidateId, jobId)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const explain = async () => {
    try { setResult(await explainScore(score, { candidateId, jobId })); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const reasonCodes = async () => {
    try { setResult(await getScoreReasonCodes()); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const featureImportance = async () => {
    try { setResult(await getScoreFeatureImportance('Software Engineer')); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Explainable Scorecards</h1>
      <div className="grid md:grid-cols-4 gap-2">
        <input type="number" value={candidateId} onChange={(e) => setCandidateId(Number(e.target.value))} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
        <input type="number" value={jobId} onChange={(e) => setJobId(Number(e.target.value))} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
        <input type="number" value={score} onChange={(e) => setScore(Number(e.target.value))} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
        <div className="flex flex-wrap gap-2">
          <button onClick={generate} className="px-3 py-2 rounded bg-blue-600 text-white">Generate</button>
          <button onClick={getOne} className="px-3 py-2 rounded bg-emerald-600 text-white">Get</button>
          <button onClick={explain} className="px-3 py-2 rounded bg-violet-600 text-white">Explain</button>
          <button onClick={reasonCodes} className="px-3 py-2 rounded bg-amber-600 text-white">Codes</button>
          <button onClick={featureImportance} className="px-3 py-2 rounded bg-cyan-600 text-white">Importance</button>
        </div>
      </div>
      <pre className="p-3 rounded bg-black/40 border border-zinc-800 text-xs text-zinc-200 overflow-auto max-h-[520px]">
        {result ? JSON.stringify(result, null, 2) : 'No result yet'}
      </pre>
    </div>
  );
};

export default ScorecardsPage;
