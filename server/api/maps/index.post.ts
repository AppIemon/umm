import { GameMap } from '~/server/models/Map'
import { User } from '~/server/models/User'
import { MusicRequest } from '~/server/models/MusicRequest'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const {
      _id, title, difficulty, seed, beatTimes, sections,
      engineObstacles, enginePortals, autoplayLog,
      duration, creatorName, audioUrl: providedAudioUrl, audioData, audioChunks,
      isShared, bpm, measureLength
    } = body

    // Calculate audio hash and handle separate storage if data exists
    let finalAudioUrl = providedAudioUrl;

    // Process new audio upload
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
          // On Vercel, create a MusicRequest instead of saving the file
          try {
            // Check if request already exists
            let existingRequest = await MusicRequest.findOne({ hash });

            if (!existingRequest) {
              // Create new music request
              existingRequest = await MusicRequest.create({
                hash,
                filename,
                title: title || 'Unknown Track',
                requestedBy: user._id,
                requestedByName: user.displayName,
                status: 'pending',
                bpm: bpm || 120,
                measureLength: measureLength || 2.0
              });
              console.log(`[MusicRequest] Created new music request: ${filename}`);
            }

            // Return error with request status
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
              statusMessage: "MUSIC_REQUEST_FAILED",
              data: {
                guide: "음악 요청 생성 중 오류가 발생했습니다.",
                contact: "https://open.kakao.com/o/sPXMJgUg"
              }
            });
          }
        }

        // Localhost: save directly to public/music
        const musicDir = path.join(process.cwd(), 'public', 'music');

        // Ensure directory exists
        if (!fs.existsSync(musicDir)) {
          fs.mkdirSync(musicDir, { recursive: true });
        }

        const filePath = path.join(musicDir, filename);

        // Write file if it doesn't exist
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, binaryData);
          console.log(`[Audio] Saved new music file: ${filename}`);
        } else {
          console.log(`[Audio] Music file exists, skipping write: ${filename}`);
        }

        finalAudioUrl = `/music/${filename}`;
      }
    }
    // Handle chunked upload (legacy or if client still uses it, but we prefer single string now. 
    // If client sends chunks, we should reconstruct and save. 
    // But for now let's assume client sends audioData for new approach or we just handle the provided url if no data.)

    // Attempt to find user
    let user = await User.findOne({ username: creatorName?.toLowerCase() || 'guest' })
    if (!user) {
      user = await User.create({
        username: creatorName?.toLowerCase() || 'guest',
        password: 'mock_password',
        displayName: creatorName || 'Guest'
      })
    }

    // Data Optimization Helpers
    const round = (num: number, precision: number = 1) => {
      if (typeof num !== 'number' || isNaN(num)) return 0;
      const factor = Math.pow(10, precision);
      return Math.round(num * factor) / factor;
    };

    const optimizeObstacles = (obs: any[]) => {
      if (!Array.isArray(obs)) return [];
      return obs.map(o => {
        const optimized: any = {
          type: o.type,
          x: round(o.x),
          y: round(o.y)
        };

        // Remove default values to save space
        if (o.width && round(o.width) !== 50) optimized.width = round(o.width);
        if (o.height && round(o.height) !== 50) optimized.height = round(o.height);
        if (o.angle && round(o.angle) !== 0) optimized.angle = round(o.angle);

        // Movement optimization
        if (o.movement && o.movement.type !== 'none') {
          optimized.movement = {
            type: o.movement.type,
            range: round(o.movement.range || 0),
            speed: round(o.movement.speed || 0),
            phase: round(o.movement.phase || 0)
          };
        }

        if (o.initialY !== undefined && round(o.initialY) !== round(o.y)) {
          optimized.initialY = round(o.initialY);
        }

        // Children recursive optimization
        if (o.children && Array.isArray(o.children) && o.children.length > 0) {
          optimized.children = optimizeObstacles(o.children);
        }

        return optimized;
      });
    };

    const optimizeLog = (log: any[]) => {
      if (!log || !Array.isArray(log) || log.length === 0) return [];

      const optimized: number[] = [];
      let lastPoint = log[0];

      // Push first point: [x, y, holding (0/1), time]
      optimized.push(round(lastPoint.x), round(lastPoint.y), lastPoint.holding ? 1 : 0, round(lastPoint.time, 3));

      for (let i = 1; i < log.length; i++) {
        const curr = log[i];
        if (!curr) continue;

        // Keep all input changes
        const inputChanged = curr.holding !== lastPoint.holding;

        // Distance-based downsampling: 40px threshold for better optimization
        const distSq = Math.pow(curr.x - lastPoint.x, 2) + Math.pow(curr.y - lastPoint.y, 2);

        if (inputChanged || distSq > 1600) { // 40^2
          optimized.push(round(curr.x), round(curr.y), curr.holding ? 1 : 0, round(curr.time, 3));
          lastPoint = curr;
        }
      }
      return optimized;
    };

    // Process final audio fields
    let audioContentIdToSet = null;
    if (finalAudioUrl && finalAudioUrl.startsWith('audioContentId:')) {
      audioContentIdToSet = finalAudioUrl.split(':')[1];
      finalAudioUrl = null; // Clear URL as we're using the ID reference
    }

    const mapData = {
      title,
      creator: user._id,
      creatorName: user.displayName,
      audioUrl: finalAudioUrl,
      audioData: null, // Clear Base64 data to save space
      audioChunks: [], // Clear chunks to save space
      audioContentId: audioContentIdToSet,
      difficulty,
      seed: seed || 0,
      beatTimes: beatTimes || [],
      sections: sections || [],
      engineObstacles: engineObstacles ? optimizeObstacles(engineObstacles) : [],
      enginePortals: enginePortals ? optimizeObstacles(enginePortals) : [], // Portals share similar structure
      autoplayLog: autoplayLog ? optimizeLog(autoplayLog) : [],
      duration: duration || 60,
      isShared: isShared !== undefined ? isShared : false,
      isVerified: (autoplayLog && autoplayLog.length > 0),
      bpm: bpm || 120,
      measureLength: measureLength || 2.0
    }

    if (_id) {
      const updated = await GameMap.findByIdAndUpdate(_id, mapData, { new: true })
      return updated
    } else {
      const newMap = await GameMap.create(mapData)
      return newMap
    }
  } catch (error: any) {
    console.error("FAILED TO SAVE MAP:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal Server Error"
    });
  }
})
