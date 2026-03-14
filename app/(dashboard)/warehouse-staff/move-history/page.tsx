"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, LayoutList,Plus, Search, RefreshCw, X } from "lucide-react";

type MoveType = "RECEIPT" | "DELIVERY" | "TRANSFER" | "ADJUSTMENT";

type LocationRef = {
  id: string;
  name: string;
  code: string;
} | null;

type ProductRef = {
  id: string;
  name: string;
};

type ProductOption = {
  id: string;
  name: string;
  sku: string;
};

type LocationOption = {
  id: string;
  name: string;
  code: string;
};

type StockMoveApiItem = {
  id: string;
  type: MoveType;
  reference: string | null;
  quantity: number;
  createdAt: string;
  product: ProductRef;
  fromLocation: LocationRef;
  toLocation: LocationRef;
};

type MoveStatus = "Ready" | "In Use" | "Done";

type MoveDirection = "IN" | "OUT" | "INTERNAL";

type MoveViewModel = {
  id: string;
  reference: string;
  date: string;
  contact: string;
  from: string;
  to: string;
  quantity: number;
  status: MoveStatus;
  direction: MoveDirection;
  productName: string;
};

type CreateMovePayload = {
  type: MoveType;
  quantity: number;
  productId: string;
  fromLocationId?: string;
  toLocationId?: string;
  reference?: string;
};

type NewMoveFormState = {
  type: MoveType;
  quantity: string;
  productId: string;
  fromLocationId: string;
  toLocationId: string;
  reference: string;
};

function getStatus(move: StockMoveApiItem): MoveStatus {
  if (move.type === "TRANSFER") return "In Use";
  if (move.type === "ADJUSTMENT") return "Done";
  return "Ready";
}

function getDirection(move: StockMoveApiItem): MoveDirection {
  if (move.type === "RECEIPT") return "IN";
  if (move.type === "DELIVERY") return "OUT";
  return "INTERNAL";
}

function getContact(move: StockMoveApiItem): string {
  if (move.type === "RECEIPT") return "Vendor";
  if (move.type === "DELIVERY") return "Customer";
  if (move.type === "TRANSFER") return "Internal Transfer";
  return "Inventory Adjustment";
}

function statusClassName(status: MoveStatus): string {
  if (status === "Ready") return "bg-emerald-100 text-emerald-700";
  if (status === "In Use") return "bg-blue-100 text-blue-700";
  return "bg-slate-200 text-slate-700";
}

function directionClassName(direction: MoveDirection): string {
  if (direction === "IN") return "text-emerald-700";
  if (direction === "OUT") return "text-red-600";
  return "text-slate-700";
}

async function fetchStockMoves(): Promise<StockMoveApiItem[]> {
  const res = await fetch("/api/stock-moves", { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to load move history");
  }
  return res.json();
}

async function fetchProducts(): Promise<ProductOption[]> {
  const res = await fetch("/api/products", { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to load products");
  }
  const data = (await res.json()) as ProductOption[];
  return data;
}

async function fetchLocations(): Promise<LocationOption[]> {
  const res = await fetch("/api/locations", { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to load locations");
  }
  const data = (await res.json()) as LocationOption[];
  return data;
}

async function createStockMove(payload: CreateMovePayload): Promise<StockMoveApiItem> {
  const res = await fetch("/api/stock-moves", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Failed to create move");
  }

  return data as StockMoveApiItem;
}

function toViewModel(move: StockMoveApiItem): MoveViewModel {
  return {
    id: move.id,
    reference: move.reference || `SM-${move.id.slice(0, 6).toUpperCase()}`,
    date: new Date(move.createdAt).toLocaleDateString("en-GB"),
    contact: getContact(move),
    from: move.fromLocation?.code || move.fromLocation?.name || "Vendor",
    to: move.toLocation?.code || move.toLocation?.name || "Warehouse Stock",
    quantity: move.quantity,
    status: getStatus(move),
    direction: getDirection(move),
    productName: move.product?.name || "Unknown Product",
  };
}

export default function WarehouseStaffMoveHistoryPage() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newMoveForm, setNewMoveForm] = useState<NewMoveFormState>({
    type: "TRANSFER",
    quantity: "",
    productId: "",
    fromLocationId: "",
    toLocationId: "",
    reference: "",
  });

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["stock-moves"],
    queryFn: fetchStockMoves,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    enabled: isCreateModalOpen,
  });

  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
    enabled: isCreateModalOpen,
  });

  const createMoveMutation = useMutation({
    mutationFn: createStockMove,
    onSuccess: async () => {
      setIsCreateModalOpen(false);
      setCreateError(null);
      setNewMoveForm({
        type: "TRANSFER",
        quantity: "",
        productId: "",
        fromLocationId: "",
        toLocationId: "",
        reference: "",
      });
      await refetch();
    },
    onError: (error: Error) => {
      setCreateError(error.message || "Failed to create move");
    },
  });

  const rows = useMemo(() => (data ?? []).map(toViewModel), [data]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((row) => {
      return (
        row.reference.toLowerCase().includes(q) ||
        row.contact.toLowerCase().includes(q) ||
        row.productName.toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  const groupedByStatus = useMemo(() => {
    return {
      Ready: filteredRows.filter((row) => row.status === "Ready"),
      "In Use": filteredRows.filter((row) => row.status === "In Use"),
      Done: filteredRows.filter((row) => row.status === "Done"),
    };
  }, [filteredRows]);

  function escapeCsvCell(value: string | number): string {
    const str = String(value ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replaceAll('"', '""')}"`;
    }
    return str;
  }

  function handleExportCsv() {
    const header = [
      "Reference",
      "Date",
      "Contact",
      "From",
      "To",
      "Quantity",
      "Direction",
      "Status",
      "Product",
    ];

    const lines = filteredRows.map((row) =>
      [
        row.reference,
        row.date,
        row.contact,
        row.from,
        row.to,
        row.quantity,
        row.direction,
        row.status,
        row.productName,
      ]
        .map(escapeCsvCell)
        .join(","),
    );

    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `move-history-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  function updateNewMoveForm<K extends keyof NewMoveFormState>(
    key: K,
    value: NewMoveFormState[K],
  ) {
    setNewMoveForm((prev) => ({ ...prev, [key]: value }));
  }

  function openCreateModal() {
    setCreateError(null);
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    if (createMoveMutation.isPending) return;
    setCreateError(null);
    setIsCreateModalOpen(false);
  }

  function validateCreateForm(): string | null {
    if (!newMoveForm.productId) return "Product is required";

    const quantity = Number(newMoveForm.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return "Quantity must be greater than 0";
    }

    if (newMoveForm.type === "RECEIPT" && !newMoveForm.toLocationId) {
      return "To location is required for receipt";
    }

    if (newMoveForm.type === "DELIVERY" && !newMoveForm.fromLocationId) {
      return "From location is required for delivery";
    }

    if (newMoveForm.type === "TRANSFER") {
      if (!newMoveForm.fromLocationId || !newMoveForm.toLocationId) {
        return "Both from and to locations are required for transfer";
      }
      if (newMoveForm.fromLocationId === newMoveForm.toLocationId) {
        return "From and to locations cannot be the same for transfer";
      }
    }

    return null;
  }

  function buildCreatePayload(): CreateMovePayload {
    const quantity = Number(newMoveForm.quantity);
    return {
      type: newMoveForm.type,
      quantity,
      productId: newMoveForm.productId,
      reference: newMoveForm.reference.trim() || undefined,
      fromLocationId: newMoveForm.fromLocationId || undefined,
      toLocationId: newMoveForm.toLocationId || undefined,
    };
  }

  async function handleCreateMove(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);

    const validationError = validateCreateForm();
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    await createMoveMutation.mutateAsync(buildCreatePayload());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Move History</h1>
          <p className="text-sm text-slate-600">
            Track all stock moves between source and destination locations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isLoading || filteredRows.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg border bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-2"
          >
            <Plus size={16} />
            New
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-md">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by reference, contact, or product"
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-800 outline-none ring-blue-500 focus:ring-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView("list")}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                view === "list"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <LayoutList size={16} />
              List
            </button>
     
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Loading move history...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Unable to load move history. Please try again.
        </div>
      ) : null}

      {!isLoading && !isError && view === "list" ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-230 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">To</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 text-slate-700">
                    <td className="px-4 py-3 font-medium text-blue-700">{row.reference}</td>
                    <td className="px-4 py-3">{row.date}</td>
                    <td className="px-4 py-3">{row.contact}</td>
                    <td className="px-4 py-3">{row.from}</td>
                    <td className="px-4 py-3">{row.to}</td>
                    <td className={`px-4 py-3 font-semibold ${directionClassName(row.direction)}`}>
                      {row.direction === "IN"
                        ? `+${row.quantity}`
                        : row.direction === "OUT"
                          ? `-${row.quantity}`
                          : row.quantity}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClassName(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
            Showing {filteredRows.length} move{filteredRows.length === 1 ? "" : "s"}
          </div>
        </div>
      ) : null}

      {!isLoading && !isError && view === "kanban" ? (
        <div className="grid gap-4 md:grid-cols-3">
          {(
            ["Ready", "In Use", "Done"] as const
          ).map((status) => (
            <section key={status} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-sm font-semibold text-slate-800">{status}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {groupedByStatus[status].length}
                </span>
              </div>

              <div className="space-y-2">
                {groupedByStatus[status].map((row) => (
                  <article key={row.id} className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs font-semibold text-blue-700">{row.reference}</p>
                    <p className="mt-1 text-sm text-slate-900">{row.productName}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      {row.from} to {row.to}
                    </p>
                    <p className={`mt-2 text-xs font-semibold ${directionClassName(row.direction)}`}>
                      {row.direction} {row.quantity}
                    </p>
                  </article>
                ))}

                {groupedByStatus[status].length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-500">
                    No moves in this status.
                  </p>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      ) : null}

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Add New Move</h2>
              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMove} className="space-y-4 px-5 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm font-medium text-slate-700">Move Type</span>
                  <select
                    value={newMoveForm.type}
                    onChange={(e) => updateNewMoveForm("type", e.target.value as MoveType)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
                  >
                    <option value="RECEIPT">Receipt</option>
                    <option value="DELIVERY">Delivery</option>
                    <option value="TRANSFER">Transfer</option>
                    <option value="ADJUSTMENT">Adjustment</option>
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-medium text-slate-700">Quantity</span>
                  <input
                    type="number"
                    min="1"
                    value={newMoveForm.quantity}
                    onChange={(e) => updateNewMoveForm("quantity", e.target.value)}
                    placeholder="e.g. 12"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
                  />
                </label>
              </div>

              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-700">Product</span>
                <select
                  value={newMoveForm.productId}
                  onChange={(e) => updateNewMoveForm("productId", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
                  disabled={productsLoading}
                >
                  <option value="">Select product</option>
                  {(products ?? []).map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm font-medium text-slate-700">From Location</span>
                  <select
                    value={newMoveForm.fromLocationId}
                    onChange={(e) => updateNewMoveForm("fromLocationId", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
                    disabled={locationsLoading}
                  >
                    <option value="">Select from location</option>
                    {(locations ?? []).map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.code} - {location.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-medium text-slate-700">To Location</span>
                  <select
                    value={newMoveForm.toLocationId}
                    onChange={(e) => updateNewMoveForm("toLocationId", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
                    disabled={locationsLoading}
                  >
                    <option value="">Select to location</option>
                    {(locations ?? []).map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.code} - {location.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-700">Reference (optional)</span>
                <input
                  value={newMoveForm.reference}
                  onChange={(e) => updateNewMoveForm("reference", e.target.value)}
                  placeholder="e.g. WH/IN/0001"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
                />
              </label>

              {createError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {createError}
                </p>
              ) : null}

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMoveMutation.isPending}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createMoveMutation.isPending ? "Saving..." : "Save Move"}
                </button>
              </div>
            </form>


          </div>
        </div>
      ) : null}
    </div>
  );
}
