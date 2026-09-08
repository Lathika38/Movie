import React from 'react';
import { CinematicBackground } from '../components/landing/CinematicBackground';
import { MovieNavbar } from '../components/landing/MovieNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { ProblemSection } from '../components/landing/ProblemSection';
import { SolutionSection } from '../components/landing/SolutionSection';
import { AgentNetwork } from '../components/landing/AgentNetwork';
import { ProductionScenario } from '../components/landing/ProductionScenario';
import { WorkflowSection } from '../components/landing/WorkflowSection';
import { FeatureShowcase } from '../components/landing/FeatureShowcase';
import { HumanInLoop } from '../components/landing/HumanInLoop';
import { WorkspacePreview } from '../components/landing/WorkspacePreview';
import { FinalCTA } from '../components/landing/FinalCTA';
import { MovieFooter } from '../components/landing/MovieFooter';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 font-['Inter'] relative overflow-x-hidden selection:bg-amber-500 selection:text-black">
      {/* 1. Cinematic Background AI Production Network Canvas */}
      <CinematicBackground />

      {/* 2. Floating Navbar */}
      <MovieNavbar />

      {/* 3. Hero Section & Production Intelligence Command Visual */}
      <HeroSection />

      {/* 4. Problem Section — Coordination Problem */}
      <ProblemSection />

      {/* 5. Solution Section — Production Brain & Agents */}
      <SolutionSection />

      {/* 6. AI Agent Network & Capabilities */}
      <AgentNetwork />

      {/* 7. Live Production Scenario — Scene 18 Storm Sequence */}
      <ProductionScenario />

      {/* 8. End-to-End How It Works Workflow */}
      <WorkflowSection />

      {/* 9. Feature Showcase Suite */}
      <FeatureShowcase />

      {/* 10. Human-In-The-Loop Architecture */}
      <HumanInLoop />

      {/* 11. Role Workspace Previews */}
      <WorkspacePreview />

      {/* 12. Final Call to Action */}
      <FinalCTA />

      {/* 13. MovieOS Footer */}
      <MovieFooter />
    </div>
  );
};
