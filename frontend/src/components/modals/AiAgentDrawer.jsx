import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMovie } from '../../context/MovieContext';
import { aiApi } from '../../api/aiApi';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import {
  X,
  Bot,
  Sparkles,
  Send,
  Clapperboard,
  Briefcase,
  UserCheck,
  Music,
  CheckCircle2,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

export const AiAgentDrawer = ({ isOpen, onClose }) => {
  const { role } = useAuth();
  const { activeMovie, scenes, characters } = useMovie();

  const [prompt, setPrompt] = useState('');
  const [contextType, setContextType] = useState('DEFAULT');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  if (!isOpen) return null;

  const getRoleTitle = () => {
    switch (role) {
      case 'DIRECTOR': return 'Director AI Copilot (Visual & Subtext Direction)';
      case 'PRODUCER': return 'Producer AI Agent (Logistics, Schedule & Weather Risk)';
      case 'ACTOR': return 'AI Acting Coach (Stanislavski / Meisner Preparation)';
      case 'MUSIC_DIRECTOR': return 'Music AI Assistant (Acoustic Architecture & Leitmotif)';
      default: return 'MovieOS AI Production Intelligence';
    }
  };

  const getQuickPrompts = () => {
    switch (role) {
      case 'DIRECTOR':
        return [
          "Suggest camera lenses & shot movement for high-tension scene",
          "Analyze dramatic subtext and actor blocking notes",
          "Give casting recommendations for lead antagonist"
        ];
      case 'PRODUCER':
        return [
          "Analyze schedule risks and weather threats for exterior shoots",
          "Forecast budget variance and departmental burn rate",
          "Recommend logistics contingency plan for filming delay"
        ];
      case 'ACTOR':
        return [
          "Analyze scene subtext and my character's unspoken objective",
          "Create a line rehearsal rhythm and beat breakdown",
          "How do I prepare for intense psychological confrontation?"
        ];
      case 'MUSIC_DIRECTOR':
        return [
          "Design a character leitmotif in D Dorian with acoustic cello",
          "Suggest BPM, meter, and instrumentation for action sequence",
          "How to blend analog modular synths with symphonic brass?"
        ];
      default:
        return ["Analyze overall production health"];
    }
  };

  const handleRunAi = async (customPrompt) => {
    const query = customPrompt || prompt;
    if (!query.trim() || !activeMovie?.id) return;

    setLoading(true);
    setResponse(null);

    try {
      let res;
      if (role === 'DIRECTOR') {
        res = await aiApi.runDirectorAi(activeMovie.id, query, null, null, 'SCRIPT_ANALYSIS');
      } else if (role === 'PRODUCER') {
        res = await aiApi.runProducerAi(activeMovie.id, query, true, 'SCHEDULE_RISK');
      } else if (role === 'ACTOR') {
        const charId = characters[0]?.id || null;
        res = await aiApi.runActorAi(activeMovie.id, charId, query, null, 'SUBTEXT_ANALYSIS');
      } else if (role === 'MUSIC_DIRECTOR') {
        res = await aiApi.runMusicAi(activeMovie.id, query, null, null, 'SCORE_DIRECTION');
      } else {
        res = await aiApi.runDirectorAi(activeMovie.id, query);
      }
      setResponse(res);
    } catch (err) {
      alert(`AI error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end">
      <div className="w-full max-w-2xl bg-[#090d16] border-l border-amber-500/30 h-full flex flex-col p-6 sm:p-8 shadow-2xl overflow-y-auto animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-['Outfit']">{getRoleTitle()}</h2>
              <p className="text-[11px] text-amber-400 font-semibold">Active Context: {activeMovie?.title || 'No Production'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="mb-6 shrink-0">
          <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Recommended Intelligence Inquiries
          </p>
          <div className="flex flex-col gap-2">
            {getQuickPrompts().map((qp, i) => (
              <button
                key={i}
                onClick={() => {
                  setPrompt(qp);
                  handleRunAi(qp);
                }}
                className="text-left px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 text-xs text-slate-300 hover:text-amber-300 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <span>{qp}</span>
                <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input Form */}
        <div className="mb-6 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunAi();
            }}
            className="relative"
          >
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Ask the MovieOS ${role.replace('_', ' ')} AI Agent anything about ${activeMovie?.title || 'your film'}...`}
              className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="absolute right-3 bottom-3 p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors disabled:opacity-30 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Loading / Results Content */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {loading && <LoadingSkeleton type="ai" />}

          {response && (
            <div className="cinema-glass rounded-2xl p-6 border border-cyan-500/30 space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {response.title}
                </span>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-300 font-bold px-2.5 py-1 rounded-full border border-cyan-500/30">
                  {Math.round((response.confidenceScore || 0.96) * 100)}% Confidence
                </span>
              </div>

              {/* Analysis Body */}
              <div className="text-xs text-slate-200 leading-relaxed space-y-2 whitespace-pre-line bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                {response.analysis}
              </div>

              {/* Structured Insights Key-Value Cards */}
              {response.structuredInsights && Object.keys(response.structuredInsights).length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2.5">
                    Structured Production Insights
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(response.structuredInsights).map(([key, val]) => (
                      <div key={key} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </p>
                        <p className="text-xs font-semibold text-slate-100 mt-0.5">
                          {Array.isArray(val) ? val.join(', ') : String(val)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strategic Directorial / Production Recommendations */}
              {response.recommendations && response.recommendations.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2.5">
                    Recommended Action Items
                  </h4>
                  <div className="space-y-2">
                    {response.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
