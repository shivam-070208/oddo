import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const validMoveTypes = ["RECEIPT", "DELIVERY", "TRANSFER", "ADJUSTMENT"];

// GET /api/stock-moves/[id] - Get stock move by id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const stockMove = await prisma.stockMove.findUnique({
      where: { id },
      include: {
        product: true,
        fromLocation: true,
        toLocation: true,
      },
    });

    if (!stockMove) {
      return NextResponse.json({ error: "Stock move not found" }, { status: 404 });
    }

    return NextResponse.json(stockMove);
  } catch (error) {
    console.error("Error fetching stock move:", error);
    return NextResponse.json({ error: "Failed to fetch stock move" }, { status: 500 });
  }
}

// PUT /api/stock-moves/[id] - Update stock move
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, quantity, productId, fromLocationId, toLocationId, reference } = body;

    if (type !== undefined && !validMoveTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validMoveTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};
    if (type !== undefined) updateData.type = type;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (productId !== undefined) updateData.productId = productId;
    if (fromLocationId !== undefined) updateData.fromLocationId = fromLocationId;
    if (toLocationId !== undefined) updateData.toLocationId = toLocationId;
    if (reference !== undefined) updateData.reference = reference;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const stockMove = await prisma.stockMove.update({
      where: { id },
      data: updateData,
      include: {
        product: true,
        fromLocation: true,
        toLocation: true,
      },
    });

    return NextResponse.json(stockMove);
  } catch (error: any) {
    console.error("Error updating stock move:", error);

    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Stock move not found" }, { status: 404 });
    }
    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid productId, fromLocationId, or toLocationId" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to update stock move" }, { status: 500 });
  }
}

// DELETE /api/stock-moves/[id] - Delete stock move
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.stockMove.delete({ where: { id } });

    return NextResponse.json({ message: "Stock move deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting stock move:", error);

    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Stock move not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to delete stock move" }, { status: 500 });
  }
}
