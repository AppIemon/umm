import process from 'node:process';globalThis._importMeta_={url:import.meta.url,env:process.env};import { tmpdir } from 'node:os';
import { Server } from 'node:http';
import path, { resolve, dirname, join } from 'node:path';
import crypto$1 from 'node:crypto';
import { parentPort, threadId } from 'node:worker_threads';
import { defineEventHandler, handleCacheHeaders, splitCookiesString, createEvent, fetchWithEvent, isEvent, eventHandler, setHeaders, sendRedirect, proxyRequest, getRequestHeader, setResponseHeaders, setResponseStatus, send, getRequestHeaders, setResponseHeader, appendResponseHeader, getRequestURL, getResponseHeader, removeResponseHeader, createError, getQuery as getQuery$1, readBody, createApp, createRouter as createRouter$1, toNodeListener, lazyEventHandler, getResponseStatus, getRouterParam, setCookie, deleteCookie, getCookie, sendStream, getResponseStatusText } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/h3/dist/index.mjs';
import { escapeHtml } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/@vue/shared/dist/shared.cjs.js';
import mongoose from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/mongoose/index.js';
import fs, { promises } from 'node:fs';
import { Readable } from 'node:stream';
import { createRenderer, getRequestDependencies, getPreloadLinks, getPrefetchLinks } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import { parseURL, withoutBase, joinURL, getQuery, withQuery, withTrailingSlash, decodePath, withLeadingSlash, withoutTrailingSlash, joinRelativeURL } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/ufo/dist/index.mjs';
import destr, { destr as destr$1 } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/destr/dist/index.mjs';
import process$1 from 'node:process';
import { renderToString } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/vue/server-renderer/index.mjs';
import { klona } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/klona/dist/index.mjs';
import defu, { defuFn } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/defu/dist/defu.mjs';
import { snakeCase } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/scule/dist/index.mjs';
import { createHead as createHead$1, propsToString, renderSSRHead } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/unhead/dist/server.mjs';
import { stringify, uneval } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/devalue/index.js';
import { isVNode, toValue, isRef } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/vue/index.mjs';
import { createHooks } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/hookable/dist/index.mjs';
import { createFetch, Headers as Headers$1 } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/ofetch/dist/node.mjs';
import { fetchNodeRequestHandler, callNodeRequestHandler } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/node-mock-http/dist/index.mjs';
import { createStorage, prefixStorage } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/unstorage/dist/index.mjs';
import unstorage_47drivers_47fs from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/unstorage/drivers/fs.mjs';
import { digest } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/ohash/dist/index.mjs';
import { toRouteMatcher, createRouter } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/radix3/dist/index.mjs';
import { readFile } from 'node:fs/promises';
import consola, { consola as consola$1 } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/consola/dist/index.mjs';
import { ErrorParser } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/youch-core/build/index.js';
import { Youch } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/youch/build/index.js';
import { SourceMapConsumer } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/source-map/source-map.js';
import { AsyncLocalStorage } from 'node:async_hooks';
import { getContext } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/unctx/dist/index.mjs';
import { captureRawStackTrace, parseRawStackTrace } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/errx/dist/index.js';
import { fileURLToPath } from 'node:url';
import { dirname as dirname$1, resolve as resolve$1 } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/pathe/dist/index.mjs';
import { walkResolver } from 'file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/node_modules/unhead/dist/utils.mjs';

const serverAssets = [{"baseName":"server","dir":"F:/내가 왜 박치임/impossibletiming/server/assets"}];

const assets$1 = createStorage();

for (const asset of serverAssets) {
  assets$1.mount(asset.baseName, unstorage_47drivers_47fs({ base: asset.dir, ignore: (asset?.ignore || []) }));
}

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('root', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"F:/내가 왜 박치임/impossibletiming","watchOptions":{"ignored":[null]}}));
storage.mount('src', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"F:/내가 왜 박치임/impossibletiming/server","watchOptions":{"ignored":[null]}}));
storage.mount('build', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"F:/내가 왜 박치임/impossibletiming/.nuxt"}));
storage.mount('cache', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"F:/내가 왜 박치임/impossibletiming/.nuxt/cache"}));
storage.mount('data', unstorage_47drivers_47fs({"driver":"fs","base":"F:/내가 왜 박치임/impossibletiming/.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const inlineAppConfig = {
  "nuxt": {}
};



const appConfig = defuFn(inlineAppConfig);

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "dev",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      }
    }
  },
  "public": {},
  "mongodbUri": "mongodb+srv://admin:qwe098@cluster0.sw7tw.mongodb.net/impossibletiming?appName=Cluster0"
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function isJsonRequest(event) {
  if (hasReqHeader(event, "accept", "text/html")) {
    return false;
  }
  return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
  const value = getRequestHeader(event, name);
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}

const iframeStorageBridge = (nonce) => (
  /* js */
  `
(function() {
  const memoryStore = {};

  const NONCE = ${JSON.stringify(nonce)}
  
  const mockStorage = {
    getItem: function(key) {
      return memoryStore[key] !== undefined ? memoryStore[key] : null;
    },
    setItem: function(key, value) {
      memoryStore[key] = String(value);
      window.parent.postMessage({
        type: 'storage-set',
        key: key,
        value: String(value),
        nonce: NONCE
      }, '*');
    },
    removeItem: function(key) {
      delete memoryStore[key];
      window.parent.postMessage({
        type: 'storage-remove',
        key: key,
        nonce: NONCE
      }, '*');
    },
    clear: function() {
      for (const key in memoryStore) {
        delete memoryStore[key];
      }
      window.parent.postMessage({
        type: 'storage-clear',
        nonce: NONCE
      }, '*');
    },
    key: function(index) {
      const keys = Object.keys(memoryStore);
      return keys[index] !== undefined ? keys[index] : null;
    },
    get length() {
      return Object.keys(memoryStore).length;
    }
  };
  
  try {
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: false,
      configurable: true
    });
  } catch (e) {
    window.localStorage = mockStorage;
  }
  
  window.addEventListener('message', function(event) {
    if (event.data.type === 'storage-sync-data' && event.data.nonce === NONCE) {
      const data = event.data.data;
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          memoryStore[key] = data[key];
        }
      }
      if (typeof window.initTheme === 'function') {
        window.initTheme();
      }
      window.dispatchEvent(new Event('storage-ready'));
    }
  });
  
  window.parent.postMessage({ 
    type: 'storage-sync-request',
    nonce: NONCE
  }, '*');
})();
`
);
const parentStorageBridge = (nonce) => (
  /* js */
  `
(function() {
  const host = document.querySelector('nuxt-error-overlay');
  if (!host) return;
  
  // Wait for shadow root to be attached
  const checkShadow = setInterval(function() {
    if (host.shadowRoot) {
      clearInterval(checkShadow);
      const iframe = host.shadowRoot.getElementById('frame');
      if (!iframe) return;

      const NONCE = ${JSON.stringify(nonce)}
      
      window.addEventListener('message', function(event) {
        if (!event.data || event.data.nonce !== NONCE) return;
        
        const data = event.data;
        
        if (data.type === 'storage-set') {
          localStorage.setItem(data.key, data.value);
        } else if (data.type === 'storage-remove') {
          localStorage.removeItem(data.key);
        } else if (data.type === 'storage-clear') {
          localStorage.clear();
        } else if (data.type === 'storage-sync-request') {
          const allData = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            allData[key] = localStorage.getItem(key);
          }
          iframe.contentWindow.postMessage({
            type: 'storage-sync-data',
            data: allData,
            nonce: NONCE
          }, '*');
        }
      });
    }
  }, 10);
})();
`
);
const errorCSS = (
  /* css */
  `
:host {
  --preview-width: 240px;
  --preview-height: 180px;
  --base-width: 1200px;
  --base-height: 900px;
  --z-base: 999999998;
  all: initial;
  display: contents;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
#frame {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  border: none;
  z-index: var(--z-base);
}
#frame[inert] {
  right: 5px;
  bottom: 5px;
  left: auto;
  top: auto;
  width: var(--base-width);
  height: var(--base-height);
  transform: scale(calc(240 / 1200));
  transform-origin: bottom right;
  overflow: hidden;
  border-radius: calc(1200 * 8px / 240);
}
#preview {
  position: fixed;
  right: 5px;
  bottom: 5px;
  width: var(--preview-width);
  height: var(--preview-height);
  overflow: hidden;
  border-radius: 8px;
  pointer-events: none;
  z-index: var(--z-base);
  background: white;
  display: none;
}
#frame:not([inert]) + #preview {
  display: block;
}
#toggle {
  position: fixed;
  right: 5px;
  bottom: 5px;
  width: var(--preview-width);
  height: var(--preview-height);
  background: none;
  border: 3px solid #00DC82;
  border-radius: 8px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s, box-shadow 0.2s;
  z-index: calc(var(--z-base) + 1);
}
#toggle:hover,
#toggle:focus {
  opacity: 1;
  box-shadow: 0 0 20px rgba(0, 220, 130, 0.6);
}
#toggle:focus-visible {
  outline: 3px solid #00DC82;
  outline-offset: 3px;
  box-shadow: 0 0 24px rgba(0, 220, 130, 0.8);
}
@media (prefers-reduced-motion: reduce) {
  #toggle {
    transition: none;
  }
}
`
);
function webComponentScript(base64HTML, startMinimized) {
  return (
    /* js */
    `
  (function() {
    try {
      const host = document.querySelector('nuxt-error-overlay');
      if (!host) return;
      
      const shadow = host.attachShadow({ mode: 'open' });
      
      // Create elements
      const style = document.createElement('style');
      style.textContent = ${JSON.stringify(errorCSS)};
      
      const iframe = document.createElement('iframe');
      iframe.id = 'frame';
      iframe.src = 'data:text/html;base64,${base64HTML}';
      iframe.title = 'Detailed error stack trace';
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
      
      const preview = document.createElement('div');
      preview.id = 'preview';
      
      const button = document.createElement('button');
      button.id = 'toggle';
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('type', 'button');
      button.innerHTML = '<span class="sr-only">Toggle detailed error view</span>';
      
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.className = 'sr-only';
      
      // Update preview snapshot
      function updatePreview() {
        try {
          let previewIframe = preview.querySelector('iframe');
          if (!previewIframe) {
            previewIframe = document.createElement('iframe');
            previewIframe.style.cssText = 'width: 1200px; height: 900px; transform: scale(0.2); transform-origin: top left; border: none;';
            previewIframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
            preview.appendChild(previewIframe);
          }
          
          const doctype = document.doctype ? '<!DOCTYPE ' + document.doctype.name + '>' : '';
          const cleanedHTML = document.documentElement.outerHTML
            .replace(/<nuxt-error-overlay[^>]*>.*?<\\/nuxt-error-overlay>/gs, '')
            .replace(/<script[^>]*>.*?<\\/script>/gs, '');
          
          const iframeDoc = previewIframe.contentDocument || previewIframe.contentWindow.document;
          iframeDoc.open();
          iframeDoc.write(doctype + cleanedHTML);
          iframeDoc.close();
        } catch (error) {
          console.error('Failed to update preview:', error);
        }
      }
      
      function toggleView() {
        const isMinimized = iframe.hasAttribute('inert');
        
        if (isMinimized) {
          updatePreview();
          iframe.removeAttribute('inert');
          button.setAttribute('aria-expanded', 'true');
          liveRegion.textContent = 'Showing detailed error view';
          setTimeout(function() {
            try { iframe.contentWindow.focus(); } catch {}
          }, 100);
        } else {
          iframe.setAttribute('inert', '');
          button.setAttribute('aria-expanded', 'false');
          liveRegion.textContent = 'Showing error page';
          button.focus();
        }
      }
      
      button.onclick = toggleView;
      
      document.addEventListener('keydown', function(e) {
        if ((e.key === 'Escape' || e.key === 'Esc') && !iframe.hasAttribute('inert')) {
          toggleView();
        }
      });
      
      // Append to shadow DOM
      shadow.appendChild(style);
      shadow.appendChild(liveRegion);
      shadow.appendChild(iframe);
      shadow.appendChild(preview);
      shadow.appendChild(button);
      
      if (${startMinimized}) {
        iframe.setAttribute('inert', '');
        button.setAttribute('aria-expanded', 'false');
      }
      
      // Initialize preview
      setTimeout(updatePreview, 100);
      
    } catch (error) {
      console.error('Failed to initialize Nuxt error overlay:', error);
    }
  })();
  `
  );
}
function generateErrorOverlayHTML(html, options) {
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
  const errorPage = html.replace("<head>", `<head><script>${iframeStorageBridge(nonce)}<\/script>`);
  const base64HTML = Buffer.from(errorPage, "utf8").toString("base64");
  return `
    <script>${parentStorageBridge(nonce)}<\/script>
    <nuxt-error-overlay></nuxt-error-overlay>
    <script>${webComponentScript(base64HTML, options?.startMinimized ?? false)}<\/script>
  `;
}

const errorHandler$0 = (async function errorhandler(error, event, { defaultHandler }) {
  if (event.handled || isJsonRequest(event)) {
    return;
  }
  const defaultRes = await defaultHandler(error, event, { json: true });
  const statusCode = error.statusCode || 500;
  if (statusCode === 404 && defaultRes.status === 302) {
    setResponseHeaders(event, defaultRes.headers);
    setResponseStatus(event, defaultRes.status, defaultRes.statusText);
    return send(event, JSON.stringify(defaultRes.body, null, 2));
  }
  if (typeof defaultRes.body !== "string" && Array.isArray(defaultRes.body.stack)) {
    defaultRes.body.stack = defaultRes.body.stack.join("\n");
  }
  const errorObject = defaultRes.body;
  const url = new URL(errorObject.url);
  errorObject.url = withoutBase(url.pathname, useRuntimeConfig(event).app.baseURL) + url.search + url.hash;
  errorObject.message ||= "Server Error";
  errorObject.data ||= error.data;
  errorObject.statusMessage ||= error.statusMessage;
  delete defaultRes.headers["content-type"];
  delete defaultRes.headers["content-security-policy"];
  setResponseHeaders(event, defaultRes.headers);
  const reqHeaders = getRequestHeaders(event);
  const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
  const res = isRenderingError ? null : await useNitroApp().localFetch(
    withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject),
    {
      headers: { ...reqHeaders, "x-nuxt-error": "true" },
      redirect: "manual"
    }
  ).catch(() => null);
  if (event.handled) {
    return;
  }
  if (!res) {
    const { template } = await Promise.resolve().then(function () { return error500; });
    {
      errorObject.description = errorObject.message;
    }
    setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
    return send(event, template(errorObject));
  }
  const html = await res.text();
  for (const [header, value] of res.headers.entries()) {
    if (header === "set-cookie") {
      appendResponseHeader(event, header, value);
      continue;
    }
    setResponseHeader(event, header, value);
  }
  setResponseStatus(event, res.status && res.status !== 200 ? res.status : defaultRes.status, res.statusText || defaultRes.statusText);
  if (!globalThis._importMeta_.test && typeof html === "string") {
    const prettyResponse = await defaultHandler(error, event, { json: false });
    return send(event, html.replace("</body>", `${generateErrorOverlayHTML(prettyResponse.body, { startMinimized: 300 <= statusCode && statusCode < 500 })}</body>`));
  }
  return send(event, html);
});

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  async function defaultNitroErrorHandler(error, event) {
    const res = await defaultHandler(error, event);
    if (!event.node?.res.headersSent) {
      setResponseHeaders(event, res.headers);
    }
    setResponseStatus(event, res.status, res.statusText);
    return send(
      event,
      typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2)
    );
  }
);
async function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  await loadStackTrace(error).catch(consola.error);
  const youch = new Youch();
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    const ansiError = await (await youch.toANSI(error)).replaceAll(process.cwd(), ".");
    consola.error(
      `[request error] ${tags} [${event.method}] ${url}

`,
      ansiError
    );
  }
  const useJSON = opts?.json ?? !getRequestHeader(event, "accept")?.includes("text/html");
  const headers = {
    "content-type": useJSON ? "application/json" : "text/html",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';"
  };
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = useJSON ? {
    error: true,
    url,
    statusCode,
    statusMessage,
    message: error.message,
    data: error.data,
    stack: error.stack?.split("\n").map((line) => line.trim())
  } : await youch.toHTML(error, {
    request: {
      url: url.href,
      method: event.method,
      headers: getRequestHeaders(event)
    }
  });
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}
async function loadStackTrace(error) {
  if (!(error instanceof Error)) {
    return;
  }
  const parsed = await new ErrorParser().defineSourceLoader(sourceLoader).parse(error);
  const stack = error.message + "\n" + parsed.frames.map((frame) => fmtFrame(frame)).join("\n");
  Object.defineProperty(error, "stack", { value: stack });
  if (error.cause) {
    await loadStackTrace(error.cause).catch(consola.error);
  }
}
async function sourceLoader(frame) {
  if (!frame.fileName || frame.fileType !== "fs" || frame.type === "native") {
    return;
  }
  if (frame.type === "app") {
    const rawSourceMap = await readFile(`${frame.fileName}.map`, "utf8").catch(() => {
    });
    if (rawSourceMap) {
      const consumer = await new SourceMapConsumer(rawSourceMap);
      const originalPosition = consumer.originalPositionFor({ line: frame.lineNumber, column: frame.columnNumber });
      if (originalPosition.source && originalPosition.line) {
        frame.fileName = resolve(dirname(frame.fileName), originalPosition.source);
        frame.lineNumber = originalPosition.line;
        frame.columnNumber = originalPosition.column || 0;
      }
    }
  }
  const contents = await readFile(frame.fileName, "utf8").catch(() => {
  });
  return contents ? { contents } : void 0;
}
function fmtFrame(frame) {
  if (frame.type === "native") {
    return frame.raw;
  }
  const src = `${frame.fileName || ""}:${frame.lineNumber}:${frame.columnNumber})`;
  return frame.functionName ? `at ${frame.functionName} (${src}` : `at ${src}`;
}

const errorHandlers = [errorHandler$0, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const script = `
if (!window.__NUXT_DEVTOOLS_TIME_METRIC__) {
  Object.defineProperty(window, '__NUXT_DEVTOOLS_TIME_METRIC__', {
    value: {},
    enumerable: false,
    configurable: true,
  })
}
window.__NUXT_DEVTOOLS_TIME_METRIC__.appInit = Date.now()
`;

const _QJrpOyXHmhBqUaYN_AuiR7Jy5DcUdyPFPJgTww24Fk = (function(nitro) {
  nitro.hooks.hook("render:html", (htmlContext) => {
    htmlContext.head.push(`<script>${script}<\/script>`);
  });
});

const rootDir = "F:/내가 왜 박치임/impossibletiming";

const appHead = {"meta":[{"charset":"utf-8"},{"name":"viewport","content":"width=device-width, initial-scale=1"},{"name":"description","content":"Ultra Music Mania (UMM) - Rhythm, Orbit, Synchronization"}],"link":[],"style":[],"script":[],"noscript":[],"title":"Ultra Music Mania (UMM)"};

const appRootTag = "div";

const appRootAttrs = {"id":"__nuxt"};

const appTeleportTag = "div";

const appTeleportAttrs = {"id":"teleports"};

const appSpaLoaderTag = "div";

const appSpaLoaderAttrs = {"id":"__nuxt-loader"};

const appId = "nuxt-app";

const devReducers = {
  VNode: (data) => isVNode(data) ? { type: data.type, props: data.props } : void 0,
  URL: (data) => data instanceof URL ? data.toString() : void 0
};
const asyncContext = getContext("nuxt-dev", { asyncContext: true, AsyncLocalStorage });
const _nPZwZ22ZLsPO8rmLBuDdLCNskayrzrXWkHOP4D9kn6s = (nitroApp) => {
  const handler = nitroApp.h3App.handler;
  nitroApp.h3App.handler = (event) => {
    return asyncContext.callAsync({ logs: [], event }, () => handler(event));
  };
  onConsoleLog((_log) => {
    const ctx = asyncContext.tryUse();
    if (!ctx) {
      return;
    }
    const rawStack = captureRawStackTrace();
    if (!rawStack || rawStack.includes("runtime/vite-node.mjs")) {
      return;
    }
    const trace = [];
    let filename = "";
    for (const entry of parseRawStackTrace(rawStack)) {
      if (entry.source === globalThis._importMeta_.url) {
        continue;
      }
      if (EXCLUDE_TRACE_RE.test(entry.source)) {
        continue;
      }
      filename ||= entry.source.replace(withTrailingSlash(rootDir), "");
      trace.push({
        ...entry,
        source: entry.source.startsWith("file://") ? entry.source.replace("file://", "") : entry.source
      });
    }
    const log = {
      ..._log,
      // Pass along filename to allow the client to display more info about where log comes from
      filename,
      // Clean up file names in stack trace
      stack: trace
    };
    ctx.logs.push(log);
  });
  nitroApp.hooks.hook("afterResponse", () => {
    const ctx = asyncContext.tryUse();
    if (!ctx) {
      return;
    }
    return nitroApp.hooks.callHook("dev:ssr-logs", { logs: ctx.logs, path: ctx.event.path });
  });
  nitroApp.hooks.hook("render:html", (htmlContext) => {
    const ctx = asyncContext.tryUse();
    if (!ctx) {
      return;
    }
    try {
      const reducers = Object.assign(/* @__PURE__ */ Object.create(null), devReducers, ctx.event.context._payloadReducers);
      htmlContext.bodyAppend.unshift(`<script type="application/json" data-nuxt-logs="${appId}">${stringify(ctx.logs, reducers)}<\/script>`);
    } catch (e) {
      const shortError = e instanceof Error && "toString" in e ? ` Received \`${e.toString()}\`.` : "";
      console.warn(`[nuxt] Failed to stringify dev server logs.${shortError} You can define your own reducer/reviver for rich types following the instructions in https://nuxt.com/docs/4.x/api/composables/use-nuxt-app#payload.`);
    }
  });
};
const EXCLUDE_TRACE_RE = /\/node_modules\/(?:.*\/)?(?:nuxt|nuxt-nightly|nuxt-edge|nuxt3|consola|@vue)\/|core\/runtime\/nitro/;
function onConsoleLog(callback) {
  consola$1.addReporter({
    log(logObj) {
      callback(logObj);
    }
  });
  consola$1.wrapConsole();
}

function defineNitroPlugin(def) {
  return def;
}

mongoose.set("bufferCommands", false);
let cachedPromise = null;
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (!cachedPromise) {
    const config = useRuntimeConfig();
    const uri = config.mongodbUri;
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in runtime config");
    }
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5e3,
      connectTimeoutMS: 1e4
    };
    console.log("[DB] Connecting to MongoDB...");
    cachedPromise = mongoose.connect(uri, opts).then((m) => {
      console.log("[DB] Connected");
      return m;
    }).catch((err) => {
      cachedPromise = null;
      console.error("[DB] Error:", err.message);
      throw err;
    });
  }
  try {
    await cachedPromise;
    return mongoose.connection;
  } catch (e) {
    cachedPromise = null;
    throw e;
  }
};

const _6Nqr69zlGa2_YJTzMqdgLamajd8rCKPNKhPIZxUdk = defineNitroPlugin(async (nitroApp) => {
  try {
    await connectDB();
  } catch (e) {
    console.error("[Nitro Plugin] DB Init Error:", e);
  }
});

const plugins = [
  _QJrpOyXHmhBqUaYN_AuiR7Jy5DcUdyPFPJgTww24Fk,
_nPZwZ22ZLsPO8rmLBuDdLCNskayrzrXWkHOP4D9kn6s,
_6Nqr69zlGa2_YJTzMqdgLamajd8rCKPNKhPIZxUdk
];

const assets = {
  "/index.mjs": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3edc6-fsHrA3nwvmS7rUjMEp3WpJ3D71g\"",
    "mtime": "2026-01-31T03:37:53.476Z",
    "size": 257478,
    "path": "index.mjs"
  },
  "/index.mjs.map": {
    "type": "application/json",
    "etag": "\"f1629-SGYFBVJkWId0XbEmKlV2TC7kDjI\"",
    "mtime": "2026-01-31T03:37:53.478Z",
    "size": 988713,
    "path": "index.mjs.map"
  }
};

function readAsset (id) {
  const serverDir = dirname$1(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve$1(serverDir, assets[id].path))
}

const publicAssetBases = {};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _ps_ONP = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError({ statusCode: 404 });
    }
    return;
  }
  if (asset.encoding !== void 0) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const _GI7qvb = defineEventHandler(async (event) => {
  if (event.path.startsWith("/api/")) {
    try {
      await connectDB();
    } catch (e) {
      console.error("[DB Middleware] Error:", e.message);
      throw createError({
        statusCode: 503,
        statusMessage: "Service Unavailable: Database connection failed. " + e.message
      });
    }
  }
});

const VueResolver = (_, value) => {
  return isRef(value) ? toValue(value) : value;
};

const headSymbol = "usehead";
// @__NO_SIDE_EFFECTS__
function vueInstall(head) {
  const plugin = {
    install(app) {
      app.config.globalProperties.$unhead = head;
      app.config.globalProperties.$head = head;
      app.provide(headSymbol, head);
    }
  };
  return plugin.install;
}

// @__NO_SIDE_EFFECTS__
function resolveUnrefHeadInput(input) {
  return walkResolver(input, VueResolver);
}

// @__NO_SIDE_EFFECTS__
function createHead(options = {}) {
  const head = createHead$1({
    ...options,
    propResolvers: [VueResolver]
  });
  head.install = vueInstall(head);
  return head;
}

const unheadOptions = {
  disableDefaults: true,
};

function createSSRContext(event) {
  const ssrContext = {
    url: event.path,
    event,
    runtimeConfig: useRuntimeConfig(event),
    noSSR: event.context.nuxt?.noSSR || (false),
    head: createHead(unheadOptions),
    error: false,
    nuxt: void 0,
    /* NuxtApp */
    payload: {},
    _payloadReducers: /* @__PURE__ */ Object.create(null),
    modules: /* @__PURE__ */ new Set()
  };
  return ssrContext;
}
function setSSRError(ssrContext, error) {
  ssrContext.error = true;
  ssrContext.payload = { error };
  ssrContext.url = error.url;
}

function buildAssetsDir() {
  return useRuntimeConfig().app.buildAssetsDir;
}
function buildAssetsURL(...path) {
  return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path);
}
function publicAssetsURL(...path) {
  const app = useRuntimeConfig().app;
  const publicBase = app.cdnURL || app.baseURL;
  return path.length ? joinRelativeURL(publicBase, ...path) : publicBase;
}

const APP_ROOT_OPEN_TAG = `<${appRootTag}${propsToString(appRootAttrs)}>`;
const APP_ROOT_CLOSE_TAG = `</${appRootTag}>`;
const getServerEntry = () => import('file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/.nuxt//dist/server/server.mjs').then((r) => r.default || r);
const getClientManifest = () => import('file://F:/%EB%82%B4%EA%B0%80%20%EC%99%9C%20%EB%B0%95%EC%B9%98%EC%9E%84/impossibletiming/.nuxt//dist/server/client.manifest.mjs').then((r) => r.default || r).then((r) => typeof r === "function" ? r() : r);
const getSSRRenderer = lazyCachedFunction(async () => {
  const createSSRApp = await getServerEntry();
  if (!createSSRApp) {
    throw new Error("Server bundle is not available");
  }
  const precomputed = void 0 ;
  const renderer = createRenderer(createSSRApp, {
    precomputed,
    manifest: await getClientManifest() ,
    renderToString: renderToString$1,
    buildAssetsURL
  });
  async function renderToString$1(input, context) {
    const html = await renderToString(input, context);
    if (process$1.env.NUXT_VITE_NODE_OPTIONS) {
      renderer.rendererContext.updateManifest(await getClientManifest());
    }
    return APP_ROOT_OPEN_TAG + html + APP_ROOT_CLOSE_TAG;
  }
  return renderer;
});
const getSPARenderer = lazyCachedFunction(async () => {
  const precomputed = void 0 ;
  const spaTemplate = await Promise.resolve().then(function () { return _virtual__spaTemplate; }).then((r) => r.template).catch(() => "").then((r) => {
    {
      const APP_SPA_LOADER_OPEN_TAG = `<${appSpaLoaderTag}${propsToString(appSpaLoaderAttrs)}>`;
      const APP_SPA_LOADER_CLOSE_TAG = `</${appSpaLoaderTag}>`;
      const appTemplate = APP_ROOT_OPEN_TAG + APP_ROOT_CLOSE_TAG;
      const loaderTemplate = r ? APP_SPA_LOADER_OPEN_TAG + r + APP_SPA_LOADER_CLOSE_TAG : "";
      return appTemplate + loaderTemplate;
    }
  });
  const renderer = createRenderer(() => () => {
  }, {
    precomputed,
    manifest: await getClientManifest() ,
    renderToString: () => spaTemplate,
    buildAssetsURL
  });
  const result = await renderer.renderToString({});
  const renderToString = (ssrContext) => {
    const config = useRuntimeConfig(ssrContext.event);
    ssrContext.modules ||= /* @__PURE__ */ new Set();
    ssrContext.payload.serverRendered = false;
    ssrContext.config = {
      public: config.public,
      app: config.app
    };
    return Promise.resolve(result);
  };
  return {
    rendererContext: renderer.rendererContext,
    renderToString
  };
});
function lazyCachedFunction(fn) {
  let res = null;
  return () => {
    if (res === null) {
      res = fn().catch((err) => {
        res = null;
        throw err;
      });
    }
    return res;
  };
}
function getRenderer(ssrContext) {
  return ssrContext.noSSR ? getSPARenderer() : getSSRRenderer();
}
const getSSRStyles = lazyCachedFunction(() => Promise.resolve().then(function () { return styles$1; }).then((r) => r.default || r));

async function renderInlineStyles(usedModules) {
  const styleMap = await getSSRStyles();
  const inlinedStyles = /* @__PURE__ */ new Set();
  for (const mod of usedModules) {
    if (mod in styleMap && styleMap[mod]) {
      for (const style of await styleMap[mod]()) {
        inlinedStyles.add(style);
      }
    }
  }
  return Array.from(inlinedStyles).map((style) => ({ innerHTML: style }));
}

const ROOT_NODE_REGEX = new RegExp(`^<${appRootTag}[^>]*>([\\s\\S]*)<\\/${appRootTag}>$`);
function getServerComponentHTML(body) {
  const match = body.match(ROOT_NODE_REGEX);
  return match?.[1] || body;
}
const SSR_SLOT_TELEPORT_MARKER = /^uid=([^;]*);slot=(.*)$/;
const SSR_CLIENT_TELEPORT_MARKER = /^uid=([^;]*);client=(.*)$/;
const SSR_CLIENT_SLOT_MARKER = /^island-slot=([^;]*);(.*)$/;
function getSlotIslandResponse(ssrContext) {
  if (!ssrContext.islandContext || !Object.keys(ssrContext.islandContext.slots).length) {
    return void 0;
  }
  const response = {};
  for (const [name, slot] of Object.entries(ssrContext.islandContext.slots)) {
    response[name] = {
      ...slot,
      fallback: ssrContext.teleports?.[`island-fallback=${name}`]
    };
  }
  return response;
}
function getClientIslandResponse(ssrContext) {
  if (!ssrContext.islandContext || !Object.keys(ssrContext.islandContext.components).length) {
    return void 0;
  }
  const response = {};
  for (const [clientUid, component] of Object.entries(ssrContext.islandContext.components)) {
    const html = ssrContext.teleports?.[clientUid]?.replaceAll("<!--teleport start anchor-->", "") || "";
    response[clientUid] = {
      ...component,
      html,
      slots: getComponentSlotTeleport(clientUid, ssrContext.teleports ?? {})
    };
  }
  return response;
}
function getComponentSlotTeleport(clientUid, teleports) {
  const entries = Object.entries(teleports);
  const slots = {};
  for (const [key, value] of entries) {
    const match = key.match(SSR_CLIENT_SLOT_MARKER);
    if (match) {
      const [, id, slot] = match;
      if (!slot || clientUid !== id) {
        continue;
      }
      slots[slot] = value;
    }
  }
  return slots;
}
function replaceIslandTeleports(ssrContext, html) {
  const { teleports, islandContext } = ssrContext;
  if (islandContext || !teleports) {
    return html;
  }
  for (const key in teleports) {
    const matchClientComp = key.match(SSR_CLIENT_TELEPORT_MARKER);
    if (matchClientComp) {
      const [, uid, clientId] = matchClientComp;
      if (!uid || !clientId) {
        continue;
      }
      html = html.replace(new RegExp(` data-island-uid="${uid}" data-island-component="${clientId}"[^>]*>`), (full) => {
        return full + teleports[key];
      });
      continue;
    }
    const matchSlot = key.match(SSR_SLOT_TELEPORT_MARKER);
    if (matchSlot) {
      const [, uid, slot] = matchSlot;
      if (!uid || !slot) {
        continue;
      }
      html = html.replace(new RegExp(` data-island-uid="${uid}" data-island-slot="${slot}"[^>]*>`), (full) => {
        return full + teleports[key];
      });
    }
  }
  return html;
}

const ISLAND_SUFFIX_RE = /\.json(?:\?.*)?$/;
const _SxA8c9 = defineEventHandler(async (event) => {
  const nitroApp = useNitroApp();
  setResponseHeaders(event, {
    "content-type": "application/json;charset=utf-8",
    "x-powered-by": "Nuxt"
  });
  const islandContext = await getIslandContext(event);
  const ssrContext = {
    ...createSSRContext(event),
    islandContext,
    noSSR: false,
    url: islandContext.url
  };
  const renderer = await getSSRRenderer();
  const renderResult = await renderer.renderToString(ssrContext).catch(async (err) => {
    await ssrContext.nuxt?.hooks.callHook("app:error", err);
    throw err;
  });
  if (ssrContext.payload?.error) {
    throw ssrContext.payload.error;
  }
  const inlinedStyles = await renderInlineStyles(ssrContext.modules ?? []);
  await ssrContext.nuxt?.hooks.callHook("app:rendered", { ssrContext, renderResult });
  if (inlinedStyles.length) {
    ssrContext.head.push({ style: inlinedStyles });
  }
  {
    const { styles } = getRequestDependencies(ssrContext, renderer.rendererContext);
    const link = [];
    for (const resource of Object.values(styles)) {
      if ("inline" in getQuery(resource.file)) {
        continue;
      }
      if (resource.file.includes("scoped") && !resource.file.includes("pages/")) {
        link.push({ rel: "stylesheet", href: renderer.rendererContext.buildAssetsURL(resource.file), crossorigin: "" });
      }
    }
    if (link.length) {
      ssrContext.head.push({ link }, { mode: "server" });
    }
  }
  const islandHead = {};
  for (const entry of ssrContext.head.entries.values()) {
    for (const [key, value] of Object.entries(resolveUnrefHeadInput(entry.input))) {
      const currentValue = islandHead[key];
      if (Array.isArray(currentValue)) {
        currentValue.push(...value);
      }
      islandHead[key] = value;
    }
  }
  const islandResponse = {
    id: islandContext.id,
    head: islandHead,
    html: getServerComponentHTML(renderResult.html),
    components: getClientIslandResponse(ssrContext),
    slots: getSlotIslandResponse(ssrContext)
  };
  await nitroApp.hooks.callHook("render:island", islandResponse, { event, islandContext });
  return islandResponse;
});
async function getIslandContext(event) {
  let url = event.path || "";
  const componentParts = url.substring("/__nuxt_island".length + 1).replace(ISLAND_SUFFIX_RE, "").split("_");
  const hashId = componentParts.length > 1 ? componentParts.pop() : void 0;
  const componentName = componentParts.join("_");
  const context = event.method === "GET" ? getQuery$1(event) : await readBody(event);
  const ctx = {
    url: "/",
    ...context,
    id: hashId,
    name: componentName,
    props: destr$1(context.props) || {},
    slots: {},
    components: {}
  };
  return ctx;
}

const _lazy_ywrpmm = () => Promise.resolve().then(function () { return optimize_get$1; });
const _lazy_QlGAJG = () => Promise.resolve().then(function () { return login_post$1; });
const _lazy_7tLEHb = () => Promise.resolve().then(function () { return logout_post$1; });
const _lazy_Wwtgsn = () => Promise.resolve().then(function () { return me_get$1; });
const _lazy_8gQoOd = () => Promise.resolve().then(function () { return register_post$1; });
const _lazy_su95aX = () => Promise.resolve().then(function () { return updateStats_post$1; });
const _lazy_ItOqgi = () => Promise.resolve().then(function () { return _id__delete$1; });
const _lazy_dtHPno = () => Promise.resolve().then(function () { return _id__get$1; });
const _lazy_wh0PQr = () => Promise.resolve().then(function () { return _id__patch$1; });
const _lazy_GIoMLU = () => Promise.resolve().then(function () { return audioChunk_post$1; });
const _lazy_gy6T5E = () => Promise.resolve().then(function () { return rate_post$1; });
const _lazy_vSvfPH = () => Promise.resolve().then(function () { return record_post$1; });
const _lazy_tYJqVb = () => Promise.resolve().then(function () { return index_get$3; });
const _lazy_DwrcjF = () => Promise.resolve().then(function () { return index_post$1; });
const _lazy_3cvM1k = () => Promise.resolve().then(function () { return chat_post$1; });
const _lazy_pWLlQp = () => Promise.resolve().then(function () { return leave_post$1; });
const _lazy_QxYKdS = () => Promise.resolve().then(function () { return start_post$1; });
const _lazy_wgeVPj = () => Promise.resolve().then(function () { return status_get$1; });
const _lazy_HdxjLr = () => Promise.resolve().then(function () { return update_post$1; });
const _lazy_JZu9YS = () => Promise.resolve().then(function () { return clear_post$1; });
const _lazy_P7t_8y = () => Promise.resolve().then(function () { return create_post$1; });
const _lazy_I38_NH = () => Promise.resolve().then(function () { return index_get$1; });
const _lazy_MFgzb0 = () => Promise.resolve().then(function () { return join_post$1; });
const _lazy_5d_zHw = () => Promise.resolve().then(function () { return nextMap_post$1; });
const _lazy_WxDeHw = () => Promise.resolve().then(function () { return samples_get$1; });
const _lazy_42HsTT = () => Promise.resolve().then(function () { return youtube_post$1; });
const _lazy_Lesw2n = () => Promise.resolve().then(function () { return renderer$1; });

const handlers = [
  { route: '', handler: _ps_ONP, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _GI7qvb, lazy: false, middleware: true, method: undefined },
  { route: '/api/admin/optimize', handler: _lazy_ywrpmm, lazy: true, middleware: false, method: "get" },
  { route: '/api/auth/login', handler: _lazy_QlGAJG, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/logout', handler: _lazy_7tLEHb, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/me', handler: _lazy_Wwtgsn, lazy: true, middleware: false, method: "get" },
  { route: '/api/auth/register', handler: _lazy_8gQoOd, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/update-stats', handler: _lazy_su95aX, lazy: true, middleware: false, method: "post" },
  { route: '/api/maps/:id', handler: _lazy_ItOqgi, lazy: true, middleware: false, method: "delete" },
  { route: '/api/maps/:id', handler: _lazy_dtHPno, lazy: true, middleware: false, method: "get" },
  { route: '/api/maps/:id', handler: _lazy_wh0PQr, lazy: true, middleware: false, method: "patch" },
  { route: '/api/maps/:id/audio-chunk', handler: _lazy_GIoMLU, lazy: true, middleware: false, method: "post" },
  { route: '/api/maps/:id/rate', handler: _lazy_gy6T5E, lazy: true, middleware: false, method: "post" },
  { route: '/api/maps/:id/record', handler: _lazy_vSvfPH, lazy: true, middleware: false, method: "post" },
  { route: '/api/maps', handler: _lazy_tYJqVb, lazy: true, middleware: false, method: "get" },
  { route: '/api/maps', handler: _lazy_DwrcjF, lazy: true, middleware: false, method: "post" },
  { route: '/api/rooms/:id/chat', handler: _lazy_3cvM1k, lazy: true, middleware: false, method: "post" },
  { route: '/api/rooms/:id/leave', handler: _lazy_pWLlQp, lazy: true, middleware: false, method: "post" },
  { route: '/api/rooms/:id/start', handler: _lazy_QxYKdS, lazy: true, middleware: false, method: "post" },
  { route: '/api/rooms/:id/status', handler: _lazy_wgeVPj, lazy: true, middleware: false, method: "get" },
  { route: '/api/rooms/:id/update', handler: _lazy_HdxjLr, lazy: true, middleware: false, method: "post" },
  { route: '/api/rooms/clear', handler: _lazy_JZu9YS, lazy: true, middleware: false, method: "post" },
  { route: '/api/rooms/create', handler: _lazy_P7t_8y, lazy: true, middleware: false, method: "post" },
  { route: '/api/rooms', handler: _lazy_I38_NH, lazy: true, middleware: false, method: "get" },
  { route: '/api/rooms/join', handler: _lazy_MFgzb0, lazy: true, middleware: false, method: "post" },
  { route: '/api/rooms/next-map', handler: _lazy_5d_zHw, lazy: true, middleware: false, method: "post" },
  { route: '/api/samples', handler: _lazy_WxDeHw, lazy: true, middleware: false, method: "get" },
  { route: '/api/youtube', handler: _lazy_42HsTT, lazy: true, middleware: false, method: "post" },
  { route: '/__nuxt_error', handler: _lazy_Lesw2n, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_island/**', handler: _SxA8c9, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_Lesw2n, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(true),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter$1({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => callNodeRequestHandler(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return fetchNodeRequestHandler(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

const scheduledTasks = false;

const tasks = {
  
};

const __runningTasks__ = {};
async function runTask(name, {
  payload = {},
  context = {}
} = {}) {
  if (__runningTasks__[name]) {
    return __runningTasks__[name];
  }
  if (!(name in tasks)) {
    throw createError({
      message: `Task \`${name}\` is not available!`,
      statusCode: 404
    });
  }
  if (!tasks[name].resolve) {
    throw createError({
      message: `Task \`${name}\` is not implemented!`,
      statusCode: 501
    });
  }
  const handler = await tasks[name].resolve();
  const taskEvent = { name, payload, context };
  __runningTasks__[name] = handler.run(taskEvent);
  try {
    const res = await __runningTasks__[name];
    return res;
  } finally {
    delete __runningTasks__[name];
  }
}

if (!globalThis.crypto) {
  globalThis.crypto = crypto$1.webcrypto;
}
const { NITRO_NO_UNIX_SOCKET, NITRO_DEV_WORKER_ID } = process.env;
trapUnhandledNodeErrors();
parentPort?.on("message", (msg) => {
  if (msg && msg.event === "shutdown") {
    shutdown();
  }
});
const nitroApp = useNitroApp();
const server = new Server(toNodeListener(nitroApp.h3App));
let listener;
listen().catch(() => listen(
  true
  /* use random port */
)).catch((error) => {
  console.error("Dev worker failed to listen:", error);
  return shutdown();
});
nitroApp.router.get(
  "/_nitro/tasks",
  defineEventHandler(async (event) => {
    const _tasks = await Promise.all(
      Object.entries(tasks).map(async ([name, task]) => {
        const _task = await task.resolve?.();
        return [name, { description: _task?.meta?.description }];
      })
    );
    return {
      tasks: Object.fromEntries(_tasks),
      scheduledTasks
    };
  })
);
nitroApp.router.use(
  "/_nitro/tasks/:name",
  defineEventHandler(async (event) => {
    const name = getRouterParam(event, "name");
    const payload = {
      ...getQuery$1(event),
      ...await readBody(event).then((r) => r?.payload).catch(() => ({}))
    };
    return await runTask(name, { payload });
  })
);
function listen(useRandomPort = Boolean(
  NITRO_NO_UNIX_SOCKET || process.versions.webcontainer || "Bun" in globalThis && process.platform === "win32"
)) {
  return new Promise((resolve, reject) => {
    try {
      listener = server.listen(useRandomPort ? 0 : getSocketAddress(), () => {
        const address = server.address();
        parentPort?.postMessage({
          event: "listen",
          address: typeof address === "string" ? { socketPath: address } : { host: "localhost", port: address?.port }
        });
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
function getSocketAddress() {
  const socketName = `nitro-worker-${process.pid}-${threadId}-${NITRO_DEV_WORKER_ID}-${Math.round(Math.random() * 1e4)}.sock`;
  if (process.platform === "win32") {
    return join(String.raw`\\.\pipe`, socketName);
  }
  if (process.platform === "linux") {
    const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
    if (nodeMajor >= 20) {
      return `\0${socketName}`;
    }
  }
  return join(tmpdir(), socketName);
}
async function shutdown() {
  server.closeAllConnections?.();
  await Promise.all([
    new Promise((resolve) => listener?.close(resolve)),
    nitroApp.hooks.callHook("close").catch(console.error)
  ]);
  parentPort?.postMessage({ event: "exit" });
}

const _messages = { "appName": "Nuxt", "statusCode": 500, "statusMessage": "Internal server error", "description": "This page is temporarily unavailable.", "refresh": "Refresh this page" };
const template$1 = (messages) => {
  messages = { ..._messages, ...messages };
  return '<!DOCTYPE html><html lang="en"><head><title>' + escapeHtml(messages.statusCode) + " - " + escapeHtml(messages.statusMessage) + " | " + escapeHtml(messages.appName) + `</title><meta charset="utf-8"><meta content="width=device-width,initial-scale=1.0,minimum-scale=1.0" name="viewport"><script>!function(){const e=document.createElement("link").relList;if(!(e&&e.supports&&e.supports("modulepreload"))){for(const e of document.querySelectorAll('link[rel="modulepreload"]'))r(e);new MutationObserver(e=>{for(const o of e)if("childList"===o.type)for(const e of o.addedNodes)"LINK"===e.tagName&&"modulepreload"===e.rel&&r(e)}).observe(document,{childList:!0,subtree:!0})}function r(e){if(e.ep)return;e.ep=!0;const r=function(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),"use-credentials"===e.crossOrigin?r.credentials="include":"anonymous"===e.crossOrigin?r.credentials="omit":r.credentials="same-origin",r}(e);fetch(e.href,r)}}();<\/script><style>*,:after,:before{border-color:var(--un-default-border-color,#e5e7eb);border-style:solid;border-width:0;box-sizing:border-box}:after,:before{--un-content:""}html{line-height:1.5;-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;font-feature-settings:normal;font-variation-settings:normal;-moz-tab-size:4;tab-size:4;-webkit-tap-highlight-color:transparent}body{line-height:inherit;margin:0}h1,h2{font-size:inherit;font-weight:inherit}h1,h2,p{margin:0}*,:after,:before{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 transparent;--un-ring-shadow:0 0 transparent;--un-shadow-inset: ;--un-shadow:0 0 transparent;--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgba(147,197,253,.5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }.grid{display:grid}.mb-2{margin-bottom:.5rem}.mb-4{margin-bottom:1rem}.max-w-520px{max-width:520px}.min-h-screen{min-height:100vh}.place-content-center{place-content:center}.overflow-hidden{overflow:hidden}.bg-white{--un-bg-opacity:1;background-color:rgb(255 255 255/var(--un-bg-opacity))}.px-2{padding-left:.5rem;padding-right:.5rem}.text-center{text-align:center}.text-\\[80px\\]{font-size:80px}.text-2xl{font-size:1.5rem;line-height:2rem}.text-\\[\\#020420\\]{--un-text-opacity:1;color:rgb(2 4 32/var(--un-text-opacity))}.text-\\[\\#64748B\\]{--un-text-opacity:1;color:rgb(100 116 139/var(--un-text-opacity))}.font-semibold{font-weight:600}.leading-none{line-height:1}.tracking-wide{letter-spacing:.025em}.font-sans{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji}.tabular-nums{--un-numeric-spacing:tabular-nums;font-variant-numeric:var(--un-ordinal) var(--un-slashed-zero) var(--un-numeric-figure) var(--un-numeric-spacing) var(--un-numeric-fraction)}.antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}@media(prefers-color-scheme:dark){.dark\\:bg-\\[\\#020420\\]{--un-bg-opacity:1;background-color:rgb(2 4 32/var(--un-bg-opacity))}.dark\\:text-white{--un-text-opacity:1;color:rgb(255 255 255/var(--un-text-opacity))}}@media(min-width:640px){.sm\\:text-\\[110px\\]{font-size:110px}.sm\\:text-3xl{font-size:1.875rem;line-height:2.25rem}}</style></head><body class="antialiased bg-white dark:bg-[#020420] dark:text-white font-sans grid min-h-screen overflow-hidden place-content-center text-[#020420] tracking-wide"><div class="max-w-520px text-center"><h1 class="font-semibold leading-none mb-4 sm:text-[110px] tabular-nums text-[80px]">` + escapeHtml(messages.statusCode) + '</h1><h2 class="font-semibold mb-2 sm:text-3xl text-2xl">' + escapeHtml(messages.statusMessage) + '</h2><p class="mb-4 px-2 text-[#64748B] text-md">' + escapeHtml(messages.description) + "</p></div></body></html>";
};

const error500 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  template: template$1
}, Symbol.toStringTag, { value: 'Module' }));

const template = "";

const _virtual__spaTemplate = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  template: template
}, Symbol.toStringTag, { value: 'Module' }));

const styles = {};

const styles$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: styles
}, Symbol.toStringTag, { value: 'Module' }));

const mapSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 120,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  creatorName: {
    type: String,
    required: true
  },
  audioUrl: {
    type: String,
    default: null
  },
  audioData: {
    type: String,
    default: null
  },
  audioChunks: {
    type: [String],
    default: []
  },
  audioContentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AudioContent",
    default: null
  },
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  seed: {
    type: Number,
    required: true
  },
  beatTimes: {
    type: [Number],
    required: true
  },
  sections: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  engineObstacles: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  enginePortals: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  autoplayLog: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  duration: {
    type: Number,
    required: true
  },
  isShared: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  playCount: {
    type: Number,
    default: 0
  },
  clearCount: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  bestScore: {
    type: Number,
    default: 0
  },
  bestPlayer: {
    type: String,
    default: null
  },
  bpm: {
    type: Number,
    default: 120
  },
  measureLength: {
    type: Number,
    default: 2
  },
  ratingSum: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  }
});
mapSchema.index({ creator: 1 });
mapSchema.index({ playCount: -1 });
mapSchema.index({ clearCount: -1 });
mapSchema.index({ likes: -1 });
mapSchema.index({ createdAt: -1 });
mapSchema.index({ difficulty: 1 });
mapSchema.index({ rating: -1 });
mapSchema.index({ isShared: 1, createdAt: -1 });
const GameMap = mongoose.models.GameMap || mongoose.model("GameMap", mapSchema);

const audioContentSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  chunks: {
    type: [Buffer],
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const AudioContent = mongoose.models.AudioContent || mongoose.model("AudioContent", audioContentSchema);

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
        const hash = crypto$1.createHash("sha256").update(binary).digest("hex");
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

const optimize_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: optimize_get
}, Symbol.toStringTag, { value: 'Module' }));

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 20,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 4
  },
  displayName: {
    type: String,
    required: true,
    maxlength: 20,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  totalScore: {
    type: Number,
    default: 0
  },
  mapsCleared: {
    type: Number,
    default: 0
  },
  mapsCreated: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 1e3
  },
  matchHistory: [{
    opponent: String,
    winner: String,
    myScore: Number,
    opponentScore: Number,
    date: { type: Date, default: Date.now },
    ratingChange: Number
  }]
});
userSchema.index({ totalScore: -1 });
userSchema.index({ mapsCleared: -1 });
const User = mongoose.models.User || mongoose.model("User", userSchema);

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
      secure: false
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

const login_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: login_post
}, Symbol.toStringTag, { value: 'Module' }));

const logout_post = defineEventHandler(async (event) => {
  deleteCookie(event, "auth_user");
  return { success: true };
});

const logout_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: logout_post
}, Symbol.toStringTag, { value: 'Module' }));

const me_get = defineEventHandler(async (event) => {
  const cookie = getCookie(event, "auth_user");
  if (!cookie) return null;
  try {
    return JSON.parse(cookie);
  } catch (e) {
    return null;
  }
});

const me_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: me_get
}, Symbol.toStringTag, { value: 'Module' }));

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
      secure: false
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

const register_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: register_post
}, Symbol.toStringTag, { value: 'Module' }));

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

const updateStats_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: updateStats_post
}, Symbol.toStringTag, { value: 'Module' }));

const _id__delete = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const deletedMap = await GameMap.findByIdAndDelete(id);
  if (!deletedMap) {
    throw createError({
      statusCode: 404,
      statusMessage: "Map not found"
    });
  }
  return { message: "Map deleted successfully" };
});

const _id__delete$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__delete
}, Symbol.toStringTag, { value: 'Module' }));

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
  const roundNum = (num, precision = 1) => {
    if (typeof num !== "number" || isNaN(num)) return 0;
    const factor = Math.pow(10, precision);
    return Math.round(num * factor) / factor;
  };
  const optimizeObstacles = (obs) => {
    if (!Array.isArray(obs)) return [];
    return obs.map((o) => ({
      ...o,
      x: roundNum(o.x),
      y: roundNum(o.y),
      width: roundNum(o.width),
      height: roundNum(o.height)
    }));
  };
  const optimizeLog = (log) => {
    if (!Array.isArray(log) || log.length === 0) return [];
    return log.map((p) => ({
      ...p,
      x: roundNum(p.x),
      y: roundNum(p.y),
      time: roundNum(p.time, 3)
    }));
  };
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
  if (mapObj.engineObstacles) mapObj.engineObstacles = optimizeObstacles(mapObj.engineObstacles);
  if (mapObj.enginePortals) mapObj.enginePortals = optimizeObstacles(mapObj.enginePortals);
  if (mapObj.autoplayLog) mapObj.autoplayLog = optimizeLog(mapObj.autoplayLog);
  delete mapObj.audioChunks;
  return mapObj;
});

const _id__get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__get
}, Symbol.toStringTag, { value: 'Module' }));

const _id__patch = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const {
    title,
    difficulty,
    seed,
    beatTimes,
    sections,
    engineObstacles,
    enginePortals,
    autoplayLog,
    duration,
    audioUrl,
    audioData,
    audioChunks,
    isShared,
    bpm,
    measureLength
  } = body;
  const updateData = {};
  if (title !== void 0) updateData.title = title;
  if (difficulty !== void 0) updateData.difficulty = difficulty;
  if (seed !== void 0) updateData.seed = seed;
  if (beatTimes !== void 0) updateData.beatTimes = beatTimes;
  if (sections !== void 0) updateData.sections = sections;
  if (engineObstacles !== void 0) updateData.engineObstacles = engineObstacles;
  if (enginePortals !== void 0) updateData.enginePortals = enginePortals;
  if (autoplayLog !== void 0) updateData.autoplayLog = autoplayLog;
  if (duration !== void 0) updateData.duration = duration;
  if (audioUrl !== void 0) updateData.audioUrl = audioUrl;
  if (audioData !== void 0) updateData.audioData = audioData;
  if (audioChunks !== void 0) updateData.audioChunks = audioChunks;
  if (isShared !== void 0) updateData.isShared = isShared;
  if (bpm !== void 0) updateData.bpm = bpm;
  if (measureLength !== void 0) updateData.measureLength = measureLength;
  const updatedMap = await GameMap.findByIdAndUpdate(id, { $set: updateData }, { new: true });
  if (!updatedMap) {
    throw createError({
      statusCode: 404,
      statusMessage: "Map not found"
    });
  }
  return updatedMap;
});

const _id__patch$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__patch
}, Symbol.toStringTag, { value: 'Module' }));

const audioChunk_post = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const { chunkIndex, chunkData, totalChunks } = body;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing ID" });
  }
  if (chunkIndex === void 0 || !chunkData || totalChunks === void 0) {
    throw createError({ statusCode: 400, statusMessage: "Missing chunk info" });
  }
  const map = await GameMap.findById(id);
  if (!map) {
    throw createError({ statusCode: 404, statusMessage: "Map not found" });
  }
  const tempDir = path.join(process.cwd(), "public", "music", "_temp_chunks", id);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const binaryChunk = Buffer.from(chunkData, "base64");
  const chunkPath = path.join(tempDir, `chunk_${chunkIndex}.bin`);
  fs.writeFileSync(chunkPath, binaryChunk);
  const files = fs.readdirSync(tempDir);
  const uploadedCount = files.filter((f) => f.startsWith("chunk_") && f.endsWith(".bin")).length;
  if (uploadedCount >= totalChunks) {
    console.log(`[Audio] All chunks received for map ${id}. Merging...`);
    const mergedData = Buffer.alloc(files.reduce((acc, f) => acc + fs.statSync(path.join(tempDir, f)).size, 0));
    let offset = 0;
    for (let i = 0; i < totalChunks; i++) {
      const cPath = path.join(tempDir, `chunk_${i}.bin`);
      if (!fs.existsSync(cPath)) {
        throw createError({ statusCode: 500, statusMessage: `Missing chunk ${i} during merge` });
      }
      const data = fs.readFileSync(cPath);
      data.copy(mergedData, offset);
      offset += data.length;
    }
    const hash = crypto$1.createHash("sha256").update(mergedData).digest("hex");
    const finalFilename = `${hash}.wav`;
    const musicDir = path.join(process.cwd(), "public", "music");
    const finalPath = path.join(musicDir, finalFilename);
    if (!fs.existsSync(finalPath)) {
      fs.writeFileSync(finalPath, mergedData);
    }
    map.audioUrl = `/music/${finalFilename}`;
    map.audioData = null;
    map.audioChunks = [];
    map.audioContentId = null;
    await map.save();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {
      console.error(`[Audio] Cleanup failed for ${tempDir}`, e);
    }
    return { success: true, finished: true, url: map.audioUrl };
  }
  return { success: true, finished: false, index: chunkIndex };
});

const audioChunk_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: audioChunk_post
}, Symbol.toStringTag, { value: 'Module' }));

const rate_post = defineEventHandler(async (event) => {
  const mapId = getRouterParam(event, "id");
  const body = await readBody(event);
  const { rating } = body;
  if (!rating || rating < 1 || rating > 30) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid rating. Must be between 1 and 30."
    });
  }
  const map = await GameMap.findById(mapId);
  if (!map) {
    throw createError({
      statusCode: 404,
      statusMessage: "Map not found"
    });
  }
  map.ratingSum += rating;
  map.ratingCount += 1;
  map.rating = Number((map.ratingSum / map.ratingCount).toFixed(1));
  map.difficulty = Math.round(map.rating);
  await map.save();
  return {
    success: true,
    newRating: map.rating,
    count: map.ratingCount
  };
});

const rate_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: rate_post
}, Symbol.toStringTag, { value: 'Module' }));

const scoreSchema = new mongoose.Schema({
  map: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GameMap",
    required: true
  },
  mapTitle: {
    type: String,
    required: true
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  playerName: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  progress: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  isCleared: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 1
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
});
scoreSchema.index({ map: 1, score: -1 });
scoreSchema.index({ player: 1, playedAt: -1 });
scoreSchema.index({ score: -1 });
scoreSchema.index({ isCleared: 1, score: -1 });
scoreSchema.index({ map: 1, player: 1 });
const Score = mongoose.models.Score || mongoose.model("Score", scoreSchema);

const record_post = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const { score, progress, username } = body;
  const userCookie = getCookie(event, "auth_user");
  const authUser = userCookie ? JSON.parse(userCookie) : null;
  const userId = (authUser == null ? void 0 : authUser._id) || (authUser == null ? void 0 : authUser.id);
  if (!id || score === void 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing mapId or score"
    });
  }
  let mapTitle = "Unknown Map";
  let map = null;
  if (id === "tutorial_mode") {
    mapTitle = "TUTORIAL";
  } else {
    map = await GameMap.findById(id);
    if (!map) {
      throw createError({
        statusCode: 404,
        statusMessage: "Map not found"
      });
    }
    mapTitle = map.title;
  }
  let globalUpdated = false;
  let mapSaved = false;
  if (map) {
    if (score > (map.bestScore || 0)) {
      map.bestScore = score;
      map.bestPlayer = username || "Guest";
      globalUpdated = true;
      mapSaved = true;
    }
    if (progress >= 100 && !map.isVerified) {
      map.isVerified = true;
      mapSaved = true;
    }
    if (mapSaved) {
      await map.save();
    }
  }
  let personalUpdated = false;
  if (userId) {
    const existingScore = await Score.findOne({ map: id, player: userId });
    if (existingScore) {
      if (score > existingScore.score) {
        existingScore.score = score;
        existingScore.progress = progress || existingScore.progress;
        existingScore.isCleared = existingScore.progress >= 100;
        existingScore.attempts += 1;
        existingScore.playedAt = /* @__PURE__ */ new Date();
        await existingScore.save();
        personalUpdated = true;
      } else {
        existingScore.attempts += 1;
        await existingScore.save();
      }
    } else {
      await Score.create({
        map: id === "tutorial_mode" ? null : id,
        // Store null or special ID for tutorial
        mapTitle,
        player: userId,
        playerName: username || authUser.username || "Unknown",
        score,
        progress: progress || 0,
        isCleared: (progress || 0) >= 100,
        attempts: 1,
        playedAt: /* @__PURE__ */ new Date()
      });
      personalUpdated = true;
    }
    const user = await User.findById(userId);
    if (user) {
      user.totalScore = (user.totalScore || 0) + (score > 0 ? 1 : 0);
      if ((progress || 0) >= 100) {
        const clearedBefore = await Score.findOne({ map: id, player: userId, isCleared: true });
        if (!clearedBefore || clearedBefore && personalUpdated) {
          user.mapsCleared = (user.mapsCleared || 0) + 1;
        }
      }
      await user.save();
    }
  }
  return {
    success: true,
    updated: globalUpdated,
    personalUpdated,
    bestScore: map ? map.bestScore : null
  };
});

const record_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: record_post
}, Symbol.toStringTag, { value: 'Module' }));

const index_get$2 = defineEventHandler(async (event) => {
  const query = getQuery$1(event);
  const { creator, shared } = query;
  try {
    await connectDB();
  } catch (e) {
    throw createError({
      statusCode: 503,
      statusMessage: "DB Connection Error. Please check Atlas IP Whitelist (0.0.0.0/0). " + e.message
    });
  }
  const filter = {};
  if (shared === "true") {
    filter.isShared = true;
  } else if (creator) {
    filter.creatorName = { $regex: new RegExp(`^${creator}$`, "i") };
  }
  const userCookie = getCookie(event, "auth_user");
  const authUser = userCookie ? JSON.parse(userCookie) : null;
  const userId = (authUser == null ? void 0 : authUser._id) || (authUser == null ? void 0 : authUser.id);
  try {
    const maps = await GameMap.find(filter).select("-audioData -audioChunks -engineObstacles -enginePortals -autoplayLog -sections -beatTimes").sort({ createdAt: -1 }).limit(50).allowDiskUse(true);
    if (userId) {
      const mapIds = maps.map((m) => m._id);
      const userScores = await Score.find({
        player: userId,
        map: { $in: mapIds }
      });
      const scoreMap = new Map(userScores.map((s) => [s.map.toString(), s]));
      return maps.map((m) => {
        const mObj = m.toObject();
        const pScore = scoreMap.get(m._id.toString());
        if (pScore) {
          mObj.myBestScore = pScore.score;
          mObj.myBestProgress = pScore.progress;
        }
        return mObj;
      });
    }
    return maps;
  } catch (e) {
    console.error("Map Fetch Error:", e);
    throw createError({
      statusCode: 500,
      statusMessage: `DB Error: ${e.message}`
    });
  }
});

const index_get$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_get$2
}, Symbol.toStringTag, { value: 'Module' }));

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
        const hash = crypto$1.createHash("sha256").update(binaryData).digest("hex");
        let ext = ".wav";
        if (mimeType.includes("mpeg") || mimeType.includes("mp3")) ext = ".mp3";
        else if (mimeType.includes("ogg")) ext = ".ogg";
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
      return obs.map((o) => ({
        ...o,
        x: round(o.x),
        y: round(o.y),
        width: round(o.width),
        height: round(o.height)
      }));
    };
    const optimizeLog = (log) => {
      if (!log || !Array.isArray(log) || log.length === 0) return [];
      const optimized = [];
      let last = log[0];
      if (!last || typeof last.x !== "number") return [];
      let lastPoint = { ...last, x: round(last.x), y: round(last.y), time: round(last.time, 3) };
      optimized.push(lastPoint);
      for (let i = 1; i < log.length; i++) {
        const curr = log[i];
        if (!curr) continue;
        if (curr.holding !== last.holding) {
          const p = { ...curr, x: round(curr.x), y: round(curr.y), time: round(curr.time, 3) };
          optimized.push(p);
          last = curr;
          lastPoint = p;
          continue;
        }
        const distSq = Math.pow(curr.x - last.x, 2) + Math.pow(curr.y - last.y, 2);
        if (distSq > 900) {
          const p = { ...curr, x: round(curr.x), y: round(curr.y), time: round(curr.time, 3) };
          optimized.push(p);
          last = curr;
          lastPoint = p;
        }
      }
      return optimized;
    };
    const mapData = {
      title,
      creator: user._id,
      creatorName: user.displayName,
      audioUrl: finalAudioUrl,
      audioData: null,
      // Clear Base64 data to save space
      audioChunks: [],
      // Clear chunks to save space
      audioContentId: null,
      // No longer using AudioContent for new maps
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

const index_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_post
}, Symbol.toStringTag, { value: 'Module' }));

const roomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  hostId: { type: String, required: true },
  maxPlayers: { type: Number, required: true, min: 2, max: 10 },
  duration: { type: Number, required: true, default: 60 },
  difficulty: { type: Number, required: true, default: 5 },
  musicUrl: { type: String, default: null },
  musicTitle: { type: String, default: null },
  map: { type: mongoose.Schema.Types.Mixed, default: null },
  mapQueue: { type: [mongoose.Schema.Types.Mixed], default: [] },
  players: [{
    userId: { type: String, required: true },
    username: { type: String, required: true },
    isHost: { type: Boolean, default: false },
    isReady: { type: Boolean, default: false },
    progress: { type: Number, default: 0 },
    y: { type: Number, default: 360 },
    clearCount: { type: Number, default: 0 },
    lastSeen: { type: Date, default: Date.now }
  }],
  messages: [{
    userId: { type: String, required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ["waiting", "starting", "playing", "finished"],
    default: "waiting"
  },
  winner: { type: String, default: null },
  startedAt: { type: Date, default: null },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600
    // Auto-delete after 1 hour
  }
});
const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);

const chat_post = defineEventHandler(async (event) => {
  var _a;
  const roomId = (_a = event.context.params) == null ? void 0 : _a.id;
  const body = await readBody(event);
  const { userId, username, text } = body;
  if (!roomId || !userId || !text) {
    throw createError({ statusCode: 400, statusMessage: "Missing fields" });
  }
  const msg = {
    userId,
    username,
    text,
    timestamp: /* @__PURE__ */ new Date()
  };
  await Room.updateOne(
    { _id: roomId },
    {
      $push: {
        messages: {
          $each: [msg],
          $slice: -50
          // Keep last 50
        }
      }
    }
  );
  return { success: true };
});

const chat_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: chat_post
}, Symbol.toStringTag, { value: 'Module' }));

const leave_post = defineEventHandler(async (event) => {
  var _a;
  const roomId = (_a = event.context.params) == null ? void 0 : _a.id;
  const body = await readBody(event);
  const { userId } = body;
  if (!roomId || !userId) {
    throw createError({ statusCode: 400, statusMessage: "Missing fields" });
  }
  const result = await Room.findOneAndUpdate(
    { _id: roomId, "players.userId": userId },
    { $pull: { players: { userId } } },
    { new: true }
  );
  if (!result) return { success: true };
  if (result.players.length === 0) {
    await Room.deleteOne({ _id: roomId });
  } else {
    if (result.hostId === userId) {
      const newHost = result.players[0];
      await Room.updateOne(
        { _id: roomId },
        {
          $set: {
            hostId: newHost.userId,
            "players.0.isHost": true
          }
        }
      );
    }
  }
  return { success: true };
});

const leave_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: leave_post
}, Symbol.toStringTag, { value: 'Module' }));

const roundNum$1 = (num, precision = 1) => {
  if (typeof num !== "number" || isNaN(num)) return 0;
  const factor = Math.pow(10, precision);
  return Math.round(num * factor) / factor;
};
const optimizeObstacles$1 = (obs) => {
  if (!Array.isArray(obs)) return [];
  return obs.map((o) => {
    const optimized = {
      ...o,
      x: roundNum$1(o.x),
      y: roundNum$1(o.y),
      width: roundNum$1(o.width),
      height: roundNum$1(o.height)
    };
    if (o.children) optimized.children = optimizeObstacles$1(o.children);
    return optimized;
  });
};
const start_post = defineEventHandler(async (event) => {
  var _a;
  const roomId = (_a = event.context.params) == null ? void 0 : _a.id;
  const body = await readBody(event);
  const { userId } = body;
  const room = await Room.findById(roomId);
  if (!room) throw createError({ statusCode: 404, statusMessage: "Room not found" });
  if (room.hostId !== userId) {
    throw createError({ statusCode: 403, statusMessage: "Only host can start game" });
  }
  if (room.status !== "waiting") {
    return { success: true };
  }
  try {
    const { GameEngine } = await Promise.resolve().then(function () { return gameEngine; });
    const engine = new GameEngine({ difficulty: room.difficulty || 10 });
    const seed = Math.floor(Math.random() * 1e6);
    const hostPlayer = room.players.find((p) => p.isHost);
    const maxDuration = room.duration || 120;
    const rounds = [];
    console.log(`[StartGame] Room ${room.title} duration: ${maxDuration}s. Generating inline rounds...`);
    for (let d = 10; d <= maxDuration; d += 10) {
      engine.generateMap([], [], d, seed, false);
      const mapData = {
        _id: new mongoose.Types.ObjectId(),
        // Virtual ID for tracking
        title: `ROOM_${room.title}_ROUND_${d / 10}`,
        difficulty: room.difficulty || 10,
        seed,
        engineObstacles: optimizeObstacles$1(engine.obstacles),
        enginePortals: optimizeObstacles$1(engine.portals),
        duration: d,
        audioUrl: room.musicUrl || null,
        isVerified: true,
        createdAt: /* @__PURE__ */ new Date()
      };
      rounds.push(mapData);
      if (rounds.length >= 100) break;
    }
    const updatedRoom = await Room.findOneAndUpdate(
      { _id: roomId, status: "waiting" },
      {
        $set: {
          map: rounds[0],
          mapQueue: rounds,
          status: "playing",
          startedAt: /* @__PURE__ */ new Date(),
          "players.$[].progress": 0,
          "players.$[].isReady": false
        }
      },
      { new: true }
    );
    if (!updatedRoom) {
      const checkAgain = await Room.findById(roomId);
      if ((checkAgain == null ? void 0 : checkAgain.status) === "playing") return { success: true };
      throw new Error("Room state changed or room was deleted during map generation");
    }
    console.log(`[StartGame] Successfully started game in room ${roomId} with ${rounds.length} inline rounds.`);
    return { success: true };
  } catch (err) {
    console.error("[StartGame] Fatal error:", err);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to start: ${err.message || "Unknown error"}`
    });
  }
});

const start_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: start_post
}, Symbol.toStringTag, { value: 'Module' }));

const status_get = defineEventHandler(async (event) => {
  var _a;
  const roomId = (_a = event.context.params) == null ? void 0 : _a.id;
  const query = getQuery$1(event);
  const userId = query.userId;
  if (roomId && userId) {
    Room.updateOne(
      { _id: roomId, "players.userId": userId },
      { $set: { "players.$.lastSeen": /* @__PURE__ */ new Date() } }
    ).exec().catch(console.error);
  }
  const room = await Room.findById(roomId);
  if (!room) {
    throw createError({ statusCode: 404, statusMessage: "Room not found" });
  }
  const roundNum = (num, precision = 1) => {
    if (typeof num !== "number" || isNaN(num)) return 0;
    const factor = Math.pow(10, precision);
    return Math.round(num * factor) / factor;
  };
  const optimizeObstacles = (obs) => {
    if (!Array.isArray(obs)) return [];
    return obs.map((o) => ({
      ...o,
      x: roundNum(o.x),
      y: roundNum(o.y),
      width: roundNum(o.width),
      height: roundNum(o.height)
    }));
  };
  let optimizedMap = room.map;
  if (optimizedMap && optimizedMap.engineObstacles && !optimizedMap._alreadyOptimized) {
    optimizedMap.engineObstacles = optimizeObstacles(optimizedMap.engineObstacles);
    optimizedMap.enginePortals = optimizeObstacles(optimizedMap.enginePortals);
    optimizedMap._alreadyOptimized = true;
  }
  return {
    room: {
      _id: room._id,
      title: room.title,
      status: room.status,
      maxPlayers: room.maxPlayers,
      players: room.players,
      hostId: room.hostId,
      map: optimizedMap,
      duration: room.duration,
      startedAt: room.startedAt,
      messages: room.messages
    }
  };
});

const status_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: status_get
}, Symbol.toStringTag, { value: 'Module' }));

const update_post = defineEventHandler(async (event) => {
  var _a;
  const roomId = (_a = event.context.params) == null ? void 0 : _a.id;
  const body = await readBody(event);
  const { userId, progress, y, isReady, isDead } = body;
  const updateData = {
    "players.$.lastSeen": /* @__PURE__ */ new Date()
  };
  if (progress !== void 0) updateData["players.$.progress"] = progress;
  if (y !== void 0) updateData["players.$.y"] = y;
  if (isReady !== void 0) updateData["players.$.isReady"] = isReady;
  await Room.updateOne(
    { _id: roomId, "players.userId": userId },
    { $set: updateData }
  );
  return { success: true };
});

const update_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: update_post
}, Symbol.toStringTag, { value: 'Module' }));

const clear_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { roomId, matchId, userId } = body;
  const id = roomId || matchId;
  if (!id || !userId) {
    throw createError({ statusCode: 400, statusMessage: "Missing roomId or userId" });
  }
  const result = await Room.updateOne(
    { _id: id, "players.userId": userId },
    {
      $inc: { "players.$.clearCount": 1 },
      $set: { "players.$.lastSeen": /* @__PURE__ */ new Date() }
    }
  );
  if (result.matchedCount === 0) {
    throw createError({ statusCode: 404, statusMessage: "Room or Player not found" });
  }
  console.log(`[Clear] Player ${userId} win recorded in room ${id}`);
  return { success: true };
});

const clear_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: clear_post
}, Symbol.toStringTag, { value: 'Module' }));

const create_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { title, maxPlayers, duration, userId, username: passedUsername, difficulty, musicUrl, musicTitle } = body;
  if (!userId || !title) {
    throw createError({ statusCode: 400, statusMessage: "Missing required fields" });
  }
  const isValidId = mongoose.Types.ObjectId.isValid(userId);
  const user = isValidId ? await User.findById(userId) : null;
  const username = passedUsername || (user == null ? void 0 : user.displayName) || (user == null ? void 0 : user.username) || `Guest_${Math.floor(Math.random() * 1e3)}`;
  const newRoom = await Room.create({
    title,
    hostId: userId,
    maxPlayers: maxPlayers || 4,
    duration: duration || 60,
    difficulty: difficulty || 5,
    musicUrl: musicUrl || null,
    musicTitle: musicTitle || null,
    players: [{
      userId,
      username,
      isHost: true,
      isReady: true,
      // Host is always ready? Or explicit?
      progress: 0,
      y: 360,
      lastSeen: /* @__PURE__ */ new Date()
    }],
    status: "waiting"
  });
  return { success: true, roomId: newRoom._id, room: newRoom };
});

const create_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: create_post
}, Symbol.toStringTag, { value: 'Module' }));

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

const index_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_get
}, Symbol.toStringTag, { value: 'Module' }));

const join_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { roomId, userId, username: passedUsername } = body;
  if (!roomId || !userId) {
    throw createError({ statusCode: 400, statusMessage: "Missing fields" });
  }
  const room = await Room.findById(roomId);
  if (!room) throw createError({ statusCode: 404, statusMessage: "Room not found" });
  if (room.status !== "waiting") throw createError({ statusCode: 403, statusMessage: "Game already started" });
  const existingPlayer = room.players.find((p) => p.userId === userId);
  if (existingPlayer) return { success: true, roomId: room._id };
  if (room.players.length >= room.maxPlayers) {
    throw createError({ statusCode: 403, statusMessage: "Room is full" });
  }
  const isValidId = mongoose.Types.ObjectId.isValid(userId);
  const user = isValidId ? await User.findById(userId) : null;
  const username = passedUsername || (user == null ? void 0 : user.displayName) || (user == null ? void 0 : user.username) || `Guest_${Math.floor(Math.random() * 1e3)}`;
  const result = await Room.updateOne(
    { _id: roomId, status: "waiting", "players.userId": { $ne: userId } },
    {
      $push: {
        players: {
          userId,
          username,
          isHost: false,
          isReady: false,
          progress: 0,
          y: 360,
          lastSeen: /* @__PURE__ */ new Date()
        }
      }
    }
  );
  if (result.matchedCount === 0) {
    const check = await Room.findById(roomId);
    if (!check) throw createError({ statusCode: 404, statusMessage: "Room disappeared" });
    if (check.status !== "waiting") throw createError({ statusCode: 403, statusMessage: "Game started" });
    if (check.players.length >= check.maxPlayers) throw createError({ statusCode: 403, statusMessage: "Full" });
    if (check.players.some((p) => p.userId === userId)) return { success: true, roomId: check._id };
  }
  return { success: true, roomId: room._id };
});

const join_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: join_post
}, Symbol.toStringTag, { value: 'Module' }));

const nextMap_post = defineEventHandler(async (event) => {
  var _a;
  const body = await readBody(event);
  const { roomId, userId, mapIndex } = body;
  if (!roomId || !userId) {
    throw createError({ statusCode: 400, statusMessage: "Missing roomId or userId" });
  }
  const room = await Room.findById(roomId);
  if (!room) throw createError({ statusCode: 404, statusMessage: "Room not found" });
  if (mapIndex < (((_a = room.mapQueue) == null ? void 0 : _a.length) || 0)) {
    const map = room.mapQueue[mapIndex];
    return { map, mapIndex };
  }
  if (room.mapQueue && room.mapQueue.length > 0) {
    return { map: room.mapQueue[room.mapQueue.length - 1], mapIndex: room.mapQueue.length - 1 };
  }
  return { map: null, mapIndex };
});

const nextMap_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: nextMap_post
}, Symbol.toStringTag, { value: 'Module' }));

const samples_get = defineEventHandler(async (event) => {
  const { id } = getQuery$1(event);
  const sampleSources = {
    "1": {
      // SoundHelix - Song 1 (Reliable test audio)
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      name: "Electronic Future Beats"
    },
    "2": {
      // SoundHelix - Song 8
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
      name: "Synthwave Retro"
    },
    "3": {
      // SoundHelix - Song 10
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
      name: "Epic Cinematic"
    }
  };
  const sample = sampleSources[id];
  if (!sample) {
    throw createError({
      statusCode: 404,
      statusMessage: "Sample not found"
    });
  }
  try {
    console.log(`[Samples] Fetching: ${sample.name} from ${sample.url}`);
    const response = await fetch(sample.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "audio/mpeg,audio/*;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://pixabay.com/"
      }
    });
    if (!response.ok) {
      console.error(`[Samples] Failed to fetch: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch sample: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    console.log(`[Samples] Successfully fetched ${sample.name}, size: ${arrayBuffer.byteLength} bytes`);
    setResponseHeader(event, "Content-Type", "audio/mpeg");
    setResponseHeader(event, "Content-Disposition", `attachment; filename="${encodeURIComponent(sample.name)}.mp3"`);
    setResponseHeader(event, "Cache-Control", "public, max-age=604800");
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("[Samples] Error:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to load sample music: ${error.message}`
    });
  }
});

const samples_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: samples_get
}, Symbol.toStringTag, { value: 'Module' }));

const INVIDIOUS_INSTANCES = [
  "https://api.invidious.io",
  // Official API instance
  "https://invidious.snopyta.org",
  "https://invidious.kavin.rocks",
  "https://inv.riverside.rocks",
  "https://yt.artemislena.eu",
  "https://invidious.flokinet.to",
  "https://invidious.esmailelbob.xyz",
  "https://inv.bp.projectsegfau.lt"
];
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
async function fetchWithTimeout(url, options = {}, timeoutMs = 1e4) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}
async function getAudioFromInvidious(videoId) {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      console.log(`[YouTube] Trying Invidious instance: ${instance}`);
      const apiUrl = `${instance}/api/v1/videos/${videoId}`;
      const response = await fetchWithTimeout(apiUrl, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      }, 15e3);
      if (!response.ok) {
        console.log(`[YouTube] Invidious ${instance} returned ${response.status}`);
        continue;
      }
      const data = await response.json();
      const title = data.title || "audio";
      const adaptiveFormats = data.adaptiveFormats || [];
      let audioFormat = adaptiveFormats.filter((f) => {
        var _a;
        return (_a = f.type) == null ? void 0 : _a.startsWith("audio/");
      }).sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
      if (audioFormat == null ? void 0 : audioFormat.url) {
        console.log(`[YouTube] Found audio from ${instance}: ${audioFormat.type}, bitrate: ${audioFormat.bitrate}`);
        return { audioUrl: audioFormat.url, title };
      }
      const formatStreams = data.formatStreams || [];
      if (formatStreams.length > 0) {
        console.log(`[YouTube] Using formatStream from ${instance}`);
        return { audioUrl: formatStreams[0].url, title };
      }
    } catch (error) {
      console.log(`[YouTube] Invidious ${instance} error: ${error.message}`);
      continue;
    }
  }
  return null;
}
async function getAudioFromCobalt(videoId) {
  const cobaltUrl = "https://api.cobalt.tools";
  try {
    console.log(`[YouTube] Trying Cobalt API...`);
    const response = await fetchWithTimeout(cobaltUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        downloadMode: "audio",
        audioFormat: "mp3"
      })
    }, 3e4);
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[YouTube] Cobalt returned ${response.status}: ${errorText}`);
      return null;
    }
    const data = await response.json();
    if (data.status === "tunnel" || data.status === "redirect") {
      const audioUrl = data.url || data.audio;
      if (audioUrl) {
        console.log(`[YouTube] Got audio URL from Cobalt`);
        return { audioUrl, title: data.filename || "audio" };
      }
    } else if (data.url) {
      console.log(`[YouTube] Got direct URL from Cobalt`);
      return { audioUrl: data.url, title: "audio" };
    }
    console.log(`[YouTube] Cobalt response format not recognized:`, data);
  } catch (error) {
    console.log(`[YouTube] Cobalt error: ${error.message}`);
  }
  return null;
}
async function getAudioFromPiped(videoId) {
  const pipedInstances = [
    "https://pipedapi.kavin.rocks",
    "https://api.piped.yt",
    "https://pipedapi.adminforge.de"
  ];
  for (const instance of pipedInstances) {
    try {
      console.log(`[YouTube] Trying Piped instance: ${instance}`);
      const response = await fetchWithTimeout(`${instance}/streams/${videoId}`, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      }, 15e3);
      if (!response.ok) {
        console.log(`[YouTube] Piped ${instance} returned ${response.status}`);
        continue;
      }
      const data = await response.json();
      const title = data.title || "audio";
      const audioStreams = data.audioStreams || [];
      if (audioStreams.length > 0) {
        const bestAudio = audioStreams.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
        if (bestAudio == null ? void 0 : bestAudio.url) {
          console.log(`[YouTube] Found audio from Piped ${instance}: bitrate ${bestAudio.bitrate}`);
          return { audioUrl: bestAudio.url, title };
        }
      }
    } catch (error) {
      console.log(`[YouTube] Piped ${instance} error: ${error.message}`);
      continue;
    }
  }
  return null;
}
const youtube_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { url } = body;
  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: "URL is required"
    });
  }
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid YouTube URL"
    });
  }
  console.log(`[YouTube] Processing video ID: ${videoId}`);
  try {
    let result = await getAudioFromInvidious(videoId);
    if (!result) {
      console.log("[YouTube] All Invidious instances failed, trying Piped...");
      result = await getAudioFromPiped(videoId);
    }
    if (!result) {
      console.log("[YouTube] All Piped instances failed, trying Cobalt...");
      result = await getAudioFromCobalt(videoId);
    }
    if (!result) {
      throw new Error("All audio extraction methods failed. Please try again later.");
    }
    const { audioUrl, title } = result;
    const sanitizedTitle = title.replace(/[\/\\:*?"<>|]/g, "_");
    console.log(`[YouTube] Streaming audio for: ${sanitizedTitle}`);
    const audioResponse = await fetchWithTimeout(audioUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "*/*",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": "https://www.youtube.com/"
      }
    }, 6e4);
    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio stream: ${audioResponse.status}`);
    }
    const contentType = audioResponse.headers.get("content-type") || "audio/mpeg";
    setResponseHeader(event, "Content-Type", contentType);
    const encodedTitle = encodeURIComponent(sanitizedTitle + ".mp3");
    setResponseHeader(event, "Content-Disposition", `attachment; filename*=UTF-8''${encodedTitle}`);
    const contentLength = audioResponse.headers.get("content-length");
    if (contentLength) {
      setResponseHeader(event, "Content-Length", parseInt(contentLength, 10));
    }
    if (audioResponse.body) {
      const reader = audioResponse.body.getReader();
      const stream = new Readable({
        async read() {
          try {
            const { done, value } = await reader.read();
            if (done) {
              this.push(null);
            } else {
              this.push(Buffer.from(value));
            }
          } catch (err) {
            this.destroy(err);
          }
        }
      });
      return sendStream(event, stream);
    }
    throw new Error("No response body available");
  } catch (error) {
    console.error("[YouTube] Download Error:", {
      message: error.message,
      videoId
    });
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to process YouTube video: ${error.message}`
    });
  }
});

const youtube_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: youtube_post
}, Symbol.toStringTag, { value: 'Module' }));

function renderPayloadResponse(ssrContext) {
  return {
    body: stringify(splitPayload(ssrContext).payload, ssrContext._payloadReducers) ,
    statusCode: getResponseStatus(ssrContext.event),
    statusMessage: getResponseStatusText(ssrContext.event),
    headers: {
      "content-type": "application/json;charset=utf-8" ,
      "x-powered-by": "Nuxt"
    }
  };
}
function renderPayloadJsonScript(opts) {
  const contents = opts.data ? stringify(opts.data, opts.ssrContext._payloadReducers) : "";
  const payload = {
    "type": "application/json",
    "innerHTML": contents,
    "data-nuxt-data": appId,
    "data-ssr": !(opts.ssrContext.noSSR)
  };
  {
    payload.id = "__NUXT_DATA__";
  }
  if (opts.src) {
    payload["data-src"] = opts.src;
  }
  const config = uneval(opts.ssrContext.config);
  return [
    payload,
    {
      innerHTML: `window.__NUXT__={};window.__NUXT__.config=${config}`
    }
  ];
}
function splitPayload(ssrContext) {
  const { data, prerenderedAt, ...initial } = ssrContext.payload;
  return {
    initial: { ...initial, prerenderedAt },
    payload: { data, prerenderedAt }
  };
}

const renderSSRHeadOptions = {"omitLineBreaks":true};

globalThis.__buildAssetsURL = buildAssetsURL;
globalThis.__publicAssetsURL = publicAssetsURL;
const HAS_APP_TELEPORTS = !!(appTeleportAttrs.id);
const APP_TELEPORT_OPEN_TAG = HAS_APP_TELEPORTS ? `<${appTeleportTag}${propsToString(appTeleportAttrs)}>` : "";
const APP_TELEPORT_CLOSE_TAG = HAS_APP_TELEPORTS ? `</${appTeleportTag}>` : "";
const PAYLOAD_URL_RE = /^[^?]*\/_payload.json(?:\?.*)?$/ ;
const renderer = defineRenderHandler(async (event) => {
  const nitroApp = useNitroApp();
  const ssrError = event.path.startsWith("/__nuxt_error") ? getQuery$1(event) : null;
  if (ssrError && !("__unenv__" in event.node.req)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Page Not Found: /__nuxt_error"
    });
  }
  const ssrContext = createSSRContext(event);
  const headEntryOptions = { mode: "server" };
  ssrContext.head.push(appHead, headEntryOptions);
  if (ssrError) {
    ssrError.statusCode &&= Number.parseInt(ssrError.statusCode);
    if (typeof ssrError.data === "string") {
      try {
        ssrError.data = destr(ssrError.data);
      } catch {
      }
    }
    setSSRError(ssrContext, ssrError);
  }
  const isRenderingPayload = PAYLOAD_URL_RE.test(ssrContext.url);
  if (isRenderingPayload) {
    const url = ssrContext.url.substring(0, ssrContext.url.lastIndexOf("/")) || "/";
    ssrContext.url = url;
    event._path = event.node.req.url = url;
  }
  const routeOptions = getRouteRules(event);
  if (routeOptions.ssr === false) {
    ssrContext.noSSR = true;
  }
  const renderer = await getRenderer(ssrContext);
  const _rendered = await renderer.renderToString(ssrContext).catch(async (error) => {
    if (ssrContext._renderResponse && error.message === "skipping render") {
      return {};
    }
    const _err = !ssrError && ssrContext.payload?.error || error;
    await ssrContext.nuxt?.hooks.callHook("app:error", _err);
    throw _err;
  });
  const inlinedStyles = [];
  await ssrContext.nuxt?.hooks.callHook("app:rendered", { ssrContext, renderResult: _rendered });
  if (ssrContext._renderResponse) {
    return ssrContext._renderResponse;
  }
  if (ssrContext.payload?.error && !ssrError) {
    throw ssrContext.payload.error;
  }
  if (isRenderingPayload) {
    const response = renderPayloadResponse(ssrContext);
    return response;
  }
  const NO_SCRIPTS = routeOptions.noScripts;
  const { styles, scripts } = getRequestDependencies(ssrContext, renderer.rendererContext);
  if (inlinedStyles.length) {
    ssrContext.head.push({ style: inlinedStyles });
  }
  const link = [];
  for (const resource of Object.values(styles)) {
    if ("inline" in getQuery(resource.file)) {
      continue;
    }
    link.push({ rel: "stylesheet", href: renderer.rendererContext.buildAssetsURL(resource.file), crossorigin: "" });
  }
  if (link.length) {
    ssrContext.head.push({ link }, headEntryOptions);
  }
  if (!NO_SCRIPTS) {
    ssrContext.head.push({
      link: getPreloadLinks(ssrContext, renderer.rendererContext)
    }, headEntryOptions);
    ssrContext.head.push({
      link: getPrefetchLinks(ssrContext, renderer.rendererContext)
    }, headEntryOptions);
    ssrContext.head.push({
      script: renderPayloadJsonScript({ ssrContext, data: ssrContext.payload }) 
    }, {
      ...headEntryOptions,
      // this should come before another end of body scripts
      tagPosition: "bodyClose",
      tagPriority: "high"
    });
  }
  if (!routeOptions.noScripts) {
    const tagPosition = "head";
    ssrContext.head.push({
      script: Object.values(scripts).map((resource) => ({
        type: resource.module ? "module" : null,
        src: renderer.rendererContext.buildAssetsURL(resource.file),
        defer: resource.module ? null : true,
        // if we are rendering script tag payloads that import an async payload
        // we need to ensure this resolves before executing the Nuxt entry
        tagPosition,
        crossorigin: ""
      }))
    }, headEntryOptions);
  }
  const { headTags, bodyTags, bodyTagsOpen, htmlAttrs, bodyAttrs } = await renderSSRHead(ssrContext.head, renderSSRHeadOptions);
  const htmlContext = {
    htmlAttrs: htmlAttrs ? [htmlAttrs] : [],
    head: normalizeChunks([headTags]),
    bodyAttrs: bodyAttrs ? [bodyAttrs] : [],
    bodyPrepend: normalizeChunks([bodyTagsOpen, ssrContext.teleports?.body]),
    body: [
      replaceIslandTeleports(ssrContext, _rendered.html) ,
      APP_TELEPORT_OPEN_TAG + (HAS_APP_TELEPORTS ? joinTags([ssrContext.teleports?.[`#${appTeleportAttrs.id}`]]) : "") + APP_TELEPORT_CLOSE_TAG
    ],
    bodyAppend: [bodyTags]
  };
  await nitroApp.hooks.callHook("render:html", htmlContext, { event });
  return {
    body: renderHTMLDocument(htmlContext),
    statusCode: getResponseStatus(event),
    statusMessage: getResponseStatusText(event),
    headers: {
      "content-type": "text/html;charset=utf-8",
      "x-powered-by": "Nuxt"
    }
  };
});
function normalizeChunks(chunks) {
  const result = [];
  for (const _chunk of chunks) {
    const chunk = _chunk?.trim();
    if (chunk) {
      result.push(chunk);
    }
  }
  return result;
}
function joinTags(tags) {
  return tags.join("");
}
function joinAttrs(chunks) {
  if (chunks.length === 0) {
    return "";
  }
  return " " + chunks.join(" ");
}
function renderHTMLDocument(html) {
  return `<!DOCTYPE html><html${joinAttrs(html.htmlAttrs)}><head>${joinTags(html.head)}</head><body${joinAttrs(html.bodyAttrs)}>${joinTags(html.bodyPrepend)}${joinTags(html.body)}${joinTags(html.bodyAppend)}</body></html>`;
}

const renderer$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: renderer
}, Symbol.toStringTag, { value: 'Module' }));

class MapGenerator {
  /**
   * Difficulty based gap calculation
   * 난이도가 높을수록 좁아짐
   */
  /**
   * Difficulty based gap calculation
   * 난이도가 높을수록 좁아짐
   */
  calculateGap(difficulty, isMini) {
    let baseGap;
    if (difficulty <= 7) {
      baseGap = 580 - (difficulty - 1) * 20;
    } else if (difficulty <= 15) {
      baseGap = 460 - (difficulty - 8) * 17.5;
    } else if (difficulty <= 23) {
      baseGap = 320 - (difficulty - 16) * 17.5;
    } else {
      baseGap = 180 - (difficulty - 24) * 15;
    }
    baseGap = Math.max(50, baseGap);
    return isMini ? baseGap * 1.5 : baseGap;
  }
  /**
   * 주어진 경로(path)를 따라 Geometry Dash Wave 스타일 맵 생성
   * - Grid Snapped Slopes (45도 경사 연결성 보장)
   * - Saw-filled Walls (Nine Circles)
   * - Rhythm-synced Decorations
   */
  generateFromPath(path, difficulty, beatTimes, stateEvents = []) {
    if (!path || path.length < 2) return [];
    const objects = [];
    const blockSize = 50;
    const baseGapVal = this.calculateGap(difficulty, false);
    const startX = Math.floor(path[0].x / blockSize) * blockSize;
    const endX = path[path.length - 1].x;
    if (isNaN(startX) || isNaN(endX) || endX <= startX) return [];
    const SEGMENT_COUNT = 10;
    const poolFloor = ["spike", "piston_v", "hammer", "growing_spike", "cannon", "crusher_jaw"];
    const poolCeil = ["spike", "falling_spike", "hammer", "swing_blade", "piston_v", "crusher_jaw"];
    const poolFloat = ["mine", "rotor", "spark_mine", "laser_beam", "planet", "star"];
    const createSegmentSets = (pool, count, minPerSeg) => {
      let sets = Array(count).fill([]).map(() => []);
      let bag = [...pool];
      const targetTotal = count * minPerSeg;
      while (bag.length < targetTotal) {
        bag.push(pool[Math.floor(Math.random() * pool.length)]);
      }
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      for (let i = 0; i < count; i++) {
        sets[i] = bag.slice(i * minPerSeg, (i + 1) * minPerSeg);
      }
      return sets;
    };
    const segmentFloor = createSegmentSets(poolFloor, SEGMENT_COUNT, 2);
    const segmentCeil = createSegmentSets(poolCeil, SEGMENT_COUNT, 2);
    const segmentFloat = createSegmentSets(poolFloat, SEGMENT_COUNT, 2);
    let currentFloorY = Math.floor((path[0].y + baseGapVal / 2) / blockSize) * blockSize;
    let currentCeilY = Math.floor((path[0].y - baseGapVal / 2) / blockSize) * blockSize;
    let pathIdx = 0;
    let beatIdx = 0;
    beatTimes.sort((a, b) => a - b);
    let eventIdx = 0;
    let isMini = false;
    let currentGap = baseGapVal * (1 / 1.4);
    for (let currentX = startX; currentX < endX; currentX += blockSize) {
      const centerX = currentX + blockSize / 2;
      while (pathIdx < path.length - 1 && path[pathIdx + 1].x < centerX) {
        pathIdx++;
      }
      const currentPoint = path[pathIdx];
      if (!currentPoint) continue;
      const nextPoint = pathIdx < path.length - 1 ? path[pathIdx + 1] : currentPoint;
      const currentTime = currentPoint.time;
      while (eventIdx < stateEvents.length && stateEvents[eventIdx].time <= currentTime) {
        isMini = stateEvents[eventIdx].isMini;
        eventIdx++;
      }
      if (isMini) {
        currentGap = baseGapVal * 1.3;
      } else {
        currentGap = baseGapVal;
      }
      const halfGap = currentGap / 2;
      const nextX = currentX + blockSize;
      let nextPathIdx = pathIdx;
      while (nextPathIdx < path.length - 1 && path[nextPathIdx + 1].x < nextX) {
        nextPathIdx++;
      }
      const np = path[nextPathIdx];
      const targetFloorY = np.y + halfGap;
      const targetCeilY = np.y - halfGap;
      let stepY = 0;
      let ceilStepY = 0;
      let segMinY = Infinity;
      let segMaxY = -Infinity;
      for (let i = pathIdx; i <= nextPathIdx; i++) {
        const py = path[i].y;
        if (py < segMinY) segMinY = py;
        if (py > segMaxY) segMaxY = py;
      }
      const pSize = isMini ? 7.5 : 15;
      const genSafety = 5;
      const floorBoundary = segMaxY + pSize + genSafety;
      const ceilBoundary = segMinY - pSize - genSafety;
      const floorExpandThreshold = 10;
      const ceilContractThreshold = 35;
      const floorDiff = targetFloorY - currentFloorY;
      if (isMini) {
        if (floorDiff < -blockSize * 1.5) stepY = -blockSize * 2;
        else if (floorDiff < -35) stepY = -blockSize;
        else if (floorDiff > blockSize * 1.5) stepY = blockSize * 2;
        else if (floorDiff > floorExpandThreshold) stepY = blockSize;
      } else {
        if (floorDiff < -35) stepY = -blockSize;
        else if (floorDiff > floorExpandThreshold) stepY = blockSize;
      }
      const ceilDiff = targetCeilY - currentCeilY;
      if (isMini) {
        if (ceilDiff < -blockSize * 1.5) ceilStepY = -blockSize * 2;
        else if (ceilDiff < -10) ceilStepY = -blockSize;
        else if (ceilDiff > blockSize * 1.5) ceilStepY = blockSize * 2;
        else if (ceilDiff > ceilContractThreshold) ceilStepY = blockSize;
      } else {
        if (ceilDiff < -10) ceilStepY = -blockSize;
        else if (ceilDiff > ceilContractThreshold) ceilStepY = blockSize;
      }
      if (stepY < 0 && currentFloorY + stepY < floorBoundary) {
        stepY = 0;
      }
      if (ceilStepY > 0 && currentCeilY + ceilStepY > ceilBoundary) {
        ceilStepY = 0;
      }
      if (stepY < 0) {
        const isSteep = stepY === -blockSize * 2;
        const slopeType = isSteep ? "steep_triangle" : "triangle";
        const slopeHeight = Math.abs(stepY);
        currentFloorY += stepY;
        const blockY = currentFloorY;
        objects.push({
          type: slopeType,
          x: currentX,
          y: blockY,
          width: blockSize,
          height: slopeHeight,
          rotation: 0
        });
        this.fillBelow(objects, currentX, blockY + slopeHeight, blockSize);
      } else if (stepY > 0) {
        const isSteep = stepY === blockSize * 2;
        const slopeType = isSteep ? "steep_triangle" : "triangle";
        const slopeHeight = Math.abs(stepY);
        const blockY = currentFloorY;
        objects.push({
          type: slopeType,
          x: currentX,
          y: blockY,
          width: blockSize,
          height: slopeHeight,
          rotation: 90
        });
        this.fillBelow(objects, currentX, blockY + slopeHeight, blockSize);
        currentFloorY += stepY;
      } else {
        const blockY = currentFloorY;
        objects.push({ type: "block", x: currentX, y: blockY, width: blockSize, height: blockSize });
        this.fillBelow(objects, currentX, blockY + blockSize, blockSize);
      }
      if (ceilStepY < 0) {
        const isSteep = ceilStepY === -blockSize * 2;
        const slopeType = isSteep ? "steep_triangle" : "triangle";
        const slopeHeight = Math.abs(ceilStepY);
        currentCeilY += ceilStepY;
        const blockY = currentCeilY;
        objects.push({
          type: slopeType,
          x: currentX,
          y: blockY,
          width: blockSize,
          height: slopeHeight,
          rotation: 180
        });
        this.fillAbove(objects, currentX, blockY, blockSize);
      } else if (ceilStepY > 0) {
        const isSteep = ceilStepY === blockSize * 2;
        const slopeType = isSteep ? "steep_triangle" : "triangle";
        const slopeHeight = Math.abs(ceilStepY);
        const blockY = currentCeilY;
        objects.push({
          type: slopeType,
          x: currentX,
          y: blockY,
          width: blockSize,
          height: slopeHeight,
          rotation: -90
        });
        this.fillAbove(objects, currentX, blockY, blockSize);
        currentCeilY += ceilStepY;
      } else {
        const blockY = currentCeilY - blockSize;
        objects.push({ type: "block", x: currentX, y: blockY, width: blockSize, height: blockSize });
        this.fillAbove(objects, currentX, blockY, blockSize);
      }
      const rand = Math.abs(Math.sin(currentX * 0.123 + currentFloorY * 0.456));
      const hazardThreshold = 0.2 + difficulty / 30 * 0.35;
      if (stepY === 0 && currentGap > 100 && rand < hazardThreshold) {
        let spikeH = 40;
        if (difficulty <= 5) spikeH = 20;
        else if (difficulty <= 10) spikeH = 30;
        if (difficulty > 15) spikeH = 45;
        if (difficulty > 25) spikeH = 50;
        const progress = Math.min(Math.max((currentX - startX) / (endX - startX), 0), 0.999);
        const segIdx = Math.floor(progress * SEGMENT_COUNT);
        const currentFloorOptions = segmentFloor[segIdx];
        const currentCeilOptions = segmentCeil[segIdx];
        let floorType = currentFloorOptions[Math.floor(Math.random() * currentFloorOptions.length)] || "spike";
        let ceilType = currentCeilOptions[Math.floor(Math.random() * currentCeilOptions.length)] || "spike";
        if (floorType === "spike" && difficulty <= 8) floorType = "mini_spike";
        if (ceilType === "spike" && difficulty <= 8) ceilType = "mini_spike";
        if (rand < 0.1) {
          if (currentPoint.y < currentFloorY - spikeH - 40 && currentFloorY - spikeH > currentCeilY + 40) {
            objects.push({
              type: floorType,
              x: currentX,
              y: currentFloorY - spikeH,
              width: blockSize,
              height: spikeH,
              movement: this.getRandomMovement(floorType, 0.25)
            });
          }
        } else {
          let adjustedCeilY = currentCeilY;
          if (ceilType === "falling_spike") {
            const dist = currentPoint.y - currentCeilY;
            if (dist > 250) {
              adjustedCeilY = currentPoint.y - 250;
            }
          }
          if (currentPoint.y > adjustedCeilY + spikeH + 40 && adjustedCeilY + spikeH < currentFloorY - 40) {
            objects.push({
              type: ceilType,
              x: currentX,
              y: adjustedCeilY,
              width: blockSize,
              height: spikeH,
              rotation: 180,
              movement: this.getRandomMovement(ceilType, 0.25)
            });
          }
        }
      }
      if (rand > 0.95 && currentGap > 200) {
        const mineSize = difficulty <= 7 ? 20 : 30;
        const midY = (currentFloorY + currentCeilY) / 2;
        let pY = midY;
        if (currentPoint.y < midY) {
          pY = midY + (currentFloorY - midY) * 0.5;
        } else {
          pY = midY - (midY - currentCeilY) * 0.5;
        }
        const progress = Math.min(Math.max((currentX - startX) / (endX - startX), 0), 0.999);
        const segIdx = Math.floor(progress * SEGMENT_COUNT);
        const currentFloatOptions = segmentFloat[segIdx];
        const chosenFloat = currentFloatOptions[Math.floor(Math.random() * currentFloatOptions.length)] || "mine";
        const obsType = chosenFloat;
        let children = void 0;
        let customData = void 0;
        if (obsType === "planet") {
          customData = { orbitSpeed: 1.5, orbitDistance: mineSize * 0.8, orbitCount: 2 };
          children = [];
          for (let k = 0; k < 2; k++) {
            children.push({ type: "planet", x: 0, y: 0, width: mineSize * 0.4, height: mineSize * 0.4, isHitbox: true });
          }
        } else if (obsType === "star") {
          customData = { orbitSpeed: 1, orbitDistance: mineSize * 0.8, orbitCount: 3 };
          children = [];
          for (let k = 0; k < 3; k++) {
            children.push({ type: "planet", x: 0, y: 0, width: mineSize * 0.5, height: mineSize * 0.5, isHitbox: true });
          }
        }
        objects.push({
          type: obsType,
          x: currentX + 10,
          y: pY - mineSize / 2,
          width: mineSize,
          height: mineSize,
          isHitbox: true,
          rotation: obsType === "laser_beam" ? 90 : 0,
          children,
          customData,
          movement: this.getRandomMovement(obsType, 0.5)
        });
      }
      while (beatIdx < beatTimes.length && beatTimes[beatIdx] < currentPoint.time) {
        beatIdx++;
      }
      while (beatIdx < beatTimes.length && beatTimes[beatIdx] <= nextPoint.time) {
        const beatY = (currentFloorY + currentCeilY) / 2 - 40;
        if (beatY >= currentCeilY && beatY + 80 <= currentFloorY) {
          objects.push({
            type: "orb",
            x: currentX + 25,
            y: beatY,
            width: 80,
            height: 80,
            isHitbox: false
          });
        }
        beatIdx++;
      }
    }
    return objects.filter((obj) => {
      if (["gravity_yellow", "gravity_blue", "speed_0.25", "speed_0.5", "speed_1", "speed_2", "speed_3", "speed_4", "mini_pink", "mini_green"].includes(obj.type)) return true;
      if (obj.isHitbox === true) return true;
      return true;
    });
  }
  fillBelow(objects, x, startY, size) {
    const mapBottom = 1e3;
    const height = mapBottom - startY;
    if (height > 0) {
      objects.push({
        type: "block",
        x,
        y: startY,
        width: size,
        height,
        isHitbox: true
      });
    }
  }
  fillAbove(objects, x, startY, size) {
    const mapTop = -500;
    const topY = mapTop;
    const height = startY - mapTop;
    if (height > 0) {
      objects.push({
        type: "block",
        x,
        y: topY,
        width: size,
        height,
        isHitbox: true
      });
    }
  }
  getRandomMovement(type, prob) {
    if (Math.random() > prob) return void 0;
    const useRotate = ["saw", "mine", "spike_ball", "rotor", "cannon", "spark_mine", "planet", "star"].includes(type);
    const useUpDown = !useRotate || Math.random() < 0.3;
    if (useRotate && !useUpDown) {
      return {
        type: "rotate",
        speed: 1 + Math.random() * 2,
        range: 360,
        phase: Math.random() * Math.PI * 2
      };
    } else {
      return {
        type: "updown",
        speed: 1.5 + Math.random() * 2.5,
        range: 30 + Math.random() * 70,
        phase: Math.random() * Math.PI * 2
      };
    }
  }
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class GameEngine {
  constructor(config) {
    // Player state
    __publicField(this, "playerX", 200);
    __publicField(this, "playerY", 360);
    __publicField(this, "playerSize", 12);
    __publicField(this, "basePlayerSize", 12);
    __publicField(this, "miniPlayerSize", 12);
    // 미니 모드 히트박스 (일반과 동일)
    // Wave movement
    __publicField(this, "baseSpeed", 350);
    __publicField(this, "waveSpeed", 350);
    __publicField(this, "waveAmplitude", 350);
    __publicField(this, "isHolding", false);
    __publicField(this, "waveAngle", 45);
    // 기본 45도
    __publicField(this, "miniWaveAngle", 60);
    // Gravity system
    __publicField(this, "isGravityInverted", false);
    __publicField(this, "speedMultiplier", 1);
    __publicField(this, "isMini", false);
    // Game boundaries
    __publicField(this, "minY", 140);
    __publicField(this, "maxY", 580);
    // Map elements
    __publicField(this, "obstacles", []);
    __publicField(this, "portals", []);
    // Pattern library
    __publicField(this, "patterns", []);
    // Map config
    __publicField(this, "mapConfig", {
      density: 1,
      portalFrequency: 0.15,
      difficulty: 5
    });
    // Camera
    __publicField(this, "cameraX", 0);
    // Game state
    __publicField(this, "isPlaying", false);
    __publicField(this, "isDead", false);
    __publicField(this, "failReason", "");
    __publicField(this, "startTime", 0);
    // Hitbox mode
    __publicField(this, "showHitboxes", false);
    // Score & Progress
    __publicField(this, "score", 0);
    __publicField(this, "progress", 0);
    __publicField(this, "totalLength", 0);
    // Track data
    // Validation feedback
    __publicField(this, "validationFailureInfo", null);
    __publicField(this, "trackDuration", 0);
    // Visual effects
    __publicField(this, "trail", []);
    __publicField(this, "particles", []);
    // AI state persistence
    __publicField(this, "aiStateTimer", 0);
    // 현재 입력을 유지한 시간 (초)
    __publicField(this, "aiPredictedPath", []);
    __publicField(this, "beatTimes", []);
    // Store beat times for effect synchronization
    // Boss System
    __publicField(this, "boss", {
      active: false,
      x: 0,
      y: 0,
      health: 100,
      maxHealth: 100,
      state: "idle",
      attackTimer: 0,
      projectiles: []
    });
    // Generation State Persistence
    __publicField(this, "lastStateEvents", []);
    __publicField(this, "lastBeatActions", []);
    // Measure Highlights
    __publicField(this, "lastMeasureIndex", -1);
    __publicField(this, "isMeasureHighlight", false);
    __publicField(this, "onPortalActivation", null);
    // Autoplay data
    __publicField(this, "isAutoplay", false);
    __publicField(this, "autoplayLog", []);
    __publicField(this, "lastAutoplayIndex", 0);
    // 패턴 간격 배율 (재생성 시 증가)
    __publicField(this, "patternGapMultiplier", 1);
    // BPM 및 마디 길이 (음악 동기화용)
    __publicField(this, "bpm", 120);
    __publicField(this, "measureLength", 2);
    if (config) {
      this.mapConfig = { ...this.mapConfig, ...config };
    }
    this.baseSpeed = this.getDynamicBaseSpeed();
    this.reset();
  }
  // 미니 모드 60도
  // Get dynamic base speed based on difficulty
  getDynamicBaseSpeed() {
    const diff = this.mapConfig.difficulty;
    if (diff <= 2) return 260;
    if (diff <= 7) return 300;
    if (diff <= 12) return 330;
    return 350;
  }
  /**
   * 100개의 미리 정의된 패턴 초기화 (난이도 반영)
   */
  initPatterns() {
    this.patterns = [];
    const playH = this.maxY - this.minY;
    const diff = this.mapConfig.difficulty;
    const MIN_GAP = this.basePlayerSize * 4;
    let gapMultiplier = 1;
    if (diff < 8) {
      gapMultiplier = 2.5 - (diff - 1) / 7 * 0.7;
    } else if (diff < 16) {
      gapMultiplier = 1.3 - (diff - 8) / 8 * 0.5;
    } else if (diff < 24) {
      gapMultiplier = 0.8 - (diff - 16) / 8 * 0.35;
    } else {
      gapMultiplier = 0.45 - (diff - 24) / 7 * 0.3;
    }
    let blockGapFactor = 1;
    if (diff < 8) blockGapFactor = 4;
    else if (diff < 16) blockGapFactor = 1.5;
    else if (diff < 24) blockGapFactor = 1.2;
    else blockGapFactor = 1;
    const SPIKE_H = 40;
    for (let i = 0; i < 10; i++) {
      const h = 80 + i * 12;
      const sh = Math.min(h, SPIKE_H);
      const bh = h - sh;
      const obs = [];
      if (bh > 0) obs.push({ dx: 0, dy: playH - bh, w: 50, h: bh, type: "block" });
      obs.push({ dx: 0, dy: playH - h, w: 50, h: sh, type: "spike" });
      this.patterns.push({
        obstacles: obs,
        requiredY: "top",
        width: 60
      });
    }
    for (let i = 0; i < 10; i++) {
      const h = 80 + i * 12;
      const sh = Math.min(h, SPIKE_H);
      const bh = h - sh;
      const obs = [];
      obs.push({ dx: 0, dy: 0, w: 50, h: sh, type: "spike" });
      if (bh > 0) obs.push({ dx: 0, dy: sh, w: 50, h: bh, type: "block" });
      this.patterns.push({
        obstacles: obs,
        requiredY: "bottom",
        width: 60
      });
    }
    for (let i = 0; i < 10; i++) {
      const size = 120 + i * 15;
      const centerY = playH / 2 - size / 2;
      this.patterns.push({
        obstacles: [{ dx: 0, dy: centerY, w: size, h: size, type: "block" }],
        requiredY: i % 2 === 0 ? "top" : "bottom",
        width: size + 20,
        type: "square_block"
      });
    }
    for (let i = 0; i < 10; i++) {
      const baseGap = (160 - i * 8) * blockGapFactor;
      const gapSize = Math.max(MIN_GAP, baseGap * gapMultiplier);
      const topH = (playH - gapSize) / 2;
      const bottomY = topH + gapSize;
      const bottomH = playH - bottomY;
      const sh_top = Math.min(topH, SPIKE_H);
      const sh_bot = Math.min(bottomH, SPIKE_H);
      const obs = [
        { dx: 0, dy: Math.max(0, topH - sh_top), w: 40, h: Math.max(0, sh_top), type: "spike" },
        { dx: 0, dy: bottomY, w: 40, h: Math.max(0, sh_bot), type: "spike" }
      ];
      if (topH > sh_top) {
        obs.push({ dx: 0, dy: 0, w: 40, h: topH - sh_top, type: "block" });
      }
      if (bottomH > sh_bot) {
        obs.push({ dx: 0, dy: bottomY + sh_bot, w: 40, h: bottomH - sh_bot, type: "block" });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: "middle",
        width: 50
      });
    }
    for (let i = 0; i < 10; i++) {
      const size = 80 + i * 10;
      const positions = ["top", "middle", "bottom"];
      const pos = positions[i % 3];
      let dy = playH / 2 - size / 2;
      if (pos === "top") dy = size / 2 + 20;
      if (pos === "bottom") dy = playH - size - 20;
      this.patterns.push({
        obstacles: [{ dx: 0, dy, w: size, h: size, type: "saw" }],
        requiredY: pos === "top" ? "bottom" : pos === "bottom" ? "top" : i % 2 === 0 ? "top" : "bottom",
        width: size + 30
      });
    }
    for (let i = 0; i < 10; i++) {
      const count = 2 + Math.floor(i / 3);
      const obs = [];
      const h = 50;
      const sh = Math.min(h, SPIKE_H);
      const bh = h - sh;
      for (let j = 0; j < count; j++) {
        if (bh > 0) obs.push({ dx: j * 40, dy: playH - bh, w: 35, h: bh, type: "block" });
        obs.push({ dx: j * 40, dy: playH - h, w: 35, h: sh, type: "spike" });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: "top",
        width: count * 40 + 20
      });
    }
    for (let i = 0; i < 10; i++) {
      const count = 2 + Math.floor(i / 3);
      const obs = [];
      const h = 50;
      const sh = Math.min(h, SPIKE_H);
      const bh = h - sh;
      for (let j = 0; j < count; j++) {
        obs.push({ dx: j * 40, dy: 0, w: 35, h: sh, type: "spike" });
        if (bh > 0) obs.push({ dx: j * 40, dy: sh, w: 35, h: bh, type: "block" });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: "bottom",
        width: count * 40 + 20
      });
    }
    for (let i = 0; i < 10; i++) {
      const obs = [];
      const h = 100 + i * 12;
      const sh = Math.min(h, SPIKE_H);
      const bh = h - sh;
      obs.push({ dx: 0, dy: playH - h, w: 45, h: sh, type: "spike" });
      if (bh > 0) obs.push({ dx: 0, dy: playH - bh, w: 45, h: bh, type: "block" });
      obs.push({ dx: 60, dy: 0, w: 45, h: sh, type: "spike" });
      if (bh > 0) obs.push({ dx: 60, dy: sh, w: 45, h: bh, type: "block" });
      if (i >= 5) {
        obs.push({ dx: 120, dy: playH - h, w: 45, h: sh, type: "spike" });
        if (bh > 0) obs.push({ dx: 120, dy: playH - bh, w: 45, h: bh, type: "block" });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: "middle",
        width: i >= 5 ? 180 : 120
      });
    }
    for (let i = 0; i < 10; i++) {
      const gapY = 40 + i * 35;
      const baseGapH = (100 - i * 4) * blockGapFactor;
      const gapH = Math.max(MIN_GAP, baseGapH * gapMultiplier);
      this.patterns.push({
        obstacles: [
          { dx: 0, dy: 0, w: 40, h: gapY, type: "block" },
          { dx: 0, dy: gapY + gapH, w: 40, h: Math.max(0, playH - gapY - gapH), type: "block" }
        ],
        requiredY: gapY < playH / 3 ? "top" : gapY > playH * 2 / 3 - gapH ? "bottom" : "middle",
        width: 50,
        type: "corridor"
      });
    }
    for (let i = 0; i < 10; i++) {
      const obs = [];
      const h = 70;
      const sh = Math.min(h, SPIKE_H);
      const bh = h - sh;
      if (i % 2 === 0) {
        obs.push({ dx: 0, dy: playH - h, w: 50, h: sh, type: "spike" });
        if (bh > 0) obs.push({ dx: 0, dy: playH - bh, w: 50, h: bh, type: "block" });
        obs.push({ dx: -20, dy: 0, w: 15, h: 20, type: "mini_spike" });
        obs.push({ dx: 55, dy: 0, w: 15, h: 20, type: "mini_spike" });
      } else {
        obs.push({ dx: 0, dy: 0, w: 50, h: sh, type: "spike" });
        if (bh > 0) obs.push({ dx: 0, dy: sh, w: 50, h: bh, type: "block" });
        obs.push({ dx: -20, dy: playH - 20, w: 15, h: 20, type: "mini_spike" });
        obs.push({ dx: 55, dy: playH - 20, w: 15, h: 20, type: "mini_spike" });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: i % 2 === 0 ? "top" : "bottom",
        width: 80
      });
    }
    for (let i = 0; i < 10; i++) {
      const h = 15;
      const w = 200;
      const positions = ["top", "middle", "bottom"];
      const pos = positions[i % 3];
      let dy = playH / 2 - h / 2;
      if (pos === "top") dy = 60;
      if (pos === "bottom") dy = playH - 60 - h;
      this.patterns.push({
        obstacles: [{ dx: 0, dy, w, h, type: "laser" }],
        requiredY: pos === "top" ? "bottom" : pos === "bottom" ? "top" : i % 2 === 0 ? "top" : "bottom",
        width: w + 50,
        type: "laser_pattern"
      });
    }
    for (let i = 0; i < 10; i++) {
      const size = 60;
      const type = i % 2 === 0 ? "saw" : "spike_ball";
      const dy = playH / 2 - size / 2;
      this.patterns.push({
        obstacles: [{
          dx: 0,
          dy,
          w: size,
          h: size,
          type,
          movement: {
            type: "updown",
            range: 100 + i * 10,
            speed: 1 + i * 0.25,
            phase: i * Math.PI / 4
          }
        }],
        requiredY: "middle",
        width: 100,
        type: "moving_hazard"
      });
    }
    for (let i = 0; i < 10; i++) {
      const count = 3 + Math.floor(i / 3);
      const obs = [];
      for (let j = 0; j < count; j++) {
        const dy = 50 + j * 120 % (playH - 100);
        obs.push({ dx: j * 80, dy, w: 40, h: 40, type: "spike_ball" });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: "middle",
        width: count * 80,
        type: "spike_ball_field"
      });
    }
    for (let i = 0; i < 10; i++) {
      const w = 15;
      const xOffset = 0;
      const gapY = 100 + i * 100 % (playH - 200);
      const gapH = 150;
      this.patterns.push({
        obstacles: [
          { dx: xOffset, dy: 0, w, h: gapY, type: "v_laser" },
          { dx: xOffset, dy: gapY + gapH, w, h: playH - (gapY + gapH), type: "v_laser" }
        ],
        requiredY: gapY < playH / 3 ? "top" : gapY > playH * 2 / 3 - gapH ? "bottom" : "middle",
        width: 100,
        type: "vertical_laser_pattern"
      });
    }
    for (let i = 0; i < 10; i++) {
      const count = 2 + Math.floor(i / 2);
      const obs = [];
      for (let j = 0; j < count; j++) {
        const dy = 100 + Math.random() * (playH - 200);
        const dx = j * 60;
        obs.push({
          dx,
          dy,
          w: 30,
          h: 30,
          type: "mine",
          movement: { type: "updown", range: 30, speed: 2 + Math.random(), phase: j }
        });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: "middle",
        width: count * 60 + 50,
        type: "mine_field"
      });
    }
    for (let i = 0; i < 10; i++) {
      const size = 120;
      const cy = playH / 2 - size / 2;
      const obs = [];
      obs.push({
        dx: 0,
        dy: cy,
        w: 200,
        h: 30,
        type: "block",
        angle: 0,
        movement: { type: "rotate", range: 360, speed: 1.5 + i * 0.1, phase: 0 }
      });
      this.patterns.push({
        obstacles: obs,
        requiredY: i % 2 === 0 ? "top" : "bottom",
        width: 250,
        type: "spinning_bar"
      });
    }
    for (let i = 0; i < 10; i++) {
      const obs = [];
      const cy = playH / 2 - 25;
      obs.push({ dx: 50, dy: cy, w: 50, h: 50, type: "orb" });
      obs.push({ dx: 50, dy: 0, w: 50, h: 60, type: "spike" });
      obs.push({ dx: 50, dy: playH - 60, w: 50, h: 60, type: "spike" });
      this.patterns.push({
        obstacles: obs,
        requiredY: "middle",
        // 오브와 가시 사이 틈으로 지나가야 함? 
        // 사실 오브는 죽는거니까 오브 위나 아래로 지나가야 하는데 위아래 가시가 있음.
        // 오브가 작으니까(50) 틈이 있음.
        width: 150
      });
    }
    for (let i = 0; i < 10; i++) {
      const obs = [];
      const cy = playH / 2 - 20;
      obs.push({
        dx: 0,
        dy: cy,
        w: 240,
        h: 40,
        type: "block",
        movement: { type: "rotate", range: 360, speed: 2, phase: 0 }
      });
      obs.push({
        dx: 0,
        dy: cy,
        w: 240,
        h: 40,
        type: "block",
        movement: { type: "rotate", range: 360, speed: 2, phase: Math.PI / 2 }
      });
      this.patterns.push({
        obstacles: obs,
        requiredY: "middle",
        width: 300,
        type: "windmill"
      });
    }
    for (let i = 0; i < 10; i++) {
      const obs = [];
      const count = 3 + i % 3;
      for (let j = 0; j < count; j++) {
        obs.push({
          dx: j * 40,
          dy: 100 + j * 80 % (playH - 200),
          w: 25,
          h: 25,
          type: "mine"
        });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: "middle",
        width: count * 40,
        type: "mine_cluster"
      });
    }
    for (let i = 0; i < 10; i++) {
      const obs = [];
      const count = 4;
      for (let j = 0; j < count; j++) {
        obs.push({
          dx: j * 50,
          dy: 50 + j * 150 % (playH - 100),
          w: 30,
          h: 30,
          type: "orb"
        });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: "middle",
        width: count * 50,
        type: "orb_field"
      });
    }
  }
  reset() {
    this.playerX = 200;
    this.playerY = 360;
    this.cameraX = 0;
    this.isHolding = false;
    this.isPlaying = false;
    this.isDead = false;
    this.failReason = "";
    this.score = 0;
    this.progress = 0;
    this.trail = [];
    this.particles = [];
    this.obstacles = [];
    this.portals = [];
    this.isGravityInverted = false;
    this.baseSpeed = this.getDynamicBaseSpeed();
    this.waveSpeed = this.baseSpeed * this.speedMultiplier;
    this.waveAmplitude = this.baseSpeed;
    this.showHitboxes = false;
    this.isMini = false;
    this.waveAngle = 45;
    this.playerSize = this.basePlayerSize;
    this.aiStateTimer = 0;
    this.aiPredictedPath = [];
    this.lastAutoplayIndex = 0;
  }
  setMapConfig(config) {
    this.mapConfig = { ...this.mapConfig, ...config };
  }
  loadMapData(mapData) {
    this.obstacles = mapData.engineObstacles.map((o) => ({ ...o }));
    this.portals = mapData.enginePortals.map((p) => ({ ...p, activated: false }));
    this.autoplayLog = mapData.autoplayLog ? [...mapData.autoplayLog] : [];
    this.totalLength = mapData.duration * this.baseSpeed + 500;
    this.lastAutoplayIndex = 0;
    console.log(`[loadMapData] Loaded ${this.obstacles.length} obstacles, ${this.portals.length} portals, ${this.autoplayLog.length} autoplay points`);
  }
  // 한 마디 길이 (초)
  /**
   * patterns.
   * @param offsetAttempt 외부에서 재시도를 관리할 때 사용하는 시도 횟수 오프셋
   * @param bpm 노래의 BPM (분당 박자 수)
   * @param measureLength 한 마디 길이 (초)
   */
  /**
   * 새로운 맵 생성 로직: 동선 우선 생성 방식
   * 1. 비트 타이밍에 맞춰 클릭/릴리즈를 번갈아가며 동선(autoplayLog)을 먼저 계산
   * 2. 마디마다 포탈을 배치  
   * 3. 동선을 따라가다가 동선에서 벗어나면 충돌하도록 장애물 배치
   * 4. AI 경로 검증 불필요 - 동선이 이미 안전하게 설계됨
   * @param resumeOptions (Optional) 이전 생성 결과에서 특정 지점까지 유지하고 그 이후부터 재생성
   */
  generateMap(beatTimes, sections, duration, fixedSeed, verify = true, offsetAttempt = 0, bpm = 120, measureLength = 2, volumeProfile, resumeOptions) {
    this.bpm = bpm;
    this.measureLength = measureLength;
    const seed = fixedSeed || beatTimes.length * 777 + Math.floor(duration * 100);
    this.obstacles = [];
    this.portals = [];
    if (resumeOptions) {
      console.log(`[MapGen] Resuming generation from time ${resumeOptions.time.toFixed(2)}s`);
    }
    this.beatTimes = beatTimes || [];
    this.beatTimes = beatTimes || [];
    this.trackDuration = duration;
    this.totalLength = duration * this.baseSpeed + 2e3;
    this.autoplayLog = [];
    const generator = new MapGenerator();
    const difficulty = this.mapConfig.difficulty;
    console.log(`[MapGen] Procedural Generation with seed: ${seed}, Difficulty: ${difficulty}`);
    const rng = this.seededRandom(seed + offsetAttempt);
    const stateEvents = this.generatePathBasedMap(beatTimes, sections, rng, volumeProfile, resumeOptions);
    this.lastStateEvents = stateEvents;
    let startX = 0;
    if (resumeOptions) {
      const point = this.autoplayLog.find((p) => p.time >= resumeOptions.time);
      if (point) startX = point.x;
      const keepX = startX;
      this.obstacles = resumeOptions.obstacles.filter((o) => o.x + o.width <= keepX);
      this.portals = resumeOptions.portals.filter((p) => p.x + p.width <= keepX);
    } else {
      this.obstacles = [];
      this.portals = [];
    }
    let pathForGen = this.autoplayLog;
    if (resumeOptions && startX > 0) {
      pathForGen = this.autoplayLog.filter((p) => p.x >= startX);
    }
    const mapObjects = generator.generateFromPath(pathForGen, difficulty, beatTimes, stateEvents);
    for (const obj of mapObjects) {
      if (["gravity_yellow", "gravity_blue", "speed_0.25", "speed_0.5", "speed_1", "speed_2", "speed_3", "speed_4", "mini_pink", "mini_green"].includes(obj.type)) {
        this.portals.push({
          x: obj.x,
          y: this.minY,
          width: obj.width || 50,
          height: this.maxY - this.minY,
          type: obj.type,
          activated: false
        });
      } else {
        this.obstacles.push({
          x: obj.x,
          y: obj.y,
          width: obj.width || 50,
          height: obj.height || 50,
          type: obj.type,
          angle: obj.rotation || 0,
          movement: obj.movement,
          initialY: obj.y,
          children: obj.children,
          customData: obj.customData
        });
      }
    }
    this.obstacles.sort((a, b) => a.x - b.x);
    this.portals.sort((a, b) => a.x - b.x);
    console.log(`[MapGen] Generated ${this.obstacles.length} obstacles, ${this.portals.length} portals from path`);
  }
  /**
   * 동선 기반 맵 생성
   * 핵심: 비트에 맞춰 클릭/릴리즈를 번갈아가며 동선을 먼저 계산하고,
   * 그 동선에 맞춰 포탈과 장애물을 배치
   */
  generatePathBasedMap(beatTimes, sections, rng, volumeProfile, resumeOptions) {
    const diff = this.mapConfig.difficulty;
    this.maxY - this.minY;
    const dt = 1 / 60;
    const beatLength = 60 / this.bpm;
    const measureDuration = beatLength * 4;
    const measureTimes = [];
    const firstBeat = beatTimes.length > 0 ? Math.max(0.5, beatTimes[0]) : 0.5;
    for (let t = firstBeat; t < this.trackDuration; t += measureDuration) {
      measureTimes.push(t);
    }
    const resumeTime = (resumeOptions == null ? void 0 : resumeOptions.time) || 0;
    console.log(`[MapGen] BPM: ${this.bpm}, Measure Duration: ${measureDuration.toFixed(3)}s, Total Measures: ${measureTimes.length}`);
    const stateEvents = [];
    let currentSpeedType = "speed_1";
    let currentInverted = false;
    let currentMini = false;
    const initialEvents = [{
      time: 0.5,
      // 첫 비트 근처
      speedType: "speed_1",
      // 기본값
      isInverted: false,
      isMini: false
    }];
    const initialEvent = initialEvents[0];
    if (diff >= 5 && initialEvent) {
      const r = rng();
      if (r < 0.3) initialEvent.speedType = "speed_0.5";
      else if (r < 0.6) initialEvent.speedType = "speed_2";
    }
    stateEvents.push(...initialEvents);
    if (initialEvents[0]) {
      currentSpeedType = initialEvents[0].speedType;
    }
    if (resumeOptions) {
      const keptEvents = resumeOptions.stateEvents.filter((e) => e.time < resumeTime);
      stateEvents.length = 0;
      stateEvents.push(...keptEvents);
      if (stateEvents.length > 0) {
        const last = stateEvents[stateEvents.length - 1];
        if (last) {
          currentSpeedType = last.speedType;
          currentInverted = last.isInverted;
          currentMini = last.isMini;
        }
      }
    }
    for (const measureTime of measureTimes) {
      if (measureTime < 1) continue;
      if (measureTime < resumeTime) continue;
      const section = sections == null ? void 0 : sections.find((s) => measureTime >= s.startTime && measureTime < s.endTime);
      (section == null ? void 0 : section.intensity) || 0.5;
      let newSpeedType;
      if (diff < 8) {
        const r = rng();
        if (r < 0.8) newSpeedType = "speed_1";
        else if (r < 0.9) newSpeedType = "speed_0.5";
        else newSpeedType = "speed_2";
      } else if (diff < 16) {
        const r = rng();
        if (r < 0.1) newSpeedType = "speed_0.5";
        else if (r < 0.6) newSpeedType = "speed_1";
        else newSpeedType = "speed_2";
      } else if (diff < 24) {
        const r = rng();
        if (r < 0.15) newSpeedType = "speed_0.5";
        else if (r < 0.4) newSpeedType = "speed_1";
        else if (r < 0.8) newSpeedType = "speed_2";
        else newSpeedType = "speed_3";
      } else {
        const r = rng();
        if (r < 0.1) newSpeedType = "speed_0.25";
        else if (r < 0.25) newSpeedType = "speed_0.5";
        else if (r < 0.4) newSpeedType = "speed_1";
        else if (r < 0.5) newSpeedType = "speed_2";
        else if (r < 0.8) newSpeedType = "speed_3";
        else newSpeedType = "speed_4";
      }
      const gravityChance = diff >= 24 ? 0.9 : diff < 8 ? 0.25 : 0.5;
      let newInverted = currentInverted;
      if (rng() < gravityChance && diff >= 3) {
        newInverted = rng() > 0.5;
      }
      let newMini = currentMini;
      if (diff >= 5) {
        if (!currentMini) {
          const miniEntryChance = diff >= 24 ? 0.08 : 0.04;
          if (rng() < miniEntryChance) newMini = true;
        } else {
          const miniExitChance = 0.6;
          if (rng() < miniExitChance) newMini = false;
        }
      } else {
        newMini = false;
      }
      if (newSpeedType !== currentSpeedType || newInverted !== currentInverted || newMini !== currentMini) {
        stateEvents.push({
          time: measureTime,
          speedType: newSpeedType,
          isInverted: newInverted,
          isMini: newMini
        });
        currentSpeedType = newSpeedType;
        currentInverted = newInverted;
        currentMini = newMini;
      }
    }
    const beatActions = [];
    if (resumeOptions) {
      beatActions.push(...resumeOptions.beatActions.filter((b) => b.time < resumeTime));
    }
    const sortedBeats = [...beatTimes].filter((t) => t >= 0.3 && t >= resumeTime).sort((a, b) => a - b);
    let isHolding = false;
    if (resumeOptions && resumeOptions.beatActions.length > 0) {
      const lastAction = resumeOptions.beatActions[resumeOptions.beatActions.length - 1];
      if (lastAction.action === "click") {
        isHolding = true;
      }
    }
    const fastThreshold = 0.25;
    for (let i = 0; i < sortedBeats.length; i++) {
      const beatTime = sortedBeats[i];
      const nextBeatTime = i + 1 < sortedBeats.length ? sortedBeats[i + 1] : beatTime + 1;
      const interval = nextBeatTime - beatTime;
      if (interval < fastThreshold) {
        beatActions.push({ time: beatTime, action: isHolding ? "release" : "click" });
        isHolding = !isHolding;
      } else {
        if (isHolding) {
          const baseFactor = 0.5;
          const variance = (rng() - 0.5) * 0.3;
          const holdFactor = Math.max(0.3, Math.min(0.8, baseFactor + variance));
          beatActions.push({ time: beatTime, action: "click" });
          beatActions.push({ time: beatTime + interval * holdFactor, action: "release" });
          isHolding = false;
        } else {
          const baseFactor = 0.5;
          const variance = (rng() - 0.5) * 0.3;
          const holdFactor = Math.max(0.3, Math.min(0.8, baseFactor + variance));
          beatActions.push({ time: beatTime, action: "click" });
          beatActions.push({ time: beatTime + interval * holdFactor, action: "release" });
          isHolding = false;
        }
      }
    }
    beatActions.sort((a, b) => a.time - b.time);
    const cleanedActions = [];
    for (const act of beatActions) {
      if (cleanedActions.length > 0) {
        const last = cleanedActions[cleanedActions.length - 1];
        if (act.time - last.time < 0.01) {
          cleanedActions.pop();
        }
      }
      cleanedActions.push(act);
    }
    beatActions.length = 0;
    beatActions.push(...cleanedActions);
    beatActions.sort((a, b) => a.time - b.time);
    const dedupedActions = [];
    for (const action of beatActions) {
      const last = dedupedActions[dedupedActions.length - 1];
      if (!last || Math.abs(last.time - action.time) > 0.03 || last.action !== action.action) {
        dedupedActions.push(action);
      }
    }
    beatActions.length = 0;
    beatActions.push(...dedupedActions);
    this.autoplayLog = [];
    let simX = 200;
    let simY = 360;
    let simTime = 0;
    let simHolding = false;
    let simGravity = false;
    let simSpeed = 1;
    let simMini = false;
    let simAngle = 45;
    let beatActionIdx = 0;
    let stateEventIdx = 0;
    while (simTime < this.trackDuration + 1) {
      while (stateEventIdx < stateEvents.length && stateEvents[stateEventIdx].time <= simTime) {
        const se = stateEvents[stateEventIdx];
        simSpeed = this.getSpeedMultiplierFromType(se.speedType);
        simGravity = se.isInverted;
        simMini = se.isMini;
        simAngle = this.getEffectiveAngle(simMini, simSpeed);
        stateEventIdx++;
      }
      while (beatActionIdx < beatActions.length && beatActions[beatActionIdx].time <= simTime) {
        const ba = beatActions[beatActionIdx];
        simHolding = ba.action === "click";
        beatActionIdx++;
      }
      const spd = this.baseSpeed * simSpeed;
      const amp = spd * Math.tan(simAngle * Math.PI / 180);
      let vy;
      if (simGravity) {
        vy = simHolding ? 1 : -1;
      } else {
        vy = simHolding ? -1 : 1;
      }
      simY += amp * vy * dt;
      const margin = 70;
      if (simY < this.minY + margin) simY = this.minY + margin;
      if (simY > this.maxY - margin) simY = this.maxY - margin;
      simX += spd * dt;
      this.autoplayLog.push({
        x: simX,
        y: simY,
        holding: simHolding,
        time: simTime
      });
      simTime += dt;
    }
    this.lastBeatActions = beatActions;
    this.totalLength = simX + 500;
    for (const se of stateEvents) {
      const pathPoint = this.autoplayLog.find((p) => Math.abs(p.time - se.time) < 0.02);
      if (!pathPoint) continue;
      const portalTypes = [];
      const prevEvent = stateEvents[stateEvents.indexOf(se) - 1];
      const prevSpeed = (prevEvent == null ? void 0 : prevEvent.speedType) || "speed_1";
      const prevInverted = (prevEvent == null ? void 0 : prevEvent.isInverted) || false;
      const prevMini = (prevEvent == null ? void 0 : prevEvent.isMini) || false;
      if (se.speedType !== prevSpeed) {
        portalTypes.push(se.speedType);
      }
      if (se.isInverted !== prevInverted) {
        portalTypes.push(se.isInverted ? "gravity_yellow" : "gravity_blue");
      }
      if (se.isMini !== prevMini) {
        portalTypes.push(se.isMini ? "mini_pink" : "mini_green");
      }
      if (portalTypes.length > 0) {
        this.generatePathAlignedPortals(pathPoint.x, pathPoint.y, portalTypes);
      }
    }
    return stateEvents;
  }
  /**
   * 동선에 맞춰 포탈 배치 (정상 크기, 경로 사이에 배치)
   */
  generatePathAlignedPortals(xPos, pathY, types) {
    const portalWidth = 64;
    const portalHeight = 240;
    const horizontalSpacing = 80;
    types.forEach((type, horizontalIndex) => {
      const currentX = xPos + horizontalIndex * (portalWidth + horizontalSpacing);
      const portalY = pathY - portalHeight / 2;
      this.portals.push({
        x: currentX,
        y: this.minY,
        width: portalWidth,
        height: this.maxY - this.minY,
        type,
        activated: false
      });
      if (this.mapConfig.difficulty <= 2) return;
      const topWallHeight = portalY - this.minY - 20;
      if (topWallHeight > 20) {
        this.obstacles.push({
          x: currentX - 5,
          y: this.minY,
          width: portalWidth + 10,
          height: topWallHeight,
          type: "block",
          initialY: this.minY
        });
      }
      const bottomWallStart = portalY + portalHeight + 20;
      const bottomWallHeight = this.maxY - bottomWallStart;
      if (bottomWallHeight > 20) {
        this.obstacles.push({
          x: currentX - 5,
          y: bottomWallStart,
          width: portalWidth + 10,
          height: bottomWallHeight,
          type: "block",
          initialY: bottomWallStart
        });
      }
    });
  }
  /**
   * 장애물이 동선과 충돌하는지 검사
   * @returns true if safe (no collision), false if collides with path
   */
  /**
   * 장애물이 동선과 충돌하는지 검사 (Binary Search Optimized)
   * @returns true if safe (no collision), false if collides with path
   */
  isObstacleSafe(obsX, obsY, obsW, obsH, margin = 0) {
    const playerSize = this.basePlayerSize + margin;
    const checkMinX = obsX - playerSize;
    const checkMaxX = obsX + obsW + playerSize;
    let l = 0, r = this.autoplayLog.length;
    while (l < r) {
      const mid = l + r >>> 1;
      if (this.autoplayLog[mid].x < checkMinX) l = mid + 1;
      else r = mid;
    }
    const startIndex = l;
    for (let i = startIndex; i < this.autoplayLog.length; i++) {
      const point = this.autoplayLog[i];
      if (point.x > checkMaxX) break;
      if (point.y >= obsY - playerSize && point.y <= obsY + obsH + playerSize) {
        return false;
      }
    }
    return true;
  }
  /**
   * 동선 강제를 위한 장애물 배치 (체계적인 패턴 사용)
   * 패턴: 블록/레이저 벽, 기울어진 블록, 이동 장애물
   * 미니 상태: 60도 기울어진 블록만 사용
   */
  placeObstaclesForPath(beatActions, stateEvents, rng, diff) {
    const normDiff = Math.max(0.1, diff / 30);
    const pRadius = this.basePlayerSize;
    let currentSpeed = 1;
    let isMini = false;
    const portalStates = [];
    this.portals.forEach((p) => {
      if (p.type === "mini_pink") {
        portalStates.push({ x: p.x, isMini: true, speed: currentSpeed });
      } else if (p.type === "mini_green") {
        portalStates.push({ x: p.x, isMini: false, speed: currentSpeed });
      } else if (p.type.startsWith("speed_")) {
        const speedVal = parseFloat(p.type.replace("speed_", ""));
        portalStates.push({ x: p.x, isMini, speed: speedVal });
      }
    });
    portalStates.sort((a, b) => a.x - b.x);
    const getSpacingMultiplier = (speed) => {
      if (speed <= 0.5) return 0.4;
      if (speed <= 1) return 1;
      if (speed <= 2) return 1.5;
      return 2;
    };
    const getSafeMargin = () => {
      const baseMargin = Math.max(pRadius + 5, 50 - normDiff * 35);
      return isMini ? baseMargin * 0.5 : baseMargin;
    };
    const sectionLength = 800;
    let lastPatternX = 400;
    console.log(`[MapGen] Starting path obstacle placement - Diff: ${diff}`);
    for (let x = 500; x < this.totalLength - 300; x += 100) {
      const pathPoint = this.autoplayLog.find((p) => Math.abs(p.x - x) < 50);
      if (!pathPoint) continue;
      const simTime = pathPoint.time;
      const currentEvent = [...stateEvents].reverse().find((e) => e.time <= simTime);
      if (currentEvent) {
        isMini = currentEvent.isMini;
        currentSpeed = this.getSpeedMultiplierFromType(currentEvent.speedType);
      }
      const pathY = pathPoint.y;
      const safeMargin = getSafeMargin();
      const spacingMult = getSpacingMultiplier(currentSpeed);
      if (x - lastPatternX < 150 * spacingMult) continue;
      if (isMini) {
        this.placeTiltedBlock(x, pathY, safeMargin, 60, rng);
        lastPatternX = x;
        continue;
      }
      const patternType = Math.floor((x - 500) / sectionLength) % 4;
      if (patternType === 0) {
        this.placeBlockWall(x, pathY, safeMargin, rng);
        lastPatternX = x;
      } else if (patternType === 1) {
        this.placeTiltedBlock(x, pathY, safeMargin, 45, rng);
        lastPatternX = x;
      } else if (patternType === 2) {
        this.placeLaserWall(x, pathY, safeMargin, rng);
        lastPatternX = x;
      } else {
        if (diff >= 10) {
          this.placeMovingObstacle(x, pathY, safeMargin, pathPoint.time, rng);
          lastPatternX = x;
        } else {
          this.placeBlockWall(x, pathY, safeMargin, rng);
          lastPatternX = x;
        }
      }
      const nearBeat = beatActions.find((b) => Math.abs(b.time * this.baseSpeed + 200 - x) < 100);
      if (nearBeat && rng() < 0.3 + normDiff * 0.3) {
        this.placeRapidBlocks(x, pathY, safeMargin, 3, rng);
      }
    }
  }
  // Override or Disable internal obstacle placement in generatePathBasedMap
  // Actually, generatePathBasedMap is called BY generateMap.
  // We can just comment out the call to placeObstaclesForPath inside generatePathBasedMap.
  // But wait, generatePathBasedMap definition is below. Let's find where it calls placeObstaclesForPath.
  /**
   * 블록 벽 배치 (위/아래)
   */
  placeBlockWall(x, pathY, safeMargin, rng) {
    const wallWidth = 50 + Math.floor(rng() * 30);
    const topHeight = pathY - safeMargin - this.minY;
    if (topHeight > 30 && this.isObstacleSafe(x, this.minY, wallWidth, topHeight, 3)) {
      this.obstacles.push({
        x,
        y: this.minY,
        width: wallWidth,
        height: topHeight,
        type: "block",
        initialY: this.minY
      });
    }
    const bottomStart = pathY + safeMargin;
    const bottomHeight = this.maxY - bottomStart;
    if (bottomHeight > 30 && this.isObstacleSafe(x, bottomStart, wallWidth, bottomHeight, 3)) {
      this.obstacles.push({
        x,
        y: bottomStart,
        width: wallWidth,
        height: bottomHeight,
        type: "block",
        initialY: bottomStart
      });
    }
  }
  /**
   * 기울어진 블록 배치 - 웨이브 방향에 맞춘 코리도(통로) 형성
   * 이미지 참조: 위로 올라갈 때와 아래로 내려갈 때 다른 방향의 슬로프
   */
  placeTiltedBlock(x, pathY, safeMargin, angle, rng) {
    const blockSize = 100 + Math.floor(rng() * 50);
    const prevPoint = this.autoplayLog.find((p) => Math.abs(p.x - (x - 100)) < 60);
    const nextPoint = this.autoplayLog.find((p) => Math.abs(p.x - (x + 100)) < 60);
    let goingUp = true;
    if (prevPoint && nextPoint) {
      goingUp = nextPoint.y < prevPoint.y;
    } else if (prevPoint) {
      goingUp = pathY < prevPoint.y;
    }
    const topY = pathY - safeMargin - blockSize;
    if (topY > this.minY && this.isObstacleSafe(x, topY, blockSize, blockSize, 3)) {
      this.obstacles.push({
        x,
        y: topY,
        width: blockSize,
        height: blockSize,
        type: "slope",
        initialY: topY,
        angle: goingUp ? angle : -angle
        // 올라갈 때: 양수(왼쪽 하단), 내려갈 때: 음수(오른쪽 하단)
      });
    }
    const bottomY = pathY + safeMargin;
    if (bottomY + blockSize < this.maxY && this.isObstacleSafe(x, bottomY, blockSize, blockSize, 3)) {
      this.obstacles.push({
        x,
        y: bottomY,
        width: blockSize,
        height: blockSize,
        type: "slope",
        initialY: bottomY,
        angle: goingUp ? -angle : angle
        // 올라갈 때: 음수(오른쪽 상단), 내려갈 때: 양수(왼쪽 상단)
      });
    }
    if (rng() < 0.3) {
      const sawSize = 40 + Math.floor(rng() * 30);
      const sawX = x + blockSize + 30;
      const sawY = pathY - sawSize / 2;
      if (this.isObstacleSafe(sawX, sawY, sawSize, sawSize, 3)) {
        this.obstacles.push({
          x: sawX,
          y: sawY,
          width: sawSize,
          height: sawSize,
          type: "spike_ball",
          initialY: sawY
        });
      }
    }
  }
  /**
   * 레이저 벽 배치
   */
  placeLaserWall(x, pathY, safeMargin, rng) {
    const laserWidth = 30;
    const topHeight = pathY - safeMargin - this.minY - 20;
    if (topHeight > 50) {
      this.obstacles.push({
        x: x + 10,
        y: this.minY,
        width: laserWidth,
        height: topHeight,
        type: "v_laser",
        initialY: this.minY
      });
    }
    const bottomStart = pathY + safeMargin + 20;
    const bottomHeight = this.maxY - bottomStart;
    if (bottomHeight > 50) {
      this.obstacles.push({
        x: x + 10,
        y: bottomStart,
        width: laserWidth,
        height: bottomHeight,
        type: "v_laser",
        initialY: bottomStart
      });
    }
  }
  /**
   * 이동하는 장애물 배치 (사전 계산된 위치)
   */
  placeMovingObstacle(x, pathY, safeMargin, time, rng) {
    const obsSize = 40 + Math.floor(rng() * 20);
    const moveRange = 80 + Math.floor(rng() * 60);
    const moveSpeed = 1.5 + rng() * 1.5;
    const topBaseY = pathY - safeMargin - obsSize - 30;
    if (topBaseY > this.minY + moveRange) {
      this.obstacles.push({
        x,
        y: topBaseY,
        width: obsSize,
        height: obsSize,
        type: "saw",
        initialY: topBaseY,
        moveY: { range: moveRange, speed: moveSpeed }
      });
    }
    const bottomBaseY = pathY + safeMargin + 30;
    if (bottomBaseY + obsSize + moveRange < this.maxY) {
      this.obstacles.push({
        x,
        y: bottomBaseY,
        width: obsSize,
        height: obsSize,
        type: "spike_ball",
        initialY: bottomBaseY,
        moveY: { range: moveRange, speed: moveSpeed }
      });
    }
  }
  /**
   * 연타 블록 배치 (빠른 비트용)
   */
  placeRapidBlocks(startX, pathY, safeMargin, count, rng) {
    const blockWidth = 30;
    const gap = 60;
    for (let i = 0; i < count; i++) {
      const x = startX + i * gap;
      const isTop = i % 2 === 0;
      if (isTop) {
        const topHeight = pathY - safeMargin - this.minY;
        if (topHeight > 20 && this.isObstacleSafe(x, this.minY, blockWidth, topHeight, 2)) {
          this.obstacles.push({
            x,
            y: this.minY,
            width: blockWidth,
            height: topHeight,
            type: "block",
            initialY: this.minY
          });
        }
      } else {
        const bottomStart = pathY + safeMargin;
        const bottomHeight = this.maxY - bottomStart;
        if (bottomHeight > 20 && this.isObstacleSafe(x, bottomStart, blockWidth, bottomHeight, 2)) {
          this.obstacles.push({
            x,
            y: bottomStart,
            width: blockWidth,
            height: bottomHeight,
            type: "block",
            initialY: bottomStart
          });
        }
      }
    }
  }
  /**
   * 작은 장애물 타입 (동선 강제용) - 다양한 타입 사용
   */
  getSmallObstacleType(rng, diff) {
    const r = rng();
    if (diff < 8) {
      if (r < 0.4) return "spike";
      if (r < 0.7) return "mini_spike";
      return "orb";
    } else if (diff < 16) {
      if (r < 0.25) return "spike";
      if (r < 0.4) return "saw";
      if (r < 0.55) return "orb";
      if (r < 0.7) return "mini_spike";
      if (r < 0.85) return "spike_ball";
      return "mine";
    } else if (diff < 24) {
      if (r < 0.2) return "spike";
      if (r < 0.35) return "saw";
      if (r < 0.5) return "spike_ball";
      if (r < 0.65) return "mine";
      if (r < 0.8) return "orb";
      return "laser";
    } else {
      if (r < 0.15) return "spike";
      if (r < 0.25) return "saw";
      if (r < 0.4) return "spike_ball";
      if (r < 0.55) return "mine";
      if (r < 0.7) return "orb";
      if (r < 0.85) return "laser";
      return "v_laser";
    }
  }
  /**
   * 난이도에 따른 랜덤 장애물 타입
   */
  getRandomObstacleType(rng, diff) {
    if (diff < 8) {
      return rng() > 0.5 ? "block" : "spike";
    } else if (diff < 16) {
      const types = ["block", "spike", "saw", "mini_spike"];
      return types[Math.floor(rng() * types.length)];
    } else if (diff < 24) {
      const types = ["block", "spike", "saw", "laser", "spike_ball"];
      return types[Math.floor(rng() * types.length)];
    } else {
      const types = ["block", "spike", "saw", "laser", "spike_ball", "mine", "orb", "v_laser"];
      return types[Math.floor(rng() * types.length)];
    }
  }
  /**
   * 난이도에 따른 장식 장애물 타입
   */
  getRandomDecorationType(rng, diff) {
    if (diff < 16) {
      const types = ["mini_spike", "orb"];
      return types[Math.floor(rng() * types.length)];
    } else {
      const types = ["mine", "spike_ball", "saw", "orb"];
      return types[Math.floor(rng() * types.length)];
    }
  }
  getSpeedMultiplierFromType(type) {
    if (type === "speed_0.25") return Math.sqrt(0.25);
    if (type === "speed_0.5") return Math.sqrt(0.5);
    if (type === "speed_1") return 1;
    if (type === "speed_2") return Math.sqrt(2);
    if (type === "speed_3") return Math.sqrt(3);
    if (type === "speed_4") return Math.sqrt(4);
    return 1;
  }
  getEffectiveAngle(isMini, speedMultiplier) {
    if (!isMini) return 45;
    if (speedMultiplier >= 1.9) return 78;
    if (speedMultiplier >= 1.7) return 72;
    return 60;
  }
  getValidPatterns(lastPos, rng, lastType) {
    const transitions = {
      "top": ["top", "middle"],
      "middle": ["top", "middle", "bottom"],
      "bottom": ["middle", "bottom"]
    };
    const validPositions = transitions[lastPos] || ["middle"];
    let filtered = this.patterns.filter((p) => validPositions.includes(p.requiredY));
    if (lastType === "corridor") {
      filtered = filtered.filter((p) => p.type !== "corridor");
    }
    return filtered;
  }
  placePattern(pattern, xPos) {
    const baseY = this.minY;
    for (const obs of pattern.obstacles) {
      this.obstacles.push({
        x: xPos + obs.dx,
        y: baseY + obs.dy,
        width: obs.w,
        height: obs.h,
        type: obs.type,
        initialY: baseY + obs.dy
      });
    }
  }
  /**
   * 속도/미니 상태에 따라 크기 조절된 패턴 배치
   * @param gapScale 외부에서 계산된 간격 스케일
   */
  placePatternWithScale(pattern, xPos, speed, isMini, gapScale) {
    const baseY = this.minY;
    const playH = this.maxY - this.minY;
    let sizeScale = 1;
    if (speed > 1.2) sizeScale *= 0.85;
    if (speed < 0.8) sizeScale *= 1.15;
    if (isMini) sizeScale *= 0.75;
    for (const obs of pattern.obstacles) {
      let h = obs.h * sizeScale;
      let w = obs.w * sizeScale;
      let dy = obs.dy;
      const isTopAnchored = obs.dy < playH / 2;
      if (isTopAnchored) {
        dy = obs.dy * sizeScale;
      } else {
        const distFromBottom = playH - (obs.dy + obs.h);
        dy = playH - distFromBottom * sizeScale - h;
      }
      this.obstacles.push({
        x: xPos + obs.dx * gapScale,
        y: baseY + dy,
        width: w,
        height: h,
        type: obs.type,
        angle: obs.angle,
        movement: obs.movement ? { ...obs.movement } : void 0,
        initialY: baseY + dy
      });
    }
  }
  /**
   * 지정된 타입들로 포탈 생성 (비트/섹션에 맞춤)
   * 여러 타입이 올 경우 하나의 블록 세트 안에 나란히 배치
   */
  generatePortalWithType(xPos, firstType, rng, extraTypes = []) {
    const portalHeight = 100;
    const portalWidth = 50;
    const spacing = 40;
    const playH = this.maxY - this.minY;
    const centerY = this.minY + 80 + rng() * (playH - 160);
    const allTypes = [firstType, ...extraTypes];
    const totalWidth = allTypes.length * portalWidth + (allTypes.length - 1) * spacing;
    allTypes.forEach((type, i) => {
      this.portals.push({
        x: xPos + i * (portalWidth + spacing),
        y: centerY - portalHeight / 2,
        width: portalWidth,
        height: portalHeight,
        type,
        activated: false
      });
    });
    const entryMargin = this.basePlayerSize * 2.2;
    const portalTop = centerY - portalHeight / 2;
    const portalBottom = centerY + portalHeight / 2;
    if (portalTop > this.minY + entryMargin) {
      this.obstacles.push({
        x: xPos - 10,
        y: this.minY,
        width: totalWidth + 20,
        height: portalTop - this.minY - entryMargin,
        type: "block",
        initialY: this.minY
      });
    }
    if (portalBottom < this.maxY - entryMargin) {
      this.obstacles.push({
        x: xPos - 10,
        y: portalBottom + entryMargin,
        width: totalWidth + 20,
        height: this.maxY - (portalBottom + entryMargin),
        type: "block",
        initialY: portalBottom + entryMargin
      });
    }
  }
  /**
   * 랜덤 타입으로 포탈 생성 (기존 호환)
   * 난이도에 따라 빠른 속도 포탈 제한
   */
  generatePortal(xPos, rng) {
    let portalTypes = [
      "gravity_yellow",
      "gravity_blue",
      "speed_0.5",
      "speed_1",
      "speed_2",
      "speed_3",
      "speed_4"
    ];
    const diff = this.mapConfig.difficulty;
    if (diff < 8) {
      portalTypes = portalTypes.filter((t) => !["speed_2", "speed_3", "speed_4"].includes(t));
    } else if (diff < 16) {
      portalTypes = portalTypes.filter((t) => !["speed_3", "speed_4"].includes(t));
    } else if (diff < 24) {
      portalTypes = portalTypes.filter((t) => t !== "speed_4");
    }
    const availableTypes = portalTypes.filter((t) => {
      if (t === "gravity_blue") return this.portals.some((p) => p.type === "gravity_yellow");
      return true;
    });
    const type = availableTypes[Math.floor(rng() * availableTypes.length)] || "speed_1";
    this.generatePortalWithType(xPos, type, rng);
  }
  /**
   * 전역 AI 통과 경로 및 오토플레이 로그 생성
   */
  /**
   * 전역 AI 통과 경로 및 오토플레이 로그 생성 (시뮬레이션 기반)
   * 240프레임(약 4초) 앞을 미리 보고 생존과 중앙 유지를 최적화하는 경로를 찾습니다.
   */
  *computeAutoplayLogGen(startX, startY) {
    this.autoplayLog = [];
    this.validationFailureInfo = null;
    const dt = 1 / 30;
    const sortedObs = [...this.obstacles].sort((a, b) => a.x - b.x);
    const sortedPortals = [...this.portals].sort((a, b) => a.x - b.x);
    const findStartIndex = (minX) => {
      let l = 0, r = sortedObs.length;
      while (l < r) {
        const mid = l + r >>> 1;
        if (sortedObs[mid].x < minX) l = mid + 1;
        else r = mid;
      }
      return l;
    };
    const initialState = {
      x: startX,
      y: startY,
      time: 0,
      g: this.isGravityInverted,
      sm: this.speedMultiplier,
      m: this.isMini,
      wa: this.waveAngle,
      h: false,
      pIdx: 0,
      lastSwitchTime: -1,
      prev: null
    };
    const visited = /* @__PURE__ */ new Set();
    const getVisitedKey = (s) => {
      const xi = Math.floor(s.x / (this.baseSpeed * 0.033));
      const yi = Math.floor(s.y / 12);
      return `${xi}_${yi}_${s.g ? 1 : 0}_${Math.round(s.sm * 10)}_${s.m ? 1 : 0}`;
    };
    const checkColl = (tx, ty, sz, tm, sm, margin = 0) => {
      const startI = findStartIndex(tx - 1e3);
      for (let i = startI; i < sortedObs.length; i++) {
        const o = sortedObs[i];
        if (o.x + o.width < tx - 50) continue;
        if (o.x > tx + 100) break;
        const moveMargin = o.movement ? 2 : 0;
        if (this.checkObstacleCollision(o, tx, ty, sz + margin + moveMargin, tm, sm)) return true;
      }
      return false;
    };
    const checkSurvival = (baseState, testH, frames) => {
      let sx = baseState.x;
      let sy = baseState.y;
      let sg = baseState.g;
      let ssm = baseState.sm;
      let swa = baseState.wa;
      let sm = baseState.m;
      let spIdx = baseState.pIdx;
      let sTime = baseState.time;
      for (let i = 0; i < frames; i++) {
        while (spIdx < sortedPortals.length && sx >= sortedPortals[spIdx].x) {
          const p = sortedPortals[spIdx];
          if (sy >= p.y && sy <= p.y + p.height) {
            if (p.type === "gravity_yellow") sg = true;
            if (p.type === "gravity_blue") sg = false;
            if (p.type.startsWith("speed_")) ssm = this.getSpeedMultiplierFromType(p.type);
            if (p.type === "mini_pink") sm = true;
            if (p.type === "mini_green") sm = false;
            swa = this.getEffectiveAngle(sm, ssm);
          }
          spIdx++;
        }
        const spd = this.baseSpeed * ssm;
        const amp = spd * Math.tan(swa * Math.PI / 180);
        const sz = sm ? this.miniPlayerSize : this.basePlayerSize;
        sx += spd * dt;
        sTime += dt;
        const vy = sg ? testH ? 1 : -1 : testH ? -1 : 1;
        sy += amp * vy * dt;
        if (sy < this.minY + sz) sy = this.minY + sz;
        if (sy > this.maxY - sz) sy = this.maxY - sz;
        if (checkColl(sx, sy, sz, sTime, ssm, 1)) return false;
      }
      return true;
    };
    const stack = [initialState];
    let maxX = startX;
    let loops = 0;
    const maxLoops = 5e5;
    let bestState = null;
    let furthestFailX = startX;
    let failY = startY;
    while (stack.length > 0) {
      loops++;
      const curr = stack.pop();
      if (curr.x > maxX) {
        maxX = curr.x;
      }
      if (loops % 1e3 === 0) yield maxX / this.totalLength;
      if (curr.x >= this.totalLength) {
        bestState = curr;
        break;
      }
      const vkey = getVisitedKey(curr);
      if (visited.has(vkey)) continue;
      visited.add(vkey);
      let nG = curr.g;
      let nSM = curr.sm;
      let nM = curr.m;
      let nWA = curr.wa;
      let npIdx = curr.pIdx;
      while (npIdx < sortedPortals.length && curr.x >= sortedPortals[npIdx].x) {
        const p = sortedPortals[npIdx];
        if (curr.y >= p.y && curr.y <= p.y + p.height) {
          if (p.type === "gravity_yellow") nG = true;
          if (p.type === "gravity_blue") nG = false;
          if (p.type.startsWith("speed_")) nSM = this.getSpeedMultiplierFromType(p.type);
          if (p.type === "mini_pink") nM = true;
          if (p.type === "mini_green") nM = false;
          if (p.type === "teleport_in") {
            const target = this.portals.find((tp) => tp.type === "teleport_out" && (p.linkId ? tp.linkId === p.linkId : tp.x > p.x));
            if (target) {
              curr.x = target.x + target.width + 20;
              curr.y = target.y + target.height / 2;
              npIdx = sortedPortals.findIndex((sp) => sp.x >= curr.x);
              if (npIdx === -1) npIdx = sortedPortals.length;
              break;
            }
          }
          nWA = this.getEffectiveAngle(nM, nSM);
        }
        npIdx++;
      }
      const spd = this.baseSpeed * nSM;
      const amp = spd * Math.tan(nWA * Math.PI / 180);
      const sz = nM ? this.miniPlayerSize : this.basePlayerSize;
      const nT = curr.time + dt;
      const nX = curr.x + spd * dt;
      let nYH = curr.y + amp * (nG ? 1 : -1) * dt;
      let nYR = curr.y + amp * (nG ? -1 : 1) * dt;
      if (nYH < this.minY + sz) nYH = this.minY + sz;
      if (nYH > this.maxY - sz) nYH = this.maxY - sz;
      if (nYR < this.minY + sz) nYR = this.minY + sz;
      if (nYR > this.maxY - sz) nYR = this.maxY - sz;
      let dH = checkColl(nX, nYH, sz, nT, nSM, 3);
      let dR = checkColl(nX, nYR, sz, nT, nSM, 3);
      const vDist = sz * 0.8;
      if (!dH && Math.abs(nYH - curr.y) > vDist) {
        if (checkColl((curr.x + nX) / 2, (curr.y + nYH) / 2, sz, curr.time + dt / 2, nSM, 3)) dH = true;
      }
      if (!dR && Math.abs(nYR - curr.y) > vDist) {
        if (checkColl((curr.x + nX) / 2, (curr.y + nYR) / 2, sz, curr.time + dt / 2, nSM, 3)) dR = true;
      }
      if (dH && dR && nX > furthestFailX) {
        furthestFailX = nX;
        failY = curr.y;
      }
      const prevH = curr.h;
      const lookaheadFrames = 60;
      const MIN_SWITCH_INTERVAL = 0.125 / Math.pow(curr.sm, 0.7);
      const timeSinceLastSwitch = curr.time - curr.lastSwitchTime;
      let isSwitchRestricted = timeSinceLastSwitch < MIN_SWITCH_INTERVAL;
      if (isSwitchRestricted) {
        const currentY = curr.y;
        const distFromCenter = Math.abs(currentY - 360);
        if (distFromCenter > 25) {
          const isGravityInv = curr.g;
          const isHolding = prevH;
          const vy = isGravityInv ? isHolding ? 1 : -1 : isHolding ? -1 : 1;
          const movingAway = currentY > 360 && vy > 0 || currentY < 360 && vy < 0;
          if (movingAway) {
            isSwitchRestricted = false;
          }
        }
      }
      let preferHold = false;
      const isHoldSafe = !dH && checkSurvival({ ...curr, x: nX, y: nYH, time: nT, g: nG, sm: nSM, m: nM, wa: nWA, pIdx: npIdx, lastSwitchTime: prevH ? curr.lastSwitchTime : nT}, true, lookaheadFrames);
      const isReleaseSafe = !dR && checkSurvival({ ...curr, x: nX, y: nYR, time: nT, g: nG, sm: nSM, m: nM, wa: nWA, pIdx: npIdx, lastSwitchTime: !prevH ? curr.lastSwitchTime : nT}, false, lookaheadFrames);
      if (prevH) {
        if (isHoldSafe) preferHold = true;
        else preferHold = false;
      } else {
        if (isReleaseSafe) preferHold = false;
        else preferHold = true;
      }
      if (isHoldSafe && isReleaseSafe) {
        const barriers = [
          { top: -Infinity, bottom: this.minY },
          // 천장 위
          { top: this.maxY, bottom: Infinity }
          // 바닥 아래
        ];
        for (let oi = findStartIndex(nX - 1e3); oi < sortedObs.length; oi++) {
          const o = sortedObs[oi];
          if (o.x + o.width < nX) continue;
          if (o.x > nX) break;
          const range = this.getObstacleYRangeAt(o, nX, nT);
          if (range) {
            barriers.push(range);
          }
        }
        barriers.sort((a, b) => a.top - b.top);
        const merged = [];
        if (barriers.length > 0) {
          let current = { ...barriers[0] };
          for (let i = 1; i < barriers.length; i++) {
            const next = barriers[i];
            if (next.top <= current.bottom) {
              current.bottom = Math.max(current.bottom, next.bottom);
            } else {
              merged.push(current);
              current = { ...next };
            }
          }
          merged.push(current);
        }
        const gaps = [];
        for (let i = 0; i < merged.length - 1; i++) {
          gaps.push({
            top: merged[i].bottom,
            bottom: merged[i + 1].top
          });
        }
        let targetGap = gaps[0];
        let minDist = Infinity;
        for (const gap of gaps) {
          const mid = (gap.top + gap.bottom) / 2;
          const dist = Math.abs(curr.y - mid);
          if (curr.y >= gap.top && curr.y <= gap.bottom) {
            targetGap = gap;
            break;
          }
          if (dist < minDist) {
            minDist = dist;
            targetGap = gap;
          }
        }
        const targetY = (targetGap.top + targetGap.bottom) / 2;
        const distH = Math.abs(nYH - targetY);
        const distR = Math.abs(nYR - targetY);
        if (distH < distR) {
          preferHold = true;
        } else if (distR < distH) {
          preferHold = false;
        } else {
          preferHold = prevH;
        }
      }
      const scanEnd = nX + 400;
      let fallingSpikeAhead = false;
      for (let i = findStartIndex(nX); i < sortedObs.length; i++) {
        const o = sortedObs[i];
        if (o.x > scanEnd) break;
        if (o.type === "falling_spike") {
          fallingSpikeAhead = true;
          break;
        }
      }
      if (fallingSpikeAhead) {
        preferHold = !nG;
      }
      if (isSwitchRestricted) {
        if (prevH && isHoldSafe) preferHold = true;
        if (!prevH && isReleaseSafe) preferHold = false;
      }
      const nextActions = preferHold ? [true, false] : [false, true];
      for (const h of nextActions) {
        if (h ? !dH : !dR) {
          if (h !== prevH) {
            if (isSwitchRestricted) {
              const maintenanceSafe = prevH ? isHoldSafe : isReleaseSafe;
              if (maintenanceSafe) continue;
            }
          }
          const newLastSwitchTime = h !== prevH ? nT : curr.lastSwitchTime;
          stack.push({ x: nX, y: h ? nYH : nYR, time: nT, g: nG, sm: nSM, m: nM, wa: nWA, h, pIdx: npIdx, lastSwitchTime: newLastSwitchTime, prev: curr });
        }
      }
      if (loops > maxLoops) break;
    }
    if (bestState) {
      const path = [];
      let t = bestState;
      while (t) {
        path.push({ x: t.x, y: t.y, holding: t.h, time: t.time });
        t = t.prev;
      }
      this.autoplayLog = path.reverse();
      return true;
    } else {
      this.validationFailureInfo = {
        x: furthestFailX,
        y: failY,
        nearObstacles: sortedObs.filter((o) => o.x > furthestFailX - 400 && o.x < furthestFailX + 600)
      };
      return false;
    }
  }
  computeAutoplayLog(startX = 200, startY = 360) {
    const gen = this.computeAutoplayLogGen(startX, startY);
    let res = gen.next();
    while (!res.done) res = gen.next();
    return res.value;
  }
  async computeAutoplayLogAsync(startX, startY, onProgress) {
    const gen = this.computeAutoplayLogGen(startX, startY);
    let res = gen.next();
    let lastTime = performance.now();
    while (!res.done) {
      if (typeof res.value === "number") {
        const now = performance.now();
        if (now - lastTime > 16) {
          onProgress(res.value);
          await new Promise((resolve) => setTimeout(resolve, 0));
          lastTime = performance.now();
        }
      }
      res = gen.next();
    }
    onProgress(1);
    return res.value;
  }
  validateMap() {
    return this.computeAutoplayLog(200, 360);
  }
  seededRandom(seed) {
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }
  /**
   * 프레임마다 호출되는 업데이트 함수
   */
  update(dt, currentTime) {
    if (this.isDead || !this.isPlaying) return;
    if (dt > 0.1) dt = 0.1;
    if (dt < 0) dt = 0;
    const currentSpeed = this.baseSpeed * this.speedMultiplier;
    this.waveSpeed = currentSpeed;
    const effectiveAngle = this.getEffectiveAngle(this.isMini, this.speedMultiplier);
    const angleRad = effectiveAngle * Math.PI / 180;
    this.waveAmplitude = currentSpeed * Math.tan(angleRad);
    this.playerX += this.waveSpeed * dt;
    let simTime = null;
    if (this.isAutoplay && this.autoplayLog.length > 0) {
      const targetX = this.playerX;
      let foundEntry = null;
      for (let i = this.lastAutoplayIndex; i < this.autoplayLog.length; i++) {
        const entry = this.autoplayLog[i];
        if (entry && entry.x >= targetX) {
          foundEntry = entry;
          this.lastAutoplayIndex = i;
          break;
        }
      }
      if (foundEntry) {
        this.isHolding = foundEntry.holding;
        const prevEntry = this.lastAutoplayIndex > 0 ? this.autoplayLog[this.lastAutoplayIndex - 1] : null;
        if (prevEntry) {
          const ratio = (targetX - prevEntry.x) / (foundEntry.x - prevEntry.x);
          this.playerY = prevEntry.y + (foundEntry.y - prevEntry.y) * Math.max(0, Math.min(1, ratio));
          simTime = prevEntry.time + (foundEntry.time - prevEntry.time) * Math.max(0, Math.min(1, ratio));
        } else {
          this.playerY = foundEntry.y;
          simTime = foundEntry.time;
        }
        const visualPortion = this.autoplayLog.slice(this.lastAutoplayIndex, this.lastAutoplayIndex + 300);
        this.aiPredictedPath = visualPortion.map((p) => ({ x: p.x, y: p.y }));
      }
    } else {
      this.aiPredictedPath = [];
      const direction = this.isHolding ? -1 : 1;
      const gravityDirection = this.isGravityInverted ? -direction : direction;
      this.playerY += this.waveAmplitude * gravityDirection * dt;
    }
    if (this.playerY < this.minY + this.playerSize) {
      this.playerY = this.minY + this.playerSize;
    }
    if (this.playerY > this.maxY - this.playerSize) {
      this.playerY = this.maxY - this.playerSize;
    }
    this.cameraX = this.playerX - 280;
    this.progress = Math.min(100, this.playerX / this.totalLength * 100);
    this.score = Math.floor(this.progress * 10);
    this.trail.push({ x: this.playerX, y: this.playerY, time: Date.now() });
    if (this.trail.length > 80) this.trail.shift();
    this.updateParticles(dt);
    const effectiveTime = simTime !== null ? simTime : currentTime;
    this.updateMovingObstacles(dt, effectiveTime);
    this.updateBoss(dt, effectiveTime);
    this.checkPortalCollisions();
    this.checkCollisions(effectiveTime);
    if (this.beatTimes.length > 0) {
      const currentBeatIdx = this.beatTimes.findIndex((t) => t >= currentTime);
      if (currentBeatIdx !== -1 && currentBeatIdx !== this.lastMeasureIndex) {
        if (Math.abs(this.beatTimes[currentBeatIdx] - currentTime) < 0.1) {
          this.isMeasureHighlight = true;
          this.lastMeasureIndex = currentBeatIdx;
          setTimeout(() => this.isMeasureHighlight = false, 150);
        }
      }
    }
    if (this.playerX >= this.totalLength) {
      this.isPlaying = false;
    }
  }
  checkPortalCollisions() {
    for (const portal of this.portals) {
      if (portal.activated) continue;
      if (portal.x + portal.width < this.playerX - 50) continue;
      if (portal.x > this.playerX + 100) break;
      const pSize = this.playerSize;
      const points = [
        { x: this.playerX - pSize, y: this.playerY - pSize },
        { x: this.playerX + pSize, y: this.playerY - pSize },
        { x: this.playerX - pSize, y: this.playerY + pSize },
        { x: this.playerX + pSize, y: this.playerY + pSize },
        { x: this.playerX, y: this.playerY }
      ];
      const isRotated = portal.angle && portal.angle !== 0;
      if (isRotated) {
        const cx = portal.x + portal.width / 2;
        const cy = portal.y + portal.height / 2;
        const rad = -portal.angle * Math.PI / 180;
        points.forEach((p) => {
          const dx = p.x - cx;
          const dy = p.y - cy;
          p.x = cx + dx * Math.cos(rad) - dy * Math.sin(rad);
          p.y = cy + dx * Math.sin(rad) + dy * Math.cos(rad);
        });
      }
      const isColliding = points.some(
        (p) => p.x >= portal.x && p.x <= portal.x + portal.width && p.y >= portal.y && p.y <= portal.y + portal.height
      );
      if (isColliding) {
        portal.activated = true;
        this.activatePortal(portal.type);
        this.spawnPortalParticles(portal);
        if (this.onPortalActivation) {
          this.onPortalActivation(portal.type);
        }
      }
    }
  }
  activatePortal(type) {
    switch (type) {
      case "gravity_yellow":
        this.isGravityInverted = true;
        break;
      case "gravity_blue":
        this.isGravityInverted = false;
        break;
      case "speed_0.25":
      case "speed_0.5":
      case "speed_1":
      case "speed_2":
      case "speed_3":
      case "speed_4":
        this.speedMultiplier = this.getSpeedMultiplierFromType(type);
        break;
      case "mini_pink":
        this.isMini = true;
        this.playerSize = this.miniPlayerSize;
        this.waveAngle = this.miniWaveAngle;
        break;
      case "mini_green":
        this.isMini = false;
        this.playerSize = this.basePlayerSize;
        this.waveAngle = 45;
        break;
      case "teleport_in":
        const currentPortal = this.portals.find((p) => p.type === "teleport_in" && p.activated && Math.abs(p.x - this.playerX) < 100);
        if (currentPortal) {
          let target = null;
          if (currentPortal.linkId) {
            target = this.portals.find((p) => p.type === "teleport_out" && p.linkId === currentPortal.linkId);
          } else {
            target = this.portals.find((p) => p.type === "teleport_out" && p.x > this.playerX);
          }
          if (target) {
            this.playerX = target.x + target.width + 20;
            this.playerY = target.y + target.height / 2;
            this.cameraX = this.playerX - 280;
            this.trail = [];
            this.spawnPortalParticles(target);
          }
        }
        break;
    }
  }
  updateBoss(dt, time) {
    if (!this.boss.active) return;
    this.boss.attackTimer += dt;
    this.boss.x = this.cameraX + 1e3;
    this.boss.y = 360 + Math.sin(time * 0.5) * 100;
    for (let i = this.boss.projectiles.length - 1; i >= 0; i--) {
      const p = this.boss.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const dist = Math.hypot(p.x - this.playerX, p.y - this.playerY);
      if (dist < 20 + this.playerSize) {
        this.die("\uBCF4\uC2A4 \uACF5\uACA9\uC5D0 \uB2F9\uD588\uC2B5\uB2C8\uB2E4!");
      }
      if (p.x < this.cameraX - 100) this.boss.projectiles.splice(i, 1);
    }
    if (this.boss.attackTimer > 3) {
      this.boss.projectiles.push({
        x: this.boss.x,
        y: this.boss.y,
        vx: -600,
        vy: (this.playerY - this.boss.y) * 2,
        type: "missile"
      });
      this.boss.attackTimer = 0;
    }
  }
  spawnPortalParticles(portal) {
    const color = this.getPortalColor(portal.type);
    for (let i = 0; i < 10; i++) {
      const angle = Math.PI * 2 * i / 10;
      const speed = 50 + Math.random() * 60;
      this.particles.push({
        x: portal.x + portal.width / 2,
        y: portal.y + portal.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.6 + Math.random() * 0.3,
        color
      });
    }
  }
  getPortalColor(type) {
    switch (type) {
      case "gravity_yellow":
        return "#ffff00";
      case "gravity_blue":
        return "#4488ff";
      case "speed_0.25":
        return "#aa5500";
      // Dark orange/brown
      case "speed_0.5":
        return "#ff8800";
      case "speed_1":
        return "#4488ff";
      case "speed_2":
        return "#44ff44";
      case "speed_3":
        return "#ff44ff";
      case "speed_4":
        return "#ff4444";
      case "mini_pink":
        return "#ff66cc";
      // 분홍색 뿨족뿨족
      case "mini_green":
        return "#66ff66";
      case "teleport_in":
        return "#00ffff";
      case "teleport_out":
        return "#ff00ff";
      default:
        return "#ffffff";
    }
  }
  getPortalSymbol(type) {
    switch (type) {
      case "gravity_yellow":
        return "\u27F2";
      case "gravity_blue":
        return "\u27F3";
      case "speed_0.25":
        return "<<";
      case "speed_0.5":
        return "<";
      case "speed_1":
        return ">";
      case "speed_2":
        return ">>";
      case "speed_3":
        return ">>>";
      case "speed_4":
        return ">>>>";
      case "mini_pink":
        return "\u25C6";
      case "mini_green":
        return "\u25C7";
      case "teleport_in":
        return "IN";
      case "teleport_out":
        return "OUT";
      default:
        return "?";
    }
  }
  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 150 * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  /**
   * 특정 X 좌표에서 장애물의 Y 범위(최상단, 최하단)를 계산
   */
  getObstacleYRangeAt(obs, x, time) {
    if (x < obs.x || x > obs.x + obs.width) return null;
    let obsY = obs.y;
    let obsAngle = obs.angle || 0;
    if (time !== void 0 && obs.movement) {
      const state = this.getObstacleStateAt(obs, time);
      obsY = state.y;
      obsAngle = state.angle;
    }
    if (obs.type === "block") {
      if (obsAngle) {
        const angleRad = obsAngle * Math.PI / 180;
        const cx = obs.x + obs.width / 2;
        const cy = obsY + obs.height / 2;
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        const hw = obs.width / 2;
        const hh = obs.height / 2;
        const corners = [
          { dx: -hw, dy: -hh },
          { dx: hw, dy: -hh },
          { dx: hw, dy: hh },
          { dx: -hw, dy: hh }
        ].map((p) => ({
          x: cx + p.dx * cos - p.dy * sin,
          y: cy + p.dx * sin + p.dy * cos
        }));
        let minY = Infinity, maxY = -Infinity;
        let intersects = false;
        for (let i = 0; i < 4; i++) {
          const p1 = corners[i], p2 = corners[(i + 1) % 4];
          if (p1.x <= x && x <= p2.x || p2.x <= x && x <= p1.x) {
            if (Math.abs(p1.x - p2.x) < 0.1) {
              minY = Math.min(minY, p1.y, p2.y);
              maxY = Math.max(maxY, p1.y, p2.y);
            } else {
              const t = (x - p1.x) / (p2.x - p1.x);
              const intersectY = p1.y + t * (p2.y - p1.y);
              minY = Math.min(minY, intersectY);
              maxY = Math.max(maxY, intersectY);
            }
            intersects = true;
          }
        }
        return intersects ? { top: minY, bottom: maxY } : null;
      }
      return { top: obsY, bottom: obsY + obs.height };
    }
    if (obs.type === "spike" || obs.type === "mini_spike") {
      const isBottomSpike = obsY > 330;
      const centerX = obs.x + obs.width / 2;
      let tipY;
      if (x <= centerX) {
        const t = (x - obs.x) / (centerX - obs.x);
        tipY = isBottomSpike ? obsY + obs.height - t * obs.height : obsY + t * obs.height;
      } else {
        const t = (x - centerX) / (obs.x + obs.width - centerX);
        tipY = isBottomSpike ? obsY + (1 - t) * 0 + t * obs.height : obsY + obs.height - (1 - t) * 0 - t * obs.height;
        tipY = isBottomSpike ? obsY + t * obs.height : obsY + obs.height - t * obs.height;
      }
      if (isBottomSpike) return { top: tipY, bottom: obsY + obs.height };
      return { top: obsY, bottom: tipY };
    }
    if (obs.type === "slope") {
      const t = (x - obs.x) / obs.width;
      if (obsAngle > 0) {
        const hypotenuseY = obsY + obs.height * (1 - t);
        return { top: obsY, bottom: hypotenuseY };
      } else {
        const hypotenuseY = obsY + obs.height * t;
        return { top: obsY, bottom: hypotenuseY };
      }
    }
    if (obs.type === "triangle" || obs.type === "steep_triangle") {
      const t = (x - obs.x) / obs.width;
      const hypotenuseY = obsY + obs.height * (1 - t);
      return { top: hypotenuseY, bottom: obsY + obs.height };
    }
    return { top: obsY, bottom: obsY + obs.height };
  }
  checkCollisions(time) {
    for (const obs of this.obstacles) {
      if (obs.x + obs.width < this.playerX - 80) continue;
      if (obs.x > this.playerX + 100) break;
      if (this.checkObstacleCollision(obs, this.playerX, this.playerY, this.playerSize, time)) {
        this.die("\uC7A5\uC560\uBB3C\uACFC \uCDA9\uB3CC!");
        this.spawnDeathParticles();
        return;
      }
    }
  }
  /**
   * 세밀한 충돌 체크 (가시는 세모, 기울어진 블록은 OBB 적용)
   * 전역 회전 지원: 플레이어 점들을 역회전시켜 AABB와 체크
   */
  checkObstacleCollision(obs, px, py, pSize, simTime, simSpeedMultiplier) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r;
    let obsY = obs.y;
    let obsAngle = obs.angle || 0;
    if (simTime !== void 0 && obs.movement) {
      const state = this.getObstacleStateAt(obs, simTime);
      obsY = state.y;
      obsAngle = state.angle;
    }
    let effectiveWidth = obs.width;
    let effectiveHeight = obs.height;
    if (obs.type === "mine" && ((_a = obs.customData) == null ? void 0 : _a.pulseSpeed)) {
      const time = simTime || performance.now() / 1e3;
      const speed = obs.customData.pulseSpeed || 2;
      const amount = obs.customData.pulseAmount || 0.2;
      const pulse = 1 + Math.sin(time * speed) * amount;
      effectiveWidth *= pulse;
      effectiveHeight *= pulse;
    }
    const minHitboxSize = 10;
    effectiveWidth = Math.max(effectiveWidth, minHitboxSize);
    effectiveHeight = Math.max(effectiveHeight, minHitboxSize);
    const hitboxReduction = 0;
    const planetReduction = 0;
    let reduction = hitboxReduction;
    if (obs.type === "planet" || obs.type === "star") reduction = planetReduction;
    effectiveWidth = Math.max(10, effectiveWidth - reduction);
    effectiveHeight = Math.max(10, effectiveHeight - reduction);
    const effectiveX = obs.x - (effectiveWidth - obs.width) / 2;
    const effectiveY = obsY - (effectiveHeight - obs.height) / 2;
    const isRotated = obsAngle !== 0;
    const points = [
      { x: px - pSize, y: py - pSize },
      { x: px + pSize, y: py - pSize },
      { x: px - pSize, y: py + pSize },
      { x: px + pSize, y: py + pSize },
      { x: px, y: py }
    ];
    if (obs.type === "falling_spike" && simTime !== void 0) {
      const triggerX = obs.x - 150;
      if (px > triggerX) {
        const estimatedSpeed = this.baseSpeed * (simSpeedMultiplier !== void 0 ? simSpeedMultiplier : this.speedMultiplier || 1);
        const dist = Math.max(0, px - triggerX);
        const t = dist / estimatedSpeed;
        const drop = 0.5 * 2500 * t * t;
        obsY = (obs.initialY !== void 0 ? obs.initialY : obs.y) + drop;
        if (obsY > this.maxY + 100) return false;
      } else {
        obsY = obs.initialY !== void 0 ? obs.initialY : obs.y;
      }
    }
    if (obs.type === "planet" || obs.type === "star") {
      const time = simTime || performance.now() / 1e3;
      const cx = obs.x + obs.width / 2;
      const cy = obsY + obs.height / 2;
      const rx = effectiveWidth / 2;
      const ry = effectiveHeight / 2;
      const dx = px - cx;
      const dy = py - cy;
      if (dx * dx / ((rx - 2) * (rx - 2)) + dy * dy / ((ry - 2) * (ry - 2)) < 1) return true;
      const hasChildren = obs.children && obs.children.length > 0;
      if (hasChildren) {
        const children = obs.children;
        const speed = (_c = (_b = obs.customData) == null ? void 0 : _b.orbitSpeed) != null ? _c : 1;
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (!child) continue;
          const theta = time * speed + i * (Math.PI * 2 / children.length);
          const dist = (_e = (_d = obs.customData) == null ? void 0 : _d.orbitDistance) != null ? _e : obs.width * 0.85;
          const childX = cx + Math.cos(theta) * dist;
          const childY = cy + Math.sin(theta) * dist;
          const childSize = child.width ? child.width / 2 : 14;
          const distToChildSq = (points[4].x - childX) ** 2 + (points[4].y - childY) ** 2;
          if (distToChildSq < (childSize + pSize - 2) ** 2) return true;
          if (child.type === "planet") {
            const moonCount = (_g = (_f = child.customData) == null ? void 0 : _f.orbitCount) != null ? _g : 2;
            const moonSpeed = (_i = (_h = child.customData) == null ? void 0 : _h.orbitSpeed) != null ? _i : 2;
            const moonDist = (_k = (_j = child.customData) == null ? void 0 : _j.orbitDistance) != null ? _k : child.width * 0.8;
            for (let j = 0; j < moonCount; j++) {
              const mTheta = time * moonSpeed + j * (Math.PI * 2 / moonCount);
              const mx = childX + Math.cos(mTheta) * moonDist;
              const my = childY + Math.sin(mTheta) * moonDist;
              const distToMoonSq = (points[4].x - mx) ** 2 + (points[4].y - my) ** 2;
              if (distToMoonSq < (8 + pSize - 2) ** 2) return true;
            }
          }
        }
      } else {
        const count = (_m = (_l = obs.customData) == null ? void 0 : _l.orbitCount) != null ? _m : obs.type === "star" ? 0 : 2;
        if (count === 0 && obs.type === "star") ; else {
          const speed = (_o = (_n = obs.customData) == null ? void 0 : _n.orbitSpeed) != null ? _o : 1;
          const dist = (_q = (_p = obs.customData) == null ? void 0 : _p.orbitDistance) != null ? _q : obs.width * 0.8;
          for (let i = 0; i < count; i++) {
            const theta = time * speed + i * (Math.PI * 2 / count);
            const mx = cx + Math.cos(theta) * dist;
            const my = cy + Math.sin(theta) * dist;
            const moonRadius = obs.type === "star" ? 20 : 10;
            const mDistSq = (points[4].x - mx) ** 2 + (points[4].y - my) ** 2;
            if (mDistSq < (moonRadius + pSize - 2) ** 2) return true;
            if (obs.type === "star" && ((_r = obs.customData) == null ? void 0 : _r.nestedOrbit)) {
              const subMoonCount = 2;
              const subDist = 25;
              const subSpeed = speed * 2.5;
              for (let j = 0; j < subMoonCount; j++) {
                const subTheta = time * subSpeed + j * (Math.PI * 2 / subMoonCount);
                const smx = mx + Math.cos(subTheta) * subDist;
                const smy = my + Math.sin(subTheta) * subDist;
                const smDistSq = (points[4].x - smx) ** 2 + (points[4].y - smy) ** 2;
                if (smDistSq < (8 + pSize - 2) ** 2) return true;
              }
            }
          }
        }
      }
      return false;
    }
    if (isRotated) {
      const cx = effectiveX + effectiveWidth / 2;
      const cy = effectiveY + effectiveHeight / 2;
      const rad = -obsAngle * Math.PI / 180;
      points.forEach((p) => {
        const dx = p.x - cx;
        const dy = p.y - cy;
        p.x = cx + dx * Math.cos(rad) - dy * Math.sin(rad);
        p.y = cy + dx * Math.sin(rad) + dy * Math.cos(rad);
      });
    }
    const isInsideAABB = points.some(
      (p) => p.x >= effectiveX && p.x <= effectiveX + effectiveWidth && p.y >= effectiveY && p.y <= effectiveY + effectiveHeight
    );
    if (!isInsideAABB && obs.type !== "slope" && obs.type !== "spike" && obs.type !== "mini_spike") return false;
    if (obs.type === "block") {
      return isInsideAABB;
    }
    if (obs.type === "slope") {
      let tri;
      if (obs.angle > 0) {
        tri = [
          { x: effectiveX, y: effectiveY + effectiveHeight },
          { x: effectiveX + effectiveWidth, y: effectiveY },
          { x: effectiveX, y: effectiveY }
        ];
      } else {
        tri = [
          { x: effectiveX + effectiveWidth, y: effectiveY + effectiveHeight },
          { x: effectiveX, y: effectiveY },
          { x: effectiveX + effectiveWidth, y: effectiveY }
        ];
      }
      for (const p of points) {
        if (this.isPointInTriangle(p.x, p.y, tri[0].x, tri[0].y, tri[1].x, tri[1].y, tri[2].x, tri[2].y)) return true;
      }
      return false;
    }
    if (obs.type === "triangle" || obs.type === "steep_triangle") {
      const tri = [
        { x: effectiveX, y: effectiveY + effectiveHeight },
        { x: effectiveX + effectiveWidth, y: effectiveY + effectiveHeight },
        { x: effectiveX + effectiveWidth, y: effectiveY }
      ];
      for (const p of points) {
        if (this.isPointInTriangle(p.x, p.y, tri[0].x, tri[0].y, tri[1].x, tri[1].y, tri[2].x, tri[2].y)) return true;
      }
      return false;
    }
    if (obs.type === "spike" || obs.type === "mini_spike") {
      const isBottom = effectiveY > 300;
      const tri = isBottom ? [
        { x: effectiveX, y: effectiveY + effectiveHeight },
        { x: effectiveX + effectiveWidth / 2, y: effectiveY },
        { x: effectiveX + effectiveWidth, y: effectiveY + effectiveHeight }
      ] : [
        { x: effectiveX, y: effectiveY },
        { x: effectiveX + effectiveWidth / 2, y: effectiveY + effectiveHeight },
        { x: effectiveX + effectiveWidth, y: effectiveY }
      ];
      for (const p of points) {
        if (tri[0] && tri[1] && tri[2] && this.isPointInTriangle(p.x, p.y, tri[0].x, tri[0].y, tri[1].x, tri[1].y, tri[2].x, tri[2].y)) return true;
      }
      return false;
    }
    if (obs.type === "saw" || obs.type === "spike_ball" || obs.type === "mine" || obs.type === "orb") {
      const cx = effectiveX + effectiveWidth / 2;
      const cy = effectiveY + effectiveHeight / 2;
      const rx = effectiveWidth / 2 * 0.9;
      const ry = effectiveHeight / 2 * 0.9;
      for (const p of points) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        if (dx * dx / (rx * rx) + dy * dy / (ry * ry) < 1) return true;
      }
      return false;
    }
    if (obs.type === "laser") {
      const h = effectiveHeight * 0.4;
      const cy = effectiveY + effectiveHeight / 2;
      return points.some((p) => p.x >= effectiveX && p.x <= effectiveX + effectiveWidth && p.y >= cy - h && p.y <= cy + h);
    }
    if (obs.type === "v_laser" || obs.type === "laser_beam") {
      const w = effectiveWidth * 0.4;
      const cx = effectiveX + effectiveWidth / 2;
      return points.some((p) => p.y >= effectiveY && p.y <= effectiveY + effectiveHeight && p.x >= cx - w && p.x <= cx + w);
    }
    if (obs.type === "hammer") {
      const cx = effectiveX + effectiveWidth / 2;
      const cy = effectiveY + effectiveHeight / 2;
      return points.some((p) => (p.x - cx) ** 2 + (p.y - cy) ** 2 < (effectiveWidth / 2) ** 2);
    }
    if (obs.type === "falling_spike") {
      const tri = [
        { x: effectiveX, y: effectiveY },
        { x: effectiveX + effectiveWidth / 2, y: effectiveY + effectiveHeight },
        { x: effectiveX + effectiveWidth, y: effectiveY }
      ];
      for (const p of points) {
        if (tri[0] && tri[1] && tri[2] && this.isPointInTriangle(p.x, p.y, tri[0].x, tri[0].y, tri[1].x, tri[1].y, tri[2].x, tri[2].y)) return true;
      }
      return false;
    }
    if (["rotor", "cannon", "spark_mine", "crusher_jaw", "swing_blade"].includes(obs.type)) {
      const cx = effectiveX + effectiveWidth / 2;
      const cy = effectiveY + effectiveHeight / 2;
      const rx = effectiveWidth / 2 * 0.8;
      const ry = effectiveHeight / 2 * 0.8;
      for (const p of points) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        if (dx * dx / (rx * rx) + dy * dy / (ry * ry) < 1) return true;
      }
      return false;
    }
    if (obs.type === "piston_v") {
      return isInsideAABB;
    }
    if (obs.type === "growing_spike") {
      const tri = [
        { x: effectiveX, y: effectiveY + effectiveHeight },
        { x: effectiveX + effectiveWidth / 2, y: effectiveY },
        { x: effectiveX + effectiveWidth, y: effectiveY + effectiveHeight }
      ];
      for (const p of points) {
        if (tri[0] && tri[1] && tri[2] && this.isPointInTriangle(p.x, p.y, tri[0].x, tri[0].y, tri[1].x, tri[1].y, tri[2].x, tri[2].y)) return true;
      }
      return false;
    }
    return false;
  }
  isPointInRotatedRect(px, py, obs) {
    const angleRad = (obs.angle || 0) * Math.PI / 180;
    const cx = obs.x + obs.width / 2;
    const cy = obs.y + obs.height / 2;
    const tx = px - cx;
    const ty = py - cy;
    const cos = Math.cos(-angleRad);
    const sin = Math.sin(-angleRad);
    const rx = tx * cos - ty * sin;
    const ry = tx * sin + ty * cos;
    return Math.abs(rx) <= obs.width / 2 && Math.abs(ry) <= obs.height / 2;
  }
  /**
   * 장애물 중복 제거: 다른 장애물에 완전히 포함된 장애물을 삭제합니다.
   */
  removeRedundantObstacles() {
    const toRemove = /* @__PURE__ */ new Set();
    const n = this.obstacles.length;
    for (let i = 0; i < n; i++) {
      const a = this.obstacles[i];
      if (a.movement) continue;
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const b = this.obstacles[j];
        if (b.movement) continue;
        const margin = b.angle ? Math.max(b.width, b.height) : 0;
        if (b.x - margin > a.x || b.x + b.width + margin < a.x + a.width) continue;
        if (this.isObstacleContained(a, b)) {
          toRemove.add(i);
          break;
        }
      }
    }
    if (toRemove.size > 0) {
      console.log(`[MapGen] Removing ${toRemove.size} redundant obstacles.`);
      this.obstacles = this.obstacles.filter((_, idx) => !toRemove.has(idx));
    }
  }
  isObstacleContained(a, b) {
    if (b.type !== "block" && b.type !== "spike" && b.type !== "mini_spike") return false;
    const corners = this.getObstacleCorners(a);
    for (const p of corners) {
      if (!this.isPointInStaticObstacle(p.x, p.y, b)) return false;
    }
    return true;
  }
  isPointInStaticObstacle(px, py, obs) {
    if (obs.type === "block") {
      return this.isPointInRotatedRect(px, py, obs);
    }
    if (obs.type === "spike" || obs.type === "mini_spike") {
      const isBottomSpike = obs.y > 300;
      const centerX = obs.x + obs.width / 2;
      if (isBottomSpike) {
        return this.isPointInTriangle(
          px,
          py,
          obs.x,
          obs.y + obs.height,
          centerX,
          obs.y,
          obs.x + obs.width,
          obs.y + obs.height
        );
      } else {
        return this.isPointInTriangle(
          px,
          py,
          obs.x,
          obs.y,
          centerX,
          obs.y + obs.height,
          obs.x + obs.width,
          obs.y
        );
      }
    }
    return false;
  }
  getObstacleCorners(obs) {
    if (obs.type === "spike" || obs.type === "mini_spike") {
      const isBottomSpike = obs.y > 300;
      const centerX = obs.x + obs.width / 2;
      if (isBottomSpike) {
        return [
          { x: obs.x, y: obs.y + obs.height },
          { x: centerX, y: obs.y },
          { x: obs.x + obs.width, y: obs.y + obs.height }
        ];
      } else {
        return [
          { x: obs.x, y: obs.y },
          { x: centerX, y: obs.y + obs.height },
          { x: obs.x + obs.width, y: obs.y }
        ];
      }
    }
    if (obs.angle) {
      const angleRad = obs.angle * Math.PI / 180;
      const cx = obs.x + obs.width / 2;
      const cy = obs.y + obs.height / 2;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      const hw = obs.width / 2;
      const hh = obs.height / 2;
      return [
        { dx: -hw, dy: -hh },
        { dx: hw, dy: -hh },
        { dx: hw, dy: hh },
        { dx: -hw, dy: hh }
      ].map((p) => ({
        x: cx + p.dx * cos - p.dy * sin,
        y: cy + p.dx * sin + p.dy * cos
      }));
    }
    if (obs.type === "triangle" || obs.type === "steep_triangle") {
      return [
        { x: obs.x, y: obs.y + obs.height },
        // BL
        { x: obs.x + obs.width, y: obs.y + obs.height },
        // BR
        { x: obs.x + obs.width, y: obs.y }
        // TR
      ];
    }
    return [
      { x: obs.x, y: obs.y },
      { x: obs.x + obs.width, y: obs.y },
      { x: obs.x, y: obs.y + obs.height },
      { x: obs.x + obs.width, y: obs.y + obs.height }
    ];
  }
  isPointInTriangle(px, py, x1, y1, x2, y2, x3, y3) {
    const area = Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2);
    const area1 = Math.abs((px * (y1 - y2) + x1 * (y2 - py) + x2 * (py - y1)) / 2);
    const area2 = Math.abs((px * (y2 - y3) + x2 * (y3 - py) + x3 * (py - y2)) / 2);
    const area3 = Math.abs((px * (y3 - y1) + x3 * (y1 - py) + x1 * (py - y3)) / 2);
    return Math.abs(area - (area1 + area2 + area3)) < 0.1;
  }
  spawnDeathParticles() {
    const colors = ["#ff4444", "#ff8844", "#ffaa00", "#ffffff"];
    for (let i = 0; i < 15; i++) {
      const angle = Math.PI * 2 * i / 15;
      const speed = 100 + Math.random() * 150;
      this.particles.push({
        x: this.playerX,
        y: this.playerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.8 + Math.random() * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)] || "#ffffff"
      });
    }
  }
  getObstacleStateAt(obs, time) {
    let y = obs.y;
    let angle = obs.angle || 0;
    if (obs.movement) {
      if (obs.movement.type === "updown" && obs.initialY !== void 0) {
        const { range, speed, phase } = obs.movement;
        y = obs.initialY + Math.sin(time * speed + phase) * range;
      } else if (obs.movement.type === "rotate") {
        const { speed, phase } = obs.movement;
        const rad = time * speed + phase;
        angle = rad * 180 / Math.PI % 360;
      }
    } else {
      if (["saw", "rotor", "spike_ball"].includes(obs.type)) {
        const speed = 3;
        angle = time * speed * 180 / Math.PI % 360;
      } else if (["hammer", "swing_blade"].includes(obs.type)) {
        const speed = 3;
        const range = 60;
        angle = Math.sin(time * speed) * range;
      } else if (["piston_v", "crusher_jaw"].includes(obs.type)) {
        if (obs.initialY !== void 0) {
          const speed = 2;
          const range = 50;
          y = obs.initialY + Math.sin(time * speed) * range;
        }
      }
    }
    return { y, angle };
  }
  updateMovingObstacles(dt, time) {
    var _a;
    for (const obs of this.obstacles) {
      const hasImplicit = ["saw", "rotor", "spike_ball", "hammer", "swing_blade", "piston_v", "crusher_jaw"].includes(obs.type);
      if (obs.movement || hasImplicit) {
        const state = this.getObstacleStateAt(obs, time);
        if ((hasImplicit || ((_a = obs.movement) == null ? void 0 : _a.type) === "updown") && obs.initialY === void 0) {
          obs.initialY = obs.y;
        }
        obs.y = state.y;
        obs.angle = state.angle;
      }
      if (obs.type === "falling_spike") {
        if (!obs.customData) obs.customData = {};
        if (obs.customData.isFalling === void 0) {
          obs.customData.isFalling = false;
          obs.customData.vy = 0;
          if (obs.initialY === void 0) obs.initialY = obs.y;
        }
        const isFalling = obs.customData.isFalling;
        if (isFalling) {
          const gravity = 2500;
          obs.customData.vy = (obs.customData.vy || 0) + gravity * dt;
          obs.y += obs.customData.vy * dt;
        } else {
          const dist = obs.x - this.playerX;
          if (dist < 150 && dist > -50) {
            obs.customData.isFalling = true;
            obs.customData.vy = 0;
          }
          if (obs.initialY !== void 0) obs.y = obs.initialY;
        }
      }
    }
  }
  die(reason) {
    this.isDead = true;
    this.failReason = reason;
    this.isPlaying = false;
    this.showHitboxes = true;
    this.isAutoplay = false;
  }
  setHolding(holding) {
    this.isHolding = holding;
  }
  getProgress() {
    return Math.floor(this.progress);
  }
  getState() {
    return {
      playerX: this.playerX,
      playerY: this.playerY,
      velocity: this.isHolding ? -this.waveAmplitude : this.waveAmplitude,
      isHolding: this.isHolding,
      progress: this.progress,
      isGravityInverted: this.isGravityInverted,
      speedMultiplier: this.speedMultiplier,
      isMini: this.isMini,
      waveAngle: this.waveAngle
    };
  }
}

const gameEngine = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GameEngine: GameEngine
}, Symbol.toStringTag, { value: 'Module' }));
//# sourceMappingURL=index.mjs.map
