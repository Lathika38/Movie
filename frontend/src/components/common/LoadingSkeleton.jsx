import React from 'react';
import { Bot } from 'lucide-react';

export const LoadingSkeleton = ({ count = 3, type = "card" }) => {
  if (type === "ai") {
    return (
      <div className="cinema-glass border border-cyan-500/20 rounded-2xl p-8 text-center animate-pulse">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 text-cyan-400">
          <Bot className="w-7 h-7 animate-spin" />
        </div>
        <h4 className="text-lg font-bold text-cyan-300 mb-2 font-['Outfit']">🎬 AI Cinema Intelligence Engine is analyzing...</h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto">Evaluating narrative subtext, scene parameters, and real-time production logistics.</p>
        <div className="w-48 h-2 bg-slate-800 rounded-full mx-auto mt-6 overflow-hidden">
          <div className="w-3/4 h-full bg-gradient-to-r from-amber-500 to-cyan-400 rounded-full animate-[pulse_1.5s_infinite]" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="cinema-glass rounded-2xl p-6 border border-slate-800 animate-pulse space-y-4">
          <div className="h-5 bg-slate-800 rounded-md w-3/4" />
          <div className="h-3 bg-slate-800/60 rounded w-1/2" />
          <div className="space-y-2 pt-4">
            <div className="h-3 bg-slate-800/40 rounded w-full" />
            <div className="h-3 bg-slate-800/40 rounded w-5/6" />
          </div>
          <div className="h-8 bg-slate-800/80 rounded-xl w-full mt-4" />
        </div>
      ))}
    </div>
  );
};
