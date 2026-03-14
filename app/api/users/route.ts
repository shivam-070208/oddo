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
      subject: "Welcome to StockFlow – Verify your email",
      text: [
        `Welcome, ${name}!`,
        `Your User ID: ${user.id}`,
        `Please verify your email using this code: ${otp}`,
        `Or, open this link: ${verifyUrl}`,
        `This code expires in 10 minutes.`
      ].join("\n\n"),
      html: `
        <div style="background:#f6f8fb;padding:32px;min-height:100vh;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:475px;margin:32px auto;background:#fff;border-radius:12px;box-shadow:0 2px 18px 0 rgba(19,42,66,0.06);overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 0 32px;text-align:center;">
                <div style="background:linear-gradient(90deg,#6366f1,#3b82f6); border-radius:50%;width:56px;height:56px;display:inline-flex;align-items:center;justify-content:center;">
                  <img src="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/icon.png" alt="StockFlow" width="38" height="38" style="display:block;margin:0 auto;border-radius:8px;background:#fff;"/>
                </div>
                <h2 style="font-family:system-ui,sans-serif;font-size:1.6rem;font-weight:700;margin:24px 0 8px">Welcome, ${name}!</h2>
                <p style="font-family:system-ui,sans-serif;font-size:1.06rem;color:#333;margin:0 0 18px;">
                  Thanks for joining <strong>StockFlow</strong>.<br>
                  Please verify your email to activate your account.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 32px 0 32px;text-align:center;">
                <div style="font-family:system-ui,sans-serif;font-size:0.99rem;color:#444;margin-bottom:6px;">
                  Your <span style="color:#6366f1;"><strong>User ID</strong></span> is:
                </div>
                <div style="background:#f5f5fa;padding:8px 18px;border-radius:6px;font-size:1.02rem;letter-spacing:0.04em;display:inline-block;margin-bottom:22px;">
                  <code style="font-family:monospace;color:#1e293b;">${user.id}</code>
                </div>
                <p style="font-family:system-ui,sans-serif;font-size:1.09rem;color:#23272f;margin-bottom:10px;font-weight:600;">
                  Your verification code:
                </p>
                <div style="background:#f3f0fe;border:1px dashed #7c3aed;border-radius:8px;display:inline-block;padding:16px 38px;font-size:2rem;font-family:monospace,monospace;letter-spacing:0.35em;color:#6d28d9;font-weight:700; margin-bottom:16px;">
                  ${otp}
                </div>
                <p style="font-size:0.96rem;font-family:system-ui,sans-serif;color:#555;margin:18px 0 8px;">
                  Or click to verify: <br>
                  <a href="${verifyUrl}" style="color:#4338ca;font-weight:bold;text-decoration:underline;">${verifyUrl}</a>
                </p>
                <p style="font-size:0.92rem; color:#768099; font-family:system-ui,sans-serif; margin-top:22px;margin-bottom:0;">This code will expire in <b>10 minutes</b>.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 24px 32px;">
                <hr style="border:none;border-top:1px solid #f0f0f0;margin:28px auto;">
                <div style="font-family:system-ui,sans-serif;font-size:0.98rem;color:#b0b5be;text-align:center;">
                  If you did not sign up for a StockFlow account, you can safely ignore this email.
                </div>
              </td>
            </tr>
          </table>
        </div>
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
