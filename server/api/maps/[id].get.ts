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

  // 0. Prefer Static URL (New System)
  if (mapObj.audioUrl && mapObj.audioUrl.length > 5) {
    // If we have a URL, use it directly.
    // The frontend expects `audioData` to be fetchable (Data URI or URL).
    // We map audioUrl to audioData so the frontend code works without change.
    mapObj.audioData = mapObj.audioUrl;

    // Clear legacy fields just in case they exist (cleanup)
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

  // Remove chunks from response to save bandwidth
  delete mapObj.audioChunks;

  return mapObj
})
