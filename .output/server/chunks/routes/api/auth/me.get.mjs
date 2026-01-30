import { c as defineEventHandler, i as getCookie } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';

const me_get = defineEventHandler(async (event) => {
  const cookie = getCookie(event, "auth_user");
  if (!cookie) return null;
  try {
    return JSON.parse(cookie);
  } catch (e) {
    return null;
  }
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map
