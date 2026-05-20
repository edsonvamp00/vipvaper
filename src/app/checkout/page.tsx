'use client';

import React, { useState, useEffect } from 'react';
import { MobileShell } from '@/components/common/MobileShell';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Truck, Store, CreditCard, Landmark, DollarSign, Send, ShoppingBag } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  // Contact Info State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Delivery Method State
  const [deliveryMethod, setDeliveryMethod] = useState<'local_delivery' | 'pickup'>('local_delivery');
  
  // Address State
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card_on_delivery' | 'cash'>('pix');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);

  // Prefill name and phone if user profile exists
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Delivery fee details
  const deliveryFee = deliveryMethod === 'local_delivery' ? 10.0 : 0.0;
  const orderTotal = cartSubtotal + deliveryFee;

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!name.trim() || !phone.trim()) {
      alert('Por favor, preencha seu nome e telefone.');
      return;
    }

    if (deliveryMethod === 'local_delivery' && (!street.trim() || !number.trim() || !neighborhood.trim() || !city.trim())) {
      alert('Por favor, preencha todos os campos obrigatórios do endereço de entrega.');
      return;
    }

    setLoading(true);

    const orderPayload = {
      user_id: user?.id || null, // Guest checkout support if not logged in
      status: 'pending',
      subtotal: cartSubtotal,
      total: orderTotal,
      delivery_method: deliveryMethod,
      delivery_address: deliveryMethod === 'local_delivery' ? {
        cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state
      } : null,
      payment_method: paymentMethod,
      contact_name: name,
      contact_phone: phone,
      notes: notes || null
    };

    try {
      let orderId = Math.random().toString(36).substring(2, 9).toUpperCase(); // temporary unique order ID for display and WhatsApp

      // 1. Try to record order in Supabase if URL is configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert([orderPayload])
          .select()
          .single();

        if (orderError) throw orderError;
        
        if (orderData) {
          orderId = orderData.id;
          
          // Insert items
          const itemsPayload = cart.map((item) => ({
            order_id: orderId,
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.promo_price ?? item.product.price
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsPayload);

          if (itemsError) console.error('Erro ao salvar itens no banco:', itemsError);
        }
      }

      // 2. Generate detailed WhatsApp message summary for manual fulfillment (Extremely high conversion!)
      const whatsappPhone = '5511999999999'; // Admin custom whatsapp phone placeholder
      const itemsList = cart
        .map(
          (item) =>
            `• ${item.quantity}x ${item.product.name} (R$ ${(item.product.promo_price ?? item.product.price).toFixed(
              2
            )} unid.)`
        )
        .join('\n');

      const deliveryDetails =
        deliveryMethod === 'local_delivery'
          ? `📍 *ENTREGA LOCAL*:\n   Rua: ${street}, Nº ${number}${
              complement ? ` (${complement})` : ''
            }\n   Bairro: ${neighborhood}\n   Cidade: ${city}-${state}\n   CEP: ${cep}`
          : '🏪 *RETIRADA EM LOJA*';

      const paymentLabel =
        paymentMethod === 'pix'
          ? '⚡ PIX'
          : paymentMethod === 'card_on_delivery'
          ? '💳 Cartão na Entrega'
          : '💵 Dinheiro';

      const whatsappText = encodeURIComponent(
        `🔋 *NOVO PEDIDO VIPVIPER* 🔋\n` +
        `-------------------------------\n` +
        `*Pedido ID:* #${orderId}\n` +
        `*Cliente:* ${name}\n` +
        `*WhatsApp:* ${phone}\n\n` +
        `📦 *PRODUTOS*:\n${itemsList}\n\n` +
        `${deliveryDetails}\n\n` +
        `💳 *PAGAMENTO*: ${paymentLabel}\n` +
        `${notes ? `📝 *Observação:* ${notes}\n` : ''}` +
        `-------------------------------\n` +
        `*Subtotal:* R$ ${cartSubtotal.toFixed(2)}\n` +
        `*Taxa de Entrega:* R$ ${deliveryFee.toFixed(2)}\n` +
        `*TOTAL DO PEDIDO:* R$ ${orderTotal.toFixed(2)}\n\n` +
        `🤖 _Pedido enviado do VipViper Mobile_`
      );

      const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${whatsappText}`;

      // Save order details locally so success page can display summary
      localStorage.setItem(
        'vip_vaper_last_order',
        JSON.stringify({
          orderId,
          name,
          phone,
          deliveryMethod,
          paymentMethod,
          total: orderTotal,
          whatsappUrl
        })
      );

      // Clean Cart state
      clearCart();

      // Redirect to SUCCESS Page
      router.push('/pedido-recebido');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Houve um erro ao processar seu pedido. Mas você pode prosseguir enviando diretamente para nosso atendente!');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <MobileShell showHeader={false}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="font-cyber-orbitron text-sm font-black text-red-500 uppercase tracking-widest mb-2">
            CHECKOUT IMPOSSÍVEL
          </h2>
          <p className="font-cyber-inter text-[11px] text-zinc-400 max-w-[200px] mb-6">
            Seu carrinho está vazio. Adicione itens antes de tentar finalizar a compra.
          </p>
          <Link
            href="/"
            className="font-cyber-orbitron text-[10px] font-black px-4 py-2 border border-[#00ff66] text-[#00ff66] bg-[#00ff66]/5 rounded-lg uppercase tracking-wider hover:bg-[#00ff66]/10"
          >
            [ VER CATÁLOGO ]
          </Link>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell showHeader={false} showBottomNav={false}>
      {/* Navigation bar */}
      <div className="flex items-center gap-3 mb-5 mt-2">
        <Link 
          href="/carrinho" 
          className="p-2 bg-[#0c0c0f] border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="font-cyber-orbitron text-[9px] font-black text-[#00ff66] tracking-widest block uppercase">
            [ FINALIZAÇÃO SEGURA ]
          </span>
          <h1 className="font-cyber-orbitron text-base font-extrabold text-white uppercase tracking-wider">
            Checkout do Pedido
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-10">
        
        {/* 1. SEÇÃO CONTATO */}
        <div className="bg-[#09090c] border border-zinc-900 rounded-xl p-4">
          <h3 className="font-cyber-orbitron text-[10px] font-black text-[#00f0ff] uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full" />
            1. Dados de Contato
          </h3>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                placeholder="Ex: João da Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00ff66]/30 font-cyber-inter"
              />
            </div>
            <div>
              <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">WhatsApp / Telefone *</label>
              <input
                type="tel"
                required
                placeholder="Ex: (11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00ff66]/30 font-cyber-inter"
              />
            </div>
          </div>
        </div>

        {/* 2. SEÇÃO MÉTODO DE ENTREGA */}
        <div className="bg-[#09090c] border border-zinc-900 rounded-xl p-4">
          <h3 className="font-cyber-orbitron text-[10px] font-black text-[#00f0ff] uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full" />
            2. Método de Entrega
          </h3>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => setDeliveryMethod('local_delivery')}
              className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all duration-200 ${
                deliveryMethod === 'local_delivery'
                  ? 'border-[#00ff66] bg-[#00ff66]/5 text-[#00ff66]'
                  : 'border-zinc-800 bg-[#0c0c0f] text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span className="font-cyber-orbitron text-[9px] font-black uppercase tracking-wider">ENTREGA LOCAL</span>
            </button>
            <button
              type="button"
              onClick={() => setDeliveryMethod('pickup')}
              className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all duration-200 ${
                deliveryMethod === 'pickup'
                  ? 'border-[#00ff66] bg-[#00ff66]/5 text-[#00ff66]'
                  : 'border-zinc-800 bg-[#0c0c0f] text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Store className="w-4 h-4" />
              <span className="font-cyber-orbitron text-[9px] font-black uppercase tracking-wider">RETIRADA NA LOJA</span>
            </button>
          </div>

          {/* Delivery Address fields */}
          {deliveryMethod === 'local_delivery' && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">CEP *</label>
                  <input
                    type="text"
                    required
                    placeholder="01234-567"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00ff66]/30 font-cyber-inter"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Cidade *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: São Paulo"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00ff66]/30 font-cyber-inter"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Rua / Logradouro *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Av. Paulista"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00ff66]/30 font-cyber-inter"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Número *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1000"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00ff66]/30 font-cyber-inter"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Bairro *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Bela Vista"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00ff66]/30 font-cyber-inter"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Complemento</label>
                  <input
                    type="text"
                    placeholder="Ex: Apto 23B"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00ff66]/30 font-cyber-inter"
                  />
                </div>
              </div>
            </div>
          )}

          {deliveryMethod === 'pickup' && (
            <div className="p-3 bg-[#0c0c0f] border border-zinc-900 rounded-lg text-center animate-fade-in">
              <span className="font-cyber-orbitron text-[9px] font-bold text-[#00ff66] block mb-1">🏢 ENDEREÇO DE RETIRADA</span>
              <p className="font-cyber-inter text-[10px] text-zinc-400 leading-normal">
                Rua Augusta, 1000 - Consolação, São Paulo - SP<br/>
                Disponível para retirada em 15 minutos após aprovação.
              </p>
            </div>
          )}
        </div>

        {/* 3. SEÇÃO PAGAMENTO */}
        <div className="bg-[#09090c] border border-zinc-900 rounded-xl p-4">
          <h3 className="font-cyber-orbitron text-[10px] font-black text-[#00f0ff] uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full" />
            3. Forma de Pagamento
          </h3>

          <div className="flex flex-col gap-2 mb-4">
            <button
              type="button"
              onClick={() => setPaymentMethod('pix')}
              className={`p-3 rounded-lg border flex items-center justify-between transition-all duration-200 ${
                paymentMethod === 'pix'
                  ? 'border-[#00ff66] bg-[#00ff66]/5 text-[#00ff66]'
                  : 'border-zinc-800 bg-[#0c0c0f] text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4" />
                <span className="font-cyber-orbitron text-[10px] font-bold uppercase tracking-wider">PIX (Com Desconto)</span>
              </div>
              <span className="font-cyber-orbitron text-[9px] font-bold">[ ENVIAR COMPROVANTE ]</span>
            </button>
            
            <button
              type="button"
              onClick={() => setPaymentMethod('card_on_delivery')}
              className={`p-3 rounded-lg border flex items-center justify-between transition-all duration-200 ${
                paymentMethod === 'card_on_delivery'
                  ? 'border-[#00ff66] bg-[#00ff66]/5 text-[#00ff66]'
                  : 'border-zinc-800 bg-[#0c0c0f] text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="font-cyber-orbitron text-[10px] font-bold uppercase tracking-wider">Cartão na Entrega</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`p-3 rounded-lg border flex items-center justify-between transition-all duration-200 ${
                paymentMethod === 'cash'
                  ? 'border-[#00ff66] bg-[#00ff66]/5 text-[#00ff66]'
                  : 'border-zinc-800 bg-[#0c0c0f] text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="font-cyber-orbitron text-[10px] font-bold uppercase tracking-wider">Dinheiro físico</span>
              </div>
            </button>
          </div>

          <div>
            <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Notas / Instruções Especiais</label>
            <textarea
              placeholder="Ex: Tocar interfone do apto 23B, troco para R$ 100,00..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00ff66]/30 font-cyber-inter h-16 resize-none"
            />
          </div>
        </div>

        {/* 4. SEÇÃO RESUMO E ENVIO */}
        <div className="bg-[#09090c] border border-zinc-900 rounded-xl p-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-cyber-inter text-[10px] text-zinc-400 font-semibold">Valor dos Insumos</span>
            <span className="font-cyber-orbitron text-xs text-zinc-300 font-bold">R$ {cartSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="font-cyber-inter text-[10px] text-zinc-400 font-semibold">Taxa de Entrega</span>
            <span className="font-cyber-orbitron text-xs text-[#00ff66] font-bold">
              {deliveryFee > 0 ? `R$ ${deliveryFee.toFixed(2)}` : 'GRÁTIS'}
            </span>
          </div>

          <div className="h-[1px] bg-zinc-900 w-full mb-3" />

          <div className="flex justify-between items-baseline mb-5">
            <span className="font-cyber-orbitron text-xs font-black text-white uppercase tracking-wider">Valor Líquido</span>
            <span className="font-cyber-orbitron text-base font-black text-[#00ff66] tracking-tight">R$ {orderTotal.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#00ff66] border border-[#00ff66] text-black font-cyber-orbitron font-black text-[11px] tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.15)] hover:shadow-[0_0_35px_rgba(0,255,102,0.35)] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 text-black font-black" />
            {loading ? 'PROCESSANDO PEDIDO...' : 'FINALIZAR E ENVIAR VIA WHATSAPP'}
          </button>
        </div>
      </form>
    </MobileShell>
  );
}
