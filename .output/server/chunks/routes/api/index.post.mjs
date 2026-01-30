import { c as defineEventHandler, r as readBody, e as createError } from '../../_/nitro.mjs';
import { G as GameMap } from '../../_/Map.mjs';
import { U as User } from '../../_/User.mjs';
import require$$1 from 'crypto';
import fs from 'fs';
import path from 'path';
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
  try {
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
      audioUrl: providedAudioUrl,
      audioData,
      audioChunks,
      isShared,
      bpm,
      measureLength
    } = body;
    let finalAudioUrl = providedAudioUrl;
    if (audioData && typeof audioData === "string" && audioData.startsWith("data:")) {
      const matches = audioData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        const binaryData = Buffer.from(base64Data, "base64");
        const hash = require$$1.createHash("sha256").update(binaryData).digest("hex");
        let ext = ".wav";
        if (mimeType.includes("mpeg") || mimeType.includes("mp3")) ext = ".mp3";
        else if (mimeType.includes("ogg")) ext = ".ogg";
        const filename = `${hash}${ext}`;
        const musicDir = path.join(process.cwd(), "public", "music");
        if (!fs.existsSync(musicDir)) {
          fs.mkdirSync(musicDir, { recursive: true });
        }
        const filePath = path.join(musicDir, filename);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, binaryData);
          console.log(`[Audio] Saved new music file: ${filename}`);
        } else {
          console.log(`[Audio] Music file exists, skipping write: ${filename}`);
        }
        finalAudioUrl = `/music/${filename}`;
      }
    }
    let user = await User.findOne({ username: (creatorName == null ? void 0 : creatorName.toLowerCase()) || "guest" });
    if (!user) {
      user = await User.create({
        username: (creatorName == null ? void 0 : creatorName.toLowerCase()) || "guest",
        password: "mock_password",
        displayName: creatorName || "Guest"
      });
    }
    const round = (num, precision = 1) => {
      if (typeof num !== "number" || isNaN(num)) return 0;
      const factor = Math.pow(10, precision);
      return Math.round(num * factor) / factor;
    };
    const optimizeObstacles = (obs) => {
      if (!Array.isArray(obs)) return [];
      return obs.map((o) => ({
        ...o,
        x: round(o.x),
        y: round(o.y),
        width: round(o.width),
        height: round(o.height)
      }));
    };
    const optimizeLog = (log) => {
      if (!log || !Array.isArray(log) || log.length === 0) return [];
      const optimized = [];
      let last = log[0];
      if (!last || typeof last.x !== "number") return [];
      let lastPoint = { ...last, x: round(last.x), y: round(last.y), time: round(last.time, 3) };
      optimized.push(lastPoint);
      for (let i = 1; i < log.length; i++) {
        const curr = log[i];
        if (!curr) continue;
        if (curr.holding !== last.holding) {
          const p = { ...curr, x: round(curr.x), y: round(curr.y), time: round(curr.time, 3) };
          optimized.push(p);
          last = curr;
          lastPoint = p;
          continue;
        }
        const distSq = Math.pow(curr.x - last.x, 2) + Math.pow(curr.y - last.y, 2);
        if (distSq > 900) {
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
      audioUrl: finalAudioUrl,
      audioData: null,
      // Clear Base64 data to save space
      audioChunks: [],
      // Clear chunks to save space
      audioContentId: null,
      // No longer using AudioContent for new maps
      difficulty,
      seed: seed || 0,
      beatTimes: beatTimes || [],
      sections: sections || [],
      engineObstacles: engineObstacles ? optimizeObstacles(engineObstacles) : [],
      enginePortals: enginePortals ? optimizeObstacles(enginePortals) : [],
      // Portals share similar structure
      autoplayLog: autoplayLog ? optimizeLog(autoplayLog) : [],
      duration: duration || 60,
      isShared: isShared !== void 0 ? isShared : false,
      isVerified: autoplayLog && autoplayLog.length > 0,
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
  } catch (error) {
    console.error("FAILED TO SAVE MAP:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal Server Error"
    });
  }
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
