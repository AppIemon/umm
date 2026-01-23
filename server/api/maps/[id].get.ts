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

  return map
})
