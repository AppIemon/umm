import { c as defineEventHandler, r as readBody, e as connectDB, f as createError, g as setCookie } from '../../../_/nitro.mjs';
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

const login_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body;
  try {
    await connectDB();
  } catch (e) {
    throw createError({
      statusCode: 503,
      statusMessage: "DB Connection Error: " + e.message
    });
  }
  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing username or password"
    });
  }
  try {
    const lowercaseUsername = username.toLowerCase().trim();
    const user = await User.findOne({ username: lowercaseUsername, password });
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid username or password"
      });
    }
    const userData = {
      _id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      rating: user.rating,
      isGuest: false
    };
    setCookie(event, "auth_user", JSON.stringify(userData), {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
      // 1 week
      path: "/",
      sameSite: "lax",
      secure: true
    });
    return userData;
  } catch (error) {
    console.error("Login API Error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Authentication error"
    });
  }
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map
