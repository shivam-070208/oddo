import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/receipt-items - List all receipt items
export async function GET() {
  try {
    const items = await prisma.receiptItem.findMany({
      include: {
        receipt: true,
        product: true,
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching receipt items:", error);
    return NextResponse.json({ error: "Failed to fetch receipt items" }, { status: 500 });
  }
}

// POST /api/receipt-items - Create receipt item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quantity, receiptId, productId } = body;

    if (quantity === undefined || !receiptId || !productId) {
      return NextResponse.json(
        { error: "Missing required fields: quantity, receiptId, productId" },
        { status: 400 }
      );
    }

    const item = await prisma.receiptItem.create({
      data: {
        quantity,
        receiptId,
        productId,
      },
      include: {
        receipt: true,
        product: true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error("Error creating receipt item:", error);

    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid receiptId or productId" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to create receipt item" }, { status: 500 });
  }
}
