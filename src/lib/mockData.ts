import { Product, Category, Banner } from '@/types';

// Mock Categories
export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Pods Descartáveis', slug: 'pods', active: true, created_at: '' },
  { id: '2', name: 'Essências (Juices)', slug: 'juices', active: true, created_at: '' },
  { id: '3', name: 'Resistências (Coils)', slug: 'coils', active: true, created_at: '' },
  { id: '4', name: 'Acessórios', slug: 'acessorios', active: true, created_at: '' },
];

// Mock Products
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    category_id: '1',
    name: 'Pod Descartável ElfBar BC10000 Puffs - Watermelon Ice',
    slug: 'pod-descartavel-elfbar-bc10000-watermelon-ice',
    description: 'O novo ElfBar BC10000 oferece até 10.000 puffs de sabor intenso de melancia gelada. Conta com bateria recarregável de 620mAh via cabo USB-C e visor digital de bateria e e-líquido.',
    short_description: '10.000 Puffs, Teor 5% (50mg), Recarregável, Visor Digital.',
    price: 139.90,
    promo_price: 119.90,
    stock: 12,
    active: true,
    created_at: '2026-05-20T00:00:00Z',
    updated_at: '2026-05-20T00:00:00Z',
    category: MOCK_CATEGORIES[0],
    product_images: [
      { id: 'img1', product_id: 'p1', image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&auto=format&fit=crop&q=80', is_main: true, created_at: '' }
    ]
  },
  {
    id: 'p2',
    category_id: '2',
    name: 'Juice Nasty Salt Cush Man Mango Grape 30ml',
    slug: 'juice-nasty-salt-cush-man-mango-grape-30ml',
    description: 'A clássica mistura de manga madura com uvas roxas selecionadas da linha Cush Man da Nasty Juice. Essência de sal de nicotina (SaltNic) perfeita para aparelhos do tipo Pod System.',
    short_description: 'SaltNic Premium, Teor 35mg, Sabor Frutado Refrescante.',
    price: 79.90,
    promo_price: 69.90,
    stock: 25,
    active: true,
    created_at: '2026-05-20T00:00:00Z',
    updated_at: '2026-05-20T00:00:00Z',
    category: MOCK_CATEGORIES[1],
    product_images: [
      { id: 'img2', product_id: 'p2', image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80', is_main: true, created_at: '' }
    ]
  },
  {
    id: 'p3',
    category_id: '1',
    name: 'Pod System Vaporesso XROS 4 Nano Premium',
    slug: 'pod-system-vaporesso-xros-4-nano-premium',
    description: 'Edição premium do XROS 4 Nano da Vaporesso. Aparelho com bateria integrada de 1000mAh, ajuste automático de potência de acordo com o cartucho, tela OLED interativa circular e fluxo de ar ajustável.',
    short_description: 'Bateria 1000mAh, Tela OLED Interativa, Ajuste de Ar, Top-Fill.',
    price: 299.90,
    promo_price: 269.90,
    stock: 8,
    active: true,
    created_at: '2026-05-20T00:00:00Z',
    updated_at: '2026-05-20T00:00:00Z',
    category: MOCK_CATEGORIES[0],
    product_images: [
      { id: 'img3', product_id: 'p3', image_url: 'https://images.unsplash.com/photo-1613141411244-0e4ac259d217?w=800&auto=format&fit=crop&q=80', is_main: true, created_at: '' }
    ]
  },
  {
    id: 'p4',
    category_id: '3',
    name: 'Resistência Vaporesso GTX Coil (Pack c/ 5 unidades)',
    slug: 'resistencia-vaporesso-gtx-coil-pack-5',
    description: 'Bobinas de reposição GTX da Vaporesso para aparelhos compatíveis (como Luxe, Target, Swag). Desenvolvida em mesh para entrega máxima de sabor e produção de nuvens densas.',
    short_description: 'Tecnologia Mesh, Alta Durabilidade, Pack com 5 Coils originais.',
    price: 119.90,
    promo_price: null,
    stock: 18,
    active: true,
    created_at: '2026-05-20T00:00:00Z',
    updated_at: '2026-05-20T00:00:00Z',
    category: MOCK_CATEGORIES[2],
    product_images: [
      { id: 'img4', product_id: 'p4', image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80', is_main: true, created_at: '' }
    ]
  }
];

// Mock Banners
export const MOCK_BANNERS: Banner[] = [
  {
    id: 'b1',
    title: 'NOVA GERAÇÃO ELFBAR',
    subtitle: 'Nuvens de sabor intenso e displays digitais inovadores.',
    image_url: 'https://images.unsplash.com/photo-1559583985-c80d8ad9b29f?w=1200&auto=format&fit=crop&q=80',
    link_url: '/categoria/pods',
    active: true,
    position: 0,
    created_at: ''
  }
];
