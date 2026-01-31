import { defineEventHandler, readBody, createError } from 'h3'
import { User } from '../../models/User'
import { calculateNewRating, getTierFromRating } from '../../../utils/eloTier'

/**
 * Update ELO rating after multiplayer match
 * 
 * Body: {
 *   userId: string (MongoDB _id)
 *   opponentRating: number
 *   opponentStreak: number
 *   didWin: boolean
 * }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId, opponentRating, opponentStreak, didWin } = body

  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'userId required' })
  }

  // Find user
  const user = await User.findById(userId)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const currentRating = user.rating || 1000
  const currentStreak = user.winStreak || 0

  // Calculate new rating
  const result = calculateNewRating(
    currentRating,
    opponentRating || 1000,
    didWin,
    currentStreak,
    opponentStreak || 0
  )

  // Update user
  user.rating = result.newRating
  user.tier = result.newTier.name

  // Update streak: reset on loss, increment on win
  if (didWin) {
    user.winStreak = currentStreak + 1
  } else {
    user.winStreak = 0
  }

  await user.save()

  return {
    success: true,
    oldRating: currentRating,
    newRating: result.newRating,
    ratingChange: result.ratingChange,
    oldTier: result.oldTier,
    newTier: result.newTier,
    tierChanged: result.tierChanged,
    isPromotion: result.isPromotion,
    winStreak: user.winStreak
  }
})
