import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/products - List all products
export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";

    const products = await prisma.product.findMany({
      include: {
        category: true,
        _count: {
          select: {
            receiptItems: true,
            deliveryItems: true,
            stockMoves: true,
            inventoryAdjustment: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const filteredProducts =
      q.length === 0
        ? products
        : products.filter((product) =>
            [product.name, product.sku, product.unit, product.category?.name ?? ""]
              .join(" ")
              .toLowerCase()
              .includes(q),
          );

    return NextResponse.json(filteredProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/products - Create product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, sku, unit, categoryId } = body;

    if (!name || !sku || !unit || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields: name, sku, unit, categoryId" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: { name, sku, unit, categoryId },
      include: { category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);

    if (error?.code === "P2002") {
      return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
    }
    if (error?.code === "P2003") {
      return NextResponse.json({ error: "Invalid categoryId" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
