import { c as defineEventHandler, r as readBody, f as createError } from '../../../_/nitro.mjs';
import { G as GameMap } from '../../../_/Map.mjs';
import { M as Match } from '../../../_/Match.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';

const nextMap_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { matchId, userId, mapIndex } = body;
  if (!matchId || !userId) {
    throw createError({ statusCode: 400, statusMessage: "Missing matchId or userId" });
  }
  const match = await Match.findById(matchId);
  if (!match) {
    throw createError({ statusCode: 404, statusMessage: "Match not found" });
  }
  if (!match.mapQueue) {
    match.mapQueue = [match.map];
  }
  if (mapIndex >= match.mapQueue.length) {
    const verifiedCount = await GameMap.countDocuments({ isShared: true, isVerified: true });
    if (verifiedCount > 0) {
      const skip = Math.floor(Math.random() * verifiedCount);
      const newMap2 = await GameMap.findOne({ isShared: true, isVerified: true }).skip(skip);
      if (newMap2) {
        match.mapQueue.push(newMap2._id);
        await match.save();
        return { map: newMap2, mapIndex };
      }
    }
    const { GameEngine } = await import('../../../_/game-engine.mjs');
    const engine = new GameEngine({ difficulty: 7, density: 1, portalFrequency: 0.15 });
    const duration = 60;
    const seed = `multi_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    engine.generateMap(seed, duration, []);
    const success = engine.computeAutoplayLog(200, 360);
    if (!success) {
      throw createError({ statusCode: 500, statusMessage: "Failed to generate map" });
    }
    const newMap = await GameMap.create({
      title: `MULTI_MAP_${Date.now()}`,
      difficulty: 7,
      seed,
      creatorName: "SYSTEM",
      creatorId: null,
      beatTimes: [],
      sections: [],
      engineObstacles: engine.obstacles,
      enginePortals: engine.portals,
      autoplayLog: engine.autoplayLog,
      duration,
      isShared: true,
      isVerified: true,
      isAiVerified: true
    });
    match.mapQueue.push(newMap._id);
    await match.save();
    return { map: newMap, mapIndex };
  }
  const existingMapId = match.mapQueue[mapIndex];
  const existingMap = await GameMap.findById(existingMapId);
  return { map: existingMap, mapIndex };
});

export { nextMap_post as default };
//# sourceMappingURL=next-map.post.mjs.map
