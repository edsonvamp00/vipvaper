/**
 * =================================================
 *  SEED COMPLETO - VIP VAPER MARKETPLACE
 *  Executa com: node scripts/seed-supabase.mjs
 * =================================================
 * 
 *  Este script cria:
 *  1. Usuário ADMIN (admin@vipvaper.com / VipVaper@2026)
 *  2. Usuário CLIENTE teste (cliente@vipvaper.com / Cliente@2026)
 *  3. Registro na tabela admin_users para o admin
 *  4. Categorias iniciais de produtos
 *  5. Produtos com imagens reais de alta qualidade
 *  6. Banners promocionais para o carrossel da Home
 *  7. Configurações da loja (nome, telefone, endereço, etc.)
 * 
 *  IMPORTANTE: Necessita da chave SUPABASE_SERVICE_ROLE_KEY no .env.local
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ---- Carregar variáveis do .env.local manualmente ----
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const content = readFileSync(envPath, 'utf-8');
    const vars = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      // Remove aspas
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      vars[key] = value;
    }
    return vars;
  } catch (err) {
    console.error('❌ Não foi possível ler o arquivo .env.local');
    process.exit(1);
  }
}

const env = loadEnv();

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('\n❌ ERRO: Falta a variável SUPABASE_SERVICE_ROLE_KEY no .env.local!');
  console.error('');
  console.error('   👉 Vá no Supabase → Settings → API');
  console.error('   👉 Copie a chave "service_role" (a secreta)');
  console.error('   👉 Cole no .env.local assim:');
  console.error('');
  console.error('   SUPABASE_SERVICE_ROLE_KEY="sua_chave_aqui"');
  console.error('');
  process.exit(1);
}

// Criar cliente Supabase com permissão SERVICE ROLE (total acesso)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// =============================================
// DADOS QUE SERÃO POPULADOS
// =============================================

const ADMIN_EMAIL = 'admin@vipvaper.com';
const ADMIN_PASSWORD = 'VipVaper@2026';
const ADMIN_NAME = 'Administrador VIP';
const ADMIN_PHONE = '5511999998888';

const CLIENTE_EMAIL = 'cliente@vipvaper.com';
const CLIENTE_PASSWORD = 'Cliente@2026';
const CLIENTE_NAME = 'Cliente Teste VIP';
const CLIENTE_PHONE = '5511988887777';

const CATEGORIAS = [
  { name: 'Pods Descartáveis', slug: 'pods', description: 'Dispositivos prontos para uso, sem manutenção.', active: true },
  { name: 'Essências (Juices)', slug: 'juices', description: 'Líquidos e essências premium com sabores exclusivos.', active: true },
  { name: 'Resistências (Coils)', slug: 'coils', description: 'Bobinas de reposição mesh e tradicionais para seus aparelhos.', active: true },
  { name: 'Acessórios', slug: 'acessorios', description: 'Cases, carregadores, adaptadores e peças de reposição.', active: true },
];

const STORE_SETTINGS = [
  { key: 'store_name', value: 'Vip Vaper', description: 'Nome oficial da loja' },
  { key: 'phone', value: '5511999998888', description: 'WhatsApp de atendimento' },
  { key: 'email', value: 'contato@vipvaper.com.br', description: 'E-mail administrativo' },
  { key: 'address', value: 'Av. Paulista, 1000 - Cerqueira César, São Paulo - SP', description: 'Endereço físico da loja' },
  { key: 'hours', value: 'Segunda a Sábado, das 09h às 21h', description: 'Horário de funcionamento' },
  { key: 'delivery_fee', value: '15.00', description: 'Taxa de entrega padrão' },
  { key: 'pix_key', value: 'contato@vipvaper.com.br', description: 'Chave Pix para pagamentos' },
  { key: 'pix_name', value: 'VIP VAPER LTDA', description: 'Nome do recebedor Pix' },
];

// =============================================
// FUNÇÕES DE SEED
// =============================================

async function log(emoji, msg) {
  console.log(`  ${emoji}  ${msg}`);
}

async function createUser(email, password, fullName, phone) {
  // Verifica se já existe
  const { data: existing } = await supabase.auth.admin.listUsers();
  const alreadyExists = existing?.users?.find(u => u.email === email);
  
  if (alreadyExists) {
    log('⚠️', `Usuário ${email} já existe (ID: ${alreadyExists.id}). Pulando criação.`);
    return alreadyExists;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Confirma o email automaticamente
    user_metadata: {
      full_name: fullName,
      phone: phone,
    },
  });

  if (error) {
    console.error(`❌ Erro ao criar usuário ${email}:`, error.message);
    return null;
  }

  log('✅', `Usuário criado: ${email} (ID: ${data.user.id})`);
  return data.user;
}

async function setAdminRole(userId) {
  // Verificar se já é admin
  const { data: existing } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    log('⚠️', `Usuário já está registrado como admin. Pulando.`);
    return;
  }

  const { error } = await supabase
    .from('admin_users')
    .insert({ user_id: userId, role: 'superadmin' });

  if (error) {
    console.error('❌ Erro ao definir role de admin:', error.message);
    return;
  }
  log('🛡️', `Registrado como SUPERADMIN na tabela admin_users.`);
}

async function seedCategories() {
  for (const cat of CATEGORIAS) {
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', cat.slug)
      .single();

    if (existing) {
      log('⚠️', `Categoria "${cat.name}" já existe. Pulando.`);
      continue;
    }

    const { error } = await supabase.from('categories').insert(cat);
    if (error) {
      console.error(`❌ Erro ao inserir categoria "${cat.name}":`, error.message);
    } else {
      log('📦', `Categoria "${cat.name}" criada.`);
    }
  }
}

async function seedProducts() {
  // Buscar IDs das categorias
  const { data: cats } = await supabase.from('categories').select('id, slug');
  if (!cats || cats.length === 0) {
    console.error('❌ Nenhuma categoria encontrada. Execute seedCategories primeiro.');
    return;
  }

  const catMap = {};
  cats.forEach(c => { catMap[c.slug] = c.id; });

  const PRODUTOS = [
    {
      category_id: catMap['pods'],
      name: 'Pod Descartável ElfBar BC10000 Puffs - Watermelon Ice',
      slug: 'pod-descartavel-elfbar-bc10000-watermelon-ice',
      description: 'O novo ElfBar BC10000 oferece até 10.000 puffs de sabor intenso de melancia gelada. Conta com bateria recarregável de 620mAh via cabo USB-C e visor digital de bateria e e-líquido.',
      short_description: '10.000 Puffs, Teor 5% (50mg), Recarregável, Visor Digital.',
      price: 139.90,
      promo_price: 119.90,
      stock: 12,
      active: true,
      image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&auto=format&fit=crop&q=80',
    },
    {
      category_id: catMap['juices'],
      name: 'Juice Nasty Salt Cush Man Mango Grape 30ml',
      slug: 'juice-nasty-salt-cush-man-mango-grape-30ml',
      description: 'A clássica mistura de manga madura com uvas roxas selecionadas da linha Cush Man da Nasty Juice. Essência de sal de nicotina (SaltNic) perfeita para aparelhos do tipo Pod System.',
      short_description: 'SaltNic Premium, Teor 35mg, Sabor Frutado Refrescante.',
      price: 79.90,
      promo_price: 69.90,
      stock: 25,
      active: true,
      image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
    },
    {
      category_id: catMap['pods'],
      name: 'Pod System Vaporesso XROS 4 Nano Premium',
      slug: 'pod-system-vaporesso-xros-4-nano-premium',
      description: 'Edição premium do XROS 4 Nano da Vaporesso. Aparelho com bateria integrada de 1000mAh, ajuste automático de potência de acordo com o cartucho, tela OLED interativa circular e fluxo de ar ajustável.',
      short_description: 'Bateria 1000mAh, Tela OLED Interativa, Ajuste de Ar, Top-Fill.',
      price: 299.90,
      promo_price: 269.90,
      stock: 8,
      active: true,
      image_url: 'https://images.unsplash.com/photo-1613141411244-0e4ac259d217?w=800&auto=format&fit=crop&q=80',
    },
    {
      category_id: catMap['coils'],
      name: 'Resistência Vaporesso GTX Coil (Pack c/ 5 unidades)',
      slug: 'resistencia-vaporesso-gtx-coil-pack-5',
      description: 'Bobinas de reposição GTX da Vaporesso para aparelhos compatíveis (como Luxe, Target, Swag). Desenvolvida em mesh para entrega máxima de sabor e produção de nuvens densas.',
      short_description: 'Tecnologia Mesh, Alta Durabilidade, Pack com 5 Coils originais.',
      price: 119.90,
      promo_price: null,
      stock: 18,
      active: true,
      image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    },
    {
      category_id: catMap['acessorios'],
      name: 'Case Protetor Cyberpunk Premium Universal',
      slug: 'case-protetor-cyberpunk-premium-universal',
      description: 'Case de proteção feito em silicone premium antideslizante para pods e mods de tamanho compacto. Design exclusivo cyberpunk com acabamento fosco e detalhes em neon.',
      short_description: 'Silicone Premium, Antideslizante, Design Cyberpunk, Universal.',
      price: 49.90,
      promo_price: 39.90,
      stock: 30,
      active: true,
      image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
    },
    {
      category_id: catMap['juices'],
      name: 'Essência Dinner Lady Lemon Tart Salt 30ml',
      slug: 'essencia-dinner-lady-lemon-tart-salt-30ml',
      description: 'A premiada essência Lemon Tart da Dinner Lady em versão SaltNic. Sabor de torta de limão caramelizada com merengue, premiada como o melhor e-liquid do mundo no Vaper Expo UK.',
      short_description: 'SaltNic 35mg, Torta de Limão, Premiada mundialmente.',
      price: 89.90,
      promo_price: 79.90,
      stock: 15,
      active: true,
      image_url: 'https://images.unsplash.com/photo-1560713781-d00e39e16adc?w=800&auto=format&fit=crop&q=80',
    },
  ];

  for (const prod of PRODUTOS) {
    const imgUrl = prod.image_url;
    delete prod.image_url; // Remover campo extra antes de inserir

    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', prod.slug)
      .single();

    if (existing) {
      log('⚠️', `Produto "${prod.name}" já existe. Pulando.`);
      continue;
    }

    const { data: inserted, error } = await supabase
      .from('products')
      .insert(prod)
      .select('id')
      .single();

    if (error) {
      console.error(`❌ Erro ao inserir produto "${prod.name}":`, error.message);
      continue;
    }

    log('🛒', `Produto "${prod.name}" criado.`);

    // Inserir imagem principal
    if (inserted) {
      const { error: imgError } = await supabase
        .from('product_images')
        .insert({
          product_id: inserted.id,
          image_url: imgUrl,
          is_main: true,
        });

      if (imgError) {
        console.error(`  ❌ Erro ao inserir imagem do produto:`, imgError.message);
      } else {
        log('🖼️', `  Imagem principal vinculada.`);
      }
    }
  }
}

async function seedBanners() {
  const BANNERS = [
    {
      title: 'NOVA GERAÇÃO ELFBAR',
      subtitle: 'Nuvens de sabor intenso e displays digitais de e-líquido.',
      image_url: 'https://images.unsplash.com/photo-1559583985-c80d8ad9b29f?w=1200&auto=format&fit=crop&q=80',
      link_url: '/categoria/pods',
      active: true,
      position: 0,
    },
    {
      title: 'NASTY JUICE CUSH MAN',
      subtitle: 'O autêntico sabor frutado da manga com uva e sal de nicotina.',
      image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1200&auto=format&fit=crop&q=80',
      link_url: '/categoria/juices',
      active: true,
      position: 1,
    },
    {
      title: 'VAPORESSO XROS 4 NANO',
      subtitle: 'Design de bolso, tela circular OLED interativa e bateria de 1000mAh.',
      image_url: 'https://images.unsplash.com/photo-1613141411244-0e4ac259d217?w=1200&auto=format&fit=crop&q=80',
      link_url: '/categoria/pods',
      active: true,
      position: 2,
    },
    {
      title: 'RESISTÊNCIAS MESH GTX',
      subtitle: 'Entrega máxima de sabor e produção de nuvens densas e duradouras.',
      image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
      link_url: '/categoria/coils',
      active: true,
      position: 3,
    },
    {
      title: 'ACESSÓRIOS & CASES TECH',
      subtitle: 'Proteja e personalize seu vape com o melhor da cultura cyberpunk.',
      image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&auto=format&fit=crop&q=80',
      link_url: '/categoria/acessorios',
      active: true,
      position: 4,
    },
  ];

  // Verificar se já existem banners
  const { data: existing } = await supabase.from('banners').select('id');
  if (existing && existing.length > 0) {
    log('⚠️', `Já existem ${existing.length} banners no banco. Pulando seed de banners.`);
    return;
  }

  for (const banner of BANNERS) {
    const { error } = await supabase.from('banners').insert(banner);
    if (error) {
      console.error(`❌ Erro ao inserir banner "${banner.title}":`, error.message);
    } else {
      log('🎠', `Banner "${banner.title}" criado.`);
    }
  }
}

async function seedStoreSettings() {
  for (const setting of STORE_SETTINGS) {
    const { error } = await supabase
      .from('store_settings')
      .upsert(setting, { onConflict: 'key' });

    if (error) {
      console.error(`❌ Erro ao definir configuração "${setting.key}":`, error.message);
    } else {
      log('⚙️', `Configuração "${setting.key}" = "${setting.value}"`);
    }
  }
}

// =============================================
// EXECUÇÃO PRINCIPAL
// =============================================

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║     🚀 VIP VAPER - SEED SUPABASE COMPLETO   ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');

  // 1. Criar usuário ADMIN
  console.log('━━━ PASSO 1: Criando Usuário Administrador ━━━');
  const adminUser = await createUser(ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_PHONE);
  if (adminUser) {
    await setAdminRole(adminUser.id);
  }
  console.log('');

  // 2. Criar usuário CLIENTE
  console.log('━━━ PASSO 2: Criando Usuário Cliente de Teste ━━━');
  await createUser(CLIENTE_EMAIL, CLIENTE_PASSWORD, CLIENTE_NAME, CLIENTE_PHONE);
  console.log('');

  // 3. Seed de Categorias
  console.log('━━━ PASSO 3: Populando Categorias ━━━');
  await seedCategories();
  console.log('');

  // 4. Seed de Produtos
  console.log('━━━ PASSO 4: Populando Produtos com Imagens Reais ━━━');
  await seedProducts();
  console.log('');

  // 5. Seed de Banners
  console.log('━━━ PASSO 5: Populando Banners do Carrossel ━━━');
  await seedBanners();
  console.log('');

  // 6. Seed de Configurações
  console.log('━━━ PASSO 6: Configurações da Loja ━━━');
  await seedStoreSettings();
  console.log('');

  // Resultado final
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║        ✅ SEED CONCLUÍDO COM SUCESSO!        ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
  console.log('  📧 LOGIN ADMIN:');
  console.log(`     E-mail: ${ADMIN_EMAIL}`);
  console.log(`     Senha:  ${ADMIN_PASSWORD}`);
  console.log('');
  console.log('  📧 LOGIN CLIENTE:');
  console.log(`     E-mail: ${CLIENTE_EMAIL}`);
  console.log(`     Senha:  ${CLIENTE_PASSWORD}`);
  console.log('');
  console.log('  ⚠️  TROQUE AS SENHAS ASSIM QUE POSSÍVEL!');
  console.log('');
}

main().catch(console.error);
