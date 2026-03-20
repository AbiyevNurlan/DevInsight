import React from 'react';
import CVUpload from '../../components/Candidate/CVUpload';

const CVUploadPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-md">CV Upload</h1>
          <p className="text-zinc-400 font-medium">Upload your CV for AI-powered analysis and matching</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-zinc-950/40 backdrop-blur-2xl rounded-xl p-6 shadow-xl border border-white/10">
              <CVUpload onUploadSuccess={() => console.log('CV uploaded!')} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-zinc-950/40 backdrop-blur-2xl rounded-xl p-6 shadow-xl border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Why Upload Your CV?</h2>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span>AI-powered job matching</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span>Automatic skill extraction</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span>Interview recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span>Secure storage</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 bg-zinc-950/40 backdrop-blur-2xl rounded-xl p-6 shadow-xl border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">Supported Formats</h3>
              <div className="space-y-2 text-zinc-300 text-sm">
                <p>📄 PDF (.pdf)</p>
                <p>📝 Word Document (.docx)</p>
                <p>⚖️ Maximum size: 5MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVUploadPage;
