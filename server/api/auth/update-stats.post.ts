import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { rating, record } = body

  const cookie = getCookie(event, 'auth_user')
  if (!cookie) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const currentUser = JSON.parse(cookie)

  try {
    const user = await User.findOneAndUpdate(
      { username: currentUser.username },
      {
        $set: { rating: rating },
        $push: { matchHistory: { $each: [record], $position: 0 } }
      },
      { new: true }
    )

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    const userData = {
      username: user.username,
      displayName: user.displayName,
      rating: user.rating,
      matchHistory: user.matchHistory,
      isGuest: false
    }

    // Refresh cookie
    setCookie(event, 'auth_user', JSON.stringify(userData), {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7
    })

    return userData
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error'
    })
  }
})
