import { c as defineEventHandler, j as getRouterParam, r as readBody, i as getCookie, f as createError } from '../../../../_/nitro.mjs';
import { G as GameMap } from '../../../../_/Map.mjs';
import { S as Score } from '../../../../_/Score.mjs';
import { U as User } from '../../../../_/User.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';

const record_post = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const { score, progress, username } = body;
  const userCookie = getCookie(event, "auth_user");
  const authUser = userCookie ? JSON.parse(userCookie) : null;
  const userId = (authUser == null ? void 0 : authUser._id) || (authUser == null ? void 0 : authUser.id);
  if (!id || score === void 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing mapId or score"
    });
  }
  let mapTitle = "Unknown Map";
  let map = null;
  if (id === "tutorial_mode") {
    mapTitle = "TUTORIAL";
  } else {
    map = await GameMap.findById(id);
    if (!map) {
      throw createError({
        statusCode: 404,
        statusMessage: "Map not found"
      });
    }
    mapTitle = map.title;
  }
  let globalUpdated = false;
  if (map && score > (map.bestScore || 0)) {
    map.bestScore = score;
    map.bestPlayer = username || "Guest";
    globalUpdated = true;
    await map.save();
  }
  let personalUpdated = false;
  if (userId) {
    const existingScore = await Score.findOne({ map: id, player: userId });
    if (existingScore) {
      if (score > existingScore.score) {
        existingScore.score = score;
        existingScore.progress = progress || existingScore.progress;
        existingScore.isCleared = existingScore.progress >= 100;
        existingScore.attempts += 1;
        existingScore.playedAt = /* @__PURE__ */ new Date();
        await existingScore.save();
        personalUpdated = true;
      } else {
        existingScore.attempts += 1;
        await existingScore.save();
      }
    } else {
      await Score.create({
        map: id === "tutorial_mode" ? null : id,
        // Store null or special ID for tutorial
        mapTitle,
        player: userId,
        playerName: username || authUser.username || "Unknown",
        score,
        progress: progress || 0,
        isCleared: (progress || 0) >= 100,
        attempts: 1,
        playedAt: /* @__PURE__ */ new Date()
      });
      personalUpdated = true;
    }
    const user = await User.findById(userId);
    if (user) {
      user.totalScore = (user.totalScore || 0) + (score > 0 ? 1 : 0);
      if ((progress || 0) >= 100) {
        const clearedBefore = await Score.findOne({ map: id, player: userId, isCleared: true });
        if (!clearedBefore || clearedBefore && personalUpdated) {
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
  };
});

export { record_post as default };
//# sourceMappingURL=record.post.mjs.map
