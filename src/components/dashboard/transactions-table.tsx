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
import { TransactionDetailModal } from "./transaction-detail-modal";
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
import { RefreshCw, Download, Filter, Search, X, Check, FileDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<Transaction["status"][]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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

  // Filter transactions based on search and status
  const filteredTransactions = optimisticTransactions.filter(t => {
    const matchesSearch = !searchQuery || 
      t.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(t.status);
    
    return matchesSearch && matchesStatus;
  });

  // Export helper function
  const downloadCSV = useCallback((transactions: Transaction[], filename: string) => {
    if (transactions.length === 0) return;
    
    const headers = ["ID", "Customer", "Email", "Amount (EUR)", "Status", "Date"];
    
    const rows = transactions.map(t => [
      t.id,
      t.customer,
      t.email,
      t.amount.toFixed(2),
      t.status,
      new Date(t.date).toLocaleDateString(currentLocale === "fr" ? "fr-FR" : "en-US"),
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentLocale]);

  // Export current page
  const handleExportCurrent = useCallback(() => {
    setIsExporting(true);
    setIsExportOpen(false);
    
    downloadCSV(filteredTransactions, `transactions_page_${currentPage}_${new Date().toISOString().split("T")[0]}.csv`);
    
    setTimeout(() => setIsExporting(false), 1000);
  }, [filteredTransactions, currentPage, downloadCSV]);

  // Generate complete dataset for demo export
  const generateAllTransactions = useCallback((): Transaction[] => {
    const allTransactions: Transaction[] = [];
    const statuses: Transaction["status"][] = ["completed", "pending", "failed"];
    const firstNames = ["Marie", "Jean", "Pierre", "Sophie", "Lucas", "Emma", "Hugo", "Léa", "Louis", "Chloé", "Thomas", "Camille", "Nicolas", "Julie", "Alexandre", "Manon", "Théo", "Sarah", "Antoine", "Laura"];
    const lastNames = ["Dupont", "Martin", "Bernard", "Petit", "Robert", "Richard", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "Roux", "Bonnet", "André", "François", "Mercier", "Lefevre"];
    
    // Generate 47 transactions (simulating all pages)
    for (let i = 1; i <= 47; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const amount = Math.floor(Math.random() * 500) + 50;
      
      // Generate dates spread over last 30 days
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      allTransactions.push({
        id: String(i),
        customer: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
        amount,
        status,
        date: date.toISOString(),
        avatar: undefined,
      });
    }
    
    return allTransactions;
  }, []);

  // Export all transactions
  const handleExportAll = useCallback(() => {
    setIsExporting(true);
    setIsExportOpen(false);
    
    // For demo: generate complete dataset
    // In a real app, this would fetch all transactions from the API
    const allTransactions = generateAllTransactions();
    
    downloadCSV(allTransactions, `transactions_all_${new Date().toISOString().split("T")[0]}.csv`);
    
    setTimeout(() => setIsExporting(false), 1000);
  }, [generateAllTransactions, downloadCSV]);

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
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <Filter className="h-4 w-4 mr-1.5" />
                    Filter
                    {statusFilters.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                        {statusFilters.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4" align="end">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">Filter by Status</h4>
                      {statusFilters.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto py-1 px-2 text-xs"
                          onClick={() => setStatusFilters([])}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {[
                        { value: "completed", label: "Completed", color: "text-green-500" },
                        { value: "pending", label: "Pending", color: "text-amber-500" },
                        { value: "failed", label: "Failed", color: "text-red-500" },
                      ].map((status) => (
                        <div key={status.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`filter-${status.value}`}
                            checked={statusFilters.includes(status.value as Transaction["status"])}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setStatusFilters([...statusFilters, status.value as Transaction["status"]]);
                              } else {
                                setStatusFilters(statusFilters.filter(s => s !== status.value));
                              }
                            }}
                          />
                          <Label
                            htmlFor={`filter-${status.value}`}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <span className={`w-2 h-2 rounded-full ${status.color.replace("text-", "bg-")}`} />
                            {status.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-border">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => setIsFilterOpen(false)}
                      >
                        <Check className="h-3.5 w-3.5 mr-1.5" />
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Popover open={isExportOpen} onOpenChange={setIsExportOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={isExporting || filteredTransactions.length === 0}
                  >
                    {isExporting ? (
                      <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
                    ) : (
                      <FileDown className="h-4 w-4 mr-1.5" />
                    )}
                    Export
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-3" align="end">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground mb-3">Export Options</h4>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left"
                      onClick={handleExportCurrent}
                      disabled={isExporting}
                    >
                      <FileDown className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div className="flex flex-col items-start">
                        <span className="text-sm">Current Page</span>
                        <span className="text-xs text-muted-foreground">
                          {filteredTransactions.length} transactions
                        </span>
                      </div>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left"
                      onClick={handleExportAll}
                      disabled={isExporting}
                    >
                      <FileDown className="h-4 w-4 mr-2 text-primary" />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">Export All</span>
                        <span className="text-xs text-muted-foreground">
                          All 47+ transactions
                        </span>
                      </div>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
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
                      onClick: (row) => {
                        setSelectedTransaction(row);
                        setIsModalOpen(true);
                      },
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

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTransaction(null);
        }}
        locale={currentLocale}
      />
    </FadeIn>
  );
}
