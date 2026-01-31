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
    // Keep the URL, remove heavy sources
    delete mapObj.audioContentId;
    delete mapObj.audioChunks;
    delete mapObj.audioData;
  }
  // 1. Legacy Audio Sources -> Convert to Stream URL
  else if (mapObj.audioContentId || (mapObj.audioChunks && mapObj.audioChunks.length > 0) || (mapObj.audioData && mapObj.audioData.length > 100)) {
    // Instead of embedding 5MB+ of Base64, we point to the streaming endpoint
    // This prevents Vercel Function Payload Too Large errors (4.5MB limit)
    mapObj.audioUrl = `/api/maps/${id}/audio`;

    // Cleanup heavy fields from JSON response
    delete mapObj.audioContentId;
    delete mapObj.audioChunks;
    delete mapObj.audioData;
  }

  // 2. Optimization on the fly (Prevents Vercel/SessionStorage limits)
  if (mapObj.engineObstacles) mapObj.engineObstacles = optimizeObstacles(mapObj.engineObstacles);
  if (mapObj.enginePortals) mapObj.enginePortals = optimizeObstacles(mapObj.enginePortals);
  if (mapObj.autoplayLog) mapObj.autoplayLog = optimizeLog(mapObj.autoplayLog);

  // Remove chunks to save bandwidth
  delete mapObj.audioChunks;

  return mapObj
})
