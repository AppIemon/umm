import { GameMap } from '~/server/models/Map'
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

  // Temporary Directory for chunks
  const tempDir = path.join(process.cwd(), 'public', 'music', '_temp_chunks', id)
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }

  // Save this chunk binary
  const binaryChunk = Buffer.from(chunkData, 'base64')
  const chunkPath = path.join(tempDir, `chunk_${chunkIndex}.bin`)
  fs.writeFileSync(chunkPath, binaryChunk)

  // Check if all chunks are uploaded
  const files = fs.readdirSync(tempDir)
  const uploadedCount = files.filter(f => f.startsWith('chunk_') && f.endsWith('.bin')).length

  if (uploadedCount >= totalChunks) {
    console.log(`[Audio] All chunks received for map ${id}. Merging...`)

    // Merge all files in order
    const mergedData = Buffer.alloc(files.reduce((acc, f) => acc + fs.statSync(path.join(tempDir, f)).size, 0))
    let offset = 0
    for (let i = 0; i < totalChunks; i++) {
      const cPath = path.join(tempDir, `chunk_${i}.bin`)
      if (!fs.existsSync(cPath)) {
        throw createError({ statusCode: 500, statusMessage: `Missing chunk ${i} during merge` })
      }
      const data = fs.readFileSync(cPath)
      data.copy(mergedData, offset)
      offset += data.length
    }

    // Generate Hash for final filename
    const hash = crypto.createHash('sha256').update(mergedData).digest('hex')
    const finalFilename = `${hash}.wav` // Assuming WAV from editor
    const musicDir = path.join(process.cwd(), 'public', 'music')
    const finalPath = path.join(musicDir, finalFilename)

    if (!fs.existsSync(finalPath)) {
      fs.writeFileSync(finalPath, mergedData)
    }

    // Update Map
    map.audioUrl = `/music/${finalFilename}`
    map.audioData = null
    map.audioChunks = []
    map.audioContentId = null // We don't use MongoDB AudioContent anymore
    await map.save()

    // Clean up temp dir
    try {
      fs.rmSync(tempDir, { recursive: true, force: true })
    } catch (e) {
      console.error(`[Audio] Cleanup failed for ${tempDir}`, e)
    }

    return { success: true, finished: true, url: map.audioUrl }
  }

  return { success: true, finished: false, index: chunkIndex }
})
