import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMovie } from '../../context/MovieContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Bell,
  Film,
  Plus,
  ChevronDown,
  Check,
  LogOut,
  Sparkles,
  Menu,
  X,
  UserCheck,
  ShieldCheck,
  Settings
} from 'lucide-react';


export const Header = ({ onOpenCreateMovie, onOpenAiAgent, onToggleMobileSidebar }) => {
  const { user, logout, role } = useAuth();
  const { movies, activeMovieId, setActiveMovieId, activeMovie } = useMovie();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMovieDropdown, setShowMovieDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const movieDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (movieDropdownRef.current && !movieDropdownRef.current.contains(e.target)) {
        setShowMovieDropdown(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formattedRole = (role || user?.role || 'DIRECTOR').replace('_', ' ');

  return (
    <header className="sticky top-0 z-30 cinema-glass border-b border-slate-800 px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-2">
      {/* Left: Mobile Hamburger + Active Movie Selector */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Active Movie Selector */}
        <div className="relative min-w-0" ref={movieDropdownRef}>
          <button
            onClick={() => setShowMovieDropdown(!showMovieDropdown)}
            className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/50 transition-all text-left cursor-pointer max-w-[200px] sm:max-w-[300px]"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] uppercase font-semibold tracking-wider text-slate-400 hidden xs:block">
                Production
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                {activeMovie?.title || (movies.length > 0 ? "Select Production" : "No Movies")}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
          </button>

          {/* Movie Dropdown Panel */}
          {showMovieDropdown && (
            <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 cinema-glass rounded-2xl shadow-2xl border border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3.5 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
                <span>Select Cinema Production</span>
                <span className="text-amber-400 font-bold">{movies.length} Active</span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/40">
                {movies.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveMovieId(m.id);
                      setShowMovieDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition-colors hover:bg-slate-800/80 cursor-pointer ${
                      activeMovieId === m.id ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-slate-200'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold truncate">{m.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{m.genre} • {m.status}</p>
                    </div>
                    {activeMovieId === m.id && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="p-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setShowMovieDropdown(false);
                    onOpenCreateMovie?.();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-amber-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Cinema Production
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global AI Copilot Trigger */}
        {onOpenAiAgent && (
          <button
            onClick={onOpenAiAgent}
            className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-transparent border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 font-semibold text-xs transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>AI {formattedRole} Agent</span>
          </button>
        )}
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Notifications Button */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 sm:p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] sm:text-[10px] flex items-center justify-center shadow-lg shadow-amber-500/40 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-96 cinema-glass rounded-2xl shadow-2xl border border-slate-700 py-3 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 pb-2 border-b border-slate-800 flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  Real-time Notifications
                </span>
                <span className="text-[10px] text-amber-400 font-bold">{unreadCount} Unread</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No new alerts or notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-800/60 ${
                        !n.isRead ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-bold text-slate-100">{n.title}</p>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-1" />}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{n.message}</p>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                        <span>{n.senderName}</span>
                        <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Persona Pill & Dropdown */}
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 pl-2 border-l border-slate-800 cursor-pointer"
          >
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || "User")}`}
              alt={user?.name || "User"}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || "User")}`;
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-amber-500/40"
            />
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-100 leading-tight truncate max-w-[120px]">{user?.name}</p>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">{formattedRole}</p>
            </div>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 cinema-glass rounded-xl shadow-2xl border border-slate-700 py-1.5 z-50 animate-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-bold text-slate-100 truncate">{user?.name}</p>
                <p className="text-[10px] text-amber-400 font-bold uppercase">{formattedRole}</p>
              </div>

              <Link
                to="/settings"
                onClick={() => setShowUserDropdown(false)}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2 font-medium cursor-pointer transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-amber-400" /> Account & RBAC Settings
              </Link>

              <div className="border-t border-slate-800 my-1" />

              <button
                onClick={async () => {
                  setShowUserDropdown(false);
                  await logout();
                }}
                className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-semibold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
