import React, { useState } from 'react';
import {
  FileText,
  Users,
  Palette,
  CloudSun,
  MapPin,
  Search,
  Calendar,
  ShieldCheck,
  Briefcase,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const AgentNetwork = () => {
  const [activeAgent, setActiveAgent] = useState(0);

  const agents = [
    {
      id: 'script',
      title: 'Script Intelligence',
      icon: FileText,
      color: 'text-amber-400',
      border: 'border-amber-500/30',
      badge: 'GEMINI 1.5 PRO',
      description: 'Understands screenplay structure, parses scenes, and converts raw PDF screenplays into structured production breakdown data.',
      promptExample: '"Extract all interior props, stunts, and key dialogue beats for Scene #12."'
    },
    {
      id: 'casting',
      title: 'Casting Agent',
      icon: Users,
      color: 'text-cyan-400',
      border: 'border-cyan-500/30',
      badge: 'TALENT DISCOVERY',
      description: 'Supports talent discovery, evaluates actor availability, match percentages, and dispatches real-time casting offers.',
      promptExample: '"Recommend dramatic lead actors matching Commander Vance with 95%+ affinity."'
    },
    {
      id: 'character',
      title: 'Character Design Agent',
      icon: Palette,
      color: 'text-purple-400',
      border: 'border-purple-500/30',
      badge: 'VISUAL PERSONA',
      description: 'Helps define character appearance, style, costume direction, emotional arc, and visual personality across scenes.',
      promptExample: '"Generate futuristic cyberpunk costume specs for Elena Rostova in Scene #4."'
    },
    {
      id: 'weather',
      title: 'Weather Risk Agent',
      icon: CloudSun,
      color: 'text-rose-400',
      border: 'border-rose-500/30',
      badge: 'OPENWEATHER RADAR',
      description: 'Analyzes live weather forecasts at shooting locations and alerts producers to exterior rain, storm, or light risks.',
      promptExample: '"Check 7-day coastal rain risk for Chennai exterior night shoots."'
    },
    {
      id: 'location',
      title: 'Location Intelligence',
      icon: MapPin,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      badge: 'PERMIT & RECON',
      description: 'Researches shooting locations, soundstages, power availability, municipal permits, and logistical constraints.',
      promptExample: '"Verify power load limits and soundstage permits for Soundstage B."'
    },
    {
      id: 'research',
      title: 'Parallel Research',
      icon: Search,
      color: 'text-indigo-400',
      border: 'border-indigo-500/30',
      badge: 'PARALLEL API',
      description: 'Gathers relevant real-world historical context, period details, technical specs, and industry references.',
      promptExample: '"Search 1980s theatrical lighting rigs used in neo-noir sci-fi feature films."'
    },
    {
      id: 'scheduling',
      title: 'Scheduling & Logistics',
      icon: Calendar,
      color: 'text-amber-300',
      border: 'border-amber-500/30',
      badge: 'CALL SHEET OPTIMIZER',
      description: 'Coordinates scenes, actor turnarounds, location shifts, and production constraints into efficient call sheets.',
      promptExample: '"Reorder Day 4 schedule to minimize lead actor waiting times by 2.5 hours."'
    },
    {
      id: 'continuity',
      title: 'Continuity Judge',
      icon: ShieldCheck,
      color: 'text-cyan-300',
      border: 'border-cyan-500/30',
      badge: 'CONTINUITY PROTECTION',
      description: 'Identifies potential costume, prop, makeup, or eyeline conflicts across non-sequential shooting days.',
      promptExample: '"Audit bandage placement on Marcus Vane between Scene #18 and Scene #22."'
    },
    {
      id: 'coordinator',
      title: 'Production Coordinator',
      icon: Briefcase,
      color: 'text-purple-300',
      border: 'border-purple-500/30',
      badge: 'OPERATIONAL SYNTHESIS',
      description: 'Combines operational information across camera, sound, art, and catering departments into single-page briefs.',
      promptExample: '"Generate daily department checklist for Soundstage B load-in."'
    },
    {
      id: 'master',
      title: 'Master Orchestrator',
      icon: Zap,
      color: 'text-amber-400',
      border: 'border-amber-500/50',
      badge: 'CONSENSUS CORE',
      description: 'Coordinates the entire agent ecosystem, weighs trade-offs, and synthesizes single-click recommendations for producers.',
      promptExample: '"Synthesize weather alert #802 and recommend optimal call sheet modification."'
    }
  ];

  return (
    <section id="ai-agents" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative z-10">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold tracking-wider mb-6">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>10 SPECIALIZED AI AGENTS</span>
      </div>

      <h2 className="text-3xl sm:text-5xl font-black font-['Cinzel'] text-slate-100 max-w-4xl mx-auto leading-tight">
        Specialized intelligence for <br />
        <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-400 bg-clip-text text-transparent">
          every production decision.
        </span>
      </h2>

      <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-4 leading-relaxed">
        MovieOS assigns specialized AI agents to every production domain. Move your cursor over any agent to inspect its real-world capability.
      </p>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14 text-left">
        {agents.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeAgent === idx;
          return (
            <div
              key={item.id}
              onMouseEnter={() => setActiveAgent(idx)}
              className={`cinema-glass p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'border-amber-400/80 bg-slate-900/90 shadow-2xl scale-[1.02]'
                  : `${item.border} hover:border-slate-600 bg-slate-950/70`
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-slate-900 border border-slate-800 ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-100 font-['Outfit']">{item.title}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Prompt Capability Example</p>
                <p className="text-xs font-mono text-amber-300/90 mt-1 italic leading-tight">
                  {item.promptExample}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
