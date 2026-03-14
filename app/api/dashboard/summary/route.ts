import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [
      totalProducts,
      pendingReceipts,
      pendingDeliveries,
      stockMoves,
      inventoryAdjustments,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.receipt.count({
        where: { status: { in: ["DRAFT", "READY"] } },
      }),
      prisma.delivery.count({
        where: {
          status: { in: ["DRAFT", "READY"] },
        },
      }),
      prisma.stockMove.findMany({
        select: {
          productId: true,
          type: true,
          quantity: true,
        },
      }),
      prisma.inventoryAdjustment.findMany({
        select: {
          productId: true,
          quantity: true,
        },
      }),
    ]);

    const stockByProduct = new Map<string, number>();

    for (const move of stockMoves) {
      const current = stockByProduct.get(move.productId) ?? 0;

      if (move.type === "RECEIPT") {
        stockByProduct.set(move.productId, current + move.quantity);
      } else if (move.type === "DELIVERY") {
        stockByProduct.set(move.productId, current - move.quantity);
      } else if (move.type === "TRANSFER") {
        // Transfer is internal movement and should not change total stock.
        stockByProduct.set(move.productId, current);
      }
    }

    for (const adjustment of inventoryAdjustments) {
      const current = stockByProduct.get(adjustment.productId) ?? 0;
      stockByProduct.set(adjustment.productId, current + adjustment.quantity);
    }

    const totalStockQuantity = Array.from(stockByProduct.values()).reduce(
      (sum, qty) => sum + qty,
      0,
    );

    return NextResponse.json({
      totalProducts,
      totalStockQuantity,
      pendingReceipts,
      pendingDeliveries,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard summary" },
      { status: 500 },
    );
  }
}
