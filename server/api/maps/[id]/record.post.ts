import { GameMap } from '~/server/models/Map'
import { Score } from '~/server/models/Score'
import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { score, progress, username } = body

  const userCookie = getCookie(event, 'auth_user')
  const authUser = userCookie ? JSON.parse(userCookie) : null
  const userId = authUser?._id || authUser?.id;

  if (!id || score === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing mapId or score'
    })
  }

  let mapTitle = 'Unknown Map';
  let map: any = null;

  if (id === 'tutorial_mode') {
    mapTitle = 'TUTORIAL';
  } else {
    map = await GameMap.findById(id)
    if (!map) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Map not found'
      })
    }
    mapTitle = map.title;
  }

  // 1. Update global best score and verification status
  let globalUpdated = false;
  let mapSaved = false;
  if (map) {
    if (score > (map.bestScore || 0)) {
      map.bestScore = score
      map.bestPlayer = username || 'Guest'
      globalUpdated = true;
      mapSaved = true;
    }

    // If cleared (progress 100%), mark as verified
    if (progress >= 100 && !map.isVerified) {
      map.isVerified = true;
      mapSaved = true;
    }

    if (mapSaved) {
      await map.save()
    }
  }

  // 2. If logged in, update personal record
  let personalUpdated = false;
  if (userId) {
    // Check if a score entry already exists for this map/user
    const existingScore = await Score.findOne({ map: id, player: userId });

    if (existingScore) {
      if (score > existingScore.score) {
        existingScore.score = score;
        existingScore.progress = progress || existingScore.progress;
        existingScore.isCleared = existingScore.progress >= 100;
        existingScore.attempts += 1;
        existingScore.playedAt = new Date();
        await existingScore.save();
        personalUpdated = true;
      } else {
        existingScore.attempts += 1;
        await existingScore.save();
      }
    } else {
      await Score.create({
        map: id === 'tutorial_mode' ? null : id, // Store null or special ID for tutorial
        mapTitle: mapTitle,
        player: userId,
        playerName: username || authUser.username || 'Unknown',
        score: score,
        progress: progress || 0,
        isCleared: (progress || 0) >= 100,
        attempts: 1,
        playedAt: new Date()
      });
      personalUpdated = true;
    }

    // 3. Update User Aggregate Stats
    const user = await User.findById(userId);
    if (user) {
      // Just a simple increment for demonstration, ideally sum up best scores
      user.totalScore = (user.totalScore || 0) + (score > 0 ? 1 : 0);
      if ((progress || 0) >= 100) {
        // Check if this is a new clear
        const clearedBefore = await Score.findOne({ map: id, player: userId, isCleared: true });
        if (!clearedBefore || (clearedBefore && personalUpdated)) {
          // Logic to only increment if it's the first clear for this map?
          // For now just incrementing
          user.mapsCleared = (user.mapsCleared || 0) + 1;
        }
      }
      await user.save();
    }
  }

  return {
    success: true,
    updated: globalUpdated,
    personalUpdated,
    bestScore: map ? map.bestScore : null
  }
})
