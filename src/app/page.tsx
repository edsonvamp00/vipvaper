'use client';

import React, { useState, useEffect } from 'react';
import { MobileShell } from '@/components/common/MobileShell';
import { ProductCard } from '@/components/ui/ProductCard';
import { BannerCarousel } from '@/components/ui/BannerCarousel';
import { Search, Flame, Award, Zap, Droplet, Layers, Cpu, ShieldCheck } from 'lucide-react';
import { Product, Category, Banner } from '@/types';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_BANNERS } from '@/lib/mockData';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/busca?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'pods':
        return <Layers className="w-5 h-5 text-[#00ff66]" />;
      case 'juices':
        return <Droplet className="w-5 h-5 text-[#00ff66]" />;
      case 'coils':
        return <Cpu className="w-5 h-5 text-[#00ff66]" />;
      default:
        return <Zap className="w-5 h-5 text-[#00ff66]" />;
    }
  };

  // Buscar TUDO do Supabase ao montar
  useEffect(() => {
    async function fetchAll() {
      try {
        // Banners
        const { data: bannersData } = await supabase
          .from('banners')
          .select('*')
          .eq('active', true)
          .order('position', { ascending: true });
        if (bannersData) setBanners(bannersData);

        // Categorias
        const { data: catsData } = await supabase
          .from('categories')
          .select('*')
          .eq('active', true);
        if (catsData && catsData.length > 0) {
          setCategories(catsData);
        } else {
          setCategories(MOCK_CATEGORIES); // Fallback
        }

        // Produtos com imagens e categoria
        const { data: prodsData } = await supabase
          .from('products')
          .select('*, category:categories(*), product_images(*)')
          .eq('active', true)
          .order('created_at', { ascending: false });
        if (prodsData && prodsData.length > 0) {
          setProducts(prodsData);
        } else {
          setProducts(MOCK_PRODUCTS); // Fallback
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        // Fallback para mocks em caso de erro
        setCategories(MOCK_CATEGORIES);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return (
    <MobileShell>
      {/* 1. Search Bar Top */}
      <form onSubmit={handleSearchSubmit} className="relative w-full mb-6 mt-2">
        <input
          type="text"
          placeholder="Buscar pods, juices, coils..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-xl px-4 py-3 pl-11 text-sm text-zinc-300 focus:outline-none focus:border-[#00ff66]/40 focus:ring-1 focus:ring-[#00ff66]/20 transition-all duration-300 font-cyber-inter"
        />
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
      </form>

      {/* 2. Banner Promocional Slider (Carousel) */}
      <BannerCarousel banners={banners} />

      {/* 3. Seção de Categorias em Ícones Circulares */}
      <section className="w-full mb-6">
        <h2 className="font-cyber-orbitron text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#00ff66]" />
          Explore por Categoria
        </h2>
        <div className="grid grid-cols-4 gap-2.5 w-full items-start">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              href={`/categoria/${cat.slug}`}
              className="flex flex-col items-center justify-start gap-2 group cursor-pointer text-center h-full"
            >
              <div className="w-12 h-12 rounded-full border border-zinc-800 bg-[#09090c] flex items-center justify-center group-hover:border-[#00ff66]/40 group-hover:bg-[#00ff66]/5 group-hover:shadow-[0_0_15px_rgba(0,255,102,0.1)] transition-all duration-300 shrink-0">
                {getCategoryIcon(cat.slug)}
              </div>
              <span className="font-cyber-orbitron text-[9px] font-bold text-zinc-400 group-hover:text-white transition-colors duration-200 uppercase tracking-wider text-center block w-full leading-tight min-h-[24px]">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Seção Mais Vendidos */}
      <section className="w-full mb-6">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="font-cyber-orbitron text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-[#00ff66]" />
            Coleção em Alta
          </h2>
          <Link href="/categorias" className="font-cyber-orbitron text-[9px] font-black text-[#00ff66] uppercase tracking-wider hover:underline">
            [ VER TUDO ]
          </Link>
        </div>
        
        {/* Horizontal sliding list */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent snap-x snap-mandatory">
          {products.slice(0, 3).map((prod) => (
            <div key={prod.id} className="min-w-[200px] max-w-[200px] snap-start">
              <ProductCard product={prod} />
            </div>
          ))}
        </div>
      </section>

      {/* 5. Seção Produtos em Destaque */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="font-cyber-orbitron text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#00ff66]" />
            Destaques VIP
          </h2>
          <Link href="/categorias" className="font-cyber-orbitron text-[9px] font-black text-[#00ff66] uppercase tracking-wider hover:underline">
            [ VER FILTROS ]
          </Link>
        </div>

        {/* 2 Column Grid */}
        <div className="grid grid-cols-2 gap-4">
          {products.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 6. Brand Guarantee Box */}
      <div className="w-full bg-[#0c0c0f] border border-[#00ff66]/10 rounded-xl p-4 mt-8 flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-[#00ff66] shrink-0" />
        <div>
          <h4 className="font-cyber-orbitron text-[10px] font-black text-white uppercase tracking-wider mb-0.5">
            QUALIDADE VIP GARANTIDA
          </h4>
          <p className="font-cyber-inter text-[10px] text-zinc-400 leading-normal">
            Todos os nossos aparelhos são originais de fábrica, com selo de autenticação e garantia total do suporte.
          </p>
        </div>
      </div>
    </MobileShell>
  );
}
