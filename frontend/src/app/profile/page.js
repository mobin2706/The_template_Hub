'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User, FileText, Download, Star, Bookmark, Edit3, Save, X, Calendar
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api, { getMediaUrl } from '@/lib/api';
import TemplateCard from '@/components/templates/TemplateCard';
import LoadingSpinner, { SkeletonGrid } from '@/components/ui/LoadingSpinner';

function ProfileContent() {
  const { user, isAuthenticated, loading: authLoading, updateUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'templates');
  const [templates, setTemplates] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState({ downloads: 0, templateCount: 0 });

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = require('react').useRef(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      fetchData();
      setEditName(user.name || '');
      setEditBio(user.bio || '');
      setAvatarPreview(getMediaUrl(user.avatar));
    }
  }, [user]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [templatesRes, bookmarksRes] = await Promise.all([
        api.get(`/templates/user/${user.id}`),
        api.get('/users/bookmarks/list')
      ]);
      setTemplates(templatesRes.data.templates || []);
      setBookmarks(bookmarksRes.data.bookmarks || []);

      const totalDownloads = (templatesRes.data.templates || []).reduce((sum, t) => sum + (t.downloads || 0), 0);
      setStats({
        downloads: totalDownloads,
        templateCount: templatesRes.data.count || 0
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const avatarRes = await api.put('/auth/profile/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        updateUser(avatarRes.data.user);
      }

      const res = await api.put('/auth/profile', { name: editName, bio: editBio });
      updateUser(res.data.user);
      setEditing(false);
      setAvatarFile(null);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  const tabs = [
    { id: 'templates', label: 'My Templates', icon: FileText, count: templates.length },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, count: bookmarks.length },
  ];

  return (
    <div className="min-h-screen gradient-mesh py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 sm:p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative w-20 h-20 rounded-2xl group flex-shrink-0">
              {avatarPreview || (user.avatar && !avatarFile) ? (
                <img 
                  src={avatarPreview || getMediaUrl(user.avatar)} 
                  alt="Profile Avatar" 
                  className="w-full h-full object-cover rounded-2xl shadow-lg border-2 border-white/10"
                />
              ) : (
                <div className="w-full h-full rounded-2xl gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              
              {editing && (
                <div 
                  className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Edit3 className="w-6 h-6 text-white" />
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/jpeg,image/png,image/webp" 
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>

            <div className="flex-1">
              {editing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-field text-lg font-semibold"
                    placeholder="Your name"
                  />
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="input-field resize-none"
                    rows={2}
                    placeholder="Write a short bio..."
                    maxLength={200}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveProfile} disabled={saving} className="btn-primary text-sm !py-2 flex items-center gap-1">
                      <span className="flex items-center gap-1"><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button onClick={() => setEditing(false)} className="btn-ghost text-sm flex items-center gap-1">
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Space Grotesk' }}>
                      {user.name}
                    </h1>
                    <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {user.role === 'admin' && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-xs font-semibold">Admin</span>
                    )}
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm mb-2">{user.email}</p>
                  {user.bio && <p className="text-[var(--text-muted)] text-sm">{user.bio}</p>}
                  <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mt-2">
                    <Calendar className="w-3 h-3" />
                    Joined {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 sm:gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">{stats.templateCount}</div>
                <div className="text-xs text-[var(--text-muted)]">Templates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">{stats.downloads.toLocaleString()}</div>
                <div className="text-xs text-[var(--text-muted)]">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">{bookmarks.length}</div>
                <div className="text-xs text-[var(--text-muted)]">Saved</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
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
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-md text-xs ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-[var(--surface)]'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {loadingData ? (
          <SkeletonGrid count={6} />
        ) : (
          <>
            {activeTab === 'templates' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {templates.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="w-14 h-14 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No templates yet</h3>
                    <p className="text-[var(--text-muted)] mb-4">Share your first template with the community</p>
                    <button onClick={() => router.push('/upload')} className="btn-primary"><span>Upload Template</span></button>
                  </div>
                ) : (
                  <div className="template-grid">
                    {templates.map((template, i) => (
                      <TemplateCard key={template._id} template={template} index={i} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'bookmarks' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {bookmarks.length === 0 ? (
                  <div className="text-center py-16">
                    <Bookmark className="w-14 h-14 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No bookmarks yet</h3>
                    <p className="text-[var(--text-muted)] mb-4">Save templates you love for quick access</p>
                    <button onClick={() => router.push('/templates')} className="btn-primary"><span>Browse Templates</span></button>
                  </div>
                ) : (
                  <div className="template-grid">
                    {bookmarks.map((template, i) => (
                      <TemplateCard key={template._id} template={template} index={i} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen gradient-mesh flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
      <ProfileContent />
    </Suspense>
  );
}
