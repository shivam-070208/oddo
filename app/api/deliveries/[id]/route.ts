import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/deliveries/[id] - Get delivery by id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: {
        responsible: {
          select: { id: true, name: true, email: true, role: true },
        },
        items: {
          include: { product: true },
        },
      },
    });

    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    return NextResponse.json(delivery);
  } catch (error) {
    console.error("Error fetching delivery:", error);
    return NextResponse.json({ error: "Failed to fetch delivery" }, { status: 500 });
  }
}

// PUT /api/deliveries/[id] - Update delivery
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reference, customer, status, scheduledDate, responsibleId } = body;

    const updateData: Record<string, any> = {};
    if (reference !== undefined) updateData.reference = reference;
    if (customer !== undefined) updateData.customer = customer;
    if (status !== undefined) updateData.status = status;
    if (scheduledDate !== undefined) updateData.scheduledDate = new Date(scheduledDate);
    if (responsibleId !== undefined) updateData.responsibleId = responsibleId;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const delivery = await prisma.delivery.update({
      where: { id },
      data: updateData,
      include: {
        responsible: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json(delivery);
  } catch (error: any) {
    console.error("Error updating delivery:", error);

    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Reference already exists" }, { status: 409 });
    }
    if (error?.code === "P2003") {
      return NextResponse.json({ error: "Invalid responsibleId" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update delivery" }, { status: 500 });
  }
}

// DELETE /api/deliveries/[id] - Delete delivery
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.delivery.delete({ where: { id } });

    return NextResponse.json({ message: "Delivery deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting delivery:", error);

    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }
    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "Delivery is referenced by items and cannot be deleted" },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Failed to delete delivery" }, { status: 500 });
  }
}
