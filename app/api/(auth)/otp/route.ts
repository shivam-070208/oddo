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
            html: `<p>Your OTP code is: <b>${otp}</b></p>`,
        });

        return NextResponse.json({ message: "OTP sent" }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}