import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        network: {
          select: { name: true },
        },
        package: {
          select: { name: true, amount: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate stats
    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === 'pending').length,
      completedOrders: orders.filter((o) => o.status === 'completed').length,
      totalRevenue: orders
        .filter((o) => o.paymentStatus === 'completed')
        .reduce((sum, o) => sum + o.amount, 0),
    };

    return NextResponse.json({ orders, stats }, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
