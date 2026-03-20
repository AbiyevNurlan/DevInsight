import React from 'react';
import { Sparkles, Briefcase, BookOpen, Globe, TrendingUp, Code, Award, Loader } from 'lucide-react';
import { CVAnalysisResult } from '../services/cvService';

interface CVAnalysisDisplayProps {
  analysis: CVAnalysisResult | null;
  isLoading?: boolean;
}

/**
 * CVAnalysisDisplay Component
 * Displays AI-generated analysis results from CV
 */
const CVAnalysisDisplay: React.FC<CVAnalysisDisplayProps> = ({ analysis, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
        <div className="flex items-center justify-center gap-3">
          <Loader className="w-5 h-5 text-purple-400 animate-spin" />
          <p className="text-purple-400 font-medium">Analyzing your CV with AI...</p>
        </div>
      </div>
    );
  }

  if (!analysis || !analysis.data) {
    return null;
  }

  const data = analysis.data;

  const sections = [
    {
      icon: Code,
      title: 'Skills',
      content: data.skills && data.skills.length > 0 
        ? data.skills.join(', ')
        : 'No skills identified',
      color: 'from-blue-500/10 to-blue-500/5',
      borderColor: 'border-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      icon: TrendingUp,
      title: 'Experience Level',
      content: data.experienceLevel || 'Not determined',
      color: 'from-emerald-500/10 to-emerald-500/5',
      borderColor: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      icon: Award,
      title: 'Years of Experience',
      content: `${data.yearsOfExperience || '0'} years`,
      color: 'from-amber-500/10 to-amber-500/5',
      borderColor: 'border-amber-500/20',
      iconColor: 'text-amber-400',
    },
    {
      icon: Briefcase,
      title: 'Job Categories',
      content: data.categories && data.categories.length > 0
        ? data.categories.join(', ')
        : 'Not determined',
      color: 'from-purple-500/10 to-purple-500/5',
      borderColor: 'border-purple-500/20',
      iconColor: 'text-purple-400',
    },
    {
      icon: BookOpen,
      title: 'Education',
      content: data.education || 'Not mentioned',
      color: 'from-cyan-500/10 to-cyan-500/5',
      borderColor: 'border-cyan-500/20',
      iconColor: 'text-cyan-400',
    },
    {
      icon: Globe,
      title: 'Languages',
      content: data.languages && data.languages.length > 0
        ? data.languages.join(', ')
        : 'Not mentioned',
      color: 'from-rose-500/10 to-rose-500/5',
      borderColor: 'border-rose-500/20',
      iconColor: 'text-rose-400',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">CV Analysis Results</h3>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-300 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className={`bg-gradient-to-br ${section.color} border ${section.borderColor} rounded-lg p-4 transition-all hover:shadow-lg hover:border-opacity-40`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${section.iconColor} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-200 mb-1">{section.title}</h4>
                  <p className="text-sm text-gray-400 break-words line-clamp-3 hover:line-clamp-none">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="text-xs text-gray-500 mt-4 flex items-center gap-2">
        <Sparkles className="w-3 h-3" />
        <span>Analysis powered by AI</span>
      </div>
    </div>
  );
};

export default CVAnalysisDisplay;
