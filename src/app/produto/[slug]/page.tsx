import React from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { ProductDetailClient } from '@/components/ui/ProductDetailClient';

interface ProdutoPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60; // Cache for 60 seconds

async function getProductData(slug: string) {
  try {
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*, category:categories(*), product_images(*)')
      .eq('slug', slug)
      .single();

    if (productError || !productData) {
      return { product: undefined, reviews: [] };
    }

    const { data: reviewsData } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productData.id)
      .eq('approved', true)
      .order('created_at', { ascending: false });

    return {
      product: productData as Product,
      reviews: reviewsData || []
    };
  } catch (err) {
    console.error('Erro ao buscar produto:', err);
    return { product: undefined, reviews: [] };
  }
}

export default async function ProdutoDetalhePage({ params }: ProdutoPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const { product, reviews } = await getProductData(slug);

  return <ProductDetailClient product={product} initialReviews={reviews} />;
}
