export interface Product {
  id: string;
  created_at: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  image_url: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}
