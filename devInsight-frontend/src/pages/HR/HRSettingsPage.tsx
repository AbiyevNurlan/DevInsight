import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Bell,
  Shield,
  Globe,
  Palette,
  Mail,
  Lock,
  Eye,
  Save,
  Check
} from 'lucide-react';

interface SettingSection {
  id: string;
  title: string;
  icon: React.ElementType;
}

const sections: SettingSection[] = [
  { id: 'profile', title: 'Profile', icon: User },
  { id: 'notifications', title: 'Notifications', icon: Bell },
  { id: 'security', title: 'Security', icon: Shield },
  { id: 'preferences', title: 'Preferences', icon: Palette },
];

const HRSettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account preferences</p>
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="col-span-12 lg:col-span-3"
        >
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <section.icon className="w-4 h-4" />
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="col-span-12 lg:col-span-9"
        >
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-medium">
                    HR
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors">
                      Change Photo
                    </button>
                    <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue="John Doe"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="john@company.com"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Role</label>
                    <input
                      type="text"
                      defaultValue="HR Manager"
                      disabled
                      className="w-full px-4 py-3 bg-slate-800/30 border border-white/5 rounded-xl text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Department</label>
                    <input
                      type="text"
                      defaultValue="Human Resources"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white mb-6">Notification Preferences</h2>
                
                {[
                  { title: 'New Applications', desc: 'Get notified when new candidates apply', enabled: true },
                  { title: 'Interview Reminders', desc: 'Receive reminders before scheduled interviews', enabled: true },
                  { title: 'Candidate Updates', desc: 'Updates on candidate status changes', enabled: false },
                  { title: 'Weekly Reports', desc: 'Receive weekly hiring analytics', enabled: true },
                  { title: 'Team Mentions', desc: 'When someone mentions you in notes', enabled: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-white/5">
                    <div>
                      <p className="text-white font-medium">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Confirm Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <h3 className="text-white font-medium mb-4">Two-Factor Authentication</h3>
                    <button className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Section */}
            {activeSection === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white mb-6">Display Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Language</label>
                    <select className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50">
                      <option>English</option>
                      <option>Azərbaycan</option>
                      <option>Türkçe</option>
                      <option>Русский</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Timezone</label>
                    <select className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50">
                      <option>UTC+04:00 Baku</option>
                      <option>UTC+03:00 Istanbul</option>
                      <option>UTC+00:00 London</option>
                      <option>UTC-05:00 New York</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Date Format</label>
                    <select className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50">
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end mt-8 pt-6 border-t border-white/5">
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  saved
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HRSettingsPage;
