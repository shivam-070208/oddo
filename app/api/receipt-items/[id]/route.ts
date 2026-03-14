import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/receipt-items/[id] - Get receipt item by id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const item = await prisma.receiptItem.findUnique({
      where: { id },
      include: {
        receipt: true,
        product: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Receipt item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching receipt item:", error);
    return NextResponse.json({ error: "Failed to fetch receipt item" }, { status: 500 });
  }
}

// PUT /api/receipt-items/[id] - Update receipt item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quantity, receiptId, productId } = body;

    const updateData: Record<string, any> = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (receiptId !== undefined) updateData.receiptId = receiptId;
    if (productId !== undefined) updateData.productId = productId;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const item = await prisma.receiptItem.update({
      where: { id },
      data: updateData,
      include: {
        receipt: true,
        product: true,
      },
    });

    return NextResponse.json(item);
  } catch (error: any) {
    console.error("Error updating receipt item:", error);

    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Receipt item not found" }, { status: 404 });
    }
    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid receiptId or productId" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to update receipt item" }, { status: 500 });
  }
}

// DELETE /api/receipt-items/[id] - Delete receipt item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.receiptItem.delete({ where: { id } });

    return NextResponse.json({ message: "Receipt item deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting receipt item:", error);

    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Receipt item not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to delete receipt item" }, { status: 500 });
  }
}
