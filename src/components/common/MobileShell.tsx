'use client';

import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface MobileShellProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showBottomNav?: boolean;
}

export const MobileShell: React.FC<MobileShellProps> = ({ 
  children, 
  showHeader = true, 
  showBottomNav = true 
}) => {
  return (
    <div className="min-h-screen w-full bg-[#020203] cyber-grid-bg flex justify-center items-start text-white selection:bg-[#00ff66] selection:text-black">
      {/* Glow Ambient Light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#00ff66]/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md min-h-screen bg-[#020203] border-x border-zinc-900 flex flex-col relative pb-28 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        {/* Header */}
        {showHeader && <Header />}
        
        {/* Main Content Area */}
        <main className="flex-1 w-full flex flex-col p-4 animate-fade-in">
          {children}
        </main>
        
        {/* Floating Bottom Nav */}
        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
};
