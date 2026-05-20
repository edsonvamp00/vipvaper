'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { MobileShell } from '@/components/common/MobileShell';
import Link from 'next/link';
import { DollarSign, ShoppingBag, ClipboardList, Layers, ArrowLeft, LogOut, ExternalLink, Activity, ArrowRight } from 'lucide-react';

interface MockAdminOrder {
  id: string;
  customer: string;
  itemsCount: number;
  total: number;
  status: 'pending' | 'preparing' | 'shipped' | 'completed' | 'cancelled';
  time: string;
}

export default function AdminDashboardPage() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Stats state initialized with fallback demo data
  const [stats, setStats] = useState({
    revenue: 3459.60,
    ordersCount: 18,
    avgTicket: 192.20,
    productsCount: 4
  });

  // Recent orders list state
  const [orders, setOrders] = useState<any[]>([
    { id: 'PED-7F9A', contact_name: 'Carlos Henrique', total: 189.80, status: 'pending', created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), payment_method: 'pix' },
    { id: 'PED-4B2C', contact_name: 'Mariana Costa', total: 119.90, status: 'preparing', created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), payment_method: 'card_on_delivery' },
    { id: 'PED-9E3F', contact_name: 'Rodrigo Abreu', total: 429.70, status: 'shipped', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), payment_method: 'pix' },
    { id: 'PED-1D5E', contact_name: 'Juliana Paes', total: 69.90, status: 'completed', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), payment_method: 'cash' },
  ]);

  useEffect(() => {
    // Safety timeout — if anything hangs, just show the dashboard after 3s
    const safetyTimeout = setTimeout(() => setLoading(false), 3000);

    supabase.auth.getSession().then(({ data }) => {
      clearTimeout(safetyTimeout);
      if (data.session?.user) {
        setLoading(false);
      } else {
        window.location.href = '/admin/login';
      }
    }).catch(() => {
      clearTimeout(safetyTimeout);
      window.location.href = '/admin/login';
    });

    return () => clearTimeout(safetyTimeout);
  }, []);

  // Load real Supabase data
  useEffect(() => {
    if (loading) return;

    async function loadDashboardData() {
      try {
        // 1. Get products count
        const { count: prodsCount } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('active', true);
        
        // 2. Get all orders to calculate metrics
        const { data: allOrders } = await supabase
          .from('orders')
          .select('total, status');
        
        // 3. Get recent 5 orders list
        const { data: recentOrders } = await supabase
          .from('orders')
          .select('id, contact_name, total, status, created_at, payment_method')
          .order('created_at', { ascending: false })
          .limit(5);

        let totalRevenue = 0;
        let validOrdersCount = 0;

        if (allOrders) {
          allOrders.forEach(o => {
            if (o.status !== 'cancelled') {
              totalRevenue += Number(o.total);
              validOrdersCount++;
            }
          });
        }

        const avg = validOrdersCount > 0 ? totalRevenue / validOrdersCount : 0;

        setStats({
          revenue: totalRevenue,
          ordersCount: allOrders ? allOrders.length : 0,
          avgTicket: avg,
          productsCount: prodsCount || 0
        });

        if (recentOrders && recentOrders.length > 0) {
          setOrders(recentOrders);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do dashboard do Supabase:', err);
      }
    }

    loadDashboardData();
  }, [loading]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    signOut();
    router.push('/admin/login');
  };

  const getStatusStyle = (status: string) => {
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

  const getStatusLabel = (status: string) => {
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

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / (1000 * 60));
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffMin < 1) return 'Agora mesmo';
      if (diffMin < 60) return `Há ${diffMin} min`;
      if (diffHrs < 24) return `Há ${diffHrs} ${diffHrs === 1 ? 'hora' : 'horas'}`;
      
      return date.toLocaleDateString('pt-BR');
    } catch {
      return 'Algum tempo';
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'pix': return 'Pix';
      case 'card_on_delivery': return 'Cartão na Entrega';
      default: return 'Dinheiro';
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
        {orders.map((ord) => (
          <div
            key={ord.id}
            className="p-3.5 bg-[#09090c] border border-zinc-900 hover:border-zinc-800 rounded-xl flex items-center justify-between gap-3 relative overflow-hidden"
          >
            {/* Left Info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-cyber-orbitron text-[10px] font-black text-white">
                  PED-{ord.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="font-cyber-inter text-[9px] text-zinc-500">{formatTimeAgo(ord.created_at)}</span>
              </div>
              <span className="font-cyber-inter text-xs font-bold text-zinc-300 mb-0.5">{ord.contact_name}</span>
              <span className="font-cyber-inter text-[10px] text-zinc-500">Pagam: {getPaymentLabel(ord.payment_method)}</span>
            </div>

            {/* Right Status / Value */}
            <div className="flex flex-col items-end gap-1.5">
              <span className="font-cyber-orbitron text-xs font-black text-[#00ff66] tracking-tight">
                R$ {Number(ord.total).toFixed(2)}
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
