import React, { useState } from 'react';
import {
  detectTextLanguage,
  getTranslationLanguages,
  translateText,
  translateTextBatch,
} from '../../services/aiRecruitmentService';

const TranslationPage: React.FC = () => {
  const [text, setText] = useState('Hello team, this interview is scheduled for tomorrow.');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('az');
  const [result, setResult] = useState<any>(null);

  const translate = async () => {
    try {
      setResult(await translateText({ text, sourceLanguage, targetLanguage, preserveCodeBlocks: true }));
    } catch (e: any) {
      setResult({ success: false, message: e?.response?.data?.message || e.message });
    }
  };

  const detect = async () => {
    try { setResult(await detectTextLanguage(text)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const languages = async () => {
    try { setResult(await getTranslationLanguages()); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const batch = async () => {
    try {
      setResult(await translateTextBatch([
        { text, sourceLanguage, targetLanguage },
        { text: 'Good luck with your interview!', sourceLanguage: 'en', targetLanguage },
      ]));
    } catch (e: any) {
      setResult({ success: false, message: e?.response?.data?.message || e.message });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Real-Time Translation</h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <input value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
        <input value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
        <button onClick={translate} className="px-3 py-2 rounded bg-blue-600 text-white">Translate</button>
        <button onClick={batch} className="px-3 py-2 rounded bg-emerald-600 text-white">Batch</button>
        <button onClick={detect} className="px-3 py-2 rounded bg-violet-600 text-white">Detect</button>
        <button onClick={languages} className="px-3 py-2 rounded bg-amber-600 text-white">Languages</button>
      </div>
      <pre className="p-3 rounded bg-black/40 border border-zinc-800 text-xs text-zinc-200 overflow-auto max-h-[500px]">
        {result ? JSON.stringify(result, null, 2) : 'No result yet'}
      </pre>
    </div>
  );
};

export default TranslationPage;
