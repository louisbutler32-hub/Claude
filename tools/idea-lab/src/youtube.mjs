/**
 * Live YouTube Data API v3 client.
 *
 * The tool works without a key (it falls back to the baked corpus), but with
 * one it reads the REAL current stats for the three reference videos and the
 * REAL current view distribution of the niche. Get a free key at
 * console.cloud.google.com -> enable "YouTube Data API v3" -> create API key,
 * then: export YOUTUBE_API_KEY=...
 *
 * Quota cost per run: ~1 unit per videos/channels call + 100 per search call.
 * A default run costs about 105 units of the free 10,000/day.
 */
const API = 'https://www.googleapis.com/youtube/v3';

export class YouTubeError extends Error {
  constructor(message, { status, reason } = {}) { super(message); this.name = 'YouTubeError'; this.status = status; this.reason = reason; }
}

/** Pull a video id out of any common YouTube URL form, or accept a bare id. */
export function parseVideoId(input) {
  const s = String(input || '').trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([A-Za-z0-9_-]{11})/,
    /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/(?:embed|v|shorts|live)\/)([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) { const m = s.match(p); if (m) return m[1]; }
  return null;
}

/** "PT15M23S" -> 923. */
export function isoDurationToSec(d) {
  const m = String(d || '').match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  return (+(m[1] || 0)) * 3600 + (+(m[2] || 0)) * 60 + (+(m[3] || 0));
}

async function call(endpoint, params, key) {
  const url = new URL(`${API}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set('key', key);
  let res;
  try {
    res = await fetch(url, { headers: { accept: 'application/json' } });
  } catch (e) {
    throw new YouTubeError(`network error calling YouTube (${e.message})`);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const reason = body?.error?.errors?.[0]?.reason;
    const msg = body?.error?.message || res.statusText;
    if (reason === 'quotaExceeded') throw new YouTubeError('YouTube API daily quota exceeded — rerun tomorrow or use --offline', { status: res.status, reason });
    if (res.status === 400 && /API key not valid/i.test(msg)) throw new YouTubeError('YOUTUBE_API_KEY is not valid', { status: res.status, reason });
    throw new YouTubeError(`YouTube API ${res.status}: ${msg}`, { status: res.status, reason });
  }
  return body;
}

/** Real stats for up to 50 videos, including their channels' subscriber counts. */
export async function fetchVideos(ids, key) {
  if (!ids.length) return [];
  const v = await call('videos', { part: 'snippet,statistics,contentDetails', id: ids.slice(0, 50).join(','), maxResults: 50 }, key);
  const items = v.items || [];
  const channelIds = [...new Set(items.map((i) => i.snippet.channelId))];
  const subsBy = new Map();
  for (let i = 0; i < channelIds.length; i += 50) {
    const c = await call('channels', { part: 'statistics', id: channelIds.slice(i, i + 50).join(','), maxResults: 50 }, key);
    (c.items || []).forEach((ch) => subsBy.set(ch.id, Number(ch.statistics?.subscriberCount ?? 0)));
  }
  return items.map((i) => ({
    id: i.id,
    title: i.snippet.title,
    channelId: i.snippet.channelId,
    channelTitle: i.snippet.channelTitle,
    publishedAt: i.snippet.publishedAt,
    tags: i.snippet.tags || [],
    views: Number(i.statistics?.viewCount ?? 0),
    likes: i.statistics?.likeCount != null ? Number(i.statistics.likeCount) : null,
    comments: i.statistics?.commentCount != null ? Number(i.statistics.commentCount) : null,
    durationSec: isoDurationToSec(i.contentDetails?.duration),
    subs: subsBy.get(i.snippet.channelId) ?? 0,
    ageDays: (Date.now() - new Date(i.snippet.publishedAt).getTime()) / 86400e3,
  }));
}

/** Real current top results for a niche query, with full stats. */
export async function fetchNiche(query, key, { max = 50, order = 'relevance' } = {}) {
  const s = await call('search', {
    part: 'snippet', q: query, type: 'video', videoDuration: 'medium',
    maxResults: Math.min(50, max), order,
  }, key);
  const ids = (s.items || []).map((i) => i.id?.videoId).filter(Boolean);
  return fetchVideos(ids, key);
}
