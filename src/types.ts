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

export type OrderStatus = 'Pending' | 'Processing' | 'Completed';

export interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  product_id: string;
  quantity: number;
  total_price: number;
  status: OrderStatus;
  product?: Product; // For joined data
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}
