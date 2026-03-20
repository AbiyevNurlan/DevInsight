import React from 'react';
import CVUpload from '../../components/Candidate/CVUpload';

const CandidateProfile: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-md">Candidate Profile</h1>
          <p className="text-zinc-400 font-medium">Manage your profile and upload your CV</p>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-6 tracking-tight">Profile Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1 uppercase tracking-wider">Email</label>
                  <p className="text-white font-medium bg-white/5 p-3 rounded-lg border border-white/5">candidate@example.com</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1 uppercase tracking-wider">Full Name</label>
                  <p className="text-white font-medium bg-white/5 p-3 rounded-lg border border-white/5">John Doe</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1 uppercase tracking-wider">Role</label>
                  <p className="text-white font-medium bg-white/5 p-3 rounded-lg border border-white/5">Candidate</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1 uppercase tracking-wider">Status</label>
                  <span className="inline-flex items-center px-3 py-1 bg-zinc-800 text-white border border-white/10 rounded-full text-xs font-semibold tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - CV Upload */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-6 tracking-tight">Upload Your CV</h2>
              <CVUpload onUploadSuccess={() => console.log('CV uploaded successfully!')} />
            </div>

            {/* Additional Information */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4 tracking-tight">Why Upload Your CV?</h2>
              <ul className="space-y-4 text-zinc-300">
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs border border-white/10">✓</span>
                  <span className="font-medium">AI-powered matching with relevant job positions</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs border border-white/10">✓</span>
                  <span className="font-medium">Automatic skill extraction and analysis</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs border border-white/10">✓</span>
                  <span className="font-medium">Better interview recommendations based on your experience</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs border border-white/10">✓</span>
                  <span className="font-medium">Secure storage with privacy protection</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
