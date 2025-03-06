export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: Date;
  type: string;
}

export interface MarketPrices {
  id: string;
  wholesale: number;
  mmr: number;
  retail: number;
  repasse: number;
}

export interface SaleInfo {
  id: string;
  saleDate: Date;
  salePrice: number;
  saleType: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  mileage: number;
  status: 'acquired' | 'in_preparation' | 'for_sale' | 'sold';
  purchasePrice: number;
  retailPrice?: number;
  wholesalePrice?: number;
  mmrPrice?: number;
  resalePrice?: number;
  description?: string;
  images: {
    url: string;
    id: string;
  }[];
  expenses?: {
    id: string;
    description: string;
    amount: number;
    date: string;
  }[];
  saleInfo?: {
    salePrice: number;
    saleDate: string;
  };
} 