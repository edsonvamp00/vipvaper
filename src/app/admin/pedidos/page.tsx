'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { MobileShell } from '@/components/common/MobileShell';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Phone, MessageSquare, MapPin, CreditCard, Clock, Check, X, ShieldAlert } from 'lucide-react';

interface AdminOrder {
  id: string;
  status: 'pending' | 'preparing' | 'shipped' | 'completed' | 'cancelled';
  subtotal: number;
  total: number;
  delivery_method: string;
  payment_method: string;
  contact_name: string;
  contact_phone: string;
  notes?: string;
  delivery_address?: any;
  created_at: string;
  order_items?: any[];
}

export default function AdminOrdersPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Fallback local mock orders for quick testing
  const MOCK_ADMIN_ORDERS: AdminOrder[] = [
    {
      id: 'PED-7F9A',
      status: 'pending',
      subtotal: 169.80,
      total: 189.80,
      delivery_method: 'entrega local',
      payment_method: 'PIX',
      contact_name: 'Carlos Henrique',
      contact_phone: '11999998888',
      notes: 'Entregar para a portaria caso eu não esteja.',
      delivery_address: {
        cep: '01311-200',
        street: 'Avenida Paulista',
        number: '1000',
        complement: 'Apto 42',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP'
      },
      created_at: new Date(Date.now() - 10 * 60000).toISOString(), // 10 min ago
      order_items: [
        { id: 'oi1', product: { name: 'Pod ElfBar BC10000 Watermelon Ice' }, quantity: 1, price: 119.90 },
        { id: 'oi2', product: { name: 'Juice Nasty Salt Cush Man 30ml' }, quantity: 1, price: 69.90 }
      ]
    },
    {
      id: 'PED-4B2C',
      status: 'preparing',
      subtotal: 119.90,
      total: 119.90,
      delivery_method: 'retirada',
      payment_method: 'Cartão na Entrega',
      contact_name: 'Mariana Costa',
      contact_phone: '11988887777',
      notes: 'Vou retirar às 18h30.',
      delivery_address: null,
      created_at: new Date(Date.now() - 45 * 60000).toISOString(), // 45 min ago
      order_items: [
        { id: 'oi3', product: { name: 'Pod ElfBar BC10000 Watermelon Ice' }, quantity: 1, price: 119.90 }
      ]
    },
    {
      id: 'PED-9E3F',
      status: 'shipped',
      subtotal: 409.70,
      total: 429.70,
      delivery_method: 'entrega local',
      payment_method: 'Dinheiro',
      contact_name: 'Rodrigo Abreu',
      contact_phone: '11977776666',
      notes: 'Levar troco para R$ 150,00.',
      delivery_address: {
        cep: '04571-010',
        street: 'Rua Buri',
        number: '120',
        complement: 'Casa B',
        neighborhood: 'Jardim Paulista',
        city: 'São Paulo',
        state: 'SP'
      },
      created_at: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago
      order_items: [
        { id: 'oi4', product: { name: 'Pod Vaporesso XROS 4 Nano' }, quantity: 1, price: 269.90 },
        { id: 'oi5', product: { name: 'Resistência Vaporesso GTX Coil pack' }, quantity: 1, price: 119.90 }
      ]
    }
  ];

  useEffect(() => {
    // Safety timeout — if anything hangs, just show the orders after 3s
    const safetyTimeout = setTimeout(() => setLoading(false), 3000);

    supabase.auth.getSession().then(({ data }) => {
      clearTimeout(safetyTimeout);
      if (data.session?.user) {
        loadSupabaseOrders();
      } else {
        window.location.href = '/admin/login';
      }
    }).catch(() => {
      clearTimeout(safetyTimeout);
      window.location.href = '/admin/login';
    });

    return () => clearTimeout(safetyTimeout);
  }, []);

  const loadLocalOrders = () => {
    try {
      const stored = localStorage.getItem('vip_vaper_all_orders');
      if (stored) {
        setOrders(JSON.parse(stored));
      } else {
        setOrders(MOCK_ADMIN_ORDERS);
        localStorage.setItem('vip_vaper_all_orders', JSON.stringify(MOCK_ADMIN_ORDERS));
      }
    } catch (e) {
      console.error(e);
      setOrders(MOCK_ADMIN_ORDERS);
    }
  };

  const loadSupabaseOrders = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            product:products(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setOrders(data);
      } else {
        loadLocalOrders();
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos do Supabase, carregando localmente:', err);
      setIsDemo(true);
      loadLocalOrders();
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: AdminOrder['status']) => {
    if (isDemo) {
      const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      setOrders(updated);
      localStorage.setItem('vip_vaper_all_orders', JSON.stringify(updated));
      
      // Update selected modal too
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      alert(`Status do pedido atualizado localmente para: ${getStatusLabel(newStatus)}`);
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      alert(`Status atualizado com sucesso para: ${getStatusLabel(newStatus)}`);
      loadSupabaseOrders();
      
      // Update selected
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err: any) {
      alert('Erro ao atualizar status: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: AdminOrder['status']) => {
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

  const getStatusLabel = (status: AdminOrder['status']) => {
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

  // Generate a friendly WhatsApp update message
  const handleSendWhatsAppUpdate = (order: AdminOrder) => {
    const statusText = getStatusLabel(order.status).toUpperCase();
    let detailMsg = '';
    
    if (order.status === 'preparing') {
      detailMsg = 'Seu pedido já foi aprovado e nossa equipe está preparando com todo cuidado! Em breve sairá para entrega.';
    } else if (order.status === 'shipped') {
      detailMsg = 'Boa notícia! Seu pedido já saiu para entrega/está disponível para retirada. Aguarde nosso portador!';
    } else if (order.status === 'completed') {
      detailMsg = 'Pedido finalizado e entregue com sucesso. Muito obrigado por escolher a VIPVIPER! Esperamos você na próxima compra.';
    } else {
      detailMsg = 'Estamos revisando seu pedido. Fique atento às nossas notificações!';
    }

    const text = `Olá, *${order.contact_name}*!\n\nAtualização sobre o seu pedido *${order.id}* na *VIPVIPER* 🧪🔋\n\nStatus Atual: *${statusText}*\n\n👉 _${detailMsg}_\n\n*Resumo Financeiro:*\nTotal: R$ ${order.total.toFixed(2)} (${order.payment_method})`;
    
    const url = `https://api.whatsapp.com/send?phone=${order.contact_phone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

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
          VIP<span className="text-red-500">PEDIDOS</span>
        </span>
      </div>

      {isDemo && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[9px] font-cyber-inter rounded-lg mb-4 text-center">
          Operando em <b>Modo Demonstração</b> com dados locais.
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-[#09090c] border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 relative my-auto shadow-[0_10px_50px_rgba(0,0,0,0.85)] max-h-[90vh]">
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-red-500" />
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 shrink-0">
              <div className="flex flex-col">
                <span className="font-cyber-orbitron text-[9px] font-bold text-zinc-500 uppercase tracking-widest">DETALHES DO PEDIDO</span>
                <span className="font-cyber-orbitron text-xs font-black text-white">{selectedOrder.id}</span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded bg-zinc-900 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable details contents */}
            <div className="flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800 text-xs text-zinc-300">
              
              {/* Order Status Controller */}
              <div className="bg-[#0c0c0f] border border-zinc-900 rounded-xl p-3 flex flex-col gap-2">
                <span className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">ALTERAR STATUS DO PEDIDO</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                    className={`py-2 px-3 rounded-lg border font-cyber-orbitron font-bold text-[9px] uppercase tracking-wider transition-all ${
                      selectedOrder.status === 'preparing'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-zinc-800 hover:border-blue-500/20 text-zinc-400'
                    }`}
                  >
                    PREPARAR
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                    className={`py-2 px-3 rounded-lg border font-cyber-orbitron font-bold text-[9px] uppercase tracking-wider transition-all ${
                      selectedOrder.status === 'shipped'
                        ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-[#00f0ff]'
                        : 'border-zinc-800 hover:border-[#00f0ff]/20 text-zinc-400'
                    }`}
                  >
                    ENVIAR
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                    className={`py-2 px-3 rounded-lg border font-cyber-orbitron font-bold text-[9px] uppercase tracking-wider transition-all ${
                      selectedOrder.status === 'completed'
                        ? 'border-[#00ff66] bg-[#00ff66]/10 text-[#00ff66]'
                        : 'border-zinc-800 hover:border-[#00ff66]/20 text-zinc-400'
                    }`}
                  >
                    CONCLUIR
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                    className={`py-2 px-3 rounded-lg border font-cyber-orbitron font-bold text-[9px] uppercase tracking-wider transition-all ${
                      selectedOrder.status === 'cancelled'
                        ? 'border-red-500 bg-red-500/10 text-red-400'
                        : 'border-zinc-800 hover:border-red-500/20 text-zinc-400'
                    }`}
                  >
                    CANCELAR
                  </button>
                </div>
              </div>

              {/* Client Info */}
              <div className="bg-[#0c0c0f] border border-zinc-900 rounded-xl p-3 flex flex-col gap-2">
                <span className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">DADOS DO CLIENTE</span>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{selectedOrder.contact_name}</h4>
                    <p className="text-[10px] text-zinc-400 font-cyber-inter mt-0.5">WhatsApp: {selectedOrder.contact_phone}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <a
                      href={`tel:${selectedOrder.contact_phone}`}
                      className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                      title="Ligar"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleSendWhatsAppUpdate(selectedOrder)}
                      className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:text-white hover:bg-emerald-500 transition-colors flex items-center gap-1 font-cyber-orbitron font-black text-[8px]"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      NOTIFICAR
                    </button>
                  </div>
                </div>
                {selectedOrder.notes && (
                  <div className="mt-2 pt-2 border-t border-zinc-900/60 text-[10px] text-zinc-400">
                    <b>Obs:</b> {selectedOrder.notes}
                  </div>
                )}
              </div>

              {/* Address / Delivery Details */}
              <div className="bg-[#0c0c0f] border border-zinc-900 rounded-xl p-3 flex flex-col gap-2">
                <span className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">MÉTODO & LOCAL DE ENTREGA</span>
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-cyber-orbitron text-[10px] font-bold text-white uppercase block mb-1">
                      {selectedOrder.delivery_method}
                    </span>
                    {selectedOrder.delivery_address ? (
                      <p className="text-[10px] text-zinc-400 leading-normal">
                        {selectedOrder.delivery_address.street}, Nº {selectedOrder.delivery_address.number}
                        {selectedOrder.delivery_address.complement ? ` - ${selectedOrder.delivery_address.complement}` : ''}<br />
                        {selectedOrder.delivery_address.neighborhood} - {selectedOrder.delivery_address.city} ({selectedOrder.delivery_address.state})<br />
                        CEP: {selectedOrder.delivery_address.cep}
                      </p>
                    ) : (
                      <p className="text-[10px] text-zinc-500 italic">Cliente selecionou retirada física na loja.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-[#0c0c0f] border border-zinc-900 rounded-xl p-3 flex flex-col gap-2">
                <span className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">ITENS DO PEDIDO</span>
                <div className="flex flex-col gap-2 divide-y divide-zinc-900">
                  {selectedOrder.order_items?.map((item, idx) => (
                    <div key={item.id || idx} className="flex items-center justify-between pt-2 first:pt-0">
                      <div>
                        <p className="font-bold text-white">{item.product?.name ?? 'Dispositivo'}</p>
                        <p className="text-[10px] text-zinc-500">{item.quantity}x unidades a R$ {item.price.toFixed(2)} cada</p>
                      </div>
                      <span className="font-cyber-orbitron font-black text-zinc-300">
                        R$ {(item.quantity * item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-900 pt-2.5 mt-2 flex items-center justify-between text-zinc-400">
                  <span>Subtotal:</span>
                  <span>R$ {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.total - selectedOrder.subtotal > 0 && (
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Taxa de Entrega:</span>
                    <span>R$ {(selectedOrder.total - selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between font-bold text-[#00ff66] text-sm mt-1">
                  <span>Total Geral:</span>
                  <span className="font-cyber-orbitron font-black">R$ {selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-[#0c0c0f] border border-zinc-900 rounded-xl p-3 flex items-center justify-between">
                <span className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase">MÉTODO DE PAGAMENTO</span>
                <div className="flex items-center gap-1.5 font-cyber-orbitron font-bold text-[10px] text-white">
                  <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                  {selectedOrder.payment_method.toUpperCase()}
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="flex gap-2 border-t border-zinc-900 pt-3.5 shrink-0">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 px-4 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 font-cyber-orbitron font-bold text-[10px] uppercase transition-colors"
              >
                FECHAR DETALHES
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Layout */}
      <div className="flex flex-col gap-4">
        
        {/* Statistics or Actions summary */}
        <div className="flex items-center justify-between">
          <span className="font-cyber-orbitron text-[9px] font-black text-zinc-500 uppercase tracking-widest">
            {orders.length} Transações registradas
          </span>
          <button
            onClick={isDemo ? loadLocalOrders : loadSupabaseOrders}
            className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-red-500/20 transition-all flex items-center gap-1 font-cyber-orbitron font-bold text-[8px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            RECARREGAR
          </button>
        </div>

        {/* Orders list container */}
        <div className="flex flex-col gap-3.5 pb-10">
          {orders.length === 0 ? (
            <div className="py-16 border border-dashed border-zinc-800 rounded-2xl text-center">
              <Clock className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="font-cyber-orbitron text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                Nenhum pedido recebido
              </p>
              <p className="font-cyber-inter text-[10px] text-zinc-600">
                Os pedidos finalizados no checkout aparecerão aqui.
              </p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => setSelectedOrder(ord)}
                className="p-3.5 bg-[#09090c] border border-zinc-900 hover:border-red-500/10 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors duration-200"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-cyber-orbitron text-[10px] font-black text-white">{ord.id}</span>
                    <span className="text-[9px] text-zinc-500 font-cyber-inter">
                      {new Date(ord.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="font-cyber-inter text-xs font-bold text-zinc-300 mb-0.5">{ord.contact_name}</span>
                  <span className="font-cyber-inter text-[9px] text-zinc-500">
                    {ord.delivery_method} • {ord.payment_method}
                  </span>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="font-cyber-orbitron text-xs font-black text-[#00ff66] tracking-tight">
                    R$ {ord.total.toFixed(2)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-cyber-orbitron font-black uppercase border ${getStatusColor(ord.status)}`}>
                    {getStatusLabel(ord.status)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </MobileShell>
  );
}
