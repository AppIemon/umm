import { GameMap } from '~/server/models/Map'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const map = await GameMap.findById(id)

  if (!map) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Map not found'
    })
  }

  // Convert mongoose document to object to modify it
  const mapObj = map.toObject();

  // Reconstruct audioData from chunks if needed
  if (!mapObj.audioData && mapObj.audioChunks && mapObj.audioChunks.length > 0) {
    mapObj.audioData = mapObj.audioChunks.join('');
  }

  // Remove chunks from response to save bandwidth (client only needs audioData)
  delete mapObj.audioChunks;

  return mapObj
})
