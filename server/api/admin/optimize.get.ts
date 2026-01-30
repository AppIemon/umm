import { GameMap } from '~/server/models/Map'
import { AudioContent } from '~/server/models/AudioContent'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const results = {
    totalMaps: 0,
    migratedMaps: 0,
    freedSpaceApprox: 0, // bytes
    errors: [] as string[]
  }

  try {
    const maps = await GameMap.find({
      $or: [
        { audioData: { $ne: null } },
        { audioChunks: { $not: { $size: 0 } } }
      ]
    })

    results.totalMaps = maps.length

    for (const map of maps) {
      try {
        // 1. Reconstruct Audio
        let fullBase64 = map.audioData || '';
        if (map.audioChunks && map.audioChunks.length > 0) {
          fullBase64 = map.audioChunks.join('');
        }

        if (!fullBase64 || !fullBase64.includes('base64,')) {
          // No audio data to migrate or already optimized? 
          // But query found it. Let's just clear if empty.
          if (!fullBase64) {
            map.audioData = null;
            map.audioChunks = [];
            await map.save();
            results.migratedMaps++;
            continue;
          }
        }

        const dataParts = fullBase64.split('base64,');
        const b64 = dataParts[1] || dataParts[0];
        const binary = Buffer.from(b64!, 'base64');
        const hash = crypto.createHash('sha256').update(binary).digest('hex');

        // 2. Find/Create AudioContent
        let ac = await AudioContent.findOne({ hash });
        if (!ac) {
          ac = await AudioContent.create({
            hash,
            chunks: [binary],
            size: binary.length
          });
        }

        // 3. Update Map
        const oldSize = map.audioData?.length || 0 + (map.audioChunks?.reduce((acc, c) => acc + c.length, 0) || 0);

        map.audioContentId = ac._id;
        map.audioData = null;
        map.audioChunks = [];

        // 4. Bonus: Optimize path while we are here
        if (map.autoplayLog && Array.isArray(map.autoplayLog)) {
          // Simplified downsampling
          const optimized = [];
          let last = map.autoplayLog[0];
          if (last) {
            optimized.push(last);
            for (let i = 1; i < map.autoplayLog.length; i++) {
              const curr = map.autoplayLog[i];
              const distSq = Math.pow(curr.x - last.x, 2) + Math.pow(curr.y - last.y, 2);
              if (distSq > 900 || curr.holding !== last.holding) {
                optimized.push(curr);
                last = curr;
              }
            }
            map.autoplayLog = optimized;
          }
        }

        await map.save();

        results.migratedMaps++;
        results.freedSpaceApprox += oldSize;
      } catch (err: any) {
        results.errors.push(`Map ${map._id}: ${err.message}`);
      }
    }

    return {
      message: "Database optimization complete!",
      results
    }
  } catch (e: any) {
    throw createError({
      statusCode: 500,
      statusMessage: "Optimization failed: " + e.message
    })
  }
})
