import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, X, Play, Pause, SkipBack, SkipForward, Music, Coins, CreditCard, Flame, Sparkles, MessageCircle, Send, ChevronDown, ChevronUp, Crown, Diamond, Star, Trophy, Zap } from 'lucide-react';

/**
 * Casino Floor — FIRST-PERSON POSTERBOARD GALLERY v10.0
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * THE VISION (per the user):
 * "When you walk into a casino, first-person view is what I want it to look like
 *  starting, then each independent game's name is on a posterboard with the name
 *  and description, and find all the new games from all the top platforms."
 *
 * WHAT THIS DOES:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. FIRST-PERSON WALK-IN POV — load drops you at the casino doors looking down
 *    the floor: receding neon carpet, glowing slot-lit walls, a vanishing point.
 * 2. POSTERBOARD / STANDEE GALLERY — every game stands on its own promo board
 *    with NAME + DESCRIPTION + PROVIDER badge + PLAY button.
 * 3. GROUPED BY PLATFORM — Pragmatic Play, Hacksaw, Push, Nolimit City, NetEnt,
 *    Play'n GO, Relax Gaming — real 2025-2026 titles.
 * 4. PARALLAX DEPTH — scroll forward and the floor streams toward you; standees
 *    rise out of the depth as you approach them.
 *
 * SWEEPSTAKES COMPLIANT (preserved):
 * - Dual currency: Gold Coins (GC) / Sweeps Coins (SC) with live toggle + balance
 * - Avatar presence, live chat, cashier, "no purchase necessary" disclosures
 */

declare global {
  interface Window {
    useWorkspaceDB: <T = any>(
      table: string,
      options?: { shared?: boolean; limit?: number; offset?: number; orderBy?: { column: string; direction: 'asc' | 'desc' }; filters?: Array<{ column: string; operator: string; value: any }> }
    ) => { data: T[]; loading: boolean; error: Error | null; total: number; refresh: () => void };
    __workspaceDb: any;
    // YouTube IFrame Player API (loaded on demand by the universal jukebox)
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────
type CurrencyType = 'GC' | 'SC';

interface Game {
  id: string;
  name: string;
  description: string;
  provider: string;
  accent: string;
  glow: string;
  emoji: string;
  symbols: string[];
}

interface Platform {
  key: string;
  name: string;
  tagline: string;
  accent: string;
  games: Game[];
}

interface ChatMessage {
  id: number;
  user: string;
  color: string;
  text: string;
}

// ─── Game Data (real current 2025-2026 titles, grouped by studio) ───────────────
const PLATFORMS: Platform[] = [
  {
    key: 'pragmatic',
    name: 'Pragmatic Play',
    tagline: 'Tumble slots & cluster pays',
    accent: '#ffd24a',
    games: [
      { id: 'pp-gates', name: 'Gates of Olympus 1000', provider: 'Pragmatic Play', description: 'Zeus-themed tumble slot, pays anywhere, up to 15,000x with multiplier orbs.', accent: '#ffd24a', glow: 'rgba(255,210,74,0.55)', emoji: '⚡', symbols: ['⚡', '👑', '💎'] },
      { id: 'pp-sweet', name: 'Sweet Bonanza', provider: 'Pragmatic Play', description: 'Candy cluster-pays classic with sugar-bomb multipliers.', accent: '#ff77c8', glow: 'rgba(255,119,200,0.55)', emoji: '🍬', symbols: ['🍬', '🍭', '🍓'] },
      { id: 'pp-sugar', name: 'Sugar Rush 1000', provider: 'Pragmatic Play', description: 'Sticky-multiplier cluster grid, high volatility.', accent: '#ff9ad2', glow: 'rgba(255,154,210,0.55)', emoji: '🍭', symbols: ['🍭', '🟪', '🟥'] },
      { id: 'pp-dog', name: 'The Dog House', provider: 'Pragmatic Play', description: 'Pet-themed with sticky wild multipliers and free spins.', accent: '#7cc6ff', glow: 'rgba(124,198,255,0.55)', emoji: '🐶', symbols: ['🐶', '🦴', '🐾'] },
    ],
  },
  {
    key: 'hacksaw',
    name: 'Hacksaw Gaming',
    tagline: 'Brutal volatility & cash collect',
    accent: '#ff4d4d',
    games: [
      { id: 'hs-pharaoh', name: 'Le Pharaoh', provider: 'Hacksaw Gaming', description: 'Egyptian treasure slot with coin-collect and golden scarab bonus.', accent: '#ffce54', glow: 'rgba(255,206,84,0.55)', emoji: '🏺', symbols: ['🏺', '🪲', '💰'] },
      { id: 'hs-wanted', name: 'Wanted Dead or a Wild', provider: 'Hacksaw Gaming', description: 'Brutal high-volatility western, up to 12,500x.', accent: '#ff4d4d', glow: 'rgba(255,77,77,0.55)', emoji: '🤠', symbols: ['🤠', '🔫', '💀'] },
      { id: 'hs-rip', name: 'RIP City', provider: 'Hacksaw Gaming', description: 'Gritty street-themed slot with respins and multipliers.', accent: '#9b6bff', glow: 'rgba(155,107,255,0.55)', emoji: '🌆', symbols: ['🌆', '💣', '💥'] },
      { id: 'hs-duel', name: 'Duel at Dawn', provider: 'Hacksaw Gaming', description: 'Western duel mechanic with prize collection.', accent: '#ff8a4d', glow: 'rgba(255,138,77,0.55)', emoji: '🌵', symbols: ['🌵', '🔫', '⭐'] },
      { id: 'hs-danny', name: 'Danny Dollar', provider: 'Hacksaw Gaming', description: 'Cheeky cash-collect slot with bonus buy.', accent: '#4ddf8a', glow: 'rgba(77,223,138,0.55)', emoji: '💵', symbols: ['💵', '🤑', '💰'] },
    ],
  },
  {
    key: 'push',
    name: 'Push Gaming',
    tagline: 'Mystery stacks & cluster grids',
    accent: '#22d3ee',
    games: [
      { id: 'pg-razor', name: 'Razor Shark Jackpots', provider: 'Push Gaming', description: 'Underwater mystery-stack slot with Razor Reveal jackpots.', accent: '#22d3ee', glow: 'rgba(34,211,238,0.55)', emoji: '🦈', symbols: ['🦈', '🌊', '💎'] },
      { id: 'pg-bigbite', name: 'Big Bite', provider: 'Push Gaming', description: 'Shark-themed sequel with progressive multipliers.', accent: '#38bdf8', glow: 'rgba(56,189,248,0.55)', emoji: '🐟', symbols: ['🐟', '🦈', '🪝'] },
      { id: 'pg-frog', name: 'Fire Hopper', provider: 'Push Gaming', description: 'Frog cluster grid with escalating multipliers.', accent: '#7ee787', glow: 'rgba(126,231,135,0.55)', emoji: '🐸', symbols: ['🐸', '🔥', '🪲'] },
      { id: 'pg-jam', name: "Jammin' Jars 2", provider: 'Push Gaming', description: 'Disco fruit cluster-pays with rainbow feature.', accent: '#ff5cf0', glow: 'rgba(255,92,240,0.55)', emoji: '🫙', symbols: ['🫙', '🍓', '🌈'] },
      { id: 'pg-banker', name: 'Fat Banker', provider: 'Push Gaming', description: 'Money-collect slot with bonus buy.', accent: '#ffd24a', glow: 'rgba(255,210,74,0.55)', emoji: '🎩', symbols: ['🎩', '💰', '💷'] },
    ],
  },
  {
    key: 'nolimit',
    name: 'Nolimit City',
    tagline: 'xWays, xBomb & insane max wins',
    accent: '#b026ff',
    games: [
      { id: 'nl-fire', name: 'Fire in the Hole 3', provider: 'Nolimit City', description: 'Mining xBomb slot, expanding grid, up to 600,000x.', accent: '#ff7a00', glow: 'rgba(255,122,0,0.55)', emoji: '⛏️', symbols: ['⛏️', '💣', '💥'] },
      { id: 'nl-eve', name: 'Poison Eve', provider: 'Nolimit City', description: 'Dark Garden of Eden theme with xWays and xNudge.', accent: '#7cf03a', glow: 'rgba(124,240,58,0.55)', emoji: '🍎', symbols: ['🍎', '🐍', '🌿'] },
      { id: 'nl-nitro', name: 'Nitropolis 4', provider: 'Nolimit City', description: 'Post-apocalyptic critter grid with xWays.', accent: '#b026ff', glow: 'rgba(176,38,255,0.55)', emoji: '🐀', symbols: ['🐀', '⚙️', '💥'] },
      { id: 'nl-quentin', name: 'San Quentin', provider: 'Nolimit City', description: 'Prison-themed xWays/xSplit brutal volatility.', accent: '#ff4d4d', glow: 'rgba(255,77,77,0.55)', emoji: '⛓️', symbols: ['⛓️', '🔪', '💀'] },
    ],
  },
  {
    key: 'netent',
    name: 'NetEnt',
    tagline: 'Iconic classics & avalanches',
    accent: '#34d399',
    games: [
      { id: 'ne-star', name: 'Starburst', provider: 'NetEnt', description: 'Classic gem expanding-wild arcade slot.', accent: '#a855f7', glow: 'rgba(168,85,247,0.55)', emoji: '🌟', symbols: ['🌟', '💎', '🔔'] },
      { id: 'ne-gonzo', name: "Gonzo's Quest", provider: 'NetEnt', description: 'Avalanche tumbling reels with increasing multipliers.', accent: '#34d399', glow: 'rgba(52,211,153,0.55)', emoji: '🗿', symbols: ['🗿', '🟦', '🟨'] },
      { id: 'ne-doa', name: 'Dead or Alive 2', provider: 'NetEnt', description: 'Outlaw western with sticky-wild free spins.', accent: '#e2b04a', glow: 'rgba(226,176,74,0.55)', emoji: '💀', symbols: ['💀', '🔫', '🤠'] },
    ],
  },
  {
    key: 'playngo',
    name: "Play'n GO",
    tagline: 'Adventure & cascading reels',
    accent: '#ff8c00',
    games: [
      { id: 'png-book', name: 'Book of Dead', provider: "Play'n GO", description: 'Rich Wilde Egyptian expanding-symbol adventure.', accent: '#ffb01f', glow: 'rgba(255,176,31,0.55)', emoji: '📜', symbols: ['📜', '🏺', '🦅'] },
      { id: 'png-react', name: 'Reactoonz', provider: "Play'n GO", description: 'Alien cluster-pays grid with Gargantoon feature.', accent: '#7cf03a', glow: 'rgba(124,240,58,0.55)', emoji: '👾', symbols: ['👾', '🛸', '⚡'] },
      { id: 'png-tome', name: 'Rich Wilde and the Tome of Madness', provider: "Play'n GO", description: 'Lovecraftian cascading orb slot.', accent: '#22d3ee', glow: 'rgba(34,211,238,0.55)', emoji: '🐙', symbols: ['🐙', '🔮', '👁️'] },
    ],
  },
  {
    key: 'relax',
    name: 'Relax Gaming',
    tagline: 'Heists, tumbles & huge wins',
    accent: '#5b8cff',
    games: [
      { id: 'rx-money', name: 'Money Train 4', provider: 'Relax Gaming', description: 'Heist-themed bonus-buy slot, up to 150,000x.', accent: '#5b8cff', glow: 'rgba(91,140,255,0.55)', emoji: '🚂', symbols: ['🚂', '💰', '🔫'] },
      { id: 'rx-temple', name: 'Temple Tumble 2', provider: 'Relax Gaming', description: 'Mayan tumbling megaways-style with free drops.', accent: '#34d399', glow: 'rgba(52,211,153,0.55)', emoji: '🛕', symbols: ['🛕', '🗿', '💎'] },
    ],
  },
];

const ALL_GAMES = PLATFORMS.flatMap(p => p.games);

const SEED_CHAT: ChatMessage[] = [
  { id: 1, user: 'LuckyLisa', color: '#ff6b9d', text: 'Gates of Olympus 1000 just paid me big 😮' },
  { id: 2, user: 'HighRoller_Mike', color: '#4ecdc4', text: 'Fire in the Hole 3 is pure chaos lol' },
  { id: 3, user: 'NightOwl_Sam', color: '#a29bfe', text: 'love the new walk-in view 🔥' },
  { id: 4, user: 'SlotKing99', color: '#6c5ce7', text: 'Razor Shark jackpots hitting tonight' },
];

const QUICK_CHATS = ['Good luck all! 🍀', 'Big win! 🎉', 'What should I play next?', 'GLHF 🎰'];

// Cabinet marquee: number of chasing bulbs along the top of the machine.
const MARQUEE_COUNT = 16;
// Premium symbols that can trigger the "anticipation" tension build on the last reel.
const PREMIUM_SYMBOLS = new Set(['7️⃣', '💎', '💰', '⭐', '🔔']);

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatCoins = (amount: number) => Math.max(0, Math.floor(amount)).toLocaleString();

// Surface a "max win" figure from a game's description (e.g. "up to 15,000x").
const getMaxWin = (description: string): string | null => {
  const m = description.match(/up to ([\d,]+)\s*x/i);
  return m ? `${m[1]}x` : null;
};

// Decide which corner ribbon a poster shows: MAX-WIN chip if a payout is named,
// otherwise alternate a sparkly HOT / NEW badge for visual variety.
type RibbonKind = 'MAX' | 'HOT' | 'NEW';
const getRibbon = (game: Game, index: number): { kind: RibbonKind; label: string } => {
  const maxWin = getMaxWin(game.description);
  if (maxWin) return { kind: 'MAX', label: maxWin };
  return index % 2 === 0 ? { kind: 'HOT', label: 'HOT' } : { kind: 'NEW', label: 'NEW' };
};

// Build a 5x3 reel grid from a game's themed symbols + filler.
const buildReels = (symbols: string[]): string[][] => {
  const filler = ['🍒', '🔔', '7️⃣', '⭐', '💰'];
  const pool = [...symbols, ...filler];
  const reels: string[][] = [];
  for (let r = 0; r < 5; r++) {
    const col: string[] = [];
    for (let i = 0; i < 3; i++) {
      col.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    reels.push(col);
  }
  return reels;
};

// ─── Posterboard / Standee Card ───────────────────────────────────────────────
interface PosterboardProps {
  game: Game;
  index: number;
  onPlay: (game: Game) => void;
}

const Posterboard = ({ game, index, onPlay }: PosterboardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [hover, setHover] = useState(false);
  const ribbon = getRibbon(game, index);
  const sym = game.symbols;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setInView(true);
        });
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        flex: '0 0 auto',
        width: '230px',
        perspective: '900px',
        transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.2,0.7,0.2,1)',
        transitionDelay: `${(index % 5) * 70}ms`,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.82)',
      }}
    >
      {/* The standee board */}
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          position: 'relative',
          borderRadius: '16px',
          padding: '16px',
          background: 'linear-gradient(165deg, #15151f 0%, #0c0c14 60%, #08080d 100%)',
          border: `2px solid ${hover ? game.accent : 'rgba(255,255,255,0.12)'}`,
          boxShadow: hover
            ? `0 18px 50px rgba(0,0,0,0.6), 0 0 36px ${game.glow}`
            : `0 14px 36px rgba(0,0,0,0.55), 0 0 14px ${game.glow}`,
          transform: hover ? 'translateY(-8px) rotateX(2deg)' : 'rotateX(6deg)',
          transformOrigin: 'bottom center',
          transition: 'transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Provider badge */}
        <span
          style={{
            alignSelf: 'flex-start',
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: '#0a0a0f',
            background: game.accent,
            padding: '3px 9px',
            borderRadius: '20px',
          }}
        >
          {game.provider}
        </span>

        {/* Art panel — premium CSS/SVG promo poster (layered, animated) */}
        <div
          style={{
            position: 'relative',
            height: '136px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: `1px solid ${game.accent}66`,
            background: `radial-gradient(circle at 50% 30%, ${game.glow} 0%, rgba(0,0,0,0) 60%), linear-gradient(160deg, ${game.accent}26 0%, #07070d 68%, #020205 100%)`,
            boxShadow: `inset 0 -34px 56px rgba(0,0,0,0.72), inset 0 0 30px ${game.glow}`,
          }}
        >
          {/* Animated spotlight glow */}
          <div
            style={{
              position: 'absolute', left: '50%', top: '36%', width: '160px', height: '120px',
              transform: 'translate(-50%,-50%)',
              background: `radial-gradient(ellipse, ${game.glow} 0%, transparent 70%)`,
              filter: 'blur(8px)',
              animation: `pbSpotlight ${hover ? '2.2s' : '4.2s'} ease-in-out infinite`,
            }}
          />

          {/* Holographic diagonal sheen — sweeps faster on hover */}
          <div
            style={{
              position: 'absolute', top: '-20%', bottom: '-20%', left: 0, width: '42%',
              background: 'linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.26) 44%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.26) 56%, transparent 100%)',
              mixBlendMode: 'overlay',
              pointerEvents: 'none',
              animation: `pbSheen ${hover ? '2.4s' : '6s'} ease-in-out infinite`,
            }}
          />

          {/* Floating themed-symbol collage around the centerpiece */}
          <span style={{ position: 'absolute', top: '14px', left: '16px', fontSize: '27px', opacity: 0.85, filter: 'drop-shadow(0 4px 7px rgba(0,0,0,0.6))', animation: `pbFloat1 ${hover ? '2.6s' : '4.3s'} ease-in-out infinite` }}>
            {sym[0]}
          </span>
          <span style={{ position: 'absolute', top: '18px', right: '14px', fontSize: '22px', opacity: 0.72, filter: 'drop-shadow(0 4px 7px rgba(0,0,0,0.6))', animation: `pbFloat2 ${hover ? '2.9s' : '4.9s'} ease-in-out infinite` }}>
            {sym[1] ?? sym[0]}
          </span>
          <span style={{ position: 'absolute', top: '52px', right: '34px', fontSize: '17px', opacity: 0.6, filter: 'drop-shadow(0 4px 7px rgba(0,0,0,0.6))', animation: `pbFloat3 ${hover ? '3.1s' : '5.3s'} ease-in-out infinite` }}>
            {sym[2] ?? sym[0]}
          </span>

          {/* Centerpiece emoji */}
          <span
            style={{
              position: 'absolute', left: '50%', top: '42%',
              fontSize: '56px',
              filter: `drop-shadow(0 0 16px ${game.glow}) drop-shadow(0 7px 11px rgba(0,0,0,0.6))`,
              animation: `pbCenter ${hover ? '2s' : '3.6s'} ease-in-out infinite`,
            }}
          >
            {game.emoji}
          </span>

          {/* Foil-style game title overlaid at the base of the poster */}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 10px 8px', background: 'linear-gradient(0deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 65%, transparent 100%)' }}>
            <div style={{ height: '2px', width: '32px', marginBottom: '5px', borderRadius: '2px', background: `linear-gradient(90deg, ${game.accent}, #ffffff)`, boxShadow: `0 0 8px ${game.glow}` }} />
            <span
              style={{
                display: 'block',
                fontSize: '12.5px', fontWeight: 900, letterSpacing: '0.3px', lineHeight: 1.05,
                backgroundImage: `linear-gradient(100deg, ${game.accent} 0%, #ffffff 34%, ${game.accent} 54%, #ffffff 78%, ${game.accent} 100%)`,
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                animation: `pbFoil ${hover ? '2.2s' : '4.5s'} linear infinite`,
              }}
            >
              {game.name}
            </span>
          </div>

          {/* Corner ribbon — sparkly MAX-WIN payout chip, or HOT / NEW badge */}
          <div
            style={{
              position: 'absolute', top: '10px', right: '10px',
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '3px 8px', borderRadius: '20px',
              background: ribbon.kind === 'MAX' ? `linear-gradient(135deg, ${game.accent}, #ffffff)` : 'rgba(0,0,0,0.6)',
              border: ribbon.kind === 'MAX' ? '1px solid rgba(255,255,255,0.6)' : `1px solid ${game.accent}88`,
              animation: 'pbChip 2.2s ease-in-out infinite',
            }}
          >
            {ribbon.kind === 'MAX' ? (
              <>
                <Sparkles style={{ width: 11, height: 11, color: '#0a0a0f' }} />
                <span style={{ fontSize: '9px', fontWeight: 900, color: '#0a0a0f', letterSpacing: '0.3px' }}>{ribbon.label}</span>
              </>
            ) : ribbon.kind === 'HOT' ? (
              <>
                <Flame style={{ width: 10, height: 10, color: '#ff5a3c' }} />
                <span style={{ fontSize: '8px', fontWeight: 800, color: '#ff8a6a', letterSpacing: '0.5px' }}>{ribbon.label}</span>
              </>
            ) : (
              <>
                <Zap style={{ width: 10, height: 10, color: game.accent }} />
                <span style={{ fontSize: '8px', fontWeight: 800, color: game.accent, letterSpacing: '0.5px' }}>{ribbon.label}</span>
              </>
            )}
          </div>
        </div>

        {/* Name */}
        <h3
          style={{
            margin: 0,
            fontSize: '17px',
            fontWeight: 800,
            lineHeight: 1.15,
            color: '#ffffff',
            minHeight: '40px',
            textShadow: `0 0 12px ${game.glow}`,
          }}
        >
          {game.name}
        </h3>

        {/* Description */}
        <p
          style={{
            margin: 0,
            fontSize: '11.5px',
            lineHeight: 1.45,
            color: 'rgba(255,255,255,0.62)',
            minHeight: '50px',
          }}
        >
          {game.description}
        </p>

        {/* PLAY button */}
        <button
          onClick={() => onPlay(game)}
          style={{
            marginTop: '2px',
            width: '100%',
            minHeight: '44px',
            padding: '11px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 800,
            letterSpacing: '1px',
            color: '#0a0a0f',
            background: `linear-gradient(135deg, ${game.accent} 0%, #ffffff 220%)`,
            boxShadow: `0 6px 20px ${game.glow}`,
          }}
        >
          <Play style={{ width: 18, height: 18, fill: '#0a0a0f' }} />
          PLAY
        </button>
      </div>

      {/* Easel base / floor stand */}
      <div
        style={{
          margin: '0 auto',
          width: '70%',
          height: '14px',
          background: `radial-gradient(ellipse at 50% 0%, ${game.glow} 0%, rgba(0,0,0,0) 75%)`,
          borderRadius: '50%',
          transform: 'translateY(-2px)',
        }}
      />
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// UNIVERSAL JUKEBOX — canonical player ported from The Bar (apps/TheBar/App.tsx)
// ----------------------------------------------------------------------------
// Same playlist (genres incl. Rap/Hip-Hop loaded first, per the brand audience)
// and the same control language as The Bar: spinning-vinyl now-playing panel,
// play/pause, skip, volume and a genre/track list. Here it is restyled to the
// Casino Floor gold/dark aesthetic and docked as a compact corner widget so it
// never covers the slot reels. It plays REAL background audio through the
// YouTube IFrame Player API and persists its state to localStorage so the music
// carries across venues (The Bar → Casino Floor → Pool Hall) and resumes where
// it left off rather than restarting abruptly.
//
// NOTE on continuity: the Space runs each venue as a separate compiled app, so
// there is no shared shell-level audio element. localStorage (same origin) is
// the closest the per-app architecture allows — we restore the track + playhead
// on entry so playback resumes seamlessly.
// ════════════════════════════════════════════════════════════════════════════
interface JukeTrack { title: string; artist: string; duration: string; videoId: string; }
interface JukeGenre { id: string; label: string; icon: string; tracks: JukeTrack[]; }

const JUKEBOX_GENRES: JukeGenre[] = [
  {
    id: 'rap', label: 'Rap / Hip-Hop', icon: '🎤',
    tracks: [
      { title: 'A Milli', artist: 'Lil Wayne', duration: '3:41', videoId: 'GKIsZ4q9beU' },
      { title: 'Lollipop', artist: 'Lil Wayne', duration: '4:59', videoId: 'Bm5iA4Zupek' },
      { title: '6 Foot 7 Foot', artist: 'Lil Wayne', duration: '4:10', videoId: 'cdWQ8juxBkw' },
      { title: 'Wipe Me Down', artist: 'Lil Boosie', duration: '4:52', videoId: 'noQTH8FZ3Vs' },
      { title: 'Lemonade', artist: 'Gucci Mane', duration: '4:01', videoId: '5sIfYThk0Eo' },
      { title: 'What You Know', artist: 'T.I.', duration: '4:48', videoId: 'MkV-gv4xUYg' },
      { title: 'Soul Survivor', artist: 'Young Jeezy', duration: '4:08', videoId: 'Fp3Mk1A_yvg' },
      { title: 'Put On', artist: 'Young Jeezy', duration: '4:34', videoId: '9b6Eu4qe2qY' },
    ],
  },
  {
    id: 'rnb', label: 'R&B / Soul', icon: '💜',
    tracks: [
      { title: 'Smooth Operator', artist: 'Sade', duration: '4:58', videoId: '4TYv2PhG89A' },
      { title: 'Purple Rain', artist: 'Prince', duration: '8:41', videoId: 'TvnYmWpD_T8' },
      { title: 'Superstition', artist: 'Stevie Wonder', duration: '4:26', videoId: '0CFuCYNx-1g' },
      { title: 'Billie Jean', artist: 'Michael Jackson', duration: '4:54', videoId: 'Zi_XLOBDo_Y' },
    ],
  },
  {
    id: 'rock', label: 'Rock', icon: '🎸',
    tracks: [
      { title: 'Hotel California', artist: 'Eagles', duration: '6:30', videoId: 'EqPtz5qN7HM' },
      { title: 'Born to Run', artist: 'Bruce Springsteen', duration: '4:30', videoId: 'IxuThNgl3YA' },
      { title: 'Sweet Child O Mine', artist: 'Guns N Roses', duration: '5:56', videoId: '1w7OgIMMRc4' },
    ],
  },
  {
    id: 'blues', label: 'Blues', icon: '🎷',
    tracks: [
      { title: 'The Thrill Is Gone', artist: 'B.B. King', duration: '5:24', videoId: 'oica5jG7FpU' },
      { title: 'Pride and Joy', artist: 'Stevie Ray Vaughan', duration: '4:11', videoId: 'T_25Eitc2Zg' },
    ],
  },
  {
    id: 'classic', label: 'Classic Hits', icon: '✨',
    tracks: [
      { title: 'Fly Me to the Moon', artist: 'Frank Sinatra', duration: '2:27', videoId: 'ZEcqHA7dbwM' },
      { title: 'Take Five', artist: 'Dave Brubeck', duration: '5:24', videoId: 'vmDDOFXSgAs' },
    ],
  },
];
const JUKEBOX_FLAT: JukeTrack[] = JUKEBOX_GENRES.flatMap((g) => g.tracks);
const JUKE_STORAGE_KEY = 'dam_fortunes_jukebox_v1';
const JUKE_GOLD = '#ffd24a';

interface JukeState { trackIndex: number; isPlaying: boolean; volume: number; muted: boolean; currentTime: number; savedAt: number; }
const readJukeState = (): JukeState | null => {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(JUKE_STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (typeof s.trackIndex !== 'number' || s.trackIndex < 0 || s.trackIndex >= JUKEBOX_FLAT.length) s.trackIndex = 0;
    return s as JukeState;
  } catch { return null; }
};

const CasinoJukebox = ({ reducedMotion }: { reducedMotion: boolean }) => {
  const restored = useRef<JukeState | null>(readJukeState()).current;

  const playerRef = useRef<any>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const readyRef = useRef(false);
  const pollRef = useRef<number | null>(null);
  const errCountRef = useRef(0);

  const [trackIndex, setTrackIndex] = useState<number>(restored ? restored.trackIndex : 0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // truth comes from the player's state events
  const [volume, setVolume] = useState<number>(restored && typeof restored.volume === 'number' ? restored.volume : 55);
  const [muted, setMuted] = useState<boolean>(restored ? !!restored.muted : false);
  const [expanded, setExpanded] = useState(false);
  const [genreId, setGenreId] = useState<string>('rap');

  const track = JUKEBOX_FLAT[trackIndex] || JUKEBOX_FLAT[0];
  const genre = JUKEBOX_GENRES.find((g) => g.id === genreId) || JUKEBOX_GENRES[0];

  // ── Create the hidden YouTube player once (loading the IFrame API on demand) ──
  useEffect(() => {
    let cancelled = false;
    const createPlayer = () => {
      if (cancelled || playerRef.current || !mountRef.current || !window.YT || !window.YT.Player) return;
      playerRef.current = new window.YT.Player(mountRef.current, {
        width: '0', height: '0',
        videoId: track.videoId,
        playerVars: { autoplay: restored && restored.isPlaying ? 1 : 0, controls: 0, disablekb: 1, modestbranding: 1, rel: 0, playsinline: 1, fs: 0 },
        events: {
          onReady: (e: any) => {
            readyRef.current = true;
            try { e.target.setVolume(muted ? 0 : volume); } catch { /* ignore */ }
            // Resume the playhead so music continues rather than restarting.
            if (restored && restored.trackIndex === trackIndex && restored.currentTime) {
              let t = restored.currentTime;
              if (restored.isPlaying && restored.savedAt) t += (Date.now() - restored.savedAt) / 1000;
              try { e.target.seekTo(Math.max(0, t), true); } catch { /* ignore */ }
            }
            if (restored && restored.isPlaying) { try { e.target.playVideo(); } catch { /* ignore */ } }
          },
          onStateChange: (e: any) => {
            const YT = window.YT;
            if (!YT || !YT.PlayerState) return;
            if (e.data === YT.PlayerState.PLAYING) { errCountRef.current = 0; setIsPlaying(true); }
            else if (e.data === YT.PlayerState.PAUSED) setIsPlaying(false);
            else if (e.data === YT.PlayerState.ENDED) setTrackIndex((i) => (i + 1) % JUKEBOX_FLAT.length);
          },
          onError: () => {
            // A track may be region-locked or have embedding disabled — skip on,
            // but stop after a full loop so we never spin forever.
            errCountRef.current += 1;
            if (errCountRef.current > JUKEBOX_FLAT.length) { errCountRef.current = 0; setIsPlaying(false); return; }
            setTrackIndex((i) => (i + 1) % JUKEBOX_FLAT.length);
          },
        },
      });
    };
    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      if (typeof document !== 'undefined' && !document.getElementById('yt-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { if (prev) { try { prev(); } catch { /* ignore */ } } createPlayer(); };
      // Poll too, in case the API was already initialised by another venue.
      pollRef.current = window.setInterval(() => {
        if (window.YT && window.YT.Player) { if (pollRef.current) window.clearInterval(pollRef.current); createPlayer(); }
      }, 300);
    }
    return () => {
      cancelled = true;
      if (pollRef.current) window.clearInterval(pollRef.current);
      try { playerRef.current && playerRef.current.destroy && playerRef.current.destroy(); } catch { /* ignore */ }
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load the new video when the track changes (skips, track picks, auto-advance) ──
  // The initial video is set at player creation, and this effect early-returns while
  // the player is not ready, so it only fires on genuine track changes (no double-load).
  useEffect(() => {
    if (!readyRef.current || !playerRef.current) return;
    try { playerRef.current.loadVideoById(track.videoId); } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIndex]);

  // ── Apply volume / mute to the player ──
  useEffect(() => {
    if (playerRef.current && readyRef.current) { try { playerRef.current.setVolume(muted ? 0 : volume); } catch { /* ignore */ } }
  }, [volume, muted]);

  // ── Persist state (cross-venue continuity) ──
  useEffect(() => {
    const save = () => {
      try {
        let currentTime = restored && restored.trackIndex === trackIndex ? (restored.currentTime || 0) : 0;
        if (playerRef.current && readyRef.current && playerRef.current.getCurrentTime) {
          const ct = playerRef.current.getCurrentTime();
          if (typeof ct === 'number' && !isNaN(ct)) currentTime = ct;
        }
        window.localStorage.setItem(JUKE_STORAGE_KEY, JSON.stringify({ trackIndex, isPlaying, volume, muted, currentTime, savedAt: Date.now() }));
      } catch { /* ignore */ }
    };
    save();
    const id = window.setInterval(save, 4000);
    return () => { window.clearInterval(id); save(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIndex, isPlaying, volume, muted]);

  const togglePlay = () => {
    const p = playerRef.current;
    if (!p || !readyRef.current) { setIsPlaying((v) => !v); return; }
    try { if (isPlaying) p.pauseVideo(); else p.playVideo(); } catch { setIsPlaying((v) => !v); }
  };
  const skip = (dir: number) => setTrackIndex((i) => (i + dir + JUKEBOX_FLAT.length) % JUKEBOX_FLAT.length);
  const selectTrack = (t: JukeTrack) => {
    const idx = JUKEBOX_FLAT.findIndex((x) => x.videoId === t.videoId);
    if (idx < 0) return;
    errCountRef.current = 0;
    setTrackIndex(idx);
    if (idx === trackIndex && playerRef.current && readyRef.current) { try { playerRef.current.playVideo(); } catch { /* ignore */ } }
  };

  const panelBg = 'linear-gradient(180deg, rgba(22,17,8,0.97) 0%, rgba(8,8,12,0.97) 100%)';
  const goldBorder = `1px solid ${JUKE_GOLD}55`;
  const ctrlBtn = (extra: { [k: string]: string | number }): { [k: string]: string | number } => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
    background: 'rgba(255,255,255,0.08)', color: '#fff', ...extra,
  });

  return (
    <>
      {/* Off-screen YouTube audio host (replaced by an <iframe> on init) */}
      <div aria-hidden="true" style={{ position: 'fixed', width: '1px', height: '1px', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
        <div ref={mountRef} />
      </div>

      {/* Expandable track list / genre picker / volume — sits above the docked bar */}
      {expanded && (
        <div
          style={{
            position: 'fixed', left: '12px', bottom: '92px', zIndex: 92,
            width: 'min(360px, calc(100vw - 24px))', maxHeight: '54vh', overflowY: 'auto',
            borderRadius: '16px', padding: '14px', background: panelBg, border: goldBorder,
            boxShadow: `0 0 40px ${JUKE_GOLD}33, 0 14px 40px rgba(0,0,0,0.6)`, backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: JUKE_GOLD, display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Music style={{ width: 15, height: 15 }} /> The Jukebox
            </span>
            <button onClick={() => setExpanded(false)} aria-label="Collapse jukebox" style={ctrlBtn({ width: '32px', height: '32px', fontSize: '16px' })}>
              <X style={{ width: 15, height: 15 }} />
            </button>
          </div>

          {/* Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <button onClick={() => setMuted((m) => !m)} aria-label={muted ? 'Unmute' : 'Mute'} style={ctrlBtn({ width: '38px', height: '38px' })}>
              {muted || volume === 0 ? <VolumeX style={{ width: 17, height: 17 }} /> : <Volume2 style={{ width: 17, height: 17, color: JUKE_GOLD }} />}
            </button>
            <input
              type="range" min={0} max={100} value={muted ? 0 : volume} aria-label="Volume"
              onChange={(e) => { const v = Number(e.target.value); setVolume(v); if (v > 0 && muted) setMuted(false); }}
              style={{ flex: 1, accentColor: JUKE_GOLD, height: '4px' }}
            />
            <span style={{ width: '34px', textAlign: 'right', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{muted ? 0 : volume}</span>
          </div>

          {/* Genre tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {JUKEBOX_GENRES.map((g) => (
              <button key={g.id} onClick={() => setGenreId(g.id)} style={{
                padding: '7px 11px', minHeight: '36px', borderRadius: '18px', cursor: 'pointer', fontSize: '11.5px', fontWeight: 700,
                border: `1px solid ${genreId === g.id ? JUKE_GOLD : 'rgba(255,255,255,0.15)'}`,
                background: genreId === g.id ? 'rgba(255,210,74,0.16)' : 'rgba(255,255,255,0.05)',
                color: genreId === g.id ? JUKE_GOLD : 'rgba(255,255,255,0.8)',
              }}>{g.icon} {g.label}</button>
            ))}
          </div>

          {/* Track list */}
          <div style={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            {genre.tracks.map((t, i) => {
              const sel = t.videoId === track.videoId;
              return (
                <button key={`${t.videoId}-${i}`} onClick={() => selectTrack(t)} style={{
                  width: '100%', minHeight: '48px', textAlign: 'left', padding: '10px 13px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                  border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  background: sel ? 'rgba(255,210,74,0.14)' : 'transparent',
                }}>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: sel ? JUKE_GOLD : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</span>
                    <span style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{t.artist}</span>
                  </span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>{sel && isPlaying ? '♫' : t.duration}</span>
                </button>
              );
            })}
          </div>
          <p style={{ margin: '12px 0 0', fontSize: '10px', textAlign: 'center', lineHeight: 1.5, color: 'rgba(255,255,255,0.4)' }}>
            One jukebox across the whole floor. For entertainment only.
          </p>
        </div>
      )}

      {/* Docked compact control bar */}
      <div
        style={{
          position: 'fixed', left: '12px', bottom: '12px', zIndex: 90,
          width: 'min(360px, calc(100vw - 20px))',
          display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 11px',
          borderRadius: '16px', background: panelBg, border: goldBorder,
          boxShadow: `0 0 28px ${JUKE_GOLD}33, 0 10px 30px rgba(0,0,0,0.55)`, backdropFilter: 'blur(10px)',
        }}
      >
        {/* Spinning vinyl */}
        <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'repeating-radial-gradient(circle at center, #111 0 1.2px, #1d1d1d 1.2px 2.4px), radial-gradient(circle at 36% 30%, rgba(255,255,255,0.18), transparent 45%)',
            border: '2px solid #2a2a2a', boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: (isPlaying && !reducedMotion) ? 'vinylSpin 2.2s linear infinite' : 'none',
          }}>
            <div style={{ width: '13px', height: '13px', borderRadius: '50%', background: `radial-gradient(circle at center, #fff 18%, ${JUKE_GOLD} 20%)` }} />
          </div>
        </div>

        {/* Track label */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '8.5px', letterSpacing: '1px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>{isPlaying ? '♫ NOW PLAYING' : '♫ PAUSED'}</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
          <div style={{ fontSize: '11px', color: JUKE_GOLD, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</div>
        </div>

        {/* Controls */}
        <button onClick={() => skip(-1)} aria-label="Previous track" style={ctrlBtn({ width: '38px', height: '38px' })}>
          <SkipBack style={{ width: 15, height: 15 }} />
        </button>
        <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} style={ctrlBtn({ width: '44px', height: '44px', color: '#0a0a0f', background: `linear-gradient(135deg, ${JUKE_GOLD}, #e0a82a)`, boxShadow: `0 3px 14px ${JUKE_GOLD}66` })}>
          {isPlaying ? <Pause style={{ width: 18, height: 18 }} /> : <Play style={{ width: 18, height: 18, fill: '#0a0a0f' }} />}
        </button>
        <button onClick={() => skip(1)} aria-label="Next track" style={ctrlBtn({ width: '38px', height: '38px' })}>
          <SkipForward style={{ width: 15, height: 15 }} />
        </button>
        <button onClick={() => setExpanded((e) => !e)} aria-label={expanded ? 'Hide playlist' : 'Show playlist'} style={ctrlBtn({ width: '34px', height: '38px', borderRadius: '10px' })}>
          {expanded ? <ChevronDown style={{ width: 15, height: 15 }} /> : <ChevronUp style={{ width: 15, height: 15, color: JUKE_GOLD }} />}
        </button>
      </div>
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CasinoFloor() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sound
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundOnRef = useRef(true);
  useEffect(() => { soundOnRef.current = soundEnabled; }, [soundEnabled]);
  // Short percussive click for each reel lock; bright chime stack for a win. Timed to the reel stops.
  const playTone = useCallback((freq: number, durMs: number, type: OscillatorType = 'square', gain = 0.08) => {
    if (!soundOnRef.current) return;
    try {
      let ctx = audioCtxRef.current;
      if (!ctx) { ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); audioCtxRef.current = ctx; }
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = type; osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(gain, now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, now + durMs / 1000);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(now); osc.stop(now + durMs / 1000 + 0.02);
    } catch { /* audio unavailable — silent */ }
  }, []);
  const playReelStop = useCallback((idx: number) => {
    // Pitch climbs slightly with each reel for a satisfying ascending "ka-chunk" cadence.
    playTone(150 + idx * 26, 70, 'square', 0.07);
    playTone(80 + idx * 14, 95, 'triangle', 0.05);
  }, [playTone]);
  const playWinChime = useCallback((mult: number) => {
    const notes = mult >= 25 ? [523, 659, 784, 1047, 1319] : mult >= 5 ? [523, 659, 784, 1047] : [523, 784];
    notes.forEach((f, i) => window.setTimeout(() => playTone(f, 260, 'sine', 0.07), i * 90));
  }, [playTone]);

  // Wallet (preserved DB load — falls back to defaults gracefully)
  const [goldCoins, setGoldCoins] = useState(10000);
  const [sweepsCoins, setSweepsCoins] = useState(100);
  const [activeCurrency, setActiveCurrency] = useState<CurrencyType>('GC');

  // Scroll / parallax
  const [scrollY, setScrollY] = useState(0);

  // Game launch / spin state
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [reels, setReels] = useState<string[][]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningCols, setSpinningCols] = useState<boolean[]>([false, false, false, false, false]);
  const [spinResult, setSpinResult] = useState<{ win: number } | null>(null);
  const [spinFx, setSpinFx] = useState(0);
  const [bet, setBet] = useState(100);

  // UI
  const [showCashier, setShowCashier] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Chat (preserved social system)
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_CHAT);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Polish state (motion blur per reel, anticipation, marquee, button feel, idle attract) ──
  // reelMotion[ci]: 2 = fast (strong vertical blur), 1 = decelerating (soft blur), 0 = locked (crisp).
  const [reelMotion, setReelMotion] = useState<number[]>([0, 0, 0, 0, 0]);
  const [anticipation, setAnticipation] = useState(false); // tension frame on the final reel
  const [marqueeFast, setMarqueeFast] = useState(false);    // marquee bulbs flash faster briefly on a win
  const [btnPressed, setBtnPressed] = useState(false);      // spin button depressed state
  const [idleAttract, setIdleAttract] = useState(false);    // attract-mode pulse after idle
  const [reducedMotion, setReducedMotion] = useState(false);
  const latestReelsRef = useRef<string[][]>([]);            // mirror of reels for in-flight payline reads
  const idleTimerRef = useRef<number | null>(null);
  const marqueeTimerRef = useRef<number | null>(null);

  // Respect prefers-reduced-motion: soften / disable all the new motion when requested.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    if (mq.addEventListener) mq.addEventListener('change', update);
    else if ((mq as any).addListener) (mq as any).addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', update);
      else if ((mq as any).removeListener) (mq as any).removeListener(update);
    };
  }, []);

  const currentBalance = activeCurrency === 'GC' ? goldCoins : sweepsCoins;

  // ── Load wallet from DB (preserved behavior) ──
  useEffect(() => {
    const loadWallet = async () => {
      try {
        const db = (window as any).__workspaceDb;
        if (db) {
          const result = await db.from('user_wallets').get();
          if (result?.data?.[0]) {
            const row = result.data[0];
            if (typeof row.gold_coins === 'number') setGoldCoins(row.gold_coins);
            if (typeof row.sweeps_coins === 'number') setSweepsCoins(row.sweeps_coins);
          }
        }
      } catch (e) {
        console.log('Wallet not available, using defaults');
      }
    };
    loadWallet();
  }, []);

  // ── Auto-scroll chat ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatOpen]);

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    window.setTimeout(() => setNotification(null), 3000);
  }, []);

  // ── Idle attract mode: after a few seconds of no spinning, gently invite a spin ──
  useEffect(() => {
    if (idleTimerRef.current) { window.clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
    if (!selectedGame || isSpinning) { setIdleAttract(false); return; }
    idleTimerRef.current = window.setTimeout(() => setIdleAttract(true), 4500);
    return () => { if (idleTimerRef.current) { window.clearTimeout(idleTimerRef.current); idleTimerRef.current = null; } };
  }, [selectedGame, isSpinning, spinResult]);

  // ── Open a game (reuses slot-style launch logic) ──
  const openGame = useCallback((game: Game) => {
    setSelectedGame(game);
    const fresh = buildReels(game.symbols);
    latestReelsRef.current = fresh;
    setReels(fresh);
    setSpinResult(null);
    setIsSpinning(false);
    setReelMotion([0, 0, 0, 0, 0]);
    setAnticipation(false);
    setMarqueeFast(false);
    setIdleAttract(false);
    setBet(activeCurrency === 'GC' ? 100 : 1);
  }, [activeCurrency]);

  const closeGame = useCallback(() => {
    setSelectedGame(null);
    setIsSpinning(false);
    setSpinResult(null);
    setReelMotion([0, 0, 0, 0, 0]);
    setAnticipation(false);
    setIdleAttract(false);
  }, []);

  // ── Spin logic (dual currency aware, updates balance) ──
  const spin = useCallback(() => {
    if (!selectedGame || isSpinning) return;
    if (currentBalance < bet) {
      showNotification('Not enough coins — visit the Cashier or claim a daily bonus!');
      return;
    }

    // Deduct bet
    if (activeCurrency === 'GC') setGoldCoins((g) => g - bet);
    else setSweepsCoins((s) => s - bet);

    setIsSpinning(true);
    setSpinResult(null);
    setIdleAttract(false);
    setMarqueeFast(false);
    setAnticipation(false);
    setSpinningCols([true, true, true, true, true]);
    setReelMotion([2, 2, 2, 2, 2]); // all reels start at full speed → strong motion blur

    const symbols = selectedGame.symbols;
    const pool = [...symbols, '🍒', '🔔', '7️⃣', '⭐', '💰'];
    // Only columns still spinning re-randomize each tick — reels lock left-to-right.
    const stopped = [false, false, false, false, false];
    const lockedPayline: string[] = []; // payline (center row) symbol captured as each reel locks
    const shuffle = window.setInterval(() => {
      setReels((prev) => {
        const base = prev.length === 5 ? prev : buildReels(symbols);
        const next = base.map((col, ci) =>
          stopped[ci]
            ? col
            : Array.from({ length: 3 }, () => pool[Math.floor(Math.random() * pool.length)])
        );
        latestReelsRef.current = next;
        return next;
      });
    }, 70);

    // Helper: ease a reel into its lock — soft-blur decel phase, then crisp snap.
    const setMotion = (ci: number, val: number) =>
      setReelMotion((prev) => { const n = [...prev]; n[ci] = val; return n; });
    const lockReel = (ci: number) => {
      stopped[ci] = true;
      lockedPayline[ci] = latestReelsRef.current[ci]?.[1] ?? '';
      setMotion(ci, 0);
      setSpinningCols((prev) => { const next = [...prev]; next[ci] = false; return next; });
      playReelStop(ci); // click lands in sync with the reel lock
    };

    // Resolve the predetermined outcome — UNCHANGED math/odds. Visual timing only differs above.
    const resolveOutcome = () => {
      window.clearInterval(shuffle);
      setAnticipation(false);
      const roll = Math.random();
      let multiplier = 0;
      if (roll > 0.97) multiplier = 25; // rare big hit
      else if (roll > 0.85) multiplier = 5;
      else if (roll > 0.62) multiplier = 2;
      const win = Math.floor(bet * multiplier);
      if (win > 0) {
        if (activeCurrency === 'GC') setGoldCoins((g) => g + win);
        else setSweepsCoins((s) => s + win);
        window.setTimeout(() => playWinChime(multiplier), 150); // chime just after the last reel settles
        // Marquee bulbs flash faster briefly to celebrate.
        setMarqueeFast(true);
        if (marqueeTimerRef.current) window.clearTimeout(marqueeTimerRef.current);
        marqueeTimerRef.current = window.setTimeout(() => setMarqueeFast(false), 2200);
      }
      setSpinResult({ win });
      if (win > 0) setSpinFx((n) => n + 1);
      setIsSpinning(false);
    };

    // Stagger each reel's stop for an authentic slot cadence; resolve after the last reel.
    const baseDelay = 650;
    const step = 260;
    const decelLead = 150; // ms before lock that a reel drops into its soft-blur decel phase

    // Reels 0–3 lock left-to-right with a brief deceleration each.
    for (let ci = 0; ci < 4; ci++) {
      const lockAt = baseDelay + ci * step;
      window.setTimeout(() => setMotion(ci, 1), Math.max(0, lockAt - decelLead));
      window.setTimeout(() => {
        lockReel(ci);
        if (ci === 3) {
          // Anticipation: if the four locked reels already show 2+ matching PREMIUM symbols,
          // build tension on the final reel (longer spin + pulsing frame). Purely visual —
          // the outcome is still decided in resolveOutcome() and is unaffected.
          const counts: Record<string, number> = {};
          lockedPayline.forEach((s) => { if (PREMIUM_SYMBOLS.has(s)) counts[s] = (counts[s] || 0) + 1; });
          const tease = Object.values(counts).some((c) => c >= 2);
          if (tease) setAnticipation(true);
          const extra = tease ? 850 : 0;
          const reel4Lock = step + extra;
          window.setTimeout(() => setMotion(4, 1), Math.max(0, reel4Lock - decelLead));
          window.setTimeout(() => { lockReel(4); resolveOutcome(); }, reel4Lock);
        }
      }, lockAt);
    }
  }, [selectedGame, isSpinning, currentBalance, bet, activeCurrency, showNotification, playReelStop, playWinChime]);

  // ── Chat send ──
  const sendChat = useCallback((text: string) => {
    const t = text.trim();
    if (!t) return;
    setMessages((prev) => [...prev, { id: Date.now(), user: 'You', color: '#00e5ff', text: t }]);
    setChatInput('');
  }, []);

  // Parallax offsets — floor streams toward you, walls drift slower.
  const floorShift = scrollY * 0.6;
  const wallShift = scrollY * 0.12;

  return (
    <div
      ref={scrollRef}
      onScroll={(e) => setScrollY((e.target as HTMLDivElement).scrollTop)}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: '#04040a',
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
        color: '#ffffff',
      }}
    >
      <style>{`
        @keyframes neonFlicker { 0%,100%{opacity:1;} 48%{opacity:0.85;} 50%{opacity:0.6;} 52%{opacity:0.9;} }
        @keyframes floatHint { 0%,100%{transform:translateY(0);} 50%{transform:translateY(7px);} }
        @keyframes slideDown { from { transform: translateX(-50%) translateY(-20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
        @keyframes spin360 { to { transform: rotate(360deg); } }
        @keyframes winPulse { 0%,100%{ transform: scale(1);} 50%{ transform: scale(1.06);} }
        @keyframes reelBlur { 0%{ transform: translateY(-7px);} 100%{ transform: translateY(7px);} }
        @keyframes symbolSettle { 0%{ transform: translateY(-30px) scale(0.92);} 58%{ transform: translateY(7px) scale(1.06);} 78%{ transform: translateY(-3px) scale(0.99);} 100%{ transform: translateY(0) scale(1);} }
        @keyframes reelSnapLock { 0%{ box-shadow: inset 0 0 12px var(--reel-glow), inset 0 0 0 0 rgba(255,255,255,0);} 22%{ box-shadow: inset 0 0 12px var(--reel-glow), inset 0 0 0 2px rgba(255,255,255,0.6);} 100%{ box-shadow: inset 0 0 12px var(--reel-glow), inset 0 0 0 0 rgba(255,255,255,0);} }
        @keyframes symbolGlowPulse { 0%{ filter: drop-shadow(0 0 0 var(--sym-glow)); transform: scale(1);} 32%{ filter: drop-shadow(0 0 12px var(--sym-glow)) drop-shadow(0 0 4px var(--sym-glow)); transform: scale(1.22);} 100%{ filter: drop-shadow(0 0 0 var(--sym-glow)); transform: scale(1);} }
        @keyframes paylineGlow { 0%,100%{ box-shadow: inset 0 0 0 rgba(74,222,128,0);} 50%{ box-shadow: inset 0 0 20px rgba(74,222,128,0.65);} }
        @keyframes coinFall { 0%{ transform: translateY(-40px) rotate(0deg); opacity: 0;} 10%{ opacity: 1;} 100%{ transform: translateY(420px) rotate(540deg); opacity: 0;} }
        @keyframes bigWinBurst { 0%{ transform: translate(-50%,-50%) scale(0.4); opacity: 0;} 30%{ opacity: 0.9;} 100%{ transform: translate(-50%,-50%) scale(2.4); opacity: 0;} }
        @keyframes winTextPop { 0%{ transform: scale(0.3); opacity: 0;} 50%{ transform: scale(1.15);} 70%{ transform: scale(0.95);} 100%{ transform: scale(1); opacity: 1;} }
        @keyframes pbFloat1 { 0%,100%{ transform: translate(0,0) rotate(-7deg);} 50%{ transform: translate(0,-8px) rotate(-7deg);} }
        @keyframes pbFloat2 { 0%,100%{ transform: translate(0,0) rotate(9deg);} 50%{ transform: translate(0,7px) rotate(9deg);} }
        @keyframes pbFloat3 { 0%,100%{ transform: translate(0,0) rotate(0deg);} 50%{ transform: translate(-6px,-5px) rotate(0deg);} }
        @keyframes pbCenter { 0%,100%{ transform: translate(-50%,-50%) scale(1);} 50%{ transform: translate(-50%,-58%) scale(1.05);} }
        @keyframes pbSheen { 0%{ transform: translateX(-180%) skewX(-18deg);} 55%,100%{ transform: translateX(320%) skewX(-18deg);} }
        @keyframes pbSpotlight { 0%,100%{ opacity:0.55; transform: translate(-50%,-50%) scale(1);} 50%{ opacity:1; transform: translate(-50%,-50%) scale(1.08);} }
        @keyframes pbChip { 0%,100%{ box-shadow: 0 0 7px rgba(255,255,255,0.35);} 50%{ box-shadow: 0 0 16px rgba(255,255,255,0.85);} }
        @keyframes pbFoil { 0%{ background-position: 0% 50%;} 100%{ background-position: 200% 50%;} }
        @keyframes marqueeChase { 0%,100%{ opacity: 0.22; box-shadow: 0 0 2px currentColor; transform: scale(0.85);} 50%{ opacity: 1; box-shadow: 0 0 8px currentColor, 0 0 16px currentColor; transform: scale(1.05);} }
        @keyframes anticipatePulse { 0%,100%{ box-shadow: inset 0 0 12px var(--reel-glow), 0 0 0 2px rgba(255,215,74,0.55), 0 0 14px rgba(255,215,74,0.5);} 50%{ box-shadow: inset 0 0 12px var(--reel-glow), 0 0 0 3px rgba(255,0,0,0.95), 0 0 26px rgba(255,0,0,0.8);} }
        @keyframes spinBtnIdle { 0%,100%{ transform: scale(1); box-shadow: 0 6px 26px var(--btn-glow);} 50%{ transform: scale(1.035); box-shadow: 0 10px 38px var(--btn-glow), 0 0 22px var(--btn-glow);} }
        @keyframes cooldownStripe { from { background-position: 0 0; } to { background-position: 34px 0; } }
        @keyframes vinylSpin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .reel-strip { filter: none !important; }
          .marquee-bulb, .spin-btn, .reel-col { animation: none !important; }
        }
        .floor-scroll::-webkit-scrollbar { width: 0; }
        .hrow::-webkit-scrollbar { height: 8px; }
        .hrow::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 8px; }
      `}</style>

      {/* True vertical (directional) motion-blur filters for the spinning reel strips */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
        <defs>
          <filter id="reelMotionBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0 5" />
          </filter>
          <filter id="reelMotionBlurSoft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0 1.8" />
          </filter>
        </defs>
      </svg>

      {/* ══════════ FIRST-PERSON CORRIDOR BACKGROUND (fixed, parallax) ══════════ */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden', perspective: '700px', perspectiveOrigin: '50% 42%' }}>
        {/* Deep ambient gradient */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 38%, #181433 0%, #0a0818 45%, #04040a 100%)' }} />

        {/* Vanishing-point glow (the far end of the floor) */}
        <div style={{
          position: 'absolute', left: '50%', top: '40%', width: '320px', height: '220px',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(ellipse, rgba(0,150,255,0.35) 0%, rgba(255,0,80,0.12) 45%, transparent 75%)',
          filter: 'blur(10px)',
        }} />

        {/* Receding neon carpet — streams toward you as you scroll */}
        <div style={{
          position: 'absolute', left: '50%', bottom: '-5%', width: '260%', height: '70%',
          transform: 'translateX(-50%) rotateX(70deg)',
          transformOrigin: 'center bottom',
          backgroundColor: '#0c0716',
          backgroundImage: `repeating-linear-gradient(0deg, rgba(255,0,70,0.16) 0px, rgba(255,0,70,0.16) 2px, transparent 2px, transparent 46px),
            repeating-linear-gradient(90deg, rgba(0,150,255,0.13) 0px, rgba(0,150,255,0.13) 2px, transparent 2px, transparent 80px)`,
          backgroundPosition: `0px ${floorShift}px`,
          boxShadow: 'inset 0 60px 120px rgba(0,0,0,0.7)',
        }} />

        {/* Left wall with slot-machine glow panels */}
        <div style={{
          position: 'absolute', left: 0, top: 0, width: '26%', height: '100%',
          transform: `translateY(${-wallShift}px)`,
          background: 'linear-gradient(90deg, #0a0a16 0%, #120c22 70%, rgba(8,8,16,0) 100%)',
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,40,90,0.10) 0px, rgba(255,40,90,0.10) 60px, transparent 60px, transparent 140px)',
        }} />
        {/* Right wall */}
        <div style={{
          position: 'absolute', right: 0, top: 0, width: '26%', height: '100%',
          transform: `translateY(${-wallShift}px)`,
          background: 'linear-gradient(270deg, #0a0a16 0%, #0c1022 70%, rgba(8,8,16,0) 100%)',
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(40,120,255,0.10) 0px, rgba(40,120,255,0.10) 60px, transparent 60px, transparent 140px)',
        }} />

        {/* Neon ceiling strip */}
        <div style={{
          position: 'absolute', left: '20%', right: '20%', top: 0, height: '6px',
          background: 'linear-gradient(90deg, transparent, #ff0050 20%, #00b3ff 80%, transparent)',
          boxShadow: '0 0 26px rgba(0,150,255,0.6), 0 0 40px rgba(255,0,80,0.4)',
          animation: 'neonFlicker 4s infinite',
        }} />

        {/* Foreground vignette for first-person depth */}
        <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 220px 60px rgba(0,0,0,0.85)' }} />
      </div>

      {/* ══════════ TOP BAR (fixed) ══════════ */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '60px', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 14px',
        background: 'linear-gradient(180deg, rgba(6,6,14,0.97) 0%, rgba(6,6,14,0.82) 100%)',
        borderBottom: '1px solid rgba(255,0,80,0.25)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <Diamond style={{ color: '#00b3ff', width: 24, height: 24, filter: 'drop-shadow(0 0 8px #00b3ff)' }} />
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 800, letterSpacing: '0.5px', whiteSpace: 'nowrap', textShadow: '0 0 10px rgba(255,0,80,0.5)' }}>
              CASINO FLOOR
            </h1>
            <span style={{ fontSize: '9px', color: 'rgba(0,179,255,0.85)', letterSpacing: '1px', fontWeight: 600 }}>FIRST-PERSON GALLERY</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Avatar presence (preserved) */}
          <div title="You" style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #00e5ff 0%, #0066ff 100%)',
            border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', boxShadow: '0 0 12px rgba(0,179,255,0.6)',
          }}>😎</div>

          {/* Currency toggle + balance (preserved dual currency) */}
          <button
            onClick={() => setActiveCurrency(activeCurrency === 'GC' ? 'SC' : 'GC')}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 12px', minHeight: '40px',
              borderRadius: '20px', cursor: 'pointer',
              background: activeCurrency === 'GC'
                ? 'linear-gradient(135deg, rgba(255,210,74,0.22), rgba(255,210,74,0.08))'
                : 'linear-gradient(135deg, rgba(168,85,247,0.22), rgba(168,85,247,0.08))',
              border: `1px solid ${activeCurrency === 'GC' ? 'rgba(255,210,74,0.5)' : 'rgba(168,85,247,0.5)'}`,
            }}
          >
            <Coins style={{ color: activeCurrency === 'GC' ? '#ffd24a' : '#a855f7', width: 17, height: 17 }} />
            <span style={{ color: activeCurrency === 'GC' ? '#ffd24a' : '#a855f7', fontSize: '13px', fontWeight: 800, whiteSpace: 'nowrap' }}>
              {formatCoins(currentBalance)} {activeCurrency}
            </span>
          </button>

          <button
            onClick={() => setShowCashier(true)}
            title="Cashier"
            style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <CreditCard style={{ color: '#ffd24a', width: 18, height: 18 }} />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title="Sound"
            style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', border: 'none' }}
          >
            {soundEnabled ? <Volume2 style={{ color: '#fff', width: 17, height: 17 }} /> : <VolumeX style={{ color: 'rgba(255,255,255,0.5)', width: 17, height: 17 }} />}
          </button>
        </div>
      </div>

      {/* ══════════ FOREGROUND CONTENT (scrolls) ══════════ */}
      <div style={{ position: 'relative', zIndex: 10, paddingTop: '60px' }}>
        {/* ── First-person entrance hero ── */}
        <section style={{
          minHeight: '78vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '40px 20px',
        }}>
          <div style={{
            fontSize: '11px', letterSpacing: '4px', fontWeight: 700, color: '#00b3ff', textTransform: 'uppercase',
            border: '1px solid rgba(0,179,255,0.35)', borderRadius: '20px', padding: '6px 16px', marginBottom: '22px',
            background: 'rgba(0,179,255,0.06)',
          }}>
            You just walked through the doors
          </div>
          <h2 style={{
            margin: '0 0 14px', fontSize: 'clamp(30px, 7vw, 60px)', fontWeight: 900, lineHeight: 1.02,
            textShadow: '0 0 24px rgba(255,0,80,0.55), 0 0 44px rgba(0,150,255,0.35)',
          }}>
            WELCOME TO THE<br />CASINO FLOOR
          </h2>
          <p style={{ margin: '0 auto 8px', maxWidth: '560px', fontSize: '15px', lineHeight: 1.55, color: 'rgba(255,255,255,0.72)' }}>
            Look down the floor. Every game stands on its own posterboard, grouped by the top studios in the world.
            Walk forward and pick what catches your eye.
          </p>
          <p style={{ margin: '0 auto 30px', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
            {ALL_GAMES.length} games • 7 studios • played with Gold Coins for fun & Sweeps Coins for prizes
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', animation: 'floatHint 1.8s ease-in-out infinite' }}>
            <span style={{ fontSize: '12px', letterSpacing: '2px', fontWeight: 600 }}>SCROLL TO WALK THE FLOOR</span>
            <ChevronDown style={{ width: 26, height: 26, color: '#00b3ff' }} />
          </div>
        </section>

        {/* ── Platform sections of posterboards ── */}
        {PLATFORMS.map((platform) => (
          <section key={platform.key} style={{ padding: '24px 0 36px', position: 'relative' }}>
            {/* Neon marquee header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '0 18px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '2px', background: `linear-gradient(90deg, transparent, ${platform.accent})` }} />
              <div style={{ textAlign: 'center' }}>
                <h3 style={{
                  margin: 0, fontSize: 'clamp(18px, 3.4vw, 26px)', fontWeight: 900, letterSpacing: '2px',
                  color: platform.accent, textShadow: `0 0 16px ${platform.accent}88`, animation: 'neonFlicker 5s infinite',
                }}>
                  {platform.name.toUpperCase()}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '11px', letterSpacing: '1px', color: 'rgba(255,255,255,0.45)' }}>
                  {platform.tagline}
                </p>
              </div>
              <div style={{ flex: 1, height: '2px', background: `linear-gradient(270deg, transparent, ${platform.accent})` }} />
            </div>

            {/* Horizontal row of standees (scrolls sideways on desktop, wraps friendly on mobile) */}
            <div
              className="hrow"
              style={{
                display: 'flex',
                gap: '20px',
                overflowX: 'auto',
                padding: '10px 18px 18px',
                scrollSnapType: 'x proximity',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {platform.games.map((game, i) => (
                <div key={game.id} style={{ scrollSnapAlign: 'center' }}>
                  <Posterboard game={game} index={i} onPlay={openGame} />
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* ── Compliance disclaimer footer ── */}
        <footer style={{
          margin: '10px 16px 40px', padding: '20px', borderRadius: '16px',
          background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
            Social-casino style entertainment
          </p>
          <p style={{ margin: 0, fontSize: '11px', lineHeight: 1.6, color: 'rgba(255,255,255,0.45)' }}>
            All games are played with <strong style={{ color: '#ffd24a' }}>Gold Coins (GC)</strong> for fun (no cash value)
            and <strong style={{ color: '#a855f7' }}>Sweeps Coins (SC)</strong> which are redeemable for prizes per Official Rules.
            21+ only. No purchase necessary — free entry available. Void where prohibited.
            Game titles shown are themed social-casino representations of popular slot mechanics.
          </p>
        </footer>
      </div>

      {/* ══════════ GAME LAUNCH MODAL (slot) ══════════ */}
      {selectedGame && (
        <div
          onClick={closeGame}
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '460px', maxHeight: '92vh', overflowY: 'auto',
              borderRadius: '22px', padding: '22px',
              background: 'linear-gradient(180deg, #16161f 0%, #0a0a12 100%)',
              border: `2px solid ${selectedGame.accent}`,
              boxShadow: `0 0 60px ${selectedGame.glow}`,
              position: 'relative',
            }}
          >
            <button
              onClick={closeGame}
              style={{ position: 'absolute', top: '14px', right: '14px', width: '38px', height: '38px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X style={{ color: '#fff', width: 20, height: 20 }} />
            </button>

            {/* ── WIN CELEBRATION OVERLAY (coin shower + light burst) ── */}
            {spinResult && spinResult.win > 0 && (() => {
              const mult = bet > 0 ? spinResult.win / bet : 1;
              const big = mult >= 5;
              const coinCount = big ? 26 : 12;
              return (
                <div key={`fx-${spinResult.win}-${spinFx}`} style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none', overflow: 'hidden', borderRadius: '22px' }}>
                  {big && (
                    <div style={{
                      position: 'absolute', left: '50%', top: '42%', width: '220px', height: '220px',
                      transform: 'translate(-50%,-50%)',
                      background: 'radial-gradient(circle, rgba(255,232,140,0.55) 0%, rgba(74,222,128,0.18) 45%, transparent 70%)',
                      animation: 'bigWinBurst 0.9s ease-out',
                    }} />
                  )}
                  {Array.from({ length: coinCount }).map((_, i) => {
                    const left = (i * 97) % 100;
                    const delay = (i % 8) * 0.09;
                    const dur = 1.1 + (i % 5) * 0.18;
                    const isGc = activeCurrency === 'GC';
                    return (
                      <span key={i} style={{
                        position: 'absolute', top: '-30px', left: `${left}%`, fontSize: big ? '22px' : '17px',
                        animation: `coinFall ${dur}s ease-in ${delay}s 1 both`,
                        filter: `drop-shadow(0 0 6px ${isGc ? 'rgba(255,210,74,0.8)' : 'rgba(168,85,247,0.8)'})`,
                      }}>{isGc ? '🪙' : '💎'}</span>
                    );
                  })}
                </div>
              );
            })()}

            <span style={{ display: 'inline-block', fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#0a0a0f', background: selectedGame.accent, padding: '3px 10px', borderRadius: '20px' }}>
              {selectedGame.provider}
            </span>
            <h2 style={{ margin: '12px 0 6px', fontSize: '24px', fontWeight: 900, color: selectedGame.accent, textShadow: `0 0 18px ${selectedGame.glow}` }}>
              {selectedGame.name}
            </h2>
            <p style={{ margin: '0 0 18px', fontSize: '12.5px', lineHeight: 1.5, color: 'rgba(255,255,255,0.6)' }}>
              {selectedGame.description}
            </p>

            {/* ── Slot CABINET: gold beveled frame + chasing marquee bulbs + inset reel window ── */}
            <div style={{
              position: 'relative', borderRadius: '18px', padding: '10px', marginBottom: '18px',
              background: 'linear-gradient(145deg, #f7e589 0%, #d4af37 16%, #9c7c24 42%, #5e4a14 68%, #c9a73d 100%)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.65), inset 0 -3px 6px rgba(0,0,0,0.55)',
            }}>
              {/* Chasing marquee bulbs along the top of the machine */}
              {(() => {
                const marqueeDur = marqueeFast ? 0.5 : idleAttract ? 1.9 : 1.05; // win → fast, idle → slow attract chase
                return (
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '5px 9px', marginBottom: '9px', borderRadius: '9px',
                    background: 'rgba(0,0,0,0.55)', boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.8)',
                  }}>
                    {Array.from({ length: MARQUEE_COUNT }).map((_, i) => (
                      <span key={i} className="marquee-bulb" style={{
                        width: '7px', height: '7px', borderRadius: '50%', flex: '0 0 auto',
                        color: i % 2 === 0 ? selectedGame.accent : '#ff0000',
                        background: 'currentColor',
                        opacity: reducedMotion ? 0.7 : undefined,
                        animation: reducedMotion ? 'none' : `marqueeChase ${marqueeDur}s linear ${-(i * marqueeDur / MARQUEE_COUNT)}s infinite`,
                      }} />
                    ))}
                  </div>
                );
              })()}

              {/* Inset reel window with a soft inner shadow */}
              <div style={{
                borderRadius: '12px', padding: '10px', background: '#06060c',
                boxShadow: 'inset 0 5px 16px rgba(0,0,0,0.95), inset 0 0 0 1px rgba(0,0,0,0.85)',
              }}>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  {reels.map((col, ci) => {
                    const colSpinning = spinningCols[ci];
                    const won = !!spinResult && spinResult.win > 0;
                    // Premium symbols flare with a brief glow as they snap into place.
                    const symGlow: Record<string, string> = {
                      '7️⃣': 'rgba(255,77,109,0.95)', '💎': 'rgba(96,205,255,0.95)', '💰': 'rgba(255,215,74,0.95)',
                      '⭐': 'rgba(255,224,102,0.95)', '🔔': 'rgba(255,193,84,0.95)',
                    };
                    // Each reel decelerates a touch longer than the last for a weighted, mechanical stop.
                    const settleDur = (0.4 + ci * 0.05).toFixed(2);
                    // Vertical motion blur scales with spin speed: 2 = fast band, 1 = decelerating, 0 = crisp.
                    const motionVal = reducedMotion ? 0 : reelMotion[ci];
                    const motionFilter = motionVal === 2 ? 'url(#reelMotionBlur)' : motionVal === 1 ? 'url(#reelMotionBlurSoft)' : 'none';
                    const isAnticipating = !reducedMotion && colSpinning && ci === 4 && anticipation;
                    let colAnim = colSpinning ? 'none' : (reducedMotion ? 'none' : 'reelSnapLock 0.34s ease-out');
                    if (isAnticipating) colAnim = 'anticipatePulse 0.55s ease-in-out infinite';
                    return (
                    <div key={ci} className="reel-col" style={{
                      flex: 1, background: '#06060c', borderRadius: '10px',
                      border: `1px solid ${isAnticipating ? '#ffd24a' : `${selectedGame.accent}40`}`,
                      padding: '6px',
                      ['--reel-glow' as any]: selectedGame.glow,
                      boxShadow: `inset 0 0 12px ${selectedGame.glow}`,
                      animation: colAnim,
                      overflow: 'hidden',
                    }}>
                      <div className="reel-strip" style={{
                        display: 'flex', flexDirection: 'column', gap: '4px',
                        filter: motionFilter,
                        transition: 'filter 0.16s ease-out',
                      }}>
                        {col.map((sym, ri) => {
                          const isPayline = ri === 1;
                          const glow = symGlow[sym];
                          const landAnim = isPayline && won
                            ? 'paylineGlow 0.7s ease-in-out 2'
                            : glow
                              ? `symbolSettle ${settleDur}s cubic-bezier(0.16,0.84,0.3,1.04), symbolGlowPulse 0.6s ease-out 0.06s`
                              : `symbolSettle ${settleDur}s cubic-bezier(0.16,0.84,0.3,1.04)`;
                          const cellAnim = reducedMotion
                            ? 'none'
                            : (colSpinning ? 'reelBlur 0.14s linear infinite alternate' : landAnim);
                          return (
                          <div key={ri} style={{
                            height: '46px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '26px', background: isPayline ? `${selectedGame.accent}22` : 'rgba(255,255,255,0.04)',
                            transition: 'background 0.2s',
                            ['--sym-glow' as any]: glow || 'rgba(255,255,255,0)',
                            animation: cellAnim,
                          }}>
                            <span style={{ display: 'inline-block' }}>{sym}</span>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Win banner */}
            {spinResult && (
              <div style={{
                marginBottom: '14px', padding: '12px', borderRadius: '12px', textAlign: 'center',
                background: spinResult.win > 0 ? 'linear-gradient(135deg, rgba(34,197,94,0.25), rgba(22,163,74,0.1))' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${spinResult.win > 0 ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.12)'}`,
                animation: spinResult.win > 0 ? 'winPulse 0.8s ease-in-out' : 'none',
              }}>
                {spinResult.win > 0 ? (
                  <span style={{ color: '#4ade80', fontSize: bet > 0 && spinResult.win / bet >= 5 ? '19px' : '16px', fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', animation: 'winTextPop 0.55s cubic-bezier(0.18,0.89,0.32,1.28)' }}>
                    <Trophy style={{ width: 18, height: 18 }} /> {bet > 0 && spinResult.win / bet >= 25 ? 'MEGA WIN' : bet > 0 && spinResult.win / bet >= 5 ? 'BIG WIN' : 'WIN'} {formatCoins(spinResult.win)} {activeCurrency}!
                  </span>
                ) : (
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 600 }}>No win — spin again!</span>
                )}
              </div>
            )}

            {/* Balance + bet */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.35)', borderRadius: '12px', marginBottom: '12px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>BALANCE</p>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: activeCurrency === 'GC' ? '#ffd24a' : '#a855f7' }}>
                  {formatCoins(currentBalance)} {activeCurrency}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => setBet((b) => Math.max(activeCurrency === 'GC' ? 10 : 1, b - (activeCurrency === 'GC' ? 50 : 1)))}
                  style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>−</button>
                <div style={{ textAlign: 'center', minWidth: '64px' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>BET</p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff' }}>{formatCoins(bet)}</p>
                </div>
                <button onClick={() => setBet((b) => b + (activeCurrency === 'GC' ? 50 : 1))}
                  style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>+</button>
              </div>
            </div>

            {/* Spin — tactile pressed state, idle attract pulse, and a cooldown stripe while reels move */}
            <button
              className="spin-btn"
              onClick={spin}
              disabled={isSpinning}
              onPointerDown={() => !isSpinning && setBtnPressed(true)}
              onPointerUp={() => setBtnPressed(false)}
              onPointerLeave={() => setBtnPressed(false)}
              style={{
                width: '100%', minHeight: '54px', padding: '16px', borderRadius: '14px', border: 'none',
                cursor: isSpinning ? 'not-allowed' : 'pointer',
                fontSize: '18px', fontWeight: 900, letterSpacing: '2px', color: '#0a0a0f',
                ['--btn-glow' as any]: selectedGame.glow,
                background: isSpinning
                  ? 'repeating-linear-gradient(45deg, rgba(125,125,125,0.55) 0 12px, rgba(92,92,92,0.55) 12px 24px)'
                  : `linear-gradient(135deg, ${selectedGame.accent} 0%, #ffffff 240%)`,
                backgroundSize: isSpinning ? '34px 34px' : undefined,
                opacity: isSpinning ? 0.82 : 1,
                transform: btnPressed && !isSpinning ? 'translateY(2px) scale(0.985)' : 'translateY(0) scale(1)',
                boxShadow: isSpinning
                  ? 'inset 0 2px 8px rgba(0,0,0,0.5)'
                  : btnPressed
                    ? `0 2px 10px ${selectedGame.glow}, 0 0 26px ${selectedGame.glow}, inset 0 2px 6px rgba(0,0,0,0.35)`
                    : `0 6px 26px ${selectedGame.glow}`,
                transition: 'transform 0.08s ease-out, box-shadow 0.15s ease-out',
                animation: (!reducedMotion && isSpinning)
                  ? 'cooldownStripe 0.7s linear infinite'
                  : (!reducedMotion && idleAttract && !isSpinning)
                    ? 'spinBtnIdle 1.6s ease-in-out infinite'
                    : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              }}
            >
              {isSpinning ? (
                <>
                  <div style={{ width: '22px', height: '22px', border: '3px solid rgba(0,0,0,0.3)', borderTopColor: '#0a0a0f', borderRadius: '50%', animation: 'spin360 0.8s linear infinite' }} />
                  SPINNING…
                </>
              ) : (
                <>
                  <Play style={{ width: 22, height: 22, fill: '#0a0a0f' }} /> SPIN
                </>
              )}
            </button>

            <p style={{ marginTop: '14px', fontSize: '9.5px', textAlign: 'center', lineHeight: 1.5, color: 'rgba(255,255,255,0.4)' }}>
              For entertainment only. Gold Coins have no cash value. Sweeps Coins redeemable for prizes per Official Rules. No purchase necessary. 21+.
            </p>
          </div>
        </div>
      )}

      {/* ══════════ CASHIER MODAL ══════════ */}
      {showCashier && (
        <div onClick={() => setShowCashier(false)} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', borderRadius: '20px', overflow: 'hidden', background: 'linear-gradient(180deg, #20202e, #14141f)', border: '2px solid #ffd24a', boxShadow: '0 0 60px rgba(255,210,74,0.3)' }}>
            <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,210,74,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard style={{ color: '#ffd24a', width: 24, height: 24 }} />
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#ffd24a' }}>Cashier Cage</h2>
              </div>
              <button onClick={() => setShowCashier(false)} style={{ width: '34px', height: '34px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ color: '#fff', width: 18, height: 18 }} />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div style={{ padding: '16px', borderRadius: '14px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(255,210,74,0.2), rgba(255,210,74,0.05))', border: '1px solid rgba(255,210,74,0.3)' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '10px', letterSpacing: '1px', color: 'rgba(255,210,74,0.7)' }}>GOLD COINS</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#ffd24a' }}>{formatCoins(goldCoins)}</p>
                </div>
                <div style={{ padding: '16px', borderRadius: '14px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.05))', border: '1px solid rgba(168,85,247,0.3)' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '10px', letterSpacing: '1px', color: 'rgba(168,85,247,0.7)' }}>SWEEPS COINS</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#a855f7' }}>{formatCoins(sweepsCoins)}</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => { setShowCashier(false); showNotification('🪙 Visit Dollar Day for Gold Coin packages!'); }}
                  style={{ width: '100%', minHeight: '48px', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 800, color: '#0a0a0f', background: 'linear-gradient(135deg, #ffd24a, #e0a82a)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Coins style={{ width: 18, height: 18 }} /> Buy Gold Coins
                </button>
                <button onClick={() => { setShowCashier(false); showNotification('💜 Redeem Sweeps Coins for prizes in Dollar Day!'); }}
                  style={{ width: '100%', minHeight: '48px', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #a855f7, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Star style={{ width: 18, height: 18 }} /> Redeem Sweeps Coins
                </button>
              </div>
              <p style={{ marginTop: '16px', fontSize: '10px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                No purchase necessary. Free entry available. 21+ only.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ LIVE CHAT (preserved social system) ══════════ */}
      <button
        onClick={() => setChatOpen((o) => !o)}
        style={{
          position: 'fixed', bottom: '18px', right: '18px', zIndex: 200,
          width: '56px', height: '56px', borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #ff0050, #00b3ff)',
          display: chatOpen ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 24px rgba(0,150,255,0.5)',
        }}
        title="Live chat"
      >
        <MessageCircle style={{ color: '#fff', width: 26, height: 26 }} />
      </button>

      {chatOpen && (
        <div style={{
          position: 'fixed', bottom: '18px', right: '18px', zIndex: 210,
          width: 'min(330px, calc(100vw - 36px))', height: '420px', maxHeight: 'calc(100vh - 90px)',
          display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden',
          background: 'rgba(10,10,18,0.97)', border: '1px solid rgba(0,179,255,0.35)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
        }}>
          <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'linear-gradient(90deg, rgba(255,0,80,0.18), rgba(0,179,255,0.18))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
              <span style={{ fontSize: '13px', fontWeight: 800 }}>Floor Chat</span>
            </div>
            <button onClick={() => setChatOpen(false)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X style={{ color: '#fff', width: 15, height: 15 }} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((m) => (
              <div key={m.id} style={{ fontSize: '13px', lineHeight: 1.4 }}>
                <span style={{ fontWeight: 800, color: m.color }}>{m.user}: </span>
                <span style={{ color: 'rgba(255,255,255,0.85)' }}>{m.text}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', padding: '8px 10px 0' }}>
            {QUICK_CHATS.map((q) => (
              <button key={q} onClick={() => sendChat(q)} style={{ fontSize: '10px', padding: '5px 9px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
                {q}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); sendChat(chatInput); }} style={{ display: 'flex', gap: '8px', padding: '10px' }}>
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Say something…"
              style={{ flex: 1, minWidth: 0, padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '13px', outline: 'none' }}
            />
            <button type="submit" style={{ width: '42px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #ff0050, #00b3ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send style={{ color: '#fff', width: 17, height: 17 }} />
            </button>
          </form>
        </div>
      )}

      {/* ══════════ NOTIFICATION TOAST ══════════ */}
      {notification && (
        <div style={{
          position: 'fixed', top: '74px', left: '50%', transform: 'translateX(-50%)', zIndex: 400,
          padding: '14px 26px', borderRadius: '14px', fontSize: '14px', fontWeight: 600, color: '#fff',
          background: 'linear-gradient(135deg, rgba(0,179,255,0.95), rgba(255,0,80,0.92))',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)', animation: 'slideDown 0.3s ease', maxWidth: 'calc(100vw - 32px)', textAlign: 'center',
        }}>
          {notification}
        </div>
      )}

      {/* ══════════ UNIVERSAL JUKEBOX (docked, carries across venues) ══════════ */}
      <CasinoJukebox reducedMotion={reducedMotion} />
    </div>
  );
}
