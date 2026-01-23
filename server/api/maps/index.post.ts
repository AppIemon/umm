import { GameMap } from '~/server/models/Map'
import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, difficulty, seed, beatTimes, sections, engineObstacles, enginePortals, autoplayLog, duration, creatorName } = body

  // Note: REAL auth should be implemented here. For now, we use creatorName or a mock user.
  let user = await User.findOne({ username: creatorName.toLowerCase() })
  if (!user) {
    // Falls back to a default user or creates a mock one if needed
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
    difficulty,
    seed,
    beatTimes,
    sections,
    engineObstacles,
    enginePortals,
    autoplayLog,
    duration,
    isShared: false
  })

  return newMap
})
