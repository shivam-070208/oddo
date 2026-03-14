"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

async function sendOtpApi(email: string): Promise<void> {
  const res = await fetch("/api/otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = typeof data?.error === "string" ? data.error : "Failed to send OTP";
    throw new Error(message);
  }
}

export function useSendOtp() {
  const router = useRouter();

  return useMutation({
    mutationFn: sendOtpApi,
    onSuccess: (_data, email) => {
      toast.success("OTP sent to your email");
      const params = new URLSearchParams({ email });
      router.push(`/forgot-password/verify-otp?${params.toString()}`);
      router.refresh();
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to send OTP");
    },
  });
}
