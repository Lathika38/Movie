import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMovie } from '../../context/MovieContext';
import { useNotifications } from '../../context/NotificationContext';
import { authApi } from '../../api/authApi';
import { seedApi } from '../../api/integrationsApi';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  ShieldCheck,
  Film,
  Users,
  Database,
  RotateCcw,
  Sparkles,
  Server,
  Activity,
  CheckCircle2,
  Clapperboard,
  DollarSign,
  UserX,
  UserCheck,
  KeyRound,
  Trash2,
  Eye,
  X
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { movies, fetchMovies } = useMovie();
  const { showToast } = useNotifications();
  const location = useLocation();

  // Tab State: 'overview' | 'movies' | 'users'
  const [activeTab, setActiveTab] = useState('overview');

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [selectedUserModal, setSelectedUserModal] = useState(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (location.hash) {
      const h = location.hash.replace('#', '');
      if (['overview', 'movies', 'users'].includes(h)) {
        setActiveTab(h);
      }
    }
  }, [location.hash]);

  const changeTab = (tabId) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Fetch via Admin API endpoint first, fallback to standard getUsers
      const allUsers = await authApi.getAdminUsers().catch(() => authApi.getUsers());
      setUsersList(allUsers || []);
    } catch (e) {
      console.error("[Admin Data Fetch Error]:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    try {
      await seedApi.seedDatabase();
      showToast("🎬 Database seeded with pristine Hollywood production data!", "success");
      await fetchMovies();
      await loadAdminData();
    } catch (err) {
      alert(`Seed error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm("Are you sure you want to reset and re-seed the Firestore cinema database?")) return;
    setSeeding(true);
    try {
      await seedApi.resetDatabase();
      showToast("🔄 Database reset & freshly initialized!", "success");
      await fetchMovies();
      await loadAdminData();
    } catch (err) {
      alert(`Reset error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleDisableUser = async (targetUid, name) => {
    if (!confirm(`Are you sure you want to disable ${name}'s account?`)) return;
    try {
      await authApi.disableUser(targetUid);
      showToast(`User ${name} disabled successfully.`, "info");
      loadAdminData();
    } catch (err) {
      alert(`Error disabling user: ${err.message}`);
    }
  };

  const handleEnableUser = async (targetUid, name) => {
    try {
      await authApi.enableUser(targetUid);
      showToast(`User ${name} re-enabled successfully.`, "success");
      loadAdminData();
    } catch (err) {
      alert(`Error enabling user: ${err.message}`);
    }
  };

  const handleResetPassword = async (targetUid, name) => {
    if (!confirm(`Issue password reset for ${name}?`)) return;
    try {
      const result = await authApi.resetPassword(targetUid);
      showToast(`Password reset link issued: ${result}`, "success");
    } catch (err) {
      alert(`Error resetting password: ${err.message}`);
    }
  };

  const handleDeleteUser = async (targetUid, name, role) => {
    if (role === 'ADMIN' || targetUid === 'MOVIEOS-ADMIN-001') {
      alert("Security Error: The Single Admin account cannot be deleted.");
      return;
    }
    if (!confirm(`CRITICAL ACTION: Permanently delete account for ${name} (${targetUid}) from Firebase Auth and Firestore?`)) return;
    try {
      await authApi.deleteUser(targetUid);
      showToast(`Account for ${name} permanently deleted.`, "warning");
      loadAdminData();
    } catch (err) {
      alert(`Error deleting user: ${err.message}`);
    }
  };

  if (loading) return <LoadingSkeleton count={3} />;

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* 1. Admin Header */}
      <div className="cinema-glass rounded-3xl p-6 sm:p-8 border border-rose-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                SINGLE STUDIO CHIEF & ADMIN (MOVIEOS-ADMIN-001)
              </span>
              <span className="text-xs text-slate-400">Admin: {user?.name || "DEVIL (Studio Chief)"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 font-['Cinzel']">
              MovieOS Infrastructure & User Directory
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1.5">
              Single-admin user governance, Firebase Auth lifecycle management, and persistent Firestore infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {seeding ? "Seeding..." : "Seed Cinema Data"}
            </button>
            <button
              onClick={handleResetDatabase}
              disabled={seeding}
              className="px-4 py-2.5 rounded-xl border border-rose-500/40 text-rose-300 hover:bg-rose-500 hover:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Reset DB
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => changeTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Studio Governance
          </button>

          <button
            onClick={() => changeTab('movies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'movies'
                ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Film className="w-4 h-4" />
            All Productions ({movies.length})
          </button>

          <button
            onClick={() => changeTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            User & Talent Accounts ({usersList.length})
          </button>
        </div>
      </div>

      {/* 2. System Telemetry & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cinema-glass p-5 rounded-2xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Active Productions</span>
          <p className="text-2xl font-black text-amber-400 font-['Outfit'] mt-1">{movies.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Tracked in Firestore</p>
        </div>
        <div className="cinema-glass p-5 rounded-2xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Registered Accounts</span>
          <p className="text-2xl font-black text-cyan-400 font-['Outfit'] mt-1">{usersList.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Firebase Auth & Firestore Synced</p>
        </div>
        <div className="cinema-glass p-5 rounded-2xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Single Admin Status</span>
          <p className="text-2xl font-black text-rose-400 font-['Outfit'] mt-1">MOVIEOS-ADMIN-001</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Custom Claim Protected</p>
        </div>
        <div className="cinema-glass p-5 rounded-2xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Database Engine</span>
          <p className="text-2xl font-black text-purple-400 font-['Outfit'] mt-1">Firestore</p>
          <p className="text-[10px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Live & Persistent
          </p>
        </div>
      </div>

      {/* 3. SECTION: PRODUCTIONS CATALOG */}
      {(activeTab === 'overview' || activeTab === 'movies') && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-100 font-['Outfit']">All Cinema Productions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {movies.map((m) => (
              <div key={m.id} className="cinema-glass rounded-2xl p-5 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {m.genre || 'Feature Film'}
                    </span>
                    <h4 className="text-base font-bold text-slate-100 mt-1">{m.title}</h4>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                    {m.status || 'Active'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{m.synopsis || 'Hollywood feature production'}</p>
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <DollarSign className="w-3.5 h-3.5" /> ${(m.budget || 0).toLocaleString()}
                  </span>
                  <span className="text-slate-400 text-[11px]">{m.directorName || 'Christopher Vance'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SECTION: STUDIO USER MANAGEMENT DIRECTORY */}
      {(activeTab === 'overview' || activeTab === 'users') && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-100 font-['Outfit']">User Management & Telemetry Directory</h3>
          <div className="cinema-glass rounded-2xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4 font-bold">User & Profile Picture</th>
                  <th className="p-4 font-bold">Firebase UID</th>
                  <th className="p-4 font-bold">Email</th>
                  <th className="p-4 font-bold">Role</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Created / Last Login</th>
                  <th className="p-4 font-bold text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {usersList.map((u) => {
                  const isDisabled = u.status === 'Disabled' || u.disabled;
                  const isAdminUser = u.role === 'ADMIN' || u.id === 'MOVIEOS-ADMIN-001';

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={u.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || "User")}`}
                          alt={u.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-slate-100 block">{u.name}</span>
                          <span className="text-[10px] text-slate-400">{u.title || u.bio || "Filmmaker"}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400 font-mono text-[11px] select-all">
                        {u.id}
                      </td>
                      <td className="p-4 text-slate-300 font-mono text-[11px]">{u.email}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          isAdminUser
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isDisabled
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {isDisabled ? 'Disabled' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4 text-[10px] text-slate-400 space-y-0.5">
                        <div>Created: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</div>
                        <div>Login: {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'N/A'}</div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedUserModal(u)}
                            title="View User Details"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleResetPassword(u.id, u.name)}
                            title="Reset Password"
                            className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {isDisabled ? (
                            <button
                              onClick={() => handleEnableUser(u.id, u.name)}
                              title="Enable User"
                              className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDisableUser(u.id, u.name)}
                              disabled={isAdminUser}
                              title={isAdminUser ? "Admin Cannot Be Disabled" : "Disable User"}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 transition-colors disabled:opacity-30 cursor-pointer"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteUser(u.id, u.name, u.role)}
                            disabled={isAdminUser}
                            title={isAdminUser ? "Admin Account Protected" : "Delete User"}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-30 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. USER DETAILS INSPECTION MODAL */}
      {selectedUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="cinema-glass w-full max-w-lg rounded-3xl p-6 border border-slate-700 shadow-2xl relative space-y-5">
            <button
              onClick={() => setSelectedUserModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              <img
                src={selectedUserModal.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedUserModal.name)}`}
                alt={selectedUserModal.name}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
              />
              <div>
                <h3 className="text-lg font-bold text-white">{selectedUserModal.name}</h3>
                <p className="text-xs text-rose-400 font-bold uppercase">{selectedUserModal.role}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedUserModal.email}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Firebase Authentication UID</span>
                <span className="font-mono text-slate-200 select-all font-semibold">{selectedUserModal.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Account Status</span>
                  <span className={`font-bold ${selectedUserModal.status === 'Disabled' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {selectedUserModal.status || 'Active'}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Availability</span>
                  <span className="text-slate-200 font-semibold">{selectedUserModal.availability || 'Available'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Created At</span>
                  <span className="text-slate-300 font-mono">{selectedUserModal.createdAt ? new Date(selectedUserModal.createdAt).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Last Login</span>
                  <span className="text-slate-300 font-mono">{selectedUserModal.lastLogin ? new Date(selectedUserModal.lastLogin).toLocaleString() : 'N/A'}</span>
                </div>
              </div>

              {selectedUserModal.skills && selectedUserModal.skills.length > 0 && (
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Skills & Specializations</span>
                  <span className="text-slate-300">{selectedUserModal.skills.join(', ')}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedUserModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
