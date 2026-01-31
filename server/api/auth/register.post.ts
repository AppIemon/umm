import { connectDB } from '~/server/utils/db'
import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password, displayName } = body

  try {
    await connectDB()
  } catch (e: any) {
    throw createError({
      statusCode: 503,
      statusMessage: 'DB Connection Error: ' + e.message
    })
  }

  if (!username || !password || !displayName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    })
  }

  try {
    const lowercaseUsername = username.toLowerCase().trim()
    const existingUser = await User.findOne({ username: lowercaseUsername })

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Username already exists'
      })
    }

    const user = await User.create({
      username: lowercaseUsername,
      password,
      displayName: displayName.trim()
    })

    const userData = {
      _id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      rating: user.rating,
      isGuest: false
    }

    // Set cookie for "session"
    setCookie(event, 'auth_user', JSON.stringify(userData), {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })

    return userData
  } catch (error: any) {
    console.error("Registration Error:", error);

    // Handle Mongoose Validation Error
    if (error.name === 'ValidationError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: { message: error.message }
      })
    }

    // Handle Duplicate Key Error (e.g., username already taken but race condition missed it)
    if (error.code === 11000) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Username already exists',
      })
    }

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to create entity',
      data: { error: error.message }
    })
  }
})
