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
    const { name, amount, price, description, isActive } = body;

    const pkg = await prisma.dataPackage.update({
      where: { id },
      data: { name, amount, price, description, isActive },
    });

    return NextResponse.json(
      { message: 'Package updated', package: pkg },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating package:', error);
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

    await prisma.dataPackage.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Package deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
