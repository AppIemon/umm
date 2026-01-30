import { c as defineEventHandler, e as createError } from '../../../_/nitro.mjs';
import { G as GameMap } from '../../../_/Map.mjs';
import { A as AudioContent } from '../../../_/AudioContent.mjs';
import require$$1 from 'crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';

const optimize_get = defineEventHandler(async (event) => {
  var _a, _b;
  const results = {
    totalMaps: 0,
    migratedMaps: 0,
    freedSpaceApprox: 0,
    // bytes
    errors: []
  };
  try {
    const maps = await GameMap.find({
      $or: [
        { audioData: { $ne: null } },
        { audioChunks: { $not: { $size: 0 } } }
      ]
    });
    results.totalMaps = maps.length;
    for (const map of maps) {
      try {
        let fullBase64 = map.audioData || "";
        if (map.audioChunks && map.audioChunks.length > 0) {
          fullBase64 = map.audioChunks.join("");
        }
        if (!fullBase64 || !fullBase64.includes("base64,")) {
          if (!fullBase64) {
            map.audioData = null;
            map.audioChunks = [];
            await map.save();
            results.migratedMaps++;
            continue;
          }
        }
        const dataParts = fullBase64.split("base64,");
        const b64 = dataParts[1] || dataParts[0];
        const binary = Buffer.from(b64, "base64");
        const hash = require$$1.createHash("sha256").update(binary).digest("hex");
        let ac = await AudioContent.findOne({ hash });
        if (!ac) {
          ac = await AudioContent.create({
            hash,
            chunks: [binary],
            size: binary.length
          });
        }
        const oldSize = ((_a = map.audioData) == null ? void 0 : _a.length) || 0 + (((_b = map.audioChunks) == null ? void 0 : _b.reduce((acc, c) => acc + c.length, 0)) || 0);
        map.audioContentId = ac._id;
        map.audioData = null;
        map.audioChunks = [];
        if (map.autoplayLog && Array.isArray(map.autoplayLog)) {
          const optimized = [];
          let last = map.autoplayLog[0];
          if (last) {
            optimized.push(last);
            for (let i = 1; i < map.autoplayLog.length; i++) {
              const curr = map.autoplayLog[i];
              const distSq = Math.pow(curr.x - last.x, 2) + Math.pow(curr.y - last.y, 2);
              if (distSq > 900 || curr.holding !== last.holding) {
                optimized.push(curr);
                last = curr;
              }
            }
            map.autoplayLog = optimized;
          }
        }
        await map.save();
        results.migratedMaps++;
        results.freedSpaceApprox += oldSize;
      } catch (err) {
        results.errors.push(`Map ${map._id}: ${err.message}`);
      }
    }
    return {
      message: "Database optimization complete!",
      results
    };
  } catch (e) {
    throw createError({
      statusCode: 500,
      statusMessage: "Optimization failed: " + e.message
    });
  }
});

export { optimize_get as default };
//# sourceMappingURL=optimize.get.mjs.map
