import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/warehouses/[id] - Get warehouse by id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: { locations: true },
    });

    if (!warehouse) {
      return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
    }

    return NextResponse.json(warehouse);
  } catch (error) {
    console.error("Error fetching warehouse:", error);
    return NextResponse.json({ error: "Failed to fetch warehouse" }, { status: 500 });
  }
}

// PUT /api/warehouses/[id] - Update warehouse
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, code, address } = body;

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (address !== undefined) updateData.address = address;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(warehouse);
  } catch (error: any) {
    console.error("Error updating warehouse:", error);

    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to update warehouse" }, { status: 500 });
  }
}

// DELETE /api/warehouses/[id] - Delete warehouse
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.warehouse.delete({ where: { id } });

    return NextResponse.json({ message: "Warehouse deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting warehouse:", error);

    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
    }
    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "Warehouse is referenced by other records and cannot be deleted" },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Failed to delete warehouse" }, { status: 500 });
  }
}
