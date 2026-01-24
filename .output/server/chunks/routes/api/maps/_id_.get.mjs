import { c as defineEventHandler, j as getRouterParam, f as createError } from '../../../_/nitro.mjs';
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
  const map = await GameMap.findById(id);
  if (!map) {
    throw createError({
      statusCode: 404,
      statusMessage: "Map not found"
    });
  }
  return map;
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
