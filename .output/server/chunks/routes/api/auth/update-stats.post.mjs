import { c as defineEventHandler, r as readBody, i as getCookie, f as createError, g as setCookie } from '../../../_/nitro.mjs';
import { U as User } from '../../../_/User.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';

const updateStats_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { rating, record } = body;
  const cookie = getCookie(event, "auth_user");
  if (!cookie) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
    });
  }
  const currentUser = JSON.parse(cookie);
  try {
    const user = await User.findOneAndUpdate(
      { username: currentUser.username },
      {
        $set: { rating },
        $push: { matchHistory: { $each: [record], $position: 0 } }
      },
      { new: true }
    );
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found"
      });
    }
    const userData = {
      username: user.username,
      displayName: user.displayName,
      rating: user.rating,
      matchHistory: user.matchHistory,
      isGuest: false
    };
    setCookie(event, "auth_user", JSON.stringify(userData), {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7
    });
    return userData;
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Internal Server Error"
    });
  }
});

export { updateStats_post as default };
//# sourceMappingURL=update-stats.post.mjs.map
