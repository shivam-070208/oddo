import { useQuery } from "@tanstack/react-query";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
};

type SessionResponse = {
  session: {
    user: SessionUser;
    expiresAt: string | null;
  } | null;
};

async function getSessionApi(): Promise<SessionResponse> {
  const res = await fetch("/api/auth/session", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch session");
  }

  return res.json();
}

export function useSession() {
  return useQuery({
    queryKey: ["auth-session"],
    queryFn: getSessionApi,
    retry: false,
  });
}
