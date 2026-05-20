'use client';

import React, { useState, useEffect, use } from 'react';
import { MobileShell } from '@/components/common/MobileShell';
import { MOCK_PRODUCTS } from '@/lib/mockData';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Heart, ShoppingBag, ShieldCheck, Zap, Plus, Minus, ArrowRight, Star, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ProdutoPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProdutoDetalhePage({ params }: ProdutoPageProps) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [added, setAdded] = useState(false);
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loadingProduct, setLoadingProduct] = useState(true);

  // Fetch product from Supabase by slug
  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, category:categories(*), product_images(*)')
          .eq('slug', slug)
          .single();

        if (error || !data) {
          // Fallback to mock
          const mockProduct = MOCK_PRODUCTS.find((p) => p.slug === slug);
          setProduct(mockProduct);
        } else {
          setProduct(data as Product);
        }
      } catch (err) {
        console.error('Erro ao buscar produto:', err);
        const mockProduct = MOCK_PRODUCTS.find((p) => p.slug === slug);
        setProduct(mockProduct);
      } finally {
        setLoadingProduct(false);
      }
    }
    fetchProduct();
  }, [slug]);

  // States for Reviews
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [formName, setFormName] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Fetch approved reviews from Supabase
  useEffect(() => {
    if (!product) return;
    const productId = product.id;
    async function fetchReviews() {
      try {
        const { data, error } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('product_id', productId)
          .eq('approved', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setReviews(data);
      } catch (err) {
        console.error('Erro ao carregar avaliações:', err);
      } finally {
        setLoadingReviews(false);
      }
    }
    fetchReviews();
  }, [product]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formComment.trim() || !product) return;

    setSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: product.id,
          customer_name: formName,
          rating: formRating,
          comment: formComment,
          approved: false // Enforce admin moderation by default!
        });

      if (error) throw error;

      setSubmitStatus('success');
      setFormName('');
      setFormComment('');
      setFormRating(5);
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err);
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  // Sync favorites on mount
  useEffect(() => {
    if (!product) return;
    try {
      const storedFavorites = localStorage.getItem('vip_vaper_favorites');
      if (storedFavorites) {
        const favoritesArray: string[] = JSON.parse(storedFavorites);
        setIsFavorite(favoritesArray.includes(product.id));
      }
    } catch (e) {
      console.error(e);
    }
  }, [product]);

  // Handle toggle favorite
  const toggleFavorite = () => {
    if (!product) return;
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
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product) {
    return (
      <MobileShell showHeader={false}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="font-cyber-orbitron text-sm font-black text-red-500 uppercase tracking-widest mb-2">
            PRODUTO INEXISTENTE
          </h2>
          <p className="font-cyber-inter text-[11px] text-zinc-400 max-w-[200px] mb-6">
            O produto solicitado não foi localizado em nossos servidores.
          </p>
          <Link
            href="/"
            className="font-cyber-orbitron text-[10px] font-black px-4 py-2 border border-[#00ff66] text-[#00ff66] bg-[#00ff66]/5 rounded-lg uppercase tracking-wider hover:bg-[#00ff66]/10"
          >
            [ VOLTAR AO INÍCIO ]
          </Link>
        </div>
      </MobileShell>
    );
  }

  const hasDiscount = product.promo_price !== null && product.promo_price !== undefined && product.promo_price > 0;
  const displayPrice = hasDiscount ? product.promo_price! : product.price;
  const mainImage = product.product_images?.find((img) => img.is_main)?.image_url ?? '/placeholder.png';

  return (
    <MobileShell showHeader={false}>
      {/* 1. Floating Top Actions */}
      <div className="flex items-center justify-between mb-4 mt-2">
        <Link 
          href="/" 
          className="p-2 bg-[#0c0c0f] border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <button 
          onClick={toggleFavorite}
          className="p-2 bg-[#0c0c0f] border border-zinc-800 rounded-xl text-zinc-400 hover:text-red-500 transition-colors duration-200"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      {/* 2. Sleek Product Image Gallery */}
      <div className="w-full aspect-square rounded-2xl border border-zinc-900 bg-[#07070a] relative overflow-hidden flex items-center justify-center mb-6">
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#00ff66]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#00ff66]" />
        
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        
        {hasDiscount && (
          <span className="absolute bottom-4 left-4 bg-red-500 text-white font-cyber-orbitron text-[9px] font-black tracking-widest px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            [ PROMOÇÃO ]
          </span>
        )}
      </div>

      {/* 3. Product Info Block */}
      <div className="flex flex-col mb-6">
        <span className="text-[10px] uppercase font-cyber-orbitron tracking-widest text-[#00f0ff] mb-1 font-bold">
          {product.category?.name ?? 'Dispositivo'}
        </span>
        <h1 className="font-cyber-inter font-extrabold text-xl text-white leading-tight mb-2">
          {product.name}
        </h1>

        {/* Stock status indicator */}
        <div className="flex items-center gap-2 mb-4">
          {product.stock > 0 ? (
            <span className="flex items-center gap-1.5 bg-[#00ff66]/10 border border-[#00ff66]/20 text-[#00ff66] font-cyber-orbitron text-[9px] font-bold px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 bg-[#00ff66] rounded-full cyber-pulse-dot" />
              EM ESTOQUE ({product.stock} UNID.)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 font-cyber-orbitron text-[9px] font-bold px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              ESGOTADO
            </span>
          )}
          <span className="flex items-center gap-1 bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[#00f0ff] font-cyber-orbitron text-[9px] font-bold px-2 py-0.5 rounded">
            100% ORIGINAL
          </span>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-3 mb-6 p-4 bg-[#09090c] border border-zinc-800 rounded-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-r from-transparent to-[#00ff66]/5 pointer-events-none" />
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-xs text-zinc-500 line-through tracking-wide mb-0.5">
                De: R$ {product.price.toFixed(2)}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="font-cyber-orbitron text-[11px] text-zinc-400 font-bold uppercase">R$</span>
              <span className="font-cyber-orbitron text-2xl font-black text-[#00ff66] tracking-tight leading-none">
                {displayPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Tech Features List */}
        <h3 className="font-cyber-orbitron text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-[#00ff66]" />
          Especificações Técnicas
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-[#0c0c0f] border border-zinc-900 rounded-lg">
            <span className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-0.5">Destaque</span>
            <span className="text-[10px] font-cyber-inter font-semibold text-zinc-300">
              {product.short_description.split(',')[0] || 'Original'}
            </span>
          </div>
          <div className="p-3 bg-[#0c0c0f] border border-zinc-900 rounded-lg">
            <span className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-0.5">Teor de Nicotina</span>
            <span className="text-[10px] font-cyber-inter font-semibold text-zinc-300">
              {product.short_description.split(',')[1] || 'Variaível'}
            </span>
          </div>
        </div>

        {/* Full Description */}
        <h3 className="font-cyber-orbitron text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2.5">
          Descrição Detalhada
        </h3>
        <p className="font-cyber-inter text-[11px] text-zinc-400 leading-relaxed mb-6">
          {product.description}
        </p>

        {/* Warranty Badge */}
        <div className="flex items-start gap-3 p-4 bg-[#09090c] border border-[#00f0ff]/10 rounded-xl mb-6">
          <ShieldCheck className="w-6 h-6 text-[#00f0ff] shrink-0 mt-0.5" />
          <div>
            <h4 className="font-cyber-orbitron text-[9px] font-black text-[#00f0ff] uppercase tracking-wider mb-1">
              AUTENTICIDADE GARANTIDA VIP VAPER
            </h4>
            <p className="font-cyber-inter text-[10px] text-zinc-500 leading-relaxed">
              Todos os nossos insumos acompanham código de barras autenticável. Não compre falsificações que arriscam sua saúde.
            </p>
          </div>
        </div>

        {/* 5. Comentários e Avaliações (Product Reviews) */}
        <div className="border-t border-zinc-900 pt-6 mb-24">
          <h3 className="font-cyber-orbitron text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#00ff66]" />
            Avaliações ({reviews.length})
          </h3>

          {/* Lista de Avaliações */}
          {loadingReviews ? (
            <div className="space-y-3 mb-6">
              <div className="h-16 w-full bg-[#09090c] border border-zinc-900 rounded-xl animate-pulse" />
              <div className="h-16 w-full bg-[#09090c] border border-zinc-900 rounded-xl animate-pulse" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-4 rounded-xl border border-zinc-900 bg-[#09090c]/40 text-center mb-6">
              <p className="font-cyber-inter text-[11px] text-zinc-500">
                Nenhum comentário aprovado ainda. Seja o primeiro a opinar!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5 mb-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-3.5 bg-[#09090c] border border-zinc-900 rounded-xl flex flex-col gap-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-cyber-orbitron text-[10px] font-black text-zinc-300 uppercase tracking-wider">
                      {rev.customer_name}
                    </span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < rev.rating ? 'text-[#00ff66] fill-[#00ff66] shadow-[0_0_8px_#00ff66]' : 'text-zinc-700'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="font-cyber-inter text-[11px] text-zinc-400 leading-relaxed">
                    {rev.comment}
                  </p>
                  <span className="text-[8px] font-cyber-orbitron text-zinc-600 block self-end">
                    {new Date(rev.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Formulário para Deixar Avaliação */}
          <div className="p-4 bg-[#09090c] border border-zinc-900 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-1 bg-[#00ff66]/10" />
            
            <h4 className="font-cyber-orbitron text-[10px] font-black text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              [ AVALIAR ESTE PRODUTO ]
            </h4>

            {submitStatus === 'success' ? (
              <div className="p-3.5 bg-[#00ff66]/10 border border-[#00ff66]/20 text-[#00ff66] rounded-xl flex flex-col gap-1.5 mb-2">
                <span className="font-cyber-orbitron text-[9px] font-black uppercase tracking-widest">[ SUCESSO ]</span>
                <p className="font-cyber-inter text-[10px] leading-relaxed font-semibold">
                  Sua avaliação foi enviada! Ela ficará visível assim que for liberada pelo administrador da loja.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {submitStatus === 'error' && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 font-cyber-orbitron text-[9px] font-black uppercase rounded-lg">
                    Erro ao enviar avaliação. Tente novamente.
                  </div>
                )}
                
                {/* Nome */}
                <div>
                  <label className="block text-[8px] font-cyber-orbitron text-zinc-500 uppercase mb-1 font-bold">
                    Seu Nome ou Apelido
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: João Silva"
                    className="w-full bg-[#0c0c0f] border border-zinc-800 focus:border-[#00ff66]/40 focus:ring-1 focus:ring-[#00ff66]/20 text-zinc-300 rounded-lg p-2.5 text-[10px] font-cyber-inter outline-none transition-all"
                  />
                </div>

                {/* Nota em Estrelas Interativa */}
                <div>
                  <label className="block text-[8px] font-cyber-orbitron text-zinc-500 uppercase mb-1 font-bold">
                    Sua Nota
                  </label>
                  <div className="flex gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        className="focus:outline-none transition-all duration-200"
                        aria-label={`Avaliar com ${star} estrelas`}
                      >
                        <Star 
                          className={`w-6 h-6 ${
                            star <= formRating 
                              ? 'text-[#00ff66] fill-[#00ff66] drop-shadow-[0_0_8px_rgba(0,255,102,0.4)]' 
                              : 'text-zinc-800'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comentário */}
                <div>
                  <label className="block text-[8px] font-cyber-orbitron text-zinc-500 uppercase mb-1 font-bold">
                    Comentário
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Diga o que achou da entrega, do sabor e do aparelho..."
                    className="w-full bg-[#0c0c0f] border border-zinc-800 focus:border-[#00ff66]/40 focus:ring-1 focus:ring-[#00ff66]/20 text-zinc-300 rounded-lg p-2.5 text-[10px] font-cyber-inter outline-none resize-none transition-all"
                  />
                </div>

                {/* Botão de Envio */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-[#00ff66]/10 border border-[#00ff66]/30 hover:border-[#00ff66] hover:bg-[#00ff66]/20 text-[#00ff66] rounded-xl font-cyber-orbitron font-black text-[9px] tracking-widest uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'ENVIANDO...' : 'ENVIAR COMENTÁRIO'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 4. Sticky Bottom Buy Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#020203]/95 border-t border-zinc-900 p-4 pb-6 z-50">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {/* Quantity selector */}
          <div className="flex items-center bg-[#0c0c0f] border border-zinc-800 rounded-xl p-1">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              disabled={product.stock === 0}
              className="p-2 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Diminuir quantidade"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center font-cyber-orbitron text-xs font-black text-white">
              {qty}
            </span>
            <button
              onClick={() => setQty(product.stock > 0 ? Math.min(product.stock, qty + 1) : qty + 1)}
              disabled={product.stock === 0}
              className="p-2 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Aumentar quantidade"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Core Checkout Call-to-action */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`flex-1 py-3 px-4 rounded-xl font-cyber-orbitron font-black text-[11px] tracking-wider uppercase flex items-center justify-center gap-2 border transition-all duration-300 ${
              product.stock === 0
                ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                : added
                ? 'bg-[#00ff66]/20 border-[#00ff66] text-[#00ff66] shadow-[0_0_20px_rgba(0,255,102,0.2)]'
                : 'bg-[#00ff66] border-[#00ff66] text-black hover:bg-[#00ff66]/90 shadow-[0_0_25px_rgba(0,255,102,0.15)] hover:shadow-[0_0_35px_rgba(0,255,102,0.35)]'
            }`}
          >
            {product.stock === 0 ? (
              'PRODUTO ESGOTADO'
            ) : added ? (
              'ADICIONADO!'
            ) : (
              <>
                ADICIONAR AO CARRINHO
                <ArrowRight className="w-4 h-4 text-black font-black" />
              </>
            )}
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
