"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TechDivider } from "@/components/design-system";
import type { Transaction } from "@/lib/types/dashboard";
import {
  Receipt,
  Mail,
  CreditCard,
  MapPin,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  X,
} from "lucide-react";

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

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
    month: "long",
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

// Get status config
function getStatusConfig(status: Transaction["status"]) {
  switch (status) {
    case "completed":
      return {
        icon: CheckCircle2,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30",
        label: "Completed",
      };
    case "pending":
      return {
        icon: Clock,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
        label: "Pending",
      };
    case "failed":
      return {
        icon: AlertCircle,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
        label: "Failed",
      };
    default:
      return {
        icon: Clock,
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        borderColor: "border-border",
        label: "Unknown",
      };
  }
}

// Generate fake invoice number
function generateInvoiceNumber(id: string): string {
  return `INV-${new Date().getFullYear()}-${id.padStart(4, "0")}`;
}

// Generate fake items based on amount
function generateItems(amount: number): Array<{ name: string; quantity: number; price: number }> {
  const items = [
    { name: "Premium Plan Subscription", quantity: 1, price: amount * 0.6 },
    { name: "Additional Storage (100GB)", quantity: 2, price: amount * 0.15 },
    { name: "Priority Support", quantity: 1, price: amount * 0.25 },
  ];
  return items;
}

export function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
  locale,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  const statusConfig = getStatusConfig(transaction.status);
  const StatusIcon = statusConfig.icon;
  const invoiceNumber = generateInvoiceNumber(transaction.id);
  const items = generateItems(transaction.amount);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="max-w-2xl max-h-[90vh] overflow-hidden p-0 gap-0 border-primary/30 shadow-[0_0_30px_rgba(0,217,255,0.15)]">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Receipt className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-foreground">
                Invoice Details
              </DialogTitle>
              <DialogDescription className="font-mono text-primary mt-1">
                {invoiceNumber}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-lg hover:bg-muted h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={`${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} px-3 py-1 font-medium`}
            >
              <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
              {statusConfig.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatDate(transaction.date, locale)}
            </span>
          </div>

          {/* Customer Info */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 border border-border">
            <Avatar className="h-14 w-14 border-2 border-primary/20 ring-2 ring-primary/5">
              {transaction.avatar && (
                <AvatarImage
                  src={transaction.avatar}
                  alt={transaction.customer}
                />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {getInitials(transaction.customer)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-lg truncate">
                {transaction.customer}
              </h3>
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{transaction.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  Paris, France
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Items
            </h4>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">
                      {item.name}
                    </span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      × {item.quantity}
                    </span>
                  </div>
                  <span className="text-sm font-mono text-foreground flex-shrink-0">
                    {formatAmount(item.price, locale)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <TechDivider />

          {/* Payment Method */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-muted border border-border flex-shrink-0">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Payment Method
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Visa ending in 4242
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground font-mono">
                {formatAmount(transaction.amount, locale)}
              </p>
            </div>
          </div>

          {/* Transaction ID */}
          <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50 border border-border">
            <span className="text-sm text-muted-foreground">Transaction ID</span>
            <code className="text-xs font-mono text-foreground bg-muted px-2 py-1 rounded">
              tx_{transaction.id}_{new Date(transaction.date).getTime()}
            </code>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-6 pt-4 border-t border-border bg-muted/30 gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="btn-glow">
            <Download className="h-4 w-4 mr-2" />
            Download Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
