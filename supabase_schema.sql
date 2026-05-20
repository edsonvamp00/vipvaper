-- ==========================================
-- SCHEMA SQL COMPLETO PARA SUPABASE (VIP VAPER)
-- ==========================================

-- Habilitar extensão para geração de UUIDs, se não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. CRIAÇÃO DAS TABELAS
-- ==========================================

-- Tabela: profiles (Perfis de Clientes sincronizados com Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: admin_users (Identificação de Administradores)
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'admin'::text NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_role CHECK (role IN ('admin', 'superadmin'))
);

-- Tabela: categories (Categorias dos Produtos)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: products (Produtos do Marketplace)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    promo_price NUMERIC(10, 2) CHECK (promo_price >= 0),
    stock INTEGER DEFAULT 0 NOT NULL CHECK (stock >= 0),
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_promo_price CHECK (promo_price IS NULL OR promo_price < price)
);

-- Tabela: product_images (Galeria de fotos por produto)
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    is_main BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: favorites (Produtos favoritos por cliente)
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- Tabela: orders (Pedidos dos clientes)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending'::text NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    delivery_address JSONB NOT NULL,
    delivery_method TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_status CHECK (status IN ('pending', 'preparing', 'shipped', 'completed', 'cancelled')),
    CONSTRAINT check_delivery_method CHECK (delivery_method IN ('local_delivery', 'pickup')),
    CONSTRAINT check_payment_method CHECK (payment_method IN ('pix', 'card_on_delivery', 'cash'))
);

-- Tabela: order_items (Itens de cada pedido)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: banners (Banners promocionais da Home)
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    active BOOLEAN DEFAULT true NOT NULL,
    position INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: store_settings (Configurações globais da loja)
CREATE TABLE IF NOT EXISTS public.store_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar publicação em tempo real para pedidos (opcional, para atualizações rápidas)
alter publication supabase_realtime add table public.orders;

-- ==========================================
-- 2. FUNÇÕES E TRIGGERS DE SEGURANÇA
-- ==========================================

-- Função auxiliar: verificar se usuário é administrador
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users WHERE public.admin_users.user_id = $1
    );
END;
$$ LANGUAGE plpgsql;

-- Função: criar perfil automaticamente ao cadastrar novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Cliente Vip'),
        new.email,
        COALESCE(new.raw_user_meta_data->>'phone', ''),
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Executar handle_new_user após cadastro
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. POLÍTICAS DE ACESSO (RLS POLICIES)
-- ==========================================

-- Políticas: profiles
CREATE POLICY "Qualquer um pode ler perfis para validações" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem editar seu próprio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins podem fazer tudo nos perfis" ON public.profiles
    FOR ALL USING (public.is_admin(auth.uid()));

-- Políticas: admin_users
CREATE POLICY "Qualquer usuário autenticado pode verificar se é admin" ON public.admin_users
    FOR SELECT USING (true);

CREATE POLICY "Apenas admins (superadmin) gerenciam a equipe admin" ON public.admin_users
    FOR ALL USING (public.is_admin(auth.uid()));

-- Políticas: categories
CREATE POLICY "Leitura pública de categorias ativas" ON public.categories
    FOR SELECT USING (active = true OR public.is_admin(auth.uid()));

CREATE POLICY "Apenas admins manipulam categorias" ON public.categories
    FOR ALL USING (public.is_admin(auth.uid()));

-- Políticas: products
CREATE POLICY "Leitura pública de produtos ativos" ON public.products
    FOR SELECT USING (active = true OR public.is_admin(auth.uid()));

CREATE POLICY "Apenas admins manipulam produtos" ON public.products
    FOR ALL USING (public.is_admin(auth.uid()));

-- Políticas: product_images
CREATE POLICY "Leitura pública de imagens de produtos" ON public.product_images
    FOR SELECT USING (true);

CREATE POLICY "Apenas admins manipulam imagens" ON public.product_images
    FOR ALL USING (public.is_admin(auth.uid()));

-- Políticas: favorites
CREATE POLICY "Usuários leem seus próprios favoritos" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários criam seus próprios favoritos" ON public.favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários deletam seus próprios favoritos" ON public.favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas: orders
CREATE POLICY "Clientes visualizam seus próprios pedidos" ON public.orders
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Clientes podem criar pedidos" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins gerenciam todos os pedidos" ON public.orders
    FOR ALL USING (public.is_admin(auth.uid()));

-- Políticas: order_items
CREATE POLICY "Clientes visualizam os itens de seus pedidos" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE public.orders.id = order_items.order_id 
            AND (public.orders.user_id = auth.uid() OR public.is_admin(auth.uid()))
        )
    );

CREATE POLICY "Clientes criam itens para seus pedidos" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE public.orders.id = order_items.order_id 
            AND (public.orders.user_id = auth.uid() OR public.is_admin(auth.uid()))
        )
    );

CREATE POLICY "Admins gerenciam itens dos pedidos" ON public.order_items
    FOR ALL USING (public.is_admin(auth.uid()));

-- Políticas: banners
CREATE POLICY "Leitura pública de banners ativos" ON public.banners
    FOR SELECT USING (active = true OR public.is_admin(auth.uid()));

CREATE POLICY "Apenas admins gerenciam banners" ON public.banners
    FOR ALL USING (public.is_admin(auth.uid()));

-- Políticas: store_settings
CREATE POLICY "Leitura pública de configurações" ON public.store_settings
    FOR SELECT USING (true);

CREATE POLICY "Apenas admins gerenciam configurações" ON public.store_settings
    FOR ALL USING (public.is_admin(auth.uid()));

-- ==========================================
-- 5. POPULAÇÃO INICIAL (MOCK DATA)
-- ==========================================

-- Configurações padrão
INSERT INTO public.store_settings (key, value, description) VALUES
('store_name', 'Vip Vaper', 'Nome oficial da loja'),
('phone', '5511999998888', 'WhatsApp de atendimento'),
('email', 'contato@vipvaper.com.br', 'E-mail administrativo'),
('address', 'Av. Paulista, 1000 - Cerqueira César, São Paulo - SP', 'Endereço físico da loja'),
('hours', 'Segunda a Sábado, das 09h às 21h', 'Horário de funcionamento')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ==========================================
-- 6. CONFIGURAÇÃO DE STORAGE (BUCKETS & POLICIES)
-- ==========================================

-- Inserir o bucket 'vape-images' caso não exista na tabela de buckets do Supabase Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vape-images', 'vape-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para o bucket 'vape-images'
CREATE POLICY "Leitura pública de imagens" ON storage.objects
    FOR SELECT USING (bucket_id = 'vape-images');

CREATE POLICY "Admins podem inserir imagens" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'vape-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins podem atualizar imagens" ON storage.objects
    FOR UPDATE USING (bucket_id = 'vape-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins podem deletar imagens" ON storage.objects
    FOR DELETE USING (bucket_id = 'vape-images' AND public.is_admin(auth.uid()));

-- ==========================================
-- 7. TABELA DE COMENTÁRIOS E AVALIAÇÕES (REVIEWS)
-- ==========================================

-- Tabela: product_reviews (Comentários e Avaliações de Produtos)
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    approved BOOLEAN DEFAULT false NOT NULL, -- Oculto por padrão até moderação do admin!
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para avaliações
CREATE POLICY "Qualquer um pode ler avaliações aprovadas" ON public.product_reviews
    FOR SELECT USING (approved = true OR public.is_admin(auth.uid()));

CREATE POLICY "Qualquer um pode cadastrar avaliações" ON public.product_reviews
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins gerenciam e moderam avaliações" ON public.product_reviews
    FOR ALL USING (public.is_admin(auth.uid()));
