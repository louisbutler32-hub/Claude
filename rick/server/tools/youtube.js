"use strict";
// YouTube Data API v3 (public data only: subs, views, uploads). Needs YOUTUBE_API_KEY.
const API = "https://www.googleapis.com/youtube/v3";

function key() {
  return process.env.YOUTUBE_API_KEY || "";
}

async function yt(endpoint, params) {
  if (!key()) throw new Error("YOUTUBE_API_KEY is not set. Add it to rick/.env to enable live channel stats.");
  const url = new URL(`${API}/${endpoint}`);
  for (const [k, v] of Object.entries(params)) if (v !== undefined) url.searchParams.set(k, String(v));
  url.searchParams.set("key", key());
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message || `YouTube API ${res.status}`);
  return body;
}

const cache = new Map(); // handle/id -> channel resource
async function resolveChannel(ref) {
  // ref: { id } | { handle } | { name } (name is looked up in config)
  const cacheKey = ref.id || ref.handle;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  const params = { part: "snippet,statistics,contentDetails" };
  if (ref.id) params.id = ref.id;
  else if (ref.handle) params.forHandle = ref.handle.replace(/^@/, "");
  else throw new Error("channel needs an id or handle");
  const data = await yt("channels", params);
  const ch = data.items?.[0];
  if (!ch) throw new Error(`Channel not found: ${ref.id || ref.handle}`);
  const out = {
    id: ch.id,
    title: ch.snippet.title,
    handle: ch.snippet.customUrl,
    description: ch.snippet.description?.slice(0, 300),
    thumbnail: ch.snippet.thumbnails?.default?.url,
    uploadsPlaylist: ch.contentDetails?.relatedPlaylists?.uploads,
    subscribers: Number(ch.statistics.subscriberCount || 0),
    views: Number(ch.statistics.viewCount || 0),
    videos: Number(ch.statistics.videoCount || 0),
  };
  cache.set(cacheKey, out);
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000).unref();
  return out;
}

async function recentVideos(ref, max = 5) {
  const ch = await resolveChannel(ref);
  const pl = await yt("playlistItems", { part: "snippet,contentDetails", playlistId: ch.uploadsPlaylist, maxResults: max });
  const ids = pl.items.map((i) => i.contentDetails.videoId).join(",");
  const vids = await yt("videos", { part: "snippet,statistics,contentDetails", id: ids });
  return vids.items.map((v) => ({
    id: v.id,
    title: v.snippet.title,
    published: v.snippet.publishedAt,
    duration: v.contentDetails.duration,
    views: Number(v.statistics.viewCount || 0),
    likes: Number(v.statistics.likeCount || 0),
    comments: Number(v.statistics.commentCount || 0),
    url: `https://youtu.be/${v.id}`,
  }));
}

async function search(query, max = 5) {
  const data = await yt("search", { part: "snippet", q: query, type: "video", maxResults: max, order: "relevance" });
  return data.items.map((i) => ({
    id: i.id.videoId,
    title: i.snippet.title,
    channel: i.snippet.channelTitle,
    published: i.snippet.publishedAt,
    url: `https://youtu.be/${i.id.videoId}`,
  }));
}

module.exports = { resolveChannel, recentVideos, search, enabled: () => Boolean(key()) };
