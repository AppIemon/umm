import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing username or password'
    })
  }

  try {
    const lowercaseUsername = username.toLowerCase().trim()
    const user = await User.findOne({ username: lowercaseUsername, password })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid username or password'
      })
    }

    const userData = {
      _id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      rating: user.rating,
      isGuest: false
    }

    // Set cookie for "session"
    // Limited data in cookie to avoid header size issues
    setCookie(event, 'auth_user', JSON.stringify(userData), {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })

    return userData
  } catch (error: any) {
    console.error("Login API Error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Authentication error'
    })
  }
})
