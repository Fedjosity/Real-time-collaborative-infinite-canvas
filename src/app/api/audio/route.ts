import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { generateObjectId } from '@/lib/utils/id';
import { db } from '@/lib/db';

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || 'uploads');

/**
 * Ensure upload directory exists.
 */
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (err) {
    // Already exists
  }
}

/**
 * POST /api/audio
 * Upload an audio recording file (WebM / MP4) from MediaRecorder.
 */
export async function POST(request: Request) {
  try {
    await ensureUploadDir();
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const roomId = (formData.get('roomId') as string) || 'default-room';
    const createdBy = (formData.get('createdBy') as string) || 'Anonymous';
    const duration = parseFloat((formData.get('duration') as string) || '0');

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const audioId = generateObjectId();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.type.includes('mp4') ? 'mp4' : 'webm';
    const filename = `${audioId}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // Save file to disk
    await fs.writeFile(filePath, buffer);

    // Try logging metadata to Prisma database if connected
    try {
      await db.audioFile.create({
        data: {
          id: audioId,
          roomId,
          objectId: audioId,
          filename,
          mimeType: file.type || 'audio/webm',
          sizeBytes: buffer.length,
          filePath,
          duration,
          createdBy,
        },
      });
    } catch (dbErr) {
      console.warn('[API /audio] Prisma DB error logging audio file:', dbErr);
    }

    return NextResponse.json({
      audioId,
      filename,
      duration,
      url: `/api/audio?id=${audioId}`,
    });
  } catch (error) {
    console.error('[API /audio] Upload error:', error);
    return NextResponse.json({ error: 'Audio upload failed' }, { status: 500 });
  }
}

/**
 * GET /api/audio?id={audioId}
 * Download / stream recorded audio file by ID.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const audioId = searchParams.get('id');

    if (!audioId) {
      return NextResponse.json({ error: 'Missing audio id' }, { status: 400 });
    }

    await ensureUploadDir();

    // Look for file with webm or mp4 extension
    let filename = `${audioId}.webm`;
    let filePath = path.join(UPLOAD_DIR, filename);

    try {
      await fs.access(filePath);
    } catch {
      filename = `${audioId}.mp4`;
      filePath = path.join(UPLOAD_DIR, filename);
    }

    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    const mimeType = ext === '.mp4' ? 'audio/mp4' : 'audio/webm';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[API /audio] Download error:', error);
    return NextResponse.json({ error: 'Audio file not found' }, { status: 404 });
  }
}
