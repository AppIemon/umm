import { GameMap } from '~/server/models/Map'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { score, username } = body

  if (!id || score === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing mapId or score'
    })
  }

  const map = await GameMap.findById(id)
  if (!map) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Map not found'
    })
  }

  // Update best score only if new score is higher
  if (score > (map.bestScore || 0)) {
    map.bestScore = score
    map.bestPlayer = username || 'Guest'
    await map.save()
    return { success: true, updated: true, bestScore: map.bestScore }
  }

  return { success: true, updated: false, bestScore: map.bestScore }
})
