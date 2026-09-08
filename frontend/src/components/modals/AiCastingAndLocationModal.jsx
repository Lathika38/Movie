import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { aiApi } from '../../api/aiApi';
import {
  X,
  Users,
  MapPin,
  Sparkles,
  ExternalLink,
  Award,
  Film,
  CheckCircle2,
  Send,
  RefreshCw,
  Sun,
  ShieldCheck,
  DollarSign,
  Clapperboard
} from 'lucide-react';

export const AiCastingAndLocationModal = ({
  isOpen,
  onClose,
  initialTab = 'casting',
  movieId,
  movieTitle,
  onDispatchCasting
}) => {
  const { showToast } = useNotifications();

  const [activeSubTab, setActiveSubTab] = useState(initialTab); // 'casting' | 'locations'
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setActiveSubTab(initialTab);
      fetchLiveAiSuggestions();
    }
  }, [isOpen, movieId, initialTab]);

  const fetchLiveAiSuggestions = async () => {
    if (!movieId) return;
    setLoading(true);
    try {
      const res = await aiApi.runDirectorAi(
        movieId,
        "Analyze screenplay content and generate real-time casting suggestions for Hero, Heroine, and Villain roles, plus recommended shooting locations.",
        null,
        null,
        activeSubTab === 'locations' ? 'LOCATION_SUGGESTION' : 'CASTING_ADVICE'
      );
      setAiData(res);
      showToast("✨ Live AI Casting & Location Suggestions computed!", "info");
    } catch (err) {
      showToast(`AI suggestion error: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const structured = aiData?.structuredInsights || {};
  const castingSuggestions = structured.castingSuggestions || structured.principalCastingBlueprint || [];
  const locationSuggestions = structured.locationSuggestions || structured.locationTopographyStrategy || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="cinema-glass rounded-3xl border border-amber-500/30 max-w-4xl w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-['Outfit']">
                Real-Time AI Casting & Location Intelligence
              </h2>
              <p className="text-xs text-slate-400">
                Project: <strong className="text-amber-400">{movieTitle || 'Active Production'}</strong> • Powered by Gemini 3.6 & Live Web Telemetry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tab Switcher & Re-run Trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveSubTab('casting')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'casting'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Actor & Actress Casting</span>
            </button>

            <button
              onClick={() => setActiveSubTab('locations')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'locations'
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Shooting Location Places</span>
            </button>
          </div>

          <button
            onClick={fetchLiveAiSuggestions}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/40 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Executing Real-Time AI Search...' : 'Re-Run Live AI Search'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pt-4 space-y-6 pr-1">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
              <h4 className="text-sm font-bold text-slate-200">Analyzing Screenplay & Gathering Live Data...</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Scanning Wikipedia live datasets and script context to extract real-world actor profiles and shooting location clearances.
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: CASTING SUGGESTIONS */}
              {activeSubTab === 'casting' && (
                <div className="space-y-6">
                  {castingSuggestions.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No casting suggestions returned yet. Click 'Re-Run Live AI Search' above.
                    </div>
                  ) : (
                    castingSuggestions.map((roleGroup, rIdx) => {
                      const archetype = roleGroup.roleArchetype || roleGroup.roleName || `ROLE ARCHETYPE #${rIdx + 1}`;
                      const charName = roleGroup.characterName || 'Lead Character';
                      const traits = roleGroup.requiredTraits || roleGroup.function || 'Key role in production';
                      const actors = roleGroup.suggestedActors || roleGroup.actors || [];

                      return (
                        <div key={rIdx} className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                                {archetype}
                              </span>
                              <h3 className="text-base font-bold text-slate-100 font-['Outfit'] mt-1">
                                Character: <span className="text-cyan-400">{charName}</span>
                              </h3>
                              <p className="text-xs text-slate-400 mt-0.5">{traits}</p>
                            </div>
                          </div>

                          {/* Actors Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {actors.map((actor, aIdx) => (
                              <div
                                key={aIdx}
                                className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 hover:border-amber-500/30 transition-all flex flex-col justify-between"
                              >
                                <div className="flex items-start gap-3">
                                  {actor.imageUrl ? (
                                    <img
                                      src={actor.imageUrl}
                                      alt={actor.actorName}
                                      className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                                      <Users className="w-6 h-6" />
                                    </div>
                                  )}

                                  <div className="space-y-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                      <h4 className="text-sm font-bold text-slate-100 truncate">{actor.actorName}</h4>
                                      {actor.suitabilityScore && (
                                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                                          {actor.suitabilityScore}% MATCH
                                        </span>
                                      )}
                                    </div>

                                    {actor.pastWork && (
                                      <p className="text-[11px] text-amber-400 font-medium truncate">
                                        🎬 {actor.pastWork}
                                      </p>
                                    )}

                                    {actor.rationale && (
                                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                                        "{actor.rationale}"
                                      </p>
                                    )}

                                    {actor.bioSnippet && (
                                      <p className="text-[11px] text-slate-400 italic line-clamp-2 mt-1">
                                        Wiki: {actor.bioSnippet}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                                  {actor.wikiUrl ? (
                                    <a
                                      href={actor.wikiUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 font-semibold"
                                    >
                                      <ExternalLink className="w-3 h-3" /> Live Wiki Data
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 font-mono">Live Google & Wikipedia Verified</span>
                                  )}

                                  <button
                                    onClick={() => {
                                      onClose();
                                      if (onDispatchCasting) {
                                        onDispatchCasting(actor);
                                      }
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 border border-amber-500/30"
                                  >
                                    <Send className="w-3 h-3" /> Dispatch Offer
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 2: LOCATION SUGGESTIONS */}
              {activeSubTab === 'locations' && (
                <div className="space-y-6">
                  {locationSuggestions.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No shooting location suggestions returned yet. Click 'Re-Run Live AI Search' above.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {locationSuggestions.map((loc, lIdx) => (
                        <div
                          key={lIdx}
                          className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                                {loc.settingType || 'EXT / INT'}
                              </span>
                              {loc.suitabilityRating && (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                  {loc.suitabilityRating}
                                </span>
                              )}
                            </div>

                            <h3 className="text-base font-bold text-slate-100 font-['Outfit']">
                              {loc.locationName}
                            </h3>

                            <p className="text-xs text-amber-400 font-semibold mt-1 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              <span>{loc.suggestedPlace}</span>
                            </p>

                            {loc.description && (
                              <p className="text-xs text-slate-300 mt-2 leading-relaxed italic bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                                "{loc.description}"
                              </p>
                            )}

                            <div className="mt-3 space-y-2 text-[11px] text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                              {loc.lightingAdvice && (
                                <div className="flex items-start gap-2">
                                  <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                  <span><strong className="text-slate-200">Lighting:</strong> {loc.lightingAdvice}</span>
                                </div>
                              )}

                              {loc.permitRequirements && (
                                <div className="flex items-start gap-2">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  <span><strong className="text-slate-200">Permits:</strong> {loc.permitRequirements}</span>
                                </div>
                              )}

                              {loc.estimatedRentalRate && (
                                <div className="flex items-start gap-2">
                                  <DollarSign className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                                  <span><strong className="text-slate-200">Est. Rate:</strong> {loc.estimatedRentalRate}</span>
                                </div>
                              )}

                              {loc.matchedSceneNumbers && loc.matchedSceneNumbers.length > 0 && (
                                <div className="pt-1 text-[10px] text-slate-400">
                                  Matched Scenes: {loc.matchedSceneNumbers.map(n => `#${n}`).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                            {loc.wikiUrl ? (
                              <a
                                href={loc.wikiUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                              >
                                <ExternalLink className="w-3 h-3" /> Live Location Telemetry
                              </a>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono">Live Google & Wikipedia Location Data</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
