'use client';

import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { WhatsAppButton } from '../ui/WhatsAppButton';

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
      {/* Glow Ambient Lights for Premium Desktop Experience */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#00ff66]/3 rounded-full blur-[130px] pointer-events-none hidden md:block" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-[#00ff66]/2 rounded-full blur-[150px] pointer-events-none hidden md:block" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[380px] h-[380px] bg-[#00ff66]/4 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md min-h-screen bg-[#020203] border-x border-zinc-900 md:border-[#00ff66]/10 flex flex-col relative pb-28 shadow-[0_0_50px_rgba(0,0,0,0.8)] md:shadow-[0_0_80px_rgba(0,255,102,0.04)]">
        
        {/* Header */}
        {showHeader && <Header />}
        
        {/* Main Content Area */}
        <main className="flex-1 w-full flex flex-col p-4 animate-fade-in">
          {children}
        </main>
        
        {/* Floating WhatsApp button */}
        <WhatsAppButton />

        {/* Floating Bottom Nav */}
        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
};

