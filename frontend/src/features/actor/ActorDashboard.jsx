import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMovie } from '../../context/MovieContext';
import { useNotifications } from '../../context/NotificationContext';
import { castingApi } from '../../api/castingApi';
import { scriptApi } from '../../api/scriptApi';
import { aiApi } from '../../api/aiApi';
import { authApi } from '../../api/authApi';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  UserCheck,
  Radio,
  FileText,
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  MapPin,
  Film,
  Bot,
  BookOpen,
  Send,
  Star,
  Video
} from 'lucide-react';

export const ActorDashboard = () => {
  const { user, setUser } = useAuth();
  const { activeMovie, characters, refreshActiveMovieData } = useMovie();
  const { showToast } = useNotifications();
  const location = useLocation();

  // Tab State: 'inbox' | 'scenes' | 'coach' | 'profile'
  const [activeTab, setActiveTab] = useState('inbox');

  useEffect(() => {
    if (location.hash) {
      const h = location.hash.replace('#', '');
      if (['inbox', 'casting', 'scenes', 'coach', 'profile', 'filmography'].includes(h)) {
        if (h === 'casting') setActiveTab('inbox');
        else if (h === 'filmography') setActiveTab('profile');
        else setActiveTab(h);
      }
    }
  }, [location.hash]);

  const changeTab = (tabId) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
  };

  const [castingRequests, setCastingRequests] = useState([]);
  const [myScenes, setMyScenes] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Acting Coach state
  const [coachPrompt, setCoachPrompt] = useState('');
  const [coachResponse, setCoachResponse] = useState(null);
  const [coachLoading, setCoachLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadActorData();
    }
  }, [user?.id, activeMovie?.id, characters?.length]);

  const loadActorData = async () => {
    setLoading(true);
    try {
      const [reqs, profile] = await Promise.all([
        castingApi.getActorCastingRequests(user.id),
        authApi.getProfile(user.id)
      ]);
      setCastingRequests(reqs || []);
      if (profile) setUser(profile);

      if (activeMovie?.id) {
        const allScenes = await scriptApi.getScenes(activeMovie.id);
        const myAcceptedCasting = (reqs || []).filter(r => r.movieId === activeMovie.id && r.status === 'ACCEPTED');
        
        // Gather all assigned character names for this actor across offers, movie members, and character bibles
        const assignedRoleNames = new Set(myAcceptedCasting.map(r => r.characterName?.toLowerCase()).filter(Boolean));
        
        (activeMovie.members || []).forEach(m => {
          if ((m.userId === user.id || m.name?.toLowerCase() === user.name?.toLowerCase()) && m.characterName) {
            assignedRoleNames.add(m.characterName.toLowerCase());
          }
        });

        (characters || []).forEach(c => {
          if ((c.actorId === user.id || c.actorName?.toLowerCase() === user.name?.toLowerCase()) && c.name) {
            assignedRoleNames.add(c.name.toLowerCase());
          }
        });

        const roleNamesList = Array.from(assignedRoleNames);
        
        // Map scenes with assigned indicator so actors can inspect their calls or full production breakdown
        const scenesWithAssignment = (allScenes || []).map(s => {
          const isAssigned = s.characters?.some(c => 
            roleNamesList.some(r => c.toLowerCase().includes(r) || r.includes(c.toLowerCase())) ||
            c.toLowerCase().includes(user?.name?.toLowerCase())
          );
          return { ...s, isAssigned };
        });

        setMyScenes(scenesWithAssignment);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToCasting = async (requestId, status) => {
    try {
      await castingApi.respondToCastingRequest(
        requestId,
        status,
        status === 'ACCEPTED' ? "Honored to accept this role. Preparing character subtext." : "Declining due to conflicting filming schedule."
      );
      showToast(
        status === 'ACCEPTED' ? "🎉 Role accepted! Added to your production schedule & filmography." : "Casting offer declined.",
        status === 'ACCEPTED' ? "success" : "info"
      );
      await loadActorData();
      await refreshActiveMovieData();
    } catch (err) {
      alert(`Error responding to casting: ${err.message}`);
    }
  };

  const handleRunActingCoach = async (customPrompt) => {
    const q = customPrompt || coachPrompt;
    if (!q.trim() || !activeMovie?.id) return;
    setCoachLoading(true);
    setCoachResponse(null);

    // Resolve target character ID for the actor
    const myAcceptedCasting = (castingRequests || []).filter(r => r.movieId === activeMovie.id && r.status === 'ACCEPTED');
    let targetChar = (characters || []).find(c => c.actorId === user.id || c.actorName?.toLowerCase() === user.name?.toLowerCase());
    if (!targetChar && myAcceptedCasting.length > 0) {
      targetChar = (characters || []).find(c => c.id === myAcceptedCasting[0].characterId || c.name?.toLowerCase() === myAcceptedCasting[0].characterName?.toLowerCase());
    }
    const targetCharId = targetChar?.id || myAcceptedCasting[0]?.characterId || (characters[0]?.id || 'CHR-001');

    try {
      const res = await aiApi.runActorAi(
        activeMovie.id,
        targetCharId,
        q,
        myScenes[0]?.id || null,
        'SUBTEXT_ANALYSIS'
      );
      setCoachResponse(res);
      showToast("🎭 Acting Coach insights prepared!", "success");
    } catch (err) {
      alert(`Coach error: ${err.message}`);
    } finally {
      setCoachLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton count={3} />;

  const pendingRequests = castingRequests.filter(r => r.status === 'PENDING');

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* 1. Actor Header & Profile Strip */}
      <div className="cinema-glass rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || "Actor")}`}
              alt={user?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  ACTOR WORKSPACE
                </span>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {user?.availability || 'Available for Casting'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-100 font-['Cinzel']">
                {user?.name}
              </h1>
              <p className="text-xs text-slate-300 max-w-xl mt-1 line-clamp-2">
                {user?.bio}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-900/80 border border-slate-800 px-4 py-3 rounded-2xl text-center min-w-[100px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Offers Inbox</p>
              <p className="text-xl font-black text-emerald-400 font-['Outfit']">{pendingRequests.length}</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 px-4 py-3 rounded-2xl text-center min-w-[100px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Call Scenes</p>
              <p className="text-xl font-black text-cyan-400 font-['Outfit']">{myScenes.length}</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 px-4 py-3 rounded-2xl text-center min-w-[100px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Credits</p>
              <p className="text-xl font-black text-emerald-400 font-['Outfit']">{user?.filmography?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => changeTab('inbox')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inbox'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4" />
            Casting Offers ({pendingRequests.length})
          </button>

          <button
            onClick={() => changeTab('scenes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'scenes'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Assigned Scenes ({myScenes.length})
          </button>

          <button
            onClick={() => changeTab('coach')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'coach'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Acting Coach
          </button>

          <button
            onClick={() => changeTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            Filmography & Credits
          </button>
        </div>
      </div>

      {/* 2. TAB: CASTING OFFERS INBOX */}
      {activeTab === 'inbox' && (
        <div className="space-y-6">
          <div className="cinema-glass p-4 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-100">Directorial Inbound Casting Offers</h3>
            <p className="text-xs text-slate-400">Review official contracts, character backstories, compensation, and accept roles</p>
          </div>

          {castingRequests.length === 0 ? (
            <EmptyState
              icon={Radio}
              title="No Inbound Casting Offers"
              description="You have no pending casting requests at this time. When a Director sends an offer, it will appear here in real-time."
            />
          ) : (
            <div className="space-y-4">
              {castingRequests.map((req) => {
                const isPending = req.status === 'PENDING';
                const isAccepted = req.status === 'ACCEPTED';
                return (
                  <div
                    key={req.id}
                    className={`cinema-glass rounded-3xl p-6 sm:p-8 border transition-all ${
                      isPending ? 'border-amber-500/50 bg-amber-500/5 shadow-2xl' : 'border-slate-800 opacity-90'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                            {req.roleType} Role
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                            isAccepted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <h4 className="text-xl font-bold text-slate-100 font-['Outfit']">
                          Role of <span className="text-amber-400">{req.characterName}</span> in '{req.movieTitle}'
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Offered by Director: <strong className="text-slate-200">{req.directorName}</strong>
                        </p>
                      </div>

                      {/* Financial & Logistics Pill */}
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        {req.offeredFee && (
                          <div className="bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Compensation</span>
                            <span className="font-bold text-emerald-400 font-mono">${req.offeredFee.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Shooting Window</span>
                          <span className="font-bold text-slate-200">{req.shootingDates || 'TBD'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Character & Pitch Body */}
                    <div className="py-4 space-y-3 text-xs leading-relaxed text-slate-300">
                      <div>
                        <strong className="text-amber-400 block uppercase text-[10px] font-bold tracking-wider mb-0.5">Character Breakdown:</strong>
                        <p>{req.characterDescription}</p>
                      </div>
                      {req.message && (
                        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 italic text-amber-200/90">
                          <strong className="not-italic text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Director's Personal Note:</strong>
                          "{req.message}"
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {isPending && (
                      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleRespondToCasting(req.id, 'DECLINED')}
                          className="px-5 py-2.5 rounded-xl border border-rose-500/40 text-rose-300 hover:bg-rose-500 hover:text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Decline Offer
                        </button>
                        <button
                          onClick={() => handleRespondToCasting(req.id, 'ACCEPTED')}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Accept Role & Join Production
                        </button>
                      </div>
                    )}

                    {isAccepted && (
                      <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        You have officially accepted this role. Script scenes and call times are unlocked below.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. TAB: SCENES & DIALOGUE STUDY */}
      {activeTab === 'scenes' && (
        <div className="space-y-6">
          <div className="cinema-glass p-4 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-100">Authorized Screenplay Scenes & Lines</h3>
            <p className="text-xs text-slate-400">Study dialogue beats, character subtext, and scene objectives</p>
          </div>

          {myScenes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Scenes Assigned"
              description="No scenes have been assigned to you yet. Once you accept a casting offer, matching screenplay scenes will appear here."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myScenes.map((sc) => (
                <div
                  key={sc.id || sc.sceneNumber}
                  className="cinema-glass rounded-2xl p-6 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                        SCENE #{sc.sceneNumber}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {sc.setting} • {sc.timeOfDay}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 font-['Cinzel']">{sc.heading}</h4>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">{sc.synopsis}</p>

                    {sc.keyDialogueSnippet && (
                      <div className="mt-4 p-3 rounded-xl bg-slate-900 border-l-2 border-cyan-400 text-xs text-cyan-200 italic">
                        "{sc.keyDialogueSnippet}"
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Emotional Tone: <strong className="text-slate-200">{sc.emotionalTone}</strong></span>
                    <button
                      onClick={() => {
                        setCoachPrompt(`Dissect the unspoken subtext and motivation for Scene #${sc.sceneNumber}: "${sc.heading}"`);
                        setActiveTab('coach');
                        handleRunActingCoach(`Dissect the unspoken subtext and motivation for Scene #${sc.sceneNumber}: "${sc.heading}"`);
                      }}
                      className="text-amber-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Coach Subtext
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. TAB: AI ACTING COACH */}
      {activeTab === 'coach' && (
        <div className="cinema-glass rounded-3xl p-6 sm:p-8 border border-cyan-500/30 max-w-3xl mx-auto space-y-6">
          <div className="text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-3">
              <Bot className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 font-['Outfit']">AI Acting & Subtext Coach</h3>
            <p className="text-xs text-slate-400 mt-1">
              Dissect your character's unspoken super-objective, line rhythm, physical tension points, and emotional stamina.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {[
              "What is my character's unspoken objective when confronting the antagonist?",
              "How do I balance intense vulnerability with outward stoicism in Scene 1?",
              "Give me a Stanislavski beat breakdown for the climax confrontation"
            ].map((qp, i) => (
              <button
                key={i}
                onClick={() => {
                  setCoachPrompt(qp);
                  handleRunActingCoach(qp);
                }}
                className="text-left px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400 text-xs text-slate-300 hover:text-cyan-300 transition-colors flex items-center justify-between"
              >
                <span>{qp}</span>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunActingCoach();
            }}
            className="relative"
          >
            <textarea
              rows={3}
              value={coachPrompt}
              onChange={(e) => setCoachPrompt(e.target.value)}
              placeholder="Ask the Acting Coach about character motivation, vocal cadence, physical mannerisms..."
              className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-cyan-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={coachLoading || !coachPrompt.trim()}
              className="absolute right-3 bottom-3 p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors disabled:opacity-30 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {coachLoading && <LoadingSkeleton type="ai" />}

          {coachResponse && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-4 animate-in fade-in">
              <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> {coachResponse.title}
              </h4>
              <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                {coachResponse.analysis}
              </div>

              {coachResponse.structuredInsights && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {Object.entries(coachResponse.structuredInsights).map(([k, v]) => (
                    <div key={k} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        {k.replace(/([A-Z])/g, ' $1')}
                      </p>
                      <p className="text-xs text-slate-100 font-semibold mt-0.5">{String(v)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB: FILMOGRAPHY & TALENT PROFILE */}
      {activeTab === 'profile' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Verified Filmography Card */}
          <div className="cinema-glass rounded-3xl p-6 sm:p-8 border border-slate-800">
            <h3 className="text-base font-bold text-slate-100 font-['Outfit'] mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" /> Verified MovieOS Production Filmography
            </h3>

            <div className="space-y-3">
              {user?.filmography?.length > 0 ? (
                user.filmography.map((f, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-100">{f.movieTitle}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                          {f.roleType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Character: <strong className="text-slate-200">{f.characterName}</strong> • Directed by {f.directorName || 'Studio Director'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-slate-400">{f.releaseYear}</span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                        {f.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No verified production filmography entries yet.</p>
              )}
            </div>
          </div>

          {/* Skills & Showreel */}
          <div className="cinema-glass rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 font-['Outfit']">Specialized Talent Attributes</h3>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Stage & Screen Skills</p>
              <div className="flex flex-wrap gap-2">
                {user?.skills?.map((sk, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
            {user?.showreelUrl && (
              <div className="pt-4 border-t border-slate-800">
                <a
                  href={user.showreelUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:underline"
                >
                  <Video className="w-4 h-4" /> Watch Professional Showreel
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
