import { c as defineEventHandler } from '../../_/nitro.mjs';
import { R as Room } from '../../_/Room.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';

const index_get = defineEventHandler(async (event) => {
  const rooms = await Room.find({ status: "waiting" }).select("title maxPlayers players duration createdAt").sort({ createdAt: -1 }).limit(20);
  return {
    rooms: rooms.map((r) => {
      var _a;
      return {
        _id: r._id,
        title: r.title,
        currentPlayers: r.players.length,
        maxPlayers: r.maxPlayers,
        duration: r.duration,
        host: ((_a = r.players.find((p) => p.isHost)) == null ? void 0 : _a.username) || "Unknown"
      };
    })
  };
});

export { index_get as default };
//# sourceMappingURL=index.get2.mjs.map
