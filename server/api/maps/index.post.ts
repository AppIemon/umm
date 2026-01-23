import { GameMap } from '~/server/models/Map'
import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, difficulty, seed, beatTimes, sections, engineObstacles, enginePortals, autoplayLog, duration, creatorName, audioUrl, audioData, isShared } = body

  // Attempt to find user
  let user = await User.findOne({ username: creatorName.toLowerCase() })
  if (!user) {
    user = await User.create({
      username: creatorName.toLowerCase(),
      password: 'mock_password',
      displayName: creatorName
    })
  }

  const newMap = await GameMap.create({
    title,
    creator: user._id,
    creatorName: user.displayName,
    audioUrl,
    audioData,
    difficulty,
    seed,
    beatTimes,
    sections,
    engineObstacles,
    enginePortals,
    autoplayLog,
    duration,
    isShared: isShared !== undefined ? isShared : false
  })

  return newMap
})
