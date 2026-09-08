import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';
import { CreateMovieModal } from '../components/modals/CreateMovieModal';
import { AiAgentDrawer } from '../components/modals/AiAgentDrawer';

export const DashboardLayout = () => {
  const [isCreateMovieModalOpen, setIsCreateMovieModalOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-['Inter'] selection:bg-amber-500 selection:text-black">
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar (Desktop + Mobile Drawer) */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Stage Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Header
            onOpenCreateMovie={() => setIsCreateMovieModalOpen(true)}
            onOpenAiAgent={() => setIsAiDrawerOpen(true)}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          />

          <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 sm:pb-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Global Modals */}
      <CreateMovieModal
        isOpen={isCreateMovieModalOpen}
        onClose={() => setIsCreateMovieModalOpen(false)}
      />

      <AiAgentDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
      />
    </div>
  );
};
