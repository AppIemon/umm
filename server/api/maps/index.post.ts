import { GameMap } from '~/server/models/Map'
import { User } from '~/server/models/User'
import { AudioContent } from '~/server/models/AudioContent' // Keep for legacy if needed, or remove if unused. Better to keep import for now just in case.
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

        // Pure File-based Strategy
        const isVercel = !!process.env.VERCEL;

        if (isVercel) {
          // On Vercel, we can't write to public/music.
          // Raise a custom error that the client can catch to show the Open Profile Link.
          throw createError({
            statusCode: 403,
            statusMessage: "MUSIC_NOT_IN_SERVER",
            data: {
              guide: "이 곡은 아직 서버(GitHub)에 등록되지 않았습니다. 관리자에게 곡 추가를 요청해주세요!",
              contact: "https://open.kakao.com/o/sPXMJgUg"
            }
          });
        }

        const filename = `${hash}${ext}`;
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
