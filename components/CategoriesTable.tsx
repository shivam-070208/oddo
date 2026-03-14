"use client";

import { useEffect, useState } from "react";
import { useSearchContext } from "@/contexts/search-context";

type CategoryRow = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products?: number;
  };
};

type CategoriesTableProps = {
  refreshKey?: number;
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const CategoriesTable = ({ refreshKey = 0 }: CategoriesTableProps) => {
  const { searchQuery } = useSearchContext();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("q", searchQuery.trim());
        const query = params.toString();
        const response = await fetch(`/api/categories${query ? `?${query}` : ""}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load categories");
        }

        const data: unknown = await response.json();
        if (isMounted) {
          setCategories(Array.isArray(data) ? (data as CategoryRow[]) : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [refreshKey, searchQuery]);

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading categories...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  if (!categories.length) {
    return <p className="text-sm text-gray-500">No categories found.</p>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
            <th className="text-left pb-3 pr-6 font-semibold">Category</th>
            <th className="text-left pb-3 pr-6 font-semibold">Products</th>
            <th className="text-left pb-3 pr-6 font-semibold">Created</th>
            <th className="text-right pb-3 font-semibold">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {categories.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 pr-6">
                <span className="text-indigo-500 font-semibold">{row.name}</span>
              </td>
              <td className="py-3 pr-6 text-gray-700">
                {row._count?.products ?? 0}
              </td>
              <td className="py-3 pr-6 text-gray-600">{formatDate(row.createdAt)}</td>
              <td className="py-3 text-right text-gray-500">
                {formatDate(row.updatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoriesTable;
