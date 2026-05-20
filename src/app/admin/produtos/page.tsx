'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { MobileShell } from '@/components/common/MobileShell';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mockData';
import { Product, Category } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Plus, Search, Trash2, Edit, Save, X, PlusCircle, Check } from 'lucide-react';

export default function AdminProductsPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  
  // Editor state
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [formImage, setFormImage] = useState('');

  useEffect(() => {
    // Safety timeout — if anything hangs, just show the products after 3s
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
      
      // Load categories
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (catErr) throw catErr;
      setCategories(catData || MOCK_CATEGORIES);

      // Load products
      const { data: prodData, error: prodErr } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          product_images(*)
        `)
        .order('created_at', { ascending: false });

      if (prodErr) throw prodErr;
      
      if (prodData) {
        setProducts(prodData);
      } else {
        setProducts(MOCK_PRODUCTS);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do Supabase, utilizando dados locais (Demo):', err);
      setIsDemo(true);
      setProducts(MOCK_PRODUCTS);
      setCategories(MOCK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  // Filtered products list
  const filteredProducts = products.filter(prod => 
    prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.short_description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsNew(false);
    setFormImage(product.product_images?.[0]?.image_url ?? '');
  };

  const handleNew = () => {
    setEditingProduct({
      name: '',
      slug: '',
      description: '',
      short_description: '',
      price: 0,
      promo_price: null,
      stock: 10,
      active: true,
      category_id: categories[0]?.id ?? '1',
    });
    setIsNew(true);
    setFormImage('https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&auto=format&fit=crop&q=80'); // Default template image
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este produto?')) return;

    if (isDemo) {
      setProducts(products.filter(p => p.id !== id));
      alert('Produto removido localmente (Modo Demo)');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== id));
      alert('Produto excluído com sucesso!');
    } catch (err: any) {
      alert('Erro ao excluir produto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Generate slug from name
    const slug = editingProduct.name
      ? editingProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : 'produto-novo';

    const productData = {
      ...editingProduct,
      slug,
      price: Number(editingProduct.price),
      promo_price: editingProduct.promo_price ? Number(editingProduct.promo_price) : null,
      stock: Number(editingProduct.stock),
    };

    if (isDemo) {
      if (isNew) {
        const newId = 'p_demo_' + Date.now();
        const category = categories.find(c => c.id === productData.category_id) || categories[0];
        const newProduct: Product = {
          ...(productData as Product),
          id: newId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          category,
          product_images: [{ id: 'img_' + newId, product_id: newId, image_url: formImage, is_main: true, created_at: '' }]
        };
        setProducts([newProduct, ...products]);
        alert('Produto adicionado localmente (Modo Demo)');
      } else {
        const category = categories.find(c => c.id === productData.category_id) || categories[0];
        setProducts(products.map(p => p.id === editingProduct.id ? {
          ...(productData as Product),
          category,
          product_images: [{ id: 'img_' + p.id, product_id: p.id, image_url: formImage, is_main: true, created_at: '' }]
        } : p));
        alert('Produto atualizado localmente (Modo Demo)');
      }
      setEditingProduct(null);
      return;
    }

    try {
      setLoading(true);
      
      if (isNew) {
        // Insert product
        const { data: inserted, error: prodErr } = await supabase
          .from('products')
          .insert([{
            category_id: productData.category_id,
            name: productData.name,
            slug,
            description: productData.description,
            short_description: productData.short_description,
            price: productData.price,
            promo_price: productData.promo_price,
            stock: productData.stock,
            active: productData.active
          }])
          .select()
          .single();

        if (prodErr) throw prodErr;

        // Insert image
        if (inserted && formImage) {
          const { error: imgErr } = await supabase
            .from('product_images')
            .insert([{
              product_id: inserted.id,
              image_url: formImage,
              is_main: true
            }]);
          
          if (imgErr) throw imgErr;
        }

        alert('Produto cadastrado com sucesso!');
      } else {
        // Update product
        const { error: prodErr } = await supabase
          .from('products')
          .update({
            category_id: productData.category_id,
            name: productData.name,
            slug,
            description: productData.description,
            short_description: productData.short_description,
            price: productData.price,
            promo_price: productData.promo_price,
            stock: productData.stock,
            active: productData.active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProduct.id);

        if (prodErr) throw prodErr;

        // Manage main image
        if (formImage) {
          // Check if image exists
          const { data: existingImgs } = await supabase
            .from('product_images')
            .select('*')
            .eq('product_id', editingProduct.id);

          if (existingImgs && existingImgs.length > 0) {
            await supabase
              .from('product_images')
              .update({ image_url: formImage })
              .eq('id', existingImgs[0].id);
          } else {
            await supabase
              .from('product_images')
              .insert([{
                product_id: editingProduct.id,
                image_url: formImage,
                is_main: true
              }]);
          }
        }

        alert('Produto atualizado com sucesso!');
      }
      
      setEditingProduct(null);
      loadData();
    } catch (err: any) {
      alert('Erro ao salvar produto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && products.length === 0) {
    return (
      <MobileShell showHeader={false} showBottomNav={false}>
        <div className="flex flex-col items-center justify-center py-40">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-red-500 animate-spin mb-4" />
          <span className="font-cyber-orbitron text-[9px] font-black text-zinc-500 uppercase tracking-widest">
            CARREGANDO PRODUTOS...
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
          VIP<span className="text-red-500">PRODUTOS</span>
        </span>
      </div>

      {isDemo && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[9px] font-cyber-inter rounded-lg mb-4 text-center">
          Operando em <b>Modo Demonstração</b> com dados locais.
        </div>
      )}

      {/* Editor Overlay / Form */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form 
            onSubmit={handleSave}
            className="w-full max-w-md bg-[#09090c] border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 relative my-auto shadow-[0_10px_50px_rgba(0,0,0,0.8)]"
          >
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-red-500" />
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="font-cyber-orbitron text-xs font-black text-white uppercase tracking-wider">
                {isNew ? '[ NOVO PRODUTO ]' : '[ EDITAR PRODUTO ]'}
              </h3>
              <button 
                type="button" 
                onClick={() => setEditingProduct(null)} 
                className="p-1 rounded bg-zinc-900 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-3.5 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
              <div>
                <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Nome do Produto</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500/30 font-cyber-inter"
                  placeholder="Ex: Pod Descartável ElfBar BC10000"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Preço Normal (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                    className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500/30 font-cyber-inter"
                    placeholder="120.00"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Preço Promo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.promo_price === null ? '' : editingProduct.promo_price}
                    onChange={(e) => setEditingProduct({...editingProduct, promo_price: e.target.value ? parseFloat(e.target.value) : null})}
                    className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500/30 font-cyber-inter"
                    placeholder="Deixe em branco se não houver"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Estoque (Qtd)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock === undefined ? 10 : editingProduct.stock}
                    onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                    className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500/30 font-cyber-inter"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Categoria</label>
                  <select
                    value={editingProduct.category_id || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, category_id: e.target.value})}
                    className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500/30 font-cyber-inter"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Link da Imagem Real (Unsplash/URL)</label>
                <input
                  type="text"
                  required
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500/30 font-cyber-inter"
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              <div>
                <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Descrição Curta (Especificações)</label>
                <input
                  type="text"
                  value={editingProduct.short_description || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, short_description: e.target.value})}
                  className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500/30 font-cyber-inter"
                  placeholder="Ex: 10.000 Puffs, Teor 5% (50mg), Recarregável."
                />
              </div>

              <div>
                <label className="text-[9px] font-cyber-orbitron text-zinc-500 uppercase block mb-1">Descrição Completa</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500/30 font-cyber-inter resize-none"
                  placeholder="Escreva a descrição comercial detalhada do produto..."
                />
              </div>

              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="prod_active"
                  checked={editingProduct.active !== false}
                  onChange={(e) => setEditingProduct({...editingProduct, active: e.target.checked})}
                  className="rounded border-zinc-800 bg-[#0c0c0f] text-red-500 focus:ring-0 w-4 h-4 accent-red-500"
                />
                <label htmlFor="prod_active" className="text-[10px] font-cyber-orbitron text-zinc-300 uppercase select-none cursor-pointer">
                  PRODUTO ATIVO NO MARKETPLACE
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 border-t border-zinc-900 pt-3.5 mt-2">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
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

      {/* Main UI list */}
      <div className="flex flex-col gap-4">
        {/* Actions bar (Search & Add) */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Pesquisar pod, juice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-xl px-3 py-2.5 pl-9 text-xs text-zinc-300 focus:outline-none focus:border-red-500/30 transition-all font-cyber-inter"
            />
            <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-zinc-500" />
          </div>
          <button
            onClick={handleNew}
            className="px-4 bg-red-500 hover:bg-red-600 rounded-xl text-white font-cyber-orbitron font-black text-[10px] tracking-wider uppercase flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            NOVO
          </button>
        </div>

        {/* Products Table/List */}
        <div className="flex flex-col gap-3 mt-2 pb-10">
          <span className="font-cyber-orbitron text-[9px] font-black text-zinc-500 uppercase tracking-widest">
            {filteredProducts.length} Produtos cadastrados
          </span>

          {filteredProducts.length === 0 ? (
            <div className="py-12 border border-dashed border-zinc-800 rounded-2xl text-center">
              <p className="font-cyber-orbitron text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                Nenhum produto cadastrado
              </p>
              <p className="font-cyber-inter text-[10px] text-zinc-600">
                Altere seus filtros de busca ou adicione um novo pod.
              </p>
            </div>
          ) : (
            filteredProducts.map((prod) => {
              const imgUrl = prod.product_images?.[0]?.image_url ?? 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&auto=format&fit=crop&q=80';
              return (
                <div 
                  key={prod.id}
                  className="p-3.5 bg-[#09090c] border border-zinc-900 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    {/* Small image preview */}
                    <div className="w-12 h-12 rounded-lg bg-zinc-950 overflow-hidden border border-zinc-900 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={imgUrl} 
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[8px] font-cyber-orbitron text-red-500 font-bold uppercase tracking-wider">
                        {prod.category?.name ?? 'Categoria'}
                      </span>
                      <h4 className="font-cyber-inter text-xs font-bold text-white line-clamp-1 leading-snug">
                        {prod.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-cyber-orbitron text-[10px] text-[#00ff66] font-black">
                          R$ {(prod.promo_price || prod.price).toFixed(2)}
                        </span>
                        <span className="text-[9px] font-cyber-inter text-zinc-500">
                          Estoque: <b className={prod.stock === 0 ? 'text-red-500' : 'text-zinc-300'}>{prod.stock}</b>
                        </span>
                        {!prod.active && (
                          <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 font-cyber-orbitron text-[7px] font-black rounded border border-red-500/20">
                            INATIVO
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEdit(prod)}
                      className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-[#00f0ff] hover:border-[#00f0ff]/20 transition-all duration-200"
                      aria-label="Editar produto"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id)}
                      className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-500 hover:border-red-500/20 transition-all duration-200"
                      aria-label="Excluir produto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </MobileShell>
  );
}
