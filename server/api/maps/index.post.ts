import { GameMap } from '~/server/models/Map'
import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
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
      if (typeof num !== 'number' || isNaN(num)) return 0;
      const factor = Math.pow(10, precision);
      return Math.round(num * factor) / factor;
    };

    const optimizeObstacles = (obs: any[]) => {
      if (!Array.isArray(obs)) return [];
      return obs.map(o => ({
        ...o,
        x: round(o.x),
        y: round(o.y),
        width: round(o.width),
        height: round(o.height)
      }));
    };

    const optimizeLog = (log: any[]) => {
      if (!log || !Array.isArray(log) || log.length === 0) return [];
      const optimized = [];

      // Ensure first point exists and is valid
      let last = log[0];
      if (!last || typeof last.x !== 'number') return [];

      // Create a copy to avoid mutating original data structure if it matters
      // (Though here we are constructing a new 'optimized' array)

      // Round first point
      // We push a new object to avoid reference issues
      let lastPoint = { ...last, x: round(last.x), y: round(last.y), time: round(last.time, 3) };
      optimized.push(lastPoint);

      for (let i = 1; i < log.length; i++) {
        const curr = log[i];
        if (!curr) continue;

        // Always keep input changes (Critical for gameplay)
        if (curr.holding !== last.holding) {
          const p = { ...curr, x: round(curr.x), y: round(curr.y), time: round(curr.time, 3) };
          optimized.push(p);
          last = curr; // update reference to original for comparison logic? 
          // actually comparison was curr.holding vs last.holding. 
          // lastPoint vs last is different. 
          // Let's stick to logic but use rounded values for storage.
          lastPoint = p;
          continue;
        }

        // Downsample: Keep point only if distance > 15px (Visual fidelity)
        const distSq = Math.pow(curr.x - last.x, 2) + Math.pow(curr.y - last.y, 2);
        if (distSq > 225) { // 15^2
          const p = { ...curr, x: round(curr.x), y: round(curr.y), time: round(curr.time, 3) };
          optimized.push(p);
          last = curr;
          lastPoint = p;
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
  } catch (error: any) {
    console.error("FAILED TO SAVE MAP:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal Server Error"
    });
  }
})
