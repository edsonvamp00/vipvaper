'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Heart, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { cartCount } = useCart();

  const navItems = [
    { label: 'Início', icon: Home, href: '/' },
    { label: 'Categorias', icon: Grid, href: '/categorias' },
    { label: 'Favoritos', icon: Heart, href: '/favoritos' },
    { label: 'Carrinho', icon: ShoppingCart, href: '/carrinho', badgeCount: true },
    { label: 'Perfil', icon: User, href: '/perfil' },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40">
      <div className="w-full cyber-glass rounded-full px-6 py-2.5 flex items-center justify-between shadow-[0_-5px_20px_rgba(0,0,0,0.8)] border border-[#00ff66]/20 bg-[#09090c]/90">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center relative group"
            >
              <div 
                className={`p-2 rounded-full transition-all duration-300 relative ${
                  isActive 
                    ? 'text-[#00ff66] scale-110 bg-[#00ff66]/10 shadow-[0_0_12px_rgba(0,255,102,0.1)]' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-105" />
                
                {/* Item counter for ShoppingCart tab */}
                {item.badgeCount && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00ff66] text-black font-cyber-orbitron text-[9px] font-black rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(0,255,102,0.6)]">
                    {cartCount}
                  </span>
                )}
              </div>
              
              {/* Active Indicator Line */}
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 bg-[#00ff66] rounded-full shadow-[0_0_6px_#00ff66]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
