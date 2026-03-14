"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Edit, MapPinned, Save, ShieldPlus, Trash2, Warehouse } from "lucide-react";
import { useSearchContext } from "@/contexts/search-context";

type Status = "Active" | "In Use" | "Busy";

type WarehouseRow = {
  id: string;
  name: string;
  code: string;
};

type LocationRow = {
  id: string;
  name: string;
  code: string;
  warehouseId: string;
  warehouse: WarehouseRow;
  _count?: {
    fromMoves?: number;
    toMoves?: number;
    inventoryAdjustment?: number;
  };
};

function getStatus(row: LocationRow): Status {
  const movementCount =
    (row._count?.fromMoves ?? 0) +
    (row._count?.toMoves ?? 0) +
    (row._count?.inventoryAdjustment ?? 0);

  if (movementCount > 10) return "Busy";
  if (movementCount > 0) return "In Use";
  return "Active";
}


const ROWS_PER_PAGE = 20;

const LocationTable = () => {
  const { searchQuery } = useSearchContext();
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([]);
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editWarehouseId, setEditWarehouseId] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(locations.length / ROWS_PER_PAGE));

  const visibleRows = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return locations.slice(start, start + ROWS_PER_PAGE);
  }, [locations, currentPage]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      const query = params.toString();

      const [warehouseResponse, locationResponse] = await Promise.all([
        fetch("/api/warehouses", { cache: "no-store" }),
        fetch(`/api/locations${query ? `?${query}` : ""}`, { cache: "no-store" }),
      ]);

      if (!warehouseResponse.ok || !locationResponse.ok) {
        throw new Error("Failed to load locations data");
      }

      const warehouseData: unknown = await warehouseResponse.json();
      const locationData: unknown = await locationResponse.json();

      const safeWarehouses = Array.isArray(warehouseData)
        ? (warehouseData as WarehouseRow[])
        : [];
      const safeLocations = Array.isArray(locationData)
        ? (locationData as LocationRow[])
        : [];

      setWarehouses(safeWarehouses);
      setLocations(safeLocations);

      if (!warehouseId && safeWarehouses.length > 0) {
        setWarehouseId(safeWarehouses[0].id);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleCreateLocation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !code.trim() || !warehouseId) {
      setError("Please fill location name, short code, and warehouse.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setNotice("");

      const response = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim(),
          warehouseId,
        }),
      });

      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const message =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Failed to save location";
        throw new Error(message);
      }

      setName("");
      setCode("");
      setNotice("Location saved successfully.");
      await loadData();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to save location");
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (row: LocationRow) => {
    setEditingId(row.id);
    setEditName(row.name);
    setEditCode(row.code);
    setEditWarehouseId(row.warehouseId);
    setError("");
    setNotice("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditCode("");
    setEditWarehouseId("");
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim() || !editCode.trim() || !editWarehouseId) {
      setError("Please provide location name, short code, and warehouse.");
      return;
    }

    try {
      setIsUpdating(true);
      setError("");
      setNotice("");

      const response = await fetch(`/api/locations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          code: editCode.trim(),
          warehouseId: editWarehouseId,
        }),
      });

      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const message =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Failed to update location";
        throw new Error(message);
      }

      cancelEdit();
      setNotice("Rack position updated successfully.");
      await loadData();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update location");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm("Delete this location?");
      if (!confirmed) return;
    }

    try {
      setIsDeletingId(id);
      setError("");
      setNotice("");

      const response = await fetch(`/api/locations/${id}`, { method: "DELETE" });

      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const message =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Failed to delete location";
        throw new Error(message);
      }

      setNotice("Location deleted.");
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete location");
    } finally {
      setIsDeletingId(null);
    }
  };

  const exportCsv = () => {
    const header = "Location Name,Short Code,Warehouse,Status";
    const rows = locations.map((item) => {
      const status = getStatus(item);
      const values = [item.name, item.code, item.warehouse.name, status].map((value) =>
        `"${String(value).replaceAll('"', '""')}"`
      );
      return values.join(",");
    });

    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "storage-locations.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Location Settings</h1>
          <p className="mt-1 text-base text-slate-500">
            Organize and manage storage zones across your global warehouse network.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
        >
          Export CSV
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-slate-900">
          <ShieldPlus size={18} className="text-indigo-500" />
          <h2 className="text-2xl font-bold">Add New Storage Location</h2>
        </div>

        <form onSubmit={handleCreateLocation} className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600">Location Name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Rack A"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none ring-indigo-500 focus:ring-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600">Short Code</label>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="e.g. RA-01"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none ring-indigo-500 focus:ring-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600">Warehouse</label>
            <select
              value={warehouseId}
              onChange={(event) => setWarehouseId(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none ring-indigo-500 focus:ring-2"
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={15} />
              {isSaving ? "Saving..." : "Save Location"}
            </button>
          </div>
        </form>
      </div>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {notice ? <p className="text-sm font-medium text-emerald-600">{notice}</p> : null}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-lg text-slate-800">Active Locations</h2>

          <div className="text-sm text-slate-500">
            Show: <span className="font-medium text-slate-700">{ROWS_PER_PAGE} Rows</span>
          </div>
        </div>

        {isLoading ? (
          <p className="px-5 py-8 text-sm text-slate-500">Loading locations...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs text-slate-500 uppercase border-b border-slate-100 bg-slate-50/80">
                <tr>
                  <th className="px-5 py-3">Location Name</th>
                  <th className="px-5 py-3">Short Code</th>
                  <th className="px-5 py-3">Warehouse</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="text-sm text-slate-700">
                {visibleRows.map((item) => {
                  const isEditing = editingId === item.id;
                  return (
                    <tr key={item.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-100 p-2 rounded-md">
                            <MapPinned size={15} className="text-indigo-600" />
                          </div>
                          {isEditing ? (
                            <input
                              value={editName}
                              onChange={(event) => setEditName(event.target.value)}
                              className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                            />
                          ) : (
                            <span className="font-semibold text-slate-800">{item.name}</span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {isEditing ? (
                          <input
                            value={editCode}
                            onChange={(event) => setEditCode(event.target.value)}
                            className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                          />
                        ) : (
                          item.code
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {isEditing ? (
                          <select
                            value={editWarehouseId}
                            onChange={(event) => setEditWarehouseId(event.target.value)}
                            className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                          >
                            {warehouses.map((warehouse) => (
                              <option key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="inline-flex items-center gap-2 text-slate-700">
                            <Warehouse size={14} className="text-slate-400" />
                            {item.warehouse?.name ?? "-"}
                          </div>
                        )}
                      </td>

         

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2 text-slate-500">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => void saveEdit(item.id)}
                                disabled={isUpdating}
                                className="rounded-md border border-emerald-300 px-2 py-1 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="rounded-md border border-slate-300 px-2 py-1 text-slate-700 hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(item)}
                                className="rounded p-1 hover:bg-indigo-50 hover:text-indigo-600"
                                aria-label="Edit location"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDelete(item.id)}
                                disabled={isDeletingId === item.id}
                                className="rounded p-1 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                aria-label="Delete location"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap justify-between items-center gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
          <p>
            Showing {visibleRows.length} of {locations.length} locations
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md hover:bg-slate-100 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 rounded-md bg-indigo-600 text-white">
              {currentPage}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md hover:bg-slate-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
          <h3 className="text-xl font-bold text-slate-900">Interactive Map Preview</h3>
          <p className="mt-2 text-sm text-slate-600">
            View and arrange your warehouse zones on a 2D floor plan layout.
          </p>
          <button type="button" className="mt-3 text-sm font-semibold text-indigo-600 hover:underline">
            Launch Warehouse Designer
          </button>
        </div>
        <div className="rounded-xl border border-violet-100 bg-violet-50 p-5">
          <h3 className="text-xl font-bold text-slate-900">Batch Label Printing</h3>
          <p className="mt-2 text-sm text-slate-600">
            Print QR codes for multiple locations at once for your inventory scanners.
          </p>
          <button type="button" className="mt-3 text-sm font-semibold text-violet-600 hover:underline">
            Generate Batch Labels
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationTable;