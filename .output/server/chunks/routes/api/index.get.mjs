import { c as defineEventHandler, k as getQuery, e as connectDB, f as createError, i as getCookie } from '../../_/nitro.mjs';
import { G as GameMap } from '../../_/Map.mjs';
import { S as Score } from '../../_/Score.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';

const index_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { creator, shared } = query;
  try {
    await connectDB();
  } catch (e) {
    throw createError({
      statusCode: 503,
      statusMessage: "DB Connection Error. Please check Atlas IP Whitelist (0.0.0.0/0). " + e.message
    });
  }
  const filter = {};
  if (shared === "true") {
    filter.isShared = true;
  } else if (creator) {
    filter.creatorName = { $regex: new RegExp(`^${creator}$`, "i") };
  }
  const userCookie = getCookie(event, "auth_user");
  const authUser = userCookie ? JSON.parse(userCookie) : null;
  const userId = (authUser == null ? void 0 : authUser._id) || (authUser == null ? void 0 : authUser.id);
  try {
    const maps = await GameMap.find(filter).select("-audioData -audioChunks -engineObstacles -enginePortals -autoplayLog -sections -beatTimes").sort({ createdAt: -1 }).limit(50).allowDiskUse(true);
    if (userId) {
      const mapIds = maps.map((m) => m._id);
      const userScores = await Score.find({
        player: userId,
        map: { $in: mapIds }
      });
      const scoreMap = new Map(userScores.map((s) => [s.map.toString(), s]));
      return maps.map((m) => {
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
  } catch (e) {
    console.error("Map Fetch Error:", e);
    throw createError({
      statusCode: 500,
      statusMessage: `DB Error: ${e.message}`
    });
  }
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
