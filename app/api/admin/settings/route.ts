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
    const {
      paystackPublicKey,
      paystackSecretKey,
      paystackTestMode,
      businessName,
      businessEmail,
      businessPhone,
    } = body;

    // Find existing settings or create new ones
    let settings = await prisma.settings.findFirst();

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          paystackPublicKey,
          paystackSecretKey,
          paystackTestMode,
          businessName,
          businessEmail,
          businessPhone,
        },
      });
    } else {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          paystackPublicKey,
          paystackSecretKey,
          paystackTestMode,
          businessName,
          businessEmail,
          businessPhone,
        },
      });
    }

    return NextResponse.json(
      { message: 'Settings saved successfully', settings },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
