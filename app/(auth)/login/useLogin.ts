"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type LoginFormRole = "admin" | "inventory_manager" | "warehouse_staff";

const ROLE_TO_API: Record<LoginFormRole, string> = {
  admin: "ADMIN",
  inventory_manager: "INVENTORY_MANAGER",
  warehouse_staff: "WAREHOUSE_STAFF",
};

export type LoginPayload = {
  email: string;
  password: string;
  role: LoginFormRole;
};

type LoginResponse =
  | { user: { id: string; name: string; email: string; role: string } }
  | { error: string };

async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      role: ROLE_TO_API[payload.role],
    }),
    credentials: "include",
  });

  const data: LoginResponse = await res.json();

  if (!res.ok) {
    const message = "error" in data ? data.error : "Login failed";
    throw new Error(message);
  }

  if ("error" in data) throw new Error(data.error);
  return data;
}

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: () => {
      toast.success("Login successful");
      router.push("/");
      router.refresh();
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Login failed");
    },
  });
}
