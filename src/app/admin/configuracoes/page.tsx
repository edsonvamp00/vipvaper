'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { MobileShell } from '@/components/common/MobileShell';
import Link from 'next/link';
import { ArrowLeft, Save, ShieldAlert, Check, HelpCircle, AlertTriangle } from 'lucide-react';

interface StoreSettings {
  storeName: string;
  pixKey: string;
  pixReceiver: string;
  whatsappNumber: string;
  whatsappMessage: string;
  deliveryFee: number;
}

export default function AdminSettingsPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'VIPVIPER',
    pixKey: '00000000000000000000000000000000',
    pixReceiver: 'VipViper Inc.',
    whatsappNumber: '5511999999999',
    whatsappMessage: 'Olá! Vim do site VipViper e gostaria de finalizar meu pedido.',
    deliveryFee: 20.00
  });

  useEffect(() => {
    // Safety timeout — if anything hangs, just show the settings after 3s
    const safetyTimeout = setTimeout(() => setLoading(false), 3000);

    supabase.auth.getSession().then(({ data }) => {
      clearTimeout(safetyTimeout);
      if (data.session?.user) {
        loadSupabaseSettings();
      } else {
        window.location.href = '/admin/login';
      }
    }).catch(() => {
      clearTimeout(safetyTimeout);
      window.location.href = '/admin/login';
    });

    return () => clearTimeout(safetyTimeout);
  }, []);

  const loadLocalSettings = () => {
    try {
      const stored = localStorage.getItem('vip_vaper_store_settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      } else {
        localStorage.setItem('vip_vaper_store_settings', JSON.stringify(settings));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadSupabaseSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('store_settings')
        .select('*');

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Parse keys
        const mappedSettings = { ...settings };
        data.forEach(item => {
          if (item.key in mappedSettings) {
            // @ts-ignore
            mappedSettings[item.key] = item.key === 'deliveryFee' ? Number(item.value) : item.value;
          }
        });
        setSettings(mappedSettings);
      } else {
        loadLocalSettings();
      }
    } catch (err) {
      console.error('Erro ao carregar configurações do Supabase, usando local:', err);
      setIsDemo(true);
      loadLocalSettings();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDemo) {
      localStorage.setItem('vip_vaper_store_settings', JSON.stringify(settings));
      alert('Configurações salvas localmente (Modo Demo)');
      return;
    }

    try {
      setLoading(true);
      
      // Upsert to store_settings table in Supabase
      const promises = Object.entries(settings).map(([key, val]) => {
        return supabase
          .from('store_settings')
          .upsert({
            key,
            value: String(val),
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
      });

      const results = await Promise.all(promises);
      const errors = results.filter(res => res.error);
      
      if (errors.length > 0) {
        throw new Error('Alguns registros não puderam ser salvos.');
      }

      alert('Configurações da loja salvas com sucesso no Supabase!');
    } catch (err: any) {
      alert('Erro ao salvar no Supabase, salvando localmente: ' + err.message);
      localStorage.setItem('vip_vaper_store_settings', JSON.stringify(settings));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MobileShell showHeader={false} showBottomNav={false}>
        <div className="flex flex-col items-center justify-center py-40">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-red-500 animate-spin mb-4" />
          <span className="font-cyber-orbitron text-[9px] font-black text-zinc-500 uppercase tracking-widest">
            CARREGANDO PARÂMETROS...
          </span>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell showHeader={false} showBottomNav={false}>
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 mt-2">
        <Link 
          href="/admin/dashboard" 
          className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-cyber-orbitron text-[9px] font-black tracking-widest uppercase">VOLTAR</span>
        </Link>
        <span className="font-cyber-orbitron font-black text-xs tracking-wider text-white">
          VIP<span className="text-red-500">CONFIGS</span>
        </span>
      </div>

      {isDemo && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[9px] font-cyber-inter rounded-lg mb-4 text-center">
          Operando em <b>Modo Demonstração</b> com dados locais.
        </div>
      )}

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="flex flex-col gap-4 pb-12">
        
        {/* Core Settings Block */}
        <div className="bg-[#09090c] border border-zinc-900 rounded-2xl p-5 flex flex-col gap-4 relative">
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-red-500" />
          
          <h3 className="font-cyber-orbitron text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-2">
            Configurações Gerais
          </h3>

          <div>
            <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Nome da Loja</label>
            <input
              type="text"
              required
              value={settings.storeName}
              onChange={(e) => setSettings({...settings, storeName: e.target.value})}
              className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500/30 font-cyber-inter"
              placeholder="VIPVIPER"
            />
          </div>

          <div>
            <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Telefone Suporte WhatsApp (Código do País + DDD + Número)</label>
            <input
              type="text"
              required
              value={settings.whatsappNumber}
              onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})}
              className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500/30 font-cyber-inter"
              placeholder="Ex: 5511999999999"
            />
            <span className="text-[8px] text-zinc-500 font-cyber-inter mt-1 block">Não coloque espaços, parênteses ou traços. Apenas números!</span>
          </div>

          <div>
            <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Taxa de Entrega Local Padrão (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              value={settings.deliveryFee}
              onChange={(e) => setSettings({...settings, deliveryFee: parseFloat(e.target.value)})}
              className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500/30 font-cyber-inter"
              placeholder="20.00"
            />
          </div>
        </div>

        {/* Finance Settings Block */}
        <div className="bg-[#09090c] border border-zinc-900 rounded-2xl p-5 flex flex-col gap-4 relative">
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-red-500" />
          
          <h3 className="font-cyber-orbitron text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-2">
            Configurações de Recebimento (PIX)
          </h3>

          <div>
            <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Chave Copia e Cola PIX Padrão</label>
            <textarea
              rows={2}
              required
              value={settings.pixKey}
              onChange={(e) => setSettings({...settings, pixKey: e.target.value})}
              className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500/30 font-cyber-inter resize-none"
              placeholder="Sua chave pix copia e cola para exibição"
            />
            <span className="text-[8px] text-zinc-500 font-cyber-inter mt-1 block">Insira o código Pix Estático ou sua chave para o cliente copiar no checkout.</span>
          </div>

          <div>
            <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Nome do Recebedor PIX (Exibição)</label>
            <input
              type="text"
              required
              value={settings.pixReceiver}
              onChange={(e) => setSettings({...settings, pixReceiver: e.target.value})}
              className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500/30 font-cyber-inter"
              placeholder="Fulano de Tal Ltda."
            />
          </div>
        </div>

        {/* Save button block */}
        <button
          type="submit"
          className="w-full py-3.5 px-4 rounded-xl bg-red-500 border border-red-500 text-white font-cyber-orbitron font-black text-[11px] tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.3)] transition-all duration-300 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          SALVAR CONFIGURAÇÕES DA LOJA
        </button>

      </form>
    </MobileShell>
  );
}
