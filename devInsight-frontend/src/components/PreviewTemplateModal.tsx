import React from 'react';
import { X, Clock, Award, Tag } from 'lucide-react';

interface TemplateQuestion {
  questionId: number;
  questionText: string;
  maxScore: number;
  timeLimitMinutes: number;
  questionOrder: number;
  questionType?: string;
}

interface InterviewTemplate {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  category?: string;
  tags?: string[];
  totalDurationMinutes: number;
  maxScore: number;
  questions?: TemplateQuestion[];
  usageCount?: number;
  lastUsedDate?: string;
}

interface PreviewTemplateModalProps {
  template: InterviewTemplate | null;
  onClose: () => void;
}

export const PreviewTemplateModal: React.FC<PreviewTemplateModalProps> = ({
  template,
  onClose,
}) => {
  if (!template) return null;

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      Frontend: 'bg-blue-100 text-blue-800 border-blue-200',
      Backend: 'bg-green-100 text-green-800 border-green-200',
      'Full-stack': 'bg-purple-100 text-purple-800 border-purple-200',
      DevOps: 'bg-orange-100 text-orange-800 border-orange-200',
      'Data Science': 'bg-pink-100 text-pink-800 border-pink-200',
      Mobile: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    };
    return colors[category || ''] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      EASY: 'bg-green-100 text-green-800 border-green-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      HARD: 'bg-red-100 text-red-800 border-red-200',
      JUNIOR: 'bg-green-100 text-green-800 border-green-200',
      MID: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      SENIOR: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">{template.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              {template.category && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border bg-white/20 text-white backdrop-blur-sm`}>
                  {template.category}
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border bg-white/20 text-white backdrop-blur-sm`}>
                {template.difficulty}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Description */}
          {template.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600">{template.description}</p>
            </div>
          )}

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm border border-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Duration</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {template.totalDurationMinutes} min
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">Max Score</span>
              </div>
              <div className="text-2xl font-bold text-purple-700">
                {template.maxScore}
              </div>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <span className="text-sm font-medium">Questions</span>
              </div>
              <div className="text-2xl font-bold text-green-700">
                {template.questions?.length || 0}
              </div>
            </div>
          </div>

          {/* Questions List */}
          {template.questions && template.questions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Questions</h3>
              <div className="space-y-3">
                {template.questions
                  .sort((a, b) => a.questionOrder - b.questionOrder)
                  .map((question) => (
                    <div
                      key={question.questionId}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">
                              {question.questionOrder}
                            </span>
                            <p className="text-gray-800 font-medium">
                              {question.questionText}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium whitespace-nowrap">
                            {question.timeLimitMinutes} min
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium whitespace-nowrap">
                            {question.maxScore} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Statistics */}
          {(template.usageCount !== undefined || template.lastUsedDate) && (
            <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Usage Statistics</h3>
              <div className="flex gap-6 text-sm text-gray-600">
                {template.usageCount !== undefined && (
                  <div>
                    <span className="font-medium">Used:</span> {template.usageCount} times
                  </div>
                )}
                {template.lastUsedDate && (
                  <div>
                    <span className="font-medium">Last used:</span>{' '}
                    {new Date(template.lastUsedDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewTemplateModal;
