import React, { useState } from 'react';
import {
  analyzeCodeQuality,
  executeCode,
  getExecutionLanguages,
  runCodeTestCases,
} from '../../services/aiRecruitmentService';

const starter = `function solve(n) {\n  if (n <= 1) return n;\n  return solve(n - 1) + solve(n - 2);\n}\nconsole.log(solve(6));`;

const CodeExecutionLabPage: React.FC = () => {
  const [language, setLanguage] = useState('JAVASCRIPT');
  const [sourceCode, setSourceCode] = useState(starter);
  const [stdin, setStdin] = useState('');
  const [testCases, setTestCases] = useState('6\n8');
  const [expected, setExpected] = useState('8\n21');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async (mode: 'execute' | 'test' | 'quality' | 'languages') => {
    setLoading(true);
    try {
      if (mode === 'execute') {
        setResult(await executeCode({ language, sourceCode, stdin }));
      } else if (mode === 'test') {
        setResult(
          await runCodeTestCases({
            language,
            sourceCode,
            testCases: testCases.split('\n').filter(Boolean),
            expectedOutputs: expected.split('\n').filter(Boolean),
          })
        );
      } else if (mode === 'quality') {
        setResult(await analyzeCodeQuality({ language, sourceCode, stdin }));
      } else {
        setResult(await getExecutionLanguages());
      }
    } catch (e: any) {
      setResult({ success: false, message: e?.response?.data?.message || e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Code Execution Lab</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="text-sm text-zinc-300">Language</label>
          <input
            value={language}
            onChange={(e) => setLanguage(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
          />
          <label className="text-sm text-zinc-300">Source Code</label>
          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            rows={14}
            className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono"
          />
          <label className="text-sm text-zinc-300">STDIN</label>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
          />
        </div>
        <div className="space-y-3">
          <label className="text-sm text-zinc-300">Test Cases (line by line)</label>
          <textarea
            value={testCases}
            onChange={(e) => setTestCases(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
          />
          <label className="text-sm text-zinc-300">Expected Outputs (line by line)</label>
          <textarea
            value={expected}
            onChange={(e) => setExpected(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
          />
          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={() => run('execute')} disabled={loading} className="px-3 py-2 rounded bg-blue-600 text-white">Run Code</button>
            <button onClick={() => run('test')} disabled={loading} className="px-3 py-2 rounded bg-emerald-600 text-white">Run Tests</button>
            <button onClick={() => run('quality')} disabled={loading} className="px-3 py-2 rounded bg-amber-600 text-white">Quality</button>
            <button onClick={() => run('languages')} disabled={loading} className="px-3 py-2 rounded bg-violet-600 text-white">Languages</button>
          </div>
          <pre className="mt-3 p-3 rounded bg-black/40 border border-zinc-800 text-xs text-zinc-200 overflow-auto max-h-[420px]">
            {result ? JSON.stringify(result, null, 2) : 'No result yet'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeExecutionLabPage;
