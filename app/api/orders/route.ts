import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerPhone, networkId, packageId, amount, paymentReference, paymentStatus, status } = body;

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
        amount: Number(amount),
        paymentReference,
        paymentStatus: paymentStatus || 'pending',
        status: status || 'pending',
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
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error creating order:', msg);
    if (msg.includes('Unique constraint')) {
      return NextResponse.json(
        { message: 'Order already created for this payment' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: `Server error: ${msg}` },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
