export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  email?: string;
  passportUrl: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isRental: boolean;
  residenceYears: number;
  residenceMonths: number;
  profession: string;
  monthlyIncome: number;
  jobYears: number;
  jobMonths: number;
  status: string;
  statusUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
  operator: {
    id: string;
    name: string;
  };
  vehicle: {
    id: string;
    brand: string;
    model: string;
    year: number;
    marketPrices?: {
      retail: number;
    };
  };
} 