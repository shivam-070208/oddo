"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResetPayload = { email: string; otp: string; newPassword: string };

async function resetPasswordApi(payload: ResetPayload): Promise<void> {
  const res = await fetch("/api/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = typeof data?.error === "string" ? data.error : "Failed to reset password";
    throw new Error(message);
  }
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: () => {
      toast.success("Password reset successfully");
      router.push("/login");
      router.refresh();
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to reset password");
    },
  });
}
