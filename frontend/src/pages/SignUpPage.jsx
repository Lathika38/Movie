import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';
import { CinematicBackground } from '../components/landing/CinematicBackground';
import {
  Clapperboard,
  Briefcase,
  UserCheck,
  Music,
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  Phone,
  Film,
  Camera,
  Layers,
  Award,
  Eye,
  EyeOff,
  Cpu
} from 'lucide-react';

export const SignUpPage = () => {
  const { register, switchDemoRole, getRolePath } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'DIRECTOR',
    phone: '',
    bio: '',
    skills: '',
    languages: 'English',
    genres: 'Sci-Fi, Drama',
    showreelUrl: '',
    productionCompany: '',
    actorType: 'Actor'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const roleCards = [
    {
      role: 'DIRECTOR',
      title: 'Director',
      desc: 'Screenplay breakdown, visual framing, casting dispatch & score approvals.',
      icon: Clapperboard,
      color: 'border-amber-500/40 text-amber-400 bg-amber-500/10'
    },
    {
      role: 'PRODUCER',
      title: 'Producer',
      desc: 'Budget allocation, expense tracking, shooting schedules & weather risk.',
      icon: Briefcase,
      color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10'
    },
    {
      role: 'ACTOR',
      title: 'Actor / Actress',
      desc: 'Inbound casting offers, AI Stanislavski coach, scene dialogue & filmography.',
      icon: UserCheck,
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
    },
    {
      role: 'MUSIC_DIRECTOR',
      title: 'Music Director',
      desc: 'Original score cues, waveform preview, character leitmotifs & review workflow.',
      icon: Music,
      color: 'border-purple-500/40 text-purple-400 bg-purple-500/10'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const skillsArray = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
      const languagesArray = formData.languages ? formData.languages.split(',').map(s => s.trim()).filter(Boolean) : ['English'];
      const genresArray = formData.genres ? formData.genres.split(',').map(s => s.trim()).filter(Boolean) : [];

      const roleTitle = formData.role === 'ACTOR' ? formData.actorType : formData.role.replace('_', ' ');

      const user = await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        bio: formData.bio || `Professional ${roleTitle} in MovieOS cinema network.`,
        phone: formData.phone,
        skills: skillsArray,
        languages: languagesArray,
        genres: genresArray,
        showreelUrl: formData.showreelUrl,
        productionCompany: formData.productionCompany,
        actorType: formData.role === 'ACTOR' ? formData.actorType : ''
      });

      navigate(getRolePath(user.role));
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 font-['Inter'] relative overflow-hidden selection:bg-amber-500 selection:text-black">
      {/* 1. Cinematic Background AI Production Canvas Animation */}
      <CinematicBackground />

      {/* Header Logo */}
      <div className="flex items-center gap-3 mb-8 relative z-10 text-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-xl shadow-amber-500/20 text-2xl group-hover:scale-105 transition-transform">
            <Clapperboard className="w-6 h-6 fill-slate-950 text-slate-950" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black tracking-widest text-slate-100 font-['Cinzel'] leading-none">
              MOVIE<span className="text-amber-400">OS</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight mt-0.5 font-mono">Cinema Talent Registration</p>
          </div>
        </Link>
      </div>

      {/* Form Container with Cinematic Projector Aura Animation */}
      <div className="relative w-full max-w-2xl z-10">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 via-cyan-500/20 to-purple-500/30 rounded-3xl blur-xl opacity-75 animate-pulse pointer-events-none" />
        <div className="relative cinema-glass rounded-3xl p-6 sm:p-10 border border-amber-500/30 shadow-2xl space-y-6">
        <div className="text-center pb-2">
          <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] text-slate-100">
            Join the Cinema Production Platform
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Create your verified filmmaker or talent profile connected to database
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Role Selection Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Select Your Industry Role *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {roleCards.map((r) => {
                const Icon = r.icon;
                const isSelected = formData.role === r.role;
                return (
                  <div
                    key={r.role}
                    onClick={() => setFormData({ ...formData, role: r.role })}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`p-1.5 rounded-lg ${r.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'}`}>
                        {isSelected ? 'SELECTED' : 'CHOOSE'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100 font-['Outfit']">{r.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{r.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Account Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal / Stage Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Christopher Vance"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. name@movieos.cinema"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Repeat password"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Producer Production Company / Studio Name */}
          {formData.role === 'PRODUCER' && (
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-2">
              <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                Production Company / Studio Name *
              </label>
              <input
                type="text"
                required={formData.role === 'PRODUCER'}
                value={formData.productionCompany}
                onChange={(e) => setFormData({ ...formData, productionCompany: e.target.value })}
                placeholder="e.g. Europa Noir Studio, Paramount Pictures, Red Chillies"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/50 text-slate-100 text-xs focus:border-cyan-400 focus:outline-none placeholder-slate-500"
              />
              <p className="text-[11px] text-cyan-400/80">
                Any movie carrying this Production Name will automatically grant full producer access & control to your account.
              </p>
            </div>
          )}

          {/* 3b. Actor / Actress Specific Designation */}
          {formData.role === 'ACTOR' && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Specify Performer Designation *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, actorType: 'Actor' })}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    formData.actorType === 'Actor'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span>🎭 Actor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, actorType: 'Actress' })}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    formData.actorType === 'Actress'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span>✨ Actress</span>
                </button>
              </div>
              <p className="text-[11px] text-emerald-400/80">
                Selected: <strong className="text-emerald-300">{formData.actorType}</strong> — This designation helps directors and casting AI match appropriate character roles.
              </p>
            </div>
          )}

          {/* 4. Role-Specific Profile Attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Specialized Skills (Comma separated)</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder={
                  formData.role === 'ACTOR' ? "Meisner, Stunts, Stage Combat, Dialects" :
                  formData.role === 'DIRECTOR' ? "Anamorphic Lenses, Storyboarding, Subtext" :
                  formData.role === 'MUSIC_DIRECTOR' ? "Orchestral, Eurorack Modular, Dolby Atmos" :
                  "PGA Certified, Scheduling, Budgeting"
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Showreel / Portfolio URL</label>
              <input
                type="url"
                value={formData.showreelUrl}
                onChange={(e) => setFormData({ ...formData, showreelUrl: e.target.value })}
                placeholder="https://vimeo.com/your-reel"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Professional Bio / Credits</label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Brief professional summary, notable works, union affiliations..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? "Creating Account & Initializing Firestore..." : `Create ${formData.role.replace('_', ' ')} Account`}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-400 font-bold hover:underline">
              Sign In to MovieOS
            </Link>
          </p>
        </div>
      </div>
    </div>
  </div>
);
};
