import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/inventory-adjustments/[id] - Get inventory adjustment by id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const adjustment = await prisma.inventoryAdjustment.findUnique({
      where: { id },
      include: {
        product: true,
        location: true,
      },
    });

    if (!adjustment) {
      return NextResponse.json({ error: "Inventory adjustment not found" }, { status: 404 });
    }

    return NextResponse.json(adjustment);
  } catch (error) {
    console.error("Error fetching inventory adjustment:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory adjustment" },
      { status: 500 }
    );
  }
}

// PUT /api/inventory-adjustments/[id] - Update inventory adjustment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quantity, reason, productId, locationId } = body;

    const updateData: Record<string, any> = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (reason !== undefined) updateData.reason = reason;
    if (productId !== undefined) updateData.productId = productId;
    if (locationId !== undefined) updateData.locationId = locationId;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const adjustment = await prisma.inventoryAdjustment.update({
      where: { id },
      data: updateData,
      include: {
        product: true,
        location: true,
      },
    });

    return NextResponse.json(adjustment);
  } catch (error: any) {
    console.error("Error updating inventory adjustment:", error);

    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Inventory adjustment not found" }, { status: 404 });
    }
    if (error?.code === "P2003") {
      return NextResponse.json({ error: "Invalid productId or locationId" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to update inventory adjustment" },
      { status: 500 }
    );
  }
}

// DELETE /api/inventory-adjustments/[id] - Delete inventory adjustment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.inventoryAdjustment.delete({ where: { id } });

    return NextResponse.json({ message: "Inventory adjustment deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting inventory adjustment:", error);

    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Inventory adjustment not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete inventory adjustment" },
      { status: 500 }
    );
  }
}
