"use client";

import { FormEvent, useState } from "react";
import CategoriesTable from "@/components/CategoriesTable";

const CategoriesContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setName("");
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const message =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Failed to create category.";
        throw new Error(message);
      }

      closeModal();
      setRefreshKey((value) => value + 1);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create category."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Categories</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage product groupings for cleaner inventory tracking.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Add Category
          </button>
        </div>
        <CategoriesTable refreshKey={refreshKey} />
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Add New Category</h3>
              <p className="text-sm text-gray-500 mt-1">
                Create a category to organize your products.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label
                  htmlFor="category-name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Category Name
                </label>
                <input
                  id="category-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Electronics"
                  className="w-full text-black border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {error ? <p className="text-sm text-red-500">{error}</p> : null}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default CategoriesContent;
