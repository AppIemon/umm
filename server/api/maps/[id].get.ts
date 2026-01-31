import { GameMap } from '~/server/models/Map'
import { AudioContent } from '~/server/models/AudioContent'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const map = await GameMap.findById(id).populate('audioContentId')

  if (!map) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Map not found'
    })
  }

  // Convert mongoose document to object to modify it
  const mapObj = map.toObject();

  // Data Optimization Helpers (Ensures older unoptimized maps don't break Vercel/SessionStorage)
  const roundNum = (num: number, precision: number = 1) => {
    if (typeof num !== 'number' || isNaN(num)) return 0
    const factor = Math.pow(10, precision)
    return Math.round(num * factor) / factor
  }

  const optimizeObstacles = (obs: any[]) => {
    if (!Array.isArray(obs)) return []
    return obs.map(o => ({
      ...o,
      x: roundNum(o.x),
      y: roundNum(o.y),
      width: roundNum(o.width),
      height: roundNum(o.height)
    }))
  }

  const optimizeLog = (log: any[]) => {
    if (!Array.isArray(log) || log.length === 0) return []
    // Round to 3 decimal places for time, 1 for coords
    return log.map(p => ({
      ...p,
      x: roundNum(p.x),
      y: roundNum(p.y),
      time: roundNum(p.time, 3)
    }))
  }

  // 0. Prefer Static URL (New System)
  if (mapObj.audioUrl && mapObj.audioUrl.length > 5) {
    mapObj.audioData = mapObj.audioUrl;
    delete mapObj.audioContentId;
    delete mapObj.audioChunks;
  }
  // 1. Try to get audio from AudioContent (Legacy optimized way)
  else if (mapObj.audioContentId) {
    const ac = mapObj.audioContentId as any;
    if (ac.chunks && ac.chunks.length > 0) {
      // Filter out null chunks and ensure we have Buffers (handle potential BSON Binary types)
      const validChunks = ac.chunks
        .filter((c: any) => c !== null)
        .map((c: any) => {
          // If it's already a Buffer, return it
          if (Buffer.isBuffer(c)) return c;
          // If it's a BSON Binary object (has .buffer property which is the actual Buffer)
          if (c && typeof c === 'object' && c.buffer && Buffer.isBuffer(c.buffer)) return c.buffer;
          // If it has a .buffer property that is an ArrayBuffer (e.g. some other binary formats)
          if (c && c.buffer instanceof ArrayBuffer) return Buffer.from(c.buffer);
          // As a fallback, try to create a Buffer
          try {
            return Buffer.from(c);
          } catch (e) {
            console.warn('Failed to convert chunk to Buffer:', c);
            return Buffer.alloc(0);
          }
        });

      const buffer = Buffer.concat(validChunks);
      mapObj.audioData = `data:audio/wav;base64,${buffer.toString('base64')}`;
    }
    // No need to return the full content object to client
    delete mapObj.audioContentId;
  }
  // 2. Fallback to legacy chunks in GameMap document
  else if (!mapObj.audioData && mapObj.audioChunks && mapObj.audioChunks.length > 0) {
    mapObj.audioData = mapObj.audioChunks.join('');
  }

  // 2. Optimization on the fly (Prevents Vercel/SessionStorage limits)
  if (mapObj.engineObstacles) mapObj.engineObstacles = optimizeObstacles(mapObj.engineObstacles);
  if (mapObj.enginePortals) mapObj.enginePortals = optimizeObstacles(mapObj.enginePortals);
  if (mapObj.autoplayLog) mapObj.autoplayLog = optimizeLog(mapObj.autoplayLog);

  // Remove chunks to save bandwidth
  delete mapObj.audioChunks;

  return mapObj
})
