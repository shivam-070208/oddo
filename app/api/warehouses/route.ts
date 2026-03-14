import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/warehouses - List all warehouses
export async function GET() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        _count: {
          select: { locations: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(warehouses);
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    return NextResponse.json({ error: "Failed to fetch warehouses" }, { status: 500 });
  }
}

// POST /api/warehouses - Create warehouse
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, address } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: "Missing required fields: name, code" },
        { status: 400 }
      );
    }

    const warehouse = await prisma.warehouse.create({
      data: { name, code, address },
    });

    return NextResponse.json(warehouse, { status: 201 });
  } catch (error) {
    console.error("Error creating warehouse:", error);
    return NextResponse.json({ error: "Failed to create warehouse" }, { status: 500 });
  }
}
