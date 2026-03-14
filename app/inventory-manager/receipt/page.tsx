"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  User,
  Package,
  Plus,
  MoreVertical,
  Check,
  Mail,
  Pencil,
  Trash2,
} from "lucide-react";

// Mock data aligned with schema: Receipt (reference, vendor, status, scheduledDate, responsible), ReceiptItem (quantity), Product (name, sku, unit)
const RECEIPT_REFERENCE = "WH/IN/00142";
const CREATED = "Oct 24, 2023";

const infoCards = [
  {
    title: "VENDOR",
    main: "Global Logistics Co.",
    icon: Building2,
  },
  {
    title: "SCHEDULED DATE",
    main: "Oct 25, 2023",
    icon: Calendar,
    sub: "Delivery expected today",
    subHighlight: true,
  },
  {
    title: "RESPONSIBLE",
    main: "Alex Johnson",
    icon: User,
    sub: "ajohnson@company.com",
    subIcon: Mail,
  },
];

// ReceiptItem shape: id, quantity, product (name, sku, unit)
type ReceiptItemRow = {
  id: string;
  productName: string;
  productSku: string;
  unit: string;
  quantity: number;
};

const initialReceiptItems: ReceiptItemRow[] = [
  { id: "1", productName: "MacBook Pro M2", productSku: "SKU-MBP-001", unit: "pcs", quantity: 15 },
  { id: "2", productName: "Magic Keyboard", productSku: "SKU-MK-002", unit: "pcs", quantity: 20 },
  { id: "3", productName: "Magic Mouse 2", productSku: "SKU-MM-003", unit: "pcs", quantity: 20 },
];

function ReceiptItemActions({
  itemId,
  onEdit,
  onRemove,
}: {
  itemId: string;
  productName: string;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        aria-label="Row actions"
        aria-expanded={open}
      >
        <MoreVertical size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 min-w-[180px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              onEdit(itemId);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={16} />
            Edit quantity
          </button>
          <button
            type="button"
            onClick={() => {
              onRemove(itemId);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} />
            Remove from receipt
          </button>
        </div>
      )}
    </div>
  );
}

const steps = [
  { label: "Draft", done: true, date: "Oct 24, 10:45 AM" },
  { label: "Ready", done: false, inProgress: true },
  { label: "Done", done: false, final: true },
];

export default function ReceiptPage() {
  const [receiptItems, setReceiptItems] = useState<ReceiptItemRow[]>(initialReceiptItems);
  const totalQuantity = receiptItems.reduce((s, i) => s + i.quantity, 0);

  const handleEditItem = (id: string) => {
    // TODO: open edit modal or inline edit; for now just log
    const item = receiptItems.find((i) => i.id === id);
    if (item) console.log("Edit receipt item:", item);
  };

  const handleRemoveItem = (id: string) => {
    const item = receiptItems.find((i) => i.id === id);
    if (item && typeof window !== "undefined" && window.confirm(`Remove "${item.productName}" from this receipt?`)) {
      setReceiptItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/inventory-manager"
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">{RECEIPT_REFERENCE}</h1>
            <span className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
              READY
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Receipt • Created on {CREATED}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            Mark Ready
          </button>
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Validate
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-0">
          {steps.map((step, i) => (
            <div key={step.label} className="flex flex-1 items-start">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    step.done
                      ? "bg-blue-600 text-white"
                      : step.inProgress
                        ? "border-2 border-blue-600 bg-white text-blue-600"
                        : "border border-slate-200 bg-slate-50 text-slate-400"
                  }`}
                >
                  {step.done ? <Check size={18} /> : <span className="text-xs font-medium">{i + 1}</span>}
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900">{step.label}</p>
                {step.date && (
                  <p className="mt-0.5 text-xs text-slate-500">{step.date}</p>
                )}
                {step.inProgress && (
                  <p className="mt-0.5 text-xs text-blue-600">In Progress</p>
                )}
                {step.final && (
                  <p className="mt-0.5 text-xs text-slate-400">Final Step</p>
                )}
              </div>
              {i < steps.length - 1 && (
                <div className="mx-2 mt-4 h-0.5 min-w-[24px] flex-1 bg-blue-200" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info cards: VENDOR, SCHEDULED DATE, RESPONSIBLE (no Warehouse in Receipt model) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {infoCards.map((card) => {
          const Icon = card.icon;
          const SubIcon = card.subIcon;
          return (
            <div
              key={card.title}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-4"
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.title}
              </p>
              <div className="flex items-center gap-2">
                <Icon size={18} className="shrink-0 text-slate-500" />
                <p className="font-semibold text-slate-900">{card.main}</p>
              </div>
              {card.sub && (
                <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
                  {SubIcon && <SubIcon size={14} className="shrink-0" />}
                  <span
                    className={card.subHighlight ? "text-orange-600" : undefined}
                  >
                    {card.sub}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Products to Receive: ReceiptItem (quantity) + Product (name, sku, unit) */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Products to Receive
          </h2>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Product
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Unit
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Quantity
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {receiptItems.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50/50"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <Package size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {row.productName}
                        </p>
                        <p className="text-xs text-slate-500">{row.productSku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {row.unit}
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-slate-900">
                    {row.quantity}
                  </td>
                  <td className="px-5 py-4">
                    <ReceiptItemActions
                      itemId={row.id}
                      productName={row.productName}
                      onEdit={handleEditItem}
                      onRemove={handleRemoveItem}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-5 py-3 text-sm text-slate-600">
          <span>Showing {receiptItems.length} items</span>
          <span>
            Total quantity: <strong className="text-slate-900">{totalQuantity}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
