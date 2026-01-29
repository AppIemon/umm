import { GameMap } from '~/server/models/Map'
import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    _id, title, difficulty, seed, beatTimes, sections,
    engineObstacles, enginePortals, autoplayLog,
    duration, creatorName, audioUrl, audioData, audioChunks,
    isShared, bpm, measureLength
  } = body

  // Attempt to find user
  let user = await User.findOne({ username: creatorName?.toLowerCase() || 'guest' })
  if (!user) {
    user = await User.create({
      username: creatorName?.toLowerCase() || 'guest',
      password: 'mock_password',
      displayName: creatorName || 'Guest'
    })
  }

  // Data Optimization Helpers
  const round = (num: number, precision: number = 1) => {
    const factor = Math.pow(10, precision);
    return Math.round(num * factor) / factor;
  };

  const optimizeObstacles = (obs: any[]) => {
    return obs.map(o => ({
      ...o,
      x: Math.round(o.x),
      y: Math.round(o.y),
      width: Math.round(o.width),
      height: Math.round(o.height)
    }));
  };

  const optimizeLog = (log: any[]) => {
    if (!log || log.length === 0) return [];
    const optimized = [];
    let last = log[0];
    // Round first point
    last.x = round(last.x);
    last.y = round(last.y);
    last.time = round(last.time, 3);
    optimized.push(last);

    for (let i = 1; i < log.length; i++) {
      const curr = log[i];

      // Always keep input changes (Critical for gameplay)
      if (curr.holding !== last.holding) {
        curr.x = round(curr.x);
        curr.y = round(curr.y);
        curr.time = round(curr.time, 3);
        optimized.push(curr);
        last = curr;
        continue;
      }

      // Downsample: Keep point only if distance > 15px (Visual fidelity)
      // This significantly reduces size while keeping the curve smooth enough
      const distSq = Math.pow(curr.x - last.x, 2) + Math.pow(curr.y - last.y, 2);
      if (distSq > 225) { // 15^2
        curr.x = round(curr.x);
        curr.y = round(curr.y);
        curr.time = round(curr.time, 3);
        optimized.push(curr);
        last = curr;
      }
    }
    return optimized;
  };

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
    engineObstacles: engineObstacles ? optimizeObstacles(engineObstacles) : [],
    enginePortals: enginePortals ? optimizeObstacles(enginePortals) : [], // Portals share similar structure
    autoplayLog: autoplayLog ? optimizeLog(autoplayLog) : [],
    duration: duration || 60,
    audioChunks: audioChunks || [],
    isShared: isShared !== undefined ? isShared : false,
    bpm: bpm || 120,
    measureLength: measureLength || 2.0
  }

  if (_id) {
    const updated = await GameMap.findByIdAndUpdate(_id, mapData, { new: true })
    return updated
  } else {
    const newMap = await GameMap.create(mapData)
    return newMap
  }
})
