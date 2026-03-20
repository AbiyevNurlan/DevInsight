import React, { useState, useEffect } from 'react';
import {
  Users,
  MapPin,
  Clock,
  Globe,
  Star,
  Target,
  Filter,
  Search,
  ChevronDown,
  Award,
  Briefcase,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { findTalentMatches } from '../../services/aiRecruitmentService';

interface CandidateMatch {
  candidateId: number;
  candidateName: string;
  email: string;
  overallMatchScore: number;
  skillMatchScore: number;
  experienceMatchScore: number;
  locationMatchScore: number;
  culturalFitScore: number;
  availabilityScore: number;
  currentLocation: string;
  timezone: string;
  timezoneOffset: number;
  willingToRelocate: boolean;
  remotePreference: boolean;
  matchingSkills: string[];
  missingSkills: string[];
  bonusSkills: string[];
  experienceLevel: string;
  yearsOfExperience: number;
  matchCategory: string;
  recommendation: string;
  strengths: string[];
  concerns: string[];
}

interface MatchResponse {
  jobId: number;
  jobTitle: string;
  totalCandidates: number;
  matchedCandidates: number;
  topMatches: CandidateMatch[];
  goodMatches: CandidateMatch[];
  potentialMatches: CandidateMatch[];
  locationDistribution: {
    localCandidates: number;
    regionalCandidates: number;
    internationalCandidates: number;
    remoteCandidates: number;
  };
  timezoneGroups: Array<{
    timezone: string;
    candidateCount: number;
    offsetHours: number;
    compatibility: string;
  }>;
  marketInsight: string;
  recommendations: string[];
  averageMatchScore: number;
}

const TalentMatchingPage: React.FC = () => {
  const [matchResults, setMatchResults] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'top' | 'good' | 'potential'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Job Form State
  const [jobForm, setJobForm] = useState({
    jobTitle: 'Senior Java Developer',
    jobDescription: 'Looking for experienced Java developer with Spring Boot expertise',
    requiredSkills: ['Java', 'Spring Boot', 'PostgreSQL', 'REST API', 'Microservices'],
    experienceLevel: 'SENIOR',
    location: 'Baku',
    timezone: 'UTC+4',
    remoteAllowed: true,
    workArrangement: 'HYBRID'
  });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await findTalentMatches({
        ...jobForm,
        jobId: 1
      }, 30);
      
      if (response.success) {
        setMatchResults(response);
      }
    } catch (error) {
      console.error('Failed to find matches:', error);
      // Demo data
      setMatchResults({
        jobId: 1,
        jobTitle: jobForm.jobTitle,
        totalCandidates: 45,
        matchedCandidates: 28,
        topMatches: generateDemoMatches(5, 'EXCELLENT'),
        goodMatches: generateDemoMatches(8, 'GOOD'),
        potentialMatches: generateDemoMatches(10, 'FAIR'),
        locationDistribution: {
          localCandidates: 12,
          regionalCandidates: 8,
          internationalCandidates: 15,
          remoteCandidates: 10
        },
        timezoneGroups: [
          { timezone: 'UTC+4', candidateCount: 15, offsetHours: 0, compatibility: 'EXCELLENT' },
          { timezone: 'UTC+3', candidateCount: 8, offsetHours: 1, compatibility: 'EXCELLENT' },
          { timezone: 'UTC+1', candidateCount: 5, offsetHours: 3, compatibility: 'GOOD' }
        ],
        marketInsight: 'Strong talent pool available for this role',
        recommendations: ['Consider enabling full remote work to expand candidate pool'],
        averageMatchScore: 72.5
      });
    } finally {
      setLoading(false);
    }
  };

  const generateDemoMatches = (count: number, category: string): CandidateMatch[] => {
    const names = ['Elvin Mammadov', 'Aysel Huseynova', 'Tural Aliyev', 'Leyla Rzayeva', 'Farid Hasanov',
                   'Nigar Mammadova', 'Rashad Guliyev', 'Sevinc Aliyeva', 'Kamran Ibrahimov', 'Aynur Mustafayeva'];
    const locations = ['Baku', 'Istanbul', 'Berlin', 'London', 'Dubai'];
    
    return Array.from({ length: count }, (_, i) => ({
      candidateId: i + 1,
      candidateName: names[i % names.length],
      email: `candidate${i + 1}@email.com`,
      overallMatchScore: category === 'EXCELLENT' ? 85 + Math.random() * 15 : 
                         category === 'GOOD' ? 65 + Math.random() * 15 : 45 + Math.random() * 15,
      skillMatchScore: 70 + Math.random() * 30,
      experienceMatchScore: 60 + Math.random() * 40,
      locationMatchScore: 50 + Math.random() * 50,
      culturalFitScore: 70 + Math.random() * 30,
      availabilityScore: 80 + Math.random() * 20,
      currentLocation: locations[i % locations.length],
      timezone: ['UTC+4', 'UTC+3', 'UTC+1', 'UTC+0'][i % 4],
      timezoneOffset: [0, 1, 3, 4][i % 4],
      willingToRelocate: Math.random() > 0.5,
      remotePreference: Math.random() > 0.3,
      matchingSkills: ['Java', 'Spring Boot', 'PostgreSQL'].slice(0, 2 + Math.floor(Math.random() * 2)),
      missingSkills: ['Kubernetes', 'AWS'].slice(0, Math.floor(Math.random() * 2)),
      bonusSkills: ['Docker', 'CI/CD'].slice(0, Math.floor(Math.random() * 2)),
      experienceLevel: ['MID', 'SENIOR', 'LEAD'][Math.floor(Math.random() * 3)],
      yearsOfExperience: 3 + Math.floor(Math.random() * 8),
      matchCategory: category,
      recommendation: category === 'EXCELLENT' ? 'Highly recommended for interview' : 
                      category === 'GOOD' ? 'Good candidate, schedule screening' : 'Consider for future roles',
      strengths: ['Strong technical background', 'Good communication'],
      concerns: category === 'FAIR' ? ['Limited experience in required area'] : []
    }));
  };

  const getAllMatches = () => {
    if (!matchResults) return [];
    switch (selectedCategory) {
      case 'top': return matchResults.topMatches;
      case 'good': return matchResults.goodMatches;
      case 'potential': return matchResults.potentialMatches;
      default: return [...matchResults.topMatches, ...matchResults.goodMatches, ...matchResults.potentialMatches];
    }
  };

  const filteredMatches = getAllMatches().filter(m => 
    m.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.currentLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'EXCELLENT': return 'bg-green-100 text-green-700 border-green-200';
      case 'GOOD': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'FAIR': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Globe className="w-8 h-8 text-indigo-600" />
            Global Talent Matching
          </h1>
          <p className="text-gray-600 mt-2">AI-powered semantic matching with location intelligence</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input
                type="text"
                value={jobForm.jobTitle}
                onChange={(e) => setJobForm({ ...jobForm, jobTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
              <select
                value={jobForm.experienceLevel}
                onChange={(e) => setJobForm({ ...jobForm, experienceLevel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="JUNIOR">Junior</option>
                <option value="MID">Mid-Level</option>
                <option value="SENIOR">Senior</option>
                <option value="LEAD">Lead/Principal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Arrangement</label>
              <select
                value={jobForm.workArrangement}
                onChange={(e) => setJobForm({ ...jobForm, workArrangement: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ONSITE">On-site</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={jobForm.remoteAllowed}
                  onChange={(e) => setJobForm({ ...jobForm, remoteAllowed: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm text-gray-700">Remote Allowed</span>
              </label>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Find Matches
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {matchResults && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Matches</p>
                    <p className="text-2xl font-bold text-gray-900">{matchResults.matchedCandidates}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Top Matches</p>
                    <p className="text-2xl font-bold text-gray-900">{matchResults.topMatches.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Match Score</p>
                    <p className="text-2xl font-bold text-gray-900">{matchResults.averageMatchScore.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Globe className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Remote Candidates</p>
                    <p className="text-2xl font-bold text-gray-900">{matchResults.locationDistribution.remoteCandidates}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  Location Distribution
                </h3>
                <div className="space-y-3">
                  <LocationBar label="Local" count={matchResults.locationDistribution.localCandidates} total={matchResults.matchedCandidates} color="green" />
                  <LocationBar label="Regional" count={matchResults.locationDistribution.regionalCandidates} total={matchResults.matchedCandidates} color="blue" />
                  <LocationBar label="International" count={matchResults.locationDistribution.internationalCandidates} total={matchResults.matchedCandidates} color="purple" />
                  <LocationBar label="Remote" count={matchResults.locationDistribution.remoteCandidates} total={matchResults.matchedCandidates} color="orange" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Timezone Compatibility
                </h3>
                <div className="space-y-2">
                  {matchResults.timezoneGroups.map((tz, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{tz.timezone}</span>
                        <span className="text-sm text-gray-600">{tz.candidateCount} candidates</span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tz.compatibility === 'EXCELLENT' ? 'bg-green-100 text-green-700' :
                        tz.compatibility === 'GOOD' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {tz.compatibility}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Market Insight */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 mb-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Market Insight</h3>
              <p className="opacity-90">{matchResults.marketInsight}</p>
              {matchResults.recommendations.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium mb-2">Recommendations:</p>
                  <ul className="space-y-1">
                    {matchResults.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-center gap-2 opacity-90">
                        <CheckCircle className="w-4 h-4" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter:</span>
                </div>
                <div className="flex gap-2">
                  {['all', 'top', 'good', 'potential'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat as any)}
                      className={`px-3 py-1 text-sm rounded-full transition ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat === 'all' ? 'All' : cat === 'top' ? 'Top Matches' : cat === 'good' ? 'Good Matches' : 'Potential'}
                    </button>
                  ))}
                </div>
                <div className="flex-1 max-w-xs ml-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search candidates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMatches.map((candidate) => (
                <CandidateCard key={candidate.candidateId} candidate={candidate} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Location Bar Component
const LocationBar: React.FC<{ label: string; count: number; total: number; color: string }> = ({ label, count, total, color }) => {
  const percentage = (count / total) * 100;
  const colorClasses: Record<string, string> = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-900 font-medium">{count}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${colorClasses[color]} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

// Candidate Card Component
const CandidateCard: React.FC<{ candidate: CandidateMatch }> = ({ candidate }) => {
  const [expanded, setExpanded] = useState(false);
  
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'EXCELLENT': return 'bg-green-100 text-green-700';
      case 'GOOD': return 'bg-blue-100 text-blue-700';
      case 'FAIR': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{candidate.candidateName}</h4>
          <p className="text-sm text-gray-500">{candidate.experienceLevel} • {candidate.yearsOfExperience} years</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryBadge(candidate.matchCategory)}`}>
          {candidate.overallMatchScore.toFixed(0)}%
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <span className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {candidate.currentLocation}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {candidate.timezone}
        </span>
      </div>

      {/* Score Bars */}
      <div className="space-y-2 mb-4">
        <ScoreBar label="Skills" score={candidate.skillMatchScore} />
        <ScoreBar label="Experience" score={candidate.experienceMatchScore} />
        <ScoreBar label="Location" score={candidate.locationMatchScore} />
      </div>

      {/* Skills */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-1">
          {candidate.matchingSkills.map((skill, i) => (
            <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">{skill}</span>
          ))}
          {candidate.missingSkills.map((skill, i) => (
            <span key={i} className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">{skill}</span>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 text-xs">
        {candidate.remotePreference && (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Remote OK</span>
        )}
        {candidate.willingToRelocate && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Will Relocate</span>
        )}
      </div>

      {/* Expand Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-indigo-600 text-sm flex items-center gap-1 hover:text-indigo-800"
      >
        {expanded ? 'Hide Details' : 'View Details'}
        <ChevronDown className={`w-4 h-4 transition ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-2">{candidate.recommendation}</p>
          {candidate.strengths.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-medium text-gray-700 mb-1">Strengths:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {candidate.strengths.map((s, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {candidate.concerns.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Concerns:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {candidate.concerns.map((c, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-yellow-500" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Score Bar Component
const ScoreBar: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-700 font-medium">{score.toFixed(0)}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-1.5">
      <div 
        className={`h-1.5 rounded-full ${
          score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
        }`}
        style={{ width: `${score}%` }}
      ></div>
    </div>
  </div>
);

export default TalentMatchingPage;
