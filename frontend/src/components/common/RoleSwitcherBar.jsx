import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_PROFILES } from '../../context/AuthContext';
import { Clapperboard, Briefcase, UserCheck, Music, ShieldCheck } from 'lucide-react';

export const RoleSwitcherBar = () => {
  const { role, switchDemoRole, getRolePath } = useAuth();
  const navigate = useNavigate();

  const getIcon = (r) => {
    switch (r) {
      case 'DIRECTOR': return <Clapperboard className="w-3.5 h-3.5" />;
      case 'PRODUCER': return <Briefcase className="w-3.5 h-3.5" />;
      case 'ACTOR': return <UserCheck className="w-3.5 h-3.5" />;
      case 'MUSIC_DIRECTOR': return <Music className="w-3.5 h-3.5" />;
      case 'ADMIN': return <ShieldCheck className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const handleRoleChange = async (r) => {
    await switchDemoRole(r);
    navigate(getRolePath(r));
  };

  return (
    <div className="bg-[#0b101b] border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-xs overflow-x-auto">
      <div className="flex items-center gap-2 text-slate-400 font-medium">
        <span className="text-[10px] uppercase tracking-wider font-bold text-amber-500/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          ROLE SWITCHER
        </span>
        <span className="hidden sm:inline text-slate-400">Switch workspace:</span>
      </div>

      <div className="flex items-center gap-1.5">
        {DEMO_PROFILES.map((p) => {
          const isActive = role === p.role;
          return (
            <button
              key={p.role}
              onClick={() => handleRoleChange(p.role)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {getIcon(p.role)}
              <span>{p.badge}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
