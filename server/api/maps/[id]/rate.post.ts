import { GameMap } from '~~/server/models/Map'

export default defineEventHandler(async (event) => {
  const mapId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { rating } = body // 1 ~ 30

  if (!rating || rating < 1 || rating > 30) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid rating. Must be between 1 and 30.'
    })
  }

  const map = await GameMap.findById(mapId)
  if (!map) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Map not found'
    })
  }

  // Update rating
  map.ratingSum += rating
  map.ratingCount += 1
  map.rating = Number((map.ratingSum / map.ratingCount).toFixed(1))

  await map.save()

  return {
    success: true,
    newRating: map.rating,
    count: map.ratingCount
  }
})
