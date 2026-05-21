'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const WhatsAppButton: React.FC = () => {
  const [phone, setPhone] = useState('5511999998888');

  useEffect(() => {
    async function fetchPhone() {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('value')
          .eq('key', 'phone')
          .single();

        if (error) throw error;
        if (data && data.value) {
          // Remove any non-numeric characters just in case
          const cleanPhone = data.value.replace(/\D/g, '');
          setPhone(cleanPhone);
        }
      } catch (err) {
        console.error('Erro ao buscar telefone do WhatsApp:', err);
      }
    }

    fetchPhone();
  }, []);

  const message = encodeURIComponent('Olá! Vim pelo site da VipViper e gostaria de tirar algumas dúvidas.');
  const whatsappUrl = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-4 z-50 flex items-center justify-center w-12 h-12 bg-[#25D366] hover:bg-[#20ba5a] rounded-full shadow-[0_0_15px_rgba(37,211,102,0.4)] hover:shadow-[0_0_25px_rgba(37,211,102,0.6)] hover:scale-105 transition-all duration-300 group cursor-pointer"
      aria-label="Falar no WhatsApp"
    >
      {/* Pulse ping animation */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75 animate-ping pointer-events-none group-hover:opacity-100" />
      
      {/* WhatsApp SVG Icon */}
      <svg
        className="w-7 h-7 text-[#25D366] group-hover:text-[#20ba5a] transition-colors duration-300 relative z-10"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* White speech bubble background */}
        <path
          fill="white"
          d="M12.004 22.004c-1.895 0-3.753-.508-5.385-1.47l-.386-.228-3.993 1.048 1.067-3.896-.25-.398C1.397 15.373.84 13.41.84 11.36c0-6.233 5.103-11.336 11.354-11.336S23.548 5.127 23.548 11.36c0 6.233-5.103 11.336-11.354 11.336z"
        />
        {/* Dynamic handset receiver */}
        <path
          fill="currentColor"
          d="M17.832 13.768c-.32-.16-1.888-.93-2.18-1.036-.292-.107-.504-.16-.716.16-.212.317-.82 1.036-1.006 1.248-.185.212-.37.238-.689.079-.319-.16-1.348-.497-2.568-1.585-.949-.846-1.59-1.89-1.775-2.207-.185-.317-.02-.49.14-.648.143-.142.319-.37.478-.555.16-.185.212-.317.319-.53.106-.21.053-.396-.027-.555-.079-.16-.716-1.728-.98-2.364-.258-.62-.52-.536-.716-.546-.185-.01-.397-.01-.61-.01-.212 0-.556.079-.847.397-.291.317-1.112 1.084-1.112 2.645 0 1.56 1.138 3.067 1.297 3.28.16.21 2.24 3.42 5.428 4.79.758.326 1.35.52 1.81.666.76.242 1.45.208 2 .127.61-.09 1.888-.77 2.15-1.51.265-.742.265-1.378.185-1.51-.08-.133-.291-.212-.61-.372z"
        />
      </svg>
    </a>
  );
};
