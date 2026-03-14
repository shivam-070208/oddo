"use client";

import { useForm } from "react-hook-form";
import { useSendOtp } from "./useSendOtp";
import Link from "next/link";

type FormValues = { email: string };

export default function ForgotPasswordForm() {
  const sendOtp = useSendOtp();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { email: "" },
  });

  const onSubmit = (data: FormValues) => {
    sendOtp.mutate(data.email);
  };

  return (
    <div className="w-full max-w-[420px]">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-shadow duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-violet-600 text-white">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
            Forgot Password
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Enter your email and we&apos;ll send you a one-time code to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
              Email Address
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={sendOtp.isPending}
            className="btn-slice btn-slice-violet w-full rounded-lg bg-violet-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-violet-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-70"
          >
            <span className="btn-slice-inner" aria-hidden />
            <span className="relative z-10">{sendOtp.isPending ? "Sending…" : "Send OTP"}</span>
          </button>

          <div className="text-center">
            <Link href="/login" className="text-sm text-slate-600 hover:text-violet-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
