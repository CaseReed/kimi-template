export interface DashboardStats {
  revenue: number;
  users: number;
  conversion: number;
  activeSessions: number;
  revenueChange: number;
  usersChange: number;
  conversionChange: number;
  sessionsChange: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  target: number;
}

export interface CategoryData {
  category: string;
  value: number;
}

export interface Transaction {
  id: string;
  customer: string;
  email: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  avatar?: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  totalPages: number;
  currentPage: number;
}
