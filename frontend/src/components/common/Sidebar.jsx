import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Clapperboard,
  Briefcase,
  UserCheck,
  Music,
  ShieldCheck,
  Film,
  FileText,
  Users,
  Calendar,
  DollarSign,
  CloudSun,
  Layers,
  Sparkles,
  Award,
  Radio,
  Sliders,
  Settings,
  X,
  Upload
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { role, user } = useAuth();
  const location = useLocation();

  const getRoleConfig = () => {
    switch (role) {
      case 'DIRECTOR':
        return {
          title: 'DIRECTOR WORKSPACE',
          badge: 'Creative Authority',
          accentColor: 'text-amber-400',
          bgAccent: 'from-amber-500/20 to-amber-500/5',
          borderAccent: 'border-amber-500/30',
          items: [
            { label: 'Director Suite', path: '/director#breakdown', icon: Clapperboard, defaultTab: true },
            { label: 'Screenplay & Scenes', path: '/director#scenes', icon: FileText },
            { label: 'Casting Dispatch', path: '/director#casting', icon: Users },
            { label: 'Score & Music Reviews', path: '/director#music', icon: Music },
            { label: 'Script Upload & AI', path: '/director#upload', icon: Upload },
            { label: 'Settings & RBAC', path: '/settings', icon: Settings }
          ]
        };
      case 'PRODUCER':
        return {
          title: 'PRODUCER WORKSPACE',
          badge: 'Executive Authority',
          accentColor: 'text-cyan-400',
          bgAccent: 'from-cyan-500/20 to-cyan-500/5',
          borderAccent: 'border-cyan-500/30',
          items: [
            { label: 'Producer Portfolio', path: '/producer#overview', icon: Briefcase, defaultTab: true },
            { label: 'Shooting Schedules', path: '/producer#schedules', icon: Calendar },
            { label: 'Budget & Financials', path: '/producer#budget', icon: DollarSign },
            { label: 'Departments & Crew', path: '/producer#departments', icon: Layers },
            { label: 'Weather Logistics', path: '/producer#weather', icon: CloudSun },
            { label: 'Settings & RBAC', path: '/settings', icon: Settings }
          ]
        };
      case 'ACTOR':
        return {
          title: 'ACTOR WORKSPACE',
          badge: 'Talent Persona',
          accentColor: 'text-emerald-400',
          bgAccent: 'from-emerald-500/20 to-emerald-500/5',
          borderAccent: 'border-emerald-500/30',
          items: [
            { label: 'Actor Dashboard', path: '/actor#inbox', icon: UserCheck, defaultTab: true },
            { label: 'Casting Offers Inbox', path: '/actor#casting', icon: Radio },
            { label: 'Script & Scene Study', path: '/actor#scenes', icon: FileText },
            { label: 'AI Acting Coach', path: '/actor#coach', icon: Sparkles },
            { label: 'Verified Filmography', path: '/actor#filmography', icon: Award },
            { label: 'Settings & RBAC', path: '/settings', icon: Settings }
          ]
        };
      case 'MUSIC_DIRECTOR':
        return {
          title: 'MUSIC DIRECTOR WORKSPACE',
          badge: 'Acoustic Authority',
          accentColor: 'text-purple-400',
          bgAccent: 'from-purple-500/20 to-purple-500/5',
          borderAccent: 'border-purple-500/30',
          items: [
            { label: 'Soundtrack Studio', path: '/music-director#tracks', icon: Music, defaultTab: true },
            { label: 'Audio Cues & Tracks', path: '/music-director#tracks', icon: Sliders },
            { label: 'Character Leitmotifs', path: '/music-director#themes', icon: Sparkles },
            { label: 'AI Music Copilot', path: '/music-director#ai', icon: Radio },
            { label: 'Settings & RBAC', path: '/settings', icon: Settings }
          ]
        };
      case 'ADMIN':
        return {
          title: 'STUDIO ADMIN WORKSPACE',
          badge: 'Superuser Access',
          accentColor: 'text-rose-400',
          bgAccent: 'from-rose-500/20 to-rose-500/5',
          borderAccent: 'border-rose-500/30',
          items: [
            { label: 'Studio Management', path: '/admin#overview', icon: ShieldCheck, defaultTab: true },
            { label: 'All Productions', path: '/admin#movies', icon: Film },
            { label: 'Talent Directory', path: '/admin#users', icon: Users },
            { label: 'Settings & RBAC', path: '/settings', icon: Settings }
          ]
        };
      default:
        return {
          title: 'PRODUCTION WORKSPACE',
          badge: 'Cinema Access',
          accentColor: 'text-amber-400',
          bgAccent: 'from-amber-500/20 to-amber-500/5',
          borderAccent: 'border-amber-500/30',
          items: [
            { label: 'Dashboard', path: '/dashboard', icon: Clapperboard },
            { label: 'Settings & RBAC', path: '/settings', icon: Settings }
          ]
        };
    }
  };

  const config = getRoleConfig();

  const isItemActive = (item) => {
    const [itemPath, itemHash] = item.path.split('#');
    if (location.pathname !== itemPath) return false;
    if (!itemHash) return true; // plain path e.g. /settings
    const currentHash = location.hash.replace('#', '');
    if (!currentHash && item.defaultTab) return true;
    if (currentHash === itemHash) return true;
    // Special alias mappings
    if (itemHash === 'budget' && currentHash === 'finances') return true;
    if (itemHash === 'finances' && currentHash === 'budget') return true;
    if (itemHash === 'casting' && currentHash === 'inbox' && item.defaultTab) return true;
    if (itemHash === 'filmography' && currentHash === 'profile') return true;
    if (itemHash === 'profile' && currentHash === 'filmography') return true;
    return false;
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4">
      <div>
        {/* Brand / Logo */}
        <div className="flex items-center justify-between px-3 py-4 mb-4 border-b border-slate-800/60">
          <Link to="/" className="flex items-center gap-3" onClick={onCloseMobile}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 text-lg">
              🎬
            </div>
            <div>
              <h1 className="text-base font-black tracking-wider text-slate-100 font-['Cinzel'] leading-none">
                MOVIE<span className="text-amber-400">OS</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5">Cinema Operating System</p>
            </div>
          </Link>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="space-y-1">
          <div className="px-3 mb-2.5 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {config.title}
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-slate-900 ${config.accentColor} ${config.borderAccent}`}>
              {config.badge}
            </span>
          </div>

          {config.items.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? `bg-gradient-to-r ${config.bgAccent} ${config.accentColor} border ${config.borderAccent}`
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${config.accentColor}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Production Status Card */}
      <div className="cinema-glass rounded-2xl p-4 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">RBAC SECURITY STATUS</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <p className={`text-xs font-bold ${config.accentColor}`}>{role.replace('_', ' ')} PRIVILEGES</p>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Authorized workspace with real-time Firebase syncing & AI copilot.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="w-64 bg-[#090d16] border-r border-slate-800/80 hidden lg:flex flex-col shrink-0 min-h-[calc(100vh-37px)]">
        {sidebarContent}
      </aside>

      {/* Mobile Sliding Overlay Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[80vw] bg-[#090d16] border-r border-amber-500/30 h-full z-10 shadow-2xl animate-in slide-in-from-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
