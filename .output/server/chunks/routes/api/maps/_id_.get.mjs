import { c as defineEventHandler, j as getRouterParam, e as createError } from '../../../_/nitro.mjs';
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

const _id__get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const map = await GameMap.findById(id).populate("audioContentId");
  if (!map) {
    throw createError({
      statusCode: 404,
      statusMessage: "Map not found"
    });
  }
  const mapObj = map.toObject();
  if (mapObj.audioUrl && mapObj.audioUrl.length > 5) {
    mapObj.audioData = mapObj.audioUrl;
    delete mapObj.audioContentId;
    delete mapObj.audioChunks;
  } else if (mapObj.audioContentId) {
    const ac = mapObj.audioContentId;
    if (ac.chunks && ac.chunks.length > 0) {
      const validChunks = ac.chunks.filter((c) => c !== null).map((c) => {
        if (Buffer.isBuffer(c)) return c;
        if (c && typeof c === "object" && c.buffer && Buffer.isBuffer(c.buffer)) return c.buffer;
        if (c && c.buffer instanceof ArrayBuffer) return Buffer.from(c.buffer);
        try {
          return Buffer.from(c);
        } catch (e) {
          console.warn("Failed to convert chunk to Buffer:", c);
          return Buffer.alloc(0);
        }
      });
      const buffer = Buffer.concat(validChunks);
      mapObj.audioData = `data:audio/wav;base64,${buffer.toString("base64")}`;
    }
    delete mapObj.audioContentId;
  } else if (!mapObj.audioData && mapObj.audioChunks && mapObj.audioChunks.length > 0) {
    mapObj.audioData = mapObj.audioChunks.join("");
  }
  delete mapObj.audioChunks;
  return mapObj;
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
