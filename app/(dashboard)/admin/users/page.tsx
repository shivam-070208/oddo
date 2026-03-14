"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSearchContext } from "@/contexts/search-context";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

type FormValues = {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "INVENTORY_MANAGER" | "WAREHOUSE_STAFF";
};

const ROLE_OPTIONS: { value: FormValues["role"]; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "INVENTORY_MANAGER", label: "Inventory Manager" },
  { value: "WAREHOUSE_STAFF", label: "Warehouse Staff" },
];

export default function AdminUsersPage() {
  const { searchQuery } = useSearchContext();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "WAREHOUSE_STAFF",
    },
  });

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      const query = params.toString();
      const res = await fetch(`/api/users${query ? `?${query}` : ""}`);
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = (await res.json()) as UserItem[];
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, [searchQuery]);

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          typeof body?.error === "string" ? body.error : "Failed to add user";
        throw new Error(message);
      }

      toast.success(
        `User ${body.name} added. Invitation email sent to ${body.email}.`,
      );
      reset();
      setOpen(false);
      await loadUsers();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add user";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="mt-1 text-slate-600">
            View all users and invite new ones.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          Invite user
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-4 text-slate-500">Loading users…</p>
        ) : error ? (
          <p className="p-4 text-red-600">{error}</p>
        ) : users.length === 0 ? (
          <p className="p-4 text-slate-500">No users yet. Invite one above.</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Verified
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">
                    {u.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                    {u.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                    {u.role.replace("_", " ")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.emailVerified
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {u.emailVerified ? "Yes" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Invite new user
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="name"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value:
                          /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "At least 6 characters",
                      },
                    })}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="role"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    {...register("role", { required: true })}
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-70"
                >
                  {isSubmitting ? "Inviting…" : "Invite user"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

