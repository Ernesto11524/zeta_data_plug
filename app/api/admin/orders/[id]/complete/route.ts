import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
      include: {
        network: { select: { name: true } },
        package: { select: { name: true, amount: true } },
      },
    });

    return NextResponse.json(
      { message: 'Order marked as completed', order },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error completing order:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
