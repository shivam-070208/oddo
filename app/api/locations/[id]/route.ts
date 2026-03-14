import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/locations/[id] - Get location by id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        warehouse: true,
        fromMoves: true,
        toMoves: true,
        inventoryAdjustment: true,
      },
    });

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error("Error fetching location:", error);
    return NextResponse.json({ error: "Failed to fetch location" }, { status: 500 });
  }
}

// PUT /api/locations/[id] - Update location
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, code, warehouseId } = body;

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (warehouseId !== undefined) updateData.warehouseId = warehouseId;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const location = await prisma.location.update({
      where: { id },
      data: updateData,
      include: { warehouse: true },
    });

    return NextResponse.json(location);
  } catch (error: any) {
    console.error("Error updating location:", error);

    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }
    if (error?.code === "P2003") {
      return NextResponse.json({ error: "Invalid warehouseId" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
  }
}

// DELETE /api/locations/[id] - Delete location
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.location.delete({ where: { id } });

    return NextResponse.json({ message: "Location deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting location:", error);

    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }
    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "Location is referenced by other records and cannot be deleted" },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Failed to delete location" }, { status: 500 });
  }
}
