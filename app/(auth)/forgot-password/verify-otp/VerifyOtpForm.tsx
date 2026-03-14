"use client";

import { useForm } from "react-hook-form";
import { useResetPassword } from "./useResetPassword";
import Link from "next/link";
import { useState } from "react";

type FormValues = { otp: string; newPassword: string; confirmPassword: string };

type Props = { email: string | null };

export default function VerifyOtpForm({ email }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const resetPassword = useResetPassword();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  const newPassword = watch("newPassword");

  const onSubmit = (data: FormValues) => {
    if (!email) return;
    resetPassword.mutate({
      email,
      otp: data.otp,
      newPassword: data.newPassword,
    });
  };

  if (email == null || email === "") {
    return (
      <div className="w-full max-w-[420px]">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.08)] text-center">
          <p className="text-slate-600">Invalid or missing email. Please request a new OTP.</p>
          <Link href="/forgot-password" className="mt-4 inline-block text-sm font-medium text-violet-600 hover:underline">
            Back to Forgot Password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-shadow duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-violet-600 text-white">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
            Verify OTP & Set Password
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Enter the code sent to <strong>{email}</strong> and choose a new password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-slate-700">
              OTP Code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full rounded-lg border border-slate-200 bg-white py-3 px-4 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              {...register("otp", {
                required: "OTP is required",
                minLength: { value: 6, message: "OTP must be 6 digits" },
                maxLength: { value: 6, message: "OTP must be 6 digits" },
                pattern: { value: /^\d{6}$/, message: "OTP must be 6 digits" },
              })}
            />
            {errors.otp && (
              <p className="mt-1.5 text-sm text-red-600">{errors.otp.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-slate-700">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-4 pr-11 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                {...register("newPassword", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1.5 text-sm text-red-600">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirm new password"
              className="w-full rounded-lg border border-slate-200 bg-white py-3 px-4 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (v) => v === newPassword || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={resetPassword.isPending}
            className="btn-slice btn-slice-violet w-full rounded-lg bg-violet-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-violet-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-70"
          >
            <span className="btn-slice-inner" aria-hidden />
            <span className="relative z-10">{resetPassword.isPending ? "Resetting…" : "Reset Password"}</span>
          </button>

          <div className="text-center">
            <Link href="/forgot-password" className="text-sm text-slate-600 hover:text-violet-600 hover:underline">
              Use a different email
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
