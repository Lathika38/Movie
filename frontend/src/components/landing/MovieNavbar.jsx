import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Menu, X, Clapperboard } from 'lucide-react';

export const MovieNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#05070a]/85 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Clapperboard className="w-5 h-5 fill-slate-950 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-widest text-slate-100 font-['Cinzel'] leading-none">
                MOVIE<span className="text-amber-400">OS</span>
              </span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <p className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5 font-mono">
              AI MOVIE PRODUCTION OS
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
          <button
            onClick={() => scrollToSection('product')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Product
          </button>
          <button
            onClick={() => scrollToSection('ai-agents')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            AI Agents
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Features
          </button>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 text-xs font-bold transition-colors cursor-pointer"
          >
            Sign In
          </Link>
          <Link
            to="/login"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5 hover:scale-[1.02]"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden cinema-glass border-b border-slate-800 px-6 py-6 space-y-4 animate-in slide-in-from-top-5">
          <div className="flex flex-col space-y-3 text-sm font-semibold text-slate-300">
            <button
              onClick={() => scrollToSection('product')}
              className="text-left py-2 hover:text-amber-400 border-b border-slate-800/60"
            >
              Product
            </button>
            <button
              onClick={() => scrollToSection('ai-agents')}
              className="text-left py-2 hover:text-amber-400 border-b border-slate-800/60"
            >
              AI Agents
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-left py-2 hover:text-amber-400 border-b border-slate-800/60"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-left py-2 hover:text-amber-400 border-b border-slate-800/60"
            >
              Features
            </button>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Link
              to="/login"
              className="w-full py-2.5 rounded-xl border border-slate-700 text-center text-xs font-bold text-slate-200"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
