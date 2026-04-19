'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, FileText, Download, Star,
  Check, X, BarChart3
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'admin') {
        router.push('/');
        return;
      }
      fetchAdminData();
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchAdminData = async () => {
    try {
      const [statsRes, templatesRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/templates?limit=50'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data.stats);
      setTemplates(templatesRes.data.templates || []);
      setUsers(usersRes.data.users || []);
    } catch (error) {
      console.error('Admin data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTemplateStatus = async (templateId, status) => {
    try {
      await api.put(`/admin/templates/${templateId}`, { status });
      setTemplates(templates.map(t =>
        t._id === templateId ? { ...t, status } : t
      ));
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const toggleFeatured = async (templateId, featured) => {
    try {
      await api.put(`/admin/templates/${templateId}`, { featured: !featured });
      setTemplates(templates.map(t =>
        t._id === templateId ? { ...t, featured: !featured } : t
      ));
    } catch (error) {
      console.error('Featured toggle error:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading admin panel..." />
      </div>
    );
  }

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-indigo-600' },
    { label: 'Total Templates', value: stats.totalTemplates, icon: FileText, color: 'from-purple-500 to-violet-600' },
    { label: 'Total Downloads', value: stats.totalDownloads, icon: Download, color: 'from-cyan-500 to-teal-600' },
    { label: 'Total Reviews', value: stats.totalReviews, icon: Star, color: 'from-amber-500 to-orange-600' },
  ] : [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="min-h-screen gradient-mesh py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="w-6 h-6 text-[var(--color-primary)]" />
            <h1 className="text-3xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Space Grotesk' }}>
              Admin <span className="gradient-text">Dashboard</span>
            </h1>
          </div>
          <p className="text-[var(--text-secondary)]">Manage templates, users, and platform content</p>
        </motion.div>

        <div className="flex gap-1 mb-8 glass rounded-xl p-1.5 inline-flex">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'gradient-primary text-white shadow-lg'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass card-hover rounded-2xl p-5"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Space Grotesk' }}>
                      {stat.value?.toLocaleString()}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>

            {stats?.categoryCounts && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4" style={{ fontFamily: 'Space Grotesk' }}>
                  Category Distribution
                </h3>
                <div className="space-y-3">
                  {stats.categoryCounts.map((cat) => {
                    const percentage = stats.totalTemplates > 0 ? (cat.count / stats.totalTemplates * 100) : 0;
                    return (
                      <div key={cat._id} className="flex items-center gap-3">
                        <span className="text-sm text-[var(--text-secondary)] w-24">{cat._id}</span>
                        <div className="flex-1 h-3 rounded-full bg-[var(--surface)] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-full rounded-full gradient-primary"
                          />
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)] w-10 text-right">{cat.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {stats?.recentTemplates && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4" style={{ fontFamily: 'Space Grotesk' }}>
                  Recent Templates
                </h3>
                <div className="space-y-3">
                  {stats.recentTemplates.map((t) => (
                    <div key={t._id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{t.title}</p>
                        <p className="text-xs text-[var(--text-muted)]">by {t.author?.name}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                        t.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                        t.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'templates' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-color)]">
                      <th className="text-left p-4 text-[var(--text-muted)] font-medium">Template</th>
                      <th className="text-left p-4 text-[var(--text-muted)] font-medium hidden md:table-cell">Author</th>
                      <th className="text-left p-4 text-[var(--text-muted)] font-medium hidden sm:table-cell">Category</th>
                      <th className="text-left p-4 text-[var(--text-muted)] font-medium">Status</th>
                      <th className="text-left p-4 text-[var(--text-muted)] font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((t) => (
                      <tr key={t._id} className="border-b border-[var(--border-color)] hover:bg-[var(--surface-hover)] transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-[var(--text-primary)] line-clamp-1">{t.title}</p>
                          <p className="text-xs text-[var(--text-muted)] flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1"><Download className="w-3 h-3" />{t.downloads}</span>
                            <span className="flex items-center gap-1"><Star className="w-3 h-3" />{t.averageRating?.toFixed(1)}</span>
                          </p>
                        </td>
                        <td className="p-4 text-[var(--text-secondary)] hidden md:table-cell">{t.author?.name}</td>
                        <td className="p-4 hidden sm:table-cell">
                          <span className="px-2 py-1 rounded-md bg-[var(--surface)] text-[var(--text-secondary)] text-xs">{t.category}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                            t.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                            t.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>{t.status}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            {t.status !== 'active' && (
                              <button onClick={() => updateTemplateStatus(t._id, 'active')} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-[var(--text-muted)] hover:text-emerald-400 transition-all" title="Approve">
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {t.status !== 'rejected' && (
                              <button onClick={() => updateTemplateStatus(t._id, 'rejected')} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-all" title="Reject">
                                <X className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => toggleFeatured(t._id, t.featured)} className={`p-1.5 rounded-lg transition-all ${t.featured ? 'text-amber-400 bg-amber-500/10' : 'text-[var(--text-muted)] hover:text-amber-400 hover:bg-amber-500/10'}`} title={t.featured ? 'Remove Featured' : 'Set Featured'}>
                              <Star className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-color)]">
                      <th className="text-left p-4 text-[var(--text-muted)] font-medium">User</th>
                      <th className="text-left p-4 text-[var(--text-muted)] font-medium hidden sm:table-cell">Email</th>
                      <th className="text-left p-4 text-[var(--text-muted)] font-medium">Role</th>
                      <th className="text-left p-4 text-[var(--text-muted)] font-medium hidden md:table-cell">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-b border-[var(--border-color)] hover:bg-[var(--surface-hover)] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-semibold">{u.name?.charAt(0)}</div>
                            <span className="font-medium text-[var(--text-primary)]">{u.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-[var(--text-secondary)] hidden sm:table-cell">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-[var(--surface)] text-[var(--text-secondary)]'}`}>{u.role}</span>
                        </td>
                        <td className="p-4 text-[var(--text-muted)] text-xs hidden md:table-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
