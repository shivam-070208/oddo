import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/deliveries - List all deliveries
export async function GET() {
  try {
    const deliveries = await prisma.delivery.findMany({
      include: {
        responsible: {
          select: { id: true, name: true, email: true, role: true },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    return NextResponse.json({ error: "Failed to fetch deliveries" }, { status: 500 });
  }
}

// POST /api/deliveries - Create delivery
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference, customer, status, scheduledDate, responsibleId } = body;

    if (!reference || !customer || !status || !scheduledDate || !responsibleId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: reference, customer, status, scheduledDate, responsibleId",
        },
        { status: 400 }
      );
    }

    const delivery = await prisma.delivery.create({
      data: {
        reference,
        customer,
        status,
        scheduledDate: new Date(scheduledDate),
        responsibleId,
      },
      include: {
        responsible: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json(delivery, { status: 201 });
  } catch (error: any) {
    console.error("Error creating delivery:", error);

    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Reference already exists" }, { status: 409 });
    }
    if (error?.code === "P2003") {
      return NextResponse.json({ error: "Invalid responsibleId" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create delivery" }, { status: 500 });
  }
}
