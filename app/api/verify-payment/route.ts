import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference, customerPhone, networkId, packageId, amount } = body;

    // Fetch Paystack settings from database
    const settings = await prisma.settings.findFirst();
    if (!settings?.paystackSecretKey) {
      return NextResponse.json(
        { message: 'Paystack not configured' },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${settings.paystackSecretKey}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error('Paystack error:', paystackData);
      return NextResponse.json(
        { message: paystackData.message || 'Payment verification failed' },
        { status: 400 }
      );
    }

    if (paystackData.data.status !== 'success') {
      console.error('Payment not successful:', paystackData.data.status);
      return NextResponse.json(
        { message: `Payment ${paystackData.data.status}` },
        { status: 400 }
      );
    }

    // Verify amount matches
    const paystackAmount = paystackData.data.amount / 100; // Convert from cents
    if (paystackAmount !== amount) {
      return NextResponse.json(
        { message: 'Amount mismatch' },
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

    // Create order with successful payment
    const order = await prisma.order.create({
      data: {
        customerPhone,
        networkId,
        packageId,
        amount,
        paymentReference: reference,
        paymentStatus: 'completed',
        status: 'processing', // Order is processing, waiting for admin fulfillment
      },
      include: {
        network: { select: { name: true } },
        package: { select: { name: true, amount: true } },
      },
    });

    return NextResponse.json(
      {
        message: 'Payment verified and order created',
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Payment verification error:', errorMsg);
    return NextResponse.json(
      { message: `Server error: ${errorMsg}` },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
