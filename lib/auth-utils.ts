import { prisma } from "@/lib/db";
import { getSessionFromRequest, type SessionPayload } from "@/lib/session";
import type { UserRole } from "@/app/generated/prisma/enums";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
};

export type AuthContext = {
  session: SessionPayload;
  user: UserRecord;
};

type RoleParam = UserRole | UserRole[];

export type AuthOptions = {
  /**
   * Restrict to one role or a list of roles.
   * If omitted, any authenticated user is allowed.
   */
  roles?: RoleParam;
  /**
   * Require the user to have verified their email.
   * Default: false.
   */
  requireVerified?: boolean;
};

function roleMatches(userRole: UserRole, roles?: RoleParam): boolean {
  if (!roles) return true;
  if (Array.isArray(roles)) {
    return roles.includes(userRole);
  }
  return userRole === roles;
}

/**
 * Get the currently authenticated user for the incoming request.
 *
 * - Reads the session cookie
 * - Verifies the JWT
 * - Checks that the user still exists in the database
 * - Optionally enforces role and email verification
 *
 * Returns `null` when:
 * - No session cookie
 * - Invalid / expired token
 * - User no longer exists
 * - Role / verification checks fail
 */
export async function getAuthContext(
  options: AuthOptions = {},
): Promise<AuthContext | null> {
  const session = await getSessionFromRequest();
  if (!session?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
    },
  });

  if (!user) return null;

  if (!roleMatches(user.role as UserRole, options.roles)) {
    return null;
  }

  if (options.requireVerified && !user.emailVerified) {
    return null;
  }

  return { session, user: user as UserRecord };
}

/**
 * Convenience helper when you want to *require* a session
 * and throw if it's not valid for the given options.
 */
export async function requireAuthContext(
  options: AuthOptions = {},
): Promise<AuthContext> {
  const ctx = await getAuthContext(options);
  if (!ctx) {
    throw new Error("Unauthorized");
  }
  return ctx;
}

