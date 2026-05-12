import { api } from './client';

export type ProductCategory =
  | 'representacion'
  | 'patrocinio'
  | 'organizacion_eventos'
  | 'comunicacion'
  | 'marketing_digital'
  | 'consultoria'
  | 'otro';

export interface Product {
  _id: string;
  name: string;
  category: ProductCategory;
  description?: string;
  basePriceEUR: number;
  isActive: boolean;
  unitsSold: number;
  revenueEUR: number;
  createdAt: string;
}

export const listProducts = async () =>
  (await api.get<{ items: Product[]; total: number }>('/products')).data;
export const createProduct = async (p: Partial<Product>) =>
  (await api.post<Product>('/products', p)).data;
export const updateProduct = async (id: string, p: Partial<Product>) =>
  (await api.put<Product>(`/products/${id}`, p)).data;
export const deleteProduct = async (id: string) => {
  await api.delete(`/products/${id}`);
};
