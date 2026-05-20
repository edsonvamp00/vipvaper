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
      className="fixed bottom-24 right-4 z-50 flex items-center justify-center w-12 h-12 bg-[#00ff66] hover:bg-[#00e059] rounded-full shadow-[0_0_15px_rgba(0,255,102,0.4)] hover:shadow-[0_0_25px_rgba(0,255,102,0.6)] hover:scale-105 transition-all duration-300 group cursor-pointer"
      aria-label="Falar no WhatsApp"
    >
      {/* Pulse ping animation */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#00ff66] opacity-75 animate-ping pointer-events-none group-hover:opacity-100" />
      
      {/* WhatsApp SVG Icon */}
      <svg
        className="w-6 h-6 text-black relative z-10"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.464L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.863-9.736.001-2.599-1.013-5.048-2.855-6.892-1.842-1.844-4.29-2.858-6.884-2.859-5.441 0-9.866 4.372-9.87 9.737 0 1.704.453 3.37 1.313 4.84l-.994 3.63 3.799-.975zm11.023-3.687c.297.166.495.247.554.347.059.099.059.578-.139 1.139-.198.562-1.168 1.099-1.614 1.139-.446.04-1.782.52-5.742-1.089-3.96-1.609-6.496-5.654-6.694-5.918-.198-.264-1.485-1.978-1.485-3.773 0-1.794.94-2.678 1.277-3.033.336-.355.742-.446 1.009-.446.267 0 .534.004.767.014.247.01.574-.092.891.666.327.782 1.118 2.68 1.217 2.88.099.2.166.429.033.693-.133.264-.267.43-.534.743-.267.313-.561.696-.803.957-.267.288-.547.604-.236 1.139.311.534 1.381 2.274 2.97 3.693 2.046 1.826 3.766 2.393 4.298 2.658.532.266.843.22.155.908-.43.43-1.83 2.129-2.316 2.855-.487.726-.974.604-1.782.303-.809-.302-3.418-1.258-6.516-4.005-2.402-2.133-4.022-4.768-4.492-5.578-.47-.809-.05-1.247.356-1.649.366-.363.809-.942.809-1.412 0-.47-.236-1.412-.487-2.016-.251-.604-.515-1.208-.809-1.208-.293 0-.586.04-.88.163-.293.123-1.127.872-1.397 1.485-.27.613-.396 1.579-.059 2.502.337.922 1.487 3.328 3.522 5.093l.366.303zm0 0" />
      </svg>
    </a>
  );
};
