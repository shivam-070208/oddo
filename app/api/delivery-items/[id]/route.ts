import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/delivery-items/[id] - Get delivery item by id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const item = await prisma.deliveryItem.findUnique({
      where: { id },
      include: {
        delivery: true,
        product: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Delivery item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching delivery item:", error);
    return NextResponse.json({ error: "Failed to fetch delivery item" }, { status: 500 });
  }
}

// PUT /api/delivery-items/[id] - Update delivery item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quantity, deliveryId, productId } = body;

    const updateData: Record<string, any> = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (deliveryId !== undefined) updateData.deliveryId = deliveryId;
    if (productId !== undefined) updateData.productId = productId;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const item = await prisma.deliveryItem.update({
      where: { id },
      data: updateData,
      include: {
        delivery: true,
        product: true,
      },
    });

    return NextResponse.json(item);
  } catch (error: any) {
    console.error("Error updating delivery item:", error);

    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Delivery item not found" }, { status: 404 });
    }
    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid deliveryId or productId" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to update delivery item" }, { status: 500 });
  }
}

// DELETE /api/delivery-items/[id] - Delete delivery item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.deliveryItem.delete({ where: { id } });

    return NextResponse.json({ message: "Delivery item deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting delivery item:", error);

    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Delivery item not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to delete delivery item" }, { status: 500 });
  }
}
