import React, { useState } from 'react';
import {
  analyzeAudio,
  analyzeMultimodal,
  analyzeVideo,
  transcribeAudio,
} from '../../services/aiRecruitmentService';

const MultimodalReviewPage: React.FC = () => {
  const [audioUrl, setAudioUrl] = useState('https://example.com/sample-audio.wav');
  const [videoUrl, setVideoUrl] = useState('https://example.com/sample-video.mp4');
  const [transcript, setTranscript] = useState('Candidate explains tradeoffs clearly and proposes scalable design.');
  const [result, setResult] = useState<any>(null);

  const runTranscribe = async () => {
    try { setResult(await transcribeAudio(audioUrl, 'en')); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const runAudio = async () => {
    try { setResult(await analyzeAudio(audioUrl, transcript)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const runVideo = async () => {
    try { setResult(await analyzeVideo(videoUrl, transcript)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const runAll = async () => {
    try { setResult(await analyzeMultimodal(transcript, transcript, transcript)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Multimodal Interview Review</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <input value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
          <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
          <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={8} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
          <div className="flex flex-wrap gap-2">
            <button onClick={runTranscribe} className="px-3 py-2 rounded bg-blue-600 text-white">Transcribe</button>
            <button onClick={runAudio} className="px-3 py-2 rounded bg-emerald-600 text-white">Analyze Audio</button>
            <button onClick={runVideo} className="px-3 py-2 rounded bg-violet-600 text-white">Analyze Video</button>
            <button onClick={runAll} className="px-3 py-2 rounded bg-amber-600 text-white">Analyze Multimodal</button>
          </div>
        </div>
        <pre className="p-3 rounded bg-black/40 border border-zinc-800 text-xs text-zinc-200 overflow-auto max-h-[520px]">
          {result ? JSON.stringify(result, null, 2) : 'No result yet'}
        </pre>
      </div>
    </div>
  );
};

export default MultimodalReviewPage;
