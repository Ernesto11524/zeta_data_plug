import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const networks = await prisma.network.findMany({
      include: {
        packages: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ networks }, { status: 200 });
  } catch (error) {
    console.error('Error fetching networks:', error);
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
    const { name, description } = body;

    const network = await prisma.network.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(
      { message: 'Network created', network },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating network:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
