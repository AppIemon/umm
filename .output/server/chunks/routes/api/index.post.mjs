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
        const isVercel = !!process.env.VERCEL;
        if (isVercel) {
          throw createError({
            statusCode: 403,
            statusMessage: "MUSIC_NOT_IN_SERVER",
            data: {
              guide: "\uC774 \uACE1\uC740 \uC544\uC9C1 \uC11C\uBC84(GitHub)\uC5D0 \uB4F1\uB85D\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uAD00\uB9AC\uC790\uC5D0\uAC8C \uACE1 \uCD94\uAC00\uB97C \uC694\uCCAD\uD574\uC8FC\uC138\uC694!",
              contact: "https://open.kakao.com/o/sPXMJgUg"
            }
          });
        }
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
      return obs.map((o) => {
        const optimized = {
          type: o.type,
          x: round(o.x),
          y: round(o.y)
        };
        if (o.width && round(o.width) !== 50) optimized.width = round(o.width);
        if (o.height && round(o.height) !== 50) optimized.height = round(o.height);
        if (o.angle && round(o.angle) !== 0) optimized.angle = round(o.angle);
        if (o.movement && o.movement.type !== "none") {
          optimized.movement = {
            type: o.movement.type,
            range: round(o.movement.range || 0),
            speed: round(o.movement.speed || 0),
            phase: round(o.movement.phase || 0)
          };
        }
        if (o.initialY !== void 0 && round(o.initialY) !== round(o.y)) {
          optimized.initialY = round(o.initialY);
        }
        if (o.children && Array.isArray(o.children) && o.children.length > 0) {
          optimized.children = optimizeObstacles(o.children);
        }
        return optimized;
      });
    };
    const optimizeLog = (log) => {
      if (!log || !Array.isArray(log) || log.length === 0) return [];
      const optimized = [];
      let lastPoint = log[0];
      optimized.push(round(lastPoint.x), round(lastPoint.y), lastPoint.holding ? 1 : 0, round(lastPoint.time, 3));
      for (let i = 1; i < log.length; i++) {
        const curr = log[i];
        if (!curr) continue;
        const inputChanged = curr.holding !== lastPoint.holding;
        const distSq = Math.pow(curr.x - lastPoint.x, 2) + Math.pow(curr.y - lastPoint.y, 2);
        if (inputChanged || distSq > 1600) {
          optimized.push(round(curr.x), round(curr.y), curr.holding ? 1 : 0, round(curr.time, 3));
          lastPoint = curr;
        }
      }
      return optimized;
    };
    let audioContentIdToSet = null;
    if (finalAudioUrl && finalAudioUrl.startsWith("audioContentId:")) {
      audioContentIdToSet = finalAudioUrl.split(":")[1];
      finalAudioUrl = null;
    }
    const mapData = {
      title,
      creator: user._id,
      creatorName: user.displayName,
      audioUrl: finalAudioUrl,
      audioData: null,
      // Clear Base64 data to save space
      audioChunks: [],
      // Clear chunks to save space
      audioContentId: audioContentIdToSet,
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
