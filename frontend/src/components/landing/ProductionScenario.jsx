import React, { useState } from 'react';
import {
  CloudSun,
  Search,
  Users,
  Calendar,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react';

export const ProductionScenario = () => {
  const [activeStep, setActiveStep] = useState(5); // Default to full reveal
  const [decisionState, setDecisionState] = useState('pending');

  const steps = [
    {
      agent: 'WEATHER AGENT',
      icon: CloudSun,
      color: 'text-rose-400',
      border: 'border-rose-500/30',
      status: '⚠ WEATHER ALERT DETECTED',
      text: 'Severe coastal rain risk (92% probability) forecast for Scene 18 exterior shoot at Chennai Coast.'
    },
    {
      agent: 'RESEARCH AGENT',
      icon: Search,
      color: 'text-cyan-400',
      border: 'border-cyan-500/30',
      status: '✓ PERMITS & SOUNDSTAGE VERIFIED',
      text: 'Verified Soundstage B indoor permits & lighting grid ready for emergency shoot transfer.'
    },
    {
      agent: 'CASTING AGENT',
      icon: Users,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      status: '✓ TALENT AVAILABILITY CONFIRMED',
      text: 'Lead actors Christopher Vance & Elena Rostova available tomorrow morning without contract conflicts.'
    },
    {
      agent: 'SCHEDULING AGENT',
      icon: Calendar,
      color: 'text-purple-400',
      border: 'border-purple-500/30',
      status: '✓ WINDOW OPTIMIZATION COMPLETE',
      text: 'Calculated optimal 08:00 AM shooting slot. Saves $42,500 in idle crew turnaround costs.'
    },
    {
      agent: 'CONTINUITY JUDGE',
      icon: ShieldCheck,
      color: 'text-amber-300',
      border: 'border-amber-500/30',
      status: '✓ CONTINUITY PROTECTION CLEAR',
      text: 'No costume, prop, or eyeline mismatch between Scene 18 and subsequent Scene 19.'
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative z-10">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold tracking-wider mb-6">
        <Sparkles className="w-3.5 h-3.5 text-rose-400" />
        <span>LIVE PRODUCTION ADAPTATION SCENARIO</span>
      </div>

      <h2 className="text-3xl sm:text-5xl font-black font-['Cinzel'] text-slate-100 max-w-3xl mx-auto leading-tight">
        When production changes, <br />
        <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-cyan-400 bg-clip-text text-transparent">
          MovieOS reacts in real-time.
        </span>
      </h2>

      <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-4 leading-relaxed">
        Watch how MovieOS handles an unexpected coastal weather disruption by coordinating 5 specialized agents into 1 actionable producer recommendation.
      </p>

      {/* Scenario Terminal Container */}
      <div className="mt-14 cinema-glass rounded-3xl border border-slate-800 bg-[#090d16]/95 text-left p-6 sm:p-10 shadow-2xl space-y-8">
        {/* Scenario Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/20">
                SCENE 18 • STORM SEQUENCE
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Chennai Coastline
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-100 font-['Cinzel']">
              EXT. OCEAN CLIFFS — NIGHT REHEARSAL
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              T-Minus 14 Hours to Call Sheet
            </span>
          </div>
        </div>

        {/* Sequential Agent Flow Timeline */}
        <div className="space-y-4 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isVisible = idx <= activeStep;
            return (
              <div
                key={idx}
                className={`relative pl-12 transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-2'
                }`}
              >
                {/* Timeline Circle */}
                <div className={`absolute left-3.5 top-3 w-5 h-5 rounded-full -translate-x-1/2 flex items-center justify-center text-[10px] font-bold ${
                  isVisible ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30' : 'bg-slate-800 text-slate-500'
                }`}>
                  {idx + 1}
                </div>

                <div className={`p-4 rounded-2xl bg-slate-900/80 border ${step.border} space-y-1.5`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${step.color}`} />
                      <span className="text-xs font-mono font-bold text-slate-200">{step.agent}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${step.color}`}>
                      {step.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{step.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Master AI Recommendation Result */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-cyan-500/15 border-2 border-amber-500/50 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-sm font-black font-['Cinzel'] text-slate-100 tracking-wider">
                MOVIEOS SYNTHESIZED RECOMMENDATION
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold">
              100% CONFIDENCE
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-100">
                Move Scene 18 Shoot to Soundstage B • Tomorrow at 08:00 AM IST
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Bypasses severe rain, protects actor availability, preserves continuity, and avoids $42,500 delay penalty.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => alert("Simulation Review: Weather risk 92% mitigated by moving shoot to Soundstage B tomorrow 08:00 AM.")}
                className="px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Review Details
              </button>

              <button
                onClick={() => setDecisionState(decisionState === 'approved' ? 'pending' : 'approved')}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  decisionState === 'approved'
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                }`}
              >
                {decisionState === 'approved' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Decision Approved</span>
                  </>
                ) : (
                  <>
                    <span>Approve Decision</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
