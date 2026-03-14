import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/receipts - List all receipts
export async function GET() {
  try {
    const receipts = await prisma.receipt.findMany({
      include: {
        responsible: {
          select: { id: true, name: true, email: true, role: true },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(receipts);
  } catch (error) {
    console.error("Error fetching receipts:", error);
    return NextResponse.json({ error: "Failed to fetch receipts" }, { status: 500 });
  }
}

// POST /api/receipts - Create receipt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference, vendor, status, scheduledDate, responsibleId } = body;

    if (!reference || !vendor || !status || !scheduledDate || !responsibleId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: reference, vendor, status, scheduledDate, responsibleId",
        },
        { status: 400 }
      );
    }

    const receipt = await prisma.receipt.create({
      data: {
        reference,
        vendor,
        status,
        scheduledDate: new Date(scheduledDate),
        responsibleId,
      },
      include: {
        responsible: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json(receipt, { status: 201 });
  } catch (error: any) {
    console.error("Error creating receipt:", error);

    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Reference already exists" }, { status: 409 });
    }
    if (error?.code === "P2003") {
      return NextResponse.json({ error: "Invalid responsibleId" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create receipt" }, { status: 500 });
  }
}
