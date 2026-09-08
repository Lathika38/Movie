import React from 'react';
import { Link } from 'react-router-dom';
import { Clapperboard } from 'lucide-react';

export const MovieFooter = () => {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="cinema-glass border-t border-slate-800/80 pt-16 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8 pb-12 border-b border-slate-800/80">
        {/* Brand Column */}
        <div className="space-y-3 max-w-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Clapperboard className="w-4 h-4 fill-slate-950 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-widest text-slate-100 font-['Cinzel'] leading-none">
                MOVIE<span className="text-amber-400">OS</span>
              </h2>
              <p className="text-[9px] text-slate-400 font-mono font-semibold tracking-wider uppercase mt-0.5">
                AI MOVIE PRODUCTION OS
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            The intelligent multi-agent operating system for coordinating modern film production from screenplay to final shoot.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
          <div className="space-y-2.5">
            <p className="font-mono font-bold uppercase text-slate-300 tracking-wider">Product</p>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => scrollToSection('product')} className="hover:text-amber-400 cursor-pointer">
                  Screenplay AI
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('ai-agents')} className="hover:text-amber-400 cursor-pointer">
                  AI Agents
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('how-it-works')} className="hover:text-amber-400 cursor-pointer">
                  How It Works
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <p className="font-mono font-bold uppercase text-slate-300 tracking-wider">Features</p>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => scrollToSection('features')} className="hover:text-amber-400 cursor-pointer">
                  Smart Casting
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('features')} className="hover:text-amber-400 cursor-pointer">
                  Weather Radar
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('features')} className="hover:text-amber-400 cursor-pointer">
                  Continuity Judge
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <p className="font-mono font-bold uppercase text-slate-300 tracking-wider">Studio Access</p>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/login" className="hover:text-amber-400">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-amber-400">
                  Create Studio Account
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400">
                  Launch Studio →
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono gap-4">
        <p>© 2026 MOVIEOS. All rights reserved.</p>
        <p className="flex items-center gap-2">
          <span>Multi-Agent AI Architecture</span>
          <span>•</span>
          <span>Gemini 1.5 Pro</span>
          <span>•</span>
          <span>FastAPI</span>
        </p>
      </div>
    </footer>
  );
};
