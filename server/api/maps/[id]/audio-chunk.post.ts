import { GameMap } from '~/server/models/Map'
import { AudioContent } from '~/server/models/AudioContent'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { chunkIndex, chunkData, totalChunks } = body

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing ID' })
  }

  if (chunkIndex === undefined || !chunkData || totalChunks === undefined) {
    throw createError({ statusCode: 400, statusMessage: 'Missing chunk info' })
  }

  const map = await GameMap.findById(id)
  if (!map) {
    throw createError({ statusCode: 404, statusMessage: 'Map not found' })
  }

  // Intermediate Storage: use the map document's audioChunks array
  // This avoids filesystem issues on Vercel
  if (!map.audioChunks) map.audioChunks = [];
  map.audioChunks[chunkIndex] = chunkData;
  map.markModified('audioChunks');
  await map.save();

  // Check if all chunks are uploaded
  const uploadedCount = map.audioChunks.filter(c => !!c).length;

  if (uploadedCount >= totalChunks) {
    console.log(`[Audio] All chunks received for map ${id}. Merging...`);

    // Reconstruction
    const buffers = map.audioChunks.map(c => Buffer.from(c, 'base64'));
    const mergedData = Buffer.concat(buffers);

    // Generate Hash for final filename
    const hash = crypto.createHash('sha256').update(mergedData).digest('hex');
    const isVercel = !!process.env.VERCEL;

    if (isVercel) {
      // Save to MongoDB AudioContent
      let audioContent = await AudioContent.findOne({ hash });
      if (!audioContent) {
        audioContent = await AudioContent.create({
          hash,
          chunks: buffers,
          size: mergedData.length
        });
      }
      map.audioUrl = null;
      map.audioContentId = audioContent._id;
    } else {
      // Local FS Strategy
      try {
        const finalFilename = `${hash}.wav`;
        const musicDir = path.join(process.cwd(), 'public', 'music');

        if (!fs.existsSync(musicDir)) {
          fs.mkdirSync(musicDir, { recursive: true });
        }

        const finalPath = path.join(musicDir, finalFilename);
        if (!fs.existsSync(finalPath)) {
          fs.writeFileSync(finalPath, mergedData);
        }
        map.audioUrl = `/music/${finalFilename}`;
        map.audioContentId = null;
      } catch (err) {
        console.error("[Audio] FS Merge failed, falling back to DB:", err);
        let audioContent = await AudioContent.findOne({ hash });
        if (!audioContent) {
          audioContent = await AudioContent.create({
            hash,
            chunks: buffers,
            size: mergedData.length
          });
        }
        map.audioUrl = null;
        map.audioContentId = audioContent._id;
      }
    }

    // Finalize Map
    map.audioData = null;
    map.audioChunks = []; // Clear intermediate chunks
    await map.save();

    return { success: true, finished: true, url: map.audioUrl, audioContentId: map.audioContentId };
  }

  return { success: true, finished: false, index: chunkIndex };
})
