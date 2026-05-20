'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { MobileShell } from '@/components/common/MobileShell';
import { MOCK_CATEGORIES } from '@/lib/mockData';
import { Category } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Edit, Save, X, Layers, Check } from 'lucide-react';

export default function AdminCategoriesPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Editor state
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    // Safety timeout — if anything hangs, just show the categories after 3s
    const safetyTimeout = setTimeout(() => setLoading(false), 3000);

    supabase.auth.getSession().then(({ data }) => {
      clearTimeout(safetyTimeout);
      if (data.session?.user) {
        loadData();
      } else {
        window.location.href = '/admin/login';
      }
    }).catch(() => {
      clearTimeout(safetyTimeout);
      window.location.href = '/admin/login';
    });

    return () => clearTimeout(safetyTimeout);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setCategories(data);
      } else {
        setCategories(MOCK_CATEGORIES);
      }
    } catch (err) {
      console.error('Erro ao carregar categorias do Supabase, utilizando dados locais:', err);
      setIsDemo(true);
      setCategories(MOCK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsNew(false);
  };

  const handleNew = () => {
    setEditingCategory({
      name: '',
      slug: '',
      active: true,
    });
    setIsNew(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta categoria? Atenção: Isso pode desvincular produtos!')) return;

    if (isDemo) {
      setCategories(categories.filter(c => c.id !== id));
      alert('Categoria removida localmente (Modo Demo)');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCategories(categories.filter(c => c.id !== id));
      alert('Categoria excluída com sucesso!');
    } catch (err: any) {
      alert('Erro ao excluir categoria: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name) return;

    // Generate slug from name
    const slug = editingCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const categoryData = {
      ...editingCategory,
      slug,
    };

    if (isDemo) {
      if (isNew) {
        const newId = 'c_demo_' + Date.now();
        const newCat: Category = {
          ...(categoryData as Category),
          id: newId,
          created_at: new Date().toISOString()
        };
        setCategories([...categories, newCat]);
        alert('Categoria adicionada localmente (Modo Demo)');
      } else {
        setCategories(categories.map(c => c.id === editingCategory.id ? {
          ...(categoryData as Category)
        } : c));
        alert('Categoria atualizada localmente (Modo Demo)');
      }
      setEditingCategory(null);
      return;
    }

    try {
      setLoading(true);
      
      if (isNew) {
        const { error } = await supabase
          .from('categories')
          .insert([{
            name: categoryData.name,
            slug,
            active: categoryData.active
          }]);

        if (error) throw error;
        alert('Categoria cadastrada com sucesso!');
      } else {
        const { error } = await supabase
          .from('categories')
          .update({
            name: categoryData.name,
            slug,
            active: categoryData.active
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        alert('Categoria atualizada com sucesso!');
      }
      
      setEditingCategory(null);
      loadData();
    } catch (err: any) {
      alert('Erro ao salvar categoria: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <MobileShell showHeader={false} showBottomNav={false}>
        <div className="flex flex-col items-center justify-center py-40">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-red-500 animate-spin mb-4" />
          <span className="font-cyber-orbitron text-[9px] font-black text-zinc-500 uppercase tracking-widest">
            CARREGANDO CATEGORIAS...
          </span>
        </div>
      </MobileShell>
    );
  }

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
          VIP<span className="text-red-500">CATEGORIAS</span>
        </span>
      </div>

      {isDemo && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[9px] font-cyber-inter rounded-lg mb-4 text-center">
          Operando em <b>Modo Demonstração</b> com dados locais.
        </div>
      )}

      {/* Editor Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleSave}
            className="w-full max-w-sm bg-[#09090c] border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 relative my-auto shadow-[0_10px_50px_rgba(0,0,0,0.8)]"
          >
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-red-500" />
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="font-cyber-orbitron text-xs font-black text-white uppercase tracking-wider">
                {isNew ? '[ NOVA CATEGORIA ]' : '[ EDITAR CATEGORIA ]'}
              </h3>
              <button 
                type="button" 
                onClick={() => setEditingCategory(null)} 
                className="p-1 rounded bg-zinc-900 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              <div>
                <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Nome da Categoria</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500/30 font-cyber-inter"
                  placeholder="Ex: Pods Descartáveis"
                />
              </div>

              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="cat_active"
                  checked={editingCategory.active !== false}
                  onChange={(e) => setEditingCategory({...editingCategory, active: e.target.checked})}
                  className="rounded border-zinc-800 bg-[#0c0c0f] text-red-500 focus:ring-0 w-4 h-4 accent-red-500"
                />
                <label htmlFor="cat_active" className="text-[10px] font-cyber-orbitron text-zinc-300 uppercase select-none cursor-pointer">
                  CATEGORIA ATIVA NA LOJA
                </label>
              </div>
            </div>

            <div className="flex gap-3 border-t border-zinc-900 pt-3.5 mt-2">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="flex-1 py-2.5 px-4 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 font-cyber-orbitron font-bold text-[10px] uppercase transition-colors"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-lg bg-red-500 border border-red-500 text-white font-cyber-orbitron font-black text-[10px] uppercase shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                SALVAR
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="font-cyber-orbitron text-[9px] font-black text-zinc-500 uppercase tracking-widest">
            {categories.length} Categorias cadastradas
          </span>
          <button
            onClick={handleNew}
            className="py-2.5 px-4 bg-red-500 hover:bg-red-600 rounded-xl text-white font-cyber-orbitron font-black text-[10px] tracking-wider uppercase flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            NOVA CATEGORIA
          </button>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          {categories.map((cat) => (
            <div 
              key={cat.id}
              className="p-3.5 bg-[#09090c] border border-zinc-900 rounded-xl flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-900 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-cyber-inter text-xs font-bold text-white leading-snug">
                    {cat.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[8px] font-cyber-orbitron text-zinc-500">
                      SLUG: {cat.slug}
                    </span>
                    <span className={`px-1.5 py-0.5 text-[7px] font-cyber-orbitron font-black rounded border ${
                      cat.active 
                        ? 'bg-[#00ff66]/10 border-[#00ff66]/20 text-[#00ff66]' 
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      {cat.active ? 'ATIVA' : 'INATIVA'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleEdit(cat)}
                  className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-[#00f0ff] hover:border-[#00f0ff]/20 transition-all duration-200"
                  aria-label="Editar categoria"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-500 hover:border-red-500/20 transition-all duration-200"
                  aria-label="Excluir categoria"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
