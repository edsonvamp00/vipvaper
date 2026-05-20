'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, Search, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export const Header: React.FC = () => {
  const { cartCount } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full max-w-md mx-auto bg-[#020203]/90 backdrop-blur-md border-b border-[#00ff66]/10 px-4 py-3 flex items-center justify-between">
      {/* Branding */}
      <Link href="/" className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#00ff66] cyber-pulse-dot" />
        <span className="font-cyber-orbitron font-black text-lg tracking-wider text-white">
          VIP<span className="text-[#00ff66] cyber-glow-text">VIPER</span>
        </span>
      </Link>

      {/* Quick Search Trigger / Link */}
      <div className="flex items-center gap-4">
        <Link 
          href="/busca" 
          className="p-2 rounded-full text-zinc-400 hover:text-[#00ff66] transition-colors duration-200"
          aria-label="Buscar produtos"
        >
          <Search className="w-5 h-5" />
        </Link>

        {/* Favorites Link */}
        <Link 
          href="/favoritos" 
          className="p-2 rounded-full text-zinc-400 hover:text-red-500 transition-colors duration-200"
          aria-label="Favoritos"
        >
          <Heart className="w-5 h-5" />
        </Link>

        {/* Profile Link */}
        <Link 
          href="/perfil" 
          className="p-2 rounded-full text-zinc-400 hover:text-[#00ff66] transition-colors duration-200"
          aria-label="Perfil do usuário"
        >
          <User className="w-5 h-5" />
        </Link>

        {/* Shopping Cart Link */}
        <Link 
          href="/carrinho" 
          className="p-2 rounded-full text-zinc-400 hover:text-[#00ff66] transition-colors duration-200 relative"
          aria-label="Carrinho"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-[#00ff66] text-black font-cyber-orbitron text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-[0_0_10px_rgba(0,255,102,0.5)]">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};
