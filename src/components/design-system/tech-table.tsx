"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ============================================
// Types
// ============================================
export interface Column<T> {
  key: keyof T | string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface TechTableProps<T extends object> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (column: string) => void;
  onRowClick?: (row: T) => void;
  rowActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    destructive?: boolean;
  }[];
  loadingRowIds?: Set<string>;
  emptyState?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

// ============================================
// Sort Indicator Component
// ============================================
function SortIndicator({
  column,
  sortColumn,
  sortDirection,
  onSort,
}: {
  column: string;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: () => void;
}) {
  const isActive = sortColumn === column;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 hover:bg-transparent"
      onClick={onSort}
    >
      {isActive ? (
        sortDirection === "asc" ? (
          <ChevronUp className="h-4 w-4 text-primary" />
        ) : (
          <ChevronDown className="h-4 w-4 text-primary" />
        )
      ) : (
        <ArrowUpDown className="h-4 w-4 text-muted-foreground/50" />
      )}
    </Button>
  );
}

// ============================================
// Tech Status Badge - Enhanced status badges
// ============================================
interface TechStatusBadgeProps {
  status: "active" | "inactive" | "pending" | "error" | "success" | "warning";
  children: React.ReactNode;
  pulse?: boolean;
}

export function TechStatusBadge({
  status,
  children,
  pulse = false,
}: TechStatusBadgeProps) {
  const variants = {
    active: {
      bg: "bg-primary/10",
      text: "text-primary",
      border: "border-primary/30",
      dot: "bg-primary",
    },
    inactive: {
      bg: "bg-muted",
      text: "text-muted-foreground",
      border: "border-border",
      dot: "bg-muted-foreground",
    },
    pending: {
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      border: "border-amber-500/30",
      dot: "bg-amber-500",
    },
    error: {
      bg: "bg-destructive/10",
      text: "text-destructive",
      border: "border-destructive/30",
      dot: "bg-destructive",
    },
    success: {
      bg: "bg-green-500/10",
      text: "text-green-500",
      border: "border-green-500/30",
      dot: "bg-green-500",
    },
    warning: {
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      border: "border-amber-500/30",
      dot: "bg-amber-500",
    },
  };

  const variant = variants[status];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Badge
          variant="outline"
          className={cn(
            variant.bg,
            variant.text,
            variant.border,
            "font-medium border gap-1.5 pl-2 pr-2.5 transition-colors duration-300",
            pulse && status === "active" && "animate-pulse"
          )}
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 500, damping: 30 }}
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              variant.dot,
              pulse && status === "active" && "animate-ping"
            )}
          />
          {children}
        </Badge>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// Tech Table Component
// ============================================
export function TechTable<T extends object>({
  data,
  columns,
  keyExtractor,
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  rowActions,
  loadingRowIds = new Set(),
  emptyState,
  isLoading,
  className,
}: TechTableProps<T>) {
  const allSelected = data.length > 0 && data.every((row) => selectedIds.has(keyExtractor(row)));
  const someSelected = data.some((row) => selectedIds.has(keyExtractor(row))) && !allSelected;

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map((row) => keyExtractor(row))));
    }
  };

  const handleSelectRow = (id: string) => {
    if (!onSelectionChange) return;
    
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    onSelectionChange(newSelected);
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-background overflow-hidden">
        <div className="animate-shimmer h-10 bg-muted" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 border-t border-border animate-shimmer" style={{ animationDelay: `${i * 100}ms` }} />
        ))}
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className="rounded-lg border border-border bg-background p-8">
        {emptyState}
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-border bg-background overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
            {selectable && (
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className={cn(
                  "font-semibold text-foreground",
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                  column.width
                )}
              >
                <div className="flex items-center gap-1">
                  {column.header}
                  {column.sortable && (
                    <SortIndicator
                      column={String(column.key)}
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                      onSort={() => onSort?.(String(column.key))}
                    />
                  )}
                </div>
              </TableHead>
            ))}
            {rowActions && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => {
            const id = keyExtractor(row);
            const isSelected = selectedIds.has(id);
            const isRowLoading = loadingRowIds.has(id);

            return (
              <motion.tr
                key={id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "group border-b border-border transition-all duration-200",
                  onRowClick && !isRowLoading && "cursor-pointer",
                  isSelected && "bg-primary/5 hover:bg-primary/10",
                  !isSelected && !isRowLoading && "hover:bg-muted/50 hover:shadow-[inset_0_0_20px_rgba(0,217,255,0.03)]",
                  isRowLoading && "opacity-70 pointer-events-none"
                )}
              >
                {selectable && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectRow(id)}
                      aria-label={`Select row ${id}`}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    key={`${id}-${String(column.key)}`}
                    className={cn(
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right"
                    )}
                  >
                    {column.cell ? (
                      column.cell(row)
                    ) : (
                      String(row[column.key as keyof T] ?? "-")
                    )}
                  </TableCell>
                ))}
                {rowActions && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {isRowLoading ? (
                      <div className="flex items-center justify-center h-8 w-8">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {rowActions.map((action, i) => (
                            <DropdownMenuItem
                              key={i}
                              onClick={() => action.onClick(row)}
                              className={cn(
                                action.destructive && "text-destructive focus:text-destructive"
                              )}
                            >
                              {action.icon && <span className="mr-2">{action.icon}</span>}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                )}
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ============================================
// Tech Table Pagination
// ============================================
interface TechPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export function TechPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}: TechPaginationProps) {
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        {totalItems !== undefined && pageSize && (
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0"
        >
          <ChevronUp className="h-4 w-4 rotate-[-90deg]" />
        </Button>
        
        {getVisiblePages().map((page, i) => (
          <React.Fragment key={i}>
            {page === "..." ? (
              <span className="px-2 text-muted-foreground">...</span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={cn(
                  "h-8 w-8 p-0 text-xs",
                  currentPage === page && "bg-primary text-primary-foreground"
                )}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
        </Button>
      </div>
    </div>
  );
}
