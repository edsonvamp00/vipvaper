'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { MobileShell } from '@/components/common/MobileShell';
import Link from 'next/link';
import { DollarSign, ShoppingBag, ClipboardList, Layers, ArrowLeft, LogOut, ExternalLink, Activity, ArrowRight, Sparkles } from 'lucide-react';

interface MockAdminOrder {
  id: string;
  customer: string;
  itemsCount: number;
  total: number;
  status: 'pending' | 'preparing' | 'shipped' | 'completed' | 'cancelled';
  time: string;
}

export default function AdminDashboardPage() {
  const { signOut, isAdmin } = useAuth();
  const router = useRouter();
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulated metrics
  const stats = {
    revenue: 3459.60,
    ordersCount: 18,
    avgTicket: 192.20,
    productsCount: 4
  };

  // Mock list of recent orders for administration
  const mockOrders: MockAdminOrder[] = [
    { id: 'PED-7F9A', customer: 'Carlos Henrique', itemsCount: 2, total: 189.80, status: 'pending', time: 'Há 10 min' },
    { id: 'PED-4B2C', customer: 'Mariana Costa', itemsCount: 1, total: 119.90, status: 'preparing', time: 'Há 45 min' },
    { id: 'PED-9E3F', customer: 'Rodrigo Abreu', itemsCount: 3, total: 429.70, status: 'shipped', time: 'Há 2 horas' },
    { id: 'PED-1D5E', customer: 'Juliana Paes', itemsCount: 1, total: 69.90, status: 'completed', time: 'Ontem' },
  ];

  useEffect(() => {
    // Check if logged in via demo bypass or standard admin role
    const demoAdminToken = localStorage.getItem('vip_vaper_demo_admin');
    if (demoAdminToken === 'true') {
      setIsDemo(true);
      setLoading(false);
    } else {
      // If not demo and auth loading is done, check admin permissions
      // We will add a small timeout or wait for auth state
      const checkAccess = () => {
        if (!isAdmin) {
          // If not admin, wait a brief second to let profile load, else redirect
          const timeout = setTimeout(() => {
            const currentDemo = localStorage.getItem('vip_vaper_demo_admin') === 'true';
            if (!isAdmin && !currentDemo) {
              router.push('/admin/login');
            } else {
              setLoading(false);
            }
          }, 1200);
          return () => clearTimeout(timeout);
        } else {
          setLoading(false);
        }
      };
      checkAccess();
    }
  }, [isAdmin, router]);

  const handleLogout = () => {
    localStorage.removeItem('vip_vaper_demo_admin');
    signOut();
    router.push('/admin/login');
  };

  const getStatusStyle = (status: MockAdminOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'preparing':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'shipped':
        return 'bg-[#00f0ff]/10 border-[#00f0ff]/30 text-[#00f0ff]';
      case 'completed':
        return 'bg-[#00ff66]/10 border-[#00ff66]/30 text-[#00ff66]';
      default:
        return 'bg-zinc-800 border-zinc-700 text-zinc-400';
    }
  };

  const getStatusLabel = (status: MockAdminOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'preparing':
        return 'Preparando';
      case 'shipped':
        return 'Enviado';
      case 'completed':
        return 'Concluído';
      default:
        return 'Cancelado';
    }
  };

  if (loading) {
    return (
      <MobileShell showHeader={false} showBottomNav={false}>
        <div className="flex flex-col items-center justify-center py-40">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-red-500 animate-spin mb-4" />
          <span className="font-cyber-orbitron text-[9px] font-black text-zinc-500 uppercase tracking-widest">
            SISTEMA INICIALIZANDO...
          </span>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell showHeader={false} showBottomNav={false}>
      {/* 1. Header with Logout and Branding */}
      <div className="flex items-center justify-between mb-6 mt-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          <span className="font-cyber-orbitron font-black text-base tracking-wider text-white">
            VIP<span className="text-red-500">ADMIN</span>
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[10px] font-cyber-orbitron font-bold text-zinc-400 hover:text-red-500 hover:border-red-500/25 transition-all duration-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          SAIR
        </button>
      </div>

      {isDemo && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-cyber-inter rounded-xl flex items-center justify-between gap-3 mb-6 relative">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Você está operando no <b>Modo Demonstração</b> com dados locais.</span>
          </div>
        </div>
      )}

      {/* 2. Grid metrics statistics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-[#09090c] border border-zinc-900 rounded-xl relative">
          <DollarSign className="w-5 h-5 text-[#00ff66] absolute right-4 top-4 opacity-40" />
          <span className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">FATURAMENTO</span>
          <span className="font-cyber-orbitron text-base font-black text-[#00ff66] tracking-tight">
            R$ {stats.revenue.toFixed(2)}
          </span>
        </div>

        <div className="p-4 bg-[#09090c] border border-zinc-900 rounded-xl relative">
          <ShoppingBag className="w-5 h-5 text-[#00f0ff] absolute right-4 top-4 opacity-40" />
          <span className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">PEDIDOS</span>
          <span className="font-cyber-orbitron text-base font-black text-[#00f0ff] tracking-tight">
            {stats.ordersCount} UNID.
          </span>
        </div>

        <div className="p-4 bg-[#09090c] border border-zinc-900 rounded-xl relative">
          <Activity className="w-5 h-5 text-purple-400 absolute right-4 top-4 opacity-40" />
          <span className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">TICKET MÉDIO</span>
          <span className="font-cyber-orbitron text-base font-black text-purple-400 tracking-tight">
            R$ {stats.avgTicket.toFixed(2)}
          </span>
        </div>

        <div className="p-4 bg-[#09090c] border border-zinc-900 rounded-xl relative">
          <Layers className="w-5 h-5 text-amber-400 absolute right-4 top-4 opacity-40" />
          <span className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">PRODUTOS</span>
          <span className="font-cyber-orbitron text-base font-black text-amber-400 tracking-tight">
            {stats.productsCount} ATIVOS
          </span>
        </div>
      </div>

      {/* 3. Quick Shortcuts Navigation */}
      <h3 className="font-cyber-orbitron text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <ClipboardList className="w-3.5 h-3.5 text-red-500" />
        Shortcuts Administrativos
      </h3>
      <div className="grid grid-cols-2 gap-3.5 mb-6">
        <Link 
          href="/admin/produtos"
          className="p-3 bg-[#0c0c0f] border border-zinc-900 hover:border-red-500/30 rounded-xl flex items-center justify-between group transition-all duration-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.05)] cursor-pointer"
        >
          <span className="font-cyber-orbitron text-[10px] font-bold text-zinc-400 group-hover:text-white uppercase">PRODUTOS</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-red-500 transition-colors" />
        </Link>
        <Link 
          href="/admin/categorias"
          className="p-3 bg-[#0c0c0f] border border-zinc-900 hover:border-red-500/30 rounded-xl flex items-center justify-between group transition-all duration-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.05)] cursor-pointer"
        >
          <span className="font-cyber-orbitron text-[10px] font-bold text-zinc-400 group-hover:text-white uppercase">CATEGORIAS</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-red-500 transition-colors" />
        </Link>
        <Link 
          href="/admin/pedidos"
          className="p-3 bg-[#0c0c0f] border border-zinc-900 hover:border-red-500/30 rounded-xl flex items-center justify-between group transition-all duration-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.05)] cursor-pointer"
        >
          <span className="font-cyber-orbitron text-[10px] font-bold text-zinc-400 group-hover:text-white uppercase">PEDIDOS</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-red-500 transition-colors" />
        </Link>
        <Link 
          href="/admin/configuracoes"
          className="p-3 bg-[#0c0c0f] border border-zinc-900 hover:border-red-500/30 rounded-xl flex items-center justify-between group transition-all duration-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.05)] cursor-pointer"
        >
          <span className="font-cyber-orbitron text-[10px] font-bold text-zinc-400 group-hover:text-white uppercase">CONFIGS</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-red-500 transition-colors" />
        </Link>
        <Link 
          href="/admin/avaliacoes"
          className="p-3 bg-[#0c0c0f] border border-[#00ff66]/10 hover:border-[#00ff66]/30 rounded-xl flex items-center justify-between group transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,102,0.05)] cursor-pointer"
        >
          <span className="font-cyber-orbitron text-[10px] font-bold text-zinc-400 group-hover:text-[#00ff66] uppercase">AVALIAÇÕES</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#00ff66] transition-colors" />
        </Link>
        <Link 
          href="/admin/banners"
          className="p-3 bg-[#0c0c0f] border border-[#00ff66]/10 hover:border-[#00ff66]/30 rounded-xl flex items-center justify-between group transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,102,0.05)] cursor-pointer"
        >
          <span className="font-cyber-orbitron text-[10px] font-bold text-zinc-400 group-hover:text-[#00ff66] uppercase">BANNERS SLIDER</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#00ff66] transition-colors" />
        </Link>
      </div>

      {/* 4. Recent orders feed */}
      <h3 className="font-cyber-orbitron text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3.5 flex items-center justify-between">
        <span>Últimas Transações</span>
        <span className="text-[8px] font-bold text-zinc-600">[ ATUALIZADO AGORA ]</span>
      </h3>
      
      <div className="flex flex-col gap-3">
        {mockOrders.map((ord) => (
          <div
            key={ord.id}
            className="p-3.5 bg-[#09090c] border border-zinc-900 hover:border-zinc-800 rounded-xl flex items-center justify-between gap-3 relative overflow-hidden"
          >
            {/* Left Info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-cyber-orbitron text-[10px] font-black text-white">{ord.id}</span>
                <span className="font-cyber-inter text-[9px] text-zinc-500">{ord.time}</span>
              </div>
              <span className="font-cyber-inter text-xs font-bold text-zinc-300 mb-0.5">{ord.customer}</span>
              <span className="font-cyber-inter text-[10px] text-zinc-500">{ord.itemsCount}x itens adicionados</span>
            </div>

            {/* Right Status / Value */}
            <div className="flex flex-col items-end gap-1.5">
              <span className="font-cyber-orbitron text-xs font-black text-[#00ff66] tracking-tight">
                R$ {ord.total.toFixed(2)}
              </span>
              <span className={`px-2 py-0.5 rounded text-[8px] font-cyber-orbitron font-black uppercase border ${getStatusStyle(ord.status)}`}>
                {getStatusLabel(ord.status)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Shop link bypass */}
      <Link
        href="/"
        className="w-full mt-6 py-2.5 px-4 rounded-xl border border-zinc-800 bg-[#0c0c0f]/60 hover:bg-[#0c0c0f] text-zinc-400 hover:text-white font-cyber-orbitron font-bold text-[10px] tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all duration-300"
      >
        [ VOLTAR À LOJA DO CLIENTE ]
        <ExternalLink className="w-3.5 h-3.5" />
      </Link>
    </MobileShell>
  );
}
