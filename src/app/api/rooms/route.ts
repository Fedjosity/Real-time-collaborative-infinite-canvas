import { NextResponse } from 'next/server';
import { generateRoomId } from '@/lib/utils/id';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = body.name || `Room #${generateRoomId().slice(0, 5)}`;
    const roomId = generateRoomId();

    // Try persisting to Prisma if available, else fallback cleanly
    try {
      const newRoom = await db.room.create({
        data: {
          id: roomId,
          name,
          maxUsers: 20,
        },
      });
      return NextResponse.json({
        room: newRoom,
        inviteUrl: `/room/${newRoom.id}`,
      });
    } catch (dbErr) {
      console.warn('[API /rooms] Database not connected or error, falling back to memory room ID:', dbErr);
      // Fallback for development without active postgres
      return NextResponse.json({
        room: {
          id: roomId,
          name,
          maxUsers: 20,
          createdAt: new Date().toISOString(),
        },
        inviteUrl: `/room/${roomId}`,
      });
    }
  } catch (error) {
    console.error('[API /rooms] Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
