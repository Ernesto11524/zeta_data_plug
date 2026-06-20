import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'File too large (max 2MB)' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { message: 'File must be an image' },
        { status: 400 }
      );
    }

    // Convert to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json(
      { imageData: dataUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Upload failed' },
      { status: 500 }
    );
  }
}
