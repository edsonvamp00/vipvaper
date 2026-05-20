'use client';

import React from 'react';
import { MobileShell } from '@/components/common/MobileShell';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, CreditCard, ArrowRight } from 'lucide-react';

export default function CarrinhoPage() {
  const { cart, updateQuantity, removeFromCart, cartSubtotal, cartCount } = useCart();

  return (
    <MobileShell showHeader={false}>
      {/* Header bar */}
      <div className="flex items-center gap-3 mb-6 mt-2">
        <Link 
          href="/" 
          className="p-2 bg-[#0c0c0f] border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="font-cyber-orbitron text-[9px] font-black text-[#00ff66] tracking-widest block uppercase">
            [ ITENS SELECIONADOS ]
          </span>
          <h1 className="font-cyber-orbitron text-base font-extrabold text-white uppercase tracking-wider">
            Meu Carrinho
          </h1>
        </div>
      </div>

      {cart.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 text-center border border-zinc-900 bg-[#07070a] rounded-2xl p-6">
          <ShoppingBag className="w-12 h-12 text-zinc-700 mb-4 animate-bounce" />
          <h3 className="font-cyber-orbitron text-xs font-bold text-white uppercase tracking-wider mb-2">
            CARRINHO VAZIO
          </h3>
          <p className="font-cyber-inter text-[11px] text-zinc-500 max-w-[200px] leading-relaxed mb-6">
            Você ainda não adicionou nenhum pod ou essência premium ao seu carrinho.
          </p>
          <Link
            href="/"
            className="font-cyber-orbitron text-[10px] font-black px-5 py-2.5 bg-[#00ff66] text-black rounded-xl uppercase tracking-wider hover:bg-[#00ff66]/90 shadow-[0_0_15px_rgba(0,255,102,0.2)]"
          >
            EXPLORAR PRODUTOS
          </Link>
        </div>
      ) : (
        /* Cart List */
        <div className="flex flex-col flex-1">
          <span className="font-cyber-orbitron text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-4">
            // RESUMO DO CARRINHO ({cartCount} {cartCount === 1 ? 'ITEM' : 'ITENS'})
          </span>

          <div className="flex flex-col gap-3.5 mb-6">
            {cart.map((item) => {
              const product = item.product;
              const hasDiscount = product.promo_price !== null && product.promo_price !== undefined && product.promo_price > 0;
              const unitPrice = hasDiscount ? product.promo_price! : product.price;
              const totalPrice = unitPrice * item.quantity;
              const mainImage = product.product_images?.find((img) => img.is_main)?.image_url ?? '/placeholder.png';

              return (
                <div 
                  key={product.id}
                  className="flex items-center gap-3.5 p-3 bg-[#09090c] border border-zinc-900 rounded-xl relative overflow-hidden group hover:border-zinc-800 transition-colors duration-200"
                >
                  {/* Product small image preview */}
                  <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mainImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="font-cyber-inter font-bold text-xs text-white line-clamp-1 leading-snug">
                        {product.name}
                      </h3>
                      <span className="font-cyber-orbitron text-[9px] text-[#00f0ff] font-bold block mb-1.5">
                        {product.category?.name || 'Insumo'}
                      </span>
                    </div>

                    {/* Quantity controls & Price */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center bg-[#0c0c0f] border border-zinc-800 rounded-lg p-0.5 scale-90 -translate-x-1">
                        <button
                          onClick={() => updateQuantity(product.id, item.quantity - 1)}
                          className="p-1 text-zinc-500 hover:text-white"
                          aria-label="Diminuir"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-cyber-orbitron text-[10px] font-black text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, item.quantity + 1)}
                          className="p-1 text-zinc-500 hover:text-white"
                          aria-label="Aumentar"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-cyber-orbitron text-[11px] font-bold text-[#00ff66] tracking-tight shrink-0">
                        R$ {totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="p-1.5 text-zinc-600 hover:text-red-500 rounded-lg transition-colors duration-200 shrink-0 self-start"
                    aria-label="Remover item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Subtotal & Summary box */}
          <div className="bg-[#09090c] border border-zinc-900 rounded-2xl p-4 mb-24 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-24 h-[1px] bg-[#00ff66]/20" />
            <div className="flex items-center justify-between mb-2">
              <span className="font-cyber-inter text-[10px] text-zinc-400 font-semibold">Subtotal dos Itens</span>
              <span className="font-cyber-orbitron text-xs text-zinc-300 font-bold">R$ {cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mb-3.5">
              <span className="font-cyber-inter text-[10px] text-zinc-400 font-semibold">Entrega local</span>
              <span className="font-cyber-orbitron text-[9px] text-[#00ff66] font-bold uppercase border border-[#00ff66]/30 bg-[#00ff66]/5 px-1.5 py-0.5 rounded">A CALCULAR</span>
            </div>
            
            <div className="h-[1px] bg-zinc-900 w-full mb-3.5" />

            <div className="flex items-baseline justify-between mb-4">
              <span className="font-cyber-orbitron text-xs font-black text-white uppercase tracking-wider">Total</span>
              <span className="font-cyber-orbitron text-base font-black text-[#00ff66] tracking-tight">R$ {cartSubtotal.toFixed(2)}</span>
            </div>

            <Link
              href="/checkout"
              className="w-full py-3 px-4 rounded-xl bg-[#00ff66] border border-[#00ff66] text-black font-cyber-orbitron font-black text-[11px] tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.15)] hover:shadow-[0_0_35px_rgba(0,255,102,0.3)] transition-all duration-300 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-black font-black" />
              PROSSEGUIR PARA CHECKOUT
              <ArrowRight className="w-4 h-4 text-black font-black" />
            </Link>
          </div>
        </div>
      )}
    </MobileShell>
  );
}
