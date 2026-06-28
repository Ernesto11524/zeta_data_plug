import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();

    // If no settings exist, create default ones
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          paystackTestMode: true,
        },
      });
    }

    // Merge env var keys as fallback so Vercel deployments work
    // without requiring the DB to have keys pre-loaded
    const responseSettings = {
      ...settings,
      paystackPublicKey: settings.paystackPublicKey || process.env.PAYSTACK_PUBLIC_KEY || null,
      paystackSecretKey: undefined, // never expose secret key to client
    };

    return NextResponse.json({ settings: responseSettings }, { status: 200 });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paystackPublicKey, paystackSecretKey, businessName, businessEmail, businessPhone } = body;

    // Only update secret key if a new non-empty value was provided
    const secretKeyUpdate = paystackSecretKey && paystackSecretKey.trim() !== ''
      ? { paystackSecretKey: paystackSecretKey.trim() }
      : {};

    const data = {
      paystackPublicKey,
      businessName: businessName || null,
      businessEmail: businessEmail || null,
      businessPhone: businessPhone || null,
      ...secretKeyUpdate,
    };

    let settings = await prisma.settings.findFirst();

    if (!settings) {
      settings = await prisma.settings.create({ data });
    } else {
      settings = await prisma.settings.update({ where: { id: settings.id }, data });
    }

    return NextResponse.json({ message: 'Settings saved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
