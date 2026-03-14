import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { generateOTP } from "@/lib/generate-otp";
import { transporter } from "@/lib/email";

// GET /api/users — List all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, password, role" },
        { status: 400 }
      );
    }

    // Validate role enum
    const validRoles = ["ADMIN", "INVENTORY_MANAGER", "WAREHOUSE_STAFF"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        emailVerified: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const otp = generateOTP(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.oTP.upsert({
      where: { email },
      update: { code: otp, expiresAt },
      create: { email, code: otp, expiresAt },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const verifyUrl = `${baseUrl}/verify-email?email=${encodeURIComponent(email)}`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? "no-reply@example.com",
      to: email,
      subject: "Welcome – Verify your email",
      text: `Welcome, ${name}. Your user ID is: ${user.id}. Please verify your email using this code: ${otp}. You can also verify here: ${verifyUrl}`,
      html: `
        <p>Welcome, <strong>${name}</strong>.</p>
        <p>Your <strong>User ID</strong> is: <code>${user.id}</code>.</p>
        <p>Please verify your email using the code below:</p>
        <p style="font-size:1.25rem;letter-spacing:0.25em;font-weight:600;">${otp}</p>
        <p>Or open this link to verify: <a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>This code expires in 10 minutes.</p>
      `,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);

    // Handle unique constraint violation (duplicate email)
    const prismaError = error as { code?: string } | undefined;
    if (prismaError?.code === "P2002") {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
