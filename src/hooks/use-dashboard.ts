"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  fetchStats,
  fetchRevenue,
  fetchCategories,
  fetchTransactions,
  updateTransactionStatus,
} from "@/lib/api/dashboard";
import { Transaction } from "@/lib/types/dashboard";

/**
 * Hook pour récupérer les statistiques du dashboard
 * @returns {Object} - { data, isLoading, isError, error, refetch }
 */
export function useDashboardStats() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: fetchStats,
  });

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  };
}

/**
 * Hook pour récupérer les données de revenus sur 12 mois
 * @returns {Object} - { data, isLoading, isError, error }
 */
export function useRevenueData() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.dashboard.revenue(),
    queryFn: fetchRevenue,
  });

  return {
    data,
    isLoading,
    isError,
    error,
  };
}

/**
 * Hook pour récupérer les données des catégories
 * @returns {Object} - { data, isLoading, isError, error }
 */
export function useCategoryData() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.dashboard.categories(),
    queryFn: fetchCategories,
  });

  return {
    data,
    isLoading,
    isError,
    error,
  };
}

/**
 * Hook pour récupérer les transactions avec pagination
 * @param page - Numéro de la page (1-indexed)
 * @returns {Object} - { data, isLoading, isFetching, isError, error }
 */
export function useTransactions(page: number) {
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: queryKeys.dashboard.transactions(page),
    queryFn: () => fetchTransactions(page),
    placeholderData: (previousData) => previousData,
  });

  return {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  };
}

/**
 * Hook pour mettre à jour le statut d'une transaction
 * Invalide les requêtes 'dashboard' et 'transactions' après succès
 * @returns {Object} - { mutate, isPending, isError, error }
 */
export function useUpdateTransactionStatus() {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: Transaction["status"];
    }) => updateTransactionStatus(id, status),
    onSuccess: () => {
      // Invalide les requêtes dashboard et transactions
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.transactionsAll(),
      });
    },
  });

  return {
    mutate,
    isPending,
    isError,
    error,
  };
}
