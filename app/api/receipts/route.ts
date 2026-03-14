import { getAuthContext } from "@/lib/auth-utils";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/receipts - List all receipts
export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";

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

    const filteredReceipts =
      q.length === 0
        ? receipts
        : receipts.filter((receipt) =>
            [
              receipt.reference,
              receipt.vendor,
              String(receipt.status),
              receipt.responsible?.name ?? "",
            ]
              .join(" ")
              .toLowerCase()
              .includes(q),
          );

    return NextResponse.json(filteredReceipts);
  } catch (error) {
    console.error("Error fetching receipts:", error);
    return NextResponse.json({ error: "Failed to fetch receipts" }, { status: 500 });
  }
}

// POST /api/receipts - Create receipt

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authContext = await getAuthContext();
    if (!authContext?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const responsibleId = authContext.user.id;

    const body = await request.json();
    const { reference, vendor, status, scheduledDate } = body;

    if (!reference || !vendor || !status || !scheduledDate) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: reference, vendor, status, scheduledDate",
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
  } catch (error) {
    console.error("Error creating receipt:", error);

    if ((error as any)?.code === "P2002") {
      return NextResponse.json({ error: "Reference already exists" }, { status: 409 });
    }
    if ((error as any)?.code === "P2003") {
      return NextResponse.json({ error: "Invalid responsibleId" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create receipt" }, { status: 500 });
  }
}
