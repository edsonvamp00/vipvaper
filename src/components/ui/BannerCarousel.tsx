'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Banner } from '@/types';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerCarouselProps {
  banners: Banner[];
}

// Premium visual fallback banners if Supabase table is empty
const FALLBACK_BANNERS: Banner[] = [
  {
    id: 'fb1',
    title: 'NOVA GERAÇÃO ELFBAR',
    subtitle: 'Nuvens de sabor intenso e displays digitais de e-líquido.',
    image_url: 'https://images.unsplash.com/photo-1559583985-c80d8ad9b29f?w=1200&auto=format&fit=crop&q=80',
    link_url: '/categoria/pods',
    active: true,
    position: 0,
    created_at: ''
  },
  {
    id: 'fb2',
    title: 'NASTY JUICE CUSH MAN',
    subtitle: 'O autêntico sabor frutado da manga com uva e sal de nicotina.',
    image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1200&auto=format&fit=crop&q=80',
    link_url: '/categoria/juices',
    active: true,
    position: 1,
    created_at: ''
  },
  {
    id: 'fb3',
    title: 'VAPORESSO XROS 4 NANO',
    subtitle: 'Design de bolso, tela circular OLED interativa e bateria de 1000mAh.',
    image_url: 'https://images.unsplash.com/photo-1613141411244-0e4ac259d217?w=1200&auto=format&fit=crop&q=80',
    link_url: '/categoria/pods',
    active: true,
    position: 2,
    created_at: ''
  },
  {
    id: 'fb4',
    title: 'RESISTÊNCIAS MESH GTX',
    subtitle: 'Entrega máxima de sabor e produção de nuvens densas e duradouras.',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
    link_url: '/categoria/coils',
    active: true,
    position: 3,
    created_at: ''
  },
  {
    id: 'fb5',
    title: 'ACESSÓRIOS & CASES TECH',
    subtitle: 'Proteja e personalize seu vape com o melhor da cultura cyberpunk.',
    image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&auto=format&fit=crop&q=80',
    link_url: '/categoria/acessorios',
    active: true,
    position: 4,
    created_at: ''
  }
];

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners }) => {
  const displayBanners = banners && banners.length > 0 ? banners.slice(0, 5) : FALLBACK_BANNERS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const swipeStartX = useRef(0);
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);

  // Autoplay setup
  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [currentIndex, displayBanners.length]);

  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimer.current = setInterval(() => {
      handleNext();
    }, 5000); // 5 seconds interval
  };

  const stopAutoplay = () => {
    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % displayBanners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + displayBanners.length) % displayBanners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Touch handlers for mobile swipe gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    stopAutoplay();
    swipeStartX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const swipeEndX = e.changedTouches[0].clientX;
    const diff = swipeStartX.current - swipeEndX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setIsSwiping(false);
    startAutoplay();
  };

  const activeBanner = displayBanners[currentIndex];

  return (
    <div 
      className="relative w-full aspect-[21/9] rounded-xl overflow-hidden mb-6 border border-[#00ff66]/20 cyber-glow-green shadow-[0_4px_25px_rgba(0,255,102,0.05)] select-none group"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      {/* Slides Container */}
      <Link 
        href={activeBanner.link_url ?? '#'}
        className="relative w-full h-full block cursor-pointer"
      >
        {/* Banner Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeBanner.image_url}
          alt={activeBanner.title ?? 'Banner Promocional'}
          className="w-full h-full object-cover brightness-40 contrast-[1.15] transition-all duration-700 ease-in-out scale-100"
        />

        {/* Tech grid mesh backdrop overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent flex flex-col justify-end p-4">
          <span className="w-fit px-1.5 py-0.5 bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] font-cyber-orbitron text-[8px] font-black tracking-widest rounded mb-1.5 animate-pulse">
            [ OFERTA LIMITADA • {currentIndex + 1}/{displayBanners.length} ]
          </span>
          <h2 className="font-cyber-orbitron text-sm sm:text-base font-extrabold text-white leading-tight mb-1 transition-all duration-300">
            {activeBanner.title}
          </h2>
          <p className="font-cyber-inter text-[9px] sm:text-[10px] text-zinc-400 font-semibold line-clamp-1 leading-snug max-w-[85%]">
            {activeBanner.subtitle}
          </p>
        </div>

        {/* Cyberpunk Laser Line cut at the bottom */}
        <div className="absolute right-0 bottom-0 w-28 h-1 bg-[#00ff66] shadow-[0_0_12px_#00ff66]" />
      </Link>

      {/* Slide Navigation Arrows */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePrev(); }}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg border border-zinc-800 bg-black/60 text-zinc-400 hover:text-white hover:border-[#00ff66]/30 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-sm"
        aria-label="Banner anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNext(); }}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg border border-zinc-800 bg-black/60 text-zinc-400 hover:text-white hover:border-[#00ff66]/30 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-sm"
        aria-label="Próximo banner"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Indicator dots */}
      <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-10">
        {displayBanners.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToSlide(idx); }}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'bg-[#00ff66] w-3 shadow-[0_0_6px_#00ff66]'
                : 'bg-zinc-600 hover:bg-zinc-400'
            }`}
            aria-label={`Ir para banner ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
