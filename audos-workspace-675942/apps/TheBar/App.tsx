// The Bar — FIRST-PERSON WALK-IN LOUNGE v11.0
// ═══════════════════════════════════════════════════════════════════════════
// Matches the Casino Floor's first-person immersive aesthetic (neon red + blue
// on dark, parallax depth). When you open The Bar you feel like you just walked
// into an upscale neon-lit lounge in FIRST PERSON: looking toward the bar
// counter with the bartender behind it, bar stools in the foreground, glowing
// bottle shelves behind the bar, booths in the background. Layers shift on
// mouse-move for the 5D/8D parallax feel.
//
// EVERY EXISTING FEATURE IS PRESERVED, reframed as clickable in-scene HOTSPOTS:
//   • Jukebox (4-tier subscription + genres incl. Rap/Hip-Hop)
//   • Mini-games: Darts, Pinball, Plinko
//   • Open chat / social booth
//   • Interactive bartender (talk / order drinks)
//   • Avatar shop (wardrobe / mirror)
//   • Cash-out / cashier (register)
//
// SWEEPSTAKES COMPLIANT: dual currency (Gold Coins for free play, Sweeps Coins
// redeemable for prizes), 21+ framing throughout. Mobile-responsive.
import React, { useState, useEffect, useRef, useCallback } from 'https://esm.sh/react@18';

// ============================================================
// CONSTANTS & PALETTE (DAM Fortunes: dark + neon red + neon blue)
// ============================================================
const FONT = 'Space Grotesk';
const BASE = '#04040a';
const NEON_RED = '#ff2a4d';
const NEON_BLUE = '#00d4ff';
const NEON_PURPLE = '#a855f7';
const GC_GOLD = '#ffd24a';
const SC_PURPLE = '#a855f7';

type Currency = 'GC' | 'SC';
type PanelId =
  | 'jukebox'
  | 'darts'
  | 'pinball'
  | 'plinko'
  | 'chat'
  | 'bartender'
  | 'avatar'
  | 'cashier'
  | null;

// ============================================================
// DATA
// ============================================================

interface JukeTrack { title: string; artist: string; duration: string; }
interface JukeGenre { id: string; label: string; icon: string; tracks: JukeTrack[]; }

// Rap / Hip-Hop loads FIRST by default (per the brand's social audience).
const JUKEBOX_GENRES: JukeGenre[] = [
  {
    id: 'rap', label: 'Rap / Hip-Hop', icon: '🎤',
    tracks: [
      { title: 'A Milli', artist: 'Lil Wayne', duration: '3:41' },
      { title: 'Lollipop', artist: 'Lil Wayne', duration: '4:59' },
      { title: '6 Foot 7 Foot', artist: 'Lil Wayne', duration: '4:10' },
      { title: 'Wipe Me Down', artist: 'Lil Boosie', duration: '4:52' },
      { title: 'Lemonade', artist: 'Gucci Mane', duration: '4:01' },
      { title: 'What You Know', artist: 'T.I.', duration: '4:48' },
      { title: 'Soul Survivor', artist: 'Young Jeezy', duration: '4:08' },
      { title: 'Put On', artist: 'Young Jeezy', duration: '4:34' },
    ],
  },
  {
    id: 'rnb', label: 'R&B / Soul', icon: '💜',
    tracks: [
      { title: 'Smooth Operator', artist: 'Sade', duration: '4:58' },
      { title: 'Purple Rain', artist: 'Prince', duration: '8:41' },
      { title: 'Superstition', artist: 'Stevie Wonder', duration: '4:26' },
      { title: 'Billie Jean', artist: 'Michael Jackson', duration: '4:54' },
    ],
  },
  {
    id: 'rock', label: 'Rock', icon: '🎸',
    tracks: [
      { title: 'Hotel California', artist: 'Eagles', duration: '6:30' },
      { title: 'Born to Run', artist: 'Bruce Springsteen', duration: '4:30' },
      { title: 'Sweet Child O Mine', artist: 'Guns N Roses', duration: '5:56' },
    ],
  },
  {
    id: 'blues', label: 'Blues', icon: '🎷',
    tracks: [
      { title: 'The Thrill Is Gone', artist: 'B.B. King', duration: '5:24' },
      { title: 'Pride and Joy', artist: 'Stevie Ray Vaughan', duration: '4:11' },
    ],
  },
  {
    id: 'classic', label: 'Classic Hits', icon: '✨',
    tracks: [
      { title: 'Fly Me to the Moon', artist: 'Frank Sinatra', duration: '2:27' },
      { title: 'Take Five', artist: 'Dave Brubeck', duration: '5:24' },
    ],
  },
];

interface JukeTier { id: string; name: string; price: string; tagline: string; perks: string[]; color: string; }
const JUKEBOX_TIERS: JukeTier[] = [
  { id: 'free', name: 'Free', price: '$0', tagline: 'Basic listening', color: 'rgba(255,255,255,0.6)', perks: ['5 song requests / day', 'Ads between tracks', 'Standard queue'] },
  { id: 'plus', name: 'Plus', price: '$4.99/mo', tagline: 'Ad-free vibes', color: NEON_BLUE, perks: ['Unlimited requests', 'No ads', 'Skip tracks'] },
  { id: 'pro', name: 'Pro', price: '$9.99/mo', tagline: 'Priority + exclusives', color: NEON_PURPLE, perks: ['Everything in Plus', 'Priority queue (your songs first)', 'Exclusive premium tracks'] },
  { id: 'vip', name: 'VIP DJ', price: '$19.99/mo', tagline: 'Run the room', color: NEON_RED, perks: ['Everything in Pro', 'Control the room playlist', 'VIP badge in chat', '7-day free trial'] },
];

interface Drink { id: string; name: string; emoji: string; note: string; }
const DRINKS: Drink[] = [
  { id: 'beer', name: 'Draft Beer', emoji: '🍺', note: 'Ice cold, just right' },
  { id: 'whiskey', name: 'Whiskey Neat', emoji: '🥃', note: 'For the serious drinker' },
  { id: 'marg', name: 'Margarita', emoji: '🍹', note: 'Salty rim, lime fresh' },
  { id: 'bourbon', name: 'Bourbon', emoji: '🍸', note: 'Smooth and smoky' },
  { id: 'red', name: 'House Red', emoji: '🍷', note: 'A solid pour' },
  { id: 'lemonade', name: 'Lemonade', emoji: '🍋', note: 'On the house!' },
];

const BARTENDER_LINES = [
  'What can I get ya, hon?',
  'Another round?',
  'Long day? I got just the thing!',
  'First one is on the house — welcome to The Bar.',
  'Music sounding good tonight, huh?',
];

interface ShopItem { id: string; name: string; emoji: string; price: number; }
const AVATAR_ITEMS: ShopItem[] = [
  { id: 'shades', name: 'Neon Shades', emoji: '🕶️', price: 8000 },
  { id: 'jacket', name: 'Leather Jacket', emoji: '🧥', price: 15000 },
  { id: 'jordans', name: 'Rare Jordans', emoji: '👟', price: 30000 },
  { id: 'crown', name: 'VIP Crown', emoji: '👑', price: 50000 },
  { id: 'grill', name: 'Gold Grill', emoji: '😁', price: 60000 },
  { id: 'fur', name: 'Fur Coat', emoji: '🦝', price: 80000 },
  { id: 'chain', name: 'Diamond Chain', emoji: '💎', price: 100000 },
  { id: 'wings', name: 'Angel Wings', emoji: '🪽', price: 200000 },
];

interface ChatMsg { id: number; user: string; color: string; text: string; }
const SEED_CHAT: ChatMsg[] = [
  { id: 1, user: 'LuckyLisa', color: '#ff6b9d', text: 'Just walked in — this place looks unreal 🔥' },
  { id: 2, user: 'HighRoller_Mike', color: '#4ecdc4', text: 'Who wants to throw some darts?' },
  { id: 3, user: 'ChillVibes_Alex', color: '#74b9ff', text: 'Put some Lil Wayne on the jukebox 🎤' },
  { id: 4, user: 'BarFly_Jenny', color: '#ffd93d', text: 'Cheers everyone 🍻' },
];
const QUICK_CHATS = ['🍻 Cheers!', 'Nice shot! 🎯', 'Play some music!', 'Who wants to shoot pool?'];

const formatCoins = (n: number) => Math.max(0, Math.floor(n)).toLocaleString();

// Smooth count-up for balance pills (juice when balances change)
const useCountUp = (value: number, duration = 520) => {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    // Snap (no animation) on very large jumps like a GC<->SC currency toggle
    if (Math.abs(to - from) > 5000) { fromRef.current = to; setDisplay(to); return; }
    let raf = 0; let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) { raf = window.requestAnimationFrame(step); } else { fromRef.current = to; }
    };
    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
};

// ============================================================
// SHARED MODAL SHELL
// ============================================================
interface ModalProps { title: string; accent: string; icon: string; onClose: () => void; children: React.ReactNode; maxWidth?: number; }
const Modal: React.FC<ModalProps> = ({ title, accent, icon, onClose, children, maxWidth = 480 }) => (
  <div
    onClick={onClose}
    style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px' }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: '100%', maxWidth: `${maxWidth}px`, maxHeight: '92vh', overflowY: 'auto',
        borderRadius: '20px', background: 'linear-gradient(180deg, #15131f 0%, #0a0a12 100%)',
        border: `2px solid ${accent}`, boxShadow: `0 0 60px ${accent}55`,
      }}
    >
      <div style={{ position: 'sticky', top: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: `1px solid ${accent}44`, background: 'rgba(10,10,18,0.95)', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <span style={{ fontSize: '22px' }}>{icon}</span>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: accent, textShadow: `0 0 14px ${accent}66`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h2>
        </div>
        <button onClick={onClose} aria-label="Close" style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '20px', lineHeight: 1 }}>✕</button>
      </div>
      <div style={{ padding: '18px' }}>{children}</div>
    </div>
  </div>
);

const ComplianceLine: React.FC = () => (
  <p style={{ margin: '14px 0 0', fontSize: '10px', textAlign: 'center', lineHeight: 1.5, color: 'rgba(255,255,255,0.42)' }}>
    For entertainment only. Gold Coins have no cash value. Sweeps Coins redeemable for prizes per Official Rules. No purchase necessary. 21+.
  </p>
);

// ============================================================
// JUKEBOX PANEL (4-tier subscription + genres incl. Rap)
// ============================================================
interface JukeboxProps {
  onClose: () => void;
  isPlaying: boolean; setIsPlaying: (v: boolean) => void;
  currentTrack: JukeTrack | null; setCurrentTrack: (t: JukeTrack) => void;
  tier: string; setTier: (t: string) => void;
}
const JukeboxPanel: React.FC<JukeboxProps> = ({ onClose, isPlaying, setIsPlaying, currentTrack, setCurrentTrack, tier, setTier }) => {
  const [genreId, setGenreId] = useState('rap');
  const [showTiers, setShowTiers] = useState(false);
  const genre = JUKEBOX_GENRES.find((g) => g.id === genreId) || JUKEBOX_GENRES[0];

  return (
    <Modal title="The Jukebox" icon="🎵" accent={NEON_RED} onClose={onClose} maxWidth={560}>
      {/* Now playing */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', borderRadius: '14px', marginBottom: '14px', background: 'linear-gradient(135deg, rgba(255,42,77,0.15), rgba(0,212,255,0.12))', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ position: 'relative', width: '62px', height: '62px', flexShrink: 0 }}>
          {/* spinning vinyl record with grooves + center label */}
          <div style={{ width: '62px', height: '62px', borderRadius: '50%', background: 'repeating-radial-gradient(circle at center, #111 0 1.5px, #1d1d1d 1.5px 3px), radial-gradient(circle at 36% 30%, rgba(255,255,255,0.18), transparent 45%)', border: '2px solid #2a2a2a', boxShadow: '0 2px 8px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: isPlaying ? 'vinylSpin 2.2s linear infinite' : 'none' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `radial-gradient(circle at center, #fff 18%, ${NEON_RED} 20%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#0a0a0f' }} />
            </div>
          </div>
          {/* tonearm — drops onto the record while playing */}
          <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '34px', height: '5px', borderRadius: '3px', transformOrigin: 'right center', transform: isPlaying ? 'rotate(0deg)' : 'rotate(-22deg)', transition: 'transform 0.5s ease', background: 'linear-gradient(90deg, #ddd, #888)', boxShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            <div style={{ position: 'absolute', left: '-2px', top: '-1px', width: '6px', height: '7px', borderRadius: '2px', background: NEON_BLUE, boxShadow: `0 0 6px ${NEON_BLUE}` }} />
            <div style={{ position: 'absolute', right: '-3px', top: '-2px', width: '9px', height: '9px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #eee, #777)' }} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '10px', letterSpacing: '1px', color: 'rgba(255,255,255,0.5)' }}>{isPlaying ? '♫ NOW PLAYING' : '♫ PAUSED'}</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTrack ? currentTrack.title : 'Pick a track'}</div>
          <div style={{ fontSize: '12px', color: NEON_BLUE }}>{currentTrack ? currentTrack.artist : '—'}</div>
        </div>
        <button onClick={() => setIsPlaying(!isPlaying)} style={{ width: '50px', height: '50px', borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#0a0a0f', background: `linear-gradient(135deg, ${NEON_RED}, ${NEON_BLUE})`, boxShadow: `0 4px 18px ${NEON_RED}66` }}>{isPlaying ? '⏸' : '▶'}</button>
      </div>

      {/* Subscription banner */}
      <button onClick={() => setShowTiers((s) => !s)} style={{ width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: '12px', marginBottom: '14px', cursor: 'pointer', background: 'linear-gradient(135deg, rgba(168,85,247,0.18), rgba(0,212,255,0.1))', border: '1px solid rgba(168,85,247,0.4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700 }}>👑 Jukebox Membership — <span style={{ color: NEON_PURPLE }}>{(JUKEBOX_TIERS.find((t) => t.id === tier) || JUKEBOX_TIERS[0]).name}</span></span>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{showTiers ? '▲ Hide tiers' : '▼ View 4 tiers'}</span>
      </button>

      {showTiers && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          {JUKEBOX_TIERS.map((t) => {
            const active = t.id === tier;
            return (
              <div key={t.id} style={{ borderRadius: '12px', padding: '12px', background: active ? `${t.color}1f` : 'rgba(255,255,255,0.04)', border: `1.5px solid ${active ? t.color : 'rgba(255,255,255,0.12)'}` }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: t.color }}>{t.name}</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '2px 0' }}>{t.price}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', marginBottom: '8px' }}>{t.tagline}</div>
                <ul style={{ margin: 0, padding: '0 0 0 14px', listStyle: 'disc' }}>
                  {t.perks.map((p) => (<li key={p} style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{p}</li>))}
                </ul>
                <button onClick={() => setTier(t.id)} disabled={active} style={{ marginTop: '10px', width: '100%', minHeight: '40px', borderRadius: '9px', border: 'none', cursor: active ? 'default' : 'pointer', fontSize: '12px', fontWeight: 800, color: active ? 'rgba(255,255,255,0.6)' : '#0a0a0f', background: active ? 'rgba(255,255,255,0.08)' : `linear-gradient(135deg, ${t.color}, #ffffff 240%)` }}>
                  {active ? 'Current Plan' : t.id === 'free' ? 'Downgrade' : 'Subscribe'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Genre tabs */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {JUKEBOX_GENRES.map((g) => (
          <button key={g.id} onClick={() => setGenreId(g.id)} style={{ padding: '8px 12px', minHeight: '40px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, border: `1px solid ${genreId === g.id ? NEON_BLUE : 'rgba(255,255,255,0.15)'}`, background: genreId === g.id ? 'rgba(0,212,255,0.18)' : 'rgba(255,255,255,0.05)', color: genreId === g.id ? NEON_BLUE : 'rgba(255,255,255,0.8)' }}>
            {g.icon} {g.label}
          </button>
        ))}
      </div>

      {/* Track list */}
      <div style={{ maxHeight: '240px', overflowY: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
        {genre.tracks.map((track, i) => {
          const sel = currentTrack && currentTrack.title === track.title && currentTrack.artist === track.artist;
          return (
            <button key={`${track.title}-${i}`} onClick={() => { setCurrentTrack(track); setIsPlaying(true); }} style={{ width: '100%', minHeight: '48px', textAlign: 'left', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', background: sel ? 'rgba(255,42,77,0.14)' : 'transparent' }}>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</span>
                <span style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{track.artist}</span>
              </span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>{sel && isPlaying ? '♫' : track.duration}</span>
            </button>
          );
        })}
      </div>
      <ComplianceLine />
    </Modal>
  );
};

// ============================================================
// MINI-GAME HELPERS
// ============================================================
interface GameApiProps {
  currency: Currency;
  balance: number;
  spend: (amt: number) => boolean;
  award: (amt: number) => void;
  onClose: () => void;
}
const BET_OPTIONS_GC = [50, 100, 200, 500, 1000, 2000];
const BET_OPTIONS_SC = [1, 2, 5, 10, 20];

const BetSelector: React.FC<{ currency: Currency; bet: number; setBet: (n: number) => void; disabled?: boolean }> = ({ currency, bet, setBet, disabled }) => {
  const opts = currency === 'GC' ? BET_OPTIONS_GC : BET_OPTIONS_SC;
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '12px' }}>
      {opts.map((o) => (
        <button key={o} disabled={disabled} onClick={() => setBet(o)} style={{ padding: '7px 12px', minHeight: '40px', borderRadius: '10px', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 800, border: `1px solid ${bet === o ? (currency === 'GC' ? GC_GOLD : SC_PURPLE) : 'rgba(255,255,255,0.15)'}`, background: bet === o ? (currency === 'GC' ? 'rgba(255,210,74,0.18)' : 'rgba(168,85,247,0.18)') : 'rgba(255,255,255,0.05)', color: bet === o ? (currency === 'GC' ? GC_GOLD : SC_PURPLE) : 'rgba(255,255,255,0.8)' }}>
          {o.toLocaleString()} {currency}
        </button>
      ))}
    </div>
  );
};

// Win-celebration burst (confetti + flash ring) shown over a game board on a win
const WinBurst: React.FC<{ color: string }> = ({ color }) => {
  const bits = ['#ffd24a', NEON_RED, NEON_BLUE, NEON_PURPLE, '#4ade80'];
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5, overflow: 'hidden' }}>
      {/* expanding flash ring */}
      <div style={{ position: 'absolute', left: '50%', top: '46%', width: '120px', height: '120px', transform: 'translate(-50%,-50%)', borderRadius: '50%', border: `3px solid ${color}`, boxShadow: `0 0 30px ${color}`, animation: 'winFlash 0.8s ease-out forwards' }} />
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: `${10 + (i * 5.3) % 80}%`, top: '-6px', width: '6px', height: '10px', borderRadius: '1px', background: bits[i % bits.length], animation: `confettiFall ${0.9 + (i % 4) * 0.25}s ease-in forwards`, animationDelay: `${(i % 5) * 0.05}s` }} />
      ))}
    </div>
  );
};

// ============================================================
// DARTS GAME
// ============================================================
const DartsGame: React.FC<GameApiProps> = ({ currency, balance, spend, award, onClose }) => {
  const [bet, setBet] = useState(currency === 'GC' ? 100 : 5);
  const [phase, setPhase] = useState<'setup' | 'throwing' | 'result'>('setup');
  const [darts, setDarts] = useState<{ x: number; y: number; score: number }[]>([]);
  const [reticle, setReticle] = useState({ x: 50, y: 50 });
  const [houseScore, setHouseScore] = useState(0);
  const [outcome, setOutcome] = useState<{ win: boolean; payout: number } | null>(null);
  const tRef = useRef(0);

  // Animate the reticle while throwing
  useEffect(() => {
    if (phase !== 'throwing') return;
    const id = window.setInterval(() => {
      tRef.current += 0.13;
      setReticle({ x: 50 + Math.sin(tRef.current * 1.7) * 38, y: 50 + Math.cos(tRef.current) * 30 });
    }, 30);
    return () => window.clearInterval(id);
  }, [phase]);

  const scoreFor = (x: number, y: number) => {
    const d = Math.hypot(x - 50, y - 50);
    if (d < 5) return 50;      // bullseye
    if (d < 11) return 25;     // bull ring
    if (d < 22) return 20;
    if (d < 33) return 12;
    if (d < 44) return 6;
    return 0;                  // off the board
  };

  const start = () => {
    if (!spend(bet)) return;
    setDarts([]); setOutcome(null); setHouseScore(0); setPhase('throwing');
  };

  const throwDart = () => {
    if (phase !== 'throwing') return;
    const s = scoreFor(reticle.x, reticle.y);
    const next = [...darts, { x: reticle.x, y: reticle.y, score: s }];
    setDarts(next);
    if (next.length >= 3) {
      const total = next.reduce((a, b) => a + b.score, 0);
      const house = 35 + Math.floor(Math.random() * 55); // 35-89
      setHouseScore(house);
      const win = total >= house;
      const pot = bet * 2;
      const payout = win ? Math.floor(pot * 0.9) : 0; // 10% house cut
      if (win) award(payout);
      setOutcome({ win, payout });
      setPhase('result');
    }
  };

  const total = darts.reduce((a, b) => a + b.score, 0);

  return (
    <Modal title="Darts — 501 Bar Throw" icon="🎯" accent={NEON_RED} onClose={onClose} maxWidth={460}>
      <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
        Throw 3 darts. Beat the house total to win the pot (minus 10% house cut). Click the board to release each dart.
      </p>

      {phase === 'setup' && <BetSelector currency={currency} bet={bet} setBet={setBet} />}

      {/* Dartboard */}
      <div
        onClick={throwDart}
        style={{ position: 'relative', width: '230px', height: '230px', margin: '0 auto 14px', borderRadius: '50%', cursor: phase === 'throwing' ? 'crosshair' : 'default', background: 'radial-gradient(circle, #f5f0e1 0 5%, #b91c1c 5% 11%, #166534 11% 22%, #1a1a1a 22% 33%, #7a1010 33% 44%, #0f3d22 44% 56%, #15151f 56% 100%)', border: `4px solid ${NEON_RED}`, boxShadow: `0 0 30px ${NEON_RED}55` }}
      >
        {darts.map((d, i) => (
          <span key={i} style={{ position: 'absolute', left: `${d.x}%`, top: `${d.y}%`, transform: 'translate(-50%, -50%)', fontSize: '20px', filter: 'drop-shadow(0 0 4px #fff)' }}>🎯</span>
        ))}
        {phase === 'throwing' && (
          <span style={{ position: 'absolute', left: `${reticle.x}%`, top: `${reticle.y}%`, transform: 'translate(-50%, -50%)', fontSize: '22px', color: NEON_BLUE, filter: `drop-shadow(0 0 6px ${NEON_BLUE})` }}>✛</span>
        )}
        {phase === 'result' && outcome?.win && <WinBurst color={NEON_RED} />}
      </div>

      {/* Scoreboard */}
      <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginBottom: '12px' }}>
        <div><div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>YOUR TOTAL</div><div style={{ fontSize: '22px', fontWeight: 800, color: NEON_BLUE }}>{total}</div></div>
        <div><div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>DARTS</div><div style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>{darts.length}/3</div></div>
        <div><div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>HOUSE</div><div style={{ fontSize: '22px', fontWeight: 800, color: NEON_RED }}>{phase === 'result' ? houseScore : '?'}</div></div>
      </div>

      {outcome && (
        <div style={{ padding: '12px', borderRadius: '12px', textAlign: 'center', marginBottom: '12px', background: outcome.win ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.05)', border: `1px solid ${outcome.win ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.12)'}`, boxShadow: outcome.win ? '0 0 22px rgba(34,197,94,0.4)' : 'none', animation: outcome.win ? 'winPop 0.45s ease' : 'none' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: outcome.win ? '#4ade80' : 'rgba(255,255,255,0.7)' }}>
            {outcome.win ? `🏆 You win ${formatCoins(outcome.payout)} ${currency}!` : 'House takes it — throw again!'}
          </span>
        </div>
      )}

      {phase === 'setup' && (
        <button onClick={start} style={{ width: '100%', minHeight: '52px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 900, color: '#0a0a0f', background: `linear-gradient(135deg, ${NEON_RED}, ${NEON_BLUE})`, boxShadow: `0 6px 22px ${NEON_RED}55` }}>
          Ante {formatCoins(bet)} {currency} & Throw
        </button>
      )}
      {phase === 'throwing' && (
        <p style={{ textAlign: 'center', fontSize: '13px', fontWeight: 700, color: NEON_BLUE }}>Click the board to throw dart {darts.length + 1} of 3</p>
      )}
      {phase === 'result' && (
        <button onClick={() => setPhase('setup')} style={{ width: '100%', minHeight: '52px', borderRadius: '14px', border: `1px solid ${NEON_BLUE}`, cursor: 'pointer', fontSize: '15px', fontWeight: 800, color: NEON_BLUE, background: 'rgba(0,212,255,0.12)' }}>
          Play Again
        </button>
      )}
      <ComplianceLine />
    </Modal>
  );
};

// ============================================================
// PINBALL GAME
// ============================================================
const PINBALL_BUMPERS = [{ x: 30, y: 28 }, { x: 70, y: 30 }, { x: 50, y: 50 }, { x: 28, y: 66 }, { x: 72, y: 66 }];
const PinballGame: React.FC<GameApiProps> = ({ currency, balance, spend, award, onClose }) => {
  const [bet, setBet] = useState(currency === 'GC' ? 100 : 5);
  const [phase, setPhase] = useState<'setup' | 'playing' | 'result'>('setup');
  const [ball, setBall] = useState({ x: 50, y: 88 });
  const [score, setScore] = useState(0);
  const [mult, setMult] = useState(1);
  const [litBumper, setLitBumper] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<{ payout: number } | null>(null);

  useEffect(() => {
    if (phase !== 'playing') return;
    let hits = 0;
    let localScore = 0;
    let localMult = 1;
    const id = window.setInterval(() => {
      const b = PINBALL_BUMPERS[Math.floor(Math.random() * PINBALL_BUMPERS.length)];
      const bi = PINBALL_BUMPERS.indexOf(b);
      setBall({ x: b.x + (Math.random() * 8 - 4), y: b.y + (Math.random() * 8 - 4) });
      setLitBumper(bi);
      const pts = (100 + Math.floor(Math.random() * 150)) * localMult;
      localScore += pts;
      setScore(localScore);
      if (Math.random() > 0.72 && localMult < 5) { localMult += 1; setMult(localMult); }
      hits += 1;
      if (hits >= 14) {
        window.clearInterval(id);
        setLitBumper(null);
        setBall({ x: 50, y: 92 });
        // payout tiers
        let m = 0;
        if (localScore > 2600) m = 3;
        else if (localScore > 1700) m = 1.5;
        else if (localScore > 900) m = 1;
        const payout = Math.floor(bet * m);
        if (payout > 0) award(payout);
        setOutcome({ payout });
        setPhase('result');
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [phase]);

  const launch = () => {
    if (!spend(bet)) return;
    setScore(0); setMult(1); setOutcome(null); setBall({ x: 50, y: 88 }); setPhase('playing');
  };

  return (
    <Modal title="Pinball" icon="🕹️" accent={NEON_BLUE} onClose={onClose} maxWidth={420}>
      {phase === 'setup' && <BetSelector currency={currency} bet={bet} setBet={setBet} />}

      <div style={{ position: 'relative', width: '100%', maxWidth: '300px', aspectRatio: '3 / 4', margin: '0 auto 14px', borderRadius: '14px', overflow: 'hidden', background: 'linear-gradient(180deg, #0a0a18, #120c20)', border: `2px solid ${NEON_BLUE}`, boxShadow: `inset 0 0 30px ${NEON_BLUE}33` }}>
        {PINBALL_BUMPERS.map((b, i) => (
          <div key={i} style={{ position: 'absolute', left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%, -50%)', width: '34px', height: '34px', borderRadius: '50%', background: litBumper === i ? `radial-gradient(circle, ${NEON_RED}, ${NEON_RED}66)` : 'radial-gradient(circle, #2a2a44, #15151f)', border: `2px solid ${litBumper === i ? NEON_RED : 'rgba(255,255,255,0.2)'}`, boxShadow: litBumper === i ? `0 0 18px ${NEON_RED}` : 'none', transition: 'all 0.1s' }} />
        ))}
        {/* Ball */}
        <div style={{ position: 'absolute', left: `${ball.x}%`, top: `${ball.y}%`, transform: 'translate(-50%, -50%)', width: '16px', height: '16px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #fff, #888)', boxShadow: '0 0 10px #fff', transition: 'all 0.12s linear' }} />
        {/* Score HUD */}
        <div style={{ position: 'absolute', top: '6px', left: '6px', right: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800 }}>
          <span style={{ color: NEON_BLUE }}>SCORE {score.toLocaleString()}</span>
          <span style={{ color: NEON_RED }}>x{mult}</span>
        </div>
        {phase === 'result' && outcome && outcome.payout > 0 && <WinBurst color={NEON_BLUE} />}
      </div>

      {outcome && (
        <div style={{ padding: '12px', borderRadius: '12px', textAlign: 'center', marginBottom: '12px', background: outcome.payout > 0 ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.05)', border: `1px solid ${outcome.payout > 0 ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.12)'}`, boxShadow: outcome.payout > 0 ? '0 0 22px rgba(34,197,94,0.4)' : 'none', animation: outcome.payout > 0 ? 'winPop 0.45s ease' : 'none' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: outcome.payout > 0 ? '#4ade80' : 'rgba(255,255,255,0.7)' }}>
            {outcome.payout > 0 ? `🎉 ${formatCoins(outcome.payout)} ${currency} payout!` : 'No payout this ball — launch again!'}
          </span>
        </div>
      )}

      {phase === 'setup' && (
        <button onClick={launch} style={{ width: '100%', minHeight: '52px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 900, color: '#0a0a0f', background: `linear-gradient(135deg, ${NEON_BLUE}, ${NEON_RED})`, boxShadow: `0 6px 22px ${NEON_BLUE}55` }}>
          Pull & Launch — {formatCoins(bet)} {currency}
        </button>
      )}
      {phase === 'playing' && <p style={{ textAlign: 'center', fontSize: '13px', fontWeight: 700, color: NEON_BLUE }}>Ball in play…</p>}
      {phase === 'result' && (
        <button onClick={() => setPhase('setup')} style={{ width: '100%', minHeight: '52px', borderRadius: '14px', border: `1px solid ${NEON_BLUE}`, cursor: 'pointer', fontSize: '15px', fontWeight: 800, color: NEON_BLUE, background: 'rgba(0,212,255,0.12)' }}>
          Play Again
        </button>
      )}
      <ComplianceLine />
    </Modal>
  );
};

// ============================================================
// PLINKO GAME
// ============================================================
const PLINKO_ROWS = 8;
const PLINKO_SLOTS = [9, 3, 1.5, 0.5, 0.3, 0.5, 1.5, 3, 9]; // 9 slots
const PlinkoGame: React.FC<GameApiProps> = ({ currency, balance, spend, award, onClose }) => {
  const [bet, setBet] = useState(currency === 'GC' ? 100 : 5);
  const [phase, setPhase] = useState<'setup' | 'dropping' | 'result'>('setup');
  const [chip, setChip] = useState({ x: 50, row: -1 });
  const [outcome, setOutcome] = useState<{ mult: number; payout: number; slot: number } | null>(null);

  const drop = () => {
    if (!spend(bet)) return;
    setOutcome(null); setPhase('dropping');
    // Pre-compute path: random left/right per row
    let pos = 0; // -ROWS .. +ROWS
    const steps: number[] = [];
    for (let r = 0; r < PLINKO_ROWS; r++) { pos += Math.random() > 0.5 ? 1 : -1; steps.push(pos); }
    let r = 0;
    const id = window.setInterval(() => {
      const xPct = 50 + (steps[r] / PLINKO_ROWS) * 38;
      setChip({ x: xPct, row: r });
      r += 1;
      if (r >= PLINKO_ROWS) {
        window.clearInterval(id);
        // landing slot 0..8 from final pos
        const slot = Math.max(0, Math.min(PLINKO_SLOTS.length - 1, Math.round((pos + PLINKO_ROWS) / 2)));
        const mult = PLINKO_SLOTS[slot];
        const payout = Math.floor(bet * mult);
        if (payout > 0) award(payout);
        setChip({ x: 50 + ((slot - (PLINKO_SLOTS.length - 1) / 2) / ((PLINKO_SLOTS.length - 1) / 2)) * 42, row: PLINKO_ROWS });
        setOutcome({ mult, payout, slot });
        setPhase('result');
      }
    }, 180);
  };

  return (
    <Modal title="Plinko" icon="🪙" accent={NEON_PURPLE} onClose={onClose} maxWidth={420}>
      {phase === 'setup' && <BetSelector currency={currency} bet={bet} setBet={setBet} />}

      <div style={{ position: 'relative', width: '100%', maxWidth: '320px', aspectRatio: '1 / 1', margin: '0 auto 12px', borderRadius: '14px', background: 'linear-gradient(180deg, #0a0a18, #140c22)', border: `2px solid ${NEON_PURPLE}`, overflow: 'hidden' }}>
        {/* Pegs */}
        {Array.from({ length: PLINKO_ROWS }).map((_, r) => (
          <div key={r} style={{ position: 'absolute', left: 0, right: 0, top: `${8 + r * 9}%`, display: 'flex', justifyContent: 'center', gap: '7%' }}>
            {Array.from({ length: r + 3 }).map((__, c) => (
              <div key={c} style={{ width: '6px', height: '6px', borderRadius: '50%', background: chip.row === r ? NEON_RED : 'rgba(255,255,255,0.4)', boxShadow: chip.row === r ? `0 0 8px ${NEON_RED}` : 'none' }} />
            ))}
          </div>
        ))}
        {/* Chip */}
        {phase !== 'setup' && (
          <div style={{ position: 'absolute', left: `${chip.x}%`, top: `${chip.row < 0 ? 2 : 8 + chip.row * 9}%`, transform: 'translate(-50%, -50%)', width: '16px', height: '16px', borderRadius: '50%', background: `radial-gradient(circle at 30% 30%, #fff, ${NEON_PURPLE})`, boxShadow: `0 0 12px ${NEON_PURPLE}`, transition: 'all 0.16s linear' }} />
        )}
        {/* Slots */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex' }}>
          {PLINKO_SLOTS.map((m, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '4px 0', fontSize: '9px', fontWeight: 800, color: '#0a0a0f', background: outcome && outcome.slot === i ? '#fff' : m >= 3 ? NEON_RED : m >= 1 ? NEON_BLUE : 'rgba(168,85,247,0.7)', borderRight: i < PLINKO_SLOTS.length - 1 ? '1px solid rgba(0,0,0,0.4)' : 'none' }}>
              {m}x
            </div>
          ))}
        </div>
        {phase === 'result' && outcome && outcome.payout >= bet && <WinBurst color={NEON_PURPLE} />}
      </div>

      {outcome && (
        <div style={{ padding: '12px', borderRadius: '12px', textAlign: 'center', marginBottom: '12px', background: outcome.payout >= bet ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.05)', border: `1px solid ${outcome.payout >= bet ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.12)'}`, boxShadow: outcome.payout >= bet ? '0 0 22px rgba(34,197,94,0.4)' : 'none', animation: outcome.payout >= bet ? 'winPop 0.45s ease' : 'none' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: outcome.payout >= bet ? '#4ade80' : 'rgba(255,255,255,0.75)' }}>
            {outcome.mult}x → {formatCoins(outcome.payout)} {currency}{outcome.mult >= 3 ? ' 🎉 BIG WIN!' : ''}
          </span>
        </div>
      )}

      {phase === 'setup' && (
        <button onClick={drop} style={{ width: '100%', minHeight: '52px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 900, color: '#0a0a0f', background: `linear-gradient(135deg, ${NEON_PURPLE}, ${NEON_BLUE})`, boxShadow: `0 6px 22px ${NEON_PURPLE}55` }}>
          Drop Chip — {formatCoins(bet)} {currency}
        </button>
      )}
      {phase === 'dropping' && <p style={{ textAlign: 'center', fontSize: '13px', fontWeight: 700, color: NEON_PURPLE }}>Dropping…</p>}
      {phase === 'result' && (
        <button onClick={() => setPhase('setup')} style={{ width: '100%', minHeight: '52px', borderRadius: '14px', border: `1px solid ${NEON_PURPLE}`, cursor: 'pointer', fontSize: '15px', fontWeight: 800, color: NEON_PURPLE, background: 'rgba(168,85,247,0.12)' }}>
          Drop Again
        </button>
      )}
      <ComplianceLine />
    </Modal>
  );
};

// ============================================================
// BARTENDER PANEL — real money flow (honest, no fake success)
// ============================================================
// Sweeps Coins redeem at $1.00 per SC. Minimum redemption 50 SC.
// Deposits use the real Stripe Checkout path; redemptions persist a real
// request that the owner reviews and pays out to PayPal under Official Rules.
const SC_TO_USD = 1;
const MIN_REDEEM_SC = 50;

// Gold Coin packages — prices mirror the live Dollar Day store. Do NOT invent prices.
interface GcPackage { id: string; dollars: number; goldCoins: number; sweepsCoins: number; label: string; badge: string | null; }
const GC_PACKAGES: GcPackage[] = [
  { id: 'starter', dollars: 1.99, goldCoins: 5000, sweepsCoins: 1, label: '5,000 Gold Coins', badge: 'Starter' },
  { id: 'bronze', dollars: 4.99, goldCoins: 10000, sweepsCoins: 2, label: '10,000 Gold Coins', badge: null },
  { id: 'silver', dollars: 9.99, goldCoins: 25000, sweepsCoins: 5, label: '25,000 Gold Coins', badge: null },
  { id: 'gold', dollars: 19.99, goldCoins: 60000, sweepsCoins: 12, label: '60,000 Gold Coins', badge: '20% bonus SC' },
  { id: 'platinum', dollars: 49.99, goldCoins: 200000, sweepsCoins: 40, label: '200,000 Gold Coins', badge: 'Best value' },
  { id: 'diamond', dollars: 99.99, goldCoins: 500000, sweepsCoins: 100, label: '500,000 Gold Coins', badge: 'VIP' },
];

interface RedemptionRequest { id: number; amount_sc: number; usd_value: number; paypal_email: string; status: string; created_at?: string; }

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending review', color: '#d97706' },
  approved: { label: 'Approved', color: NEON_BLUE },
  paid: { label: 'Paid to PayPal', color: '#22c55e' },
  rejected: { label: 'Not approved', color: NEON_RED },
};

const BartenderPanel: React.FC<{
  onClose: () => void;
  notify: (m: string) => void;
  goldCoins: number;
  sweepsCoins: number;
  onRedeem: (amt: number, paypalEmail: string) => Promise<boolean>;
  redemptions: RedemptionRequest[];
}> = ({ onClose, notify, goldCoins, sweepsCoins, onRedeem, redemptions }) => {
  const [tab, setTab] = useState<'add' | 'redeem'>('add');
  const [line, setLine] = useState(BARTENDER_LINES[0]);

  // Payment readiness: deposits are only "enabled" once the owner connects
  // and verifies their own payment account (Stripe Connect). In platform mode
  // we honestly report that payments are not enabled yet rather than routing
  // a sweepstakes deposit anywhere the owner cannot receive or reconcile it.
  const [payState, setPayState] = useState<'checking' | 'ready' | 'unavailable'>('checking');
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/space-data/payment-config.json');
        if (!res.ok) throw new Error('no config');
        const cfg = await res.json();
        const ownerConnected = cfg?.mode === 'connect' && !!cfg?.stripeAccountId;
        if (alive) setPayState(ownerConnected ? 'ready' : 'unavailable');
      } catch {
        if (alive) setPayState('unavailable');
      }
    })();
    return () => { alive = false; };
  }, []);

  // Add Gold Coins state
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);

  const buyPackage = async (pkg: GcPackage) => {
    setBuyError(null);
    if (payState !== 'ready') {
      setBuyError('Payments are not enabled yet. The owner needs to connect a payment account before deposits can be processed.');
      return;
    }
    setBuyingId(pkg.id);
    try {
      const baseUrl = window.location.href.split('?')[0];
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-App-Id': (window as any).__APP_ID__ || (window as any).__SPACE_ID__ || '' },
        body: JSON.stringify({
          amount: Math.round(pkg.dollars * 100),
          productName: `${pkg.goldCoins.toLocaleString()} Gold Coins`,
          productDescription: `${pkg.goldCoins.toLocaleString()} GC + ${pkg.sweepsCoins} SC bonus`,
          successUrl: `${baseUrl}?session_id={CHECKOUT_SESSION_ID}&payment_type=coins`,
          cancelUrl: baseUrl,
          metadata: { purchase_type: 'coin_package', gold_coins: String(pkg.goldCoins), sweeps_coins: String(pkg.sweepsCoins) },
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.checkoutUrl) {
        window.location.href = data.checkoutUrl; // real Stripe Checkout
        return;
      }
      setBuyError('Payments are not enabled yet. The owner needs to connect a payment account before deposits can be processed.');
    } catch {
      setBuyError('Could not reach the payment service. Please try again in a moment.');
    } finally {
      setBuyingId(null);
    }
  };

  // Redeem Sweeps Coins state
  const [amount, setAmount] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [stage, setStage] = useState<'form' | 'review' | 'submitting' | 'done'>('form');
  const [redeemError, setRedeemError] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setLine(BARTENDER_LINES[Math.floor(Math.random() * BARTENDER_LINES.length)]), 3500);
    return () => window.clearInterval(id);
  }, []);

  const amt = Math.floor(Number(amount) || 0);
  const usd = (amt * SC_TO_USD).toFixed(2);
  const emailOk = isValidEmail(email);
  const validAmt = amt >= MIN_REDEEM_SC && amt <= sweepsCoins;
  const canReview = validAmt && emailOk;

  const submitRedemption = async () => {
    if (!canReview) return;
    setRedeemError(null);
    setStage('submitting');
    const ok = await onRedeem(amt, email);
    if (ok) {
      setStage('done');
    } else {
      setRedeemError('Could not submit your request. Please try again in a moment.');
      setStage('review');
    }
  };

  const TabButton: React.FC<{ id: 'add' | 'redeem'; label: string; color: string }> = ({ id, label, color }) => (
    <button onClick={() => { setTab(id); setBuyError(null); setRedeemError(null); }} style={{ flex: 1, minHeight: '46px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: 800, color: tab === id ? '#fff' : 'rgba(255,255,255,0.65)', background: tab === id ? `${color}22` : 'rgba(255,255,255,0.04)', border: `1.5px solid ${tab === id ? color : 'rgba(255,255,255,0.12)'}` }}>
      {label}
    </button>
  );

  return (
    <Modal title="The Bartender" icon="🍸" accent={NEON_RED} onClose={onClose} maxWidth={480}>
      {/* Bartender greeting */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', flexShrink: 0, background: 'radial-gradient(circle at 40% 35%, #d4a574, #8a5a30)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', border: `2px solid ${NEON_RED}` }}>🧑‍🍳</div>
        <div style={{ flex: 1, padding: '12px 14px', borderRadius: '14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fff' }}>{line}</p>
          <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>Add Gold Coins to play, or request a Sweeps Coins payout.</p>
        </div>
      </div>

      {/* Balances */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <div style={{ padding: '12px', borderRadius: '12px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(255,210,74,0.18), rgba(255,210,74,0.04))', border: `1px solid ${GC_GOLD}55` }}>
          <p style={{ margin: '0 0 2px', fontSize: '9px', letterSpacing: '1px', color: `${GC_GOLD}cc` }}>GOLD COINS</p>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: GC_GOLD }}>{formatCoins(goldCoins)}</p>
        </div>
        <div style={{ padding: '12px', borderRadius: '12px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(168,85,247,0.18), rgba(168,85,247,0.04))', border: `1px solid ${SC_PURPLE}55` }}>
          <p style={{ margin: '0 0 2px', fontSize: '9px', letterSpacing: '1px', color: `${SC_PURPLE}cc` }}>SWEEPS COINS</p>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: SC_PURPLE }}>{formatCoins(sweepsCoins)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <TabButton id="add" label="Add Gold Coins" color={GC_GOLD} />
        <TabButton id="redeem" label="Redeem Sweeps Coins" color={SC_PURPLE} />
      </div>

      {tab === 'add' ? (
        <div>
          {/* Honest payment status banner */}
          {payState === 'checking' && (
            <div style={{ padding: '12px 14px', borderRadius: '12px', marginBottom: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
              Checking whether payments are enabled…
            </div>
          )}
          {payState === 'unavailable' && (
            <div style={{ padding: '12px 14px', borderRadius: '12px', marginBottom: '14px', background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.45)' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#f0b35e' }}>Payments are not enabled yet</p>
              <p style={{ margin: '4px 0 0', fontSize: '11px', lineHeight: 1.5, color: 'rgba(255,255,255,0.7)' }}>
                The owner needs to connect a payment account before Gold Coin purchases can be processed. Prices shown are the live store prices and will charge correctly once payments are turned on.
              </p>
            </div>
          )}
          {payState === 'ready' && (
            <div style={{ padding: '10px 14px', borderRadius: '12px', marginBottom: '14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.4)', fontSize: '11px', color: 'rgba(255,255,255,0.75)' }}>
              Payments are enabled. Buying opens a secure Stripe Checkout.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '10px', marginBottom: '8px' }}>
            {GC_PACKAGES.map((pkg) => {
              const isBusy = buyingId === pkg.id;
              const disabled = payState === 'checking' || buyingId !== null;
              return (
                <div key={pkg.id} style={{ borderRadius: '14px', padding: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.04)', border: `1.5px solid ${GC_GOLD}33` }}>
                  {pkg.badge && <div style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px', color: GC_GOLD, marginBottom: '4px' }}>{pkg.badge}</div>}
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>${pkg.dollars.toFixed(2)}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: GC_GOLD, marginTop: '2px' }}>{pkg.label}</div>
                  <div style={{ fontSize: '10.5px', color: SC_PURPLE, marginBottom: '8px' }}>+ {pkg.sweepsCoins} SC bonus</div>
                  <button onClick={() => buyPackage(pkg)} disabled={disabled} style={{ width: '100%', minHeight: '42px', borderRadius: '10px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 800, color: '#0a0a0f', opacity: disabled && !isBusy ? 0.55 : 1, background: `linear-gradient(135deg, ${GC_GOLD}, #fff 240%)` }}>
                    {isBusy ? 'Opening…' : payState === 'ready' ? 'Buy' : 'Buy'}
                  </button>
                </div>
              );
            })}
          </div>

          {buyError && (
            <div style={{ padding: '11px 14px', borderRadius: '12px', marginTop: '10px', background: 'rgba(255,42,77,0.12)', border: `1px solid ${NEON_RED}66`, fontSize: '12px', lineHeight: 1.5, color: '#ff9bac' }}>
              {buyError}
            </div>
          )}

          <p style={{ margin: '14px 0 0', fontSize: '11px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
            No Purchase Necessary. 21+. Gold Coins are for entertainment only and have no cash value. Sweeps Coins are a promotional bonus.
          </p>
        </div>
      ) : (
        <div>
          {stage === 'done' ? (
            <div style={{ padding: '16px', borderRadius: '14px', textAlign: 'center', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.45)' }}>
              <div style={{ fontSize: '30px' }}>📨</div>
              <p style={{ margin: '6px 0 4px', fontSize: '15px', fontWeight: 800, color: '#4ade80' }}>Redemption request submitted</p>
              <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.5, color: 'rgba(255,255,255,0.75)' }}>
                Requests are reviewed and paid out to your PayPal under the Official Rules. You can track the status below. Nothing has been sent yet.
              </p>
              <button onClick={() => { setStage('form'); setAmount(''); }} style={{ marginTop: '14px', width: '100%', minHeight: '46px', borderRadius: '12px', border: `1px solid ${SC_PURPLE}`, cursor: 'pointer', fontSize: '14px', fontWeight: 800, color: SC_PURPLE, background: `${SC_PURPLE}1a` }}>Submit another request</button>
            </div>
          ) : stage === 'review' || stage === 'submitting' ? (
            <div>
              <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: NEON_BLUE, letterSpacing: '0.5px' }}>REVIEW REDEMPTION REQUEST</p>
              <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', marginBottom: '12px' }}>
                {([['Redeeming', `${formatCoins(amt)} SC`], ['Value', `$${usd}`], ['PayPal', email.trim()], ['Balance after', `${formatCoins(sweepsCoins - amt)} SC`]] as [string, string][]).map(([k, v], i) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', padding: '11px 14px', fontSize: '13px', background: i % 2 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>{k}</span>
                    <span style={{ fontWeight: 700, color: '#fff', wordBreak: 'break-all', textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '11px', lineHeight: 1.5, color: 'rgba(255,255,255,0.55)' }}>
                This submits a request only. Requests are reviewed and paid out manually to your PayPal under the Official Rules. Sweeps Coins only — Gold Coins are never redeemable. 21+. No Purchase Necessary.
              </p>
              {redeemError && <p style={{ margin: '0 0 10px', fontSize: '12px', color: NEON_RED }}>{redeemError}</p>}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStage('form')} disabled={stage === 'submitting'} style={{ flex: 1, minHeight: '48px', borderRadius: '12px', cursor: stage === 'submitting' ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}>Back</button>
                <button onClick={submitRedemption} disabled={stage === 'submitting'} style={{ flex: 2, minHeight: '48px', borderRadius: '12px', border: 'none', cursor: stage === 'submitting' ? 'not-allowed' : 'pointer', fontSize: '15px', fontWeight: 800, color: '#fff', opacity: stage === 'submitting' ? 0.6 : 1, background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
                  {stage === 'submitting' ? 'Submitting…' : 'Submit request'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: NEON_BLUE, letterSpacing: '0.5px' }}>AMOUNT TO REDEEM</p>
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', fontWeight: 800, color: SC_PURPLE }}>SC</span>
                <input
                  type="number" inputMode="numeric" value={amount} min={MIN_REDEEM_SC} max={sweepsCoins}
                  onChange={(e) => setAmount(e.target.value)} placeholder={`${MIN_REDEEM_SC} minimum`}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '14px 14px 14px 44px', borderRadius: '12px', border: `1px solid ${validAmt ? `${SC_PURPLE}66` : 'rgba(255,255,255,0.15)'}`, background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '18px', fontWeight: 800, outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {[50, 100, 250].filter((q) => q <= sweepsCoins).map((q) => (
                  <button key={q} onClick={() => setAmount(String(q))} style={{ fontSize: '12px', padding: '7px 12px', minHeight: '34px', borderRadius: '14px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.85)' }}>{q} SC</button>
                ))}
                {sweepsCoins >= MIN_REDEEM_SC && (
                  <button onClick={() => setAmount(String(sweepsCoins))} style={{ fontSize: '12px', padding: '7px 12px', minHeight: '34px', borderRadius: '14px', cursor: 'pointer', border: `1px solid ${SC_PURPLE}66`, background: `${SC_PURPLE}22`, color: SC_PURPLE, fontWeight: 700 }}>Max</button>
                )}
              </div>
              <p style={{ margin: '0 0 14px', fontSize: '12px', color: amt > 0 && !validAmt ? NEON_RED : 'rgba(255,255,255,0.5)' }}>
                {sweepsCoins < MIN_REDEEM_SC ? `You need at least ${MIN_REDEEM_SC} SC to request a redemption.` : amt > sweepsCoins ? 'That is more than your Sweeps Coins balance.' : amt > 0 && amt < MIN_REDEEM_SC ? `Minimum redemption is ${MIN_REDEEM_SC} SC.` : amt > 0 ? `You will request $${usd}.` : `Minimum ${MIN_REDEEM_SC} SC · 1 SC = $1.00`}
              </p>

              <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: NEON_BLUE, letterSpacing: '0.5px' }}>PAYPAL EMAIL</p>
              <input
                type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                style={{ width: '100%', boxSizing: 'border-box', padding: '13px 14px', borderRadius: '12px', marginBottom: '6px', border: `1px solid ${email.length === 0 ? 'rgba(255,255,255,0.15)' : emailOk ? `${SC_PURPLE}66` : NEON_RED}`, background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '14px', fontWeight: 600, outline: 'none' }}
              />
              <p style={{ margin: '0 0 14px', fontSize: '11px', color: email.length > 0 && !emailOk ? NEON_RED : 'rgba(255,255,255,0.45)' }}>
                {email.length > 0 && !emailOk ? 'Enter a valid email address.' : 'Payouts are sent to this PayPal address after review.'}
              </p>

              <button onClick={() => (canReview ? setStage('review') : notify(canReview ? '' : 'Enter a valid amount and PayPal email to continue.'))} disabled={!canReview}
                style={{ width: '100%', minHeight: '50px', borderRadius: '12px', border: 'none', cursor: canReview ? 'pointer' : 'not-allowed', fontSize: '15px', fontWeight: 800, color: '#fff', opacity: canReview ? 1 : 0.45, background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
                Review request{canReview ? ` · $${usd}` : ''}
              </button>

              {/* Pending requests list */}
              <div style={{ marginTop: '18px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: NEON_BLUE, letterSpacing: '0.5px' }}>YOUR REDEMPTION REQUESTS</p>
                {redemptions.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>No requests yet. Submitted requests appear here with their status.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {redemptions.map((r) => {
                      const st = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
                      return (
                        <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{formatCoins(r.amount_sc)} SC · ${Number(r.usd_value).toFixed(2)}</div>
                            <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.paypal_email}</div>
                          </div>
                          <span style={{ flexShrink: 0, fontSize: '10.5px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', color: st.color, background: `${st.color}1f`, border: `1px solid ${st.color}66` }}>{st.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <p style={{ margin: '14px 0 0', fontSize: '11px', textAlign: 'center', lineHeight: 1.5, color: 'rgba(255,255,255,0.5)' }}>
                Redemptions are reviewed and paid out manually to PayPal under the Official Rules. 21+. No Purchase Necessary. Sweeps Coins only.
              </p>
            </div>
          )}
        </div>
      )}
      <ComplianceLine />
    </Modal>
  );
};

// ============================================================
// CHAT PANEL (open social booth)
// ============================================================
const ChatPanel: React.FC<{ onClose: () => void; messages: ChatMsg[]; send: (t: string) => void }> = ({ onClose, messages, send }) => {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  return (
    <Modal title="The Booth — Open Chat" icon="💬" accent={NEON_BLUE} onClose={onClose} maxWidth={460}>
      <div style={{ height: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', padding: '4px', marginBottom: '12px' }}>
        {messages.map((m) => (
          <div key={m.id} style={{ fontSize: '13px', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 800, color: m.color }}>{m.user}: </span>
            <span style={{ color: 'rgba(255,255,255,0.88)' }}>{m.text}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
        {QUICK_CHATS.map((q) => (
          <button key={q} onClick={() => send(q)} style={{ fontSize: '11px', padding: '7px 11px', minHeight: '36px', borderRadius: '16px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)' }}>{q}</button>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) { send(input.trim()); setInput(''); } }} style={{ display: 'flex', gap: '8px' }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Say something to the bar…" style={{ flex: 1, minWidth: 0, padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '13px', outline: 'none' }} />
        <button type="submit" style={{ minWidth: '52px', minHeight: '44px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#fff', background: `linear-gradient(135deg, ${NEON_RED}, ${NEON_BLUE})` }}>➤</button>
      </form>
    </Modal>
  );
};

// ============================================================
// AVATAR SHOP PANEL (wardrobe / mirror)
// ============================================================
const AvatarShopPanel: React.FC<{ onClose: () => void; goldCoins: number; owned: string[]; buy: (item: ShopItem) => void; equip: (id: string) => void; equipped: string | null }> = ({ onClose, goldCoins, owned, buy, equip, equipped }) => (
  <Modal title="Avatar Wardrobe" icon="🪞" accent={NEON_PURPLE} onClose={onClose} maxWidth={520}>
    <p style={{ margin: '0 0 14px', fontSize: '12px', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
      Customize your casino persona. Cosmetic items are purchased with <strong style={{ color: GC_GOLD }}>Gold Coins</strong> (entertainment only). 21+, no creepers, all sales final.
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))', gap: '12px' }}>
      {AVATAR_ITEMS.map((item) => {
        const isOwned = owned.includes(item.id);
        const isEquipped = equipped === item.id;
        return (
          <div key={item.id} style={{ borderRadius: '14px', padding: '12px', textAlign: 'center', background: isEquipped ? 'rgba(168,85,247,0.16)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${isEquipped ? NEON_PURPLE : 'rgba(255,255,255,0.1)'}` }}>
            <div style={{ fontSize: '34px', marginBottom: '6px' }}>{item.emoji}</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{item.name}</div>
            <div style={{ fontSize: '11px', color: GC_GOLD, marginBottom: '8px' }}>{formatCoins(item.price)} GC</div>
            {isOwned ? (
              <button onClick={() => equip(item.id)} disabled={isEquipped} style={{ width: '100%', minHeight: '40px', borderRadius: '9px', border: `1px solid ${NEON_PURPLE}`, cursor: isEquipped ? 'default' : 'pointer', fontSize: '12px', fontWeight: 800, color: isEquipped ? '#0a0a0f' : NEON_PURPLE, background: isEquipped ? NEON_PURPLE : 'transparent' }}>
                {isEquipped ? 'Equipped' : 'Equip'}
              </button>
            ) : (
              <button onClick={() => buy(item)} disabled={goldCoins < item.price} style={{ width: '100%', minHeight: '40px', borderRadius: '9px', border: 'none', cursor: goldCoins < item.price ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 800, color: '#0a0a0f', opacity: goldCoins < item.price ? 0.5 : 1, background: `linear-gradient(135deg, ${GC_GOLD}, #fff 240%)` }}>
                {goldCoins < item.price ? 'Need GC' : 'Buy'}
              </button>
            )}
          </div>
        );
      })}
    </div>
    <ComplianceLine />
  </Modal>
);

// ============================================================
// CASHIER PANEL (cash-out / buy)
// ============================================================
const CashierPanel: React.FC<{ onClose: () => void; goldCoins: number; sweepsCoins: number; notify: (m: string) => void }> = ({ onClose, goldCoins, sweepsCoins, notify }) => (
  <Modal title="Cashier Cage" icon="💰" accent={GC_GOLD} onClose={onClose} maxWidth={440}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
      <div style={{ padding: '16px', borderRadius: '14px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(255,210,74,0.2), rgba(255,210,74,0.05))', border: '1px solid rgba(255,210,74,0.3)' }}>
        <p style={{ margin: '0 0 4px', fontSize: '10px', letterSpacing: '1px', color: 'rgba(255,210,74,0.7)' }}>GOLD COINS</p>
        <p style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: GC_GOLD }}>{formatCoins(goldCoins)}</p>
      </div>
      <div style={{ padding: '16px', borderRadius: '14px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.05))', border: '1px solid rgba(168,85,247,0.3)' }}>
        <p style={{ margin: '0 0 4px', fontSize: '10px', letterSpacing: '1px', color: 'rgba(168,85,247,0.7)' }}>SWEEPS COINS</p>
        <p style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: SC_PURPLE }}>{formatCoins(sweepsCoins)}</p>
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <button onClick={() => { notify('🪙 Opening Coin Center for Gold Coin packages…'); window.location.hash = 'dollar-day'; }} style={{ width: '100%', minHeight: '48px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 800, color: '#0a0a0f', background: 'linear-gradient(135deg, #ffd24a, #e0a82a)' }}>
        🪙 Buy Gold Coins
      </button>
      <button onClick={() => { notify('🍸 Head to the Bartender to cash out your Sweeps Coins.'); onClose(); }} style={{ width: '100%', minHeight: '48px', borderRadius: '12px', border: `1px solid ${NEON_PURPLE}66`, cursor: 'pointer', fontSize: '14px', fontWeight: 800, color: NEON_PURPLE, background: `${NEON_PURPLE}1a` }}>
        🍸 To redeem Sweeps Coins, see the Bartender
      </button>
    </div>
    <p style={{ marginTop: '14px', fontSize: '11px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
      No purchase necessary. Free entry available. Sweeps Coins redeemable for prizes per Official Rules. 21+ only.
    </p>
  </Modal>
);

// ============================================================
// HOTSPOT (in-scene clickable affordance)
// ============================================================
interface HotspotData { id: PanelId; left: number; top: number; icon: string; label: string; sub: string; color: string; }
const HOTSPOTS: HotspotData[] = [
  { id: 'jukebox', left: 12, top: 50, icon: '🎵', label: 'Jukebox', sub: 'Music & membership', color: NEON_RED },
  { id: 'darts', left: 4, top: 28, icon: '🎯', label: 'Darts', sub: 'Wager 501', color: NEON_RED },
  { id: 'pinball', left: 88, top: 30, icon: '🕹️', label: 'Pinball', sub: 'Arcade', color: NEON_BLUE },
  { id: 'plinko', left: 88, top: 52, icon: '🪙', label: 'Plinko', sub: 'Drop & win', color: NEON_PURPLE },
  { id: 'bartender', left: 50, top: 40, icon: '🍸', label: 'Bartender', sub: 'Add coins / redeem SC', color: NEON_RED },
  { id: 'chat', left: 26, top: 74, icon: '💬', label: 'The Booth', sub: 'Open chat', color: NEON_BLUE },
  { id: 'avatar', left: 72, top: 72, icon: '🪞', label: 'Wardrobe', sub: 'Avatar shop', color: NEON_PURPLE },
  { id: 'cashier', left: 50, top: 76, icon: '💰', label: 'Cashier', sub: 'Buy / cash out', color: GC_GOLD },
];

const Hotspot: React.FC<{ data: HotspotData; onClick: () => void }> = ({ data, onClick }) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'absolute', left: `${data.left}%`, top: `${data.top}%`, transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        background: 'transparent', border: 'none', cursor: 'pointer', pointerEvents: 'auto', padding: 0,
      }}
    >
      {/* badge wrapper bobs gently */}
      <span style={{ position: 'relative', display: 'block', animation: 'hotspotBob 3.4s ease-in-out infinite' }}>
        {/* rotating glow ring (appears on hover) */}
        <span aria-hidden style={{
          position: 'absolute', inset: '-7px', borderRadius: '50%', pointerEvents: 'none',
          background: `conic-gradient(from 0deg, ${data.color}, transparent 30%, ${data.color} 60%, transparent 90%, ${data.color})`,
          opacity: hover ? 0.9 : 0, filter: 'blur(2px)', transition: 'opacity 0.25s ease',
          animation: 'ringSpin 4s linear infinite',
        }} />
        <span style={{
          position: 'relative', width: '54px', height: '54px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '25px', background: `radial-gradient(circle at 35% 28%, ${data.color}33, rgba(8,8,16,0.92) 72%)`,
          border: `2px solid ${data.color}`, boxShadow: hover ? `0 0 28px ${data.color}, 0 0 56px ${data.color}66, inset 0 0 14px ${data.color}55` : `0 0 12px ${data.color}66, inset 0 0 10px ${data.color}33`,
          transform: hover ? 'scale(1.16)' : 'scale(1)', transition: 'all 0.22s ease',
          animation: 'hotspotPulse 2.6s ease-in-out infinite',
        }}>
          {/* glass top highlight */}
          <span aria-hidden style={{ position: 'absolute', top: '6px', left: '14px', right: '14px', height: '10px', borderRadius: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.4), transparent)' }} />
          <span style={{ position: 'relative', filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.6))` }}>{data.icon}</span>
        </span>
      </span>
      {/* label plate */}
      <span style={{
        padding: '5px 11px', borderRadius: '11px', whiteSpace: 'nowrap', textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(14,14,24,0.92), rgba(6,6,12,0.92))',
        border: `1px solid ${data.color}66`, boxShadow: hover ? `0 0 14px ${data.color}55` : '0 2px 6px rgba(0,0,0,0.5)',
        opacity: hover ? 1 : 0.86, transform: hover ? 'translateY(0)' : 'translateY(-1px)', transition: 'all 0.2s',
      }}>
        <span style={{ display: 'block', fontSize: '12px', fontWeight: 800, letterSpacing: '0.3px', color: data.color, textShadow: `0 0 8px ${data.color}66`, lineHeight: 1.15 }}>{data.label}</span>
        <span style={{ display: 'block', fontSize: '9px', letterSpacing: '0.4px', color: 'rgba(255,255,255,0.62)' }}>{data.sub}</span>
      </span>
    </button>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function TheBar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  // Wallet (loaded from DB read-only like the Casino Floor; local updates for play)
  const [goldCoins, setGoldCoins] = useState(10000);
  const [sweepsCoins, setSweepsCoins] = useState(100);
  const [currency, setCurrency] = useState<Currency>('GC');

  // Jukebox state (persists while inside The Bar)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<JukeTrack | null>(JUKEBOX_GENRES[0].tracks[0]);
  const [jukeTier, setJukeTier] = useState('free');

  // Avatar shop
  const [owned, setOwned] = useState<string[]>([]);
  const [equipped, setEquipped] = useState<string | null>(null);

  // Chat
  const [messages, setMessages] = useState<ChatMsg[]>(SEED_CHAT);

  // Redemption requests (persisted, owner-reviewed payouts)
  const [redemptions, setRedemptions] = useState<RedemptionRequest[]>([]);
  const loadRedemptions = useCallback(async () => {
    try {
      const db = (window as any).__workspaceDb;
      if (!db) return;
      const result = await db.from('bar_redemption_requests').orderBy('created_at', 'desc').limit(20).get();
      if (Array.isArray(result?.data)) setRedemptions(result.data as RedemptionRequest[]);
    } catch {
      // leave existing list in place on failure
    }
  }, []);
  useEffect(() => { loadRedemptions(); }, [loadRedemptions]);

  // UI
  const [panel, setPanel] = useState<PanelId>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [neonFlicker, setNeonFlicker] = useState(1);

  const currentBalance = currency === 'GC' ? goldCoins : sweepsCoins;
  const animatedBalance = useCountUp(currentBalance);

  // Load wallet (read-only, graceful fallback)
  useEffect(() => {
    (async () => {
      try {
        const db = (window as any).__workspaceDb;
        if (db) {
          const result = await db.from('user_wallets').get();
          const row = result?.data?.[0];
          if (row) {
            if (typeof row.gold_coins === 'number') setGoldCoins(row.gold_coins);
            if (typeof row.sweeps_coins === 'number') setSweepsCoins(row.sweeps_coins);
          }
        }
      } catch {
        // defaults remain
      }
    })();
  }, []);

  // Parallax mouse tracking
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMouse({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  // Neon flicker
  useEffect(() => {
    const id = window.setInterval(() => setNeonFlicker(0.78 + Math.random() * 0.22), 110);
    return () => window.clearInterval(id);
  }, []);

  const parallax = (factor: number) => ({ x: (mouse.x - 0.5) * 46 * factor, y: (mouse.y - 0.5) * 28 * factor });

  const notify = useCallback((m: string) => {
    setNotification(m);
    window.setTimeout(() => setNotification(null), 2800);
  }, []);

  const spend = (amt: number): boolean => {
    if (currentBalance < amt) { notify(`Not enough ${currency} — visit the Cashier or claim a daily bonus!`); return false; }
    if (currency === 'GC') setGoldCoins((g) => g - amt); else setSweepsCoins((s) => s - amt);
    return true;
  };
  const award = (amt: number) => { if (currency === 'GC') setGoldCoins((g) => g + amt); else setSweepsCoins((s) => s + amt); };

  // Persist a REAL redemption REQUEST. No money moves here — the owner reviews
  // and pays out to PayPal manually under the Official Rules. Returns success
  // so the panel can show an honest confirmation only when the row is saved.
  const redeemSweeps = async (amt: number, paypalEmail: string): Promise<boolean> => {
    if (amt < MIN_REDEEM_SC || amt > sweepsCoins) { notify('Enter an amount within your Sweeps Coins balance.'); return false; }
    if (!isValidEmail(paypalEmail)) { notify('Enter a valid PayPal email.'); return false; }
    try {
      const db = (window as any).__workspaceDb;
      if (!db) { notify('Could not reach the server. Please try again in a moment.'); return false; }
      await db.from('bar_redemption_requests').insert({
        amount_sc: amt,
        usd_value: amt * SC_TO_USD,
        paypal_email: paypalEmail.trim(),
        method: 'paypal',
        status: 'pending',
      });
      // Hold the requested Sweeps Coins so they cannot be redeemed twice while pending.
      setSweepsCoins((s) => Math.max(0, s - amt));
      await loadRedemptions();
      notify('Redemption request submitted for review.');
      return true;
    } catch {
      notify('Could not submit your request. Please try again in a moment.');
      return false;
    }
  };

  const buyItem = (item: ShopItem) => {
    if (goldCoins < item.price) { notify('Not enough Gold Coins for that item.'); return; }
    setGoldCoins((g) => g - item.price);
    setOwned((o) => [...o, item.id]);
    setEquipped(item.id);
    notify(`${item.emoji} ${item.name} unlocked & equipped!`);
  };

  const sendChat = (text: string) => setMessages((prev) => [...prev, { id: Date.now(), user: 'You', color: NEON_BLUE, text }]);

  const gameApi: GameApiProps = { currency, balance: currentBalance, spend, award, onClose: () => setPanel(null) };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: BASE, fontFamily: `"${FONT}", system-ui, sans-serif`, color: '#fff', perspective: '1100px' }}
    >
      <style>{`
        @keyframes vinylSpin { to { transform: rotate(360deg); } }
        @keyframes hotspotPulse { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.22); } }
        @keyframes hotspotBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes ringSpin { to { transform: rotate(360deg); } }
        @keyframes neonBuzz { 0%,100% { opacity: 1; } 47% { opacity: 0.82; } 50% { opacity: 0.55; } 53% { opacity: 0.9; } }
        @keyframes signFlicker { 0%,100% { opacity: 1; } 4% { opacity: 0.72; } 6% { opacity: 1; } 52% { opacity: 1; } 54% { opacity: 0.6; } 56% { opacity: 1; } }
        @keyframes floatHaze { 0% { transform: translateY(0) translateX(0); opacity: 0.05; } 30% { opacity: 0.4; } 60% { transform: translateY(-50px) translateX(22px); opacity: 0.45; } 100% { transform: translateY(-100px) translateX(0); opacity: 0; } }
        @keyframes mote { 0% { transform: translateY(0) translateX(0); opacity: 0; } 12% { opacity: 0.9; } 88% { opacity: 0.8; } 100% { transform: translateY(-120px) translateX(28px); opacity: 0; } }
        @keyframes spotSweep { 0% { transform: translateX(-30%) rotate(-12deg); opacity: 0.0; } 25% { opacity: 0.5; } 50% { transform: translateX(30%) rotate(10deg); opacity: 0.32; } 75% { opacity: 0.5; } 100% { transform: translateX(-30%) rotate(-12deg); opacity: 0.0; } }
        @keyframes sheenSweep { 0% { transform: translateX(-130%) skewX(-22deg); } 60%,100% { transform: translateX(260%) skewX(-22deg); } }
        @keyframes slideDown { from { transform: translateX(-50%) translateY(-18px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
        @keyframes bob { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-4px); } }
        @keyframes winFlash { 0% { opacity: 0; transform: scale(0.6); } 30% { opacity: 1; transform: scale(1.08); } 100% { opacity: 0; transform: scale(1.5); } }
        @keyframes winPop { 0% { transform: scale(0.85); } 40% { transform: scale(1.06); } 100% { transform: scale(1); } }
        @keyframes confettiFall { 0% { transform: translateY(-12px) rotate(0deg); opacity: 1; } 100% { transform: translateY(120px) rotate(360deg); opacity: 0; } }
        @keyframes balancePop { 0% { transform: scale(1); } 40% { transform: scale(1.14); } 100% { transform: scale(1); } }
        @keyframes tonearmDrop { from { transform: rotate(-22deg); } to { transform: rotate(0deg); } }
        .bar-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .bar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 8px; }
      `}</style>

      {/* ════════ LAYER 0: deep ambient + vanishing point + glossy floor ════════ */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, #211338 0%, #0e0a1c 46%, #04040a 100%)' }} />
        {/* warm volumetric ambience washing the room */}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, ${NEON_RED}14 0%, transparent 55%), radial-gradient(ellipse at 20% 70%, ${NEON_BLUE}10 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, ${NEON_PURPLE}10 0%, transparent 50%)` }} />
        {/* vanishing glow behind the bar */}
        <div style={{ position: 'absolute', left: '50%', top: '38%', width: '460px', maxWidth: '90%', height: '260px', transform: 'translate(-50%,-50%)', background: `radial-gradient(ellipse, ${NEON_BLUE}3a 0%, ${NEON_RED}22 42%, transparent 76%)`, filter: 'blur(18px)' }} />
        {/* gentle moving spotlight sweep from the ceiling */}
        <div style={{ position: 'absolute', left: '50%', top: '-6%', width: '46%', height: '78%', transformOrigin: '50% 0%', background: `linear-gradient(to bottom, ${NEON_BLUE}20 0%, transparent 78%)`, filter: 'blur(10px)', animation: 'spotSweep 16s ease-in-out infinite', pointerEvents: 'none' }} />
        {/* glossy reflective floor catching the neon */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '34%', background: `linear-gradient(180deg, transparent 0%, #07060f 22%, #050409 100%)` }} />
        <div style={{ position: 'absolute', left: '50%', bottom: '2%', width: '70%', height: '24%', transform: 'translateX(-50%)', background: `radial-gradient(ellipse at center, ${NEON_RED}26 0%, ${NEON_BLUE}1a 40%, transparent 72%)`, filter: 'blur(16px)', pointerEvents: 'none' }} />
      </div>

      {/* ════════ LAYER 1: far wall — booths + THE BAR neon sign (parallax 0.12) ════════ */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, transform: `translate(${parallax(0.12).x}px, ${parallax(0.12).y}px)`, transition: 'transform 0.3s ease-out' }}>
        {/* Back wall — paneled with subtle vertical sheen + skirting */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: '8%', height: '52%', background: 'linear-gradient(180deg, #1a0f2c 0%, #120a20 55%, #0c0716 100%)', borderBottom: `1px solid ${NEON_BLUE}22`, boxShadow: `inset 0 -40px 60px -20px ${NEON_RED}18` }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '8%', height: '52%', backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 8%)', opacity: 0.6, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '58.6%', height: '8px', background: 'linear-gradient(180deg, #2a1830, #0c0716)', boxShadow: '0 2px 6px rgba(0,0,0,0.5)' }} />

        {/* THE BAR neon sign — colored halo bloom + white inner core + under-glow reflection */}
        <div style={{ position: 'absolute', left: '50%', top: '15%', transform: 'translateX(-50%)', textAlign: 'center', animation: 'signFlicker 7s infinite' }}>
          {/* halo bloom */}
          <div aria-hidden style={{ position: 'absolute', inset: '-30px -50px', borderRadius: '50%', background: `radial-gradient(ellipse, ${NEON_RED}55 0%, ${NEON_RED}1c 45%, transparent 72%)`, filter: 'blur(18px)', opacity: neonFlicker }} />
          {/* colored glow text */}
          <div style={{ position: 'relative', fontSize: 'clamp(34px, 7vw, 64px)', fontWeight: 900, letterSpacing: '8px', color: NEON_RED, opacity: neonFlicker, textShadow: `0 0 8px ${NEON_RED}, 0 0 22px ${NEON_RED}, 0 0 48px ${NEON_RED}, 0 0 88px ${NEON_RED}aa` }}>
            {/* white-hot inner core */}
            <span style={{ position: 'absolute', inset: 0, color: '#fff7f9', textShadow: '0 0 4px #fff, 0 0 10px #ffd9e0', opacity: 0.55, mixBlendMode: 'screen' }}>THE BAR</span>
            THE BAR
          </div>
          {/* reflection / under-glow on the wall */}
          <div aria-hidden style={{ fontSize: 'clamp(34px, 7vw, 64px)', fontWeight: 900, letterSpacing: '8px', color: NEON_RED, opacity: neonFlicker * 0.18, transform: 'scaleY(-0.55)', transformOrigin: 'top', filter: 'blur(3px)', marginTop: '2px', maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.7), transparent)', WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.7), transparent)' }}>THE BAR</div>
        </div>

        {/* Background booths — richer leather/velvet + rim lighting */}
        {[12, 30, 70, 88].map((x, i) => (
          <div key={`booth-${i}`} style={{ position: 'absolute', left: `${x}%`, top: '33%', transform: 'translateX(-50%)' }}>
            <div style={{ width: '78px', height: '64px', borderRadius: '34px 34px 8px 8px', background: 'linear-gradient(180deg, #4a1828 0%, #320f1c 45%, #1a0a12 100%)', border: `1px solid ${NEON_RED}44`, boxShadow: `inset 0 6px 14px ${NEON_RED}33, inset 0 -8px 16px rgba(0,0,0,0.6), 0 0 16px ${NEON_RED}18` }}>
              {/* tufted velvet seams */}
              <div style={{ position: 'absolute', inset: '8px 10px 14px', borderRadius: '26px 26px 6px 6px', backgroundImage: 'repeating-linear-gradient(120deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 14px), repeating-linear-gradient(60deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 14px)' }} />
              {/* rim highlight */}
              <div style={{ position: 'absolute', top: '2px', left: '12%', right: '12%', height: '3px', borderRadius: '3px', background: `linear-gradient(90deg, transparent, ${NEON_RED}aa, transparent)`, filter: 'blur(0.5px)' }} />
            </div>
            {/* small booth table */}
            <div style={{ width: '34px', height: '8px', margin: '4px auto 0', borderRadius: '4px', background: 'linear-gradient(180deg, #5a3a16, #2a1808)', boxShadow: '0 3px 6px rgba(0,0,0,0.5)' }} />
          </div>
        ))}

        {/* Neon side signs */}
        <div style={{ position: 'absolute', left: '6%', top: '11%', fontSize: 'clamp(13px, 2vw, 18px)', fontWeight: 800, color: NEON_BLUE, opacity: neonFlicker, textShadow: `0 0 8px ${NEON_BLUE}, 0 0 22px ${NEON_BLUE}, 0 0 40px ${NEON_BLUE}88`, animation: 'neonBuzz 5s infinite' }}>🍸 COLD DRINKS</div>
        <div style={{ position: 'absolute', right: '6%', top: '11%', fontSize: 'clamp(13px, 2vw, 18px)', fontWeight: 800, color: NEON_PURPLE, opacity: neonFlicker, textShadow: `0 0 8px ${NEON_PURPLE}, 0 0 22px ${NEON_PURPLE}, 0 0 40px ${NEON_PURPLE}88`, animation: 'neonBuzz 6s infinite' }}>🎶 LIVE MUSIC</div>
      </div>

      {/* ════════ LAYER 2: glowing bottle shelves behind the bar (parallax 0.28) ════════ */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, transform: `translate(${parallax(0.28).x}px, ${parallax(0.28).y}px)`, transition: 'transform 0.25s ease-out' }}>
        <div style={{ position: 'absolute', left: '16%', right: '16%', top: '29%', height: '128px', background: 'linear-gradient(180deg, rgba(26,16,36,0.95), rgba(10,8,18,0.97))', borderRadius: '10px', border: `1px solid ${NEON_BLUE}33`, boxShadow: `inset 0 0 30px rgba(0,0,0,0.7), 0 0 24px ${NEON_BLUE}1a`, overflow: 'hidden' }}>
          {/* mirrored back panel sheen */}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, transparent 30%, ${NEON_BLUE}10 48%, transparent 60%)` }} />
          {[0, 1, 2].map((shelf) => {
            const colors = ['#ff7a4d', '#8be0ff', NEON_PURPLE, GC_GOLD, '#4ecdc4', '#ff5c8a', '#b6ff6b'];
            return (
              <div key={`shelf-${shelf}`} style={{ position: 'absolute', left: '4%', right: '4%', top: `${14 + shelf * 38}px` }}>
                {/* LED back-light strip */}
                <div style={{ position: 'absolute', bottom: '0', left: 0, right: 0, height: '20px', background: `linear-gradient(180deg, ${NEON_BLUE}55, transparent)`, filter: 'blur(6px)', opacity: 0.7 }} />
                {/* bottles */}
                {Array.from({ length: 13 }).map((_, i) => {
                  const seed = shelf * 13 + i;
                  const c = colors[seed % colors.length];
                  const h = 20 + ((seed * 7) % 16);            // varied height
                  const w = 7 + (seed % 3) * 2;                 // varied width
                  const tall = seed % 4 === 0;                  // some slim tall bottles
                  return (
                    <div key={i} style={{ position: 'absolute', left: `${2 + i * 7.5}%`, bottom: '4px', width: `${w}px`, height: `${tall ? h + 8 : h}px`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {/* cap */}
                      <div style={{ width: `${Math.max(3, w - 4)}px`, height: '3px', borderRadius: '1px', background: seed % 2 ? GC_GOLD : '#c0c0c0', boxShadow: '0 0 3px rgba(0,0,0,0.6)' }} />
                      {/* neck */}
                      <div style={{ width: `${Math.max(2, w - 5)}px`, height: `${tall ? 8 : 5}px`, background: `linear-gradient(90deg, ${c}55, ${c}cc, ${c}55)` }} />
                      {/* body with liquid gradient + glass highlight */}
                      <div style={{ position: 'relative', flex: 1, width: '100%', borderRadius: '2px 2px 3px 3px', background: `linear-gradient(180deg, ${c}66 0%, ${c}cc 55%, ${c} 100%)`, boxShadow: `0 0 7px ${c}aa, inset 0 -3px 4px rgba(0,0,0,0.35)` }}>
                        {/* vertical highlight streak */}
                        <div style={{ position: 'absolute', top: '8%', left: '16%', width: '2px', bottom: '12%', borderRadius: '2px', background: 'linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.15))' }} />
                      </div>
                    </div>
                  );
                })}
                {/* glass shelf plate */}
                <div style={{ position: 'absolute', bottom: '0', left: 0, right: 0, height: '3px', borderRadius: '2px', background: `linear-gradient(90deg, transparent, ${NEON_BLUE}88, transparent)`, boxShadow: `0 0 8px ${NEON_BLUE}77` }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ════════ LAYER 3: bar counter + bartender (parallax 0.55) ════════ */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 3, transform: `translate(${parallax(0.55).x}px, ${parallax(0.55).y}px)`, transition: 'transform 0.2s ease-out' }}>
        {/* Bartender — refined lightweight silhouette behind the bar */}
        <div style={{ position: 'absolute', left: '50%', top: '40%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
          {/* back glow halo */}
          <div aria-hidden style={{ position: 'absolute', left: '50%', top: '46%', width: '120px', height: '120px', transform: 'translate(-50%,-50%)', borderRadius: '50%', background: `radial-gradient(circle, ${NEON_RED}33, transparent 68%)`, filter: 'blur(8px)' }} />
          <div style={{ position: 'relative', fontSize: '54px', filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.6)) drop-shadow(0 0 16px ${NEON_RED}88)` }}>🧑‍🍳</div>
          {/* rim light on shoulders */}
          <div aria-hidden style={{ position: 'absolute', left: '50%', top: '20%', width: '58px', height: '6px', transform: 'translateX(-50%)', borderRadius: '6px', background: `linear-gradient(90deg, transparent, ${NEON_BLUE}bb, transparent)`, filter: 'blur(1px)' }} />
        </div>

        {/* Bar counter */}
        <div style={{ position: 'absolute', left: '6%', right: '6%', top: '54%', height: '96px', borderRadius: '14px 14px 0 0', background: 'linear-gradient(180deg, #3a241a 0%, #251409 55%, #120a06 100%)', boxShadow: `0 -6px 30px rgba(0,0,0,0.55), 0 0 34px ${NEON_RED}22`, overflow: 'hidden' }}>
          {/* polished marble/wood top with bevel */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '16px', borderRadius: '14px 14px 0 0', background: 'linear-gradient(180deg, #8a6326 0%, #5a3c14 60%, #3a2710 100%)', boxShadow: 'inset 0 2px 2px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.5)' }}>
            {/* marble veining */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.25, backgroundImage: 'repeating-linear-gradient(110deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 26px)' }} />
            {/* moving specular highlight sweep */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, width: '40%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)', animation: 'sheenSweep 7s ease-in-out infinite', mixBlendMode: 'screen' }} />
          </div>
          {/* neon rail under the lip */}
          <div style={{ position: 'absolute', top: '24px', left: '4%', right: '4%', height: '4px', borderRadius: '4px', background: `linear-gradient(90deg, ${NEON_RED}, ${NEON_PURPLE}, ${NEON_BLUE})`, boxShadow: `0 0 14px ${NEON_BLUE}99` }} />
          {/* wood grain on the body */}
          <div style={{ position: 'absolute', top: '30px', left: 0, right: 0, bottom: 0, opacity: 0.4, backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 18px)' }} />
          {/* brass foot-rail near the floor */}
          <div style={{ position: 'absolute', bottom: '14px', left: '3%', right: '3%', height: '5px', borderRadius: '5px', background: 'linear-gradient(180deg, #ffe08a, #b8860b 55%, #6b4f08)', boxShadow: '0 0 10px rgba(255,210,74,0.55), 0 2px 3px rgba(0,0,0,0.5)' }} />
        </div>
        {/* ambient occlusion where counter meets the floor */}
        <div style={{ position: 'absolute', left: '4%', right: '4%', top: 'calc(54% + 96px)', height: '22px', background: 'radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.6), transparent 75%)' }} />
      </div>

      {/* ════════ LAYER 4: foreground bar stools (parallax 0.95) ════════ */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 4, transform: `translate(${parallax(0.95).x}px, ${parallax(0.95).y}px)`, transition: 'transform 0.12s ease-out', pointerEvents: 'none' }}>
        {[18, 34, 50, 66, 82].map((x, i) => (
          <div key={`stool-${i}`} style={{ position: 'absolute', left: `${x}%`, top: '74%', transform: 'translateX(-50%)' }}>
            {/* cushioned leather seat with top-light + edge piping */}
            <div style={{ position: 'relative', width: '50px', height: '18px', borderRadius: '50%', background: `radial-gradient(ellipse at 40% 30%, #ff5a73 0%, ${NEON_RED} 38%, #6a0c1c 100%)`, boxShadow: `0 4px 10px rgba(0,0,0,0.5), 0 0 16px ${NEON_RED}55, inset 0 2px 3px rgba(255,255,255,0.3)` }}>
              <div style={{ position: 'absolute', inset: '2px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.25)' }} />
            </div>
            {/* chrome center post with specular highlight */}
            <div style={{ position: 'relative', width: '8px', height: '56px', margin: '0 auto' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '0 0 2px 2px', background: 'linear-gradient(90deg, #555 0%, #e8e8ee 35%, #fff 48%, #aaa 60%, #444 100%)' }} />
              {/* foot-rest ring */}
              <div style={{ position: 'absolute', bottom: '14px', left: '-7px', right: '-7px', height: '4px', borderRadius: '4px', background: 'linear-gradient(90deg, #777, #f0f0f4 50%, #777)' }} />
            </div>
            {/* soft contact shadow on the glossy floor */}
            <div style={{ width: '52px', height: '10px', margin: '0 auto', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.6), transparent 72%)', filter: 'blur(2px)' }} />
          </div>
        ))}
      </div>

      {/* ════════ LAYER 5: HOTSPOTS (interactive, parallax 0.7) ════════ */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 6, transform: `translate(${parallax(0.7).x}px, ${parallax(0.7).y}px)`, transition: 'transform 0.16s ease-out', pointerEvents: 'none' }}>
        {HOTSPOTS.map((h) => (<Hotspot key={h.id} data={h} onClick={() => setPanel(h.id)} />))}
      </div>

      {/* ════════ LAYER 6: warm haze + dust motes + vignette (parallax 1.3) ════════ */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 7, transform: `translate(${parallax(1.3).x}px, ${parallax(1.3).y}px)`, transition: 'transform 0.06s ease-out', pointerEvents: 'none', overflow: 'hidden' }}>
        {/* warm volumetric haze drifting up */}
        {Array.from({ length: 14 }).map((_, i) => {
          const warm = i % 2 === 0 ? 'rgba(255,120,90,0.12)' : 'rgba(120,140,200,0.12)';
          return (
            <div key={`haze-${i}`} style={{ position: 'absolute', left: `${(i * 7) % 100}%`, top: `${60 + (i % 4) * 8}%`, width: `${36 + (i % 5) * 16}px`, height: `${36 + (i % 5) * 16}px`, borderRadius: '50%', background: warm, filter: 'blur(16px)', animation: `floatHaze ${9 + (i % 5) * 2}s ease-out infinite`, animationDelay: `${i * 0.6}s` }} />
          );
        })}
        {/* floating light dust motes */}
        {Array.from({ length: 22 }).map((_, i) => {
          const c = i % 3 === 0 ? NEON_RED : i % 3 === 1 ? NEON_BLUE : '#fff';
          const size = 2 + (i % 3);
          return (
            <div key={`mote-${i}`} style={{ position: 'absolute', left: `${(i * 4.5 + 3) % 100}%`, top: `${35 + (i * 13) % 55}%`, width: `${size}px`, height: `${size}px`, borderRadius: '50%', background: c, boxShadow: `0 0 6px ${c}`, opacity: 0.7, animation: `mote ${7 + (i % 6) * 1.5}s linear infinite`, animationDelay: `${i * 0.45}s` }} />
          );
        })}
      </div>
      {/* cinematic vignette (stronger) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 8, pointerEvents: 'none', boxShadow: 'inset 0 0 260px 90px rgba(0,0,0,0.86)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 8, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 44%, transparent 38%, rgba(0,0,0,0.45) 100%)' }} />

      {/* ════════ TOP BAR (fixed UI) ════════ */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '58px', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', background: 'linear-gradient(180deg, rgba(6,6,14,0.95), rgba(6,6,14,0.7))', borderBottom: `1px solid ${NEON_RED}33`, backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <span style={{ fontSize: '22px', filter: `drop-shadow(0 0 8px ${NEON_RED})` }}>🍸</span>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 800, letterSpacing: '0.5px', whiteSpace: 'nowrap', textShadow: `0 0 10px ${NEON_RED}66` }}>THE BAR</h1>
            <span style={{ fontSize: '9px', color: `${NEON_BLUE}d0`, letterSpacing: '1px', fontWeight: 600 }}>FIRST-PERSON LOUNGE</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* polished balance pill with count-up + coin badge */}
          <div key={currency} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 12px 5px 6px', minHeight: '40px', borderRadius: '22px', background: currency === 'GC' ? 'linear-gradient(135deg, rgba(255,210,74,0.22), rgba(255,210,74,0.06))' : 'linear-gradient(135deg, rgba(168,85,247,0.24), rgba(168,85,247,0.06))', border: `1px solid ${currency === 'GC' ? GC_GOLD : SC_PURPLE}99`, boxShadow: `0 0 14px ${currency === 'GC' ? GC_GOLD : SC_PURPLE}33`, animation: 'balancePop 0.45s ease' }}>
            {/* coin disc */}
            <span style={{ width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', background: currency === 'GC' ? 'radial-gradient(circle at 34% 30%, #fff3c4, #ffd24a 45%, #c98f10)' : 'radial-gradient(circle at 34% 30%, #e9ccff, #a855f7 48%, #6d28d9)', boxShadow: `inset 0 -2px 3px rgba(0,0,0,0.35), 0 0 8px ${currency === 'GC' ? GC_GOLD : SC_PURPLE}aa` }}>{currency === 'GC' ? '🪙' : '💜'}</span>
            <span style={{ color: currency === 'GC' ? GC_GOLD : SC_PURPLE, fontSize: '14px', fontWeight: 800, whiteSpace: 'nowrap', textShadow: `0 0 8px ${currency === 'GC' ? GC_GOLD : SC_PURPLE}55`, fontVariantNumeric: 'tabular-nums' }}>{formatCoins(animatedBalance)} {currency}</span>
          </div>
          {/* currency toggle */}
          <button onClick={() => setCurrency(currency === 'GC' ? 'SC' : 'GC')} title="Switch currency" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 10px', minWidth: '52px', height: '40px', borderRadius: '20px', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.85)', fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap' }}>
            ⇄ {currency === 'GC' ? 'SC' : 'GC'}
          </button>
          <button onClick={() => setPanel('cashier')} title="Cashier" style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', fontSize: '16px' }}>💰</button>
        </div>
      </div>

      {/* ════════ WELCOME HINT ════════ */}
      <div style={{ position: 'absolute', top: '64px', left: '50%', transform: 'translateX(-50%)', zIndex: 40, textAlign: 'center', pointerEvents: 'none', padding: '0 12px', maxWidth: '92%' }}>
        <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '20px', background: 'rgba(0,212,255,0.08)', border: `1px solid ${NEON_BLUE}44`, fontSize: '11px', letterSpacing: '1px', fontWeight: 700, color: NEON_BLUE, textTransform: 'uppercase', animation: 'bob 2.4s ease-in-out infinite' }}>
          You just walked into the lounge — tap any glowing spot
        </div>
      </div>

      {/* ════════ MOBILE / QUICK ACCESS DOCK ════════ */}
      <div className="bar-scroll" style={{ position: 'absolute', bottom: '40px', left: 0, right: 0, zIndex: 45, display: 'flex', gap: '8px', overflowX: 'auto', padding: '8px 12px', justifyContent: 'flex-start', WebkitOverflowScrolling: 'touch' }}>
        {HOTSPOTS.map((h) => (
          <button key={`dock-${h.id}`} onClick={() => setPanel(h.id)} style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', minHeight: '44px', borderRadius: '12px', cursor: 'pointer', background: 'rgba(10,10,18,0.8)', border: `1px solid ${h.color}66`, color: h.color, fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', backdropFilter: 'blur(6px)' }}>
            <span style={{ fontSize: '15px' }}>{h.icon}</span>{h.label}
          </button>
        ))}
        {/* Navigation to other rooms */}
        {[{ hash: 'game-pulse', icon: '🎰', label: 'Casino Floor', color: NEON_BLUE }, { hash: 'pool-hall', icon: '🎱', label: 'Pool Hall', color: '#22c55e' }].map((n) => (
          <button key={n.hash} onClick={() => { window.location.hash = n.hash; }} style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', minHeight: '44px', borderRadius: '12px', cursor: 'pointer', background: 'rgba(10,10,18,0.8)', border: `1px solid ${n.color}66`, color: n.color, fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', backdropFilter: 'blur(6px)' }}>
            <span style={{ fontSize: '15px' }}>{n.icon}</span>{n.label} →
          </button>
        ))}
      </div>

      {/* ════════ COMPLIANCE FOOTER ════════ */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 46, padding: '8px 12px', textAlign: 'center', background: 'rgba(6,6,14,0.95)', borderTop: `1px solid ${NEON_RED}22` }}>
        <p style={{ margin: 0, fontSize: '10.5px', color: 'rgba(255,255,255,0.5)' }}>
          <span style={{ color: `${NEON_RED}cc` }}>21+ Only</span> • No Purchase Necessary • Gold Coins for Entertainment • Sweeps Coins redeemable for prizes per Official Rules
        </p>
      </div>

      {/* ════════ PANELS ════════ */}
      {panel === 'jukebox' && (
        <JukeboxPanel onClose={() => setPanel(null)} isPlaying={isPlaying} setIsPlaying={setIsPlaying} currentTrack={currentTrack} setCurrentTrack={setCurrentTrack} tier={jukeTier} setTier={(t) => { setJukeTier(t); notify(t === 'free' ? 'Switched to Free tier.' : `Subscribed to ${(JUKEBOX_TIERS.find((x) => x.id === t) || JUKEBOX_TIERS[0]).name}! 🎶`); }} />
      )}
      {panel === 'darts' && <DartsGame {...gameApi} />}
      {panel === 'pinball' && <PinballGame {...gameApi} />}
      {panel === 'plinko' && <PlinkoGame {...gameApi} />}
      {panel === 'bartender' && <BartenderPanel onClose={() => setPanel(null)} notify={notify} goldCoins={goldCoins} sweepsCoins={sweepsCoins} onRedeem={redeemSweeps} redemptions={redemptions} />}
      {panel === 'chat' && <ChatPanel onClose={() => setPanel(null)} messages={messages} send={sendChat} />}
      {panel === 'avatar' && <AvatarShopPanel onClose={() => setPanel(null)} goldCoins={goldCoins} owned={owned} buy={buyItem} equip={(id) => { setEquipped(id); notify('Equipped!'); }} equipped={equipped} />}
      {panel === 'cashier' && <CashierPanel onClose={() => setPanel(null)} goldCoins={goldCoins} sweepsCoins={sweepsCoins} notify={notify} />}

      {/* ════════ NOTIFICATION TOAST ════════ */}
      {notification && (
        <div style={{ position: 'absolute', top: '70px', left: '50%', transform: 'translateX(-50%)', zIndex: 500, padding: '12px 22px', borderRadius: '14px', fontSize: '13px', fontWeight: 700, color: '#fff', background: `linear-gradient(135deg, ${NEON_RED}ee, ${NEON_BLUE}e6)`, boxShadow: '0 8px 30px rgba(0,0,0,0.4)', animation: 'slideDown 0.3s ease', maxWidth: 'calc(100vw - 28px)', textAlign: 'center' }}>
          {notification}
        </div>
      )}
    </div>
  );
}
