import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import {
  createSessionToken,
  getSessionCookieName,
  getSessionCookieOptions,
} from "@/lib/session";
import { UserRole } from "@/app/generated/prisma/enums";

const VALID_ROLES: UserRole[] = Object.values(UserRole);

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      password?: string;
      role?: string;
    };
    const { email, password, role } = body;

    if (!email || !password || typeof role !== "string") {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
      },
    });

    if (!user || user.role as string != role) {
      return NextResponse.json(
        { error: "Invalid email, password, or role" },
        { status: 401 }
      );
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email, password, or role" },
        { status: 401 }
      );
    }

    const sessionPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const token = await createSessionToken(sessionPayload);
    const userSafe = { id: user.id, name: user.name, email: user.email, role: user.role };

    const res = NextResponse.json({ user: userSafe }, { status: 200 });
    res.cookies.set(getSessionCookieName(), token, getSessionCookieOptions());
    return res;
  } catch(err) {
    console.log(err);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}