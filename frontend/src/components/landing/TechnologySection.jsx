import React from 'react';
import { Cpu, Database, Flame, Code, CloudSun, Radio, Layers } from 'lucide-react';

export const TechnologySection = () => {
  const techStack = [
    { name: 'Google Gemini 1.5 Pro', desc: 'Screenplay Breakdown & Multi-Turn AI Reasoning', icon: Cpu, color: 'text-amber-400' },
    { name: 'Firebase Firestore', desc: 'Real-time Production State & Persistence', icon: Flame, color: 'text-rose-400' },
    { name: 'FastAPI (Python)', desc: 'High-performance Async Backend Services', icon: Code, color: 'text-emerald-400' },
    { name: 'OpenWeather Radar API', desc: 'Live Coastal & Outdoor Shooting Weather Risk', icon: CloudSun, color: 'text-cyan-400' },
    { name: 'Parallel API', desc: 'Real-world Permit & Location Reconnaissance', icon: Radio, color: 'text-indigo-400' },
    { name: 'Multi-Agent Architecture', desc: 'Domain-Specialized Agent Ecosystem', icon: Layers, color: 'text-purple-400' }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center relative z-10">
      <h2 className="text-2xl sm:text-3xl font-black font-['Cinzel'] text-slate-100 mb-2">
        Built as an AI-native production platform.
      </h2>
      <p className="text-xs text-slate-400 max-w-xl mx-auto mb-12">
        Powered by industry-grade artificial intelligence and real-time infrastructure.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {techStack.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="cinema-glass p-4 rounded-2xl border border-slate-800 text-center space-y-2 hover:border-amber-500/40 transition-colors"
            >
              <Icon className={`w-5 h-5 mx-auto ${item.color}`} />
              <h3 className="text-xs font-bold text-slate-100 font-mono">{item.name}</h3>
              <p className="text-[10px] text-slate-400 leading-snug">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
