import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  Users,
  DollarSign,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ChevronDown
} from 'lucide-react';

interface Vacancy {
  id: number;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  salary: string;
  applicants: number;
  status: 'Active' | 'Paused' | 'Closed';
  postedDate: string;
}

const mockVacancies: Vacancy[] = [
  { id: 1, title: 'Senior Frontend Developer', department: 'Engineering', location: 'Baku, AZ', type: 'Full-time', salary: '$80k - $120k', applicants: 45, status: 'Active', postedDate: '2024-01-10' },
  { id: 2, title: 'UX/UI Designer', department: 'Design', location: 'Remote', type: 'Remote', salary: '$60k - $90k', applicants: 32, status: 'Active', postedDate: '2024-01-08' },
  { id: 3, title: 'DevOps Engineer', department: 'Engineering', location: 'Baku, AZ', type: 'Full-time', salary: '$90k - $130k', applicants: 28, status: 'Active', postedDate: '2024-01-05' },
  { id: 4, title: 'Product Manager', department: 'Product', location: 'Hybrid', type: 'Full-time', salary: '$100k - $150k', applicants: 67, status: 'Paused', postedDate: '2024-01-01' },
  { id: 5, title: 'Data Analyst', department: 'Analytics', location: 'Remote', type: 'Contract', salary: '$50k - $70k', applicants: 23, status: 'Closed', postedDate: '2023-12-20' },
];

const VacanciesPage: React.FC = () => {
  const [vacancies] = useState<Vacancy[]>(mockVacancies);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredVacancies = vacancies.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || v.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Paused': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Closed': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Full-time': return 'bg-blue-500/20 text-blue-400';
      case 'Part-time': return 'bg-purple-500/20 text-purple-400';
      case 'Contract': return 'bg-cyan-500/20 text-cyan-400';
      case 'Remote': return 'bg-green-500/20 text-green-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Vacancies</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your job openings and track applications</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          Create Vacancy
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: 'Total Vacancies', value: vacancies.length, icon: Briefcase, color: '#3b82f6' },
          { label: 'Active', value: vacancies.filter(v => v.status === 'Active').length, icon: Eye, color: '#10b981' },
          { label: 'Total Applicants', value: vacancies.reduce((acc, v) => acc + v.applicants, 0), icon: Users, color: '#f97316' },
          { label: 'Avg. Salary', value: '$95k', icon: DollarSign, color: '#8b5cf6' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/60 border border-white/10 rounded-xl p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}20` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search vacancies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'paused', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                filterStatus === status
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:bg-slate-700/50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Vacancies List */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-900/60 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-4 px-6 text-xs text-slate-500 font-medium uppercase tracking-wider">Position</th>
                <th className="text-left py-4 px-6 text-xs text-slate-500 font-medium uppercase tracking-wider">Department</th>
                <th className="text-left py-4 px-6 text-xs text-slate-500 font-medium uppercase tracking-wider">Location</th>
                <th className="text-left py-4 px-6 text-xs text-slate-500 font-medium uppercase tracking-wider">Type</th>
                <th className="text-left py-4 px-6 text-xs text-slate-500 font-medium uppercase tracking-wider">Applicants</th>
                <th className="text-left py-4 px-6 text-xs text-slate-500 font-medium uppercase tracking-wider">Status</th>
                <th className="text-right py-4 px-6 text-xs text-slate-500 font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVacancies.map((vacancy, index) => (
                <motion.tr
                  key={vacancy.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-white font-medium">{vacancy.title}</p>
                      <p className="text-xs text-slate-500">{vacancy.salary}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-400">{vacancy.department}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-3 h-3" />
                      {vacancy.location}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-xs px-2 py-1 rounded ${getTypeColor(vacancy.type)}`}>
                      {vacancy.type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span className="text-white">{vacancy.applicants}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-xs px-2.5 py-1 rounded border ${getStatusColor(vacancy.status)}`}>
                      {vacancy.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-slate-400 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default VacanciesPage;
