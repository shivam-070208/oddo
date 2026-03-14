import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateOTP } from "@/lib/generate-otp";
import { transporter } from "@/lib/email";
export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, name: true, email: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const otp = generateOTP(6);


        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);


        await prisma.oTP.upsert({
            where: { email },
            update: { code: otp, expiresAt },
            create: { email, code: otp, expiresAt },
        });

        await transporter.sendMail({
            from: process.env.SMTP_FROM || "no-reply@example.com",
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is: ${otp}`,
            html: `
<div style="font-family: Arial, sans-serif; background-color:#f4f4f4; padding:40px;">
  <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:8px; text-align:center; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
    
    <h2 style="color:#333;">OTP Verification</h2>
    
    <p style="color:#555; font-size:16px;">
      Hello ${user.name || "User"}, your one time password is:
    </p>

    <div style="
      font-size:32px;
      font-weight:bold;
      letter-spacing:6px;
      background:#f1f5f9;
      padding:15px 25px;
      display:inline-block;
      border-radius:6px;
      margin:20px 0;
      color:#2563eb;
    ">
      ${otp}
    </div>

    <p style="color:#777; font-size:14px;">
      This OTP will expire in <b>10 minutes</b>.
    </p>

    <p style="color:#999; font-size:12px; margin-top:30px;">
      If you didn't request this, please ignore this email.
    </p>

  </div>
</div>
`
            //  html: `<p>Your OTP code is: <b>${otp}</b></p>`,
        });

        return NextResponse.json({ message: "OTP sent" }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}