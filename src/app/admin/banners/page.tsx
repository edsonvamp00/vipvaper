'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { MobileShell } from '@/components/common/MobileShell';
import { ArrowLeft, Trash2, ShieldAlert, Sparkles, Image, Plus, Link as LinkIcon, Layers, Save, Eye } from 'lucide-react';
import Link from 'next/link';
import { Banner } from '@/types';

export default function AdminBannersPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('/categoria/pods');
  const [position, setPosition] = useState(0);
  const [active, setActive] = useState(true);

  // Suggested high quality cyberpunk vapor Unsplash images to select or customize
  const IMAGE_SUGGESTIONS = [
    { name: 'ElfBarBC melancia', url: 'https://images.unsplash.com/photo-1559583985-c80d8ad9b29f?w=1200&auto=format&fit=crop&q=80' },
    { name: 'Nasty Manga', url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1200&auto=format&fit=crop&q=80' },
    { name: 'Vaporesso XROS', url: 'https://images.unsplash.com/photo-1613141411244-0e4ac259d217?w=1200&auto=format&fit=crop&q=80' },
    { name: 'Coils em Mesh', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80' },
  ];

  // Fallbacks if Supabase table is empty
  const mockBanners: Banner[] = [
    {
      id: 'fb1',
      title: 'NOVA GERAÇÃO ELFBAR',
      subtitle: 'Nuvens de sabor intenso e displays digitais de e-líquido.',
      image_url: 'https://images.unsplash.com/photo-1559583985-c80d8ad9b29f?w=1200&auto=format&fit=crop&q=80',
      link_url: '/categoria/pods',
      active: true,
      position: 0,
      created_at: ''
    },
    {
      id: 'fb2',
      title: 'NASTY JUICE CUSH MAN',
      subtitle: 'O autêntico sabor frutado da manga com uva e sal de nicotina.',
      image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1200&auto=format&fit=crop&q=80',
      link_url: '/categoria/juices',
      active: true,
      position: 1,
      created_at: ''
    }
  ];

  useEffect(() => {
    // Safety timeout — if anything hangs, just show the banners after 3s
    const safetyTimeout = setTimeout(() => setLoading(false), 3000);

    supabase.auth.getSession().then(({ data }) => {
      clearTimeout(safetyTimeout);
      if (data.session?.user) {
        fetchBanners();
      } else {
        window.location.href = '/admin/login';
      }
    }).catch(() => {
      clearTimeout(safetyTimeout);
      window.location.href = '/admin/login';
    });

    return () => clearTimeout(safetyTimeout);
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      if (data) {
        setBanners(data);
      }
    } catch (err) {
      console.error('Erro ao carregar banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    if (banners.length >= 5) {
      alert('Limite de 5 banners alcançado! Remova um banner existente para poder adicionar um novo.');
      return;
    }

    setSubmitting(true);

    const newBannerObj = {
      title: title.trim() || null,
      subtitle: subtitle.trim() || null,
      image_url: imageUrl.trim(),
      link_url: linkUrl.trim() || null,
      position: Number(position),
      active: active
    };

    if (isDemo) {
      setTimeout(() => {
        const mockNewBanner: Banner = {
          id: `fb-added-${Date.now()}`,
          created_at: new Date().toISOString(),
          ...newBannerObj
        };
        setBanners(prev => [...prev, mockNewBanner].sort((a, b) => a.position - b.position));
        setSubmitting(false);
        // Clear fields
        setTitle('');
        setSubtitle('');
        setImageUrl('');
        setLinkUrl('/categoria/pods');
        setPosition(banners.length + 1);
      }, 500);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('banners')
        .insert(newBannerObj)
        .select();

      if (error) throw error;
      
      if (data) {
        setBanners(prev => [...prev, data[0]].sort((a, b) => a.position - b.position));
      }
      
      // Clear fields
      setTitle('');
      setSubtitle('');
      setImageUrl('');
      setLinkUrl('/categoria/pods');
      setPosition(banners.length + 1);
    } catch (err) {
      console.error('Erro ao adicionar banner:', err);
      alert('Ocorreu um erro ao salvar o banner. Verifique se o seu banco de dados Supabase foi devidamente iniciado.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Tem certeza absoluta de que deseja excluir este banner?')) return;
    
    setActionLoading(id);

    if (isDemo) {
      setTimeout(() => {
        setBanners(prev => prev.filter(b => b.id !== id));
        setActionLoading(null);
      }, 500);
      return;
    }

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBanners(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Erro ao deletar banner:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleBannerActive = async (id: string, currentStatus: boolean) => {
    setActionLoading(id);
    const newStatus = !currentStatus;

    if (isDemo) {
      setTimeout(() => {
        setBanners(prev =>
          prev.map(b => b.id === id ? { ...b, active: newStatus } : b)
        );
        setActionLoading(null);
      }, 400);
      return;
    }

    try {
      const { error } = await supabase
        .from('banners')
        .update({ active: newStatus })
        .eq('id', id);

      if (error) throw error;

      setBanners(prev =>
        prev.map(b => b.id === id ? { ...b, active: newStatus } : b)
      );
    } catch (err) {
      console.error('Erro ao alterar status do banner:', err);
    } finally {
      setActionLoading(null);
    }
  };

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
            BANNERS HOME
          </h1>
          <p className="font-cyber-inter text-[9px] text-zinc-500 font-semibold uppercase">
            Carrossel Promocional (Máx 5 Banners)
          </p>
        </div>
      </div>

      {isDemo && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-cyber-inter rounded-xl flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Operando em <b>Modo Demo</b>. Alterações salvas em memória de tela.</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#00ff66] animate-spin mb-4" />
          <span className="font-cyber-orbitron text-[9px] font-black text-zinc-500 uppercase tracking-widest">
            CARREGANDO BANNERS...
          </span>
        </div>
      ) : (
      <>

      {/* Seção 1: Adicionar Novo Banner (Apenas se menor que 5) */}
      <div className="mb-6 p-4 bg-[#09090c] border border-zinc-900 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#00ff66]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#00ff66]" />
        
        <h3 className="font-cyber-orbitron text-[10px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-[#00ff66]" />
          Novo Banner ({banners.length}/5)
        </h3>

        {banners.length >= 5 ? (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-cyber-inter rounded-lg">
            <b>Limite de 5 banners atingido!</b> Delete algum banner do carrossel para poder adicionar novos designs promocionais.
          </div>
        ) : (
          <form onSubmit={handleAddBanner} className="space-y-3.5">
            {/* Título */}
            <div>
              <label className="block text-[8px] font-cyber-orbitron text-zinc-500 uppercase mb-1 font-bold">Título Principal</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: NOVA GERAÇÃO ELFBAR"
                className="w-full bg-[#0c0c0f] border border-zinc-800 focus:border-[#00ff66]/40 focus:ring-1 focus:ring-[#00ff66]/20 text-zinc-300 rounded-lg p-2 text-[10px] font-cyber-inter outline-none transition-all"
              />
            </div>

            {/* Subtítulo */}
            <div>
              <label className="block text-[8px] font-cyber-orbitron text-zinc-500 uppercase mb-1 font-bold">Subtítulo (Legenda)</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ex: Nuvens de sabor intenso e displays digitais inovadores."
                className="w-full bg-[#0c0c0f] border border-zinc-800 focus:border-[#00ff66]/40 focus:ring-1 focus:ring-[#00ff66]/20 text-zinc-300 rounded-lg p-2 text-[10px] font-cyber-inter outline-none transition-all"
              />
            </div>

            {/* URL da Imagem */}
            <div>
              <label className="block text-[8px] font-cyber-orbitron text-zinc-500 uppercase mb-1 font-bold">URL da Imagem Promocional</label>
              <div className="relative">
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Cole o link da foto (Unsplash ou Supabase Storage)"
                  className="w-full bg-[#0c0c0f] border border-zinc-800 focus:border-[#00ff66]/40 focus:ring-1 focus:ring-[#00ff66]/20 text-zinc-300 rounded-lg p-2 pl-8 text-[10px] font-cyber-inter outline-none transition-all"
                />
                <Image className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
              </div>
              
              {/* Sugestões rápidas de fotos da internet para facilitar */}
              <div className="mt-2">
                <span className="text-[7.5px] font-cyber-orbitron text-zinc-600 block mb-1">FOTOS SUGERIDAS (CLIQUE PARA AUTO-COMPLETAR):</span>
                <div className="flex flex-wrap gap-1.5">
                  {IMAGE_SUGGESTIONS.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImageUrl(img.url)}
                      className="px-2 py-0.5 border border-zinc-800 bg-[#0c0c0f] hover:border-[#00ff66]/30 text-zinc-400 hover:text-white rounded text-[7.5px] font-cyber-orbitron"
                    >
                      {img.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid 2 campos: link e ordem */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[8px] font-cyber-orbitron text-zinc-500 uppercase mb-1 font-bold">Link do Banner</label>
                <div className="relative">
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="Ex: /categoria/pods"
                    className="w-full bg-[#0c0c0f] border border-zinc-800 focus:border-[#00ff66]/40 focus:ring-1 focus:ring-[#00ff66]/20 text-zinc-300 rounded-lg p-2 pl-8 text-[10px] font-cyber-inter outline-none transition-all"
                  />
                  <LinkIcon className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-cyber-orbitron text-zinc-500 uppercase mb-1 font-bold">Ordem Posição</label>
                <div className="relative">
                  <input
                    type="number"
                    value={position}
                    onChange={(e) => setPosition(Number(e.target.value))}
                    min={0}
                    max={10}
                    className="w-full bg-[#0c0c0f] border border-zinc-800 focus:border-[#00ff66]/40 focus:ring-1 focus:ring-[#00ff66]/20 text-zinc-300 rounded-lg p-2 pl-8 text-[10px] font-cyber-inter outline-none transition-all"
                  />
                  <Layers className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                </div>
              </div>
            </div>

            {/* Toggle active */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#00ff66] bg-[#0c0c0f] border border-zinc-800 rounded"
              />
              <label htmlFor="active" className="text-[9px] font-cyber-orbitron text-zinc-400 uppercase font-bold cursor-pointer select-none">
                Banner Ativo no Carrossel
              </label>
            </div>

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 bg-[#00ff66] hover:bg-[#00ff66]/90 text-black font-cyber-orbitron font-black text-[9px] tracking-widest uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,102,0.1)] cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {submitting ? 'SALVANDO BANNER...' : 'ADICIONAR AO CARROSSEL'}
            </button>
          </form>
        )}
      </div>

      {/* Seção 2: Feed/List de Banners Atuais */}
      <h3 className="font-cyber-orbitron text-[10px] font-black text-[#00ff66] uppercase tracking-widest mb-3.5 flex items-center gap-1.5 border-b border-[#00ff66]/10 pb-1.5">
        <Eye className="w-4 h-4 text-[#00ff66]" />
        Banners Ativos ({banners.length})
      </h3>

      {banners.length === 0 ? (
        <div className="p-4 bg-[#09090c] border border-zinc-950 rounded-xl text-center">
          <p className="font-cyber-inter text-[10px] text-zinc-500">
            Nenhum banner cadastrado no carrossel de ofertas.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mb-8">
          {banners.map((b) => (
            <div 
              key={b.id} 
              className="p-3 bg-[#09090c] border border-zinc-900 rounded-xl flex flex-col gap-3 relative overflow-hidden"
            >
              {/* Image Preview Banner */}
              <div className="w-full aspect-[21/9] rounded-lg overflow-hidden relative border border-zinc-950 bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.image_url}
                  alt={b.title ?? 'Banner'}
                  className={`w-full h-full object-cover ${b.active ? 'brightness-50' : 'brightness-[0.2] grayscale'}`}
                />
                
                {/* Overlay Text */}
                <div className="absolute inset-0 p-3 flex flex-col justify-end">
                  <span className="w-fit px-1 bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] font-cyber-orbitron text-[7px] font-black tracking-widest rounded mb-0.5 uppercase">
                    [ ORDEM: {b.position} ]
                  </span>
                  <h4 className="font-cyber-orbitron text-xs font-black text-white leading-none mb-0.5">{b.title ?? 'Sem Título'}</h4>
                  <p className="font-cyber-inter text-[8px] text-zinc-400 line-clamp-1 max-w-[90%]">{b.subtitle}</p>
                </div>

                {!b.active && (
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-500/25 border border-red-500/40 text-red-400 font-cyber-orbitron text-[7.5px] font-bold rounded">
                    INATIVO
                  </span>
                )}
              </div>

              {/* Banner Details & Action controls */}
              <div className="flex items-center justify-between border-t border-zinc-900/50 pt-2 pb-0.5">
                <div className="flex flex-col">
                  <span className="text-[7.5px] font-cyber-orbitron text-zinc-600 uppercase font-black">LINK REDIRECIONAMENTO</span>
                  <span className="text-[9px] font-cyber-inter font-semibold text-[#00f0ff]">{b.link_url ?? '/'}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Toggle */}
                  <button
                    onClick={() => toggleBannerActive(b.id, b.active)}
                    disabled={actionLoading !== null}
                    className={`px-2.5 py-1 rounded-lg font-cyber-orbitron font-bold text-[8px] tracking-wider uppercase border transition-all cursor-pointer ${
                      b.active 
                        ? 'bg-[#00ff66]/10 border-[#00ff66]/20 text-[#00ff66] hover:bg-[#00ff66]/20' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                    }`}
                  >
                    {b.active ? 'DESATIVAR' : 'ATIVAR'}
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteBanner(b.id)}
                    disabled={actionLoading !== null}
                    className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
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
