"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

type FormValues = { otp: string };

type Props = { email: string | null };

async function verifyEmailApi(email: string, otp: string): Promise<void> {
  const res = await fetch("/api/otp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = typeof data?.error === "string" ? data.error : "Verification failed";
    throw new Error(message);
  }
}

export default function VerifyEmailForm({ email }: Props) {
  const router = useRouter();
  const verify = useMutation({
    mutationFn: ({ otp }: FormValues) => {
      if (!email) throw new Error("Email is required");
      return verifyEmailApi(email, otp);
    },
    onSuccess: () => {
      toast.success("Email verified. You can sign in now.");
      router.push("/login");
      router.refresh();
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Verification failed");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { otp: "" } });

  if (email == null || email === "") {
    return (
      <div className="w-full max-w-[420px]">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">Missing email. Use the link from your welcome email.</p>
          <Link href="/login" className="mt-4 inline-block text-sm font-medium text-violet-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-violet-600 text-white">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
            Verify your email
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Enter the 6-digit code sent to <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit((data) => verify.mutate(data))} className="space-y-5">
          <div>
            <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-slate-700">
              OTP Code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              className="w-full rounded-lg border text-black border-slate-200 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              {...register("otp", {
                required: "OTP is required",
                pattern: { value: /^\d{6}$/, message: "Enter 6 digits" },
              })}
            />
            {errors.otp && (
              <p className="mt-1.5 text-sm text-red-600">{errors.otp.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={verify.isPending}
            className="w-full rounded-lg bg-violet-600 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-70"
          >
            {verify.isPending ? "Verifying…" : "Verify email"}
          </button>

          <p className="text-center text-sm text-slate-500">
            <Link href="/login" className="text-violet-600 hover:underline">
              Back to Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
