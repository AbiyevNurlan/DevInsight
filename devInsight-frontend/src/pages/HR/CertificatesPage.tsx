import React, { useState } from 'react';
import {
  getCandidateCertificates,
  getCertificateChainStatus,
  issueSkillCertificate,
  revokeSkillCertificate,
  verifySkillCertificate,
} from '../../services/aiRecruitmentService';

const CertificatesPage: React.FC = () => {
  const [payload, setPayload] = useState<any>({
    candidateId: 1,
    interviewId: 1,
    skillName: 'Java',
    proficiencyLevel: 'ADVANCED',
    verifiedScore: 88,
    validityMonths: 24,
    publiclyVerifiable: true,
  });
  const [certificateId, setCertificateId] = useState('');
  const [candidateId, setCandidateId] = useState(1);
  const [result, setResult] = useState<any>(null);

  const issue = async () => {
    try { setResult(await issueSkillCertificate(payload)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const verify = async () => {
    try { setResult(await verifySkillCertificate(certificateId)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const listForCandidate = async () => {
    try { setResult(await getCandidateCertificates(candidateId)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const chain = async () => {
    try { setResult(await getCertificateChainStatus()); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  const revoke = async () => {
    try { setResult(await revokeSkillCertificate(certificateId)); }
    catch (e: any) { setResult({ success: false, message: e?.response?.data?.message || e.message }); }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Blockchain Certificates</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <textarea
          value={JSON.stringify(payload, null, 2)}
          onChange={(e) => { try { setPayload(JSON.parse(e.target.value)); } catch { } }}
          rows={16}
          className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono text-sm"
        />
        <div className="space-y-3">
          <button onClick={issue} className="px-3 py-2 rounded bg-blue-600 text-white">Issue Certificate</button>
          <div className="flex gap-2">
            <input value={certificateId} onChange={(e) => setCertificateId(e.target.value)} placeholder="Certificate ID" className="flex-1 px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
            <button onClick={verify} className="px-3 py-2 rounded bg-emerald-600 text-white">Verify</button>
            <button onClick={revoke} className="px-3 py-2 rounded bg-rose-600 text-white">Revoke</button>
          </div>
          <div className="flex gap-2">
            <input type="number" value={candidateId} onChange={(e) => setCandidateId(Number(e.target.value))} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white" />
            <button onClick={listForCandidate} className="px-3 py-2 rounded bg-violet-600 text-white">Candidate Certs</button>
            <button onClick={chain} className="px-3 py-2 rounded bg-amber-600 text-white">Chain Status</button>
          </div>
          <pre className="p-3 rounded bg-black/40 border border-zinc-800 text-xs text-zinc-200 overflow-auto max-h-[440px]">
            {result ? JSON.stringify(result, null, 2) : 'No result yet'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CertificatesPage;
