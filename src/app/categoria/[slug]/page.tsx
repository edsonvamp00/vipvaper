'use client';

import React, { use } from 'react';
import { MobileShell } from '@/components/common/MobileShell';
import { ProductCard } from '@/components/ui/ProductCard';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '@/lib/mockData';
import Link from 'next/link';
import { ArrowLeft, Inbox } from 'lucide-react';

interface CategoriaPageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoriaDetalhePage({ params }: CategoriaPageProps) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  // Find the category by slug
  const category = MOCK_CATEGORIES.find((cat) => cat.slug === slug);
  
  // Filter products by category id
  const products = MOCK_PRODUCTS.filter(
    (prod) => prod.category_id === category?.id
  );

  return (
    <MobileShell showHeader={false}>
      {/* Top Navigation */}
      <div className="flex items-center gap-3 mb-6 mt-2">
        <Link 
          href="/categorias" 
          className="p-2 bg-[#0c0c0f] border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="font-cyber-orbitron text-[9px] font-black text-[#00ff66] tracking-widest block uppercase">
            [ DEPARTAMENTO / {slug.toUpperCase()} ]
          </span>
          <h1 className="font-cyber-orbitron text-base font-extrabold text-white uppercase tracking-wider">
            {category ? category.name : 'Categoria'}
          </h1>
        </div>
      </div>

      {/* Main product showcase */}
      {!category ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Inbox className="w-12 h-12 text-zinc-600 mb-3" />
          <h3 className="font-cyber-orbitron text-sm font-bold text-white uppercase tracking-wider mb-1">
            CATEGORIA NÃO ENCONTRADA
          </h3>
          <p className="font-cyber-inter text-[11px] text-zinc-400 max-w-[200px] leading-relaxed mb-4">
            Essa categoria pode ter sido renomeada ou removida de nossos servidores.
          </p>
          <Link
            href="/"
            className="font-cyber-orbitron text-[10px] font-black px-4 py-2 border border-[#00ff66] text-[#00ff66] bg-[#00ff66]/5 rounded-lg uppercase tracking-wider hover:bg-[#00ff66]/10"
          >
            [ VOLTAR AO INÍCIO ]
          </Link>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Inbox className="w-12 h-12 text-zinc-600 mb-3" />
          <h3 className="font-cyber-orbitron text-sm font-bold text-white uppercase tracking-wider mb-1">
            SEM PRODUTOS DISPONÍVEIS
          </h3>
          <p className="font-cyber-inter text-[11px] text-zinc-400 max-w-[200px] leading-relaxed mb-4">
            Não há produtos ativos cadastrados nesta categoria no momento.
          </p>
          <Link
            href="/categorias"
            className="font-cyber-orbitron text-[10px] font-black px-4 py-2 border border-zinc-800 text-zinc-400 rounded-lg uppercase tracking-wider hover:text-white"
          >
            [ OUTRAS CATEGORIAS ]
          </Link>
        </div>
      ) : (
        <div>
          <span className="font-cyber-orbitron text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-4">
            // LISTANDO {products.length} {products.length === 1 ? 'PRODUTO' : 'PRODUTOS'}
          </span>
          
          <div className="grid grid-cols-2 gap-4">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}
    </MobileShell>
  );
}
