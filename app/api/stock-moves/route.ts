import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const validMoveTypes = ["RECEIPT", "DELIVERY", "TRANSFER", "ADJUSTMENT"];

// GET /api/stock-moves - List all stock moves
export async function GET() {
  try {
    const stockMoves = await prisma.stockMove.findMany({
      include: {
        product: true,
        fromLocation: true,
        toLocation: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(stockMoves);
  } catch (error) {
    console.error("Error fetching stock moves:", error);
    return NextResponse.json({ error: "Failed to fetch stock moves" }, { status: 500 });
  }
}

// POST /api/stock-moves - Create stock move
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, quantity, productId, fromLocationId, toLocationId, reference } = body;

    if (!type || quantity === undefined || !productId) {
      return NextResponse.json(
        { error: "Missing required fields: type, quantity, productId" },
        { status: 400 }
      );
    }

    if (!validMoveTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validMoveTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const stockMove = await prisma.stockMove.create({
      data: {
        type,
        quantity,
        productId,
        fromLocationId,
        toLocationId,
        reference,
      },
      include: {
        product: true,
        fromLocation: true,
        toLocation: true,
      },
    });

    return NextResponse.json(stockMove, { status: 201 });
  } catch (error: any) {
    console.error("Error creating stock move:", error);

    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid productId, fromLocationId, or toLocationId" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to create stock move" }, { status: 500 });
  }
}
