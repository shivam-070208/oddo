import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/locations - List all locations
export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";

    const locations = await prisma.location.findMany({
      include: {
        warehouse: true,
        _count: {
          select: {
            fromMoves: true,
            toMoves: true,
            inventoryAdjustment: true,
          },
        },
      },
    });

    const filteredLocations =
      q.length === 0
        ? locations
        : locations.filter((location) =>
            [location.name, location.code, location.warehouse?.name ?? "", location.warehouse?.code ?? ""]
              .join(" ")
              .toLowerCase()
              .includes(q),
          );

    return NextResponse.json(filteredLocations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}

// POST /api/locations - Create location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, warehouseId } = body;

    if (!name || !code || !warehouseId) {
      return NextResponse.json(
        { error: "Missing required fields: name, code, warehouseId" },
        { status: 400 }
      );
    }

    const location = await prisma.location.create({
      data: { name, code, warehouseId },
      include: { warehouse: true },
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error: any) {
    console.error("Error creating location:", error);

    if (error?.code === "P2003") {
      return NextResponse.json({ error: "Invalid warehouseId" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create location" }, { status: 500 });
  }
}
