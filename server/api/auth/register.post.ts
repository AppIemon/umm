import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password, displayName } = body

  if (!username || !password || !displayName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    })
  }

  try {
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Username already exists'
      })
    }

    const user = await User.create({
      username,
      password, // In a real app, hash this!
      displayName
    })

    const userData = {
      _id: user._id,
      username: user.username,
      displayName: user.displayName,
      rating: user.rating,
      matchHistory: user.matchHistory,
      isGuest: false
    }

    // Set cookie for "session"
    setCookie(event, 'auth_user', JSON.stringify(userData), {
      httpOnly: false, // Accessible by frontend for simple demo
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    return userData
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error'
    })
  }
})
