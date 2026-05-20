'use client';

import React, { useState, useEffect } from 'react';
import { MobileShell } from '@/components/common/MobileShell';
import { Category } from '@/types';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Layers, Droplet, Cpu, Zap, ArrowLeft, ChevronRight } from 'lucide-react';

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('active', true);
        
        if (data) {
          setCategories(data as Category[]);
        }
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'pods':
        return <Layers className="w-6 h-6 text-[#00ff66]" />;
      case 'juices':
        return <Droplet className="w-6 h-6 text-[#00ff66]" />;
      case 'coils':
        return <Cpu className="w-6 h-6 text-[#00ff66]" />;
      default:
        return <Zap className="w-6 h-6 text-[#00ff66]" />;
    }
  };

  const getCategoryStats = (slug: string) => {
    switch (slug) {
      case 'pods':
        return 'Dispositivos e Pods Descartáveis';
      case 'juices':
        return 'Essências Freebase e SaltNic';
      case 'coils':
        return 'Coils, Cartuchos e Reposição';
      default:
        return 'Baterias, Carregadores e Estojos';
    }
  };

  if (loading) {
    return (
      <MobileShell showHeader={false}>
        <div className="flex flex-col items-center justify-center py-40 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#00ff66] animate-spin mb-4" />
          <span className="font-cyber-orbitron text-[9px] font-black text-zinc-500 uppercase tracking-widest">
            CARREGANDO DEPARTAMENTOS...
          </span>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell showHeader={false}>
      {/* Top bar with back navigation */}
      <div className="flex items-center gap-3 mb-6 mt-2">
        <Link 
          href="/" 
          className="p-2 bg-[#0c0c0f] border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="font-cyber-orbitron text-[9px] font-black text-[#00ff66] tracking-widest block uppercase">
            [ DEPARTAMENTOS ]
          </span>
          <h1 className="font-cyber-orbitron text-base font-extrabold text-white uppercase tracking-wider">
            Categorias
          </h1>
        </div>
      </div>

      {/* Grid of tech-styled category blocks */}
      <div className="flex flex-col gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categoria/${cat.slug}`}
            className="group relative flex items-center justify-between p-4 bg-[#09090c] border border-zinc-800 hover:border-[#00ff66]/40 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,102,0.05)] cursor-pointer"
          >
            {/* Background design lines */}
            <div className="absolute top-0 right-0 w-16 h-[1px] bg-gradient-to-r from-transparent to-[#00ff66]/30 group-hover:to-[#00ff66]" />
            <div className="absolute bottom-0 left-0 w-16 h-[1px] bg-gradient-to-r from-[#00ff66]/30 to-transparent group-hover:from-[#00ff66]" />

            <div className="flex items-center gap-4">
              {/* Animated icon box */}
              <div className="w-12 h-12 rounded-xl bg-[#0c0c0f] border border-zinc-800 group-hover:border-[#00ff66]/30 flex items-center justify-center transition-all duration-300">
                <div className="group-hover:scale-110 transition-transform duration-300">
                  {getCategoryIcon(cat.slug)}
                </div>
              </div>

              <div>
                <h3 className="font-cyber-orbitron text-sm font-bold text-white group-hover:text-[#00ff66] transition-colors duration-200 uppercase tracking-wide">
                  {cat.name}
                </h3>
                <p className="font-cyber-inter text-[10px] text-zinc-500 font-medium">
                  {getCategoryStats(cat.slug)}
                </p>
              </div>
            </div>

            {/* Futuristic Chevron Button */}
            <div className="w-8 h-8 rounded-lg bg-[#0c0c0f] border border-zinc-800 group-hover:border-[#00ff66]/40 group-hover:bg-[#00ff66]/10 flex items-center justify-center transition-all duration-300">
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-[#00ff66] transition-colors duration-200" />
            </div>
          </Link>
        ))}
      </div>

      {/* Cyber design aesthetic box */}
      <div className="w-full border border-zinc-900 bg-[#060608] rounded-xl p-4 mt-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00ff66]" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00ff66]" />
        
        <p className="font-cyber-orbitron text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">
          // DIRETRIZ DE SEGURANÇA
        </p>
        <p className="font-cyber-inter text-[10px] text-zinc-400 leading-normal">
          Apenas produtos de procedência verificada. Todos os cartuchos e resistências contam com selo de autenticidade QR para verificação de originalidade.
        </p>
      </div>
    </MobileShell>
  );
}
