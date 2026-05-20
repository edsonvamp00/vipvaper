'use client';

import React, { useState, useEffect } from 'react';
import { MobileShell } from '@/components/common/MobileShell';
import { ProductCard } from '@/components/ui/ProductCard';
import { MOCK_PRODUCTS } from '@/lib/mockData';
import { Product } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Heart, Sparkles } from 'lucide-react';

export default function FavoritosPage() {
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load and filter favorites from LocalStorage
  const loadFavorites = () => {
    try {
      const storedFavorites = localStorage.getItem('vip_vaper_favorites');
      if (storedFavorites) {
        const favoritesArray: string[] = JSON.parse(storedFavorites);
        const filtered = MOCK_PRODUCTS.filter((prod) => favoritesArray.includes(prod.id));
        setFavoriteProducts(filtered);
      } else {
        setFavoriteProducts([]);
      }
    } catch (e) {
      console.error('Erro ao ler favoritos do localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadFavorites();

    // Listen for storage events (e.g. if updated from header or cards)
    const handleStorageChange = () => {
      loadFavorites();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <MobileShell showHeader={false}>
      {/* Header bar */}
      <div className="flex items-center gap-3 mb-6 mt-2">
        <Link 
          href="/" 
          className="p-2 bg-[#0c0c0f] border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="font-cyber-orbitron text-[9px] font-black text-[#00ff66] tracking-widest block uppercase">
            [ LISTA DE DESEJOS ]
          </span>
          <h1 className="font-cyber-orbitron text-base font-extrabold text-white uppercase tracking-wider">
            Meus Favoritos
          </h1>
        </div>
      </div>

      {!isLoaded ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#00ff66] animate-spin" />
        </div>
      ) : favoriteProducts.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 text-center border border-zinc-900 bg-[#07070a] rounded-2xl p-6">
          <Heart className="w-12 h-12 text-zinc-700 mb-4 animate-pulse" />
          <h3 className="font-cyber-orbitron text-xs font-bold text-white uppercase tracking-wider mb-2">
            NENHUM FAVORITO
          </h3>
          <p className="font-cyber-inter text-[11px] text-zinc-500 max-w-[200px] leading-relaxed mb-6">
            Você ainda não marcou nenhum produto com o coração. Eles aparecerão aqui quando o fizer.
          </p>
          <Link
            href="/"
            className="font-cyber-orbitron text-[10px] font-black px-5 py-2.5 bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] rounded-xl uppercase tracking-wider hover:bg-[#00ff66]/20 transition-all duration-300"
          >
            VER CATÁLOGO
          </Link>
        </div>
      ) : (
        /* Favorites Grid */
        <div>
          <span className="font-cyber-orbitron text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-4">
            // PRODUTOS DESEJADOS ({favoriteProducts.length})
          </span>

          <div className="grid grid-cols-2 gap-4">
            {favoriteProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}
    </MobileShell>
  );
}
