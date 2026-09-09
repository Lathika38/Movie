import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMovie } from '../../context/MovieContext';
import { useNotifications } from '../../context/NotificationContext';
import { authApi } from '../../api/authApi';
import { castingApi } from '../../api/castingApi';
import { X, Send, UserCheck, Sparkles, DollarSign, Calendar, MapPin } from 'lucide-react';

export const CastingRequestModal = ({ isOpen, onClose, preselectedCharacter, preselectedActor }) => {
  const { user } = useAuth();
  const { activeMovie, characters, refreshActiveMovieData } = useMovie();
  const { showToast } = useNotifications();

  const [actors, setActors] = useState([]);
  const [selectedActorId, setSelectedActorId] = useState('');
  const [selectedCharacterId, setSelectedCharacterId] = useState(preselectedCharacter?.id || '');
  const [roleType, setRoleType] = useState('Lead');
  const [offeredFee, setOfferedFee] = useState(250000);
  const [shootingDates, setShootingDates] = useState('');
  const [locations, setLocations] = useState('');
  const [roleRequirements, setRoleRequirements] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      authApi.getActors().then(data => {
        setActors(data || []);
        if (preselectedActor) {
          const actName = preselectedActor.actorName || preselectedActor.name;
          const matched = (data || []).find(a => a.name.toLowerCase() === actName?.toLowerCase());
          if (matched) {
            setSelectedActorId(matched.id);
          } else if (actName) {
            setSelectedActorId(actName);
          }
        } else if (data && data.length > 0 && !selectedActorId) {
          setSelectedActorId(data[0].id);
        }
      }).catch(console.error);

      if (preselectedCharacter?.id) {
        setSelectedCharacterId(preselectedCharacter.id);
        setRoleType(preselectedCharacter.roleType || 'Lead');
      } else if (characters.length > 0 && !selectedCharacterId) {
        setSelectedCharacterId(characters[0].id);
      }
    }
  }, [isOpen, preselectedCharacter, preselectedActor, characters]);

  if (!isOpen) return null;

  const characterObj = characters.find(c => c.id === selectedCharacterId) || preselectedCharacter || {
    name: 'Featured Role',
    description: 'Key dramatic persona in production.'
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!selectedActorId || !selectedCharacterId || !activeMovie?.id) return;

    setLoading(true);
    try {
      await castingApi.createCastingRequest({
        movieId: activeMovie.id,
        actorId: selectedActorId,
        characterId: selectedCharacterId,
        characterName: characterObj.name,
        characterDescription: characterObj.description || 'Lead role in film.',
        roleType: roleType,
        offeredFee: offeredFee,
        shootingDates: shootingDates,
        locations: locations,
        roleRequirements: roleRequirements,
        message: customMessage || `We are thrilled to offer you the role of ${characterObj.name} in '${activeMovie.title}'.`
      }, user?.id);

      showToast(`🎬 Official casting offer sent for '${characterObj.name}'!`, 'success');
      await refreshActiveMovieData();
      onClose();
    } catch (err) {
      alert(`Casting error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="cinema-glass rounded-3xl border border-amber-500/30 max-w-2xl w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-['Outfit']">Official Cinema Casting Dispatch</h2>
              <p className="text-xs text-slate-400">Send an official casting offer directly to talent in Firestore</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSendRequest} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Talent / Actor *</label>
              <select
                required
                value={selectedActorId}
                onChange={(e) => setSelectedActorId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
              >
                {selectedActorId && !actors.some(a => a.id === selectedActorId) && (
                  <option value={selectedActorId}>
                    ⭐ {selectedActorId} (AI Suggested Talent / Search Verified)
                  </option>
                )}
                {actors.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.skills?.slice(0, 2).join(', ') || a.availability})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Character in Screenplay *</label>
              <select
                required
                value={selectedCharacterId}
                onChange={(e) => setSelectedCharacterId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
              >
                {characters.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.roleType}) — {c.castingStatus}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Role Type</label>
              <select
                value={roleType}
                onChange={(e) => setRoleType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
              >
                <option value="Lead">Lead</option>
                <option value="Supporting">Supporting</option>
                <option value="Cameo">Cameo</option>
                <option value="Special Appearance">Special Appearance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Offered Compensation ($ USD)</label>
              <input
                type="number"
                value={offeredFee}
                onChange={(e) => setOfferedFee(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Shooting Dates</label>
              <input
                type="text"
                value={shootingDates}
                onChange={(e) => setShootingDates(e.target.value)}
                placeholder="e.g. Oct 15, 2026 - Dec 20, 2026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Shooting Locations</label>
              <input
                type="text"
                value={locations}
                onChange={(e) => setLocations(e.target.value)}
                placeholder="e.g. Pinewood Stages, Tokyo Exterior"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Director's Personal Pitch / Note</label>
            <textarea
              rows={3}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Write your personal directorial pitch or notes to the actor regarding this role..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? "Dispatching..." : "Dispatch Casting Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
