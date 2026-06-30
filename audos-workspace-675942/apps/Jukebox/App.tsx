// DAM Fortunes - THE BAR: Social Lounge Experience
// A complete biker bar with Jukebox, Chat Room, Pinball, Plinko, and Darts
// Blueprint casino aesthetic with neon gold (#fbbf24) and cyan (#22d3d2) accents
// Music persists across room navigation via WorkspaceDB (migrated from localStorage)
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'https://esm.sh/react@18';

// =============================================================================
// GLOBAL AUDIO PERSISTENCE - Stores playback state for cross-room navigation
// Uses WorkspaceDB instead of localStorage for cross-device sync
// =============================================================================

interface PersistedAudioState {
  currentSongId: number | null;
  queue: number[]; // Just IDs for efficiency
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  timestamp: number;
}

// These functions are now no-ops - audio state is persisted via WorkspaceDB in the main component
// They are kept for type compatibility but the actual persistence happens in useEffect hooks
const persistAudioState = (_state: PersistedAudioState) => {
  // No-op: Handled by WorkspaceDB in the main component
};

const loadPersistedAudioState = (): PersistedAudioState | null => {
  // No-op: Handled by WorkspaceDB in the main component
  return null;
};

const clearPersistedAudioState = () => {
  // No-op: Handled by WorkspaceDB in the main component
};

// =============================================================================
// TYPES
// =============================================================================

interface Song {
  id: number;
  title: string;
  artist: string;
  genre: string;
  youtube_id: string | null;
  audio_url: string | null; // Direct audio URL for HTML5 playback
  album_art: string | null;
  duration_seconds: number | null;
  votes: number;
  is_playing: boolean;
  play_order: number | null;
  is_premium?: boolean;
}

interface BarPatron {
  id: number;
  username: string;
  avatar_emoji: string;
  status: 'at_bar' | 'playing_darts' | 'away';
  seat_position: number | null;
  session_id: string;
  last_seen: string;
}

interface ChatMessage {
  id: number;
  username: string;
  message: string;
  avatar_emoji: string;
  message_type: 'chat' | 'system' | 'darts_notification';
  created_at: string;
}

interface DartsGame {
  id: number;
  player1_id: string;
  player1_name: string;
  player2_id: string | null;
  player2_name: string;
  bet_amount: number;
  player1_score: number;
  player2_score: number;
  current_turn: 'player1' | 'player2';
  status: 'waiting' | 'active' | 'finished';
  winner_id: string | null;
  winner_payout: number | null;
}

interface DartThrow {
  segment: number;
  multiplier: number;
  points: number;
  x: number;
  y: number;
}

interface PinballState {
  score: number;
  balls: number;
  ballPosition: { x: number; y: number };
  ballVelocity: { x: number; y: number };
  isPlaying: boolean;
  leftFlipperUp: boolean;
  rightFlipperUp: boolean;
  bumperHits: number[];
  multiplier: number;
}

interface PlinkoBall {
  id: number;
  x: number;
  y: number;
  settled: boolean;
  slot: number | null;
}

interface SubscriptionStatus {
  status: 'active' | 'trial' | 'trialing' | 'canceled' | 'past_due' | 'trial_expired' | 'not_registered' | 'loading';
  trialDaysRemaining?: number;
  planTier?: string;
}

interface PaymentConfig {
  enabled: boolean;
  mode: 'platform' | 'connect';
  stripeAccountId?: string | null;
}

type BarTab = 'jukebox' | 'hangout' | 'pinball' | 'plinko' | 'darts';

// =============================================================================
// CONSTANTS
// =============================================================================

const BET_AMOUNTS = [50, 100, 200, 500, 1000, 2000];
const HOUSE_CUT = 0.10;
const PREMIUM_PRICE_CENTS = 500;

const BAR_AVATARS = ['🤠', '🎸', '🍺', '🎯', '🎱', '🏍️', '🔥', '💀', '🐍', '🦅', '🐺', '⚡'];

// Casino Blueprint Aesthetic Colors
const CASINO_COLORS = {
  neonGold: '#fbbf24',
  neonCyan: '#22d3d2',
  darkBg: '#0a0a0f',
  blueprintLine: 'rgba(34, 211, 210, 0.15)',
  glowGold: '0 0 20px #fbbf24, 0 0 40px #fbbf2480',
  glowCyan: '0 0 20px #22d3d2, 0 0 40px #22d3d280',
};

const genreConfig: Record<string, { icon: string; color: string; label: string }> = {
  rap: { icon: '🔥', color: '#d4af37', label: 'RAP' }, // Gold color for urban/hip-hop aesthetic
  country: { icon: '🤠', color: '#d97706', label: 'COUNTRY' },
  rock: { icon: '🎸', color: '#dc2626', label: 'ROCK' },
  blues: { icon: '🎷', color: '#2563eb', label: 'BLUES' },
  classic_hits: { icon: '⭐', color: '#7c3aed', label: 'CLASSICS' },
};

const BARTENDER_QUOTES = [
  "What'll it be, partner?",
  "Another round coming up!",
  "You look like you could use a cold one.",
  "Best jukebox this side of the Mississippi.",
  "Watch out for that dart board - it bites back!",
  "Winner buys the next round!",
  "Keep the tips coming and the music flowing.",
  "This ain't no fancy cocktail bar, friend."
];

const PLINKO_MULTIPLIERS = [0.2, 0.5, 1, 2, 5, 10, 5, 2, 1, 0.5, 0.2];
const PLINKO_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#22c55e', '#eab308', '#f97316', '#ef4444'];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const formatDuration = (seconds: number | null): string => {
  if (!seconds) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getRandomAvatar = () => BAR_AVATARS[Math.floor(Math.random() * BAR_AVATARS.length)];
const getRandomQuote = () => BARTENDER_QUOTES[Math.floor(Math.random() * BARTENDER_QUOTES.length)];

const formatTime = (date: string) => {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// =============================================================================
// STRIPE PAYMENTS HELPER
// Uses WorkspaceDB for payment config instead of space-data files
// =============================================================================

const stripePayments = {
  config: null as PaymentConfig | null,

  async loadConfig(): Promise<PaymentConfig | null> {
    if (this.config) return this.config;
    try {
      // Use WorkspaceDB to load payment config instead of space-data files
      const db = (window as any).__workspaceDb;
      if (db) {
        const result = await db.from('bar_payment_config', { shared: true }).get();
        if (result && result.length > 0) {
          const configRow = result.find((r: any) => r.config_key === 'jukebox') || result[0];
          this.config = {
            enabled: configRow.enabled || false,
            mode: configRow.mode || 'platform',
            stripeAccountId: configRow.stripe_account_id || null
          };
        }
      }
    } catch (e) {
      console.warn('Payment config not found in database');
    }
    return this.config;
  },

  async isEnabled(): Promise<boolean> {
    const config = await this.loadConfig();
    return config?.enabled === true;
  },

  async createSubscription(options: {
    priceCents?: number;
    trialDays?: number;
    customerEmail?: string;
    successUrl?: string;
    cancelUrl?: string;
    metadata?: Record<string, string>;
  } = {}) {
    const response = await fetch('/api/payments/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Id': (window as any).__APP_ID__ || (window as any).__SPACE_ID__
      },
      body: JSON.stringify({
        priceCents: options.priceCents || PREMIUM_PRICE_CENTS,
        trialDays: options.trialDays ?? 7,
        successUrl: options.successUrl || window.location.origin + window.location.pathname,
        cancelUrl: options.cancelUrl || window.location.href,
        customerEmail: options.customerEmail,
        metadata: {
          ...options.metadata,
          planTier: 'premium-jukebox',
          appId: 'jukebox',
        }
      })
    });
    return response.json();
  },

  redirectToCheckout(checkoutUrl: string) {
    window.location.href = checkoutUrl;
  }
};

// =============================================================================
// NEON SIGN COMPONENT
// =============================================================================

const NeonSign: React.FC<{ text: string; color: string; size?: 'sm' | 'md' | 'lg'; flicker?: boolean }> = ({
  text, color, size = 'md', flicker = true
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-xl px-4 py-2'
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded font-black tracking-wider uppercase`}
      style={{
        color: color,
        textShadow: `0 0 5px ${color}, 0 0 10px ${color}, 0 0 20px ${color}, 0 0 40px ${color}`,
        animation: flicker ? 'neon-flicker 4s ease-in-out infinite' : 'none',
      }}
    >
      {text}
    </div>
  );
};

// =============================================================================
// GLOWING HEADER COMPONENT
// =============================================================================

const GlowingHeader: React.FC<{ text: string; color: string; icon?: string }> = ({ text, color, icon }) => (
  <div className="flex items-center gap-2 mb-3">
    {icon && <span className="text-2xl">{icon}</span>}
    <h2
      className="text-xl font-black uppercase tracking-wide"
      style={{
        color: color,
        textShadow: `0 0 10px ${color}80, 0 0 20px ${color}40`,
      }}
    >
      {text}
    </h2>
  </div>
);

// =============================================================================
// BAR HEADER
// =============================================================================

const BarHeader: React.FC<{
  activeTab: BarTab;
  onTabChange: (tab: BarTab) => void;
  nowPlaying: Song | null;
  subscriptionStatus: SubscriptionStatus;
  onSubscriptionClick: () => void;
}> = ({ activeTab, onTabChange, nowPlaying, subscriptionStatus, onSubscriptionClick }) => {
  const isPremium = ['active', 'trial', 'trialing'].includes(subscriptionStatus.status);

  return (
    <div className="bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 border-b-2 border-amber-700/50">
      {/* Neon Signs Row */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-amber-900/30">
        <div className="flex items-center gap-2">
          <NeonSign text="OPEN" color="#22c55e" size="sm" />
          <NeonSign text="COLD BEER" color="#3b82f6" size="sm" />
        </div>
        <div className="text-center">
          <h1
            className="text-2xl font-black text-amber-400 tracking-wider"
            style={{
              textShadow: '0 0 10px #f59e0b, 0 0 20px #f59e0b, 0 0 30px #f59e0b40',
            }}
          >
            THE BAR
          </h1>
          <p className="text-amber-600/60 text-[10px] tracking-widest">DAM FORTUNES ROADHOUSE</p>
        </div>
        <button
          onClick={onSubscriptionClick}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold transition-all ${
            isPremium
              ? 'bg-gradient-to-r from-amber-600/30 to-amber-500/20 border border-amber-500/50 text-amber-300'
              : 'bg-stone-800 border border-stone-700 text-gray-400 hover:border-amber-600'
          }`}
        >
          {isPremium ? '⭐ VIP' : '🎵 Free'}
        </button>
      </div>

      {/* Now Playing Strip */}
      {nowPlaying && (
        <div className="flex items-center gap-3 px-3 py-1.5 bg-black/40">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
              <div
                key={i}
                className="w-0.5 bg-amber-400 rounded-t"
                style={{
                  height: `${6 + Math.random() * 8}px`,
                  animation: `equalizer ${0.2 + i * 0.08}s ease-in-out infinite alternate`,
                }}
              />
            ))}
          </div>
          <span className="text-amber-500 text-[10px] font-bold tracking-wider">NOW PLAYING</span>
          <span className="text-white text-xs truncate flex-1">{nowPlaying.title} — {nowPlaying.artist}</span>
        </div>
      )}

      {/* Tab Navigation - Jukebox is the star */}
      <div className="flex overflow-x-auto scrollbar-hide">
        {[
          { id: 'jukebox' as BarTab, icon: '🎵', label: 'Jukebox', featured: true },
          { id: 'hangout' as BarTab, icon: '💬', label: 'Chat', featured: false },
          { id: 'pinball' as BarTab, icon: '🕹️', label: 'Pinball', featured: false },
          { id: 'plinko' as BarTab, icon: '⚪', label: 'Plinko', featured: false },
          { id: 'darts' as BarTab, icon: '🎯', label: 'Darts', featured: false },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 min-w-0 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap relative ${
              activeTab === tab.id
                ? tab.featured
                  ? 'bg-gradient-to-b from-amber-800/40 to-amber-900/30 text-amber-200 border-amber-400'
                  : 'bg-amber-900/30 text-amber-300 border-amber-500'
                : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-amber-900/10'
            }`}
            style={activeTab === tab.id && tab.featured ? {
              boxShadow: 'inset 0 -4px 15px rgba(245,158,11,0.2)',
            } : {}}
          >
            <span className={`mr-1 ${tab.featured ? 'text-base' : ''}`}>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.featured && activeTab !== tab.id && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// JUKEBOX COMPONENTS
// =============================================================================

const SongCard: React.FC<{
  song: Song;
  onVote: (id: number) => void;
  onPlay: (song: Song) => void;
  hasVoted: boolean;
  isPremium: boolean;
  canRequest: boolean;
  isCurrentlyPlaying?: boolean;
  isInQueue?: boolean;
  queuePosition?: number;
}> = ({ song, onVote, onPlay, hasVoted, isPremium, canRequest, isCurrentlyPlaying, isInQueue, queuePosition }) => {
  const genre = genreConfig[song.genre] || { icon: '🎵', color: '#666', label: song.genre };
  const isPremiumSong = song.is_premium;
  const isLocked = isPremiumSong && !isPremium;

  return (
    <div className={`bg-gradient-to-br from-stone-900/80 to-stone-800/80 rounded-lg p-2.5 border transition-all ${
      isCurrentlyPlaying ? 'border-amber-500 shadow-lg shadow-amber-500/20' :
      isInQueue ? 'border-cyan-500/50 shadow-md shadow-cyan-500/10' :
      isLocked ? 'border-stone-700/50 opacity-60' : 'border-stone-700/50 hover:border-amber-700/50'
    }`}>
      <div className="flex gap-2.5">
        <div className="relative w-12 h-12 rounded bg-stone-700 flex-shrink-0 overflow-hidden">
          {song.album_art ? (
            <img src={song.album_art} alt={song.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl bg-gradient-to-br from-stone-700 to-stone-800">🎵</div>
          )}
          {isCurrentlyPlaying && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4].map(i => (
                  <div
                    key={i}
                    className="w-0.5 bg-amber-400 rounded-t"
                    style={{
                      height: `${4 + Math.random() * 6}px`,
                      animation: `equalizer ${0.2 + i * 0.08}s ease-in-out infinite alternate`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          {isInQueue && !isCurrentlyPlaying && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-cyan-400 text-xs font-bold">#{queuePosition}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-white font-semibold text-sm truncate">{song.title}</h4>
            {isCurrentlyPlaying && (
              <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded font-bold animate-pulse">PLAYING</span>
            )}
            {isInQueue && !isCurrentlyPlaying && (
              <span className="text-[9px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded font-bold">QUEUED</span>
            )}
          </div>
          <p className="text-gray-400 text-xs truncate">{song.artist}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: genre.color + '20', color: genre.color }}>
              {genre.icon} {genre.label}
            </span>
            {song.duration_seconds && (
              <span className="text-gray-500 text-[10px]">{formatDuration(song.duration_seconds)}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <button
            onClick={() => onVote(song.id)}
            disabled={hasVoted || isLocked}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
              hasVoted ? 'bg-amber-600 text-white' : 'bg-stone-700 text-gray-300 hover:bg-amber-600/80 hover:text-white'
            } disabled:opacity-50`}
          >
            👍 {song.votes}
          </button>
          <button
            onClick={() => onPlay(song)}
            disabled={isLocked || !canRequest || isCurrentlyPlaying}
            className={`px-2 py-1 rounded text-xs font-medium transition-all disabled:opacity-50 ${
              isCurrentlyPlaying
                ? 'bg-amber-600/50 text-amber-200 cursor-not-allowed'
                : isInQueue
                  ? 'bg-cyan-700/60 text-cyan-200'
                  : 'bg-green-700/80 text-white hover:bg-green-600'
            }`}
          >
            {isCurrentlyPlaying ? '🎵' : isInQueue ? `+Q` : '▶'}
          </button>
        </div>
      </div>
    </div>
  );
};

const JukeboxTab: React.FC<{
  songs: Song[];
  onVote: (id: number) => void;
  onPlay: (song: Song) => void;
  userVotes: Set<number>;
  isPremium: boolean;
  requestsRemaining: number;
  onSearch: (query: string) => void;
  currentlyPlayingSongId?: number | null;
  queuedSongIds?: number[];
}> = ({ songs, onVote, onPlay, userVotes, isPremium, requestsRemaining, onSearch, currentlyPlayingSongId, queuedSongIds = [] }) => {
  const [activeGenre, setActiveGenre] = useState<string | null>('rap');
  const [searchQuery, setSearchQuery] = useState('');
  const [equalizerBars] = useState(() => Array.from({ length: 16 }, () => Math.random()));

  const filteredSongs = useMemo(() => {
    let result = songs;
    if (activeGenre) result = result.filter(s => s.genre === activeGenre);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => b.votes - a.votes);
  }, [songs, activeGenre, searchQuery]);

  const canRequest = isPremium || requestsRemaining > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Prominent Jukebox Header - THE CENTERPIECE - Blueprint Casino Style */}
      <div
        className="relative p-4 overflow-hidden"
        style={{
          background: `linear-gradient(180deg, rgba(251,191,36,0.15) 0%, ${CASINO_COLORS.darkBg}f0 50%, ${CASINO_COLORS.darkBg} 100%)`,
        }}
      >
        {/* Blueprint Grid Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(${CASINO_COLORS.blueprintLine} 1px, transparent 1px),
              linear-gradient(90deg, ${CASINO_COLORS.blueprintLine} 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
            opacity: 0.5,
          }}
        />

        {/* Ambient glow effects - Neon Gold & Cyan */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full"
            style={{
              background: `radial-gradient(ellipse, ${CASINO_COLORS.neonGold}40 0%, transparent 70%)`,
              filter: 'blur(20px)',
            }}
          />
          <div
            className="absolute top-1/2 left-0 w-24 h-full opacity-40"
            style={{ background: `linear-gradient(90deg, ${CASINO_COLORS.neonCyan} 0%, transparent 100%)` }}
          />
          <div
            className="absolute top-1/2 right-0 w-24 h-full opacity-40"
            style={{ background: `linear-gradient(-90deg, ${CASINO_COLORS.neonCyan} 0%, transparent 100%)` }}
          />
        </div>

        {/* Neon Jukebox Sign - Blueprint Style */}
        <div className="relative text-center mb-4">
          <div className="inline-block relative">
            {/* Outer glow ring */}
            <div
              className="absolute -inset-4 rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${CASINO_COLORS.neonGold}60 0%, ${CASINO_COLORS.neonCyan}40 100%)`,
                filter: 'blur(25px)',
                animation: 'pulse 3s ease-in-out infinite',
              }}
            />

            {/* Main sign with blueprint border */}
            <div
              className="relative px-10 py-4 rounded-xl"
              style={{
                background: `linear-gradient(180deg, ${CASINO_COLORS.darkBg} 0%, #0d0d15 100%)`,
                border: `3px solid ${CASINO_COLORS.neonGold}`,
                boxShadow: `
                  0 0 30px ${CASINO_COLORS.neonGold}60,
                  inset 0 0 40px ${CASINO_COLORS.neonGold}10,
                  0 0 60px ${CASINO_COLORS.neonCyan}20
                `,
              }}
            >
              {/* Inner blueprint lines */}
              <div
                className="absolute inset-2 rounded-lg pointer-events-none opacity-30"
                style={{
                  border: `1px solid ${CASINO_COLORS.neonCyan}`,
                }}
              />

              {/* Neon text */}
              <div className="flex items-center justify-center gap-4">
                <span className="text-4xl animate-glow-pulse" style={{ filter: `drop-shadow(0 0 15px ${CASINO_COLORS.neonGold})` }}>🎵</span>
                <h1
                  className="text-3xl md:text-5xl font-black tracking-widest"
                  style={{
                    color: CASINO_COLORS.neonGold,
                    textShadow: `
                      0 0 10px ${CASINO_COLORS.neonGold},
                      0 0 20px ${CASINO_COLORS.neonGold},
                      0 0 40px ${CASINO_COLORS.neonGold},
                      0 0 80px ${CASINO_COLORS.neonGold}60
                    `,
                    animation: 'neon-flicker 4s ease-in-out infinite',
                  }}
                >
                  JUKEBOX
                </h1>
                <span className="text-4xl animate-glow-pulse" style={{ filter: `drop-shadow(0 0 15px ${CASINO_COLORS.neonGold})` }}>🎶</span>
              </div>

              {/* Subtitle with cyan accent */}
              <p
                className="text-xs mt-2 tracking-[0.3em] uppercase font-bold"
                style={{ color: CASINO_COLORS.neonCyan, textShadow: `0 0 10px ${CASINO_COLORS.neonCyan}80` }}
              >
                Premium Casino Entertainment
              </p>
            </div>
          </div>
        </div>

        {/* Animated Equalizer Bars - Gold & Cyan */}
        <div className="flex justify-center items-end gap-1 h-10 mb-4">
          {equalizerBars.map((delay, i) => (
            <div
              key={i}
              className="w-2.5 rounded-t"
              style={{
                background: `linear-gradient(180deg, ${i % 2 === 0 ? CASINO_COLORS.neonGold : CASINO_COLORS.neonCyan} 0%, ${CASINO_COLORS.neonGold}80 100%)`,
                height: `${14 + Math.sin(Date.now() / 200 + i) * 10}px`,
                animation: `equalizer ${0.4 + delay * 0.25}s ease-in-out infinite alternate`,
                boxShadow: `0 0 8px ${i % 2 === 0 ? CASINO_COLORS.neonGold : CASINO_COLORS.neonCyan}`,
              }}
            />
          ))}
        </div>

        {/* Play Credits */}
        {!isPremium && (
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900/80 border border-stone-700">
              <span className="text-sm">🎫</span>
              <span className="text-xs text-gray-400">Daily Plays:</span>
              <span className={`text-sm font-bold ${requestsRemaining > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {requestsRemaining}/5
              </span>
            </div>
          </div>
        )}
        {isPremium && (
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-900/50 to-amber-800/50 border border-amber-600/50">
              <span className="text-sm">⭐</span>
              <span className="text-xs text-amber-300">VIP - Unlimited Plays</span>
            </div>
          </div>
        )}

        {/* Enhanced Search - Blueprint Style */}
        <div className="relative mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your favorite songs..."
            className="w-full px-4 py-3 pl-10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none transition-all"
            style={{
              backgroundColor: `${CASINO_COLORS.darkBg}e0`,
              border: `2px solid ${CASINO_COLORS.neonGold}40`,
              boxShadow: `inset 0 2px 10px rgba(0,0,0,0.5), 0 0 15px ${CASINO_COLORS.neonGold}10`,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = CASINO_COLORS.neonGold;
              e.target.style.boxShadow = `inset 0 2px 10px rgba(0,0,0,0.5), 0 0 20px ${CASINO_COLORS.neonGold}30`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = `${CASINO_COLORS.neonGold}40`;
              e.target.style.boxShadow = `inset 0 2px 10px rgba(0,0,0,0.5), 0 0 15px ${CASINO_COLORS.neonGold}10`;
            }}
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg" style={{ color: CASINO_COLORS.neonGold }}>🔍</span>
        </div>

        {/* Enhanced Genre filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveGenre(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${
              !activeGenre
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg'
                : 'bg-stone-800/80 text-gray-400 hover:bg-stone-700/80'
            }`}
            style={!activeGenre ? { boxShadow: '0 0 15px #f59e0b80' } : {}}
          >
            🎵 All
          </button>
          {Object.entries(genreConfig).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setActiveGenre(activeGenre === key ? null : key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeGenre === key ? 'text-white shadow-lg' : 'bg-stone-800/80 text-gray-400 hover:bg-stone-700/80'
              }`}
              style={activeGenre === key ? {
                backgroundColor: cfg.color,
                boxShadow: `0 0 15px ${cfg.color}80`
              } : {}}
            >
              {cfg.icon} {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Song List with Enhanced Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide pb-24">
        {filteredSongs.map((song, idx) => {
          const isCurrentlyPlaying = song.id === currentlyPlayingSongId;
          const queueIndex = queuedSongIds.indexOf(song.id);
          const isInQueue = queueIndex !== -1;
          return (
            <SongCard
              key={song.id}
              song={song}
              onVote={onVote}
              onPlay={onPlay}
              hasVoted={userVotes.has(song.id)}
              isPremium={isPremium}
              canRequest={canRequest}
              isCurrentlyPlaying={isCurrentlyPlaying}
              isInQueue={isInQueue}
              queuePosition={isInQueue ? queueIndex + 1 : undefined}
            />
          );
        })}
        {filteredSongs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4 opacity-50">🎵</div>
            <p className="text-lg font-medium text-gray-400">No songs found</p>
            <p className="text-sm text-gray-600 mt-1">Try a different search or genre</p>
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// CHAT / HANGOUT COMPONENTS
// =============================================================================

const BarCounter: React.FC<{
  patrons: BarPatron[];
  currentUserId: string;
  onSit: (pos: number) => void;
}> = ({ patrons, currentUserId, onSit }) => {
  const seats = Array.from({ length: 8 }, (_, i) => i + 1);
  const patronByPosition = useMemo(() => {
    const map: Record<number, BarPatron> = {};
    patrons.forEach(p => {
      if (p.seat_position) map[p.seat_position] = p;
    });
    return map;
  }, [patrons]);

  return (
    <div
      className="p-4 rounded-xl border border-amber-800/30"
      style={{
        background: 'linear-gradient(180deg, rgba(120,53,15,0.3) 0%, rgba(28,25,23,0.9) 100%)',
        boxShadow: 'inset 0 1px 0 rgba(251,191,36,0.1), 0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      {/* Bottles Silhouette */}
      <div className="flex justify-center gap-2 mb-3 opacity-40">
        {['🍾', '🥃', '🍺', '🍷', '🥂', '🍸'].map((bottle, i) => (
          <span key={i} className="text-xl filter grayscale" style={{ opacity: 0.5 + Math.random() * 0.5 }}>{bottle}</span>
        ))}
      </div>

      {/* Bar counter top */}
      <div className="relative">
        <div className="h-3 bg-gradient-to-b from-amber-700 to-amber-900 rounded-t-lg shadow-lg"
          style={{ boxShadow: '0 2px 10px rgba(217,119,6,0.3)' }}
        />
        <div className="h-1.5 bg-amber-950 rounded-b" />
      </div>

      {/* Bartender */}
      <div className="flex justify-center my-3">
        <div className="text-center px-4 py-2 bg-stone-900/50 rounded-lg border border-stone-700/50">
          <span className="text-2xl">🧔</span>
          <p className="text-amber-400/80 text-xs mt-1 italic max-w-[200px]">{`"${getRandomQuote()}"`}</p>
        </div>
      </div>

      {/* Seats */}
      <div className="flex justify-center gap-1.5 mt-3">
        {seats.map(pos => {
          const patron = patronByPosition[pos];
          const isCurrentUser = patron?.session_id === currentUserId;

          return (
            <button
              key={pos}
              onClick={() => !patron && onSit(pos)}
              className={`relative w-10 h-12 rounded-t-lg transition-all ${
                patron ? 'bg-amber-900/40' : 'bg-stone-800/60 hover:bg-amber-900/30 cursor-pointer'
              } ${isCurrentUser ? 'ring-2 ring-amber-400' : ''}`}
            >
              {/* Stool top */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-2 bg-amber-800 rounded-full border border-amber-700/50" />

              {patron ? (
                <div className="flex flex-col items-center justify-center h-full pt-1">
                  <span className="text-lg">{patron.avatar_emoji}</span>
                  <span className="text-[8px] text-amber-300/80 truncate w-full text-center px-0.5">
                    {patron.username.slice(0, 5)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full pt-1 text-gray-600 text-xs">+</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ChatMessage: React.FC<{ msg: ChatMessage; isOwn: boolean }> = ({ msg, isOwn }) => {
  if (msg.message_type === 'system') {
    return (
      <div className="flex justify-center py-1">
        <span className="text-amber-600/60 text-xs italic">{msg.message}</span>
      </div>
    );
  }

  if (msg.message_type === 'darts_notification') {
    return (
      <div className="flex justify-center py-1">
        <div className="flex items-center gap-2 px-3 py-1 bg-green-900/30 rounded-full border border-green-700/50">
          <span>🎯</span>
          <span className="text-green-400 text-xs">{msg.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center text-lg flex-shrink-0">
        {msg.avatar_emoji}
      </div>
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs font-medium ${isOwn ? 'text-amber-300' : 'text-gray-400'}`}>
            {msg.username}
          </span>
          <span className="text-gray-600 text-[10px]">{formatTime(msg.created_at)}</span>
        </div>
        <div className={`px-3 py-2 rounded-2xl text-sm ${
          isOwn
            ? 'bg-amber-600 text-white rounded-br-md'
            : 'bg-stone-800 text-gray-200 rounded-bl-md'
        }`}>
          {msg.message}
        </div>
      </div>
    </div>
  );
};

const ChatRoom: React.FC<{
  messages: ChatMessage[];
  onSend: (msg: string) => void;
  currentUsername: string;
}> = ({ messages, onSend, currentUsername }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };

  const quickMessages = ['🍻 Cheers!', 'Nice shot! 🎯', 'Good game!', 'Anyone playing?'];

  return (
    <div className="flex flex-col h-full bg-stone-900/40 rounded-xl border border-stone-800/50">
      <div className="px-3 py-2 border-b border-stone-800/50">
        <GlowingHeader text="BAR CHAT" color="#22c55e" icon="💬" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            <span className="text-3xl block mb-2">💬</span>
            Start chatting with other patrons!
          </div>
        )}
        {messages.map(msg => (
          <ChatMessage
            key={msg.id}
            msg={msg}
            isOwn={msg.username === currentUsername}
          />
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            Someone is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Messages */}
      <div className="flex gap-1.5 px-3 py-2 border-t border-stone-800/50 overflow-x-auto">
        {quickMessages.map((qm, i) => (
          <button
            key={i}
            onClick={() => onSend(qm)}
            className="flex-shrink-0 px-2.5 py-1 bg-stone-800 hover:bg-amber-900/50 rounded-full text-xs text-gray-400 hover:text-amber-300 transition-colors"
          >
            {qm}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 p-3 border-t border-stone-800/50">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Say something..."
          className="flex-1 px-3 py-2 bg-stone-800 border border-stone-700 rounded-full text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-600"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="px-4 py-2 bg-amber-600 text-white font-medium rounded-full hover:bg-amber-500 disabled:opacity-50 transition-colors"
        >
          ➤
        </button>
      </div>
    </div>
  );
};

const HangoutTab: React.FC<{
  patrons: BarPatron[];
  messages: ChatMessage[];
  currentUserId: string;
  currentUsername: string;
  onSit: (pos: number) => void;
  onSendMessage: (msg: string) => void;
}> = ({ patrons, messages, currentUserId, currentUsername, onSit, onSendMessage }) => (
  <div className="flex flex-col h-full p-3 gap-3">
    <BarCounter patrons={patrons} currentUserId={currentUserId} onSit={onSit} />
    <div className="flex-1 min-h-0">
      <ChatRoom messages={messages} onSend={onSendMessage} currentUsername={currentUsername} />
    </div>
  </div>
);

// =============================================================================
// PINBALL GAME COMPONENT - Enhanced with Professional Visuals
// =============================================================================

const PinballGame: React.FC<{
  onScoreUpdate: (score: number) => void;
}> = ({ onScoreUpdate }) => {
  const [score, setScore] = useState(0);
  const [balls, setBalls] = useState(3);
  const [ballPos, setBallPos] = useState({ x: 50, y: 10 });
  const [ballVel, setBallVel] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [leftFlipper, setLeftFlipper] = useState(false);
  const [rightFlipper, setRightFlipper] = useState(false);
  const [bumperHits, setBumperHits] = useState<number[]>([]);
  const [multiplier, setMultiplier] = useState(1);
  const [showMultiplier, setShowMultiplier] = useState(false);
  const [scorePopups, setScorePopups] = useState<{id: number; x: number; y: number; points: number}[]>([]);
  const [ballTrail, setBallTrail] = useState<{x: number; y: number}[]>([]);
  const [flipperSparks, setFlipperSparks] = useState<{side: 'left' | 'right'; time: number}[]>([]);
  const [screenShake, setScreenShake] = useState(0);
  const gameRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const popupIdRef = useRef(0);

  const bumpers = [
    { x: 30, y: 25, points: 100, color: '#ec4899' },
    { x: 50, y: 20, points: 150, color: '#f59e0b' },
    { x: 70, y: 25, points: 100, color: '#ec4899' },
    { x: 40, y: 40, points: 200, color: '#22c55e' },
    { x: 60, y: 40, points: 200, color: '#22c55e' },
  ];

  // Targets/bumpers along sides
  const sideTargets = [
    { x: 15, y: 50, points: 75 },
    { x: 85, y: 50, points: 75 },
    { x: 15, y: 65, points: 50 },
    { x: 85, y: 65, points: 50 },
  ];

  const addScorePopup = (x: number, y: number, points: number) => {
    const id = popupIdRef.current++;
    setScorePopups(prev => [...prev, { id, x, y, points }]);
    setTimeout(() => {
      setScorePopups(prev => prev.filter(p => p.id !== id));
    }, 800);
  };

  const launchBall = () => {
    if (balls <= 0) {
      // Reset game
      setBalls(3);
      setScore(0);
      setMultiplier(1);
    }
    setBallPos({ x: 90, y: 85 });
    setBallVel({ x: -3 - Math.random() * 2, y: -8 - Math.random() * 2 });
    setBallTrail([]);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const physics = () => {
      setBallPos(prev => {
        let newX = prev.x + ballVel.x;
        let newY = prev.y + ballVel.y;
        let newVelX = ballVel.x;
        let newVelY = ballVel.y + 0.15; // Gravity

        // Update ball trail
        setBallTrail(trail => {
          const newTrail = [...trail, { x: prev.x, y: prev.y }];
          return newTrail.slice(-12); // Keep last 12 positions
        });

        // Wall bounces with screen shake
        if (newX <= 5) {
          newX = 5;
          newVelX = Math.abs(newVelX) * 0.9;
          setScreenShake(2);
          setTimeout(() => setScreenShake(0), 100);
        }
        if (newX >= 95) {
          newX = 95;
          newVelX = -Math.abs(newVelX) * 0.9;
          setScreenShake(2);
          setTimeout(() => setScreenShake(0), 100);
        }
        if (newY <= 5) {
          newY = 5;
          newVelY = Math.abs(newVelY) * 0.9;
        }

        // Flipper interaction with sparks
        if (newY >= 85) {
          if (leftFlipper && newX < 35 && newX > 15) {
            newVelY = -10 - Math.random() * 3;
            newVelX = 3 + Math.random() * 2;
            setScore(s => s + 10);
            setFlipperSparks(prev => [...prev, { side: 'left', time: Date.now() }]);
            setTimeout(() => setFlipperSparks(prev => prev.filter(s => Date.now() - s.time < 300)), 300);
            addScorePopup(25, 85, 10);
          } else if (rightFlipper && newX > 65 && newX < 85) {
            newVelY = -10 - Math.random() * 3;
            newVelX = -3 - Math.random() * 2;
            setScore(s => s + 10);
            setFlipperSparks(prev => [...prev, { side: 'right', time: Date.now() }]);
            setTimeout(() => setFlipperSparks(prev => prev.filter(s => Date.now() - s.time < 300)), 300);
            addScorePopup(75, 85, 10);
          }
        }

        // Bumper collisions with enhanced effects
        bumpers.forEach((bumper, idx) => {
          const dist = Math.sqrt((newX - bumper.x) ** 2 + (newY - bumper.y) ** 2);
          if (dist < 8) {
            const angle = Math.atan2(newY - bumper.y, newX - bumper.x);
            newVelX = Math.cos(angle) * 7;
            newVelY = Math.sin(angle) * 7;
            const earnedPoints = bumper.points * multiplier;
            setScore(s => s + earnedPoints);
            setBumperHits(prev => [...prev, idx]);
            setTimeout(() => setBumperHits(prev => prev.filter(h => h !== idx)), 300);
            addScorePopup(bumper.x, bumper.y, earnedPoints);

            // Screen shake on bumper hit
            setScreenShake(bumper.points >= 150 ? 4 : 2);
            setTimeout(() => setScreenShake(0), 150);

            // Random multiplier increase (higher chance)
            if (Math.random() < 0.15) {
              const newMult = Math.min(multiplier + 1, 5);
              setMultiplier(newMult);
              setShowMultiplier(true);
              setTimeout(() => setShowMultiplier(false), 1200);
            }
          }
        });

        // Side target collisions
        sideTargets.forEach((target) => {
          const dist = Math.sqrt((newX - target.x) ** 2 + (newY - target.y) ** 2);
          if (dist < 5) {
            const earnedPoints = target.points * multiplier;
            setScore(s => s + earnedPoints);
            addScorePopup(target.x, target.y, earnedPoints);
            newVelX = newX < 50 ? 4 : -4;
          }
        });

        // Ball lost
        if (newY > 95) {
          setBalls(b => b - 1);
          setIsPlaying(false);
          setMultiplier(1);
          setBallTrail([]);
          onScoreUpdate(score);
        }

        setBallVel({ x: newVelX * 0.995, y: newVelY });
        return { x: newX, y: newY };
      });

      animationRef.current = requestAnimationFrame(physics);
    };

    animationRef.current = requestAnimationFrame(physics);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, ballVel, leftFlipper, rightFlipper, multiplier, score, onScoreUpdate]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'z' || e.key === 'Z' || e.key === 'ArrowLeft') setLeftFlipper(true);
      if (e.key === '/' || e.key === 'ArrowRight') setRightFlipper(true);
      if (e.key === ' ' && !isPlaying) launchBall();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'z' || e.key === 'Z' || e.key === 'ArrowLeft') setLeftFlipper(false);
      if (e.key === '/' || e.key === 'ArrowRight') setRightFlipper(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying]);

  return (
    <div className="flex flex-col h-full p-3">
      <GlowingHeader text="PINBALL" color="#ec4899" icon="🕹️" />

      {/* Enhanced Score Display */}
      <div className="flex justify-between items-center mb-3 px-2">
        <div className="text-amber-400">
          <span className="text-gray-500 text-xs">SCORE</span>
          <div className="font-black text-2xl tracking-wider" style={{
            textShadow: '0 0 10px #f59e0b, 0 0 20px #f59e0b40',
            fontFamily: 'monospace',
          }}>
            {score.toLocaleString().padStart(8, '0')}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {multiplier > 1 && (
            <div className="relative">
              <span className="px-3 py-1 bg-gradient-to-r from-pink-600 to-pink-500 text-white text-sm font-black rounded-lg animate-pulse"
                style={{ boxShadow: '0 0 15px #ec4899' }}>
                {multiplier}x BONUS
              </span>
              <div className="absolute inset-0 bg-pink-500 rounded-lg animate-ping opacity-30" />
            </div>
          )}
          <div className="flex gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full transition-all duration-300 ${i < balls ? 'scale-100' : 'scale-75 opacity-30'}`}
                style={{
                  background: i < balls
                    ? 'radial-gradient(circle at 30% 30%, #fff 0%, #c0c0c0 50%, #808080 100%)'
                    : '#333',
                  boxShadow: i < balls ? '0 0 8px #ffffff80, inset 0 1px 2px #ffffff' : 'none',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Pinball Machine with Screen Shake */}
      <div
        ref={gameRef}
        className="flex-1 relative rounded-xl overflow-hidden transition-transform"
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
          border: '4px solid #4a5568',
          boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8), 0 0 20px rgba(236,72,153,0.3)',
          transform: screenShake ? `translate(${(Math.random() - 0.5) * screenShake}px, ${(Math.random() - 0.5) * screenShake}px)` : 'none',
        }}
      >
        {/* Chrome Frame with Neon Trim */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-gray-300 to-gray-500" />
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-gray-300 to-gray-500" />
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-gray-300 to-gray-500" />
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-gray-300 to-gray-500" />
          {/* Neon inner trim */}
          <div className="absolute top-2 left-2 right-2 h-px bg-pink-500 opacity-60" style={{ boxShadow: '0 0 5px #ec4899' }} />
          <div className="absolute bottom-2 left-2 right-2 h-px bg-pink-500 opacity-60" style={{ boxShadow: '0 0 5px #ec4899' }} />
        </div>

        {/* Side Lane Lights */}
        {[20, 35, 50, 65, 80].map((y, i) => (
          <div key={`light-${i}`} className="absolute" style={{
            left: '3%', top: `${y}%`,
            width: '6px', height: '6px',
            borderRadius: '50%',
            background: '#ec4899',
            boxShadow: '0 0 8px #ec4899, 0 0 15px #ec489980',
            animation: `pulse ${1 + i * 0.2}s ease-in-out infinite`,
          }} />
        ))}
        {[20, 35, 50, 65, 80].map((y, i) => (
          <div key={`light-r-${i}`} className="absolute" style={{
            right: '3%', top: `${y}%`,
            width: '6px', height: '6px',
            borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 8px #22c55e, 0 0 15px #22c55e80',
            animation: `pulse ${1.2 + i * 0.2}s ease-in-out infinite`,
          }} />
        ))}

        {/* Ball Trail */}
        {ballTrail.map((pos, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
              width: `${2 + i * 0.3}%`,
              height: `${2 + i * 0.3}%`,
              background: `radial-gradient(circle, rgba(236,72,153,${0.1 + i * 0.05}) 0%, transparent 70%)`,
            }}
          />
        ))}

        {/* Side Targets */}
        {sideTargets.map((target, idx) => (
          <div
            key={`target-${idx}`}
            className="absolute"
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              transform: 'translate(-50%, -50%)',
              width: '8%',
              height: '4%',
              background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '2px',
              boxShadow: '0 0 8px #f59e0b60',
            }}
          />
        ))}

        {/* Enhanced Bumpers */}
        {bumpers.map((bumper, idx) => (
          <div
            key={idx}
            className="absolute rounded-full"
            style={{
              left: `${bumper.x}%`,
              top: `${bumper.y}%`,
              transform: `translate(-50%, -50%) scale(${bumperHits.includes(idx) ? 1.3 : 1})`,
              transition: 'transform 0.15s ease-out',
              width: '12%',
              height: '12%',
              background: bumperHits.includes(idx)
                ? `radial-gradient(circle, #fff 0%, ${bumper.color} 40%, ${bumper.color}80 100%)`
                : `radial-gradient(circle, ${bumper.color}cc 0%, ${bumper.color} 50%, ${bumper.color}80 100%)`,
              boxShadow: bumperHits.includes(idx)
                ? `0 0 30px ${bumper.color}, 0 0 60px ${bumper.color}, 0 0 90px ${bumper.color}80`
                : `0 0 15px ${bumper.color}60`,
              border: '3px solid rgba(255,255,255,0.4)',
            }}
          >
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center text-white font-black text-xs opacity-80">
              {bumper.points}
            </div>
            {/* Ring pulse on hit */}
            {bumperHits.includes(idx) && (
              <div className="absolute inset-[-20%] rounded-full animate-ping"
                style={{ border: `2px solid ${bumper.color}`, opacity: 0.6 }} />
            )}
          </div>
        ))}

        {/* Enhanced Flippers with Glow */}
        <div
          className="absolute"
          style={{
            left: '15%',
            bottom: '10%',
            width: '20%',
            height: '5%',
            background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
            borderRadius: '4px 8px 8px 4px',
            transformOrigin: 'left center',
            transform: `rotate(${leftFlipper ? -35 : 20}deg)`,
            transition: 'transform 0.05s ease-out',
            boxShadow: leftFlipper
              ? '0 0 20px #f59e0b, 0 0 40px #f59e0b80'
              : '0 0 10px #f59e0b60',
            border: '2px solid #fcd34d',
          }}
        />
        <div
          className="absolute"
          style={{
            right: '15%',
            bottom: '10%',
            width: '20%',
            height: '5%',
            background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
            borderRadius: '8px 4px 4px 8px',
            transformOrigin: 'right center',
            transform: `rotate(${rightFlipper ? 35 : -20}deg)`,
            transition: 'transform 0.05s ease-out',
            boxShadow: rightFlipper
              ? '0 0 20px #f59e0b, 0 0 40px #f59e0b80'
              : '0 0 10px #f59e0b60',
            border: '2px solid #fcd34d',
          }}
        />

        {/* Flipper Sparks */}
        {flipperSparks.map((spark, i) => (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: spark.side === 'left' ? '28%' : '72%',
              bottom: '12%',
            }}
          >
            {[...Array(6)].map((_, j) => (
              <div
                key={j}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                style={{
                  animation: 'sparkFly 0.3s ease-out forwards',
                  transform: `rotate(${j * 60}deg) translateY(-${5 + Math.random() * 10}px)`,
                  boxShadow: '0 0 4px #fbbf24',
                }}
              />
            ))}
          </div>
        ))}

        {/* Enhanced Ball with Motion Blur Effect */}
        {isPlaying && (
          <>
            {/* Motion blur shadow */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                left: `${ballPos.x - ballVel.x * 0.3}%`,
                top: `${ballPos.y - ballVel.y * 0.3}%`,
                transform: 'translate(-50%, -50%)',
                width: '5%',
                height: '5%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                filter: 'blur(3px)',
              }}
            />
            {/* Main ball */}
            <div
              className="absolute rounded-full"
              style={{
                left: `${ballPos.x}%`,
                top: `${ballPos.y}%`,
                transform: 'translate(-50%, -50%)',
                width: '5%',
                height: '5%',
                background: 'radial-gradient(circle at 30% 30%, #fff 0%, #e5e5e5 30%, #c0c0c0 60%, #808080 100%)',
                boxShadow: '0 3px 8px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.8), 0 0 15px rgba(255,255,255,0.3)',
              }}
            />
          </>
        )}

        {/* Score Popups */}
        {scorePopups.map(popup => (
          <div
            key={popup.id}
            className="absolute pointer-events-none font-black text-sm"
            style={{
              left: `${popup.x}%`,
              top: `${popup.y}%`,
              transform: 'translate(-50%, -50%)',
              color: popup.points >= 100 ? '#22c55e' : '#f59e0b',
              textShadow: popup.points >= 100
                ? '0 0 10px #22c55e, 0 0 20px #22c55e'
                : '0 0 10px #f59e0b, 0 0 20px #f59e0b',
              animation: 'scorePopup 0.8s ease-out forwards',
            }}
          >
            +{popup.points}
          </div>
        ))}

        {/* Multiplier Popup */}
        {showMultiplier && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              <div className="text-7xl font-black text-pink-400" style={{
                textShadow: '0 0 30px #ec4899, 0 0 60px #ec4899, 0 0 90px #ec4899',
                animation: 'multiplierPop 0.5s ease-out',
              }}>
                {multiplier}x
              </div>
              <div className="absolute inset-0 text-7xl font-black text-white opacity-30 animate-ping">
                {multiplier}x
              </div>
            </div>
          </div>
        )}

        {/* Launch Prompt */}
        {!isPlaying && balls > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <button
              onClick={launchBall}
              className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg text-lg transition-all transform hover:scale-105"
              style={{ boxShadow: '0 0 20px #ec4899' }}
            >
              🚀 LAUNCH BALL
            </button>
          </div>
        )}

        {/* Game Over */}
        {balls <= 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <div className="text-3xl font-black text-pink-400 mb-2" style={{ textShadow: '0 0 10px #ec4899' }}>
              GAME OVER
            </div>
            <div className="text-amber-400 text-xl mb-4">Final Score: {score.toLocaleString()}</div>
            <button
              onClick={launchBall}
              className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg transition-all"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="flex gap-3 mt-3">
        <button
          onTouchStart={() => setLeftFlipper(true)}
          onTouchEnd={() => setLeftFlipper(false)}
          onMouseDown={() => setLeftFlipper(true)}
          onMouseUp={() => setLeftFlipper(false)}
          className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
            leftFlipper ? 'bg-amber-500 text-black' : 'bg-stone-800 text-amber-400'
          }`}
        >
          ◀ LEFT
        </button>
        <button
          onTouchStart={() => setRightFlipper(true)}
          onTouchEnd={() => setRightFlipper(false)}
          onMouseDown={() => setRightFlipper(true)}
          onMouseUp={() => setRightFlipper(false)}
          className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
            rightFlipper ? 'bg-amber-500 text-black' : 'bg-stone-800 text-amber-400'
          }`}
        >
          RIGHT ▶
        </button>
      </div>

      <p className="text-center text-gray-500 text-xs mt-2">
        Desktop: Z / ← for left, / / → for right, SPACE to launch
      </p>
    </div>
  );
};

// =============================================================================
// PLINKO GAME COMPONENT - Enhanced with Professional Effects
// =============================================================================

const PlinkoGame: React.FC<{
  onWin: (amount: number) => void;
}> = ({ onWin }) => {
  const [balls, setBalls] = useState<PlinkoBall[]>([]);
  const [betAmount, setBetAmount] = useState(100);
  const [balance, setBalance] = useState(10000);
  const [lastWin, setLastWin] = useState<{ amount: number; slot: number } | null>(null);
  const [dropping, setDropping] = useState(false);
  const [hitPegs, setHitPegs] = useState<Set<string>>(new Set());
  const [slotCelebration, setSlotCelebration] = useState<number | null>(null);
  const [particles, setParticles] = useState<{id: number; x: number; y: number; color: string}[]>([]);
  const [screenShake, setScreenShake] = useState(0);
  const animationRef = useRef<number>();
  const ballIdRef = useRef(0);
  const particleIdRef = useRef(0);

  const ROWS = 12;
  const PEGS_PER_ROW = ROWS + 1;
  const SLOTS = ROWS + 1;

  const createParticles = (x: number, y: number, color: string, count: number = 8) => {
    const newParticles = Array.from({ length: count }, () => ({
      id: particleIdRef.current++,
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      color,
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 600);
  };

  const dropBall = () => {
    if (balance < betAmount || dropping) return;

    setBalance(b => b - betAmount);
    setDropping(true);
    setLastWin(null);
    setSlotCelebration(null);
    setHitPegs(new Set());

    const newBall: PlinkoBall = {
      id: ballIdRef.current++,
      x: 50 + (Math.random() - 0.5) * 6,
      y: 3,
      settled: false,
      slot: null,
    };

    setBalls(prev => [...prev, newBall]);
  };

  useEffect(() => {
    if (balls.length === 0 || balls.every(b => b.settled)) {
      setDropping(false);
      return;
    }

    const animate = () => {
      setBalls(prevBalls =>
        prevBalls.map(ball => {
          if (ball.settled) return ball;

          let newY = ball.y + 1.2; // Slightly slower for more suspense
          let newX = ball.x;

          // Enhanced peg collision simulation with peg highlighting
          const rowProgress = Math.floor((newY / 100) * ROWS);
          if (rowProgress >= 0 && rowProgress < ROWS && Math.random() < 0.35) {
            const direction = Math.random() > 0.5 ? 1 : -1;
            newX += direction * (2.5 + Math.random() * 2);

            // Calculate approximate peg position and highlight it
            const pegsInRow = rowProgress + 3;
            const pegSpacing = 84 / (pegsInRow + 1);
            const pegCol = Math.round((newX - 8) / pegSpacing);
            const pegKey = `${rowProgress}-${pegCol}`;
            setHitPegs(prev => new Set([...prev, pegKey]));
            setTimeout(() => {
              setHitPegs(prev => {
                const next = new Set(prev);
                next.delete(pegKey);
                return next;
              });
            }, 200);
          }

          // Keep in bounds with bounce
          if (newX <= 8) {
            newX = 8 + Math.random() * 2;
          }
          if (newX >= 92) {
            newX = 92 - Math.random() * 2;
          }

          // Check if settled
          if (newY >= 88) {
            const slotWidth = 84 / SLOTS;
            const slot = Math.floor((newX - 8) / slotWidth);
            const finalSlot = Math.max(0, Math.min(SLOTS - 1, slot));
            const multiplier = PLINKO_MULTIPLIERS[finalSlot] || 1;
            const winAmount = Math.floor(betAmount * multiplier);

            setBalance(b => b + winAmount);
            setLastWin({ amount: winAmount, slot: finalSlot });
            setSlotCelebration(finalSlot);
            onWin(winAmount);

            // Create particles based on win amount
            const slotX = 8 + (finalSlot + 0.5) * slotWidth;
            const particleCount = multiplier >= 5 ? 20 : multiplier >= 2 ? 12 : 6;
            const color = multiplier >= 5 ? '#22c55e' : multiplier >= 2 ? '#eab308' : '#f97316';
            createParticles(slotX, 90, color, particleCount);

            // Screen shake for big wins
            if (multiplier >= 5) {
              setScreenShake(6);
              setTimeout(() => setScreenShake(0), 300);
            } else if (multiplier >= 2) {
              setScreenShake(3);
              setTimeout(() => setScreenShake(0), 150);
            }

            setTimeout(() => setSlotCelebration(null), 1500);

            return { ...ball, y: 90, settled: true, slot: finalSlot };
          }

          return { ...ball, x: newX, y: newY };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [balls, betAmount, onWin]);

  // Clear settled balls after a delay
  useEffect(() => {
    const settled = balls.filter(b => b.settled);
    if (settled.length > 0) {
      const timeout = setTimeout(() => {
        setBalls(prev => prev.filter(b => !b.settled));
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [balls]);

  return (
    <div className="flex flex-col h-full p-3">
      <GlowingHeader text="PLINKO" color="#06b6d4" icon="⚪" />

      {/* Enhanced Balance & Bet Display */}
      <div className="flex justify-between items-center mb-3 px-2">
        <div className="text-amber-400">
          <span className="text-gray-500 text-xs">BALANCE</span>
          <div className="font-black text-xl" style={{ textShadow: '0 0 8px #f59e0b40' }}>
            🪙 {balance.toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-stone-800/50 rounded-lg px-3 py-2">
          <button
            onClick={() => setBetAmount(Math.max(50, betAmount - 50))}
            className="w-8 h-8 bg-stone-700 hover:bg-cyan-600 rounded-lg text-white font-bold transition-colors"
          >
            -
          </button>
          <div className="text-center min-w-[70px]">
            <span className="text-gray-500 text-[10px] block">BET</span>
            <span className="text-white font-bold">{betAmount}</span>
          </div>
          <button
            onClick={() => setBetAmount(Math.min(balance, betAmount + 50))}
            className="w-8 h-8 bg-stone-700 hover:bg-cyan-600 rounded-lg text-white font-bold transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Enhanced Plinko Board with Screen Shake */}
      <div
        className="flex-1 relative rounded-xl overflow-hidden transition-transform"
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          border: '3px solid #475569',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6), 0 0 25px rgba(6,182,212,0.25)',
          transform: screenShake ? `translate(${(Math.random() - 0.5) * screenShake}px, ${(Math.random() - 0.5) * screenShake}px)` : 'none',
        }}
      >
        {/* Ambient glow at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-8 rounded-b-full opacity-40"
          style={{ background: 'radial-gradient(ellipse, #06b6d4 0%, transparent 70%)' }} />

        {/* Enhanced Pegs with hit effects */}
        {Array.from({ length: ROWS }).map((_, row) => {
          const pegsInRow = row + 3;
          const spacing = 84 / (pegsInRow + 1);

          return Array.from({ length: pegsInRow }).map((_, col) => {
            const pegKey = `${row}-${col}`;
            const isHit = hitPegs.has(pegKey);

            return (
              <div
                key={pegKey}
                className="absolute rounded-full transition-all"
                style={{
                  left: `${8 + spacing * (col + 1)}%`,
                  top: `${8 + (row * 6)}%`,
                  width: isHit ? '12px' : '8px',
                  height: isHit ? '12px' : '8px',
                  background: isHit
                    ? 'radial-gradient(circle at 30% 30%, #fff 0%, #22d3ee 50%, #06b6d4 100%)'
                    : 'radial-gradient(circle at 30% 30%, #fff 0%, #cbd5e1 50%, #64748b 100%)',
                  boxShadow: isHit
                    ? '0 0 15px #22d3ee, 0 0 30px #06b6d4'
                    : '0 0 4px rgba(148,163,184,0.4)',
                  transform: 'translate(-50%, -50%)',
                  transition: 'all 0.1s ease-out',
                }}
              />
            );
          });
        })}

        {/* Enhanced Multiplier Slots with celebration effects */}
        <div className="absolute bottom-0 left-0 right-0 h-[18%] flex px-2 gap-0.5">
          {PLINKO_MULTIPLIERS.map((mult, i) => {
            const isCelebrating = slotCelebration === i;
            const color = mult >= 5 ? '#22c55e' : mult >= 2 ? '#eab308' : mult >= 1 ? '#f97316' : '#ef4444';

            return (
              <div
                key={i}
                className={`flex-1 flex flex-col items-center justify-center rounded-t-lg font-bold transition-all relative overflow-hidden`}
                style={{
                  background: isCelebrating
                    ? `linear-gradient(180deg, ${color} 0%, ${color}80 100%)`
                    : `linear-gradient(180deg, ${color}30 0%, ${color}15 100%)`,
                  borderTop: `3px solid ${color}`,
                  borderLeft: `1px solid ${color}40`,
                  borderRight: `1px solid ${color}40`,
                  boxShadow: isCelebrating
                    ? `0 0 30px ${color}, 0 0 60px ${color}80, inset 0 0 20px ${color}40`
                    : 'none',
                  color: isCelebrating ? '#fff' : color,
                  transform: isCelebrating ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                <span className="text-sm font-black">{mult}x</span>
                {/* Celebration pulse rings */}
                {isCelebrating && (
                  <>
                    <div className="absolute inset-0 animate-ping opacity-30"
                      style={{ background: color }} />
                    <div className="absolute -inset-2 border-2 rounded-lg animate-ping opacity-40"
                      style={{ borderColor: color }} />
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Particles */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full pointer-events-none"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              background: particle.color,
              boxShadow: `0 0 6px ${particle.color}`,
              animation: 'particleFly 0.6s ease-out forwards',
            }}
          />
        ))}

        {/* Enhanced Balls/Chips with trail effect */}
        {balls.map(ball => (
          <div key={ball.id}>
            {/* Ball shadow/trail */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                left: `${ball.x}%`,
                top: `${ball.y + 1}%`,
                width: '18px',
                height: '18px',
                background: 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)',
                transform: 'translate(-50%, -50%)',
                filter: 'blur(4px)',
              }}
            />
            {/* Main chip */}
            <div
              className="absolute rounded-full"
              style={{
                left: `${ball.x}%`,
                top: `${ball.y}%`,
                width: '18px',
                height: '18px',
                background: ball.settled
                  ? 'radial-gradient(circle at 30% 30%, #fff 0%, #22c55e 40%, #16a34a 100%)'
                  : 'radial-gradient(circle at 30% 30%, #fff 0%, #fcd34d 30%, #fbbf24 60%, #d97706 100%)',
                boxShadow: ball.settled
                  ? '0 0 15px #22c55e, 0 0 30px #22c55e80'
                  : '0 0 12px #fbbf24, 0 0 24px #fbbf2480, inset 0 -2px 4px rgba(0,0,0,0.3)',
                transform: 'translate(-50%, -50%)',
                border: '2px solid rgba(255,255,255,0.4)',
              }}
            >
              {/* Inner shine */}
              <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-white/50 to-transparent" />
            </div>
          </div>
        ))}

        {/* Enhanced Win Popup */}
        {lastWin && lastWin.amount > betAmount && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              <div
                className="text-5xl font-black"
                style={{
                  color: lastWin.amount >= betAmount * 5 ? '#22c55e' : '#eab308',
                  textShadow: lastWin.amount >= betAmount * 5
                    ? '0 0 30px #22c55e, 0 0 60px #22c55e, 0 0 90px #22c55e'
                    : '0 0 25px #eab308, 0 0 50px #eab308',
                  animation: 'winPop 0.5s ease-out',
                }}
              >
                +{lastWin.amount.toLocaleString()}!
              </div>
              {lastWin.amount >= betAmount * 5 && (
                <div className="text-xl font-black text-center text-green-300 mt-1 animate-pulse">
                  🎉 BIG WIN! 🎉
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Drop Button */}
      <button
        onClick={dropBall}
        disabled={dropping || balance < betAmount}
        className="mt-3 py-4 bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-600 hover:from-cyan-500 hover:via-cyan-400 hover:to-cyan-500 text-white font-bold rounded-xl text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
        style={{ boxShadow: '0 0 25px rgba(6,182,212,0.5)' }}
      >
        <span className="relative z-10">
          {dropping ? '⚪ DROPPING...' : '⚪ DROP CHIP'}
        </span>
        {!dropping && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        )}
      </button>

      {/* Enhanced Last Win Display */}
      {lastWin && (
        <div className={`text-center mt-2 py-2 rounded-lg font-bold ${
          lastWin.amount >= betAmount
            ? 'bg-green-900/30 text-green-400 border border-green-700/50'
            : 'bg-red-900/30 text-red-400 border border-red-700/50'
        }`}>
          {lastWin.amount >= betAmount
            ? `🎉 Won: +${lastWin.amount.toLocaleString()} Gold Coins!`
            : `Lost: -${(betAmount - lastWin.amount).toLocaleString()} Gold Coins`}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// DARTS COMPONENTS - Enhanced with Professional Animations
// =============================================================================

const DartBoard: React.FC<{
  onThrow: (x: number, y: number) => void;
  thrownDarts: DartThrow[];
  isMyTurn: boolean;
  disabled: boolean;
}> = ({ onThrow, thrownDarts, isMyTurn, disabled }) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [aimPos, setAimPos] = useState<{ x: number; y: number } | null>(null);
  const [flyingDart, setFlyingDart] = useState<{x: number; y: number; targetX: number; targetY: number; progress: number} | null>(null);
  const [hitEffect, setHitEffect] = useState<{x: number; y: number; score: number} | null>(null);
  const [boardPulse, setBoardPulse] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || !isMyTurn || flyingDart) return;

    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    const accuracy = 0.92 + Math.random() * 0.08;
    const jitterX = (Math.random() - 0.5) * 0.1;
    const jitterY = (Math.random() - 0.5) * 0.1;

    const finalX = x * accuracy + jitterX;
    const finalY = y * accuracy + jitterY;

    // Start flying dart animation
    setFlyingDart({
      x: 50, // Start from center bottom
      y: 120, // Start below board
      targetX: (finalX + 1) * 50,
      targetY: (finalY + 1) * 50,
      progress: 0
    });

    // Animate the dart flight
    let progress = 0;
    const animateDart = () => {
      progress += 0.08;
      if (progress >= 1) {
        setFlyingDart(null);
        onThrow(finalX, finalY);

        // Calculate score for hit effect
        const dart = calculateDartScore(finalX, finalY);
        setHitEffect({ x: (finalX + 1) * 50, y: (finalY + 1) * 50, score: dart.points });
        setBoardPulse(true);
        setTimeout(() => {
          setHitEffect(null);
          setBoardPulse(false);
        }, 600);
        return;
      }

      // Easing function for natural arc
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const arcHeight = Math.sin(progress * Math.PI) * 30;

      setFlyingDart({
        x: 50 + (((finalX + 1) * 50) - 50) * easeProgress,
        y: 120 + (((finalY + 1) * 50) - 120) * easeProgress - arcHeight,
        targetX: (finalX + 1) * 50,
        targetY: (finalY + 1) * 50,
        progress
      });

      requestAnimationFrame(animateDart);
    };

    requestAnimationFrame(animateDart);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled || !isMyTurn) return;
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setAimPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      ref={boardRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setAimPos(null)}
      className={`relative w-full aspect-square max-w-[300px] mx-auto rounded-full overflow-visible ${
        isMyTurn && !disabled ? 'cursor-crosshair' : 'cursor-not-allowed opacity-70'
      }`}
      style={{
        background: 'radial-gradient(circle, #2d2a1f 0%, #1a1a1a 100%)',
        boxShadow: boardPulse
          ? 'inset 0 0 30px rgba(0,0,0,0.8), 0 0 40px rgba(217,119,6,0.4), 0 0 80px rgba(217,119,6,0.2)'
          : 'inset 0 0 30px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.5), 0 0 60px rgba(217,119,6,0.1)',
        border: '5px solid #52525b',
        transform: boardPulse ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.15s ease-out',
      }}
    >
      {/* Cork texture overlay */}
      <div
        className="absolute inset-0 rounded-full opacity-25"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Wire frame with metallic effect */}
      <div className="absolute inset-[2%] rounded-full" style={{
        border: '2px solid transparent',
        borderImage: 'linear-gradient(135deg, #a3a3a3 0%, #525252 50%, #a3a3a3 100%) 1',
        borderRadius: '50%',
        boxShadow: 'inset 0 0 2px rgba(255,255,255,0.1)',
      }} />

      {/* Enhanced Segment rings with metallic wire */}
      {[5, 15, 35, 45].map((inset, idx) => (
        <div key={idx} className="absolute rounded-full"
          style={{
            inset: `${inset}%`,
            border: '2px solid #71717a',
            boxShadow: '0 0 2px rgba(0,0,0,0.5), inset 0 0 1px rgba(255,255,255,0.1)',
          }} />
      ))}

      {/* Colored segment wedges with gradients */}
      {[20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5].map((num, i) => {
        const isEven = i % 2 === 0;
        const angle = i * 18;

        return (
          <div
            key={`seg-${num}`}
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              width: '37%',
              height: '7px',
              background: isEven
                ? 'linear-gradient(90deg, #14532d 0%, #166534 50%, #14532d 100%)'
                : 'linear-gradient(90deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)',
              transform: `rotate(${angle - 90}deg) translateX(22%)`,
              transformOrigin: 'left center',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1), inset 0 -1px 2px rgba(0,0,0,0.2)',
            }}
          />
        );
      })}

      {/* Triple ring highlight */}
      <div className="absolute rounded-full" style={{
        inset: '44%',
        border: '4px solid transparent',
        background: 'linear-gradient(#1a1a1a, #1a1a1a) padding-box, linear-gradient(135deg, #22c55e, #15803d) border-box',
        borderRadius: '50%',
        boxShadow: '0 0 8px rgba(34,197,94,0.3)',
      }} />

      {/* Double ring highlight */}
      <div className="absolute rounded-full" style={{
        inset: '4%',
        border: '4px solid transparent',
        background: 'linear-gradient(#1a1a1a, #1a1a1a) padding-box, linear-gradient(135deg, #ef4444, #b91c1c) border-box',
        borderRadius: '50%',
        boxShadow: '0 0 8px rgba(239,68,68,0.3)',
      }} />

      {/* Numbers around edge with better styling */}
      {[20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5].map((num, i) => {
        const angle = (i * 18 - 99) * (Math.PI / 180);
        const radius = 44;
        return (
          <div
            key={num}
            className="absolute text-[11px] font-black"
            style={{
              left: `${50 + Math.cos(angle) * radius}%`,
              top: `${50 + Math.sin(angle) * radius}%`,
              transform: 'translate(-50%, -50%)',
              color: '#fafafa',
              textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
            }}
          >
            {num}
          </div>
        );
      })}

      {/* Enhanced Outer bull (25) */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[12%] h-[12%] rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #22c55e 0%, #16a34a 40%, #15803d 100%)',
          border: '2px solid #4ade80',
          boxShadow: '0 0 10px rgba(34,197,94,0.4), inset 0 2px 4px rgba(255,255,255,0.2)',
        }}
      />

      {/* Enhanced Inner bull (50) */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[5%] h-[5%] rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #f87171 0%, #ef4444 40%, #dc2626 100%)',
          border: '2px solid #fca5a5',
          boxShadow: '0 0 15px rgba(239,68,68,0.5), inset 0 2px 4px rgba(255,255,255,0.3)',
        }}
      />

      {/* Enhanced Aim reticle */}
      {aimPos && isMyTurn && !disabled && !flyingDart && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${aimPos.x}%`,
            top: `${aimPos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-10 h-10 border-2 border-amber-400 rounded-full animate-ping opacity-20" />
          <div className="absolute inset-0 w-10 h-10 border-2 border-amber-400/80 rounded-full" />
          <div className="absolute w-10 h-px bg-amber-400/60 top-1/2 -translate-y-1/2" />
          <div className="absolute h-10 w-px bg-amber-400/60 left-1/2 -translate-x-1/2" />
          <div className="absolute w-3 h-3 border-2 border-amber-500 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}

      {/* Flying dart animation */}
      {flyingDart && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            left: `${flyingDart.x}%`,
            top: `${flyingDart.y}%`,
            transform: `translate(-50%, -50%) rotate(${-90 + Math.atan2(flyingDart.targetY - flyingDart.y, flyingDart.targetX - flyingDart.x) * 180 / Math.PI}deg) scale(${0.6 + flyingDart.progress * 0.4})`,
          }}
        >
          {/* Dart tip */}
          <div className="w-2 h-6 bg-gradient-to-b from-gray-300 to-gray-500 rounded-t-full" />
          {/* Dart body */}
          <div className="w-3 h-4 bg-gradient-to-b from-red-500 to-red-700 rounded-sm -mt-1 ml-[-2px]" />
          {/* Flight fins */}
          <div className="w-5 h-3 bg-red-400/60 rounded-sm -mt-0.5 ml-[-5px]"
            style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }} />
        </div>
      )}

      {/* Enhanced Thrown darts */}
      {thrownDarts.map((dart, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: `${(dart.x + 1) * 50}%`,
            top: `${(dart.y + 1) * 50}%`,
            transform: 'translate(-50%, -50%)',
            animation: 'dartLand 0.15s ease-out',
          }}
        >
          {/* Dart shadow */}
          <div className="absolute w-4 h-4 bg-black/30 rounded-full blur-sm" style={{ top: '4px', left: '2px' }} />
          {/* Dart tip embedded in board */}
          <div
            className="w-4 h-4 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #f87171 0%, #ef4444 50%, #b91c1c 100%)',
              boxShadow: '0 0 10px #ef4444, 0 3px 6px rgba(0,0,0,0.5)',
              border: '1px solid #fca5a5',
            }}
          />
          {/* Dart shaft */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-1 h-4"
            style={{
              background: 'linear-gradient(90deg, #9ca3af 0%, #e5e7eb 50%, #9ca3af 100%)',
              borderRadius: '2px',
            }} />
          {/* Dart flight */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3 h-2"
            style={{
              background: 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)',
              clipPath: 'polygon(20% 100%, 50% 0%, 80% 100%)',
            }} />
        </div>
      ))}

      {/* Hit effect */}
      {hitEffect && (
        <div
          className="absolute pointer-events-none z-30"
          style={{
            left: `${hitEffect.x}%`,
            top: `${hitEffect.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-8 h-8 rounded-full animate-ping"
            style={{
              background: hitEffect.score >= 40 ? 'radial-gradient(circle, #22c55e 0%, transparent 70%)'
                : hitEffect.score >= 20 ? 'radial-gradient(circle, #eab308 0%, transparent 70%)'
                : 'radial-gradient(circle, #f59e0b 0%, transparent 70%)',
            }} />
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 font-black text-lg whitespace-nowrap"
            style={{
              color: hitEffect.score >= 40 ? '#22c55e' : hitEffect.score >= 20 ? '#eab308' : '#f59e0b',
              textShadow: hitEffect.score >= 40 ? '0 0 10px #22c55e' : hitEffect.score >= 20 ? '0 0 10px #eab308' : '0 0 10px #f59e0b',
              animation: 'scoreFloat 0.6s ease-out forwards',
            }}
          >
            {hitEffect.score === 0 ? 'MISS!' : `+${hitEffect.score}`}
          </div>
        </div>
      )}

      {/* Throw prompt */}
      {isMyTurn && !disabled && thrownDarts.length < 3 && !flyingDart && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-amber-400 bg-black/90 px-3 py-1.5 rounded-full whitespace-nowrap border border-amber-600/30"
          style={{ boxShadow: '0 0 10px rgba(217,119,6,0.2)' }}>
          🎯 Click to throw ({3 - thrownDarts.length} remaining)
        </div>
      )}
    </div>
  );
};

const calculateDartScore = (x: number, y: number): DartThrow => {
  const distance = Math.sqrt(x * x + y * y);
  const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
  const normalizedAngle = ((angle % 360) + 360) % 360;

  const segments = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
  const segmentIndex = Math.floor(normalizedAngle / 18) % 20;
  const segment = segments[segmentIndex];

  let multiplier = 1;
  let points = 0;

  if (distance <= 0.05) {
    return { segment: 25, multiplier: 2, points: 50, x, y };
  } else if (distance <= 0.12) {
    return { segment: 25, multiplier: 1, points: 25, x, y };
  } else if (distance > 0.95) {
    return { segment: 0, multiplier: 0, points: 0, x, y };
  } else if (distance >= 0.85 && distance <= 0.95) {
    multiplier = 2;
    points = segment * 2;
  } else if (distance >= 0.45 && distance <= 0.55) {
    multiplier = 3;
    points = segment * 3;
  } else {
    points = segment;
  }

  return { segment, multiplier, points, x, y };
};

const DartsGameView: React.FC<{
  game: DartsGame;
  currentUserId: string;
  onThrow: (dart: DartThrow) => void;
  onEndTurn: () => void;
  turnDarts: DartThrow[];
}> = ({ game, currentUserId, onThrow, onEndTurn, turnDarts }) => {
  const isPlayer1 = game.player1_id === currentUserId;
  const isMyTurn = (game.current_turn === 'player1' && isPlayer1) ||
                   (game.current_turn === 'player2' && !isPlayer1);
  const myScore = isPlayer1 ? game.player1_score : game.player2_score;
  const opponentScore = isPlayer1 ? game.player2_score : game.player1_score;
  const myName = isPlayer1 ? game.player1_name : game.player2_name;
  const opponentName = isPlayer1 ? game.player2_name : game.player1_name;

  const turnTotal = turnDarts.reduce((sum, d) => sum + d.points, 0);
  const potentialScore = myScore - turnTotal;
  const isBust = potentialScore < 0 || potentialScore === 1;

  const handleThrow = (x: number, y: number) => {
    if (turnDarts.length >= 3) return;
    const dart = calculateDartScore(x, y);
    onThrow(dart);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scoreboard */}
      <div className="flex justify-between items-center p-3 bg-stone-900/50">
        <div className={`text-center px-3 py-2 rounded-lg ${isMyTurn ? 'bg-amber-600/30 border border-amber-500/50' : 'bg-stone-800/50'}`}>
          <p className="text-[10px] text-gray-400">{myName}</p>
          <p className="text-xl font-bold text-white">{myScore}</p>
        </div>

        <div className="text-center">
          <p className="text-amber-500 font-bold">501</p>
          {game.bet_amount > 0 && (
            <p className="text-green-400 text-xs">🪙 {Math.floor(game.bet_amount * 2 * (1 - HOUSE_CUT)).toLocaleString()}</p>
          )}
        </div>

        <div className={`text-center px-3 py-2 rounded-lg ${!isMyTurn ? 'bg-amber-600/30 border border-amber-500/50' : 'bg-stone-800/50'}`}>
          <p className="text-[10px] text-gray-400">{opponentName}</p>
          <p className="text-xl font-bold text-white">{opponentScore}</p>
        </div>
      </div>

      {/* Turn info */}
      <div className="p-2 bg-stone-800/30 text-center">
        <p className={`text-sm font-medium ${isMyTurn ? 'text-amber-400' : 'text-gray-500'}`}>
          {isMyTurn ? 'Your turn!' : `Waiting for ${opponentName}...`}
        </p>
        {turnDarts.length > 0 && (
          <div className="flex justify-center gap-2 mt-1">
            {turnDarts.map((d, i) => (
              <span key={i} className={`px-2 py-0.5 rounded text-xs font-bold ${
                d.points === 0 ? 'bg-red-900/50 text-red-400' :
                d.multiplier === 3 ? 'bg-green-800/50 text-green-300' :
                d.multiplier === 2 ? 'bg-blue-800/50 text-blue-300' :
                'bg-stone-700/50 text-white'
              }`}>
                {d.points === 0 ? 'MISS' :
                 d.multiplier === 3 ? `T${d.segment}` :
                 d.multiplier === 2 ? `D${d.segment}` :
                 d.points}
              </span>
            ))}
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-700/50 text-amber-300">
              = {turnTotal}
            </span>
          </div>
        )}
        {isBust && turnDarts.length > 0 && (
          <p className="text-red-500 text-sm font-bold mt-1 animate-pulse">BUST!</p>
        )}
      </div>

      {/* Dart board */}
      <div className="flex-1 flex items-center justify-center p-3">
        <DartBoard
          onThrow={handleThrow}
          thrownDarts={turnDarts}
          isMyTurn={isMyTurn}
          disabled={game.status !== 'active' || turnDarts.length >= 3}
        />
      </div>

      {/* End turn button */}
      {isMyTurn && turnDarts.length === 3 && (
        <div className="p-3 border-t border-stone-800">
          <button
            onClick={onEndTurn}
            className="w-full py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 transition-colors"
          >
            {isBust ? 'End Turn (Bust)' : `End Turn (${myScore} → ${potentialScore})`}
          </button>
        </div>
      )}
    </div>
  );
};

const DartsLobby: React.FC<{
  onStartGame: (bet: number, vsAI: boolean) => void;
}> = ({ onStartGame }) => {
  const [selectedBet, setSelectedBet] = useState(100);

  return (
    <div className="flex flex-col h-full p-3">
      <GlowingHeader text="DARTS ARENA" color="#ef4444" icon="🎯" />

      {/* Bet selection */}
      <div
        className="p-4 rounded-xl mb-4"
        style={{
          background: 'linear-gradient(180deg, rgba(127,29,29,0.3) 0%, rgba(28,25,23,0.9) 100%)',
          border: '1px solid rgba(239,68,68,0.3)',
        }}
      >
        <p className="text-amber-400 text-sm font-medium mb-3 text-center">Wager Gold Coins:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {BET_AMOUNTS.map(bet => (
            <button
              key={bet}
              onClick={() => setSelectedBet(bet)}
              className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                selectedBet === bet
                  ? 'bg-green-600 text-white scale-105'
                  : 'bg-stone-700/50 text-gray-300 hover:bg-stone-600/50'
              }`}
            >
              🪙 {bet.toLocaleString()}
            </button>
          ))}
        </div>
        <p className="text-center text-gray-500 text-xs mt-3">
          Winner takes 🪙 {Math.floor(selectedBet * 2 * (1 - HOUSE_CUT)).toLocaleString()}
        </p>
      </div>

      {/* Play buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => onStartGame(selectedBet, true)}
          className="py-4 bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg"
        >
          <span className="text-2xl block mb-1">🤖</span>
          <span className="text-sm">Play vs AI</span>
        </button>
        <button
          onClick={() => onStartGame(selectedBet, false)}
          className="py-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg"
        >
          <span className="text-2xl block mb-1">👥</span>
          <span className="text-sm">Challenge</span>
        </button>
      </div>

      {/* Rules */}
      <div className="p-3 bg-stone-900/30 rounded-lg border border-stone-800/50">
        <h4 className="text-amber-400 text-xs font-bold mb-2">501 RULES:</h4>
        <ul className="text-gray-400 text-xs space-y-1">
          <li>• Start at 501, subtract your score</li>
          <li>• 3 darts per turn</li>
          <li>• Must finish on exactly 0 with a double</li>
          <li>• Going below 0 or 1 = bust</li>
        </ul>
      </div>
    </div>
  );
};

const DartsTab: React.FC<{
  currentUserId: string;
  currentUsername: string;
  games: DartsGame[];
  onStartGame: (bet: number, vsAI: boolean) => void;
  onThrow: (dart: DartThrow) => void;
  onEndTurn: () => void;
  activeGame: DartsGame | null;
  turnDarts: DartThrow[];
}> = ({ currentUserId, onStartGame, onThrow, onEndTurn, activeGame, turnDarts }) => {
  if (activeGame && activeGame.status === 'active') {
    return (
      <DartsGameView
        game={activeGame}
        currentUserId={currentUserId}
        onThrow={onThrow}
        onEndTurn={onEndTurn}
        turnDarts={turnDarts}
      />
    );
  }

  return <DartsLobby onStartGame={onStartGame} />;
};

// =============================================================================
// PERSISTENT MUSIC PLAYER - Plays in background across all tabs!
// =============================================================================

interface MusicPlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number; // Track duration in seconds
  showQueue: boolean;
}

// =============================================================================
// ANIMATED EQUALIZER COMPONENT - Premium Casino Visualizer
// =============================================================================

const AnimatedEqualizer: React.FC<{ isPlaying: boolean; bars?: number; color?: string }> = ({
  isPlaying,
  bars = 5,
  color = CASINO_COLORS.neonGold
}) => {
  const [heights, setHeights] = useState<number[]>(Array(bars).fill(4));

  useEffect(() => {
    if (!isPlaying) {
      setHeights(Array(bars).fill(4));
      return;
    }

    const interval = setInterval(() => {
      setHeights(prev => prev.map(() => 4 + Math.random() * 16));
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, bars]);

  return (
    <div className="flex items-end gap-[2px] h-5">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-t transition-all duration-100"
          style={{
            height: `${h}px`,
            background: `linear-gradient(180deg, ${color} 0%, ${color}80 100%)`,
            boxShadow: isPlaying ? `0 0 4px ${color}` : 'none',
          }}
        />
      ))}
    </div>
  );
};

// =============================================================================
// ENHANCED MUSIC PLAYER BAR - Blueprint Casino Aesthetic
// =============================================================================

const MusicPlayerBar: React.FC<{
  playerState: MusicPlayerState;
  onPlayPause: () => void;
  onSkip: () => void;
  onPrevious: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleQueue: () => void;
  onRemoveFromQueue: (songId: number) => void;
  onClose: () => void;
}> = ({ playerState, onPlayPause, onSkip, onPrevious, onVolumeChange, onToggleQueue, onRemoveFromQueue, onClose }) => {
  const { currentSong, queue, isPlaying, volume, showQueue, progress, duration } = playerState;
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  if (!currentSong) return null;

  const genre = genreConfig[currentSong.genre] || { icon: '🎵', color: '#666', label: currentSong.genre };

  // Format time display
  const formatTimeDisplay = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = (progress / 100) * (duration || currentSong.duration_seconds || 0);
  const totalTime = duration || currentSong.duration_seconds || 0;

  return (
    <>
      {/* Queue Panel (slides up when toggled) - Blueprint Style */}
      {showQueue && (
        <div
          className="fixed bottom-24 left-0 right-0 mx-2 max-h-64 overflow-y-auto rounded-t-xl border border-b-0 z-40"
          style={{
            background: `linear-gradient(180deg, ${CASINO_COLORS.darkBg}f5 0%, #111118f5 100%)`,
            backdropFilter: 'blur(10px)',
            borderColor: `${CASINO_COLORS.neonCyan}40`,
            boxShadow: `0 -4px 20px ${CASINO_COLORS.neonCyan}20`,
          }}
        >
          <div
            className="sticky top-0 px-4 py-2 border-b flex items-center justify-between"
            style={{
              backgroundColor: `${CASINO_COLORS.darkBg}f0`,
              borderColor: `${CASINO_COLORS.neonCyan}30`,
            }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: CASINO_COLORS.neonCyan }}>📋</span>
              <span className="font-bold text-sm" style={{ color: CASINO_COLORS.neonCyan }}>Up Next ({queue.length})</span>
            </div>
            <button onClick={onToggleQueue} className="text-gray-400 hover:text-white text-lg">✕</button>
          </div>
          {queue.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              <span className="text-2xl block mb-2">🎵</span>
              Queue is empty. Add songs from the jukebox!
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {queue.map((song, idx) => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 p-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'rgba(34, 211, 210, 0.05)',
                    border: '1px solid rgba(34, 211, 210, 0.1)',
                  }}
                >
                  <span className="text-xs w-5" style={{ color: CASINO_COLORS.neonCyan }}>{idx + 1}</span>
                  <div className="w-8 h-8 rounded bg-stone-800 overflow-hidden flex-shrink-0">
                    {song.album_art ? (
                      <img src={song.album_art} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm">🎵</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{song.title}</p>
                    <p className="text-gray-400 text-xs truncate">{song.artist}</p>
                  </div>
                  <button
                    onClick={() => onRemoveFromQueue(song.id)}
                    className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Player Bar - Blueprint Casino Aesthetic */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: `linear-gradient(180deg, ${CASINO_COLORS.darkBg}f8 0%, #050508 100%)`,
          backdropFilter: 'blur(12px)',
          borderTop: `2px solid ${CASINO_COLORS.neonGold}60`,
          boxShadow: `0 -4px 30px rgba(251, 191, 36, 0.15), inset 0 1px 0 ${CASINO_COLORS.neonGold}20`,
        }}
      >
        {/* Blueprint Grid Pattern Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(${CASINO_COLORS.blueprintLine} 1px, transparent 1px),
              linear-gradient(90deg, ${CASINO_COLORS.blueprintLine} 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Progress Bar with Time Display */}
        <div className="relative">
          <div className="h-1.5 w-full bg-stone-800/80 relative">
            <div
              className="h-full transition-all duration-300 relative"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${CASINO_COLORS.neonGold} 0%, ${CASINO_COLORS.neonCyan} 100%)`,
                boxShadow: `0 0 10px ${CASINO_COLORS.neonGold}80`,
              }}
            >
              {/* Glowing orb at progress position */}
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                style={{
                  background: CASINO_COLORS.neonGold,
                  boxShadow: `0 0 8px ${CASINO_COLORS.neonGold}, 0 0 16px ${CASINO_COLORS.neonGold}`,
                }}
              />
            </div>
          </div>
          {/* Time Display */}
          <div className="absolute -top-5 left-0 right-0 flex justify-between px-3 text-[10px] font-mono">
            <span style={{ color: CASINO_COLORS.neonCyan }}>{formatTimeDisplay(currentTime)}</span>
            <span className="text-gray-500">{formatTimeDisplay(totalTime)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-3 relative">
          {/* Album Art with Neon Glow & Animated Equalizer Overlay */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
              style={{
                boxShadow: isPlaying
                  ? `0 0 20px ${CASINO_COLORS.neonGold}60, 0 0 40px ${CASINO_COLORS.neonGold}30`
                  : '0 4px 12px rgba(0,0,0,0.5)',
                border: `2px solid ${isPlaying ? CASINO_COLORS.neonGold : '#333'}`,
              }}
            >
              {currentSong.album_art ? (
                <img src={currentSong.album_art} alt={currentSong.title} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-2xl"
                  style={{ background: `linear-gradient(135deg, ${CASINO_COLORS.darkBg} 0%, #1a1a25 100%)` }}
                >
                  🎵
                </div>
              )}
              {/* Animated Equalizer Overlay on Album Art */}
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-1">
                  <AnimatedEqualizer isPlaying={isPlaying} bars={7} color={CASINO_COLORS.neonGold} />
                </div>
              )}
            </div>

            {/* Song Info with Genre Badge */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                {/* Glowing Genre Badge */}
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase"
                  style={{
                    backgroundColor: `${genre.color}30`,
                    color: genre.color,
                    boxShadow: `0 0 8px ${genre.color}40`,
                    border: `1px solid ${genre.color}50`,
                  }}
                >
                  {genre.label}
                </span>
                <span
                  className="text-[9px] font-bold tracking-wider animate-pulse"
                  style={{ color: CASINO_COLORS.neonGold }}
                >
                  ● NOW PLAYING
                </span>
              </div>
              <h4 className="text-white font-bold text-sm truncate" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {currentSong.title}
              </h4>
              <p className="text-gray-400 text-xs truncate">{currentSong.artist}</p>
            </div>
          </div>

          {/* Playback Controls - Neon Style */}
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevious}
              className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-110"
              style={{
                color: CASINO_COLORS.neonCyan,
                textShadow: `0 0 8px ${CASINO_COLORS.neonCyan}`,
              }}
              title="Previous"
            >
              ⏮
            </button>
            <button
              onClick={onPlayPause}
              className="w-14 h-14 flex items-center justify-center rounded-full text-xl transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${CASINO_COLORS.neonGold} 0%, #d97706 100%)`,
                boxShadow: `0 0 20px ${CASINO_COLORS.neonGold}80, 0 4px 15px rgba(0,0,0,0.3)`,
                color: CASINO_COLORS.darkBg,
              }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              onClick={onSkip}
              className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-110"
              style={{
                color: CASINO_COLORS.neonCyan,
                textShadow: `0 0 8px ${CASINO_COLORS.neonCyan}`,
              }}
              title="Skip"
            >
              ⏭
            </button>
          </div>

          {/* Volume & Queue Controls */}
          <div className="flex items-center gap-1">
            {/* Volume Control */}
            <div className="relative">
              <button
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                className="w-9 h-9 flex items-center justify-center transition-colors"
                style={{ color: showVolumeSlider ? CASINO_COLORS.neonCyan : '#9ca3af' }}
                title="Volume"
              >
                {volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}
              </button>
              {showVolumeSlider && (
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-lg shadow-xl"
                  style={{
                    backgroundColor: CASINO_COLORS.darkBg,
                    border: `1px solid ${CASINO_COLORS.neonCyan}40`,
                    boxShadow: `0 0 20px ${CASINO_COLORS.neonCyan}20`,
                  }}
                >
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                    className="w-24 h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(90deg, ${CASINO_COLORS.neonCyan} ${volume}%, #333 ${volume}%)`,
                    }}
                  />
                  <div className="text-center text-xs mt-1" style={{ color: CASINO_COLORS.neonCyan }}>{volume}%</div>
                </div>
              )}
            </div>

            {/* Queue Toggle */}
            <button
              onClick={onToggleQueue}
              className="w-9 h-9 flex items-center justify-center transition-colors"
              style={{ color: showQueue ? CASINO_COLORS.neonGold : '#9ca3af' }}
              title="Queue"
            >
              <span className="relative">
                📋
                {queue.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: CASINO_COLORS.neonCyan,
                      color: CASINO_COLORS.darkBg,
                      boxShadow: `0 0 6px ${CASINO_COLORS.neonCyan}`,
                    }}
                  >
                    {queue.length}
                  </span>
                )}
              </span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
              title="Stop Music"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// =============================================================================
// ROYALTY-FREE MUSIC LIBRARY - Curated tracks for ambient casino/bar atmosphere
// These are placeholder URLs - the app will generate ambient music via ElevenLabs
// or use the built-in audio URLs from the song database
// =============================================================================

const FALLBACK_AMBIENT_TRACKS: { [genre: string]: string[] } = {
  // Lofi/ambient tracks that work well for casino atmosphere
  rap: [
    // Southern hip-hop instrumentals - trap beats, 808s, dirty south bounce
  ],
  blues: [
    // Blues jazz instrumentals - using Pixabay/Uppbeat style royalty-free URLs
  ],
  rock: [
    // Classic rock instrumentals
  ],
  country: [
    // Country acoustic instrumentals
  ],
  classic_hits: [
    // Easy listening instrumentals
  ],
};

// HTML5 Audio Player Component - Replaces YouTube embed
const HTML5AudioPlayer: React.FC<{
  song: Song | null;
  isPlaying: boolean;
  volume: number;
  onEnded: () => void;
  onProgress: (progress: number) => void;
  onDurationChange: (duration: number) => void;
  workspaceId?: string;
}> = ({ song, isPlaying, volume, onEnded, onProgress, onDurationChange, workspaceId }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrls, setGeneratedUrls] = useState<Map<number, string>>(new Map());

  // Get workspace ID from window
  const wsId = workspaceId || (typeof window !== 'undefined' ? (window as any).__WORKSPACE_ID__ || (window as any).__SPACE_ID__ : null);

  // Generate ambient music for a song using ElevenLabs
  const generateAmbientMusic = useCallback(async (songData: Song): Promise<string | null> => {
    if (!wsId) {
      console.warn('No workspace ID available for music generation');
      return null;
    }

    // Check if we already generated this song
    const cached = generatedUrls.get(songData.id);
    if (cached) return cached;

    try {
      setIsGenerating(true);

      // Create a music prompt based on the song genre and style
      const genrePrompts: Record<string, string> = {
        rap: `southern hip-hop instrumental with heavy 808 bass, trap hi-hats, dirty south bounce beat, 85 BPM, club atmosphere`,
        country: `laid-back country acoustic guitar with gentle drums, honky-tonk bar atmosphere, 95 BPM, warm and nostalgic`,
        rock: `classic rock instrumental with electric guitar riffs, driving drums, arena rock energy, 120 BPM`,
        blues: `smooth blues jazz with electric guitar, walking bass line, piano chords, relaxed bar ambiance, 80 BPM`,
        classic_hits: `easy listening soft rock instrumental, melodic guitar, warm piano, nostalgic feel, 100 BPM`,
      };

      const prompt = genrePrompts[songData.genre] || `ambient lounge music, relaxed atmosphere, 90 BPM`;

      const response = await fetch(`/api/workspaces/${wsId}/demo-video/music/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${prompt}, instrumental background music for "${songData.title}" style`,
          lengthMs: (songData.duration_seconds || 180) * 1000,
          instrumental: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioUrl) {
          setGeneratedUrls(prev => new Map(prev).set(songData.id, data.audioUrl));
          return data.audioUrl;
        }
      }
    } catch (err) {
      console.error('Failed to generate music:', err);
    } finally {
      setIsGenerating(false);
    }
    return null;
  }, [wsId, generatedUrls]);

  // Resolve audio URL for current song
  useEffect(() => {
    const resolveAudioUrl = async () => {
      if (!song) {
        setAudioUrl(null);
        return;
      }

      // Priority 1: Use direct audio_url if available
      if (song.audio_url) {
        setAudioUrl(song.audio_url);
        return;
      }

      // Priority 2: Check if we already generated this song
      const cached = generatedUrls.get(song.id);
      if (cached) {
        setAudioUrl(cached);
        return;
      }

      // Priority 3: Generate ambient music via ElevenLabs
      const generated = await generateAmbientMusic(song);
      if (generated) {
        setAudioUrl(generated);
        return;
      }

      // Priority 4: Use a preset based on genre
      try {
        const presetMap: Record<string, string> = {
          rap: 'energetic',
          blues: 'lofi',
          rock: 'energetic',
          country: 'uplifting',
          classic_hits: 'calm',
        };
        const preset = presetMap[song.genre] || 'calm';

        if (wsId) {
          const response = await fetch(`/api/workspaces/${wsId}/demo-video/music/preset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              preset,
              lengthMs: (song.duration_seconds || 180) * 1000,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.audioUrl) {
              setGeneratedUrls(prev => new Map(prev).set(song.id, data.audioUrl));
              setAudioUrl(data.audioUrl);
              return;
            }
          }
        }
      } catch (err) {
        console.error('Failed to get preset music:', err);
      }

      // Fallback: No audio available
      setAudioUrl(null);
    };

    resolveAudioUrl();
  }, [song, generateAmbientMusic, generatedUrls, wsId]);

  // Create and manage audio element
  useEffect(() => {
    if (!audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    // Create new audio element
    const audio = new Audio(audioUrl);
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    // Set up event listeners
    const handleTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        const progress = (audio.currentTime / audio.duration) * 100;
        onProgress(progress);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        onDurationChange(audio.duration);
      }
    };

    const handleEnded = () => {
      onEnded();
    };

    const handleError = (e: Event) => {
      console.error('Audio playback error:', e);
      // Skip to next song on error
      onEnded();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audioRef.current = null;
    };
  }, [audioUrl, onProgress, onDurationChange, onEnded]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Auto-play was prevented:', err);
          // Retry with muted audio then unmute
          audio.muted = true;
          audio.play().then(() => {
            audio.muted = false;
          }).catch(() => {});
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, audioUrl]);

  // Handle volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume / 100));
    }
  }, [volume]);

  // Show loading indicator if generating
  if (isGenerating && song) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '90px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.9)',
          color: '#f59e0b',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid rgba(245,158,11,0.3)',
        }}
      >
        <div
          style={{
            width: '12px',
            height: '12px',
            border: '2px solid rgba(245,158,11,0.3)',
            borderTopColor: '#f59e0b',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        Generating music...
      </div>
    );
  }

  return null; // Audio plays in background, no visible element needed
};

// =============================================================================
// PREMIUM MODAL
// =============================================================================

const PremiumModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  isStripeConnected: boolean;
  loading?: boolean;
  subscriptionStatus: SubscriptionStatus;
}> = ({ isOpen, onClose, onSubscribe, isStripeConnected, loading, subscriptionStatus }) => {
  if (!isOpen) return null;

  const isPremium = ['active', 'trial', 'trialing'].includes(subscriptionStatus.status);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-stone-900 to-stone-950 rounded-2xl max-w-md w-full border-2 border-amber-600 shadow-2xl overflow-hidden">
        <div className="relative px-6 py-4 bg-gradient-to-r from-amber-900/60 to-stone-900 border-b border-amber-700/50">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
          <h2 className="text-xl font-bold text-amber-300">⭐ VIP Membership</h2>
          <p className="text-amber-500/70 text-sm">Unlimited perks at The Bar</p>
        </div>

        <div className="p-6">
          {isPremium ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-lg font-bold text-amber-300 mb-2">You are VIP!</h3>
              <p className="text-gray-400 text-sm">Enjoy unlimited plays and priority queue.</p>
            </div>
          ) : (
            <>
              <ul className="space-y-3 mb-6">
                {[
                  { icon: '🎵', text: 'Unlimited song requests' },
                  { icon: '⚡', text: 'Priority queue placement' },
                  { icon: '🪙', text: '500 bonus Gold Coins daily' },
                  { icon: '⭐', text: 'Exclusive premium tracks' },
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="text-xl">{feature.icon}</span>
                    <span className="text-gray-300 text-sm">{feature.text}</span>
                  </li>
                ))}
              </ul>

              {isStripeConnected ? (
                <button
                  onClick={onSubscribe}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : '⚡ Become VIP — 7 Day Trial'}
                </button>
              ) : (
                <div className="text-center py-4">
                  <span className="px-3 py-1 bg-stone-700 text-amber-400 text-sm rounded-full">🔜 Coming Soon</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function TheBar({ appConfig }: { appConfig?: any }) {
  // State
  const [activeTab, setActiveTab] = useState<BarTab>('jukebox');
  const [songs, setSongs] = useState<Song[]>([]);
  const [patrons, setPatrons] = useState<BarPatron[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [dartsGames, setDartsGames] = useState<DartsGame[]>([]);
  const [activeDartsGame, setActiveDartsGame] = useState<DartsGame | null>(null);
  const [turnDarts, setTurnDarts] = useState<DartThrow[]>([]);
  const [userVotes, setUserVotes] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  // Music Player State - persists across tabs!
  const [musicPlayer, setMusicPlayer] = useState<MusicPlayerState>({
    currentSong: null,
    queue: [],
    isPlaying: false,
    volume: 80,
    progress: 0,
    duration: 0,
    showQueue: false,
  });
  const [playHistory, setPlayHistory] = useState<Song[]>([]);

  // Premium subscription state
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({ status: 'loading' });
  const [isStripeConnected, setIsStripeConnected] = useState(false);
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [requestsUsedToday, setRequestsUsedToday] = useState(0);

  // User info
  const [currentUsername, setCurrentUsername] = useState('Guest');
  const [currentAvatar, setCurrentAvatar] = useState('🤠');
  const currentUserId = useMemo(() => {
    if (typeof window !== 'undefined') {
      return (window as any).__SESSION_ID__ || `guest_${Date.now()}`;
    }
    return `guest_${Date.now()}`;
  }, []);

  const db = (window as any).__workspaceDb;
  const useWorkspaceDB = (window as any).useWorkspaceDB;

  // Derived state
  const isPremium = ['active', 'trial', 'trialing'].includes(subscriptionStatus.status);
  const requestsRemaining = isPremium ? Infinity : Math.max(0, 5 - requestsUsedToday);

  // Ref to track user preference record ID for updates
  const userPrefIdRef = useRef<number | null>(null);
  const userPrefsLoadedRef = useRef(false);

  // Fetch data
  const { data: songsData, loading: songsLoading } = useWorkspaceDB('jukebox_songs', {
    shared: true,
    orderBy: { column: 'votes', direction: 'desc' },
    limit: 100
  });

  const { data: patronsData, refresh: refreshPatrons } = useWorkspaceDB('bar_patrons', {
    shared: true,
    limit: 50
  });

  const { data: messagesData, refresh: refreshMessages } = useWorkspaceDB('bar_chat_messages', {
    shared: true,
    orderBy: { column: 'created_at', direction: 'asc' },
    limit: 100
  });

  const { data: gamesData, refresh: refreshGames } = useWorkspaceDB('darts_games', {
    shared: true,
    filters: [{ column: 'status', operator: 'neq', value: 'finished' }],
    limit: 20
  });

  // Fetch user preferences from WorkspaceDB (per-session data)
  const { data: userPrefsData, refresh: refreshUserPrefs } = useWorkspaceDB('bar_user_preferences', {
    shared: false, // Per-session data
    limit: 1
  });

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const config = await stripePayments.loadConfig();
        setIsStripeConnected(config?.enabled === true);

        const spaceId = (window as any).__SPACE_ID__;
        const sessionKey = `space_session_${spaceId}`;
        const stored = localStorage.getItem(sessionKey);
        let email = '';

        if (stored) {
          try {
            const session = JSON.parse(stored);
            email = session.email || '';
          } catch (e) {}
        }

        if (email && spaceId) {
          const response = await fetch(
            `/api/space/${spaceId}/subscription-status?email=${encodeURIComponent(email)}`
          );

          if (response.ok) {
            const data = await response.json();
            setSubscriptionStatus({
              status: data.status || 'not_registered',
              trialDaysRemaining: data.trialDaysRemaining,
              planTier: data.planTier,
            });
          } else {
            setSubscriptionStatus({ status: 'not_registered' });
          }
        } else {
          setSubscriptionStatus({ status: 'not_registered' });
        }
      } catch (err) {
        setSubscriptionStatus({ status: 'not_registered' });
      }
    };

    checkSubscription();
  }, []);

  // ==========================================================================
  // LOAD USER PREFERENCES FROM WORKSPACEDB
  // Replaces localStorage for: jukebox_requests, bar_username, bar_avatar, jukebox_votes, audio_state
  // ==========================================================================

  useEffect(() => {
    if (userPrefsData && userPrefsData.length > 0 && !userPrefsLoadedRef.current) {
      userPrefsLoadedRef.current = true;
      const prefs = userPrefsData[0];
      userPrefIdRef.current = prefs.id;

      // Load username
      if (prefs.username) {
        setCurrentUsername(prefs.username);
      }

      // Load avatar
      if (prefs.avatar_emoji) {
        setCurrentAvatar(prefs.avatar_emoji);
      }

      // Load daily requests count (only if same day)
      const today = new Date().toDateString();
      if (prefs.requests_date === today && typeof prefs.requests_count === 'number') {
        setRequestsUsedToday(prefs.requests_count);
      }

      // Load voted song IDs
      if (prefs.voted_song_ids && Array.isArray(prefs.voted_song_ids)) {
        setUserVotes(new Set(prefs.voted_song_ids));
      }

      // Load audio state (if songs are also loaded)
      if (prefs.audio_state && songsData && songsData.length > 0) {
        const audioState = prefs.audio_state as PersistedAudioState;
        // Only restore if state is less than 1 hour old
        if (audioState.currentSongId && Date.now() - audioState.timestamp < 60 * 60 * 1000) {
          const currentSong = songsData.find((s: Song) => s.id === audioState.currentSongId);
          const queueSongs = (audioState.queue || [])
            .map((id: number) => songsData.find((s: Song) => s.id === id))
            .filter(Boolean) as Song[];

          if (currentSong) {
            setMusicPlayer({
              currentSong,
              queue: queueSongs,
              isPlaying: audioState.isPlaying,
              volume: audioState.volume,
              progress: 0,
              duration: currentSong.duration_seconds || 0,
              showQueue: false,
            });
            setPlayHistory([currentSong]);
          }
        }
      }
    }
  }, [userPrefsData, songsData]);

  // Initialize new user if no preferences exist
  useEffect(() => {
    const initNewUser = async () => {
      if (userPrefsData !== undefined && userPrefsData.length === 0 && !userPrefsLoadedRef.current && db) {
        userPrefsLoadedRef.current = true;
        const name = `Player${Math.floor(Math.random() * 9999)}`;
        const avatar = getRandomAvatar();

        setCurrentUsername(name);
        setCurrentAvatar(avatar);

        try {
          const result = await db.from('bar_user_preferences', { shared: false }).insert({
            username: name,
            avatar_emoji: avatar,
            requests_date: null,
            requests_count: 0,
            voted_song_ids: [],
            audio_state: null
          });
          if (result && result.id) {
            userPrefIdRef.current = result.id;
          }
          refreshUserPrefs?.();
        } catch (err) {
          console.error('Failed to create user preferences:', err);
        }
      }
    };

    initNewUser();
  }, [userPrefsData, db, refreshUserPrefs]);

  // ==========================================================================
  // PERSIST USER PREFERENCES TO WORKSPACEDB
  // ==========================================================================

  // Helper to update user preferences in DB
  const updateUserPrefs = useCallback(async (updates: Record<string, any>) => {
    if (!db || !userPrefIdRef.current) return;
    try {
      await db.from('bar_user_preferences', { shared: false }).update(userPrefIdRef.current, updates);
    } catch (err) {
      console.error('Failed to update user preferences:', err);
    }
  }, [db]);

  // Persist audio state whenever it changes
  useEffect(() => {
    if (!userPrefIdRef.current) return;

    const audioState: PersistedAudioState | null = musicPlayer.currentSong ? {
      currentSongId: musicPlayer.currentSong.id,
      queue: musicPlayer.queue.map(s => s.id),
      isPlaying: musicPlayer.isPlaying,
      volume: musicPlayer.volume,
      currentTime: (musicPlayer.progress / 100) * (musicPlayer.duration || 0),
      timestamp: Date.now(),
    } : null;

    updateUserPrefs({ audio_state: audioState });
  }, [musicPlayer.currentSong, musicPlayer.queue, musicPlayer.isPlaying, musicPlayer.volume, updateUserPrefs]);

  // Update state from DB
  useEffect(() => {
    if (songsData) {
      setSongs(songsData);
      setLoading(false);
    }
  }, [songsData]);

  useEffect(() => {
    if (patronsData) setPatrons(patronsData);
  }, [patronsData]);

  useEffect(() => {
    if (messagesData) setChatMessages(messagesData);
  }, [messagesData]);

  useEffect(() => {
    if (gamesData) {
      setDartsGames(gamesData);
      const myGame = gamesData.find((g: DartsGame) =>
        (g.player1_id === currentUserId || g.player2_id === currentUserId) && g.status === 'active'
      );
      if (myGame) setActiveDartsGame(myGame);
    }
  }, [gamesData, currentUserId]);

  // Polling for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshPatrons?.();
      refreshMessages?.();
      refreshGames?.();
    }, 3000);
    return () => clearInterval(interval);
  }, [refreshPatrons, refreshMessages, refreshGames]);

  // Now playing from our music player (not from database)
  const nowPlaying = musicPlayer.currentSong;

  // Handlers
  const handleSubscribe = useCallback(async () => {
    try {
      setSubscribeLoading(true);

      const spaceId = (window as any).__SPACE_ID__;
      const sessionKey = `space_session_${spaceId}`;
      const stored = localStorage.getItem(sessionKey);
      let email = '';

      if (stored) {
        try {
          const session = JSON.parse(stored);
          email = session.email || '';
        } catch (e) {}
      }

      const result = await stripePayments.createSubscription({
        priceCents: PREMIUM_PRICE_CENTS,
        trialDays: 7,
        customerEmail: email || undefined,
      });

      if (result.checkoutUrl) {
        stripePayments.redirectToCheckout(result.checkoutUrl);
      }
    } catch (err) {
      console.error('Subscribe failed:', err);
    } finally {
      setSubscribeLoading(false);
    }
  }, []);

  const handleVote = useCallback(async (songId: number) => {
    if (userVotes.has(songId)) return;

    const newVotes = new Set(userVotes);
    newVotes.add(songId);
    setUserVotes(newVotes);

    // Persist votes to WorkspaceDB
    updateUserPrefs({ voted_song_ids: [...newVotes] });

    setSongs(prev => prev.map(s => s.id === songId ? { ...s, votes: s.votes + 1 } : s));

    try {
      const song = songs.find(s => s.id === songId);
      if (song && db) {
        await db.from('jukebox_songs', { shared: true }).update(songId, { votes: song.votes + 1 });
      }
    } catch (err) {
      console.error('Vote failed:', err);
    }
  }, [userVotes, songs, db, updateUserPrefs]);

  // Play a song - adds to queue or plays immediately
  const handlePlay = useCallback((song: Song) => {
    if (!isPremium) {
      if (requestsUsedToday >= 5) {
        setShowPremiumModal(true);
        return;
      }
      const today = new Date().toDateString();
      const newCount = requestsUsedToday + 1;
      setRequestsUsedToday(newCount);

      // Persist requests count to WorkspaceDB
      updateUserPrefs({ requests_date: today, requests_count: newCount });
    }

    // If nothing is playing, start this song immediately
    if (!musicPlayer.currentSong) {
      setMusicPlayer(prev => ({
        ...prev,
        currentSong: song,
        isPlaying: true,
        progress: 0,
      }));
      setPlayHistory([song]);
    } else {
      // Add to queue
      setMusicPlayer(prev => ({
        ...prev,
        queue: [...prev.queue, song],
      }));
    }
  }, [isPremium, requestsUsedToday, musicPlayer.currentSong, updateUserPrefs]);

  // Music Player Controls
  const handlePlayPause = useCallback(() => {
    setMusicPlayer(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  }, []);

  const handleSkip = useCallback(() => {
    if (musicPlayer.queue.length > 0) {
      const [nextSong, ...restQueue] = musicPlayer.queue;
      setMusicPlayer(prev => ({
        ...prev,
        currentSong: nextSong,
        queue: restQueue,
        isPlaying: true,
        progress: 0,
      }));
      if (musicPlayer.currentSong) {
        setPlayHistory(prev => [...prev, musicPlayer.currentSong!]);
      }
    } else {
      // No more songs in queue, stop playing
      setMusicPlayer(prev => ({
        ...prev,
        currentSong: null,
        isPlaying: false,
        progress: 0,
      }));
    }
  }, [musicPlayer.queue, musicPlayer.currentSong]);

  const handlePrevious = useCallback(() => {
    if (playHistory.length > 1) {
      const prevSong = playHistory[playHistory.length - 2];
      setMusicPlayer(prev => ({
        ...prev,
        currentSong: prevSong,
        queue: prev.currentSong ? [prev.currentSong, ...prev.queue] : prev.queue,
        isPlaying: true,
        progress: 0,
      }));
      setPlayHistory(prev => prev.slice(0, -1));
    } else {
      // Restart current song
      setMusicPlayer(prev => ({
        ...prev,
        progress: 0,
      }));
    }
  }, [playHistory]);

  const handleVolumeChange = useCallback((vol: number) => {
    setMusicPlayer(prev => ({
      ...prev,
      volume: vol,
    }));
  }, []);

  const handleToggleQueue = useCallback(() => {
    setMusicPlayer(prev => ({
      ...prev,
      showQueue: !prev.showQueue,
    }));
  }, []);

  const handleRemoveFromQueue = useCallback((songId: number) => {
    setMusicPlayer(prev => ({
      ...prev,
      queue: prev.queue.filter(s => s.id !== songId),
    }));
  }, []);

  const handleClosePlayer = useCallback(() => {
    setMusicPlayer({
      currentSong: null,
      queue: [],
      isPlaying: false,
      volume: 80,
      progress: 0,
      duration: 0,
      showQueue: false,
    });
    setPlayHistory([]);
  }, []);

  const handleDurationChange = useCallback((duration: number) => {
    setMusicPlayer(prev => ({
      ...prev,
      duration,
    }));
  }, []);

  const handleSongEnded = useCallback(() => {
    handleSkip();
  }, [handleSkip]);

  const handleProgress = useCallback((progress: number) => {
    setMusicPlayer(prev => ({
      ...prev,
      progress,
    }));
  }, []);

  const handleSit = useCallback(async (position: number) => {
    try {
      const existingPatron = patrons.find(p => p.session_id === currentUserId);
      if (existingPatron) {
        await db.from('bar_patrons', { shared: true }).update(existingPatron.id, {
          seat_position: position,
          last_seen: new Date().toISOString()
        });
      } else {
        await db.from('bar_patrons', { shared: true }).insert({
          username: currentUsername,
          avatar_emoji: currentAvatar,
          status: 'at_bar',
          seat_position: position,
          session_id: currentUserId,
          last_seen: new Date().toISOString()
        });
      }
      refreshPatrons?.();
    } catch (err) {
      console.error('Failed to sit:', err);
    }
  }, [currentUserId, currentUsername, currentAvatar, patrons, db, refreshPatrons]);

  const handleSendMessage = useCallback(async (message: string) => {
    try {
      await db.from('bar_chat_messages', { shared: true }).insert({
        username: currentUsername,
        message,
        avatar_emoji: currentAvatar,
        message_type: 'chat'
      });
      refreshMessages?.();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }, [currentUsername, currentAvatar, db, refreshMessages]);

  const handleStartDartsGame = useCallback(async (bet: number, vsAI: boolean) => {
    try {
      const opponent = vsAI ? { id: 'ai', name: '🤖 AI' } : { id: null, name: 'Waiting...' };

      const newGame = {
        player1_id: currentUserId,
        player1_name: currentUsername,
        player2_id: opponent.id,
        player2_name: opponent.name,
        bet_amount: bet,
        player1_score: 501,
        player2_score: 501,
        current_turn: 'player1',
        status: vsAI ? 'active' : 'waiting',
      };

      await db.from('darts_games', { shared: true }).insert(newGame);
      refreshGames?.();

      await db.from('bar_chat_messages', { shared: true }).insert({
        username: 'System',
        message: `🎯 ${currentUsername} started a darts game (🪙 ${bet.toLocaleString()})!`,
        avatar_emoji: '🎯',
        message_type: 'darts_notification'
      });
      refreshMessages?.();
    } catch (err) {
      console.error('Failed to start game:', err);
    }
  }, [currentUserId, currentUsername, db, refreshGames, refreshMessages]);

  const handleDartThrow = useCallback((dart: DartThrow) => {
    if (turnDarts.length >= 3) return;
    setTurnDarts(prev => [...prev, dart]);
  }, [turnDarts]);

  const handleEndTurn = useCallback(async () => {
    if (!activeDartsGame) return;

    const isPlayer1 = activeDartsGame.player1_id === currentUserId;
    const currentScore = isPlayer1 ? activeDartsGame.player1_score : activeDartsGame.player2_score;
    const turnTotal = turnDarts.reduce((sum, d) => sum + d.points, 0);
    const newScore = currentScore - turnTotal;

    const isBust = newScore < 0 || newScore === 1;
    const finalScore = isBust ? currentScore : newScore;

    const lastDart = turnDarts[turnDarts.length - 1];
    const isWin = newScore === 0 && lastDart?.multiplier === 2;

    try {
      const updates: any = {
        current_turn: activeDartsGame.current_turn === 'player1' ? 'player2' : 'player1',
      };

      if (isPlayer1) {
        updates.player1_score = finalScore;
      } else {
        updates.player2_score = finalScore;
      }

      if (isWin) {
        updates.status = 'finished';
        updates.winner_id = currentUserId;
        updates.winner_payout = activeDartsGame.bet_amount * 2 * (1 - HOUSE_CUT);

        await db.from('bar_chat_messages', { shared: true }).insert({
          username: 'System',
          message: `🏆 ${currentUsername} won at darts! 🎯`,
          avatar_emoji: '🎯',
          message_type: 'darts_notification'
        });
      }

      await db.from('darts_games', { shared: true }).update(activeDartsGame.id, updates);

      // If vs AI and not won, simulate AI turn
      if (activeDartsGame.player2_id === 'ai' && !isWin) {
        setTimeout(async () => {
          await simulateAITurn(activeDartsGame, updates);
        }, 1500);
      }

      setTurnDarts([]);
      refreshGames?.();
      refreshMessages?.();
    } catch (err) {
      console.error('Failed to end turn:', err);
    }
  }, [activeDartsGame, currentUserId, currentUsername, turnDarts, db, refreshGames, refreshMessages]);

  const simulateAITurn = async (game: DartsGame, prevUpdates: any) => {
    const aiScore = prevUpdates.player2_score || game.player2_score;
    let totalThrown = 0;

    for (let i = 0; i < 3; i++) {
      const accuracy = 0.5 + Math.random() * 0.4;
      const x = (Math.random() - 0.5) * 0.5;
      const y = -0.5 + (Math.random() - 0.5) * 0.4;
      const dart = calculateDartScore(x * accuracy, y * accuracy);
      totalThrown += dart.points;
    }

    const newAIScore = aiScore - totalThrown;
    const aiBust = newAIScore < 0 || newAIScore === 1;
    const finalAIScore = aiBust ? aiScore : newAIScore;

    try {
      const aiUpdates: any = {
        player2_score: finalAIScore,
        current_turn: 'player1',
      };

      if (newAIScore === 0) {
        aiUpdates.status = 'finished';
        aiUpdates.winner_id = 'ai';
      }

      await db.from('darts_games', { shared: true }).update(game.id, aiUpdates);
      refreshGames?.();
    } catch (err) {
      console.error('AI turn failed:', err);
    }
  };

  const handlePinballScore = useCallback((score: number) => {
    // Could save high scores to DB here
  }, []);

  const handlePlinkoWin = useCallback((amount: number) => {
    // Could track wins in DB here
  }, []);

  // Loading state
  if (loading || songsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-amber-950/10 to-stone-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🍺</div>
          <p className="text-amber-400">Opening The Bar...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col relative"
      style={{
        backgroundColor: CASINO_COLORS.darkBg,
        backgroundImage: `
          linear-gradient(${CASINO_COLORS.blueprintLine} 1px, transparent 1px),
          linear-gradient(90deg, ${CASINO_COLORS.blueprintLine} 1px, transparent 1px),
          radial-gradient(ellipse at 50% 0%, rgba(251, 191, 36, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 100% 50%, rgba(34, 211, 210, 0.05) 0%, transparent 40%),
          radial-gradient(ellipse at 0% 50%, rgba(34, 211, 210, 0.05) 0%, transparent 40%)
        `,
        backgroundSize: '40px 40px, 40px 40px, 100% 100%, 100% 100%, 100% 100%',
      }}
    >
      <style>{`
        @keyframes equalizer {
          0% { height: 4px; }
          100% { height: 16px; }
        }
        @keyframes neon-flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.7; }
          94% { opacity: 1; }
          95% { opacity: 0.85; }
          96% { opacity: 1; }
        }
        @keyframes neon-pulse {
          0%, 100% { box-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 20px currentColor; }
          50% { box-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor; }
        }
        @keyframes scorePopup {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
          100% { transform: translate(-50%, -100%) scale(1.2); opacity: 0; }
        }
        @keyframes multiplierPop {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes sparkFly {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.3) translateY(-20px); }
        }
        @keyframes particleFly {
          0% { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0.5) translateY(-30px); }
        }
        @keyframes winPop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes dartLand {
          0% { transform: translate(-50%, -50%) scale(1.5); }
          50% { transform: translate(-50%, -50%) scale(0.9); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes scoreFloat {
          0% { transform: translateX(-50%) translateY(0); opacity: 1; }
          100% { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 5px ${CASINO_COLORS.neonGold}); }
          50% { filter: drop-shadow(0 0 15px ${CASINO_COLORS.neonGold}); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        /* Custom range input styling for volume */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          background: ${CASINO_COLORS.neonCyan};
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 8px ${CASINO_COLORS.neonCyan};
        }
        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: ${CASINO_COLORS.neonCyan};
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 8px ${CASINO_COLORS.neonCyan};
        }
      `}</style>

      <BarHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        nowPlaying={nowPlaying}
        subscriptionStatus={subscriptionStatus}
        onSubscriptionClick={() => setShowPremiumModal(true)}
      />

      <div className={`flex-1 overflow-hidden ${musicPlayer.currentSong ? 'pb-20' : ''}`}>
        {activeTab === 'jukebox' && (
          <JukeboxTab
            songs={songs}
            onVote={handleVote}
            onPlay={handlePlay}
            userVotes={userVotes}
            isPremium={isPremium}
            requestsRemaining={requestsRemaining}
            onSearch={() => {}}
            currentlyPlayingSongId={musicPlayer.currentSong?.id || null}
            queuedSongIds={musicPlayer.queue.map(s => s.id)}
          />
        )}

        {activeTab === 'hangout' && (
          <HangoutTab
            patrons={patrons}
            messages={chatMessages}
            currentUserId={currentUserId}
            currentUsername={currentUsername}
            onSit={handleSit}
            onSendMessage={handleSendMessage}
          />
        )}

        {activeTab === 'pinball' && (
          <PinballGame onScoreUpdate={handlePinballScore} />
        )}

        {activeTab === 'plinko' && (
          <PlinkoGame onWin={handlePlinkoWin} />
        )}

        {activeTab === 'darts' && (
          <DartsTab
            currentUserId={currentUserId}
            currentUsername={currentUsername}
            games={dartsGames}
            onStartGame={handleStartDartsGame}
            onThrow={handleDartThrow}
            onEndTurn={handleEndTurn}
            activeGame={activeDartsGame}
            turnDarts={turnDarts}
          />
        )}
      </div>

      {/* HTML5 Audio Player for background music - replaces YouTube embed */}
      <HTML5AudioPlayer
        song={musicPlayer.currentSong}
        isPlaying={musicPlayer.isPlaying}
        volume={musicPlayer.volume}
        onEnded={handleSongEnded}
        onProgress={handleProgress}
        onDurationChange={handleDurationChange}
      />

      {/* Persistent Music Player Bar */}
      <MusicPlayerBar
        playerState={musicPlayer}
        onPlayPause={handlePlayPause}
        onSkip={handleSkip}
        onPrevious={handlePrevious}
        onVolumeChange={handleVolumeChange}
        onToggleQueue={handleToggleQueue}
        onRemoveFromQueue={handleRemoveFromQueue}
        onClose={handleClosePlayer}
      />

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onSubscribe={handleSubscribe}
        isStripeConnected={isStripeConnected}
        loading={subscribeLoading}
        subscriptionStatus={subscriptionStatus}
      />

      {/* Footer Disclaimer - hidden when music player is active */}
      {!musicPlayer.currentSong && (
        <div className="px-3 py-1.5 bg-stone-950 border-t border-stone-800/50">
          <p className="text-center text-gray-600 text-[9px]">
            No purchase necessary. Gold Coins are for entertainment only. Sweeps Coins redeemable for prizes.
          </p>
        </div>
      )}
    </div>
  );
}
