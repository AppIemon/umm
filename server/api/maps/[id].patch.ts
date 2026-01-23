import { GameMap } from '~/server/models/Map'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { isShared, title } = body
  const updateData: any = {}
  if (isShared !== undefined) updateData.isShared = isShared
  if (title !== undefined) updateData.title = title

  const updatedMap = await GameMap.findByIdAndUpdate(id, updateData, { new: true })

  if (!updatedMap) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Map not found'
    })
  }

  return updatedMap
})
