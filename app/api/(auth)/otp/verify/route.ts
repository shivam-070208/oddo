import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
        }

        const otpEntry = await prisma.oTP.findUnique({
            where: { email },
        });

        if (!otpEntry || otpEntry.code !== otp) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }

        if (otpEntry.expiresAt < new Date()) {
            return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
        }

      
        await prisma.user.update({
            where: { email },
            data: { emailVerified: true },
        });
        await prisma.oTP.delete({
            where: { email },
        });

        return NextResponse.json({ message: "Email verified successfully." }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}