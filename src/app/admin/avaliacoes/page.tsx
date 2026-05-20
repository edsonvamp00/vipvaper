'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { MobileShell } from '@/components/common/MobileShell';
import { ArrowLeft, Check, Trash2, ShieldAlert, Sparkles, MessageSquare, Star } from 'lucide-react';
import Link from 'next/link';

interface ReviewWithProduct {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  approved: boolean;
  created_at: string;
  product?: {
    name: string;
    slug: string;
  };
}

export default function AdminReviewsPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Mock data for demo bypass
  const mockReviews: ReviewWithProduct[] = [
    {
      id: 'rev-1',
      product_id: 'p1',
      customer_name: 'Guilherme Souza',
      rating: 5,
      comment: 'ElfBarBC10000 sensacional! Gosto de melancia é perfeito, bem geladinho e dura muito.',
      approved: false,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      product: { name: 'ElfBar BC10000 Puffs - Watermelon Ice', slug: 'pod-descartavel-elfbar-bc10000-watermelon-ice' }
    },
    {
      id: 'rev-2',
      product_id: 'p2',
      customer_name: 'Clara Lima',
      rating: 4,
      comment: 'Cush Man da Nasty dispensa comentários. Sabor excelente de manga.',
      approved: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
      product: { name: 'Juice Nasty Salt Cush Man 30ml', slug: 'juice-nasty-salt-cush-man-mango-grape-30ml' }
    },
    {
      id: 'rev-3',
      product_id: 'p3',
      customer_name: 'Marcos André',
      rating: 5,
      comment: 'Aparelho Xros 4 Nano de metal é maravilhoso, visor digital circular é muito cyberpunk.',
      approved: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      product: { name: 'Vaporesso XROS 4 Nano Premium', slug: 'pod-system-vaporesso-xros-4-nano-premium' }
    }
  ];

  useEffect(() => {
    // Safety timeout — if anything hangs, just show the reviews after 3s
    const safetyTimeout = setTimeout(() => setLoading(false), 3000);

    supabase.auth.getSession().then(({ data }) => {
      clearTimeout(safetyTimeout);
      if (data.session?.user) {
        fetchReviews();
      } else {
        window.location.href = '/admin/login';
      }
    }).catch(() => {
      clearTimeout(safetyTimeout);
      window.location.href = '/admin/login';
    });

    return () => clearTimeout(safetyTimeout);
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Fetch reviews with joined product name
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          id,
          product_id,
          customer_name,
          rating,
          comment,
          approved,
          created_at,
          product:products(name, slug)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setReviews(data as any);
      }
    } catch (err) {
      console.error('Erro ao buscar avaliações:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    if (isDemo) {
      setTimeout(() => {
        setReviews(prev =>
          prev.map(rev => rev.id === id ? { ...rev, approved: true } : rev)
        );
        setActionLoading(null);
      }, 500);
      return;
    }

    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ approved: true })
        .eq('id', id);

      if (error) throw error;
      
      setReviews(prev =>
        prev.map(rev => rev.id === id ? { ...rev, approved: true } : rev)
      );
    } catch (err) {
      console.error('Erro ao aprovar avaliação:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este comentário de forma permanente?')) return;
    setActionLoading(id);
    if (isDemo) {
      setTimeout(() => {
        setReviews(prev => prev.filter(rev => rev.id !== id));
        setActionLoading(null);
      }, 500);
      return;
    }

    try {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setReviews(prev => prev.filter(rev => rev.id !== id));
    } catch (err) {
      console.error('Erro ao excluir avaliação:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingReviews = reviews.filter(rev => !rev.approved);
  const approvedReviews = reviews.filter(rev => rev.approved);

  return (
    <MobileShell showHeader={false} showBottomNav={false}>
      {/* Top bar with back to dash */}
      <div className="flex items-center gap-3 mb-6 mt-2">
        <Link 
          href="/admin/dashboard" 
          className="p-2 bg-[#0c0c0f] border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-cyber-orbitron font-black text-sm text-white uppercase tracking-wider">
            MODERAÇÃO
          </h1>
          <p className="font-cyber-inter text-[9px] text-zinc-500 font-semibold uppercase">
            Aprovação Manual de Avaliações
          </p>
        </div>
      </div>

      {isDemo && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-cyber-inter rounded-xl flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Operando em <b>Modo Demo</b>. Alterações salvas na memória local.</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-red-500 animate-spin mb-4" />
          <span className="font-cyber-orbitron text-[9px] font-black text-zinc-500 uppercase tracking-widest">
            CARREGANDO COMENTÁRIOS...
          </span>
        </div>
      ) : (
      <>
      {/* Seção 1: Pendentes */}
      <h3 className="font-cyber-orbitron text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-amber-500/10 pb-1.5">
        <ShieldAlert className="w-4 h-4" />
        Pendentes de Aprovação ({pendingReviews.length})
      </h3>

      {pendingReviews.length === 0 ? (
        <div className="p-4 bg-[#09090c] border border-zinc-950 rounded-xl text-center mb-6">
          <p className="font-cyber-inter text-[10px] text-zinc-500">
            Nenhuma avaliação aguardando moderação. Bom trabalho!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 mb-6">
          {pendingReviews.map((rev) => (
            <div 
              key={rev.id} 
              className="p-4 bg-[#09090c] border border-zinc-900 rounded-xl flex flex-col gap-2 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-2 h-full bg-amber-500/20" />
              
              {/* Product and Rating info */}
              <div className="flex flex-col mb-1 pr-4">
                <span className="text-[8px] font-cyber-orbitron text-[#00f0ff] uppercase tracking-wider font-bold">
                  {rev.product?.name ?? 'Produto Desconhecido'}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-cyber-orbitron text-[10px] font-black text-white">{rev.customer_name}</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-2.5 h-2.5 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-800'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Comment text */}
              <p className="font-cyber-inter text-[11px] text-zinc-400 leading-relaxed italic bg-black/30 p-2.5 rounded-lg border border-zinc-900/60">
                "{rev.comment}"
              </p>

              {/* Actions row */}
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-zinc-900/50">
                <span className="text-[8px] font-cyber-orbitron text-zinc-600">
                  {new Date(rev.created_at).toLocaleString('pt-BR')}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(rev.id)}
                    disabled={actionLoading !== null}
                    className="p-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer"
                    title="Excluir Comentário"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleApprove(rev.id)}
                    disabled={actionLoading !== null}
                    className="px-3 py-1.5 rounded-lg bg-[#00ff66]/10 border border-[#00ff66]/20 text-[#00ff66] hover:bg-[#00ff66]/20 font-cyber-orbitron font-bold text-[9px] tracking-wider uppercase flex items-center gap-1 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,255,102,0.05)]"
                  >
                    <Check className="w-3 h-3" />
                    APROVAR
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Seção 2: Aprovados */}
      <h3 className="font-cyber-orbitron text-[10px] font-black text-[#00ff66] uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-[#00ff66]/10 pb-1.5">
        <MessageSquare className="w-4 h-4 text-[#00ff66]" />
        Avaliações Aprovadas ({approvedReviews.length})
      </h3>

      {approvedReviews.length === 0 ? (
        <div className="p-4 bg-[#09090c] border border-zinc-950 rounded-xl text-center">
          <p className="font-cyber-inter text-[10px] text-zinc-500">
            Nenhuma avaliação aprovada no momento.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {approvedReviews.map((rev) => (
            <div 
              key={rev.id} 
              className="p-4 bg-[#09090c] border border-zinc-900 rounded-xl flex flex-col gap-2 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-2 h-full bg-[#00ff66]/10" />
              
              {/* Product and Rating info */}
              <div className="flex flex-col mb-1 pr-4">
                <span className="text-[8px] font-cyber-orbitron text-zinc-500 uppercase tracking-wider font-bold">
                  {rev.product?.name ?? 'Produto Desconhecido'}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-cyber-orbitron text-[10px] font-black text-[#00ff66]">{rev.customer_name}</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-2.5 h-2.5 ${i < rev.rating ? 'text-[#00ff66] fill-[#00ff66]' : 'text-zinc-800'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Comment text */}
              <p className="font-cyber-inter text-[11px] text-zinc-400 leading-relaxed bg-black/10 p-2.5 rounded-lg border border-zinc-900/40">
                "{rev.comment}"
              </p>

              {/* Actions row */}
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-zinc-900/40">
                <span className="text-[8px] font-cyber-orbitron text-zinc-600">
                  {new Date(rev.created_at).toLocaleString('pt-BR')}
                </span>

                <button
                  onClick={() => handleDelete(rev.id)}
                  disabled={actionLoading !== null}
                  className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 font-cyber-orbitron font-bold text-[8px] tracking-wider uppercase flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  REMOVER
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </>
      )}
    </MobileShell>
  );
}
