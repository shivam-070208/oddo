import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/receipts/[id] - Get receipt by id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        responsible: {
          select: { id: true, name: true, email: true, role: true },
        },
        items: {
          include: { product: true },
        },
      },
    });

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    return NextResponse.json(receipt);
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return NextResponse.json({ error: "Failed to fetch receipt" }, { status: 500 });
  }
}

// PUT /api/receipts/[id] - Update receipt
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reference, vendor, status, scheduledDate, responsibleId } = body;

    const updateData: Record<string, any> = {};
    if (reference !== undefined) updateData.reference = reference;
    if (vendor !== undefined) updateData.vendor = vendor;
    if (status !== undefined) updateData.status = status;
    if (scheduledDate !== undefined) updateData.scheduledDate = new Date(scheduledDate);
    if (responsibleId !== undefined) updateData.responsibleId = responsibleId;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const receipt = await prisma.receipt.update({
      where: { id },
      data: updateData,
      include: {
        responsible: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json(receipt);
  } catch (error: any) {
    console.error("Error updating receipt:", error);

    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Reference already exists" }, { status: 409 });
    }
    if (error?.code === "P2003") {
      return NextResponse.json({ error: "Invalid responsibleId" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update receipt" }, { status: 500 });
  }
}

// DELETE /api/receipts/[id] - Delete receipt
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.receipt.delete({ where: { id } });

    return NextResponse.json({ message: "Receipt deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting receipt:", error);

    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }
    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "Receipt is referenced by items and cannot be deleted" },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Failed to delete receipt" }, { status: 500 });
  }
}
