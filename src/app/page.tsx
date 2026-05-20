import React from 'react';
import { MobileShell } from '@/components/common/MobileShell';
import { ProductCard } from '@/components/ui/ProductCard';
import { BannerCarousel } from '@/components/ui/BannerCarousel';
import { HomeSearch } from '@/components/ui/HomeSearch';
import { Flame, Award, Zap, Droplet, Layers, Cpu, ShieldCheck } from 'lucide-react';
import { Product, Category, Banner } from '@/types';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '@/lib/mockData';

// Opt out of static generation if we want realtime data or rely on revalidation
export const revalidate = 60; // Revalidate every 60 seconds

async function getHomeData() {
  try {
    const [bannersRes, catsRes, prodsRes] = await Promise.all([
      supabase.from('banners').select('*').eq('active', true).order('position', { ascending: true }),
      supabase.from('categories').select('*').eq('active', true),
      supabase.from('products').select('*, category:categories(*), product_images(*)').eq('active', true).order('created_at', { ascending: false })
    ]);

    return {
      banners: bannersRes.data || [],
      categories: catsRes.data && catsRes.data.length > 0 ? catsRes.data : MOCK_CATEGORIES,
      products: prodsRes.data && prodsRes.data.length > 0 ? prodsRes.data : MOCK_PRODUCTS,
    };
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return {
      banners: [],
      categories: MOCK_CATEGORIES,
      products: MOCK_PRODUCTS,
    };
  }
}

export default async function Home() {
  const { banners, categories, products } = await getHomeData();

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'pods': return <Layers className="w-5 h-5 text-[#00ff66]" />;
      case 'juices': return <Droplet className="w-5 h-5 text-[#00ff66]" />;
      case 'coils': return <Cpu className="w-5 h-5 text-[#00ff66]" />;
      default: return <Zap className="w-5 h-5 text-[#00ff66]" />;
    }
  };

  return (
    <MobileShell>
      {/* 1. Search Bar Top (Client Component) */}
      <HomeSearch />

      {/* 2. Banner Promocional Slider (Carousel) */}
      <BannerCarousel banners={banners as Banner[]} />

      {/* 3. Seção de Categorias em Ícones Circulares */}
      <section className="w-full mb-6">
        <h2 className="font-cyber-orbitron text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#00ff66]" />
          Explore por Categoria
        </h2>
        <div className="grid grid-cols-4 gap-2.5 w-full">
          {categories.map((cat: any) => (
            <Link 
              key={cat.id} 
              href={`/categoria/${cat.slug}`}
              className="flex flex-col items-center group cursor-pointer text-center"
            >
              <div className="w-12 h-12 rounded-full border border-zinc-800 bg-[#09090c] flex items-center justify-center group-hover:border-[#00ff66]/40 group-hover:bg-[#00ff66]/5 group-hover:shadow-[0_0_15px_rgba(0,255,102,0.1)] transition-all duration-300 shrink-0 mb-2">
                {getCategoryIcon(cat.slug)}
              </div>
              <span className="font-cyber-orbitron text-[9px] font-bold text-zinc-400 group-hover:text-white transition-colors duration-200 uppercase tracking-wider text-center block w-full leading-tight min-h-[24px] px-1">
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
          {products.slice(0, 3).map((prod: any) => (
            <div key={prod.id} className="min-w-[200px] max-w-[200px] snap-start">
              <ProductCard product={prod as Product} />
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
          {products.map((prod: any) => (
            <ProductCard key={prod.id} product={prod as Product} />
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
