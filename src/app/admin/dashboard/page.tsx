'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { MobileShell } from '@/components/common/MobileShell';
import Link from 'next/link';
import { 
  DollarSign, 
  ShoppingBag, 
  ClipboardList, 
  Layers, 
  ArrowLeft, 
  LogOut, 
  ExternalLink, 
  Activity, 
  ArrowRight,
  X,
  Trash2,
  Check,
  RefreshCw,
  MessageSquare,
  Landmark,
  CreditCard,
  Plus,
  Sparkles
} from 'lucide-react';

interface MockAdminOrder {
  id: string;
  contact_name: string;
  total: number;
  status: 'pending' | 'preparing' | 'shipped' | 'completed' | 'cancelled';
  created_at: string;
  payment_method: string;
  contact_phone?: string;
  delivery_method?: string;
  notes?: string;
}

export default function AdminDashboardPage() {
  const { signOut } = useAuth();
  const router = useRouter();
  
  // State for admin operation mode (Real Supabase or local storage Demo)
  const [isDemo, setIsDemo] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<MockAdminOrder | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // States for simulating mock transactions
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [totalValue, setTotalValue] = useState('119.90');
  const [orderStatus, setOrderStatus] = useState<'pending' | 'preparing' | 'shipped' | 'completed' | 'cancelled'>('pending');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card_on_delivery' | 'cash'>('pix');
  
  // Initialize loading to false if we have cached stats so UI shell renders immediately
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('cached_admin_stats');
      return cached ? false : true;
    }
    return true;
  });

  // Stats state initialized with fallback cache or demo data
  const [stats, setStats] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('cached_admin_stats');
      return cached ? JSON.parse(cached) : {
        revenue: 3459.60,
        ordersCount: 18,
        avgTicket: 192.20,
        productsCount: 4
      };
    }
    return {
      revenue: 3459.60,
      ordersCount: 18,
      avgTicket: 192.20,
      productsCount: 4
    };
  });

  // Recent orders list state
  const [orders, setOrders] = useState<MockAdminOrder[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('cached_admin_orders');
      return cached ? JSON.parse(cached) : [
        { id: 'PED-7F9A', contact_name: 'Carlos Henrique', total: 189.80, status: 'pending', created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), payment_method: 'pix', contact_phone: '11999998888', delivery_method: 'entrega local' },
        { id: 'PED-4B2C', contact_name: 'Mariana Costa', total: 119.90, status: 'preparing', created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), payment_method: 'card_on_delivery', contact_phone: '11988887777', delivery_method: 'retirada' },
        { id: 'PED-9E3F', contact_name: 'Rodrigo Abreu', total: 429.70, status: 'shipped', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), payment_method: 'pix', contact_phone: '11977776666', delivery_method: 'entrega local' },
        { id: 'PED-1D5E', contact_name: 'Juliana Paes', total: 69.90, status: 'completed', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), payment_method: 'cash', contact_phone: '11966665555', delivery_method: 'retirada' },
      ];
    }
    return [
      { id: 'PED-7F9A', contact_name: 'Carlos Henrique', total: 189.80, status: 'pending', created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), payment_method: 'pix', contact_phone: '11999998888', delivery_method: 'entrega local' },
      { id: 'PED-4B2C', contact_name: 'Mariana Costa', total: 119.90, status: 'preparing', created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), payment_method: 'card_on_delivery', contact_phone: '11988887777', delivery_method: 'retirada' },
      { id: 'PED-9E3F', contact_name: 'Rodrigo Abreu', total: 429.70, status: 'shipped', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), payment_method: 'pix', contact_phone: '11977776666', delivery_method: 'entrega local' },
      { id: 'PED-1D5E', contact_name: 'Juliana Paes', total: 69.90, status: 'completed', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), payment_method: 'cash', contact_phone: '11966665555', delivery_method: 'retirada' },
    ];
  });

  const loadLocalDashboardData = () => {
    try {
      const storedOrdersStr = localStorage.getItem('vip_vaper_all_orders');
      let allOrders = [];
      if (storedOrdersStr) {
        allOrders = JSON.parse(storedOrdersStr);
      } else {
        allOrders = [
          { id: 'PED-7F9A', contact_name: 'Carlos Henrique', total: 189.80, status: 'pending', created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), payment_method: 'pix', contact_phone: '11999998888', delivery_method: 'entrega local' },
          { id: 'PED-4B2C', contact_name: 'Mariana Costa', total: 119.90, status: 'preparing', created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), payment_method: 'card_on_delivery', contact_phone: '11988887777', delivery_method: 'retirada' },
          { id: 'PED-9E3F', contact_name: 'Rodrigo Abreu', total: 429.70, status: 'shipped', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), payment_method: 'pix', contact_phone: '11977776666', delivery_method: 'entrega local' },
          { id: 'PED-1D5E', contact_name: 'Juliana Paes', total: 69.90, status: 'completed', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), payment_method: 'cash', contact_phone: '11966665555', delivery_method: 'retirada' },
        ];
        localStorage.setItem('vip_vaper_all_orders', JSON.stringify(allOrders));
      }

      let totalRevenue = 0;
      let validOrdersCount = 0;

      allOrders.forEach((o: any) => {
        if (o.status !== 'cancelled') {
          totalRevenue += Number(o.total);
          validOrdersCount++;
        }
      });

      const avg = validOrdersCount > 0 ? totalRevenue / validOrdersCount : 0;

      const freshStats = {
        revenue: totalRevenue,
        ordersCount: allOrders.length,
        avgTicket: avg,
        productsCount: 4
      };

      setStats(freshStats);
      localStorage.setItem('cached_admin_stats', JSON.stringify(freshStats));

      const sorted = [...allOrders].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const recent = sorted.slice(0, 5);
      
      setOrders(recent);
      localStorage.setItem('cached_admin_orders', JSON.stringify(recent));
      localStorage.setItem('cached_admin_all_orders', JSON.stringify(allOrders));
    } catch (e) {
      console.error('Erro ao ler do localStorage no dashboard:', e);
    }
  };

  useEffect(() => {
    // Safety timeout — if anything hangs, just show the dashboard after 3s
    const safetyTimeout = setTimeout(() => setLoading(false), 3000);

    supabase.auth.getSession().then(({ data }) => {
      clearTimeout(safetyTimeout);
      if (data.session?.user) {
        const demoFlag = localStorage.getItem('vip_vaper_demo_admin') === 'true';
        if (demoFlag) {
          setIsDemo(true);
          loadLocalDashboardData();
          setLoading(false);
        } else {
          loadDashboardData();
        }
      } else {
        window.location.href = '/admin/login';
      }
    }).catch(() => {
      clearTimeout(safetyTimeout);
      window.location.href = '/admin/login';
    });

    return () => clearTimeout(safetyTimeout);
  }, []);

  async function loadDashboardData() {
    try {
      // 1. Get products count
      const { count: prodsCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('active', true);
      
      // 2. Get all orders to calculate metrics
      const { data: allOrders, error: allOrdersError } = await supabase
        .from('orders')
        .select('total, status');

      if (allOrdersError) throw allOrdersError;
      
      // 3. Get recent 5 orders list
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, contact_name, total, status, created_at, payment_method, contact_phone, delivery_method, notes')
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

      const freshStats = {
        revenue: totalRevenue,
        ordersCount: allOrders ? allOrders.length : 0,
        avgTicket: avg,
        productsCount: prodsCount || 0
      };

      setStats(freshStats);
      localStorage.setItem('cached_admin_stats', JSON.stringify(freshStats));

      if (recentOrders && recentOrders.length > 0) {
        setOrders(recentOrders as MockAdminOrder[]);
        localStorage.setItem('cached_admin_orders', JSON.stringify(recentOrders));
      }
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard do Supabase, rodando em modo Demo:', err);
      setIsDemo(true);
      loadLocalDashboardData();
    } finally {
      setLoading(false);
    }
  }

  // Update order status instantly (Supabase or LocalStorage)
  const updateOrderStatus = async (orderId: string, newStatus: MockAdminOrder['status']) => {
    try {
      setLoading(true);
      if (isDemo) {
        const storedStr = localStorage.getItem('vip_vaper_all_orders');
        let allOrders = [];
        if (storedStr) {
          allOrders = JSON.parse(storedStr);
        }
        
        const updated = allOrders.map((o: any) => o.id === orderId ? { ...o, status: newStatus } : o);
        localStorage.setItem('vip_vaper_all_orders', JSON.stringify(updated));
        
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        
        loadLocalDashboardData();
      } else {
        const { error } = await supabase
          .from('orders')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', orderId);

        if (error) throw error;
        
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        
        await loadDashboardData();
      }
    } catch (err: any) {
      alert('Erro ao atualizar status: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete transaction permanently (Supabase or LocalStorage)
  const deleteOrder = async (orderId: string) => {
    try {
      setLoading(true);
      if (isDemo) {
        const storedStr = localStorage.getItem('vip_vaper_all_orders');
        let allOrders = [];
        if (storedStr) {
          allOrders = JSON.parse(storedStr);
        }
        
        const updated = allOrders.filter((o: any) => o.id !== orderId);
        localStorage.setItem('vip_vaper_all_orders', JSON.stringify(updated));
        
        setSelectedOrder(null);
        setConfirmDelete(false);
        loadLocalDashboardData();
      } else {
        // Delete items first to maintain referential integrity
        await supabase.from('order_items').delete().eq('order_id', orderId);
        
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', orderId);

        if (error) throw error;
        
        setSelectedOrder(null);
        setConfirmDelete(false);
        await loadDashboardData();
      }
    } catch (err: any) {
      alert('Erro ao excluir transação: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Insert custom simulated order (colocá-las)
  const createSimulatedOrder = async (
    clientNameArg: string,
    totalValueArg: number,
    statusArg: MockAdminOrder['status'],
    paymentMethodArg: string
  ) => {
    try {
      setLoading(true);
      const randomId = 'PED-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const newOrderPayload = {
        id: randomId,
        contact_name: clientNameArg || 'Cliente Simulado',
        total: Number(totalValueArg) || 119.90,
        subtotal: Number(totalValueArg) || 119.90,
        status: statusArg || 'pending',
        payment_method: paymentMethodArg || 'pix',
        contact_phone: '11999998888',
        delivery_method: 'entrega local',
        created_at: new Date().toISOString(),
        notes: 'Transação gerada dinamicamente via painel administrativo.'
      };

      if (isDemo) {
        const storedStr = localStorage.getItem('vip_vaper_all_orders');
        let allOrders = [];
        if (storedStr) {
          allOrders = JSON.parse(storedStr);
        }
        
        allOrders.unshift(newOrderPayload);
        localStorage.setItem('vip_vaper_all_orders', JSON.stringify(allOrders));
        
        setIsCreateModalOpen(false);
        resetCreateForm();
        loadLocalDashboardData();
      } else {
        let productsList: any[] = [];
        try {
          const { data } = await supabase.from('products').select('id, name, price').limit(1);
          productsList = data || [];
        } catch {}

        const { data: orderData, error } = await supabase
          .from('orders')
          .insert([{
            status: newOrderPayload.status,
            total: newOrderPayload.total,
            subtotal: newOrderPayload.subtotal,
            payment_method: newOrderPayload.payment_method,
            contact_name: newOrderPayload.contact_name,
            contact_phone: newOrderPayload.contact_phone,
            delivery_method: newOrderPayload.delivery_method,
            notes: newOrderPayload.notes
          }])
          .select()
          .single();

        if (error) throw error;

        if (orderData && productsList.length > 0) {
          await supabase.from('order_items').insert([{
            order_id: orderData.id,
            product_id: productsList[0].id,
            quantity: 1,
            price: newOrderPayload.total
          }]);
        }

        setIsCreateModalOpen(false);
        resetCreateForm();
        await loadDashboardData();
      }
    } catch (err: any) {
      alert('Erro ao criar pedido simulado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRandomize = () => {
    const names = [
      'Gabriel Cyber', 'Ana Vape', 'Lucas Volt', 'Clara Liquid', 
      'Rodrigo Cloud', 'Julia Pod', 'Matheus GTX', 'Mariana Xros'
    ];
    const prices = ['59.90', '89.90', '119.90', '149.90', '189.90', '249.90'];
    const methods: Array<'pix' | 'card_on_delivery' | 'cash'> = ['pix', 'card_on_delivery', 'cash'];
    const statuses: Array<'pending' | 'preparing' | 'shipped' | 'completed'> = ['pending', 'preparing', 'shipped', 'completed'];

    setClientName(names[Math.floor(Math.random() * names.length)]);
    setTotalValue(prices[Math.floor(Math.random() * prices.length)]);
    setPaymentMethod(methods[Math.floor(Math.random() * methods.length)]);
    setOrderStatus(statuses[Math.floor(Math.random() * statuses.length)] as any);
  };

  const resetCreateForm = () => {
    setClientName('');
    setTotalValue('119.90');
    setOrderStatus('pending');
    setPaymentMethod('pix');
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('vip_vaper_demo_admin');
      localStorage.removeItem('vip_admin_verified');
      localStorage.removeItem('cached_admin_stats');
      localStorage.removeItem('cached_admin_orders');
      
      supabase.auth.signOut().catch(() => {});
      signOut().catch(() => {});
    } catch (err) {
      console.error('Erro ao deslogar:', err);
    }
    window.location.href = '/admin/login';
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
        return 'bg-zinc-850 border-zinc-700 text-zinc-400';
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-red-500 animate-spin mb-4" />
          <span className="font-cyber-orbitron text-[9px] font-black text-zinc-500 uppercase tracking-widest">
            CARREGANDO PAINEL...
          </span>
        </div>
      ) : (
      <>

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
        <span className="flex items-center gap-2">
          <span>Últimas Transações</span>
          {isDemo && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[8px] font-cyber-orbitron font-black tracking-tight">DEMO</span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              resetCreateForm();
              setIsCreateModalOpen(true);
            }}
            className="px-2.5 py-1 rounded bg-[#00ff66]/10 border border-[#00ff66]/20 hover:border-[#00ff66]/40 text-[#00ff66] font-cyber-orbitron font-bold text-[8px] tracking-wider uppercase transition-all flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-2.5 h-2.5" />
            SIMULAR
          </button>
          <button
            onClick={isDemo ? loadLocalDashboardData : loadDashboardData}
            className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-zinc-400 transition-colors"
            title="Recarregar"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </h3>
      
      <div className="flex flex-col gap-3">
        {orders.length === 0 ? (
          <div className="py-12 border border-dashed border-zinc-900 rounded-2xl text-center">
            <ClipboardList className="w-8 h-8 text-zinc-700 mx-auto mb-2 opacity-40" />
            <p className="font-cyber-orbitron text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">
              Nenhuma transação
            </p>
            <p className="font-cyber-inter text-[9px] text-zinc-650">
              Clique em simular para adicionar novas transações.
            </p>
          </div>
        ) : (
          orders.map((ord) => (
            <div
              key={ord.id}
              onClick={() => {
                setSelectedOrder(ord);
                setConfirmDelete(false);
              }}
              className="p-3.5 bg-[#09090c] border border-zinc-900 hover:border-red-500/20 rounded-xl flex items-center justify-between gap-3 relative overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.01]"
            >
              {/* Left Info */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-cyber-orbitron text-[10px] font-black text-white">
                    {ord.id.startsWith('PED-') ? ord.id : `PED-${ord.id.slice(0, 8).toUpperCase()}`}
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
          ))
        )}
      </div>

      {/* Customer Shop link bypass */}
      <Link
        href="/"
        className="w-full mt-6 py-2.5 px-4 rounded-xl border border-zinc-800 bg-[#0c0c0f]/60 hover:bg-[#0c0c0f] text-zinc-400 hover:text-white font-cyber-orbitron font-bold text-[10px] tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all duration-300"
      >
        [ VOLTAR À LOJA DO CLIENTE ]
        <ExternalLink className="w-3.5 h-3.5" />
      </Link>
      </>
      )}

      {/* Quick Action Modal (tirá-las, formatá-las, etc.) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#09090c] border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 relative shadow-[0_0_50px_rgba(0,0,0,0.85)]">
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-red-500" />
            
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
              <div className="flex flex-col">
                <span className="font-cyber-orbitron text-[8px] font-bold text-zinc-500 uppercase tracking-widest">AÇÕES RÁPIDAS DA TRANSAÇÃO</span>
                <span className="font-cyber-orbitron text-xs font-black text-white">
                  {selectedOrder.id.startsWith('PED-') ? selectedOrder.id : `PED-${selectedOrder.id.slice(0, 8).toUpperCase()}`}
                </span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded bg-zinc-900 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1 text-[11px] text-zinc-300">
              <div className="flex justify-between py-1 border-b border-zinc-900/40">
                <span className="text-zinc-500">Cliente:</span>
                <span className="font-bold text-white">{selectedOrder.contact_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900/40">
                <span className="text-zinc-500">Valor total:</span>
                <span className="font-bold text-[#00ff66]">R$ {Number(selectedOrder.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900/40">
                <span className="text-zinc-500">Pagamento:</span>
                <span className="font-bold text-white uppercase">{getPaymentLabel(selectedOrder.payment_method)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Status atual:</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-cyber-orbitron font-black uppercase border ${getStatusStyle(selectedOrder.status)}`}>
                  {getStatusLabel(selectedOrder.status)}
                </span>
              </div>
            </div>

            {/* Status updates buttons */}
            <div className="bg-[#0c0c0f] border border-zinc-900 rounded-xl p-3 flex flex-col gap-2">
              <span className="text-[8px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">EDITAR STATUS RÁPIDO</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                  className={`py-1.5 px-2 rounded-lg border font-cyber-orbitron font-bold text-[8px] uppercase tracking-wider transition-all ${
                    selectedOrder.status === 'preparing'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-zinc-800 hover:border-blue-500/20 text-zinc-400'
                  }`}
                >
                  PREPARANDO
                </button>
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                  className={`py-1.5 px-2 rounded-lg border font-cyber-orbitron font-bold text-[8px] uppercase tracking-wider transition-all ${
                    selectedOrder.status === 'shipped'
                      ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-[#00f0ff]'
                      : 'border-zinc-800 hover:border-[#00f0ff]/20 text-zinc-400'
                  }`}
                >
                  ENVIAR
                </button>
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                  className={`py-1.5 px-2 rounded-lg border font-cyber-orbitron font-bold text-[8px] uppercase tracking-wider transition-all ${
                    selectedOrder.status === 'completed'
                      ? 'border-[#00ff66] bg-[#00ff66]/10 text-[#00ff66]'
                      : 'border-zinc-800 hover:border-[#00ff66]/20 text-zinc-400'
                  }`}
                >
                  CONCLUIR (OK)
                </button>
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                  className={`py-1.5 px-2 rounded-lg border font-cyber-orbitron font-bold text-[8px] uppercase tracking-wider transition-all ${
                    selectedOrder.status === 'cancelled'
                      ? 'border-red-500 bg-red-500/10 text-red-400'
                      : 'border-zinc-800 hover:border-red-500/20 text-zinc-400'
                  }`}
                >
                  CANCELAR (NÃO)
                </button>
              </div>
            </div>

            {/* Action options */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  const statusText = getStatusLabel(selectedOrder.status).toUpperCase();
                  const text = `Olá, *${selectedOrder.contact_name}*!\n\nAtualização sobre o seu pedido na *VIPVIPER* 🧪🔋\n\nStatus Atual: *${statusText}*\n\nTotal: R$ ${Number(selectedOrder.total).toFixed(2)}`;
                  const url = `https://api.whatsapp.com/send?phone=${selectedOrder.contact_phone || '5511999999999'}&text=${encodeURIComponent(text)}`;
                  window.open(url, '_blank');
                }}
                className="w-full py-2 rounded-lg bg-[#00ff66]/5 border border-[#00ff66]/15 hover:border-[#00ff66]/30 text-[#00ff66] font-cyber-orbitron font-black text-[9px] uppercase transition-all tracking-wider flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                NOTIFICAR VIA WHATSAPP
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    router.push('/admin/pedidos');
                  }}
                  className="w-1/2 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-cyber-orbitron font-black text-[8px] uppercase transition-all hover:bg-zinc-850"
                >
                  PEDIDOS COMPLETOS
                </button>

                {confirmDelete ? (
                  <button
                    onClick={() => deleteOrder(selectedOrder.id)}
                    className="w-1/2 py-2 rounded-lg bg-red-650 border border-red-500 text-white font-cyber-orbitron font-black text-[8px] uppercase transition-all animate-pulse"
                  >
                    CONFIRMAR EXCLUSÃO
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-1/2 py-2 rounded-lg bg-red-950/20 border border-red-500/30 text-red-400 font-cyber-orbitron font-black text-[8px] uppercase transition-all hover:bg-red-950/40"
                  >
                    EXCLUIR
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Modal (colocá-las) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#09090c] border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 relative shadow-[0_0_50px_rgba(0,0,0,0.85)]">
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#00ff66]" />
            
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <div className="flex flex-col">
                <span className="font-cyber-orbitron text-[8px] font-bold text-zinc-500 uppercase tracking-widest">SIMULADOR DE FLUXO</span>
                <span className="font-cyber-orbitron text-xs font-black text-white">NOVA TRANSAÇÃO MOCK</span>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded bg-zinc-900 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Auto-generate banner */}
            <div className="p-2.5 bg-[#00ff66]/5 border border-[#00ff66]/15 rounded-lg flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="font-cyber-orbitron text-[7px] text-[#00ff66] font-bold uppercase tracking-wider">MUITO LENTO?</span>
                <span className="text-[9px] text-zinc-400">Gere um pedido 100% aleatório em 1 clique</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleRandomize();
                  const names = ['Lucas Neon', 'Gabriel Cyber', 'Ana Vape', 'Clara Volts', 'Matheus Cloud', 'Rodrigo Pod', 'Juliana Juice', 'Mariana Mist'];
                  const prices = [59.90, 89.90, 119.90, 149.90, 189.90, 249.90];
                  const methods = ['pix', 'card_on_delivery', 'cash'];
                  const statuses: Array<'pending' | 'preparing' | 'shipped' | 'completed'> = ['pending', 'preparing', 'shipped', 'completed'];
                  
                  const rName = names[Math.floor(Math.random() * names.length)];
                  const rPrice = prices[Math.floor(Math.random() * prices.length)];
                  const rMethod = methods[Math.floor(Math.random() * methods.length)];
                  const rStatus = statuses[Math.floor(Math.random() * statuses.length)];
                  
                  createSimulatedOrder(rName, rPrice, rStatus, rMethod);
                }}
                className="px-2 py-1.5 rounded bg-[#00ff66] text-black font-cyber-orbitron font-black text-[8px] uppercase hover:shadow-[0_0_10px_rgba(0,255,102,0.3)] transition-all flex items-center gap-0.5 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                AUTO-GERAR
              </button>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[8px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Nome do Cliente</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Gabriel Cyber"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#00ff66]/30 font-cyber-inter"
                  />
                  <button
                    type="button"
                    onClick={handleRandomize}
                    className="px-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white text-xs"
                    title="Dados Aleatórios"
                  >
                    🎲
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[8px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Valor Total (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="119.90"
                  value={totalValue}
                  onChange={(e) => setTotalValue(e.target.value)}
                  className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#00ff66]/30 font-cyber-orbitron"
                />
              </div>

              <div>
                <label className="text-[8px] font-cyber-orbitron text-zinc-500 uppercase block mb-1 font-bold">Status Inicial</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['pending', 'preparing', 'shipped', 'completed'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOrderStatus(st)}
                      className={`py-1 px-1 rounded text-[7px] font-cyber-orbitron font-bold uppercase tracking-tight border transition-all ${
                        orderStatus === st
                          ? 'border-[#00ff66] bg-[#00ff66]/10 text-[#00ff66]'
                          : 'border-zinc-900 bg-[#0c0c0f] text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {getStatusLabel(st)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[8px] font-cyber-orbitron text-zinc-500 uppercase block mb-1 font-bold">Forma de Pagamento</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['pix', 'card_on_delivery', 'cash'] as const).map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      className={`py-1 px-1 rounded text-[7px] font-cyber-orbitron font-bold uppercase tracking-tight border transition-all ${
                        paymentMethod === pm
                          ? 'border-[#00ff66] bg-[#00ff66]/10 text-[#00ff66]'
                          : 'border-zinc-900 bg-[#0c0c0f] text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {getPaymentLabel(pm)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 border-t border-zinc-900 pt-3">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-1/3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 font-cyber-orbitron font-bold text-[8px] uppercase tracking-wider"
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={() => createSimulatedOrder(clientName, Number(totalValue), orderStatus, paymentMethod)}
                className="w-2/3 py-2 rounded-lg bg-[#00ff66] text-black font-cyber-orbitron font-black text-[8px] uppercase tracking-wider hover:shadow-[0_0_15px_rgba(0,255,102,0.25)] transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-black font-black" />
                CRIAR TRANSAÇÃO
              </button>
            </div>
          </div>
        </div>
      )}

    </MobileShell>
  );
}
