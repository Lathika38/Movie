import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Clapperboard,
  Briefcase,
  UserCheck,
  Music,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const WorkspacePreview = () => {
  const { switchDemoRole, getRolePath } = useAuth();
  const navigate = useNavigate();

  const handleLaunchRole = (roleKey) => {
    navigate('/login');
  };

  const roleWorkspaces = [
    {
      role: 'DIRECTOR',
      title: 'Director Workspace',
      persona: 'Christopher Vance',
      tagline: 'Screenplay breakdown, visual framing, casting dispatch & score approvals.',
      icon: Clapperboard,
      color: 'text-amber-400',
      border: 'hover:border-amber-400/80 border-amber-500/30',
      glow: 'from-amber-500/20 via-amber-500/5 to-transparent',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      role: 'PRODUCER',
      title: 'Producer Workspace',
      persona: 'Sarah Jenkins',
      tagline: 'Multi-million budget management, call sheets, departments & OpenWeather risks.',
      icon: Briefcase,
      color: 'text-cyan-400',
      border: 'hover:border-cyan-400/80 border-cyan-500/30',
      glow: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
      badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    },
    {
      role: 'ACTOR',
      title: 'Actor Workspace',
      persona: 'Elena Rostova',
      tagline: 'Live casting offer inbox, Stanislavski AI subtext coach & verified credits.',
      icon: UserCheck,
      color: 'text-emerald-400',
      border: 'hover:border-emerald-400/80 border-emerald-500/30',
      glow: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      role: 'MUSIC_DIRECTOR',
      title: 'Music Director Workspace',
      persona: 'Kaelen Thorne',
      tagline: 'Waveform cues, harmonic leitmotif design & Director feedback approvals.',
      icon: Music,
      color: 'text-purple-400',
      border: 'hover:border-purple-400/80 border-purple-500/30',
      glow: 'from-purple-500/20 via-purple-500/5 to-transparent',
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative z-10">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold tracking-wider mb-6">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>ROLE-BASED WORKSPACE PREVIEWS</span>
      </div>

      <h2 className="text-3xl sm:text-5xl font-black font-['Cinzel'] text-slate-100 max-w-4xl mx-auto leading-tight">
        Tailored operating suites for <br />
        <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-400 bg-clip-text text-transparent">
          every film production discipline.
        </span>
      </h2>

      <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-4 leading-relaxed">
        Sign in to access your role-tailored production workspace and active cinema projects.
      </p>

      {/* Role Gateways Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14 text-left">
        {roleWorkspaces.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.role}
              onClick={() => handleLaunchRole(card.role)}
              className={`cinema-glass bg-gradient-to-b ${card.glow} rounded-3xl p-7 border ${card.border} transition-all hover:scale-[1.02] cursor-pointer shadow-xl flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 group-hover:border-amber-500/40 transition-colors">
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${card.badge}`}>
                    {card.role.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-100 font-['Outfit'] group-hover:text-amber-300 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs font-semibold text-slate-300 mt-1">Verified Persona: {card.persona}</p>
                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                  {card.tagline}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>Sign In for Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Studio Launch CTA */}
      <div className="mt-14">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20 hover:scale-105 cursor-pointer"
        >
          <span>Enter Production Studio</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};
