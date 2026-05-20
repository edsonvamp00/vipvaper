'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MobileShell } from '@/components/common/MobileShell';
import { ProductCard } from '@/components/ui/ProductCard';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mockData';
import { Search, ArrowLeft, SlidersHorizontal, ArrowUpDown, CornerDownRight, X } from 'lucide-react';
import Link from 'next/link';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('categoria') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'name_asc'>('default');
  const [showFilters, setShowFilters] = useState(false);

  // Sync state with URL search params
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('categoria') || '');
  }, [searchParams]);

  // Handle Search Input Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams(query, selectedCategory);
  };

  // Helper to update URL params
  const updateUrlParams = (newQuery: string, newCat: string) => {
    const params = new URLSearchParams();
    if (newQuery.trim()) params.set('q', newQuery);
    if (newCat) params.set('categoria', newCat);
    router.push(`/busca?${params.toString()}`);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setQuery('');
    setSelectedCategory('');
    setSortBy('default');
    router.push('/busca');
  };

  // Filter and sort products
  let filteredProducts = MOCK_PRODUCTS.filter((prod) => {
    // 1. Search Query Match
    const matchesQuery = 
      !query.trim() || 
      prod.name.toLowerCase().includes(query.toLowerCase()) || 
      prod.short_description.toLowerCase().includes(query.toLowerCase()) ||
      (prod.category?.name && prod.category.name.toLowerCase().includes(query.toLowerCase()));

    // 2. Category Match
    const matchesCategory = !selectedCategory || prod.category?.slug === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  // 3. Sorting
  if (sortBy === 'price_asc') {
    filteredProducts.sort((a, b) => {
      const pA = a.promo_price ?? a.price;
      const pB = b.promo_price ?? b.price;
      return pA - pB;
    });
  } else if (sortBy === 'price_desc') {
    filteredProducts.sort((a, b) => {
      const pA = a.promo_price ?? a.price;
      const pB = b.promo_price ?? b.price;
      return pB - pA;
    });
  } else if (sortBy === 'name_asc') {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="flex flex-col w-full">
      {/* 1. Header with back button */}
      <div className="flex items-center gap-3 mb-4 mt-2">
        <Link 
          href="/" 
          className="p-2 bg-[#0c0c0f] border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <span className="font-cyber-orbitron text-[9px] font-black text-[#00ff66] tracking-widest block uppercase">
            [ HUB DE BUSCAS ]
          </span>
          <h1 className="font-cyber-orbitron text-base font-extrabold text-white uppercase tracking-wider">
            Buscar Produtos
          </h1>
        </div>
      </div>

      {/* 2. Interactive Search Form */}
      <form onSubmit={handleSearchSubmit} className="relative w-full mb-4">
        <input
          type="text"
          placeholder="O que você está procurando?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-xl px-4 py-3 pl-11 pr-10 text-sm text-zinc-300 focus:outline-none focus:border-[#00ff66]/40 focus:ring-1 focus:ring-[#00ff66]/20 transition-all duration-300 font-cyber-inter"
        />
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              updateUrlParams('', selectedCategory);
            }}
            className="absolute right-4 top-3.5 p-0.5 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* 3. Filter Actions Bar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-cyber-orbitron font-bold transition-all duration-200 ${
            showFilters || selectedCategory
              ? 'border-[#00ff66] bg-[#00ff66]/10 text-[#00ff66]'
              : 'border-zinc-800 bg-[#09090c] text-zinc-400 hover:text-white hover:border-zinc-700'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          FILTROS {selectedCategory ? '[1]' : ''}
        </button>

        <div className="flex items-center gap-1.5 bg-[#09090c] border border-zinc-800 rounded-lg px-2.5 py-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-xs font-cyber-orbitron font-bold text-zinc-400 focus:outline-none cursor-pointer pr-1"
          >
            <option value="default" className="bg-[#0c0c0f] text-zinc-300">ORDENAÇÃO</option>
            <option value="price_asc" className="bg-[#0c0c0f] text-zinc-300">MENOR PREÇO</option>
            <option value="price_desc" className="bg-[#0c0c0f] text-zinc-300">MAIOR PREÇO</option>
            <option value="name_asc" className="bg-[#0c0c0f] text-zinc-300">NOME A-Z</option>
          </select>
        </div>
      </div>

      {/* 4. Category Filters Panel (Slide-down) */}
      {showFilters && (
        <div className="mb-6 p-4 bg-[#09090c] border border-zinc-800 rounded-xl relative animate-slide-down">
          <h4 className="font-cyber-orbitron text-[10px] font-black text-white uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <CornerDownRight className="w-3 h-3 text-[#00ff66]" />
            Filtrar por Categoria
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedCategory('');
                updateUrlParams(query, '');
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-cyber-orbitron font-bold uppercase transition-all duration-200 ${
                !selectedCategory
                  ? 'border border-[#00ff66] bg-[#00ff66]/10 text-[#00ff66]'
                  : 'border border-zinc-800 bg-[#0c0c0f] text-zinc-500 hover:text-zinc-300'
              }`}
            >
              TODAS
            </button>
            {MOCK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  updateUrlParams(query, cat.slug);
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-cyber-orbitron font-bold uppercase transition-all duration-200 ${
                  selectedCategory === cat.slug
                    ? 'border border-[#00ff66] bg-[#00ff66]/10 text-[#00ff66]'
                    : 'border border-zinc-800 bg-[#0c0c0f] text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Results Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="font-cyber-orbitron text-[9px] font-black text-zinc-500 uppercase tracking-widest">
            // RESULTADOS ENCONTRADOS: {filteredProducts.length}
          </span>
          {(query || selectedCategory || sortBy !== 'default') && (
            <button
              onClick={handleResetFilters}
              className="text-[9px] font-cyber-orbitron font-black text-[#00ff66] uppercase hover:underline"
            >
              [ LIMPAR TUDO ]
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-zinc-900 bg-[#07070a] rounded-xl p-6">
            <Search className="w-10 h-10 text-zinc-700 mb-3 animate-pulse" />
            <h3 className="font-cyber-orbitron text-xs font-bold text-white uppercase tracking-wider mb-1">
              NENHUM PRODUTO DETECTADO
            </h3>
            <p className="font-cyber-inter text-[10px] text-zinc-400 max-w-[200px] leading-relaxed">
              Tente reajustar seus termos de busca ou remover os filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BuscaPage() {
  return (
    <MobileShell showHeader={false}>
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#00ff66] animate-spin" />
        </div>
      }>
        <SearchContent />
      </Suspense>
    </MobileShell>
  );
}
