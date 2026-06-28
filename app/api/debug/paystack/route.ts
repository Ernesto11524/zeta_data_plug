import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Diagnostic endpoint — shows what Paystack keys are configured
// Visit /api/debug/paystack on Vercel to check configuration
export async function GET() {
  let dbPublicKey: string | null = null;
  let dbSecretKey: string | null = null;
  let dbError: string | null = null;

  try {
    const settings = await prisma.settings.findFirst();
    dbPublicKey = settings?.paystackPublicKey || null;
    dbSecretKey = settings?.paystackSecretKey || null;
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err);
  } finally {
    await prisma.$disconnect();
  }

  const envPublicKey = process.env.PAYSTACK_PUBLIC_KEY || null;
  const envSecretKey = process.env.PAYSTACK_SECRET_KEY || null;

  const effectivePublicKey = dbPublicKey || envPublicKey;
  const effectiveSecretKey = dbSecretKey || envSecretKey;

  return NextResponse.json({
    database: {
      publicKey: dbPublicKey ? `${dbPublicKey.substring(0, 15)}...` : null,
      secretKey: dbSecretKey ? `${dbSecretKey.substring(0, 15)}...` : null,
      error: dbError,
    },
    environment: {
      publicKey: envPublicKey ? `${envPublicKey.substring(0, 15)}...` : null,
      secretKey: envSecretKey ? `${envSecretKey.substring(0, 15)}...` : null,
    },
    effective: {
      publicKey: effectivePublicKey ? `${effectivePublicKey.substring(0, 15)}...` : null,
      secretKey: effectiveSecretKey ? `${effectiveSecretKey.substring(0, 15)}...` : null,
    },
    ready: !!effectivePublicKey && !!effectiveSecretKey,
  });
}
