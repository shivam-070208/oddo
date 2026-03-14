import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/delivery-items - List all delivery items
export async function GET() {
  try {
    const items = await prisma.deliveryItem.findMany({
      include: {
        delivery: true,
        product: true,
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching delivery items:", error);
    return NextResponse.json({ error: "Failed to fetch delivery items" }, { status: 500 });
  }
}

// POST /api/delivery-items - Create delivery item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quantity, deliveryId, productId } = body;

    if (quantity === undefined || !deliveryId || !productId) {
      return NextResponse.json(
        { error: "Missing required fields: quantity, deliveryId, productId" },
        { status: 400 }
      );
    }

    const item = await prisma.deliveryItem.create({
      data: {
        quantity,
        deliveryId,
        productId,
      },
      include: {
        delivery: true,
        product: true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error("Error creating delivery item:", error);

    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid deliveryId or productId" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to create delivery item" }, { status: 500 });
  }
}
