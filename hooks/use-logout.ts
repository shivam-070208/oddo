import { useMutation } from "@tanstack/react-query";

async function logoutApi(): Promise<void> {
  const res = await fetch("/api/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    let errorMessage = "Failed to logout";
    try {
      const data = await res.json();
      if (typeof data?.error === "string") {
        errorMessage = data.error;
      }
    } catch {
      // ignore JSON parse error
    }
    throw new Error(errorMessage);
  }
}

export function useLogout() {
  return useMutation({
    mutationFn: logoutApi,
  });
}