import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ArrowDown } from 'lucide-react';

export const FinalCTA = () => {
  const scrollToAiAgents = () => {
    const el = document.getElementById('ai-agents');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const flowSteps = [
    'SCRIPT',
    'INTELLIGENCE',
    'AI AGENTS',
    'COLLABORATION',
    'RECOMMENDATION',
    'PRODUCTION'
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center relative z-10">
      <div className="cinema-glass p-8 sm:p-14 rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-slate-900/90 to-cyan-500/10 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Animated Information Flow Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] font-mono font-bold text-slate-400">
          {flowSteps.map((step, idx) => (
            <React.Fragment key={idx}>
              <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-300">
                {step}
              </span>
              {idx < flowSteps.length - 1 && (
                <span className="text-amber-500/60">→</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black font-['Cinzel'] text-slate-100 leading-tight">
            From screenplay to production, <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-400 bg-clip-text text-transparent">
              let MovieOS coordinate the complexity.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Bring screenplay intelligence, specialized AI agents and your production workflow into one intelligent operating system.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 hover:scale-105 cursor-pointer"
          >
            <span>Launch Production Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={scrollToAiAgents}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 border border-slate-700 hover:border-amber-500/40 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explore AI Agents</span>
          </button>
        </div>
      </div>
    </section>
  );
};
