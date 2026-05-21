'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MobileShell } from '@/components/common/MobileShell';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, Key, Mail, Terminal } from 'lucide-react';

const MASTER_ADMIN_EMAILS = ['admin@vipvaper.com', 'admin@vipviper.com'];

async function verifyAdmin(userId: string, userEmail: string): Promise<boolean> {
  if (MASTER_ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
    return true;
  }
  try {
    const { data } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .single();
    return !!data;
  } catch {
    return false;
  }
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [checkingSession, setCheckingSession] = useState(false);

  // On mount: if already logged in as admin, redirect to dashboard in background
  useEffect(() => {
    // Clean up any old demo flags
    localStorage.removeItem('vip_vaper_demo_admin');
    localStorage.removeItem('vip_admin_verified');

    async function checkExistingSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Add a safety timeout so verifyAdmin doesn't hang the transition
          const verifyPromise = verifyAdmin(session.user.id, session.user.email || '');
          const timeoutPromise = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2000));
          
          const isAdmin = await Promise.race([verifyPromise, timeoutPromise]);
          if (isAdmin) {
            window.location.href = '/admin/dashboard';
            return;
          } else {
            // Logged in but not admin — sign out to clean state
            await supabase.auth.signOut();
          }
        }
      } catch (err) {
        console.error("Erro na verificação de sessão existente:", err);
      }
    }
    checkExistingSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const user = data.user;
      if (!user) throw new Error('Usuário não encontrado.');

      // Add a safety timeout for login verification as well
      const verifyPromise = verifyAdmin(user.id, user.email || '');
      const timeoutPromise = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 3000));
      const isAdmin = await Promise.race([verifyPromise, timeoutPromise]);

      if (isAdmin) {
        window.location.href = '/admin/dashboard';
      } else {
        await supabase.auth.signOut();
        setErrorMsg('Acesso negado: este usuário não tem privilégios de administrador.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao efetuar login. Verifique e-mail e senha.');
      setLoading(false);
    }
  };

  return (
    <MobileShell showHeader={false} showBottomNav={false}>
      <div className="flex flex-col flex-1 justify-center py-6">
        
        <Link 
          href="/" 
          className="w-fit p-2 bg-[#0c0c0f] border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-red-500/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
            <Terminal className="w-5 h-5 text-red-500" />
          </div>
          <span className="font-cyber-orbitron text-[9px] font-black text-red-500 tracking-widest uppercase block mb-1">
            [ ACESSO RESTRITO - NÍVEL 3 ]
          </span>
          <h1 className="font-cyber-orbitron text-lg font-black text-white uppercase tracking-wider">
            Painel Admin
          </h1>
        </div>

        <form onSubmit={handleLogin} className="bg-[#09090c] border border-zinc-900 rounded-2xl p-5 mb-6 flex flex-col gap-4 relative">
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-red-500" />
          
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-cyber-inter rounded-lg flex items-start gap-2 leading-relaxed">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">E-mail Corporativo</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@vipvaper.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 pl-9 text-xs text-white focus:outline-none focus:border-red-500/30 font-cyber-inter"
              />
              <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Senha de Criptografia</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 pl-9 text-xs text-white focus:outline-none focus:border-red-500/30 font-cyber-inter"
              />
              <Key className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-red-500 border border-red-500 text-white font-cyber-orbitron font-black text-[11px] tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.3)] transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'AUTENTICANDO...' : 'ACESSAR DASHBOARD'}
          </button>
        </form>

      </div>
    </MobileShell>
  );
}
