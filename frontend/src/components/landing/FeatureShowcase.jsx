import React from 'react';
import {
  Users,
  Palette,
  CloudSun,
  MapPin,
  Calendar,
  FileText,
  ShieldCheck,
  Radio,
  Sparkles,
  CheckCircle2,
  Clapperboard
} from 'lucide-react';

export const FeatureShowcase = () => {
  const features = [
    {
      title: 'Smart Casting',
      tagline: 'AI-Assisted Talent Discovery & Match Scoring',
      desc: 'Connect character requirements directly to studio talent profiles with automated affinity scoring, filmography verification, and direct role offer dispatching.',
      icon: Users,
      color: 'text-amber-400',
      badge: 'DIRECTOR & PRODUCER',
      visual: (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-amber-400 font-bold">CHARACTER: COMMANDER VANCE</span>
            <span className="text-emerald-400 font-bold">96% MATCH AFFINITY</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Recommended Actor: Christopher Vance</span>
            <span className="text-amber-300 font-bold">[ DISPATCH OFFER ]</span>
          </div>
        </div>
      )
    },
    {
      title: 'Character Intelligence',
      tagline: 'Structured Character Profiles & Visual Direction',
      desc: 'Extract deep character motivations, emotional arcs, costume requirements, and visual personalities straight from screenplay dialogue.',
      icon: Palette,
      color: 'text-cyan-400',
      badge: 'ACTOR & ART DIRECTION',
      visual: (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-cyan-400 font-bold">CHARACTER: ELENA ROSTOVA</span>
            <span className="text-slate-400">ACT II DIALOGUE BEATS</span>
          </div>
          <p className="text-slate-300 italic text-[11px]">
            "If the pulse sweeps this grid before midnight, we are both ghosts."
          </p>
        </div>
      )
    },
    {
      title: 'Weather-Aware Scheduling',
      tagline: 'Identify Risks & Safer Shooting Windows',
      desc: 'OpenWeather integration cross-references exterior scenes against 7-day weather risks to automatically suggest indoor soundstage backups.',
      icon: CloudSun,
      color: 'text-rose-400',
      badge: 'PRODUCER & LOGISTICS',
      visual: (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-rose-500/30 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-rose-400 font-bold">WEATHER RADAR: CHENNAI COAST</span>
            <span className="text-rose-400 font-bold">HIGH RAIN THREAT (92%)</span>
          </div>
          <div className="text-emerald-400 text-[11px] font-bold">
            ✓ Contingency: Soundstage B Indoor Transfer Ready
          </div>
        </div>
      )
    },
    {
      title: 'Continuity Protection',
      tagline: 'Identify Eyeline, Prop & Costume Conflicts',
      desc: 'Audits non-sequential shooting days to ensure props, blood placement, makeup, and wardrobe match perfectly across cuts.',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      badge: 'CONTINUITY JUDGE',
      visual: (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-emerald-400 font-bold">CONTINUITY AUDIT #409</span>
            <span className="text-slate-400">SCENE #18 vs #19</span>
          </div>
          <p className="text-emerald-300 text-[11px]">
            ✓ Verified: Left forearm bandage matches Scene #19 opening frame.
          </p>
        </div>
      )
    }
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center relative z-10">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold tracking-wider mb-6">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>INTELLIGENT PRODUCTION SUITE</span>
      </div>

      <h2 className="text-3xl sm:text-5xl font-black font-['Cinzel'] text-slate-100 max-w-4xl mx-auto leading-tight">
        Everything your production needs. <br />
        <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-400 bg-clip-text text-transparent">
          One intelligent system.
        </span>
      </h2>

      <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-4 leading-relaxed">
        MovieOS replaces fragmented spreadsheets and disconnected tools with a single unified intelligence platform.
      </p>

      {/* Alternating Feature Showcase Rows */}
      <div className="mt-16 space-y-12 text-left">
        {features.map((item, idx) => {
          const Icon = item.icon;
          const isReversed = idx % 2 !== 0;
          return (
            <div
              key={idx}
              className={`cinema-glass p-8 sm:p-10 rounded-3xl border border-slate-800 hover:border-amber-500/40 transition-all grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${
                isReversed ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={`space-y-4 ${isReversed ? 'lg:order-2' : ''}`}>
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-slate-100 font-['Cinzel']">{item.title}</h3>
                <p className="text-xs font-mono font-bold text-amber-300">{item.tagline}</p>
                <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
              </div>

              <div className={isReversed ? 'lg:order-1' : ''}>
                {item.visual}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
