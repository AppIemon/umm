import { c as defineEventHandler, r as readBody, f as connectDB, e as createError, g as setCookie } from '../../../_/nitro.mjs';
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

const register_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password, displayName } = body;
  try {
    await connectDB();
  } catch (e) {
    throw createError({
      statusCode: 503,
      statusMessage: "DB Connection Error: " + e.message
    });
  }
  if (!username || !password || !displayName) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields"
    });
  }
  try {
    const lowercaseUsername = username.toLowerCase().trim();
    const existingUser = await User.findOne({ username: lowercaseUsername });
    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: "Username already exists"
      });
    }
    const user = await User.create({
      username: lowercaseUsername,
      password,
      displayName: displayName.trim()
    });
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
      path: "/",
      sameSite: "lax",
      secure: true
    });
    return userData;
  } catch (error) {
    console.error("Registration Error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Failed to create entity"
    });
  }
});

export { register_post as default };
//# sourceMappingURL=register.post.mjs.map
