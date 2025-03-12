export interface VehicleImage {
  url: string;
  id: string;
}

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
  code: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  status: 'acquired' | 'in_preparation' | 'for_sale' | 'sold';
  purchaseDate: Date;
  purchasePrice: number;
  images: VehicleImage[];
  expenses: Expense[];
  marketPrices?: MarketPrices;
  saleInfo?: SaleInfo;
  createdAt: Date;
  updatedAt: Date;
} 