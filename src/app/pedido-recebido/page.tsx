'use client';

import React, { useState, useEffect } from 'react';
import { MobileShell } from '@/components/common/MobileShell';
import Link from 'next/link';
import { CheckCircle2, MessageSquare, Copy, ChevronRight, CornerDownRight, Home } from 'lucide-react';

export default function PedidoRecebidoPage() {
  const [order, setOrder] = useState<{
    orderId: string;
    name: string;
    phone: string;
    deliveryMethod: string;
    paymentMethod: string;
    total: number;
    whatsappUrl: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const pixKey = 'vip.vaper.pix@pagamentos.com'; // Fake static PIX key for presentation

  useEffect(() => {
    try {
      const storedOrder = localStorage.getItem('vip_vaper_last_order');
      if (storedOrder) {
        setOrder(JSON.parse(storedOrder));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MobileShell showHeader={false} showBottomNav={false}>
      <div className="flex flex-col items-center pt-8 pb-10 text-center flex-1">
        
        {/* Animated Neon Success Box */}
        <div className="w-16 h-16 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/40 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,102,0.15)] relative">
          <div className="absolute inset-0 rounded-full border border-[#00ff66] animate-ping opacity-25" />
          <CheckCircle2 className="w-8 h-8 text-[#00ff66]" />
        </div>

        <span className="font-cyber-orbitron text-[9px] font-black text-[#00ff66] tracking-widest uppercase block mb-1">
          [ SISTEMA ATIVO - OPERAÇÃO CONCLUÍDA ]
        </span>
        <h1 className="font-cyber-orbitron text-xl font-extrabold text-white uppercase tracking-wider mb-2">
          Pedido Recebido!
        </h1>
        <p className="font-cyber-inter text-[11px] text-zinc-400 max-w-[280px] leading-relaxed mb-6">
          Seu pedido foi registrado com sucesso em nossa central e está pronto para ser enviado!
        </p>

        {order && (
          <div className="w-full bg-[#09090c] border border-zinc-900 rounded-2xl p-4 mb-6 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00f0ff]" />
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-cyber-orbitron text-zinc-500 uppercase">Número do Pedido</span>
              <span className="text-xs font-cyber-orbitron text-[#00f0ff] font-bold">#{order.orderId}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-cyber-orbitron text-zinc-500 uppercase font-semibold">Cliente</span>
              <span className="text-xs font-cyber-inter text-zinc-300 font-bold">{order.name}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-cyber-orbitron text-zinc-500 uppercase">Forma de Pagamento</span>
              <span className="text-xs font-cyber-inter text-zinc-300 font-bold">
                {order.paymentMethod === 'pix'
                  ? '⚡ PIX'
                  : order.paymentMethod === 'card_on_delivery'
                  ? '💳 Cartão na Entrega'
                  : '💵 Dinheiro'}
              </span>
            </div>
            
            <div className="h-[1px] bg-zinc-900 w-full my-3" />
            
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-cyber-orbitron text-zinc-500 uppercase font-black">Valor Total</span>
              <span className="text-sm font-cyber-orbitron text-[#00ff66] font-black">R$ {order.total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* 1. PIX payment details instructions (if PIX selected) */}
        {(!order || order.paymentMethod === 'pix') && (
          <div className="w-full bg-[#0c0c0f] border border-[#00ff66]/15 rounded-2xl p-4 mb-6 text-left relative">
            <h3 className="font-cyber-orbitron text-[9px] font-black text-white uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#00ff66] rounded-full cyber-pulse-dot" />
              PASSO 1: PAGAMENTO VIA PIX
            </h3>
            <p className="font-cyber-inter text-[10px] text-zinc-400 leading-normal mb-3">
              Copie a chave PIX abaixo, faça a transferência no aplicativo do seu banco e guarde o comprovante.
            </p>
            
            <div className="flex items-center gap-2 bg-black border border-zinc-800 rounded-lg p-2.5">
              <span className="font-cyber-inter text-[10px] text-zinc-300 font-semibold truncate flex-1 select-all">
                {pixKey}
              </span>
              <button
                onClick={handleCopyPix}
                className="p-1.5 rounded bg-[#0c0c0f] border border-zinc-800 hover:border-[#00ff66]/40 text-zinc-400 hover:text-white transition-colors duration-200"
                aria-label="Copiar chave"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            {copied && (
              <span className="text-[9px] font-cyber-orbitron text-[#00ff66] font-bold tracking-wider mt-1.5 block text-right">
                ✓ CHAVE COPIADA COM SUCESSO!
              </span>
            )}
          </div>
        )}

        {/* 2. Direct Call-to-action to dispatch the WhatsApp message (Crucial step) */}
        <div className="w-full flex flex-col gap-3.5 mb-6">
          <div className="text-left bg-[#0c0c0f] border border-zinc-900 rounded-2xl p-4">
            <h3 className="font-cyber-orbitron text-[9px] font-black text-[#00f0ff] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <CornerDownRight className="w-3.5 h-3.5 text-[#00f0ff]" />
              PASSO 2: ENVIAR PEDIDO NO WHATSAPP
            </h3>
            <p className="font-cyber-inter text-[10px] text-zinc-400 leading-relaxed mb-3">
              Para liberar seu envio o mais rápido possível, clique no botão verde abaixo para encaminhar os dados e o comprovante ao nosso atendente.
            </p>
            
            {order?.whatsappUrl && (
              <a
                href={order.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-[#00ff66] border border-[#00ff66] text-black font-cyber-orbitron font-black text-[11px] tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.15)] hover:shadow-[0_0_35px_rgba(0,255,102,0.35)] transition-all duration-300"
              >
                <MessageSquare className="w-4 h-4 text-black font-black" />
                ENVIAR PEDIDO NO WHATSAPP
                <ChevronRight className="w-4 h-4 text-black font-black" />
              </a>
            )}
          </div>
        </div>

        {/* Go home navigation */}
        <Link
          href="/"
          className="font-cyber-orbitron text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors duration-200 flex items-center gap-1.5"
        >
          <Home className="w-3.5 h-3.5" />
          [ VOLTAR AO CATÁLOGO INICIAL ]
        </Link>
      </div>
    </MobileShell>
  );
}
