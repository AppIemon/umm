import { GameMap } from '~/server/models/Map'
import { AudioContent } from '~/server/models/AudioContent'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  // Find map but only select audio fields to reduce DB load
  const map = await GameMap.findById(id).select('audioContentId audioChunks audioUrl audioData')

  if (!map) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Map not found'
    })
  }

  // 1. If external URL, redirect (though client should have used it directly)
  if (map.audioUrl) {
    return sendRedirect(event, map.audioUrl)
  }

  let finalBuffer: Buffer | null = null;

  // 2. AudioContent (Optimized Storage)
  if (map.audioContentId) {
    const ac = await AudioContent.findById(map.audioContentId);
    if (ac && ac.chunks && ac.chunks.length > 0) {
      // Filter valid chunks
      const validChunks = ac.chunks.filter((c: any) => c);
      if (validChunks.length > 0) {
        finalBuffer = Buffer.concat(validChunks as Buffer[]);
      }
    }
  }

  // 3. Legacy AudioData (Single Base64 String)
  if (!finalBuffer && map.audioData && map.audioData.length > 0) {
    try {
      const matches = map.audioData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        finalBuffer = Buffer.from(matches[2], 'base64');
      } else {
        finalBuffer = Buffer.from(map.audioData, 'base64');
      }
    } catch (e) {
      console.error("Failed to decode legacy audioData", e);
    }
  }

  // 4. Legacy AudioChunks (Base64 Strings)
  if (!finalBuffer && map.audioChunks && map.audioChunks.length > 0) {
    try {
      const fullBase64 = map.audioChunks.join('');
      // Check if it has data URI prefix
      const matches = fullBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        finalBuffer = Buffer.from(matches[2], 'base64');
      } else {
        finalBuffer = Buffer.from(fullBase64, 'base64');
      }
    } catch (e) {
      console.error("Failed to decode legacy audio chunks", e);
    }
  }

  if (!finalBuffer) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Audio not found'
    })
  }

  // Send as binary stream
  setHeader(event, 'Content-Type', 'audio/wav') // Defaulting to wav/mp3 generic. Browser usually detects.
  setHeader(event, 'Content-Length', finalBuffer.length)

  return finalBuffer
})
