import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/inventory-adjustments - List all inventory adjustments
export async function GET() {
  try {
    const adjustments = await prisma.inventoryAdjustment.findMany({
      include: {
        product: true,
        location: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(adjustments);
  } catch (error) {
    console.error("Error fetching inventory adjustments:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory adjustments" },
      { status: 500 }
    );
  }
}

// POST /api/inventory-adjustments - Create inventory adjustment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quantity, reason, productId, locationId } = body;

    if (quantity === undefined || !reason || !productId || !locationId) {
      return NextResponse.json(
        { error: "Missing required fields: quantity, reason, productId, locationId" },
        { status: 400 }
      );
    }

    const adjustment = await prisma.inventoryAdjustment.create({
      data: {
        quantity,
        reason,
        productId,
        locationId,
      },
      include: {
        product: true,
        location: true,
      },
    });

    return NextResponse.json(adjustment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating inventory adjustment:", error);

    if (error?.code === "P2003") {
      return NextResponse.json({ error: "Invalid productId or locationId" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create inventory adjustment" },
      { status: 500 }
    );
  }
}
