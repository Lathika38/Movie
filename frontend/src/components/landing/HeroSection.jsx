import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Play, Film, Shield } from 'lucide-react';
import { ProductionCommandCenter } from './ProductionCommandCenter';

export const HeroSection = () => {
  const scrollToAiAgents = () => {
    const el = document.getElementById('ai-agents');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-32 sm:pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center z-10 overflow-hidden">
      {/* Top Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold tracking-wider mb-8 shadow-xl shadow-amber-500/5 animate-pulse">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>MULTI-AGENT AI FOR FILM PRODUCTION</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-['Cinzel'] tracking-wide leading-none text-slate-100 max-w-5xl mx-auto">
        The AI Operating System for <br className="hidden sm:inline" />
        <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-400 bg-clip-text text-transparent">
          Modern Film Production
        </span>
      </h1>

      {/* Secondary Subheadline */}
      <h2 className="text-lg sm:text-2xl font-bold font-['Outfit'] tracking-widest uppercase text-slate-400 mt-4">
        Plan. Coordinate. Adapt. Create.
      </h2>

      {/* Description */}
      <p className="text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto mt-6 leading-relaxed">
        MovieOS brings specialized AI agents together to understand scripts, coordinate production intelligence, optimize decisions, and help filmmakers move from screenplay to shoot with greater clarity.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
        <Link
          to="/login"
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 hover:scale-105 cursor-pointer"
        >
          <span>Launch Production Studio</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <button
          onClick={scrollToAiAgents}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-amber-500/40 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Explore AI Agents</span>
        </button>
      </div>

      {/* Hero Interactive Command Center */}
      <ProductionCommandCenter />
    </section>
  );
};
