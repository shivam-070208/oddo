import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    try {
        const { email, otp, newPassword } = await req.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ error: "Email, OTP, and new password are required" }, { status: 400 });
        }
        if (newPassword.length < 6) {
            return NextResponse.json({ error: "New password must be at least 6 characters long" }, { status: 400 });
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

       
        await prisma.oTP.delete({
            where: { email },
        });
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        return NextResponse.json({ message: "Password reset successfully." }, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}