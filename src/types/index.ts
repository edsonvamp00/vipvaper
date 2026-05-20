export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  user_id: string;
  role: 'admin' | 'superadmin';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  promo_price?: number | null;
  stock: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  // Joins
  category?: Category;
  product_images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_main: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'preparing' | 'shipped' | 'completed' | 'cancelled';
  subtotal: number;
  total: number;
  delivery_address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  delivery_method: 'local_delivery' | 'pickup';
  payment_method: 'pix' | 'card_on_delivery' | 'cash';
  contact_name: string;
  contact_phone: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  order_items?: OrderItem[];
  profile?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Banner {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  image_url: string;
  link_url?: string | null;
  active: boolean;
  position: number;
  created_at: string;
}

export interface StoreSettings {
  store_name: string;
  logo_url?: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
}
