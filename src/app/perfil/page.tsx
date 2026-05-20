'use client';

import React, { useState, useEffect } from 'react';
import { MobileShell } from '@/components/common/MobileShell';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, LogOut, ShoppingBag, ShieldCheck, Mail, Lock, Phone, UserPlus, Sparkles, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface OrderItemWithProduct {
  id: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
  };
}

interface OrderWithItems {
  id: string;
  status: 'pending' | 'preparing' | 'shipped' | 'completed' | 'cancelled';
  subtotal: number;
  total: number;
  delivery_method: string;
  payment_method: string;
  created_at: string;
  order_items: OrderItemWithProduct[];
}

export default function ClientProfilePage() {
  const { user, profile, refreshProfile, signOut, loading: authLoading } = useAuth();
  const router = useRouter();

  // Navigation and UI States
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Orders State
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Fetch Client Orders
  useEffect(() => {
    if (!user) return;
    const userId = user.id;

    async function fetchOrders() {
      setLoadingOrders(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            status,
            subtotal,
            total,
            delivery_method,
            payment_method,
            created_at,
            order_items (
              id,
              quantity,
              price,
              product:products ( name )
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setOrders(data as any);
      } catch (err) {
        console.error('Erro ao buscar pedidos:', err);
      } finally {
        setLoadingOrders(false);
      }
    }

    fetchOrders();
  }, [user]);

  // Handle Client Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Success - context updates automatically
      await refreshProfile();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao fazer login. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Client Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !phone) {
      setErrorMsg('Todos os campos são obrigatórios.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        setSuccessMsg('Cadastro realizado com sucesso! Você já pode entrar na sua conta.');
        // Clear inputs
        setFullName('');
        setPhone('');
        setTab('login');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro no cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Get status details
  const getStatusConfig = (status: OrderWithItems['status']) => {
    switch (status) {
      case 'pending':
        return { label: 'Aguardando Pagamento', color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' };
      case 'preparing':
        return { label: 'Preparando seu Vape', color: 'text-blue-400 border-blue-500/20 bg-blue-500/5' };
      case 'shipped':
        return { label: 'Enviado / Rota de Entrega', color: 'text-[#00f0ff] border-[#00f0ff]/20 bg-[#00f0ff]/5' };
      case 'completed':
        return { label: 'Entregue / Concluído', color: 'text-[#00ff66] border-[#00ff66]/20 bg-[#00ff66]/5' };
      default:
        return { label: 'Cancelado', color: 'text-red-400 border-red-500/20 bg-red-500/5' };
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'pix': return 'Pix (Chave da Loja)';
      case 'card_on_delivery': return 'Cartão na Entrega';
      default: return 'Dinheiro na Entrega';
    }
  };

  if (authLoading) {
    return (
      <MobileShell>
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#00ff66] animate-spin mb-4" />
          <span className="font-cyber-orbitron text-[9px] font-black text-zinc-500 uppercase tracking-widest">
            CARREGANDO ACESSO...
          </span>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      {user ? (
        /* LOGGED IN PANEL */
        <div className="flex flex-col gap-6 py-2">
          
          {/* Welcome User Card */}
          <div className="p-5 bg-[#09090c] border border-zinc-900 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#00ff66]/30" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full border border-zinc-800 bg-[#0c0c0f] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,102,0.05)]">
                <User className="w-6 h-6 text-[#00ff66]" />
              </div>
              <div>
                <span className="font-cyber-orbitron text-[8px] font-bold text-[#00ff66] uppercase tracking-widest block mb-0.5">// CLIENTE VIP</span>
                <h2 className="font-cyber-orbitron text-sm font-black text-white uppercase tracking-wider">
                  {profile?.full_name || user.email?.split('@')[0]}
                </h2>
              </div>
            </div>

            {/* Profile Info Details */}
            <div className="flex flex-col gap-2 pt-3 border-t border-zinc-900 text-xs font-cyber-inter text-zinc-400">
              <div className="flex justify-between">
                <span>E-mail:</span>
                <span className="text-white font-bold">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span>WhatsApp:</span>
                <span className="text-white font-bold">{profile?.phone || 'Não cadastrado'}</span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={signOut}
              className="w-full mt-4 py-2 px-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-red-500/30 text-zinc-400 hover:text-red-500 font-cyber-orbitron font-bold text-[9px] tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              LOGOUT / SAIR DA CONTA
            </button>
          </div>

          {/* User History Orders Section */}
          <div>
            <h3 className="font-cyber-orbitron text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-[#00ff66]" />
              Seu Histórico de Pedidos
            </h3>

            {loadingOrders ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 rounded-full border border-t-transparent border-[#00ff66] animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 bg-[#0c0c0f] border border-zinc-900 rounded-2xl text-center flex flex-col items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-zinc-600" />
                <p className="font-cyber-inter text-[10px] text-zinc-500 leading-normal">
                  Você ainda não realizou nenhum pedido no VipViper.
                </p>
                <Link
                  href="/"
                  className="py-2 px-4 rounded-lg bg-[#00ff66] border border-[#00ff66] text-black font-cyber-orbitron font-black text-[9px] uppercase tracking-wider hover:shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all"
                >
                  Fazer Minha Primeira Compra
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {orders.map((order) => {
                  const statusCfg = getStatusConfig(order.status);
                  return (
                    <div 
                      key={order.id}
                      className="p-4 bg-[#09090c] border border-zinc-900 rounded-xl relative overflow-hidden"
                    >
                      {/* Top Header */}
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="font-cyber-orbitron text-[9px] font-black text-white">
                          PED-{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="font-cyber-inter text-[9px] text-zinc-500">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {/* Items loop */}
                      <div className="flex flex-col gap-1.5 py-2.5 border-y border-zinc-900 mb-2.5">
                        {order.order_items?.map((item) => (
                          <div key={item.id} className="flex justify-between text-[11px] font-cyber-inter">
                            <span className="text-zinc-400">
                              {item.quantity}x {item.product?.name || 'Produto Removido'}
                            </span>
                            <span className="text-zinc-300">
                              R$ {(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Payment and Delivery info */}
                      <div className="flex justify-between text-[9px] font-cyber-inter text-zinc-500 mb-3">
                        <span>Pagam: {getPaymentLabel(order.payment_method)}</span>
                        <span>Frete: {order.delivery_method === 'local_delivery' ? 'Entrega Local' : 'Retirada'}</span>
                      </div>

                      {/* Footer: Status and Total */}
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-cyber-orbitron font-black uppercase border ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                        <span className="font-cyber-orbitron text-xs font-black text-[#00ff66]">
                          R$ {order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick link to admin dashboard if admin */}
          {profile && (
            <Link
              href="/admin/dashboard"
              className="w-full mt-4 py-3 px-4 rounded-xl border border-[#00ff66]/10 bg-[#00ff66]/5 hover:bg-[#00ff66]/10 text-[#00ff66] font-cyber-orbitron font-black text-[9px] tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all duration-300"
            >
              <ShieldCheck className="w-4 h-4" />
              [ ENTRAR NO PAINEL ADMINISTRATIVO ]
            </Link>
          )}

        </div>
      ) : (
        /* LOGIN / REGISTER TABS */
        <div className="flex flex-col gap-6 py-2">
          
          {/* Brand header */}
          <div className="text-center mt-2 mb-2">
            <span className="font-cyber-orbitron text-[9px] font-black text-[#00ff66] tracking-widest uppercase block mb-1">
              🚀 VIPVIPER MARKETPLACE
            </span>
            <h1 className="font-cyber-orbitron text-lg font-black text-white uppercase tracking-wider">
              Área do Cliente
            </h1>
          </div>

          {/* Tab switcher */}
          <div className="grid grid-cols-2 bg-[#0c0c0f] border border-zinc-900 rounded-xl p-1">
            <button
              onClick={() => { setTab('login'); setErrorMsg(''); }}
              className={`py-2 text-[10px] font-cyber-orbitron font-black uppercase tracking-wider rounded-lg transition-all ${
                tab === 'login' 
                  ? 'bg-[#00ff66] text-black shadow-[0_0_10px_rgba(0,255,102,0.15)]' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ENTRAR
            </button>
            <button
              onClick={() => { setTab('register'); setErrorMsg(''); }}
              className={`py-2 text-[10px] font-cyber-orbitron font-black uppercase tracking-wider rounded-lg transition-all ${
                tab === 'register' 
                  ? 'bg-[#00ff66] text-black shadow-[0_0_10px_rgba(0,255,102,0.15)]' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              CADASTRAR
            </button>
          </div>

          {/* Status Messages */}
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-cyber-inter rounded-xl flex items-start gap-2 leading-relaxed">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] text-[10px] font-cyber-inter rounded-xl flex items-start gap-2 leading-relaxed">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#00ff66]" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Forms Panel */}
          {tab === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="bg-[#09090c] border border-zinc-900 rounded-2xl p-5 flex flex-col gap-4 relative">
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#00ff66]/40" />

              <div>
                <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">E-mail</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0c0c0f] border border-zinc-800 focus:border-[#00ff66]/40 rounded-lg p-2.5 pl-9 text-xs text-white focus:outline-none transition-all font-cyber-inter"
                  />
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Senha</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0c0c0f] border border-zinc-800 focus:border-[#00ff66]/40 rounded-lg p-2.5 pl-9 text-xs text-white focus:outline-none transition-all font-cyber-inter"
                  />
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#00ff66] border border-[#00ff66] text-black font-cyber-orbitron font-black text-[11px] tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,102,0.1)] hover:shadow-[0_0_25px_rgba(0,255,102,0.25)] transition-all duration-300 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'AUTENTICANDO...' : 'ENTRAR NA CONTA'}
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="bg-[#09090c] border border-zinc-900 rounded-2xl p-5 flex flex-col gap-4 relative">
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#00ff66]/40" />

              <div>
                <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Nome Completo</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Nome Completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#0c0c0f] border border-zinc-800 focus:border-[#00ff66]/40 rounded-lg p-2.5 pl-9 text-xs text-white focus:outline-none transition-all font-cyber-inter"
                  />
                  <User className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">WhatsApp (Celular)</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="11999998888"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0c0c0f] border border-zinc-800 focus:border-[#00ff66]/40 rounded-lg p-2.5 pl-9 text-xs text-white focus:outline-none transition-all font-cyber-inter"
                  />
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">E-mail</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0c0c0f] border border-zinc-800 focus:border-[#00ff66]/40 rounded-lg p-2.5 pl-9 text-xs text-white focus:outline-none transition-all font-cyber-inter"
                  />
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Escolha uma Senha</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0c0c0f] border border-zinc-800 focus:border-[#00ff66]/40 rounded-lg p-2.5 pl-9 text-xs text-white focus:outline-none transition-all font-cyber-inter"
                  />
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#00ff66] border border-[#00ff66] text-black font-cyber-orbitron font-black text-[11px] tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,102,0.1)] hover:shadow-[0_0_25px_rgba(0,255,102,0.25)] transition-all duration-300 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'CADASTRANDO...' : 'CRIAR MINHA CONTA'}
                <UserPlus className="w-4 h-4 text-black" />
              </button>
            </form>
          )}

          {/* Quality check disclaimer */}
          <div className="p-3 bg-[#0c0c0f] border border-zinc-900 rounded-xl flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#00ff66] shrink-0" />
            <p className="font-cyber-inter text-[9px] text-zinc-500 leading-normal">
              Seus dados estão protegidos por criptografia de ponta a ponta e salvos de forma segura em conformidade com as diretrizes de privacidade.
            </p>
          </div>

        </div>
      )}
    </MobileShell>
  );
}
