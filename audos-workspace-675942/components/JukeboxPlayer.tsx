import { useState, useEffect, useRef, useCallback } from 'react';
import { Music, Search, Play, Pause, SkipForward, X, Volume2, VolumeX, ChevronDown, Plus, ListMusic, Link as LinkIcon } from 'lucide-react';

// =============================================================================
// JukeboxPlayer — persistent, shell-level YouTube music player for DAM Fortunes.
// Lives in Desktop.tsx so it NEVER unmounts as players move between rooms,
// meaning whatever you pick keeps playing across The Bar, Casino Floor,
// Pool Hall, Dollar Day and Bouncer. State is mirrored into the shared
// `music_player_state` workspace row so playback also survives a full reload.
// =============================================================================

interface Track {
  videoId: string;
  title: string;
  thumbnail: string;
}

const GOLD = '#f59e0b';
const PANEL_BG = 'rgba(10, 10, 15, 0.97)';

// Curated one-tap vibes tuned to the DAM Fortunes bar / roadhouse / casino floor.
// Each chip launches a live YouTube *search station* (auto-advancing playlist of
// current results) rather than a single hardcoded video — so a chip can never
// go dead when one video is removed, and the mix stays fresh.
interface Station {
  label: string;
  query: string;
}

const QUICK_STATIONS: Station[] = [
  { label: 'Hip-Hop / Rap', query: 'hip hop rap bar party playlist mix' },
  { label: 'Roadhouse Country', query: 'roadhouse country honky tonk bar playlist' },
  { label: 'R&B / Soul', query: 'late night rnb soul lounge playlist' },
  { label: 'Blues Bar', query: 'blues bar whiskey classic rock playlist' },
  { label: 'Casino Lounge', query: 'vegas casino lounge swing jazz playlist' },
];

function parseVideoId(input: string): string | null {
  const s = (input || '').trim();
  if (!s) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/v\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function ensureYouTubeApi(cb: () => void) {
  const w = window as any;
  if (w.YT && w.YT.Player) { cb(); return; }
  const prev = w.onYouTubeIframeAPIReady;
  w.onYouTubeIframeAPIReady = () => { try { prev && prev(); } catch {} cb(); };
  if (!document.getElementById('yt-iframe-api')) {
    const s = document.createElement('script');
    s.id = 'yt-iframe-api';
    s.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(s);
  }
}

export default function JukeboxPlayer() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [current, setCurrent] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [queue, setQueue] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');
  const [note, setNote] = useState('');

  const playerRef = useRef<any>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const saveTimer = useRef<any>(null);
  const positionTimer = useRef<any>(null);
  const rowIdRef = useRef<number | null>(null);
  const queueRef = useRef<Track[]>([]);
  const initialCueDone = useRef(false);
  useEffect(() => { queueRef.current = queue; }, [queue]);

  const db = () => (window as any).__workspaceDb || null;

  // ---- Shared-row persistence ------------------------------------------------
  const persist = useCallback(async (patch: Record<string, any>) => {
    const d = db();
    if (!d) return;
    try {
      const payload = { ...patch, updated_at: new Date().toISOString() };
      if (rowIdRef.current != null) {
        await d.from('music_player_state', { shared: true }).update(rowIdRef.current, payload);
      } else {
        const rows = await d.from('music_player_state', { shared: true }).get();
        if (rows && rows.length > 0) {
          rowIdRef.current = rows[0].id;
          await d.from('music_player_state', { shared: true }).update(rows[0].id, payload);
        } else {
          const inserted = await d.from('music_player_state', { shared: true }).insert(payload);
          if (inserted && inserted.id != null) rowIdRef.current = inserted.id;
        }
      }
    } catch (e) { /* persistence is best-effort */ }
  }, []);

  const schedulePersist = useCallback((patch: Record<string, any>) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persist(patch), 600);
  }, [persist]);

  // ---- Load saved config + last track on mount ------------------------------
  useEffect(() => {
    (async () => {
      const d = db();
      if (!d) return;
      try {
        const cfg = await d.from('jukebox_config', { shared: true }).get();
        const keyRow = (cfg || []).find((r: any) => r.config_key === 'youtube_api_key');
        if (keyRow && keyRow.config_value) setApiKey(keyRow.config_value);
      } catch {}
      try {
        const rows = await d.from('music_player_state', { shared: true }).get();
        if (rows && rows.length > 0) {
          rowIdRef.current = rows[0].id;
          if (rows[0].current_video_id) {
            setCurrent({
              videoId: rows[0].current_video_id,
              title: rows[0].current_title || 'Now playing',
              thumbnail: rows[0].current_thumbnail || `https://i.ytimg.com/vi/${rows[0].current_video_id}/default.jpg`,
            });
          }
          if (Array.isArray(rows[0].queue)) setQueue(rows[0].queue);
        }
      } catch {}
    })();
  }, []);

  // ---- Initialise the YouTube IFrame player ---------------------------------
  useEffect(() => {
    let cancelled = false;
    ensureYouTubeApi(() => {
      if (cancelled || !mountRef.current || playerRef.current) return;
      const w = window as any;
      playerRef.current = new w.YT.Player(mountRef.current, {
        height: '100%',
        width: '100%',
        playerVars: { autoplay: 0, playsinline: 1, rel: 0, modestbranding: 1, origin: window.location.origin },
        events: {
          onReady: () => {
            setReady(true);
          },
          onStateChange: (e: any) => {
            const YT = (window as any).YT;
            if (!YT) return;
            if (e.data === YT.PlayerState.PLAYING) { setIsPlaying(true); schedulePersist({ is_playing: true }); }
            else if (e.data === YT.PlayerState.PAUSED) { setIsPlaying(false); schedulePersist({ is_playing: false }); }
            else if (e.data === YT.PlayerState.ENDED) { setIsPlaying(false); playNext(); }
          },
          onError: () => setNote('That track could not be played. Try another pick or paste a different link.'),
        },
      });
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Re-cue the saved track once, after reload ----------------------------
  // Player readiness and the DB restore are both async; whichever lands last
  // triggers this single cue so a reloaded track is ready to resume on tap.
  useEffect(() => {
    if (initialCueDone.current) return;
    if (!ready || !current?.videoId) return;
    const p = playerRef.current;
    if (p && typeof p.cueVideoById === 'function') {
      try { p.cueVideoById(current.videoId); initialCueDone.current = true; } catch {}
    }
  }, [ready, current]);

  // ---- Track current position every 5s --------------------------------------
  useEffect(() => {
    positionTimer.current = setInterval(() => {
      const p = playerRef.current;
      if (p && isPlaying && typeof p.getCurrentTime === 'function') {
        try { schedulePersist({ position_seconds: Math.floor(p.getCurrentTime()) }); } catch {}
      }
    }, 5000);
    return () => clearInterval(positionTimer.current);
  }, [isPlaying, schedulePersist]);

  // ---- Playback controls -----------------------------------------------------
  const playTrack = useCallback((t: Track) => {
    setNote('');
    // An explicit play supersedes the one-time restore cue, so it never
    // re-cues (and accidentally pauses) a track the user just started.
    initialCueDone.current = true;
    setCurrent(t);
    setOpen(true);
    const p = playerRef.current;
    if (p && typeof p.loadVideoById === 'function') {
      try { p.loadVideoById(t.videoId); } catch {}
    }
    persist({
      current_video_id: t.videoId,
      current_title: t.title,
      current_thumbnail: t.thumbnail,
      is_playing: true,
      position_seconds: 0,
    });
  }, [persist]);

  // A Quick Vibes chip launches a live YouTube *search station* (an
  // auto-advancing playlist of current results) rather than one hardcoded
  // video. Search queries never 404, so a chip can never go dead, and the
  // mix stays fresh every time. State persists with an empty video id, so
  // the reload-restore re-cue (guarded on current.videoId) skips it cleanly.
  const playStation = useCallback((s: Station) => {
    setNote('');
    initialCueDone.current = true;
    const p = playerRef.current;
    if (p && typeof p.loadPlaylist === 'function') {
      try {
        p.loadPlaylist({ listType: 'search', list: s.query });
        const title = `${s.label} — radio`;
        setCurrent({ videoId: '', title, thumbnail: '' });
        setOpen(true);
        setResults([]);
        persist({
          current_video_id: '',
          current_title: title,
          current_thumbnail: '',
          is_playing: true,
          position_seconds: 0,
        });
      } catch {
        setNote('Could not start that station. Paste a YouTube link to play instead.');
      }
    } else {
      setNote('Player still loading — try again in a second.');
    }
  }, [persist]);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    try {
      if (isPlaying) p.pauseVideo();
      else p.playVideo();
    } catch {}
  }, [isPlaying]);

  const playNext = useCallback(() => {
    const q = queueRef.current;
    if (q.length > 0) {
      const [next, ...rest] = q;
      setQueue(rest);
      schedulePersist({ queue: rest });
      playTrack(next);
    } else {
      setIsPlaying(false);
    }
  }, [playTrack, schedulePersist]);

  const enqueue = useCallback((t: Track) => {
    setQueue(prev => {
      const updated = [...prev, t];
      schedulePersist({ queue: updated });
      return updated;
    });
    setNote(`Added to queue: ${t.title.slice(0, 40)}`);
  }, [schedulePersist]);

  const toggleMute = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    try {
      if (muted) { p.unMute(); setMuted(false); }
      else { p.mute(); setMuted(true); }
    } catch {}
  }, [muted]);

  // ---- Search ----------------------------------------------------------------
  const runSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setNote('');

    // 1) Direct link / id paste always works, key or not.
    const direct = parseVideoId(q);
    if (direct) {
      playTrack({ videoId: direct, title: 'Your pick', thumbnail: `https://i.ytimg.com/vi/${direct}/default.jpg` });
      setResults([]);
      return;
    }

    // 2) Real keyword search when an API key is configured.
    if (apiKey) {
      setSearching(true);
      try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=15&q=${encodeURIComponent(q)}&key=${apiKey}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.error) {
          setNote('Search key was rejected by YouTube. Check the key, or paste a link instead.');
        } else if (Array.isArray(json.items)) {
          setResults(json.items
            .filter((it: any) => it.id && it.id.videoId)
            .map((it: any) => ({
              videoId: it.id.videoId,
              title: (it.snippet?.title || 'Untitled').replace(/&/g, '&').replace(/'/g, "'").replace(/"/g, '"'),
              thumbnail: it.snippet?.thumbnails?.default?.url || `https://i.ytimg.com/vi/${it.id.videoId}/default.jpg`,
            })));
        }
      } catch (e) {
        setNote('Could not reach YouTube search. Paste a link to play instead.');
      } finally {
        setSearching(false);
      }
      return;
    }

    // 3) No key: best-effort search playlist via the IFrame API.
    const p = playerRef.current;
    if (p && typeof p.loadPlaylist === 'function') {
      try {
        p.loadPlaylist({ listType: 'search', list: q });
        setCurrent({ videoId: '', title: `Search: ${q}`, thumbnail: '' });
        setOpen(true);
        setNote('Playing search results. Add a free YouTube API key for clickable results.');
      } catch {
        setNote('Add a free YouTube API key to search by name, or paste a YouTube link.');
      }
    } else {
      setNote('Add a free YouTube API key to search by name, or paste a YouTube link.');
    }
  }, [query, apiKey, playTrack]);

  const saveKey = useCallback(async () => {
    const k = keyDraft.trim();
    setApiKey(k);
    setShowKeyInput(false);
    const d = db();
    if (!d) return;
    try {
      const cfg = await d.from('jukebox_config', { shared: true }).get();
      const row = (cfg || []).find((r: any) => r.config_key === 'youtube_api_key');
      if (row) await d.from('jukebox_config', { shared: true }).update(row.id, { config_value: k });
      else await d.from('jukebox_config', { shared: true }).insert({ config_key: 'youtube_api_key', config_value: k });
    } catch {}
  }, [keyDraft]);

  // ---------------------------------------------------------------------------
  // The YT player div MUST stay mounted at all times to keep audio alive.
  // When the panel is closed we shrink it to 1px (offscreen) rather than
  // removing it — that is the whole trick behind cross-room persistence.
  // ---------------------------------------------------------------------------
  return (
    <>
      {/* Always-mounted (hidden when closed) YouTube surface */}
      <div style={{
        position: 'fixed',
        left: open ? 16 : -9999,
        bottom: open ? 168 : 0,
        width: open ? 320 : 1,
        height: open ? 180 : 1,
        zIndex: 1400,
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: open ? '0 8px 30px rgba(0,0,0,0.6)' : 'none',
        border: open ? `1px solid rgba(245,158,11,0.4)` : 'none',
        background: '#000',
      }}>
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Floating toggle button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open jukebox"
          style={{
            position: 'fixed', left: 16, bottom: 100, zIndex: 1401,
            width: 52, height: 52, borderRadius: '50%',
            background: isPlaying ? GOLD : 'rgba(245,158,11,0.22)',
            border: `1px solid ${GOLD}`, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isPlaying ? `0 0 18px ${GOLD}` : '0 4px 12px rgba(0,0,0,0.5)',
            transition: 'all 0.25s ease',
          }}
        >
          <Music className="w-6 h-6" style={{ color: isPlaying ? '#000' : GOLD }} />
        </button>
      )}

      {/* Player panel */}
      {open && (
        <div style={{
          position: 'fixed', left: 16, bottom: 100, zIndex: 1402,
          width: 320, maxWidth: 'calc(100vw - 32px)',
          background: PANEL_BG, backdropFilter: 'blur(12px)',
          border: `1px solid rgba(245,158,11,0.35)`, borderRadius: 14,
          boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
          fontFamily: '"Space Grotesk", system-ui, sans-serif', color: '#fff',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Music className="w-4 h-4" style={{ color: GOLD }} />
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.3 }}>DAM Jukebox</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Minimize" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          <div style={{ padding: '10px 12px 6px' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 9, padding: '7px 10px' }}>
                <Search className="w-4 h-4" style={{ color: '#9ca3af', flexShrink: 0 }} />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') runSearch(); }}
                  placeholder="Search a song or paste a link"
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 13, minWidth: 0 }}
                />
              </div>
              <button onClick={runSearch} disabled={searching} style={{ background: GOLD, border: 'none', borderRadius: 9, padding: '0 12px', cursor: 'pointer', fontWeight: 700, color: '#000', fontSize: 13 }}>
                {searching ? '…' : 'Go'}
              </button>
            </div>
            {note && <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 6, lineHeight: 1.4 }}>{note}</div>}
          </div>

          {/* Now playing */}
          {current && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px 10px' }}>
              {current.thumbnail
                ? <img src={current.thumbnail} alt="" style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 44, height: 44, borderRadius: 6, background: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ListMusic className="w-5 h-5" style={{ color: GOLD }} /></div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{current.title}</div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>{isPlaying ? 'Playing' : 'Paused'}</div>
              </div>
              <button onClick={togglePlay} aria-label="Play/pause" style={{ background: GOLD, border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isPlaying ? <Pause className="w-4 h-4" style={{ color: '#000' }} /> : <Play className="w-4 h-4" style={{ color: '#000' }} />}
              </button>
              <button onClick={playNext} aria-label="Skip" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <SkipForward className="w-4 h-4" style={{ color: '#fff' }} />
              </button>
              <button onClick={toggleMute} aria-label="Mute" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
                {muted ? <VolumeX className="w-4 h-4" style={{ color: '#9ca3af' }} /> : <Volume2 className="w-4 h-4" style={{ color: '#9ca3af' }} />}
              </button>
            </div>
          )}

          {/* Search results */}
          {results.length > 0 && (
            <div style={{ maxHeight: 200, overflowY: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {results.map(r => (
                <div key={r.videoId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', cursor: 'pointer' }}>
                  <img src={r.thumbnail} alt="" style={{ width: 36, height: 36, borderRadius: 5, objectFit: 'cover', flexShrink: 0 }} onClick={() => playTrack(r)} />
                  <div style={{ flex: 1, minWidth: 0, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => playTrack(r)}>{r.title}</div>
                  <button onClick={() => enqueue(r)} aria-label="Add to queue" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Plus className="w-4 h-4" style={{ color: GOLD }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quick stations (shown when no search results) */}
          {results.length === 0 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '8px 12px 10px' }}>
              <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Quick vibes</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {QUICK_STATIONS.map(s => (
                  <button key={s.label} onClick={() => playStation(s)} style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 14, padding: '5px 10px', cursor: 'pointer', color: '#fde68a', fontSize: 11, fontWeight: 600 }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Queue + key footer */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 5 }}>
              <ListMusic className="w-3.5 h-3.5" /> {queue.length} queued
            </span>
            {!showKeyInput ? (
              <button onClick={() => { setKeyDraft(apiKey); setShowKeyInput(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: apiKey ? '#22c55e' : '#9ca3af', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                <LinkIcon className="w-3.5 h-3.5" /> {apiKey ? 'Search key set' : 'Add search key'}
              </button>
            ) : null}
          </div>

          {showKeyInput && (
            <div style={{ padding: '0 12px 12px' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6, lineHeight: 1.4 }}>
                Paste a free YouTube Data API v3 key to search by song name. Without it you can still paste links and use quick vibes.
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input value={keyDraft} onChange={e => setKeyDraft(e.target.value)} placeholder="YouTube API key" style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, padding: '7px 10px', color: '#fff', fontSize: 12, outline: 'none', minWidth: 0 }} />
                <button onClick={saveKey} style={{ background: GOLD, border: 'none', borderRadius: 8, padding: '0 12px', cursor: 'pointer', fontWeight: 700, color: '#000', fontSize: 12 }}>Save</button>
                <button onClick={() => setShowKeyInput(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '0 10px', cursor: 'pointer', color: '#fff', fontSize: 12 }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
