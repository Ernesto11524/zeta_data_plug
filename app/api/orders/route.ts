import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerPhone, networkId, packageId, amount, paymentReference, paymentStatus } = body;

    // Validate phone number (must be 10 digits for Ghana)
    if (!customerPhone || customerPhone.length !== 10 || !/^\d+$/.test(customerPhone)) {
      return NextResponse.json(
        { message: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Verify package exists
    const pkg = await prisma.dataPackage.findUnique({
      where: { id: packageId },
    });

    if (!pkg) {
      return NextResponse.json(
        { message: 'Package not found' },
        { status: 404 }
      );
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        customerPhone,
        networkId,
        packageId,
        amount,
        paymentReference,
        paymentStatus,
        status: 'pending',
      },
      include: {
        network: { select: { name: true } },
        package: { select: { name: true, amount: true } },
      },
    });

    return NextResponse.json(
      { message: 'Order created successfully', order },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
