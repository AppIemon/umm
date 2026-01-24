import { GameMap } from '~/server/models/Map'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const deletedMap = await GameMap.findByIdAndDelete(id)

  if (!deletedMap) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Map not found'
    })
  }

  return { message: 'Map deleted successfully' }
})
