import {
  DashboardStats,
  RevenueData,
  CategoryData,
  Transaction,
  TransactionsResponse,
} from '@/lib/types/dashboard';

// Simule un délai réseau aléatoire entre min et max ms
const simulateNetworkDelay = (min = 300, max = 800): Promise<void> => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// Données mockées pour les transactions
const MOCK_CUSTOMERS = [
  { name: 'Marie Dupont', email: 'marie.dupont@email.com' },
  { name: 'Jean Martin', email: 'jean.martin@email.com' },
  { name: 'Sophie Bernard', email: 'sophie.bernard@email.com' },
  { name: 'Lucas Petit', email: 'lucas.petit@email.com' },
  { name: 'Emma Moreau', email: 'emma.moreau@email.com' },
  { name: 'Hugo Roux', email: 'hugo.roux@email.com' },
  { name: 'Camille Leroy', email: 'camille.leroy@email.com' },
  { name: 'Nathan Garcia', email: 'nathan.garcia@email.com' },
  { name: 'Léa Blanc', email: 'lea.blanc@email.com' },
  { name: 'Thomas Robert', email: 'thomas.robert@email.com' },
  { name: 'Julie Fournier', email: 'julie.fournier@email.com' },
  { name: 'Antoine Girard', email: 'antoine.girard@email.com' },
  { name: 'Manon André', email: 'manon.andre@email.com' },
  { name: 'Mathieu François', email: 'mathieu.francois@email.com' },
  { name: 'Sarah Mercier', email: 'sarah.mercier@email.com' },
  { name: 'Louis Lambert', email: 'louis.lambert@email.com' },
  { name: 'Chloé David', email: 'chloe.david@email.com' },
  { name: 'Théo Bonnet', email: 'theo.bonnet@email.com' },
  { name: 'Inès Roussel', email: 'ines.roussel@email.com' },
  { name: 'Alexandre Fontaine', email: 'alexandre.fontaine@email.com' },
];

const MOCK_STATUSES: Transaction['status'][] = ['completed', 'pending', 'failed'];

// Génère des transactions mockées
const generateMockTransactions = (count: number): Transaction[] => {
  return Array.from({ length: count }, (_, i) => {
    const customer = MOCK_CUSTOMERS[i % MOCK_CUSTOMERS.length];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    return {
      id: `tr_${Date.now()}_${i}`,
      customer: customer.name,
      email: customer.email,
      amount: Math.floor(Math.random() * 500) + 50 + Math.random(),
      status: MOCK_STATUSES[Math.floor(Math.random() * MOCK_STATUSES.length)],
      date: date.toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.name.replace(/\s/g, '')}`,
    };
  });
};

// Transactions stockées en mémoire pour permettre les mutations
const mockTransactionsStore: Transaction[] = generateMockTransactions(50);

/**
 * Récupère les statistiques du dashboard
 */
export async function fetchStats(): Promise<DashboardStats> {
  await simulateNetworkDelay(500, 500);
  
  return {
    revenue: 45231.89,
    users: 2350,
    conversion: 3.24,
    activeSessions: 573,
    revenueChange: 20.1,
    usersChange: 15.3,
    conversionChange: -2.1,
    sessionsChange: 12.5,
  };
}

/**
 * Récupère les données de revenus sur 12 mois
 */
export async function fetchRevenue(): Promise<RevenueData[]> {
  await simulateNetworkDelay();
  
  const months = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
    'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
  ];
  
  return months.map((month) => ({
    month,
    revenue: Math.floor(Math.random() * 30000) + 20000,
    target: 35000,
  }));
}

/**
 * Récupère les données des catégories
 */
export async function fetchCategories(): Promise<CategoryData[]> {
  await simulateNetworkDelay();
  
  return [
    { category: 'Électronique', value: 35 },
    { category: 'Mode', value: 25 },
    { category: 'Maison', value: 20 },
    { category: 'Sports', value: 12 },
    { category: 'Autres', value: 8 },
  ];
}

/**
 * Récupère les transactions avec pagination
 */
export async function fetchTransactions(
  page: number = 1
): Promise<TransactionsResponse> {
  await simulateNetworkDelay();
  
  const ITEMS_PER_PAGE = 10;
  const totalItems = mockTransactionsStore.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  
  // S'assurer que la page est valide
  const validPage = Math.max(1, Math.min(page, totalPages));
  
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  
  // Trier par date décroissante
  const sortedTransactions = [...mockTransactionsStore].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return {
    transactions: sortedTransactions.slice(startIndex, endIndex),
    totalPages,
    currentPage: validPage,
  };
}

/**
 * Met à jour le statut d'une transaction
 */
export async function updateTransactionStatus(
  id: string,
  status: Transaction['status']
): Promise<Transaction> {
  await simulateNetworkDelay();
  
  const transactionIndex = mockTransactionsStore.findIndex((t) => t.id === id);
  
  if (transactionIndex === -1) {
    throw new Error(`Transaction avec l'ID ${id} non trouvée`);
  }
  
  mockTransactionsStore[transactionIndex] = {
    ...mockTransactionsStore[transactionIndex],
    status,
  };
  
  return mockTransactionsStore[transactionIndex];
}
