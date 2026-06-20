import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const networkId = searchParams.get('networkId');

    const packages = await prisma.dataPackage.findMany({
      where: networkId ? { networkId } : undefined,
      orderBy: { price: 'asc' },
    });

    return NextResponse.json({ packages }, { status: 200 });
  } catch (error) {
    console.error('Error fetching packages:', error);
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
    const { networkId, name, amount, price, description, isActive } = body;

    const pkg = await prisma.dataPackage.create({
      data: {
        networkId,
        name,
        amount,
        price,
        description,
        isActive,
      },
    });

    return NextResponse.json(
      { message: 'Package created', package: pkg },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
