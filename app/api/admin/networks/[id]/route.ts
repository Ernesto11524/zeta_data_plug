import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    const network = await prisma.network.update({
      where: { id },
      data: { name, description },
    });

    return NextResponse.json(
      { message: 'Network updated', network },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating network:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.network.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Network deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting network:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
