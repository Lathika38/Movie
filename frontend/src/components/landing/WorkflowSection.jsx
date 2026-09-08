import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export const WorkflowSection = () => {
  const steps = [
    { num: '01', title: 'SCRIPT', desc: 'Upload PDF screenplay' },
    { num: '02', title: 'UNDERSTAND', desc: 'MovieOS parses scenes & roles' },
    { num: '03', title: 'ANALYZE', desc: 'Agents audit production needs' },
    { num: '04', title: 'RESEARCH', desc: 'Gather permits, locations & weather' },
    { num: '05', title: 'COLLABORATE', desc: 'Agents share intelligence' },
    { num: '06', title: 'OPTIMIZE', desc: 'Evaluate call sheet constraints' },
    { num: '07', title: 'RECOMMEND', desc: 'System generates recommendation' },
    { num: '08', title: 'HUMAN APPROVAL', desc: 'Director/Producer approves' },
    { num: '09', title: 'SHOOT', desc: 'Production moves forward' }
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative z-10">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-wider mb-6">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>END-TO-END WORKFLOW</span>
      </div>

      <h2 className="text-3xl sm:text-5xl font-black font-['Cinzel'] text-slate-100 max-w-4xl mx-auto leading-tight">
        From screenplay to <br />
        <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-400 bg-clip-text text-transparent">
          production decision.
        </span>
      </h2>

      <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-4 leading-relaxed">
        MovieOS streamlines the journey from raw screenplay text to verified shooting call sheets in 9 synchronized steps.
      </p>

      {/* Desktop Horizontal / Mobile Vertical Timeline */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-3 text-left">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="cinema-glass p-4 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between group hover:scale-[1.03]"
          >
            <div>
              <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {step.num}
              </span>
              <h3 className="text-xs font-bold text-slate-100 font-['Outfit'] mt-3 group-hover:text-amber-300 transition-colors">
                {step.title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">{step.desc}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>STEP {idx + 1}</span>
              {idx < steps.length - 1 ? (
                <ArrowRight className="w-3 h-3 text-amber-400/60 hidden lg:block" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
