import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  TrendingUp,
  Target,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Play,
  ExternalLink,
  Star,
  Zap,
  GraduationCap,
  Briefcase,
  BarChart2
} from 'lucide-react';
import { analyzeSkillGaps, generateLearningPath } from '../../services/aiRecruitmentService';

interface SkillGap {
  skillName: string;
  currentLevel: number;
  requiredLevel: number;
  gapSeverity: string;
  priority: string;
}

interface LearningResource {
  title: string;
  provider: string;
  type: string;
  duration: string;
  url: string;
  difficulty: string;
  rating: number;
}

interface LearningPath {
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  estimatedTime: string;
  resources: LearningResource[];
  milestones: string[];
}

const UpskillingPage: React.FC = () => {
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'gaps' | 'paths'>('gaps');

  useEffect(() => {
    loadData();
  }, [selectedCandidate]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Try to load from API
      const gapResponse = await analyzeSkillGaps(selectedCandidate, 'Senior Java Developer', ['Java', 'Spring Boot'], 5);
      if (gapResponse.skillGaps) {
        setSkillGaps(gapResponse.skillGaps);
      }

      const pathResponse = await generateLearningPath(
        selectedCandidate, 
        'Senior Java Developer',
        [{ skillName: 'Kubernetes', currentLevel: 2, requiredLevel: 4 }],
        'MIXED',
        10
      );
      if (pathResponse.paths) {
        setLearningPaths(pathResponse.paths);
      }
    } catch (error) {
      // Load demo data
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    setSkillGaps([
      { skillName: 'Kubernetes', currentLevel: 2, requiredLevel: 4, gapSeverity: 'HIGH', priority: 'CRITICAL' },
      { skillName: 'AWS', currentLevel: 1, requiredLevel: 3, gapSeverity: 'HIGH', priority: 'HIGH' },
      { skillName: 'Terraform', currentLevel: 0, requiredLevel: 2, gapSeverity: 'MEDIUM', priority: 'MEDIUM' },
      { skillName: 'GraphQL', currentLevel: 2, requiredLevel: 3, gapSeverity: 'LOW', priority: 'LOW' },
      { skillName: 'Redis', currentLevel: 3, requiredLevel: 4, gapSeverity: 'LOW', priority: 'LOW' }
    ]);

    setLearningPaths([
      {
        skillName: 'Kubernetes',
        currentLevel: 2,
        targetLevel: 4,
        estimatedTime: '6 weeks',
        resources: [
          { title: 'Kubernetes for Developers', provider: 'Udemy', type: 'VIDEO', duration: '12 hours', url: '#', difficulty: 'INTERMEDIATE', rating: 4.7 },
          { title: 'CKA Certification Course', provider: 'Linux Foundation', type: 'COURSE', duration: '40 hours', url: '#', difficulty: 'ADVANCED', rating: 4.9 },
          { title: 'K8s Best Practices', provider: 'Google Cloud', type: 'DOCUMENTATION', duration: '4 hours', url: '#', difficulty: 'INTERMEDIATE', rating: 4.5 }
        ],
        milestones: [
          'Deploy first application to K8s cluster',
          'Configure services and ingress',
          'Implement ConfigMaps and Secrets',
          'Set up horizontal pod autoscaling',
          'Complete CKA practice exam'
        ]
      },
      {
        skillName: 'AWS',
        currentLevel: 1,
        targetLevel: 3,
        estimatedTime: '8 weeks',
        resources: [
          { title: 'AWS Solutions Architect', provider: 'A Cloud Guru', type: 'COURSE', duration: '30 hours', url: '#', difficulty: 'INTERMEDIATE', rating: 4.8 },
          { title: 'AWS Hands-on Labs', provider: 'AWS', type: 'HANDS_ON', duration: '20 hours', url: '#', difficulty: 'BEGINNER', rating: 4.6 },
          { title: 'AWS Well-Architected', provider: 'AWS', type: 'DOCUMENTATION', duration: '6 hours', url: '#', difficulty: 'INTERMEDIATE', rating: 4.4 }
        ],
        milestones: [
          'Create and configure EC2 instances',
          'Set up VPC and networking',
          'Deploy application using ECS/EKS',
          'Configure RDS and S3',
          'Implement IAM policies'
        ]
      },
      {
        skillName: 'Terraform',
        currentLevel: 0,
        targetLevel: 2,
        estimatedTime: '4 weeks',
        resources: [
          { title: 'Terraform Basics', provider: 'HashiCorp', type: 'COURSE', duration: '8 hours', url: '#', difficulty: 'BEGINNER', rating: 4.7 },
          { title: 'Infrastructure as Code', provider: 'Pluralsight', type: 'VIDEO', duration: '10 hours', url: '#', difficulty: 'INTERMEDIATE', rating: 4.5 },
          { title: 'Terraform Registry', provider: 'HashiCorp', type: 'DOCUMENTATION', duration: '3 hours', url: '#', difficulty: 'BEGINNER', rating: 4.3 }
        ],
        milestones: [
          'Write first Terraform configuration',
          'Manage state files',
          'Create reusable modules',
          'Implement CI/CD with Terraform'
        ]
      }
    ]);
  };

  const getGapColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return <Zap className="w-4 h-4 text-red-500" />;
      case 'HIGH': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'MEDIUM': return <Target className="w-4 h-4 text-yellow-500" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-700';
      case 'INTERMEDIATE': return 'bg-blue-100 text-blue-700';
      case 'ADVANCED': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return Play;
      case 'COURSE': return GraduationCap;
      case 'HANDS_ON': return Briefcase;
      case 'DOCUMENTATION': return BookOpen;
      default: return BookOpen;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            AI-Powered Upskilling Recommendations
          </h1>
          <p className="text-gray-600 mt-2">Personalized learning paths based on skill gap analysis</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            icon={AlertCircle}
            label="Skills Gaps"
            value={skillGaps.length}
            color="red"
          />
          <SummaryCard
            icon={BookOpen}
            label="Learning Paths"
            value={learningPaths.length}
            color="blue"
          />
          <SummaryCard
            icon={Clock}
            label="Est. Time"
            value="18 weeks"
            color="yellow"
          />
          <SummaryCard
            icon={Target}
            label="Critical Skills"
            value={skillGaps.filter(g => g.priority === 'CRITICAL').length}
            color="purple"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('gaps')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'gaps'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <BarChart2 className="w-4 h-4 inline mr-2" />
                Skill Gaps Analysis
              </button>
              <button
                onClick={() => setActiveTab('paths')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'paths'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Learning Paths
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : activeTab === 'gaps' ? (
            /* Skill Gaps Tab */
            <div className="p-6">
              <div className="space-y-4">
                {skillGaps.map((gap, index) => (
                  <SkillGapCard key={index} gap={gap} />
                ))}
              </div>
            </div>
          ) : (
            /* Learning Paths Tab */
            <div className="p-6">
              <div className="space-y-6">
                {learningPaths.map((path, index) => (
                  <LearningPathCard key={index} path={path} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Overall Progress Visualization */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Expected Outcome After Upskilling
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm opacity-80 mb-1">Skill Coverage</p>
              <p className="text-3xl font-bold">95%</p>
              <p className="text-xs opacity-70 mt-1">Up from 65%</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm opacity-80 mb-1">Job Match Score</p>
              <p className="text-3xl font-bold">92%</p>
              <p className="text-xs opacity-70 mt-1">Up from 72%</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm opacity-80 mb-1">Market Readiness</p>
              <p className="text-3xl font-bold">High</p>
              <p className="text-xs opacity-70 mt-1">Up from Medium</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Summary Card Component
const SummaryCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}> = ({ icon: Icon, label, value, color }) => {
  const colorClasses: Record<string, string> = {
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Skill Gap Card Component
const SkillGapCard: React.FC<{ gap: SkillGap }> = ({ gap }) => {
  const gapPercentage = ((gap.requiredLevel - gap.currentLevel) / gap.requiredLevel) * 100;

  const getGapColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h4 className="font-semibold text-gray-900">{gap.skillName}</h4>
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityBadge(gap.priority)}`}>
            {gap.priority}
          </span>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGapColor(gap.gapSeverity)}`}>
          Gap: {gap.gapSeverity}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Current: Level {gap.currentLevel}</span>
            <span className="text-gray-500">Required: Level {gap.requiredLevel}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 relative">
            <div 
              className="bg-blue-500 h-3 rounded-full"
              style={{ width: `${(gap.currentLevel / 5) * 100}%` }}
            ></div>
            <div 
              className="absolute top-0 h-3 border-r-2 border-indigo-600"
              style={{ left: `${(gap.requiredLevel / 5) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-400">0</span>
            <span className="text-gray-400">1</span>
            <span className="text-gray-400">2</span>
            <span className="text-gray-400">3</span>
            <span className="text-gray-400">4</span>
            <span className="text-gray-400">5</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-indigo-600">+{gap.requiredLevel - gap.currentLevel}</p>
          <p className="text-xs text-gray-500">levels needed</p>
        </div>
      </div>
    </div>
  );
};

// Learning Path Card Component
const LearningPathCard: React.FC<{ path: LearningPath }> = ({ path }) => {
  const [expanded, setExpanded] = useState(false);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return Play;
      case 'COURSE': return GraduationCap;
      case 'HANDS_ON': return Briefcase;
      case 'DOCUMENTATION': return BookOpen;
      default: return BookOpen;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-700';
      case 'INTERMEDIATE': return 'bg-blue-100 text-blue-700';
      case 'ADVANCED': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div 
        className="p-5 bg-gradient-to-r from-gray-50 to-white cursor-pointer hover:bg-gray-100 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-lg">{path.skillName}</h4>
              <p className="text-sm text-gray-500">
                Level {path.currentLevel} → Level {path.targetLevel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Est. Time</p>
              <p className="font-semibold text-gray-900">{path.estimatedTime}</p>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition ${expanded ? 'rotate-90' : ''}`} />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Progress to Target</span>
            <span className="text-gray-700 font-medium">
              {Math.round((path.currentLevel / path.targetLevel) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
              style={{ width: `${(path.currentLevel / path.targetLevel) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-200">
          {/* Resources */}
          <div className="p-5">
            <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Recommended Resources
            </h5>
            <div className="space-y-3">
              {path.resources.map((resource, i) => {
                const Icon = getResourceIcon(resource.type);
                return (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Icon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{resource.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{resource.provider}</span>
                          <span>•</span>
                          <span>{resource.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getDifficultyBadge(resource.difficulty)}`}>
                        {resource.difficulty}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm text-gray-700">{resource.rating}</span>
                      </div>
                      <a 
                        href={resource.url}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Milestones */}
          <div className="p-5 border-t border-gray-200 bg-gray-50">
            <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              Learning Milestones
            </h5>
            <div className="relative">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-300"></div>
              <div className="space-y-3">
                {path.milestones.map((milestone, i) => (
                  <div key={i} className="flex items-center gap-4 relative">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                      i === 0 ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}>
                      {i === 0 ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      )}
                    </div>
                    <span className={`text-sm ${i === 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                      {milestone}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpskillingPage;
