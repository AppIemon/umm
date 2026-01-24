import { GameMap } from '~/server/models/Map'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  // Extract all potential fields to update
  const {
    title, difficulty, seed, beatTimes, sections,
    engineObstacles, enginePortals, autoplayLog,
    duration, audioUrl, audioData, audioChunks,
    isShared, bpm, measureLength
  } = body

  const updateData: any = {}
  if (title !== undefined) updateData.title = title
  if (difficulty !== undefined) updateData.difficulty = difficulty
  if (seed !== undefined) updateData.seed = seed
  if (beatTimes !== undefined) updateData.beatTimes = beatTimes
  if (sections !== undefined) updateData.sections = sections
  if (engineObstacles !== undefined) updateData.engineObstacles = engineObstacles
  if (enginePortals !== undefined) updateData.enginePortals = enginePortals
  if (autoplayLog !== undefined) updateData.autoplayLog = autoplayLog
  if (duration !== undefined) updateData.duration = duration
  if (audioUrl !== undefined) updateData.audioUrl = audioUrl
  if (audioData !== undefined) updateData.audioData = audioData
  if (audioChunks !== undefined) updateData.audioChunks = audioChunks
  if (isShared !== undefined) updateData.isShared = isShared
  if (bpm !== undefined) updateData.bpm = bpm
  if (measureLength !== undefined) updateData.measureLength = measureLength

  const updatedMap = await GameMap.findByIdAndUpdate(id, { $set: updateData }, { new: true })

  if (!updatedMap) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Map not found'
    })
  }

  return updatedMap
})
