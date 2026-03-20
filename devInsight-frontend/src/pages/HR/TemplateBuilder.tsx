import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PreviewTemplateModal from '../../components/PreviewTemplateModal';
import {
  Eye,
  Copy,
  Edit,
  Archive,
  Plus,
  Search,
  Filter,
  Flame,
  Calendar,
  Star,
  Clock,
  FileText,
  X
} from 'lucide-react';

// Match PreviewTemplateModal's interface
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
  category?: string;
  difficulty: string;
  totalDurationMinutes: number;
  maxScore: number;
  tags?: string[];
  isActive?: boolean;
  questions?: TemplateQuestion[];
  usageCount?: number;
  lastUsedDate?: string;
}

// Alias for backward compatibility
type Template = InterviewTemplate;

interface TemplateStatistics {
  templateId: number;
  templateName: string;
  usageCount: number;
  lastUsedDate: string | null;
  averageScore: number | null;
  totalCandidates: number;
}

interface Filters {
  category: string;
  tags: string[];
  difficulty: string;
  search: string;
}

const TemplateBuilder: React.FC = () => {
  const navigate = useNavigate();

  // State management
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<InterviewTemplate | null>(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [templateToArchive, setTemplateToArchive] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'Frontend',
    difficulty: 'Mid',
    totalDurationMinutes: 60,
    tags: [] as string[]
  });

  // Filters
  const [filters, setFilters] = useState<Filters>({
    category: 'All',
    tags: [],
    difficulty: 'All',
    search: ''
  });

  // Common tags for multi-select
  const commonTags = [
    'React', 'Node.js', 'Java', 'Python', 'JavaScript', 'TypeScript',
    'Spring Boot', 'Angular', 'Vue.js', 'Docker', 'Kubernetes',
    'AWS', 'PostgreSQL', 'MongoDB', 'REST API', 'GraphQL'
  ];

  // Custom tag input
  const [customTag, setCustomTag] = useState('');
  const [showCustomTagInput, setShowCustomTagInput] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch templates when filters change
  useEffect(() => {
    fetchTemplates();
  }, [filters.category, filters.tags, filters.difficulty]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/hr/templates/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (filters.category !== 'All') {
        params.append('category', filters.category);
      }

      if (filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }

      if (filters.difficulty !== 'All') {
        params.append('difficulty', filters.difficulty);
      }

      const response = await api.get(`/hr/templates?${params.toString()}`);
      setTemplates(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter templates by search term
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(filters.search.toLowerCase()) ||
    template.description.toLowerCase().includes(filters.search.toLowerCase())
  );

  // Handle tag selection
  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Add custom tag
  const addCustomTag = () => {
    if (customTag.trim() && !filters.tags.includes(customTag.trim())) {
      setFilters(prev => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()]
      }));
      setCustomTag('');
      setShowCustomTagInput(false);
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Handle preview
  const handlePreview = (template: InterviewTemplate) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  // Handle clone
  const handleClone = async (templateId: number) => {
    try {
      await api.post(`/hr/templates/${templateId}/clone`);
      showToast('Template cloned successfully! 📋', 'success');
      fetchTemplates();
    } catch (error) {
      showToast('Failed to clone template', 'error');
      console.error('Clone error:', error);
    }
  };

  // Handle edit
  const handleEdit = (templateId: number) => {
    // Navigate to edit mode (you can implement edit form later)
    showToast('Edit functionality coming soon! ✏️', 'info');
  };

  // Handle archive
  const handleArchive = async (templateId: number) => {
    setTemplateToArchive(templateId);
    setShowArchiveConfirm(true);
  };

  const confirmArchive = async () => {
    if (templateToArchive === null) return;

    try {
      await api.delete(`/hr/templates/${templateToArchive}`);
      showToast('Template archived successfully! 🗄️', 'success');
      fetchTemplates();
    } catch (error) {
      showToast('Failed to archive template', 'error');
      console.error('Archive error:', error);
    } finally {
      setShowArchiveConfirm(false);
      setTemplateToArchive(null);
    }
  };

  // Handle create template
  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim()) {
      showToast('Please enter template name', 'error');
      return;
    }

    try {
      const payload = {
        name: newTemplate.name,
        description: newTemplate.description,
        category: newTemplate.category,
        difficulty: newTemplate.difficulty,
        totalDurationMinutes: newTemplate.totalDurationMinutes,
        maxScore: 100, // Default score
        tags: newTemplate.tags,
        questionIds: [], // Empty for now, can add questions later
        maxScores: []
      };

      console.log('Creating template with payload:', payload);

      const response = await api.post('/hr/templates', payload);

      console.log('Template created successfully:', response.data);
      
      // Backend returns data in different formats, handle both
      const createdTemplate = response.data.data || response.data;
      
      showToast('Template created successfully! 🎉', 'success');
      setShowCreateModal(false);
      setNewTemplate({
        name: '',
        description: '',
        category: 'Frontend',
        difficulty: 'Mid',
        totalDurationMinutes: 60,
        tags: []
      });
      fetchTemplates();
    } catch (error: any) {
      console.error('Create template error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create template';
      showToast(errorMessage, 'error');
    }
  };

  // Toggle tag in new template
  const toggleNewTemplateTag = (tag: string) => {
    setNewTemplate(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    // You can integrate with your existing Toast component here
    alert(message);
  };

  // Get category badge color
  const getCategoryColor = (category: string) => {
    return 'bg-white/5 text-zinc-300 border border-white/10';
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      'Junior': 'bg-zinc-800 text-zinc-400 border border-zinc-700',
      'Mid': 'bg-white/10 text-zinc-200 border border-white/20',
      'Senior': 'bg-white/20 text-white border border-white/30'
    };
    return colors[difficulty] || 'bg-zinc-900 border border-zinc-800';
  };

  // Format date for "last used"
  const formatLastUsed = (dateString: string | undefined) => {
    if (!dateString) return 'Never used';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-transparent p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Interview Templates</h1>
            <p className="text-gray-300">Create and manage interview templates with questions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary-saas px-6 py-3 text-black font-semibold flex items-center gap-2"
          >
            <Plus size={20} />
            Create Template
          </button>
        </div>

        {/* Filters Section */}
        <div className="glass-panel p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-white" size={20} />
            <h2 className="text-xl font-semibold text-white">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 bg-white/5 text-white border border-white/10 rounded-lg focus:outline-none focus:border-neon-cyan/50"
              >
                <option value="All" className="bg-zinc-900">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-4 py-2 bg-white/5 text-white border border-white/10 rounded-lg focus:outline-none focus:border-neon-cyan/50"
              >
                <option value="All" className="bg-zinc-900">All Levels</option>
                <option value="Junior" className="bg-zinc-900">Junior</option>
                <option value="Mid" className="bg-zinc-900">Mid</option>
                <option value="Senior" className="bg-zinc-900">Senior</option>
              </select>
            </div>

            {/* Search Bar */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by template name..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 text-white placeholder-zinc-500 border border-white/10 rounded-lg focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50"
                />
              </div>
            </div>
          </div>

          {/* Tags Filter */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {commonTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${filters.tags.includes(tag)
                    ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 shadow-[0_0_10px_rgba(0,255,255,0.2)]'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 border border-white/5'
                    }`}
                >
                  {tag}
                </button>
              ))}
              <button
                onClick={() => setShowCustomTagInput(!showCustomTagInput)}
                className="px-3 py-1 rounded-full text-sm font-medium bg-white/5 text-zinc-400 hover:bg-white/10 transition-all duration-200 border border-white/10"
              >
                + Custom
              </button>
            </div>

            {/* Selected Tags */}
            {filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-sm text-gray-300">Selected:</span>
                {filters.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white text-zinc-950 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:bg-zinc-700 rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Custom Tag Input */}
            {showCustomTagInput && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter custom tag..."
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                  className="flex-1 px-4 py-2 bg-white bg-opacity-20 text-white placeholder-gray-400 border border-white border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button
                  onClick={addCustomTag}
                  className="px-4 py-2 bg-white text-zinc-950 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-600 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-600 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-600 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        )}

        {/* Templates Grid */}
        {!loading && filteredTemplates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="glass-panel p-6 border border-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer flex flex-col group"
              >
                {/* Top Section */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                  <p className="text-gray-300 text-sm line-clamp-2">{template.description}</p>
                </div>

                {/* Middle Section - Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`${getCategoryColor(template.category ?? 'General')} px-3 py-1 rounded-full text-xs font-medium`}>
                    {template.category ?? 'General'}
                  </span>
                  <span className={`${getDifficultyColor(template.difficulty)} px-3 py-1 rounded-full text-xs font-medium`}>
                    {template.difficulty}
                  </span>
                </div>

                {/* Tags */}
                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="bg-white bg-opacity-20 text-gray-300 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="bg-white bg-opacity-20 text-gray-300 px-2 py-1 rounded text-xs">
                        +{template.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Bottom Section - Statistics */}
                <div className="space-y-2 mb-4 flex-grow">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Flame size={16} className="text-zinc-400" />
                    <span>Used {template.usageCount || 0} times</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Calendar size={16} className="text-zinc-400" />
                    <span>Last: {formatLastUsed(template.lastUsedDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Clock size={16} className="text-zinc-400" />
                    <span>{template.totalDurationMinutes} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <FileText size={16} className="text-zinc-400" />
                    <span>{template.questions?.length || 0} questions</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <button
                    onClick={() => handlePreview(template)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-sm font-medium transition-colors border border-zinc-700"
                  >
                    <Eye size={16} />
                    Preview
                  </button>
                  <button
                    onClick={() => handleClone(template.id)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-sm font-medium transition-colors border border-zinc-700"
                  >
                    <Copy size={16} />
                    Clone
                  </button>
                  <button
                    onClick={() => handleEdit(template.id)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-sm font-medium transition-colors border border-zinc-700"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleArchive(template.id)}
                    className="bg-zinc-800 hover:bg-red-900/30 hover:border-red-500/30 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-sm font-medium transition-colors border border-zinc-700"
                  >
                    <Archive size={16} />
                    Archive
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <div className="glass-panel p-12 max-w-md mx-auto border-dashed border-2 border-white/10">
              <FileText size={64} className="text-zinc-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                {templates.length === 0 ? 'No templates yet' : 'No templates found'}
              </h3>
              <p className="text-zinc-400 mb-6">
                {templates.length === 0
                  ? 'Create your first interview template to get started'
                  : 'Try adjusting your filters to see more results'}
              </p>
              {templates.length === 0 && (
                <button
                  onClick={() => showToast('Create template form coming soon! 📝', 'info')}
                  className="btn-primary-saas px-6 py-3 text-black font-semibold"
                >
                  Create First Template
                </button>
              )}
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && previewTemplate && (
          <PreviewTemplateModal
            template={previewTemplate}
            onClose={() => setShowPreview(false)}
          />
        )}

        {/* Create Template Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-panel p-6 max-w-2xl w-full mx-4 border border-white/10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Create New Template</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Template Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Full Stack Developer Interview"
                    className="w-full px-4 py-2 bg-white/5 text-white placeholder-zinc-500 border border-white/10 rounded-lg focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this interview template..."
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 text-white placeholder-zinc-500 border border-white/10 rounded-lg focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50"
                  />
                </div>

                {/* Category & Difficulty */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={newTemplate.category}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 text-white border border-white/10 rounded-lg focus:outline-none focus:border-neon-cyan/50"
                    >
                      <option value="Frontend" className="bg-zinc-900">Frontend</option>
                      <option value="Backend" className="bg-zinc-900">Backend</option>
                      <option value="Full-stack" className="bg-zinc-900">Full-stack</option>
                      <option value="DevOps" className="bg-zinc-900">DevOps</option>
                      <option value="Mobile" className="bg-zinc-900">Mobile</option>
                      <option value="Data Science" className="bg-zinc-900">Data Science</option>
                      <option value="QA" className="bg-zinc-900">QA</option>
                      <option value="UI/UX" className="bg-zinc-900">UI/UX</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                    <select
                      value={newTemplate.difficulty}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 text-white border border-white/10 rounded-lg focus:outline-none focus:border-neon-cyan/50"
                    >
                      <option value="Junior" className="bg-zinc-900">Junior</option>
                      <option value="Mid" className="bg-zinc-900">Mid</option>
                      <option value="Senior" className="bg-zinc-900">Senior</option>
                    </select>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Total Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={newTemplate.totalDurationMinutes}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, totalDurationMinutes: parseInt(e.target.value) || 0 }))}
                    min="15"
                    step="15"
                    className="w-full px-4 py-2 bg-white/5 text-white border border-white/10 rounded-lg focus:outline-none focus:border-neon-cyan/50"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Technology Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {commonTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleNewTemplateTag(tag)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                          newTemplate.tags.includes(tag)
                            ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                            : 'bg-white/5 text-zinc-400 hover:bg-white/10 border border-white/5'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Tags Display */}
                {newTemplate.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-300">Selected:</span>
                    {newTemplate.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-white text-zinc-950 rounded-full text-sm font-medium flex items-center gap-2"
                      >
                        {tag}
                        <button
                          onClick={() => toggleNewTemplateTag(tag)}
                          className="hover:bg-zinc-700 rounded-full p-0.5"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 bg-white/5 text-zinc-300 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTemplate}
                  className="px-6 py-2 bg-neon-cyan text-black font-semibold rounded-lg hover:bg-neon-cyan/80 transition-colors"
                >
                  Create Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Archive Confirmation Modal */}
        {showArchiveConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass-panel p-6 max-w-md mx-4 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Confirm Archive</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to archive this template? It will no longer be available for use.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowArchiveConfirm(false);
                    setTemplateToArchive(null);
                  }}
                  className="px-4 py-2 bg-white/5 text-zinc-300 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmArchive}
                  className="px-4 py-2 bg-zinc-900 border border-red-900/50 text-red-500 rounded-lg hover:bg-red-900/20 transition-colors"
                >
                  Archive
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateBuilder;
