'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [added, setAdded] = useState(false);

  // Check if product is in local favorites
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('vip_vaper_favorites');
      if (storedFavorites) {
        const favoritesArray: string[] = JSON.parse(storedFavorites);
        setIsFavorite(favoritesArray.includes(product.id));
      }
    } catch (e) {
      console.error(e);
    }
  }, [product.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const storedFavorites = localStorage.getItem('vip_vaper_favorites');
      let favoritesArray: string[] = storedFavorites ? JSON.parse(storedFavorites) : [];
      
      if (favoritesArray.includes(product.id)) {
        favoritesArray = favoritesArray.filter((id) => id !== product.id);
        setIsFavorite(false);
      } else {
        favoritesArray.push(product.id);
        setIsFavorite(true);
      }
      localStorage.setItem('vip_vaper_favorites', JSON.stringify(favoritesArray));
      
      // Dispatch a storage event so other components (like Favoritos page) know about it
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const hasDiscount = product.promo_price !== null && product.promo_price !== undefined && product.promo_price > 0;
  const displayPrice = hasDiscount ? product.promo_price! : product.price;
  const mainImage = product.product_images?.find((img) => img.is_main)?.image_url ?? '/placeholder.png';

  return (
    <Link 
      href={`/produto/${product.slug}`}
      className="group relative flex flex-col w-full bg-[#09090c] border border-zinc-800 rounded-xl overflow-hidden hover:border-[#00ff66]/30 transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(0,255,102,0.1)]"
    >
      {/* Absolute Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
        {hasDiscount && (
          <div className="flex items-center gap-1 bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] font-cyber-orbitron text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 bg-[#00ff66] rounded-full cyber-pulse-dot" />
            PROMOÇÃO
          </div>
        )}
        {product.stock === 0 ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 font-cyber-orbitron text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded">
            ESGOTADO
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] font-cyber-orbitron text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full" />
            ORIGINAL
          </div>
        )}
      </div>

      {/* Favorite Button */}
      <button 
        onClick={toggleFavorite}
        className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-black/45 border border-zinc-800 text-zinc-400 hover:text-red-500 hover:border-red-500/30 transition-all duration-200 backdrop-blur-sm"
        aria-label="Adicionar aos favoritos"
      >
        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
      </button>

      {/* Product Image Wrapper */}
      <div className="w-full aspect-square relative bg-zinc-950 overflow-hidden flex items-center justify-center border-b border-zinc-900">
        {/* We use a fallback if the image is a URL or placeholder */}
        {mainImage.startsWith('http') || mainImage.startsWith('/') ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-[#16161a] flex items-center justify-center font-cyber-orbitron text-zinc-600 text-xs uppercase tracking-wider">
            Vip Vaper Image
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3.5 flex flex-col flex-1">
        <span className="text-[10px] uppercase font-cyber-orbitron tracking-widest text-[#00f0ff] mb-1 font-bold">
          {product.category?.name ?? 'Dispositivo'}
        </span>
        <h3 className="font-cyber-inter font-bold text-sm text-white line-clamp-2 leading-snug group-hover:text-[#00ff66] transition-colors duration-200 mb-2">
          {product.name}
        </h3>
        
        {/* Pricing & Add to Cart */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-1">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[10px] text-zinc-500 line-through tracking-wider">
                R$ {product.price.toFixed(2)}
              </span>
            )}
            <span className="font-cyber-orbitron text-sm font-black text-[#00ff66] tracking-tight">
              R$ {displayPrice.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`p-2 rounded-lg border transition-all duration-300 ${
              product.stock === 0
                ? 'border-zinc-800 text-zinc-600 cursor-not-allowed'
                : added
                ? 'border-[#00ff66] bg-[#00ff66]/10 text-[#00ff66]'
                : 'border-[#00ff66]/30 text-white hover:border-[#00ff66] hover:bg-[#00ff66]/10'
            }`}
            aria-label="Adicionar ao carrinho"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
};
