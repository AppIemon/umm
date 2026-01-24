import { c as defineEventHandler, r as readBody, f as createError } from '../../../_/nitro.mjs';
import { M as Match } from '../../../_/Match.mjs';
import { G as GameMap } from '../../../_/Map.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';

const status_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { matchId, userId, progress, y } = body;
  if (!matchId) {
    throw createError({ statusCode: 400, statusMessage: "Missing matchId" });
  }
  let match;
  if (userId) {
    match = await Match.findOneAndUpdate(
      { _id: matchId, "players.userId": userId },
      {
        $set: {
          "players.$.progress": progress || 0,
          "players.$.y": y || 360,
          "players.$.lastSeen": /* @__PURE__ */ new Date()
        },
        $max: {
          "players.$.bestProgress": progress || 0
        }
      },
      { new: true }
    );
  }
  if (!match) {
    match = await Match.findById(matchId);
  }
  if (!match) {
    throw createError({ statusCode: 404, statusMessage: "Match not found" });
  }
  const opponent = match.players.find((p) => p.userId !== userId);
  let mapData = null;
  if (match.status === "ready" || match.status === "playing") {
    mapData = await GameMap.findById(match.map);
  }
  return {
    status: match.status,
    opponent: opponent ? {
      username: opponent.username,
      progress: opponent.progress,
      bestProgress: opponent.bestProgress,
      y: opponent.y,
      lastSeen: opponent.lastSeen
    } : null,
    map: mapData
  };
});

export { status_post as default };
//# sourceMappingURL=status.post.mjs.map
