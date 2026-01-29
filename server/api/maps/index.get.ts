import { connectDB } from '~/server/utils/db'
import { GameMap } from '~/server/models/Map'
import { Score } from '~/server/models/Score'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { creator, shared } = query

  try {
    await connectDB()
  } catch (e: any) {
    throw createError({
      statusCode: 503,
      statusMessage: 'DB Connection Error. Please check Atlas IP Whitelist (0.0.0.0/0). ' + e.message
    })
  }

  const filter: any = {}

  if (shared === 'true') {
    filter.isShared = true
  } else if (creator) {
    filter.creatorName = { $regex: new RegExp(`^${creator}$`, 'i') }
  }

  const userCookie = getCookie(event, 'auth_user')
  const authUser = userCookie ? JSON.parse(userCookie) : null
  const userId = authUser?._id || authUser?.id;

  try {
    const maps = await GameMap.find(filter)
      .select('-audioData -audioChunks -engineObstacles -enginePortals -autoplayLog -sections -beatTimes')
      .sort({ createdAt: -1 })
      .limit(50)
      .allowDiskUse(true)

    // Merge personal bests if logged in
    if (userId) {
      const mapIds = maps.map(m => m._id);
      const userScores = await Score.find({
        player: userId,
        map: { $in: mapIds }
      });

      const scoreMap = new Map(userScores.map(s => [s.map.toString(), s]));

      return maps.map(m => {
        const mObj = m.toObject();
        const pScore = scoreMap.get(m._id.toString());
        if (pScore) {
          mObj.myBestScore = pScore.score;
          mObj.myBestProgress = pScore.progress;
        }
        return mObj;
      });
    }

    return maps;
  } catch (e: any) {
    console.error("Map Fetch Error:", e);
    throw createError({
      statusCode: 500,
      statusMessage: `DB Error: ${e.message}`
    })
  }
})
