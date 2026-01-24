import { GameMap } from '~/server/models/Map'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { chunkIndex, chunkData, totalChunks } = body

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing ID' })
  }

  if (chunkIndex === undefined || !chunkData || !totalChunks) {
    throw createError({ statusCode: 400, statusMessage: 'Missing chunk data' })
  }

  // Find the map
  const map = await GameMap.findById(id)
  if (!map) {
    throw createError({ statusCode: 404, statusMessage: 'Map not found' })
  }

  // Ensure audioChunks array exists and is properly sized if starting
  // (MongoDB automatically handles array expansion, but we want to be safe)

  // Update the specific chunk
  // Using $set with index to ensure order
  await GameMap.updateOne(
    { _id: id },
    { $set: { [`audioChunks.${chunkIndex}`]: chunkData } }
  )

  // If this is the last chunk (or we have all chunks), we might check integrity?
  // But for now, just saving is enough. The client handles the loop.

  return { success: true, index: chunkIndex }
})
