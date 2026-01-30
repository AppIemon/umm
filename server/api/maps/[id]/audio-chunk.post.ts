import { GameMap } from '~/server/models/Map'
import { AudioContent } from '~/server/models/AudioContent'

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

  // Binary Conversion
  const binaryChunk = Buffer.from(chunkData, 'base64');

  // Find or create AudioContent
  let audioContent;
  if (map.audioContentId) {
    audioContent = await AudioContent.findById(map.audioContentId);
  }

  if (!audioContent) {
    // Create new content (hash will be 'temp' until finished if we don't have client hash)
    // Actually, let's use map ID as a temporary unique identifier or just hashing the first chunk
    audioContent = await AudioContent.create({
      hash: `map_${id}_temp`,
      chunks: new Array(totalChunks).fill(null),
      size: 0
    });
    map.audioContentId = audioContent._id;
    await map.save();
  }

  // Update specific chunk using positional operator or Direct assignment
  // Mongoose $set on arrays
  await AudioContent.updateOne(
    { _id: audioContent._id },
    { $set: { [`chunks.${chunkIndex}`]: binaryChunk } }
  );

  return { success: true, index: chunkIndex }
})
