import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMovie } from '../../context/MovieContext';
import { useNotifications } from '../../context/NotificationContext';
import { musicApi } from '../../api/musicApi';
import { aiApi } from '../../api/aiApi';
import { uploadFileToFirebaseStorage } from '../../services/firebase';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Music,
  Sliders,
  Sparkles,
  Radio,
  Plus,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Clock,
  Activity,
  Send,
  Bot,
  Upload,
  Trash2,
  FileAudio,
  X,
  FileText,
  Layers,
  VolumeX,
  Download
} from 'lucide-react';

export const MusicDirectorDashboard = () => {
  const { user } = useAuth();
  const { activeMovie, characters, scenes, loading: movieLoading } = useMovie();
  const { showToast } = useNotifications();
  const location = useLocation();

  // Tab State: 'tracks' | 'themes' | 'ai'
  const [activeTab, setActiveTab] = useState('tracks');

  useEffect(() => {
    if (location.hash) {
      const h = location.hash.replace('#', '');
      if (['tracks', 'themes', 'ai'].includes(h)) {
        setActiveTab(h);
      }
    }
  }, [location.hash]);

  const changeTab = (tabId) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
  };

  const [musicProject, setMusicProject] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // File Upload State
  const [uploadingAudioTrackId, setUploadingAudioTrackId] = useState(null);

  // New Track Modal / Form
  const [isNewTrackModalOpen, setIsNewTrackModalOpen] = useState(false);
  const [newTrack, setNewTrack] = useState({
    title: '',
    trackType: 'THEME',
    mood: 'Atmospheric & Cinematic',
    bpm: 120,
    keySignature: 'C Minor',
    durationSeconds: 180,
    characterName: '',
    notes: '',
    audioUrl: ''
  });

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedSceneId, setSelectedSceneId] = useState('ALL');
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Web Audio Synthesizer State for AI Music Previews
  const [playingExampleCueId, setPlayingExampleCueId] = useState(null);
  const [activeAudioCtx, setActiveAudioCtx] = useState(null);

  useEffect(() => {
    if (activeMovie?.id) {
      loadMusicData();
    }
    return () => {
      // Clean up synth audio on unmount
      if (activeAudioCtx) {
        try { activeAudioCtx.close(); } catch (e) {}
      }
    };
  }, [activeMovie?.id]);

  const loadMusicData = async () => {
    setLoadingData(true);
    try {
      const [proj, trks, thms] = await Promise.all([
        musicApi.getMusicProject(activeMovie.id),
        musicApi.getTracks(activeMovie.id),
        musicApi.getThemes(activeMovie.id)
      ]);
      setMusicProject(proj);
      setTracks(trks || []);
      setThemes(thms || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  // Audio File Upload Handler (Firebase Storage with Object URL fallback)
  const handleAudioFileUpload = async (file, targetTrackId) => {
    if (!file) return;
    setUploadingAudioTrackId(targetTrackId);
    try {
      let audioUrl = '';
      try {
        audioUrl = await uploadFileToFirebaseStorage(file, `audio_cues/${activeMovie.id}`);
      } catch (err) {
        console.warn('Firebase upload fallback to local URL:', err);
      }
      if (!audioUrl) {
        audioUrl = URL.createObjectURL(file);
      }

      if (targetTrackId === 'NEW_TRACK') {
        setNewTrack((prev) => ({ ...prev, audioUrl }));
        showToast(`🎵 Audio file '${file.name}' attached to new cue!`, 'success');
      } else {
        await musicApi.updateTrack(targetTrackId, { audioUrl });
        showToast(`🎵 Audio file '${file.name}' uploaded successfully!`, 'success');
        loadMusicData();
      }
    } catch (err) {
      showToast(`Failed to upload audio: ${err.message}`, 'error');
    } finally {
      setUploadingAudioTrackId(null);
    }
  };

  // Remove Audio File from Track
  const handleRemoveAudioFile = async (trackId, trackTitle) => {
    try {
      await musicApi.updateTrack(trackId, { audioUrl: '' });
      showToast(`Audio file removed from '${trackTitle}'`, 'info');
      loadMusicData();
    } catch (err) {
      showToast(`Failed to remove audio: ${err.message}`, 'error');
    }
  };

  // Delete Track Altogether
  const handleDeleteTrack = async (trackId, trackTitle) => {
    if (!window.confirm(`Are you sure you want to delete soundtrack cue '${trackTitle}'?`)) return;
    try {
      await musicApi.deleteTrack(trackId);
      showToast(`🗑️ Soundtrack cue '${trackTitle}' deleted`, 'info');
      loadMusicData();
    } catch (err) {
      showToast(`Failed to delete track: ${err.message}`, 'error');
    }
  };

  // Create New Track
  const handleCreateTrack = async (e) => {
    e.preventDefault();
    if (!newTrack.title || !activeMovie?.id) return;
    try {
      await musicApi.createTrack({
        ...newTrack,
        bpm: parseInt(newTrack.bpm) || 120,
        durationSeconds: parseInt(newTrack.durationSeconds) || 180,
        movieId: activeMovie.id
      });
      showToast(`🎵 Track '${newTrack.title}' added to score library!`, 'success');
      setIsNewTrackModalOpen(false);
      setNewTrack({
        title: '',
        trackType: 'THEME',
        mood: 'Atmospheric & Cinematic',
        bpm: 120,
        keySignature: 'C Minor',
        durationSeconds: 180,
        characterName: '',
        notes: '',
        audioUrl: ''
      });
      loadMusicData();
    } catch (err) {
      alert(`Track error: ${err.message}`);
    }
  };

  // Submit Track for Director Review
  const handleSubmitForReview = async (trackId, trackTitle) => {
    try {
      await musicApi.submitTrackForReview(trackId);
      showToast(`🚀 Cue '${trackTitle}' submitted to Director for review!`, 'success');
      loadMusicData();
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    }
  };

  // Run AI Music Composer based on Script Content
  const handleRunMusicAi = async (customPrompt, sceneOverrideId) => {
    if (!activeMovie?.id) return;
    const targetSceneId = sceneOverrideId || selectedSceneId;
    
    let targetScene = null;
    if (targetSceneId && targetSceneId !== 'ALL' && scenes) {
      targetScene = scenes.find((s) => s.id === targetSceneId || s.sceneNumber === parseInt(targetSceneId));
    }

    let q = customPrompt || aiPrompt;
    if (!q.trim()) {
      if (targetScene) {
        q = `Analyze screenplay Scene #${targetScene.sceneNumber}: "${targetScene.heading}". Tone: "${targetScene.emotionalTone || 'Dramatic'}". Script Summary: "${targetScene.summary || targetScene.description || 'Key narrative scene'}". Suggest musical score direction, leitmotifs, key signature, tempo, and 3 example music cues for this scene.`;
      } else {
        q = `Analyze script content and overarching story of '${activeMovie.title}'. Film Logline: "${activeMovie.logline}". Genre: "${activeMovie.genre}". Suggest original soundtrack architecture, character motifs, BPM ranges, key signatures, and 3 example audio cues.`;
      }
    }

    setAiLoading(true);
    setAiResponse(null);
    try {
      const res = await aiApi.runMusicAi(activeMovie.id, q, targetScene?.sceneNumber || null, null, 'SCORE_DIRECTION');
      
      // Inject fallback example music cues if not returned in structured format
      if (!res.exampleCues) {
        const moodBase = targetScene ? targetScene.emotionalTone || 'Tense' : 'Epic & Atmospheric';
        res.exampleCues = [
          {
            id: 'cue-ex-1',
            title: targetScene ? `Scene #${targetScene.sceneNumber} - Primary Leitmotif` : `${activeMovie.title} - Main Title Theme`,
            trackType: 'THEME',
            mood: moodBase,
            bpm: 88,
            keySignature: 'D Dorian',
            durationSeconds: 195,
            instruments: ['Bowed Solo Cello', 'Analog Sub Synth', 'Granular Pads'],
            notes: `Tailored for ${targetScene ? `Scene #${targetScene.sceneNumber}` : 'Main Theme'}: Evocative 5-note minor 3rd motif building into sub-bass pulses.`
          },
          {
            id: 'cue-ex-2',
            title: targetScene ? `Scene #${targetScene.sceneNumber} - Rising Conflict` : `Subtext & Shadow Suite`,
            trackType: 'BGM',
            mood: 'High Tension & Suspense',
            bpm: 128,
            keySignature: 'C Minor',
            durationSeconds: 150,
            instruments: ['Modular Moog', 'Orchestral Taiko', 'Staccato Violins'],
            notes: 'Pulsing 7/8 rhythm driving dialogue tension and internal conflict.'
          },
          {
            id: 'cue-ex-3',
            title: targetScene ? `Scene #${targetScene.sceneNumber} - Resolution & Reverie` : `Emotional Catharsis`,
            trackType: 'THEME',
            mood: 'Ethereal & Melancholic',
            bpm: 72,
            keySignature: 'A Minor',
            durationSeconds: 210,
            instruments: ['Felt Piano', 'Ambient Reverb Drone', 'French Horns'],
            notes: 'Intimate solo piano softly resolving after dramatic peak.'
          }
        ];
      }

      setAiResponse(res);
      showToast('🎵 AI Music Suggestions & Script Audio Examples computed!', 'info');
    } catch (err) {
      alert(`AI error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Web Audio Synthesizer: Play Synthesized Example Music
  const handlePlaySynthesizedExample = (cue) => {
    if (playingExampleCueId === cue.id) {
      if (activeAudioCtx) {
        try { activeAudioCtx.close(); } catch (e) {}
      }
      setPlayingExampleCueId(null);
      setActiveAudioCtx(null);
      return;
    }

    if (activeAudioCtx) {
      try { activeAudioCtx.close(); } catch (e) {}
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        showToast('Web Audio API not supported in browser', 'error');
        return;
      }
      const ctx = new AudioCtx();
      setActiveAudioCtx(ctx);
      setPlayingExampleCueId(cue.id);

      let noteFreqs = [130.81, 155.56, 196.00, 233.08, 261.63, 311.13, 392.00]; // C Minor
      if (cue.keySignature?.includes('D')) {
        noteFreqs = [146.83, 174.61, 220.00, 261.63, 293.66, 349.23, 440.00]; // D Dorian / Minor
      } else if (cue.keySignature?.includes('A')) {
        noteFreqs = [110.00, 130.81, 164.81, 174.61, 220.00, 261.63, 329.63]; // A Minor
      } else if (cue.keySignature?.includes('G')) {
        noteFreqs = [98.00, 116.54, 146.83, 174.61, 196.00, 233.08, 293.66]; // G Minor
      }

      const now = ctx.currentTime;
      const tempo = Math.max(60, Math.min(180, cue.bpm || 120));
      const beatSec = 60 / tempo;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.25, now);
      masterGain.connect(ctx.destination);

      // Sub drone
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      subOsc.type = cue.mood?.toLowerCase().includes('tension') || cue.mood?.toLowerCase().includes('action') ? 'sawtooth' : 'sine';
      subOsc.frequency.setValueAtTime(noteFreqs[0] / 2, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(900, now + beatSec * 6);

      subGain.gain.setValueAtTime(0.2, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + beatSec * 14);

      subOsc.connect(filter);
      filter.connect(subGain);
      subGain.connect(masterGain);

      subOsc.start(now);
      subOsc.stop(now + beatSec * 14);

      // Arpeggiated leitmotif pattern
      const pattern = [0, 2, 4, 3, 1, 5, 2, 0, 4, 3, 2, 1];
      pattern.forEach((noteIdx, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteTime = now + i * (beatSec / 2);

        osc.type = cue.mood?.toLowerCase().includes('ethereal') ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(noteFreqs[noteIdx % noteFreqs.length], noteTime);

        gain.gain.setValueAtTime(0.15, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + beatSec * 0.85);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(noteTime);
        osc.stop(noteTime + beatSec * 0.85);
      });

      // Stop state auto reset
      setTimeout(() => {
        setPlayingExampleCueId((current) => (current === cue.id ? null : current));
      }, beatSec * 14 * 1000);

      showToast(`▶ Playing AI synthesized audio example for '${cue.title}'`, 'info');
    } catch (err) {
      console.error('Synth playback error:', err);
      showToast(`Audio Synth Error: ${err.message}`, 'error');
    }
  };

  // Add AI Suggested Cue to Soundtrack Library
  const handleAddAiCueToSoundtrack = async (cue) => {
    try {
      await musicApi.createTrack({
        movieId: activeMovie.id,
        title: cue.title,
        trackType: cue.trackType || 'THEME',
        mood: cue.mood || 'Cinematic',
        bpm: cue.bpm || 120,
        keySignature: cue.keySignature || 'C Minor',
        durationSeconds: cue.durationSeconds || 180,
        instrumentsUsed: cue.instruments || [],
        notes: `[AI Script Composition] ${cue.notes || ''}`
      });
      showToast(`🎵 AI Cue '${cue.title}' added to master Soundtrack Cues!`, 'success');
      await loadMusicData();
      changeTab('tracks');
    } catch (err) {
      showToast(`Failed to add cue: ${err.message}`, 'error');
    }
  };

  if (movieLoading) return <LoadingSkeleton count={3} />;

  if (!activeMovie) {
    return (
      <EmptyState
        icon={Music}
        title="No Movie Selected"
        description="Select a movie production to compose and orchestrate the score."
      />
    );
  }

  const approvedCount = tracks.filter((t) => t.status === 'APPROVED').length;

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* 1. Header & Sonic Palette */}
      <div className="cinema-glass rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                MUSIC & SOUNDTRACK STUDIO
              </span>
              <span className="text-xs text-slate-400 font-medium">Composer: {user?.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 font-['Cinzel']">
              {activeMovie.title} — Original Motion Picture Soundtrack
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
              Sonic Palette: <strong className="text-purple-400">{musicProject?.sonicPalette || 'Symphonic hybrid with analog modular synthesis'}</strong>
            </p>
          </div>

          {/* Cues Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-900/80 border border-slate-800 px-4 py-3 rounded-2xl text-center min-w-[95px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Cues</p>
              <p className="text-xl font-black text-purple-400 font-['Outfit']">{tracks.length}</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 px-4 py-3 rounded-2xl text-center min-w-[95px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Approved</p>
              <p className="text-xl font-black text-emerald-400 font-['Outfit']">{approvedCount}</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 px-4 py-3 rounded-2xl text-center min-w-[95px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Themes</p>
              <p className="text-xl font-black text-amber-400 font-['Outfit']">{themes.length}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => changeTab('tracks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tracks'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Music className="w-4 h-4" />
            Soundtrack Cues ({tracks.length})
          </button>

          <button
            onClick={() => changeTab('themes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'themes'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Character Themes & Leitmotifs ({themes.length})
          </button>

          <button
            onClick={() => changeTab('ai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bot className="w-4 h-4" />
            AI Music Composer (Script Analysis & Examples)
          </button>
        </div>
      </div>

      {/* 2. TAB: SOUNDTRACK CUES & TRACKS */}
      {activeTab === 'tracks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between cinema-glass p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Master Soundtrack Cues & Audio Stems</h3>
              <p className="text-xs text-slate-400">Upload audio files, manage cue sheets, and submit for Director sign-off</p>
            </div>
            <button
              onClick={() => setIsNewTrackModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> New Soundtrack Cue
            </button>
          </div>

          {tracks.length === 0 ? (
            <EmptyState
              icon={Music}
              title="No Soundtrack Cues Created"
              description="No music tracks have been created for this project. Click 'New Soundtrack Cue' to compose or upload your first cue."
              actionLabel="Create Soundtrack Cue"
              onAction={() => setIsNewTrackModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tracks.map((trk) => {
                const isApproved = trk.status === 'APPROVED';
                const isSubmitted = trk.status === 'SUBMITTED';
                const isRevision = trk.status === 'REVISION_REQUESTED';
                const isUploading = uploadingAudioTrackId === trk.id;

                return (
                  <div
                    key={trk.id}
                    className={`cinema-glass rounded-3xl p-6 border transition-all flex flex-col justify-between group ${
                      isApproved ? 'border-emerald-500/30' : (isRevision ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-800')
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                          {trk.trackType} • {trk.mood}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                            isApproved
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isSubmitted
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse'
                              : isRevision
                              ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {trk.status}
                          </span>

                          {/* Delete Cue Button */}
                          <button
                            onClick={() => handleDeleteTrack(trk.id, trk.title)}
                            title="Delete soundtrack cue"
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-slate-100 font-['Outfit']">{trk.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{trk.notes}</p>

                      {/* Waveform Visualization */}
                      <div className="mt-4 p-3 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center gap-1.5 h-14">
                        {trk.waveformPeaks?.map((p, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-amber-500 to-purple-400 rounded-full"
                            style={{ height: `${Math.max(15, p * 100)}%` }}
                          />
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-2.5 text-[10px] text-slate-400 font-mono">
                        <span>BPM: <strong className="text-slate-200">{trk.bpm}</strong> • KEY: <strong className="text-slate-200">{trk.keySignature}</strong></span>
                        <span>{Math.floor(trk.durationSeconds / 60)}:{(trk.durationSeconds % 60).toString().padStart(2, '0')}</span>
                      </div>

                      {/* Director's Feedback Note */}
                      {trk.directorFeedback && (
                        <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                          <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider mb-0.5">
                            Director Note:
                          </span>
                          <p className="text-slate-200 leading-relaxed italic">"{trk.directorFeedback}"</p>
                        </div>
                      )}
                    </div>

                    {/* Audio File Player & Upload / Remove Controls */}
                    <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
                      {trk.audioUrl ? (
                        <div className="flex items-center justify-between gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
                          <audio controls className="w-full h-8 opacity-90" src={trk.audioUrl} />
                          <button
                            onClick={() => handleRemoveAudioFile(trk.id, trk.title)}
                            title="Remove attached audio file"
                            className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1"
                          >
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-2xl border border-dashed border-slate-700">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <FileAudio className="w-4 h-4 text-purple-400 shrink-0" />
                            <span>No audio file uploaded</span>
                          </div>

                          <label className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isUploading ? 'Uploading...' : 'Upload Audio'}</span>
                            <input
                              type="file"
                              accept="audio/*"
                              disabled={isUploading}
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleAudioFileUpload(e.target.files[0], trk.id);
                                }
                              }}
                            />
                          </label>
                        </div>
                      )}

                      {/* Submit for Director Review */}
                      {trk.status !== 'APPROVED' && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleSubmitForReview(trk.id, trk.title)}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {isSubmitted ? "Re-Submit Cue" : "Submit for Review"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. TAB: CHARACTER THEMES & LEITMOTIFS */}
      {activeTab === 'themes' && (
        <div className="space-y-6">
          <div className="cinema-glass p-4 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-100">Character Harmonic Motifs</h3>
            <p className="text-xs text-slate-400">Signature musical leitmotifs anchored to character emotional arcs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {characters.map((char) => (
              <div key={char.id} className="cinema-glass rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {char.roleType} Motif
                  </span>
                  <h4 className="text-base font-bold text-slate-100 font-['Outfit'] mt-2">{char.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{char.description}</p>

                  <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs">
                    <p><strong className="text-slate-400">Emotional Arc:</strong> <span className="text-slate-200">{char.emotionalArc}</span></p>
                    <p><strong className="text-slate-400">Assigned Talent:</strong> <span className="text-cyan-400">{char.actorName || 'Unassigned'}</span></p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setAiPrompt(`Design a distinctive character leitmotif and orchestral palette for ${char.name} in '${activeMovie.title}'.`);
                      setActiveTab('ai');
                      handleRunMusicAi(`Design a distinctive character leitmotif and orchestral palette for ${char.name} in '${activeMovie.title}'.`);
                    }}
                    className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Generate Motif with AI
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TAB: AI MUSIC COMPOSER (Script Analysis & Example Music Previews) */}
      {activeTab === 'ai' && (
        <div className="cinema-glass rounded-3xl p-6 sm:p-8 border border-purple-500/30 max-w-4xl mx-auto space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto mb-3">
              <Bot className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 font-['Outfit']">AI Music Composer & Script Score Architecture</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select screenplay scenes to compute narrative score suggestions, harmonic keys, BPM, and hear AI synthesized music examples.
            </p>
          </div>

          {/* Script Scene Selection & Trigger */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
            <label className="block text-xs font-bold uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Select Screenplay Content / Scene for Composition:</span>
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedSceneId}
                onChange={(e) => setSelectedSceneId(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:border-purple-400 focus:outline-none"
              >
                <option value="ALL">🎬 Entire Film Screenplay Architecture ({activeMovie.title})</option>
                {scenes?.map((s) => (
                  <option key={s.id || s.sceneNumber} value={s.id || s.sceneNumber}>
                    Scene #{s.sceneNumber}: {s.heading} ({s.emotionalTone || 'Dramatic'})
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleRunMusicAi()}
                disabled={aiLoading}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>{aiLoading ? 'Composing...' : 'Analyze Script & Compose'}</span>
              </button>
            </div>
            {/* Quick Scene Mood Preset Buttons */}
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">QUICK SCENE TYPE COMPOSITION PRESETS:</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const promptText = `Analyze script content of '${activeMovie.title}' and compose high-intensity FIGHT / ACTION scene score. Suggest fast tempo (135+ BPM), syncopated heavy rhythm, brass, Taiko drums, distorted bass synth, and create audio tone examples.`;
                    setAiPrompt(promptText);
                    handleRunMusicAi(promptText);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  ⚔️ Fight / Action Scene
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const promptText = `Analyze script content of '${activeMovie.title}' and compose tender ROMANCE scene music. Suggest romantic 72 BPM tempo, lush string quartet, acoustic piano, flute leitmotif, and create synthesized audio tone examples.`;
                    setAiPrompt(promptText);
                    handleRunMusicAi(promptText);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  ❤️ Romance Scene
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const promptText = `Analyze script content of '${activeMovie.title}' and compose deeply EMOTIONAL / DRAMATIC scene score. Suggest minor key signature, slow cello solo, felt piano, reverberant atmospheric pads, and create audio tone examples.`;
                    setAiPrompt(promptText);
                    handleRunMusicAi(promptText);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  🎭 Emotional Scene
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const promptText = `Analyze script content of '${activeMovie.title}' and compose epic CLIMAX / RESOLUTION suite. Suggest full orchestral crescendo, soaring horn leitmotif, sub-bass drive, and create synthesized audio tone examples.`;
                    setAiPrompt(promptText);
                    handleRunMusicAi(promptText);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  💥 Epic Climax
                </button>
              </div>
            </div>

          </div>

          {/* Custom Composition Prompt Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunMusicAi();
            }}
            className="relative"
          >
            <textarea
              rows={2}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Or type custom prompt: e.g. 'Compose high-stakes chase music in 7/8 time signature with modular synth...'"
              className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-purple-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={aiLoading || !aiPrompt.trim()}
              className="absolute right-3 bottom-3 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-30 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {aiLoading && <LoadingSkeleton type="ai" />}

          {/* AI Response & Example Music Previews */}
          {aiResponse && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-purple-500/40 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> {aiResponse.title}
                </h4>
                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  {aiResponse.analysis}
                </div>

                {aiResponse.structuredInsights && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {Object.entries(aiResponse.structuredInsights).map(([k, v]) => (
                      <div key={k} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                          {k.replace(/([A-Z])/g, ' $1')}
                        </p>
                        <p className="text-xs text-slate-100 font-semibold mt-0.5">
                          {Array.isArray(v) ? v.join(', ') : String(v)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Example Music Previews Section */}
              {aiResponse.exampleCues?.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Music className="w-4 h-4 text-purple-400" />
                      <span>Script-Based Example Music Compositions & Previews</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Web Audio Synth Engine</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {aiResponse.exampleCues.map((cue) => {
                      const isPlaying = playingExampleCueId === cue.id;
                      return (
                        <div
                          key={cue.id}
                          className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isPlaying
                              ? 'bg-purple-950/30 border-purple-400 shadow-lg shadow-purple-500/10'
                              : 'bg-slate-900/90 border-slate-800 hover:border-purple-500/40'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                                {cue.trackType} • {cue.mood}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {cue.bpm} BPM • {cue.keySignature}
                              </span>
                            </div>
                            <h5 className="text-sm font-bold text-slate-100">{cue.title}</h5>
                            <p className="text-xs text-slate-300 max-w-xl">{cue.notes}</p>
                            
                            {cue.instruments?.length > 0 && (
                              <p className="text-[11px] text-purple-300 font-medium">
                                Palette: {cue.instruments.join(', ')}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Play Web Audio Synthesized Example Music */}
                            <button
                              onClick={() => handlePlaySynthesizedExample(cue)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                                isPlaying
                                  ? 'bg-rose-500 hover:bg-rose-400 text-white animate-pulse'
                                  : 'bg-purple-600 hover:bg-purple-500 text-white'
                              }`}
                            >
                              {isPlaying ? (
                                <>
                                  <Square className="w-3.5 h-3.5" />
                                  <span>Stop Example</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3.5 h-3.5" />
                                  <span>▶ Play Example Music</span>
                                </>
                              )}
                            </button>

                            {/* Add Cue to Soundtrack */}
                            <button
                              onClick={() => handleAddAiCueToSoundtrack(cue)}
                              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-md"
                              title="Add this suggested cue to your Soundtrack Cue Library"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Add Cue</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal: New Track with File Upload */}
      {isNewTrackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cinema-glass rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-amber-500/30 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 font-['Outfit']">Create New Soundtrack Cue</h3>
              <button
                onClick={() => setIsNewTrackModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTrack} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Track Title *</label>
                <input
                  type="text"
                  required
                  value={newTrack.title}
                  onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
                  placeholder="e.g. Descent into Neo-Tokyo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                  <select
                    value={newTrack.trackType}
                    onChange={(e) => setNewTrack({ ...newTrack, trackType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="THEME">THEME</option>
                    <option value="BGM">BGM</option>
                    <option value="SONG">SONG</option>
                    <option value="TEASER">TEASER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mood</label>
                  <input
                    type="text"
                    value={newTrack.mood}
                    onChange={(e) => setNewTrack({ ...newTrack, mood: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">BPM</label>
                  <input
                    type="number"
                    value={newTrack.bpm}
                    onChange={(e) => setNewTrack({ ...newTrack, bpm: parseInt(e.target.value) || 120 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Key Signature</label>
                  <input
                    type="text"
                    value={newTrack.keySignature}
                    onChange={(e) => setNewTrack({ ...newTrack, keySignature: e.target.value })}
                    placeholder="e.g. D Dorian"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Audio File Upload Section */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Audio File Attachment</label>
                {newTrack.audioUrl ? (
                  <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-700 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold truncate">
                      <FileAudio className="w-4 h-4 shrink-0" />
                      <span className="truncate">Audio file attached</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewTrack({ ...newTrack, audioUrl: '' })}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 border border-dashed border-slate-700 hover:border-amber-500 text-xs text-slate-400 hover:text-slate-200 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>{uploadingAudioTrackId === 'NEW_TRACK' ? 'Uploading audio file...' : 'Choose or Drop Audio File (.mp3, .wav)'}</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleAudioFileUpload(e.target.files[0], 'NEW_TRACK');
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Logistical & Composition Notes</label>
                <textarea
                  rows={2}
                  value={newTrack.notes || ''}
                  onChange={(e) => setNewTrack({ ...newTrack, notes: e.target.value })}
                  placeholder="e.g. Requires 16-piece brass section in final mix stem..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTrackModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
                >
                  Create Track Cue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
