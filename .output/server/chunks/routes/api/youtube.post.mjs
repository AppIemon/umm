import { c as defineEventHandler, r as readBody, f as createError, l as setResponseHeader, m as sendStream } from '../../_/nitro.mjs';
import ytdl from '@distube/ytdl-core';
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

const youtube_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { url } = body;
  if (!url || !ytdl.validateURL(url)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid YouTube URL"
    });
  }
  try {
    let agent;
    const projectRoot = process.cwd();
    const envCookies = process.env.YOUTUBE_COOKIES;
    const parseNetscapeCookies = (content) => {
      const cookies = [];
      content.split(/\r?\n/).forEach((line) => {
        line = line.trim();
        if (!line || line.startsWith("#")) return;
        const parts = line.split(/\t/);
        if (parts.length >= 7) {
          cookies.push({
            domain: parts[0],
            path: parts[2],
            secure: parts[3] === "TRUE",
            expires: parseInt(parts[4]),
            name: parts[5],
            value: parts[6]
          });
        }
      });
      return cookies;
    };
    if (envCookies) {
      try {
        const cookies = parseNetscapeCookies(envCookies);
        if (cookies.length > 0) {
          agent = ytdl.createAgent(cookies);
          console.log(`[YouTube] Successfully loaded ${cookies.length} cookies from Environment Variable`);
        }
      } catch (e) {
        console.error("[YouTube] Failed to parse cookies from Environment Variable:", e);
      }
    }
    if (!agent) {
      const cookiesJsonPath = path.resolve(projectRoot, "youtube-cookies.json");
      const cookiesTxtPath = path.resolve(projectRoot, "youtube-cookies.txt");
      if (fs.existsSync(cookiesJsonPath)) {
        try {
          const cookies = JSON.parse(fs.readFileSync(cookiesJsonPath, "utf8"));
          agent = ytdl.createAgent(cookies);
          console.log("[YouTube] Successfully loaded cookies from JSON file");
        } catch (e) {
          console.error("[YouTube] Failed to parse cookies JSON:", e);
        }
      } else if (fs.existsSync(cookiesTxtPath)) {
        try {
          const content = fs.readFileSync(cookiesTxtPath, "utf8");
          const cookies = parseNetscapeCookies(content);
          if (cookies.length > 0) {
            agent = ytdl.createAgent(cookies);
            console.log(`[YouTube] Successfully loaded ${cookies.length} cookies from txt file`);
          }
        } catch (e) {
          console.error("[YouTube] Failed to parse cookies txt:", e);
        }
      }
    }
    if (!agent) {
      console.log("[YouTube] No cookies found (ENV or File). Proceeding without authentication.");
      agent = ytdl.createAgent();
    }
    const requestOptions = {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": "https://www.youtube.com/",
        "Origin": "https://www.youtube.com",
        "Sec-Ch-Ua": '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin"
      },
      lang: "ko",
      location: "KR"
    };
    console.log(`[YouTube] Fetching info for: ${url}`);
    const info = await ytdl.getInfo(url, { agent, requestOptions });
    const title = info.videoDetails.title.replace(/[\/\\:*?"<>|]/g, "_");
    const format = ytdl.chooseFormat(info.formats, { quality: "highestaudio", filter: "audioonly" });
    console.log(`[YouTube] Successfully fetched info for: ${title}`);
    setResponseHeader(event, "Content-Type", "audio/mpeg");
    const encodedTitle = encodeURIComponent(title + ".mp3");
    setResponseHeader(event, "Content-Disposition", `attachment; filename*=UTF-8''${encodedTitle}`);
    return sendStream(event, ytdl.downloadFromInfo(info, { format, agent, requestOptions }));
  } catch (error) {
    console.error("YouTube Download Error Info:", {
      message: error.message,
      statusCode: error.statusCode,
      status: error.status,
      url
    });
    let message = error.message;
    if (message.includes("confirm you are not a bot") || message.includes("\uB85C\uADF8\uC778\uD558\uC5EC \uBD07\uC774 \uC544\uB2D8\uC744 \uD655\uC778\uD558\uC138\uC694")) {
      message = `YouTube is blocking the request (Bot Detection). Please ensure 'youtube-cookies.txt' is in the project root (${process.cwd()}) and contains valid cookies.`;
    }
    throw createError({
      statusCode: error.statusCode && error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500,
      statusMessage: `Failed to process YouTube video: ${message}`
    });
  }
});

export { youtube_post as default };
//# sourceMappingURL=youtube.post.mjs.map
