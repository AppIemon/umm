import { GameMap } from '~/server/models/Map'
import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    _id, title, difficulty, seed, beatTimes, sections,
    engineObstacles, enginePortals, autoplayLog,
    duration, creatorName, audioUrl, audioData, audioChunks,
    isShared, bpm, measureLength
  } = body

  // Attempt to find user
  let user = await User.findOne({ username: creatorName?.toLowerCase() || 'guest' })
  if (!user) {
    user = await User.create({
      username: creatorName?.toLowerCase() || 'guest',
      password: 'mock_password',
      displayName: creatorName || 'Guest'
    })
  }

  const mapData = {
    title,
    creator: user._id,
    creatorName: user.displayName,
    audioUrl,
    audioData,
    difficulty,
    seed: seed || 0,
    beatTimes: beatTimes || [],
    sections: sections || [],
    engineObstacles: engineObstacles || [],
    enginePortals: enginePortals || [],
    autoplayLog: autoplayLog || [],
    duration: duration || 60,
    audioChunks: audioChunks || [],
    isShared: isShared !== undefined ? isShared : false,
    bpm: bpm || 120,
    measureLength: measureLength || 2.0
  }

  if (_id) {
    const updated = await GameMap.findByIdAndUpdate(_id, mapData, { new: true })
    return updated
  } else {
    const newMap = await GameMap.create(mapData)
    return newMap
  }
})
