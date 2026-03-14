import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import {
  createSessionToken,
  getSessionCookieName,
  getSessionCookieOptions,
} from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();

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

    if (!user || user.role !== role) {
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
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}