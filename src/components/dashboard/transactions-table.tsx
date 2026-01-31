"use client";

import { useState, useCallback, useOptimistic, useTransition, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations, useLocale } from "next-intl";
import { useReducedMotion } from "motion/react";
import {
  fetchTransactions,
  updateTransactionStatus,
} from "@/lib/api/dashboard";
import { queryKeys } from "@/lib/query-keys";
import type { Transaction } from "@/lib/types/dashboard";
import {
  TechTable,
  TechPagination,
  TechStatusBadge,
} from "@/components/design-system";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/animations/fade-in";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { RefreshCw, Download, Filter, Search } from "lucide-react";

const ITEMS_PER_PAGE = 10;

// Format amount in euros
function formatAmount(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

// Format date
function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
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

// Map transaction status to TechStatusBadge status
type BadgeStatus = "active" | "inactive" | "pending" | "error" | "success" | "warning";

function mapStatusToBadge(status: Transaction["status"]): BadgeStatus {
  switch (status) {
    case "completed": return "success";
    case "pending": return "pending";
    case "failed": return "error";
    default: return "inactive";
  }
}

// Table Skeleton Loader
function TableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 pb-4">
        <Skeleton className="h-10 w-72" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

export function TransactionsTable() {
  const t = useTranslations("dashboard.transactions");
  const currentLocale = useLocale();
  const tableRef = useRef<HTMLDivElement>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [isNavigating, setIsNavigating] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
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
      const errorMessage = error instanceof Error ? error.message : t("errors.update");
      setUpdateError(errorMessage);
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(transactionId);
        return next;
      });
    }
  }, [addOptimisticUpdate, pendingIds, queryClient, t]);

  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }, [sortColumn]);

  const handlePageChange = useCallback((page: number) => {
    setIsNavigating(true);
    setCurrentPage(page);
    // Scroll to the top of the table card instead of the whole page
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Filter transactions based on search
  const filteredTransactions = searchQuery
    ? optimisticTransactions.filter(t => 
        t.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : optimisticTransactions;

  const totalPages = data?.totalPages ?? 1;

  // Table columns definition
  const columns = [
    {
      key: "customer",
      header: t("customer"),
      sortable: true,
      cell: (row: Transaction) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border">
            {row.avatar && (
              <AvatarImage src={row.avatar} alt={row.customer} />
            )}
            <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
              {getInitials(row.customer)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-medium truncate">{row.customer}</span>
            <span className="text-xs text-muted-foreground truncate">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: t("amount"),
      sortable: true,
      align: "right" as const,
      cell: (row: Transaction) => (
        <span className="font-mono font-medium">
          {formatAmount(row.amount, currentLocale)}
        </span>
      ),
    },
    {
      key: "status",
      header: t("status"),
      sortable: true,
      cell: (row: Transaction) => (
        <TechStatusBadge 
          status={mapStatusToBadge(row.status)} 
          pulse={row.status === "pending"}
        >
          {t(`statusLabels.${row.status}`)}
        </TechStatusBadge>
      ),
    },
    {
      key: "date",
      header: t("date"),
      sortable: true,
      cell: (row: Transaction) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.date, currentLocale)}
        </span>
      ),
    },
  ];

  return (
    <FadeIn>
      <Card ref={tableRef} className="border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>{t("title")}</CardTitle>
              <CardDescription>{t("description")}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1.5" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1.5" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Search and error display */}
            <div className="flex items-center gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchPlaceholder") || "Search transactions..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              {isFetching && !isLoading && (
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {updateError && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {updateError}
              </div>
            )}

            {/* Table */}
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <>
                <TechTable<Transaction>
                  data={filteredTransactions}
                  columns={columns}
                  keyExtractor={(row) => row.id}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onRowClick={(row) => console.log("Clicked:", row.id)}
                  loadingRowIds={pendingIds}
                  rowActions={[
                    {
                      label: t("buttonLabels.change") || "Change Status",
                      onClick: (row) => {
                        const nextStatus = getNextStatus(row.status);
                        handleStatusUpdate(row.id, nextStatus);
                      },
                    },
                    {
                      label: t("buttonLabels.view") || "View Details",
                      onClick: (row) => console.log("View:", row.id),
                    },
                  ]}
                />

                {/* Pagination */}
                <TechPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={filteredTransactions.length}
                  pageSize={ITEMS_PER_PAGE}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}
