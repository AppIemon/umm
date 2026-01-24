import { c as defineEventHandler, r as readBody } from '../../_/nitro.mjs';
import { G as GameMap } from '../../_/Map.mjs';
import { U as User } from '../../_/User.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';

const index_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const {
    _id,
    title,
    difficulty,
    seed,
    beatTimes,
    sections,
    engineObstacles,
    enginePortals,
    autoplayLog,
    duration,
    creatorName,
    audioUrl,
    audioData,
    isShared,
    bpm,
    measureLength
  } = body;
  let user = await User.findOne({ username: (creatorName == null ? void 0 : creatorName.toLowerCase()) || "guest" });
  if (!user) {
    user = await User.create({
      username: (creatorName == null ? void 0 : creatorName.toLowerCase()) || "guest",
      password: "mock_password",
      displayName: creatorName || "Guest"
    });
  }
  const mapData = {
    title,
    creator: user._id,
    creatorName: user.displayName,
    audioUrl,
    audioData,
    difficulty,
    seed: seed || 0,
    beatTimes: beatTimes || [],
    sections: sections || [],
    engineObstacles: engineObstacles || [],
    enginePortals: enginePortals || [],
    autoplayLog: autoplayLog || [],
    duration: duration || 60,
    isShared: isShared !== void 0 ? isShared : false,
    bpm: bpm || 120,
    measureLength: measureLength || 2
  };
  if (_id) {
    const updated = await GameMap.findByIdAndUpdate(_id, mapData, { new: true });
    return updated;
  } else {
    const newMap = await GameMap.create(mapData);
    return newMap;
  }
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
