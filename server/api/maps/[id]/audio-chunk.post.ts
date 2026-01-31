import { GameMap } from '~/server/models/Map'
import { MusicRequest } from '~/server/models/MusicRequest'
import { User } from '~/server/models/User'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

// This endpoint is deprecated - use the main index.post.ts instead
// Kept for backward compatibility
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { audioData } = body // Expect full base64 audio data, not chunks

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing ID' })
  }

  const map = await GameMap.findById(id)
  if (!map) {
    throw createError({ statusCode: 404, statusMessage: 'Map not found' })
  }

  // Process full audio data (no chunking)
  if (audioData && typeof audioData === 'string' && audioData.startsWith('data:')) {
    const matches = audioData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (matches && matches.length === 3) {
      const mimeType = matches[1];
      const base64Data = matches[2];
      const binaryData = Buffer.from(base64Data, 'base64');
      const hash = crypto.createHash('sha256').update(binaryData).digest('hex');

      // Determine extension
      let ext = '.wav';
      if (mimeType.includes('mpeg') || mimeType.includes('mp3')) ext = '.mp3';
      else if (mimeType.includes('ogg')) ext = '.ogg';

      const filename = `${hash}${ext}`;
      const isVercel = !!process.env.VERCEL;

      if (isVercel) {
        // On Vercel, create a MusicRequest
        try {
          // Find user
          let user = await User.findOne({ username: map.creatorName?.toLowerCase() || 'guest' })
          if (!user) {
            user = await User.create({
              username: map.creatorName?.toLowerCase() || 'guest',
              password: 'mock_password',
              displayName: map.creatorName || 'Guest'
            })
          }

          // Check if request already exists
          let existingRequest = await MusicRequest.findOne({ hash });

          if (!existingRequest) {
            existingRequest = await MusicRequest.create({
              hash,
              filename,
              title: map.title || 'Unknown Track',
              requestedBy: user._id,
              requestedByName: user.displayName,
              status: 'pending',
              bpm: map.bpm || 120,
              measureLength: map.measureLength || 2.0
            });
            console.log(`[MusicRequest] Created new music request: ${filename}`);
          }

          throw createError({
            statusCode: 403,
            statusMessage: "MUSIC_REQUEST_PENDING",
            data: {
              requestId: existingRequest._id,
              status: existingRequest.status,
              guide: existingRequest.status === 'pending'
                ? "이 곡은 아직 승인되지 않았습니다. 관리자가 승인할 때까지 기다려주세요!"
                : existingRequest.status === 'rejected'
                  ? "이 곡은 거절되었습니다. 다른 곡을 선택해주세요."
                  : "이 곡은 승인되었지만 아직 서버에 배포되지 않았습니다.",
              contact: "https://open.kakao.com/o/sPXMJgUg"
            }
          });
        } catch (error: any) {
          if (error.statusCode === 403) throw error;
          console.error('[MusicRequest] Error creating request:', error);
          throw createError({
            statusCode: 500,
            statusMessage: "MUSIC_REQUEST_FAILED"
          });
        }
      }

      // Localhost: save directly to public/music
      const musicDir = path.join(process.cwd(), 'public', 'music');

      if (!fs.existsSync(musicDir)) {
        fs.mkdirSync(musicDir, { recursive: true });
      }

      const finalPath = path.join(musicDir, filename);
      if (!fs.existsSync(finalPath)) {
        fs.writeFileSync(finalPath, binaryData);
        console.log(`[Audio] Saved new music file: ${filename}`);
      }

      map.audioUrl = `/music/${filename}`;
      map.audioData = null;
      map.audioChunks = [];
      await map.save();

      return { success: true, finished: true, url: map.audioUrl };
    }
  }

  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid audio data format'
  });
})
