"use client";

import { useState, useCallback, useOptimistic, useTransition, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import {
  fetchTransactions,
  updateTransactionStatus,
} from "@/lib/api/dashboard";
import { queryKeys } from "@/lib/query-keys";
import type { Transaction } from "@/lib/types/dashboard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { FadeIn } from "@/components/animations/fade-in";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const ITEMS_PER_PAGE = 10;

// Format amount in euros
function formatAmount(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

// Format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Format date short (mobile)
function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

// Get badge variant based on status
function getStatusBadgeVariant(
  status: Transaction["status"]
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "pending":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
}

// Get status label in French
function getStatusLabel(status: Transaction["status"]): string {
  switch (status) {
    case "completed":
      return "Complété";
    case "pending":
      return "En attente";
    case "failed":
      return "Échoué";
    default:
      return status;
  }
}

// Get initials from name
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Get next status for cycling
function getNextStatus(
  currentStatus: Transaction["status"]
): Transaction["status"] {
  const statusOrder: Transaction["status"][] = [
    "pending",
    "completed",
    "failed",
  ];
  const currentIndex = statusOrder.indexOf(currentStatus);
  return statusOrder[(currentIndex + 1) % statusOrder.length];
}

// Skeleton rows component for desktop
function SkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-24 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

// Mobile card skeleton
function MobileCardSkeleton() {
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

// Mobile transaction card
interface TransactionCardProps {
  transaction: Transaction;
  index: number;
  isPending: boolean;
  onStatusUpdate: (id: string, status: Transaction["status"]) => void;
  shouldReduceMotion: boolean | null;
}

function TransactionCard({
  transaction,
  index,
  isPending,
  onStatusUpdate,
  shouldReduceMotion,
}: TransactionCardProps) {
  const nextStatus = getNextStatus(transaction.status);

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.3,
        delay: shouldReduceMotion ? 0 : index * 0.05,
        ease: "easeOut",
      }}
    >
      <Card className="mb-3 hover:bg-muted/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-10 w-10 shrink-0">
                {transaction.avatar && (
                  <AvatarImage
                    src={transaction.avatar}
                    alt={`Avatar de ${transaction.customer}`}
                  />
                )}
                <AvatarFallback className="text-sm">
                  {getInitials(transaction.customer)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{transaction.customer}</p>
                <p className="text-muted-foreground text-sm truncate">
                  {transaction.email}
                </p>
              </div>
            </div>
            <Badge
              variant={getStatusBadgeVariant(transaction.status)}
              className={`shrink-0 text-xs ${isPending ? "opacity-70" : ""}`}
            >
              {isPending && (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              )}
              {getStatusLabel(transaction.status)}
            </Badge>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium">{formatAmount(transaction.amount)}</span>
              <span className="text-muted-foreground ml-2">
                {formatDateShort(transaction.date)}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusUpdate(transaction.id, nextStatus)}
              disabled={isPending}
              className="h-8 text-xs"
              aria-label={`Changer le statut de ${getStatusLabel(transaction.status)} à ${getStatusLabel(nextStatus)}`}
            >
              {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Modifier"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function TransactionsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [isNavigating, setIsNavigating] = useState(false);
  const [, startOptimisticUpdate] = useTransition();
  
  const queryClient = useQueryClient();
  const shouldReduceMotion = useReducedMotion();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: queryKeys.dashboard.transactions(currentPage),
    queryFn: () => fetchTransactions(currentPage),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    if (!isFetching && isNavigating) {
      const timeout = setTimeout(() => {
        setIsNavigating(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isFetching, isNavigating]);

  const [optimisticTransactions, addOptimisticUpdate] = useOptimistic<
    Transaction[],
    { transactionId: string; newStatus: Transaction["status"] }
  >(
    data?.transactions ?? [],
    (currentTransactions, { transactionId, newStatus }) => {
      return currentTransactions.map((t) =>
        t.id === transactionId ? { ...t, status: newStatus } : t
      );
    }
  );

  const handleStatusUpdate = useCallback(async (
    transactionId: string,
    newStatus: Transaction["status"]
  ) => {
    if (pendingIds.has(transactionId)) return;
    
    setUpdateError(null);
    setPendingIds((prev) => new Set(prev).add(transactionId));
    
    startOptimisticUpdate(() => {
      addOptimisticUpdate({ transactionId, newStatus });
    });
    
    try {
      await updateTransactionStatus(transactionId, newStatus);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.transactionsAll(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la mise à jour";
      setUpdateError(errorMessage);
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(transactionId);
        return next;
      });
    }
  }, [addOptimisticUpdate, pendingIds, queryClient]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setIsNavigating(true);
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (data && currentPage < data.totalPages) {
      setIsNavigating(true);
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [data, currentPage]);

  const displayTransactions = optimisticTransactions.length > 0 
    ? optimisticTransactions 
    : (data?.transactions ?? []);
  
  const totalPages = data?.totalPages ?? 1;
  const hasTransactions = displayTransactions.length > 0;

  return (
    <FadeIn>
      <div className="space-y-4">
        {updateError && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md" role="alert">
            {updateError}
          </div>
        )}
        
        {/* Mobile View - Cards */}
        <div className="block sm:hidden">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <MobileCardSkeleton key={`mobile-skeleton-${i}`} />
            ))
          ) : hasTransactions ? (
            displayTransactions.map((transaction, index) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                index={index}
                isPending={pendingIds.has(transaction.id)}
                onStatusUpdate={handleStatusUpdate}
                shouldReduceMotion={shouldReduceMotion}
              />
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Aucune transaction trouvée.
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Desktop View - Table */}
        <div className="hidden sm:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Client</TableHead>
                <TableHead scope="col">Montant</TableHead>
                <TableHead scope="col">Statut</TableHead>
                <TableHead scope="col">Date</TableHead>
                <TableHead scope="col" className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <SkeletonRows count={ITEMS_PER_PAGE} />
              ) : hasTransactions ? (
                displayTransactions.map((transaction, index) => {
                  const nextStatus = getNextStatus(transaction.status);
                  const isPending = pendingIds.has(transaction.id);
                  
                  return (
                    <motion.tr
                      key={transaction.id}
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.3,
                        delay: shouldReduceMotion ? 0 : index * 0.05,
                        ease: "easeOut",
                      }}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {transaction.avatar && (
                              <AvatarImage
                                src={transaction.avatar}
                                alt={`Avatar de ${transaction.customer}`}
                              />
                            )}
                            <AvatarFallback>
                              {getInitials(transaction.customer)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {transaction.customer}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {transaction.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatAmount(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(transaction.status)}
                          className={isPending ? "opacity-70" : ""}
                        >
                          {isPending && (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          )}
                          {getStatusLabel(transaction.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleStatusUpdate(transaction.id, nextStatus)
                          }
                          disabled={isPending}
                          aria-label={`Changer le statut de ${getStatusLabel(transaction.status)} à ${getStatusLabel(nextStatus)}`}
                        >
                          {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Changer"
                          )}
                        </Button>
                      </TableCell>
                    </motion.tr>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Aucune transaction trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-2">
          <div className="text-muted-foreground text-sm" aria-live="polite">
            Page {currentPage} sur {totalPages}
            {(isFetching || isNavigating) && !isLoading && (
              <span className="ml-2 text-muted-foreground">
                Chargement...
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage <= 1 || isLoading || isNavigating}
              aria-label="Page précédente"
            >
              {isNavigating ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">Précédent</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || isLoading || isNavigating}
              aria-label="Page suivante"
            >
              <span className="hidden sm:inline">Suivant</span>
              {isNavigating ? (
                <Loader2 className="h-4 w-4 ml-1 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
