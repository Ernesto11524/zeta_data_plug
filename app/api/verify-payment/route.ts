import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference, customerPhone, networkId, packageId, amount } = body;

    console.log('[verify-payment] Request:', { reference, customerPhone, networkId, packageId, amount });

    if (!reference || !customerPhone || !networkId || !packageId || amount === undefined) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Get Paystack secret key — env var takes priority over database
    let secretKey: string | null = process.env.PAYSTACK_SECRET_KEY || null;

    if (!secretKey) {
      try {
        const settings = await prisma.settings.findFirst();
        secretKey = settings?.paystackSecretKey || null;
      } catch (dbErr) {
        console.error('[verify-payment] DB error fetching settings:', dbErr);
      }
    }

    if (!secretKey) {
      console.error('[verify-payment] No Paystack secret key found in env or database');
      return NextResponse.json(
        { message: 'Paystack secret key not configured. Please contact support.' },
        { status: 400 }
      );
    }

    console.log('[verify-payment] Using secret key starting with:', secretKey.substring(0, 15));

    // Verify payment with Paystack
    let paystackData: any;
    try {
      const paystackResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const responseText = await paystackResponse.text();
      console.log('[verify-payment] Paystack raw response:', responseText.substring(0, 500));

      try {
        paystackData = JSON.parse(responseText);
      } catch {
        console.error('[verify-payment] Paystack returned non-JSON:', responseText.substring(0, 200));
        return NextResponse.json(
          { message: 'Paystack returned an invalid response. Please try again.' },
          { status: 500 }
        );
      }
    } catch (fetchErr) {
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      console.error('[verify-payment] Failed to reach Paystack API:', msg);
      return NextResponse.json(
        { message: `Could not reach Paystack: ${msg}` },
        { status: 502 }
      );
    }

    if (!paystackData.status || !paystackData.data) {
      console.error('[verify-payment] Paystack error response:', paystackData);
      return NextResponse.json(
        { message: paystackData.message || 'Paystack verification failed' },
        { status: 400 }
      );
    }

    if (paystackData.data.status !== 'success') {
      console.error('[verify-payment] Payment not successful:', paystackData.data.status);
      return NextResponse.json(
        { message: `Payment status is "${paystackData.data.status}" — payment was not completed` },
        { status: 400 }
      );
    }

    // Lenient amount check — allow up to 1 pesewa difference (floating point safety)
    const paystackAmount = paystackData.data.amount / 100;
    const expectedAmount = Number(amount);
    if (Math.abs(paystackAmount - expectedAmount) > 0.01) {
      console.error('[verify-payment] Amount mismatch — paystack:', paystackAmount, 'expected:', expectedAmount);
      return NextResponse.json(
        { message: `Amount mismatch: Paystack received ₵${paystackAmount} but package costs ₵${expectedAmount}` },
        { status: 400 }
      );
    }

    // Check package exists
    let pkg;
    try {
      pkg = await prisma.dataPackage.findUnique({ where: { id: packageId } });
    } catch (dbErr) {
      console.error('[verify-payment] DB error finding package:', dbErr);
      return NextResponse.json({ message: 'Database error checking package' }, { status: 500 });
    }

    if (!pkg) {
      console.error('[verify-payment] Package not found:', packageId);
      return NextResponse.json({ message: 'Package not found' }, { status: 404 });
    }

    // Create the order
    let order;
    try {
      order = await prisma.order.create({
        data: {
          customerPhone,
          networkId,
          packageId,
          amount: expectedAmount,
          paymentReference: reference,
          paymentStatus: 'completed',
          status: 'processing',
        },
        include: {
          network: { select: { name: true } },
          package: { select: { name: true, amount: true } },
        },
      });
    } catch (dbErr) {
      const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
      console.error('[verify-payment] DB error creating order:', msg);
      // Duplicate reference — payment already processed
      if (msg.includes('Unique constraint')) {
        return NextResponse.json(
          { message: 'Order already created for this payment. Check admin dashboard.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ message: `Database error: ${msg}` }, { status: 500 });
    }

    console.log('[verify-payment] Order created successfully:', order.id);
    return NextResponse.json(
      { message: 'Payment verified and order created', order },
      { status: 201 }
    );

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[verify-payment] Unhandled exception:', errorMsg);
    return NextResponse.json({ message: `Server error: ${errorMsg}` }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
