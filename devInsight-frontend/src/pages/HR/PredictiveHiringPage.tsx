import React, { useState } from 'react';
import {
  getHiringFunnel,
  getPredictiveSalaryBenchmark,
  predictHiringOutcome,
} from '../../services/aiRecruitmentService';

const PredictiveHiringPage: React.FC = () => {
  const [payload, setPayload] = useState<any>({
    companyId: 1,
    candidateId: 1,
    interviewScore: 78,
    yearsOfExperience: 4,
    numberOfJobChanges: 1,
    averageTenureMonths: 22,
    hasCompetingOffers: false,
    salaryExpectation: 2200,
    marketSalary: 2000,
  });
  const [role, setRole] = useState('Java Developer');
  const [level, setLevel] = useState('MID');
  const [region, setRegion] = useState('Baku');
  const [result, setResult] = useState<any>(null);

  const runPredict = async () => {
    try {
      setResult(await predictHiringOutcome(payload));
    } catch (e: any) {
      setResult({ success: false, message: e?.response?.data?.message || e.message });
    }
  };

  const runBenchmark = async () => {
    try {
      setResult(await getPredictiveSalaryBenchmark(role, level, region));
    } catch (e: any) {
      setResult({ success: false, message: e?.response?.data?.message || e.message });
    }
  };

  const runFunnel = async () => {
    try {
      setResult(await getHiringFunnel(Number(payload.companyId || 1)));
    } catch (e: any) {
      setResult({ success: false, message: e?.response?.data?.message || e.message });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Predictive Hiring Analytics</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <textarea
          value={JSON.stringify(payload, null, 2)}
          onChange={(e) => {
            try { setPayload(JSON.parse(e.target.value)); } catch { }
          }}
          rows={18}
          className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono text-sm"
        />
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <input value={role} onChange={(e) => setRole(e.target.value)} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
            <input value={level} onChange={(e) => setLevel(e.target.value)} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
            <input value={region} onChange={(e) => setRegion(e.target.value)} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={runPredict} className="px-3 py-2 rounded bg-blue-600 text-white">Predict</button>
            <button onClick={runBenchmark} className="px-3 py-2 rounded bg-emerald-600 text-white">Salary Benchmark</button>
            <button onClick={runFunnel} className="px-3 py-2 rounded bg-violet-600 text-white">Hiring Funnel</button>
          </div>
          <pre className="p-3 rounded bg-black/40 border border-zinc-800 text-xs text-zinc-200 overflow-auto max-h-[440px]">
            {result ? JSON.stringify(result, null, 2) : 'No result yet'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default PredictiveHiringPage;
