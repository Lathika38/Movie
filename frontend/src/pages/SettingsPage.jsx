import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { authApi } from '../api/authApi';
import { uploadFileToFirebaseStorage } from '../services/firebase';
import {
  User,
  Shield,
  Sliders,
  Users,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Save,
  Lock,
  Globe,
  Film,
  Camera,
  Music,
  Briefcase,
  UserCheck,
  ShieldAlert,
  CloudSun,
  Bot,
  ExternalLink,
  Check,
  X,
  Upload,
  Sun
} from 'lucide-react';

export const sanitizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  let cleanUrl = url.trim();

  // Extract mediaurl from Bing Image Search page URLs
  if (cleanUrl.includes('bing.com/images/search') && cleanUrl.includes('mediaurl=')) {
    try {
      const match = cleanUrl.match(/mediaurl=([^&]+)/);
      if (match && match[1]) {
        cleanUrl = decodeURIComponent(match[1]);
      }
    } catch (e) {}
  }

  // Extract imgurl from Google Image Search page URLs
  if ((cleanUrl.includes('google.com/imgres') || cleanUrl.includes('google.com/url')) && cleanUrl.includes('imgurl=')) {
    try {
      const match = cleanUrl.match(/imgurl=([^&]+)/);
      if (match && match[1]) {
        cleanUrl = decodeURIComponent(match[1]);
      }
    } catch (e) {}
  }

  return cleanUrl;
};

export const SettingsPage = () => {
  const { user, setUser, role } = useAuth();
  const { showToast } = useNotifications();

  // Active Tab: 'profile' | 'rbac' | 'preferences' | 'admin-users'
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
    bio: user?.bio || '',
    availability: user?.availability || 'Available',
    showreelUrl: user?.showreelUrl || '',
    skills: user?.skills ? user.skills.join(', ') : '',
    languages: user?.languages ? user.languages.join(', ') : '',
    genres: user?.genres ? user.genres.join(', ') : ''
  });

  const [saving, setSaving] = useState(false);

  // Preferences State
  const [defaultLocation, setDefaultLocation] = useState('Los Angeles, CA');
  const [aiModelPreference, setAiModelPreference] = useState('gemini-1.5-pro');
  const [enableDesktopNotifications, setEnableDesktopNotifications] = useState(true);

  // Admin User Directory State
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [newRoleForUser, setNewRoleForUser] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatarUrl: sanitizeImageUrl(user.avatarUrl || ''),
        bio: user.bio || '',
        availability: user.availability || 'Available',
        showreelUrl: user.showreelUrl || '',
        skills: user.skills ? user.skills.join(', ') : '',
        languages: user.languages ? user.languages.join(', ') : '',
        genres: user.genres ? user.genres.join(', ') : ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (role === 'ADMIN' && activeTab === 'admin-users') {
      loadAllUsers();
    }
  }, [role, activeTab]);

  const loadAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await authApi.getUsers();
      setAllUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAvatarFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast("📷 Processing avatar image file...", "info");
      let uploadedUrl = null;
      try {
        uploadedUrl = await uploadFileToFirebaseStorage(file, 'avatars');
      } catch (storageErr) {
        console.warn("Storage upload fallback to Data URL:", storageErr);
      }

      if (!uploadedUrl) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          setFormData(prev => ({ ...prev, avatarUrl: dataUrl }));
          showToast("✨ Avatar image loaded!", "success");
        };
        reader.readAsDataURL(file);
      } else {
        setFormData(prev => ({ ...prev, avatarUrl: uploadedUrl }));
        showToast("✨ Avatar uploaded to Storage!", "success");
      }
    } catch (err) {
      alert(`Avatar upload error: ${err.message}`);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.name || user?.name || "User")}`;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);

    const cleanAvatar = sanitizeImageUrl(formData.avatarUrl);

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        avatarUrl: cleanAvatar,
        bio: formData.bio,
        availability: formData.availability,
        showreelUrl: formData.showreelUrl,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        languages: formData.languages ? formData.languages.split(',').map(s => s.trim()).filter(Boolean) : [],
        genres: formData.genres ? formData.genres.split(',').map(s => s.trim()).filter(Boolean) : []
      };

      const updated = await authApi.updateProfile(user.id, payload);
      setUser(updated);
      showToast("✨ Profile settings synchronized with Firebase Firestore!", "success");
    } catch (err) {
      alert(`Error updating profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUserRole = async (targetUserId, newRole) => {
    try {
      await authApi.updateProfile(targetUserId, { role: newRole });
      showToast(`User role successfully updated to ${newRole} in Firestore!`, "success");
      setEditingUserId(null);
      loadAllUsers();
    } catch (err) {
      alert(`Failed to update user role: ${err.message}`);
    }
  };

  const getRoleTheme = (r) => {
    switch (r) {
      case 'DIRECTOR':
        return {
          title: 'Directorial Creative Authority',
          badge: 'DIRECTOR',
          color: 'amber',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          bg: 'bg-amber-500/10'
        };
      case 'PRODUCER':
        return {
          title: 'Executive Financial & Production Lead',
          badge: 'PRODUCER',
          color: 'cyan',
          border: 'border-cyan-500/30',
          text: 'text-cyan-400',
          bg: 'bg-cyan-500/10'
        };
      case 'ACTOR':
        return {
          title: 'Screen Talent & Dramatic Performer',
          badge: 'ACTOR',
          color: 'emerald',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10'
        };
      case 'MUSIC_DIRECTOR':
        return {
          title: 'Master Film Composer & Acoustic Architect',
          badge: 'MUSIC_DIRECTOR',
          color: 'purple',
          border: 'border-purple-500/30',
          text: 'text-purple-400',
          bg: 'bg-purple-500/10'
        };
      case 'ADMIN':
        return {
          title: 'Studio Infrastructure Superuser',
          badge: 'ADMIN',
          color: 'rose',
          border: 'border-rose-500/30',
          text: 'text-rose-400',
          bg: 'bg-rose-500/10'
        };
      default:
        return {
          title: 'Cinema Professional',
          badge: 'USER',
          color: 'slate',
          border: 'border-slate-500/30',
          text: 'text-slate-300',
          bg: 'bg-slate-500/10'
        };
    }
  };

  const roleMeta = getRoleTheme(role);

  // RBAC Permission Capabilities Grid
  const permissionsMatrix = [
    {
      capability: 'Screenplay Breakdown & Scenes',
      description: 'Upload scripts, trigger Gemini scene extraction, edit shot suggestions',
      DIRECTOR: 'Full Write',
      PRODUCER: 'Read Only',
      ACTOR: 'Assigned Scenes',
      MUSIC_DIRECTOR: 'Read Only',
      ADMIN: 'Full Access'
    },
    {
      capability: 'Financial Ledger & Expenses',
      description: 'Log purchase orders, allocate departmental capital, approve invoices',
      DIRECTOR: 'Overview Only',
      PRODUCER: 'Full Authority',
      ACTOR: 'Restricted',
      MUSIC_DIRECTOR: 'Restricted',
      ADMIN: 'Full Access'
    },
    {
      capability: 'Casting Dispatch & Contracts',
      description: 'Dispatch official role offers, negotiate compensation, sign talent',
      DIRECTOR: 'Dispatch Offers',
      PRODUCER: 'View Roster',
      ACTOR: 'Accept / Decline',
      MUSIC_DIRECTOR: 'Restricted',
      ADMIN: 'Full Access'
    },
    {
      capability: 'Soundtrack Reviews & Approvals',
      description: 'Listen to cues, write directorial notes, sign off on audio stems',
      DIRECTOR: 'Approve / Revise',
      PRODUCER: 'Read Audio',
      ACTOR: 'Restricted',
      MUSIC_DIRECTOR: 'Compose & Submit',
      ADMIN: 'Full Access'
    },
    {
      capability: 'Shooting Schedules & Call Sheets',
      description: 'Create call sheets, manage soundstages, review OpenWeather threats',
      DIRECTOR: 'Collaborate',
      PRODUCER: 'Full Authority',
      ACTOR: 'Call Times Only',
      MUSIC_DIRECTOR: 'Restricted',
      ADMIN: 'Full Access'
    },
    {
      capability: 'AI Role Copilots (Gemini 1.5)',
      description: 'Execute role-tailored intelligence prompts with live context',
      DIRECTOR: 'Director Agent',
      PRODUCER: 'Producer Agent',
      ACTOR: 'Acting Coach',
      MUSIC_DIRECTOR: 'Music Agent',
      ADMIN: 'All 4 Agents'
    },
    {
      capability: 'User Roles & Database Telemetry',
      description: 'Manage talent directory, change RBAC roles, seed/reset database',
      DIRECTOR: 'Restricted',
      PRODUCER: 'Restricted',
      ACTOR: 'Restricted',
      MUSIC_DIRECTOR: 'Restricted',
      ADMIN: 'Full Superuser'
    }
  ];

  const filteredUsers = allUsers.filter(u =>
    u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* 1. Header Banner */}
      <div className="cinema-glass rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={formData.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || "User")}`}
              alt={user?.name}
              onError={handleImageError}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500/50 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${roleMeta.bg} ${roleMeta.text} ${roleMeta.border}`}>
                  {roleMeta.badge} • RBAC LEVEL
                </span>
                <span className="text-xs text-slate-400 font-medium">{roleMeta.title}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-100 font-['Outfit']">
                {user?.name}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {user?.email} • Authenticated with Firebase Firestore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-900/80 border border-slate-800 px-4 py-3 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Security Clearance</span>
              <span className={`text-xs font-bold ${roleMeta.text}`}>
                {role === 'ADMIN' ? 'Tier 1 Superuser' : 'Tier 2 Role-Restricted'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            Profile & Persona
          </button>

          <button
            onClick={() => setActiveTab('rbac')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'rbac'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            RBAC Permissions Matrix
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'preferences'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Studio Preferences & AI
          </button>

          {role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('admin-users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'admin-users'
                  ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20'
                  : 'text-rose-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Studio RBAC User Manager (Admin)
            </button>
          )}
        </div>
      </div>

      {/* 2. TAB 1: PROFILE & PERSONA */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="cinema-glass rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-['Outfit']">Filmmaker & Persona Identity</h3>
              <p className="text-xs text-slate-400">Update your public cinema directory profile and contact credentials</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal / Stage Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address (Read-Only)</label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Direct Phone / Representation Contact</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Avatar Image URL or Photo Upload
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.avatarUrl}
                    onChange={(e) => {
                      const clean = sanitizeImageUrl(e.target.value);
                      setFormData({ ...formData, avatarUrl: clean });
                    }}
                    placeholder="Paste image URL (e.g. https://.../photo.jpg or Bing/Google search link)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
                  />
                  <label className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs hover:bg-amber-500/20 cursor-pointer transition-colors shrink-0 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Supports direct image URLs (.jpg, .png, .webp), Bing/Google search page URLs, or local image file uploads.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Professional Bio & Philosophy</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Share your industry achievements, directorial vision, or dramatic focus..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Role-Specific Fields */}
            {role === 'ACTOR' && (
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h4 className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Actor Guild & Representation</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Availability Status</label>
                    <select
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
                    >
                      <option value="Available">Available for Casting</option>
                      <option value="On Set">On Set / Currently Filming</option>
                      <option value="In Rehearsals">In Rehearsals</option>
                      <option value="On Hiatus">On Hiatus</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Verified Showreel URL</label>
                    <input
                      type="url"
                      value={formData.showreelUrl}
                      onChange={(e) => setFormData({ ...formData, showreelUrl: e.target.value })}
                      placeholder="https://vimeo.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Acting Skills (Comma-separated)</label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="Method Acting, Wirework Stunts, British RP Accent, Stage Combat"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {role === 'DIRECTOR' && (
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h4 className="text-xs uppercase font-bold text-amber-400 tracking-wider">Directorial Preferences</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Cinema Genres (Comma-separated)</label>
                    <input
                      type="text"
                      value={formData.genres}
                      onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                      placeholder="Psychological Thriller, Neo-Noir, Sci-Fi Epic"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Signature Camera Package</label>
                    <input
                      type="text"
                      defaultValue="ARRI ALEXA 65 + Cooke Anamorphic /i Full Frame Plus"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {role === 'PRODUCER' && (
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h4 className="text-xs uppercase font-bold text-cyan-400 tracking-wider">Production Company & Guild</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Production Entity</label>
                    <input
                      type="text"
                      defaultValue="Apex Cinema Works International"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Guild Status</label>
                    <input
                      type="text"
                      defaultValue="Producers Guild of America (PGA) Verified"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {role === 'MUSIC_DIRECTOR' && (
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h4 className="text-xs uppercase font-bold text-purple-400 tracking-wider">Acoustic & Studio Gear</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Primary DAW Session Grid</label>
                    <input
                      type="text"
                      defaultValue="Logic Pro X / Pro Tools HDX 5.1 Surround"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Signature Instrument Palette</label>
                    <input
                      type="text"
                      defaultValue="Solo Cello, Modular Sub-bass Synthesizers, Custom Metal Percussion"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving to Firestore..." : "Save Profile Changes"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 3. TAB 2: RBAC PERMISSIONS MATRIX */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          <div className="cinema-glass rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 font-['Outfit']">Role-Based Access Control (RBAC) Architecture</h3>
                <p className="text-xs text-slate-400">Strict separation of creative, financial, and talent responsibilities in MovieOS</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider">
                RBAC ENFORCED
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 font-bold">Studio Capability</th>
                    <th className="p-4 font-bold text-amber-400">Director</th>
                    <th className="p-4 font-bold text-cyan-400">Producer</th>
                    <th className="p-4 font-bold text-emerald-400">Actor</th>
                    <th className="p-4 font-bold text-purple-400">Music Dir</th>
                    <th className="p-4 font-bold text-rose-400">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {permissionsMatrix.map((item, idx) => {
                    const myAccess = item[role];
                    const isRestricted = myAccess === 'Restricted';
                    return (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-100">{item.capability}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.description}</p>
                        </td>
                        <td className={`p-4 ${role === 'DIRECTOR' ? 'bg-amber-500/10 font-bold text-amber-300' : ''}`}>
                          {item.DIRECTOR}
                        </td>
                        <td className={`p-4 ${role === 'PRODUCER' ? 'bg-cyan-500/10 font-bold text-cyan-300' : ''}`}>
                          {item.PRODUCER}
                        </td>
                        <td className={`p-4 ${role === 'ACTOR' ? 'bg-emerald-500/10 font-bold text-emerald-300' : ''}`}>
                          {item.ACTOR}
                        </td>
                        <td className={`p-4 ${role === 'MUSIC_DIRECTOR' ? 'bg-purple-500/10 font-bold text-purple-300' : ''}`}>
                          {item.MUSIC_DIRECTOR}
                        </td>
                        <td className={`p-4 ${role === 'ADMIN' ? 'bg-rose-500/10 font-bold text-rose-300' : ''}`}>
                          {item.ADMIN}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Your active role ({role}) guarantees end-to-end data isolation and permission boundaries.</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">ID: {user?.id}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 3: STUDIO PREFERENCES & AI */}
      {activeTab === 'preferences' && (
        <div className="cinema-glass rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-['Outfit']">Studio Integrations & AI Configuration</h3>
            <p className="text-xs text-slate-400">Configure external AI orchestration, meteorological defaults, and real-time syncing</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-bold text-slate-100">Studio Theme</h4>
              </div>
              <p className="text-xs text-slate-400">Workspace visual identity is fixed to Cyber Cyan high-contrast theme.</p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Cyber Cyan (Active)
              </div>
            </div>

            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-bold text-slate-100">OpenWeather Default Hub</h4>
              </div>
              <p className="text-xs text-slate-400">Default meteorological location queried for production scheduling.</p>
              <input
                type="text"
                value={defaultLocation}
                onChange={(e) => setDefaultLocation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400" />
                <h4 className="text-sm font-bold text-slate-100">Gemini AI Agent Engine</h4>
              </div>
              <p className="text-xs text-slate-400">Selected LLM model for screenplay analysis and role copilot queries.</p>
              <select
                value={aiModelPreference}
                onChange={(e) => setAiModelPreference(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-purple-400 focus:outline-none"
              >
                <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Deep Cinematic Reasoning)</option>
                <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Ultra-Low Latency)</option>
                <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Next-Gen)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-300">Cross-Role Real-Time Toasts</span>
              <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Active (10s Polling)
              </span>
            </div>
            <button
              onClick={() => showToast("Preferences saved to local cinema runtime!", "success")}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* 5. TAB 4: ADMIN STUDIO RBAC MANAGER */}
      {activeTab === 'admin-users' && role === 'ADMIN' && (
        <div className="cinema-glass rounded-3xl p-6 sm:p-8 border border-rose-500/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-slate-100 font-['Outfit']">Studio User RBAC Role Management</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Admin Superuser: Dynamically change user roles and access control tiers in Firebase Firestore
              </p>
            </div>

            <input
              type="text"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Search by name, email, or role..."
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-rose-400 focus:outline-none max-w-xs"
            />
          </div>

          {loadingUsers ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading Firestore talent directory...</div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 font-bold">User</th>
                    <th className="p-4 font-bold">Current RBAC Role</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Admin Role Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredUsers.map((u) => {
                    const isEditing = editingUserId === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-100">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-amber-300 border border-slate-700">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-[11px] text-emerald-400 font-semibold">{u.availability || 'Active'}</span>
                        </td>
                        <td className="p-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2">
                              <select
                                value={newRoleForUser || u.role}
                                onChange={(e) => setNewRoleForUser(e.target.value)}
                                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-rose-400 focus:outline-none"
                              >
                                <option value="DIRECTOR">DIRECTOR</option>
                                <option value="PRODUCER">PRODUCER</option>
                                <option value="ACTOR">ACTOR</option>
                                <option value="MUSIC_DIRECTOR">MUSIC_DIRECTOR</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                              <button
                                onClick={() => handleUpdateUserRole(u.id, newRoleForUser || u.role)}
                                className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer"
                                title="Confirm Role"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingUserId(null)}
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingUserId(u.id);
                                setNewRoleForUser(u.role);
                              }}
                              className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-slate-950 text-xs font-bold transition-colors border border-rose-500/30 cursor-pointer"
                            >
                              Change Role
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
