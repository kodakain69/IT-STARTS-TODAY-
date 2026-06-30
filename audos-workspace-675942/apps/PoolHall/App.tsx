// PoolHall - FIRST-PERSON WALK-IN POOL HALL v12.0
// Immersive POV billiard lounge. Walk in, look down a hall of pool tables
// receding into depth under warm pendant lights, with a lounge bar to the side.
// Every classic feature preserved as a clickable hotspot / interactive object:
//   - Pool tables (solo practice + vs AI + 2-player) with full 8-ball physics
//   - Betting interface with chip animations + dual GC/SC economy
//   - Spectator seating (watch live matches, optional side bet)
//   - Cue stick customization (cue rack on the wall)
//   - Trophy case & leaderboard wall
//   - Hall chat room
import React, { useState, useEffect, useCallback, useRef } from 'https://esm.sh/react@18';

// ============================================================
// PALETTE & TYPES
// ============================================================

const FONT = '"Space Grotesk", system-ui, sans-serif';
const WOOD_DARK = '#1a1208';
const WOOD_MID = '#3d2820';
const FELT_GREEN = '#1a5f2a';
const FELT_DEEP = '#0d3d18';
const BRASS = '#D4AF37';
const BRASS_LIGHT = '#F5D67B';
const WARM = '#ffca72';
const GC_GOLD = '#F59E0B';
const SC_GREEN = '#10B981';

type Currency = 'GC' | 'SC';
type PanelId = 'table' | 'cue' | 'trophy' | 'spectator' | 'chat' | 'cashier' | null;

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  type: 'solid' | 'stripe' | 'cue' | 'eight';
  pocketed: boolean;
  number: number;
}

interface Player {
  id: string;
  name: string;
  type: 'solid' | 'stripe' | null;
  pocketedBalls: number[];
  isAI: boolean;
}

interface GameState {
  phase: 'betting' | 'break' | 'playing' | 'aiming' | 'shooting' | 'gameOver';
  currentPlayer: 0 | 1;
  players: [Player, Player];
  winner: number | null;
  foul: boolean;
  foulReason: string;
  ballInHand: boolean;
  gameStarted: boolean;
  mode: 'solo' | 'ai' | 'local';
}

// ============================================================
// PHYSICS CONSTANTS (preserved)
// ============================================================

const TABLE_WIDTH = 800;
const TABLE_HEIGHT = 400;
const BALL_RADIUS = 12;
const POCKET_RADIUS = 22;
const FRICTION = 0.985;
const MIN_VELOCITY = 0.1;
const MAX_POWER = 25;

const POCKETS = [
  { x: 20, y: 20 }, { x: TABLE_WIDTH / 2, y: 15 }, { x: TABLE_WIDTH - 20, y: 20 },
  { x: 20, y: TABLE_HEIGHT - 20 }, { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT - 15 }, { x: TABLE_WIDTH - 20, y: TABLE_HEIGHT - 20 },
];

const BALL_COLORS: Record<number, string> = {
  0: '#FFFFFF', 1: '#FFD700', 2: '#0066CC', 3: '#FF0000', 4: '#660099',
  5: '#FF6600', 6: '#006633', 7: '#8B0000', 8: '#000000', 9: '#FFD700',
  10: '#0066CC', 11: '#FF0000', 12: '#660099', 13: '#FF6600', 14: '#006633', 15: '#8B0000',
};

const BET_AMOUNTS = [50, 100, 250, 500, 1000];

// ============================================================
// CUE CUSTOMIZATION
// ============================================================

interface CueStyle {
  id: string;
  name: string;
  shaft: string; // CSS gradient for the cue body
  ring: string;  // accent color
}

const CUE_STYLES: CueStyle[] = [
  { id: 'classic', name: 'Classic Maple', shaft: 'linear-gradient(90deg, #2d1f0a 0%, #F5DEB3 10%, #DEB887 40%, #8B4513 100%)', ring: '#D4AF37' },
  { id: 'ebony', name: 'Ebony Royale', shaft: 'linear-gradient(90deg, #050505 0%, #2b2b2b 14%, #555 45%, #111 100%)', ring: '#D4AF37' },
  { id: 'jade', name: 'Jade Hustler', shaft: 'linear-gradient(90deg, #06251a 0%, #0f6b46 16%, #2fe39a 48%, #04140d 100%)', ring: '#2fe39a' },
  { id: 'crimson', name: 'Crimson Ace', shaft: 'linear-gradient(90deg, #1a0303 0%, #7a1414 16%, #ff5a5a 48%, #2a0606 100%)', ring: '#ff7878' },
  { id: 'sapphire', name: 'Sapphire Pro', shaft: 'linear-gradient(90deg, #03081a 0%, #1438a8 16%, #5aa0ff 48%, #04102a 100%)', ring: '#7ab4ff' },
  { id: 'gold', name: '24K Monarch', shaft: 'linear-gradient(90deg, #2b1d04 0%, #b8860b 14%, #ffe9a8 48%, #6b4a06 100%)', ring: '#ffe9a8' },
];

// ============================================================
// SEED DATA (chat / leaderboard / spectator matches)
// ============================================================

interface ChatMsg { id: string; user: string; text: string; color: string; }
const SEED_CHAT: ChatMsg[] = [
  { id: 'c1', user: 'SharkTank', text: 'rack em up, who wants action?', color: '#2fe39a' },
  { id: 'c2', user: 'CueQueen', text: 'just ran the table on #7 lol', color: '#ff7ab4' },
  { id: 'c3', user: 'EightOnBreak', text: 'table 12 felt is buttery tonight', color: '#7ab4ff' },
  { id: 'c4', user: 'BankShotBob', text: 'GL all, keep it clean', color: '#ffd24a' },
];

interface LeaderEntry { rank: number; name: string; wins: number; streak: number; }
const LEADERBOARD: LeaderEntry[] = [
  { rank: 1, name: 'ACE', wins: 50, streak: 9 },
  { rank: 2, name: 'SHARK', wins: 42, streak: 5 },
  { rank: 3, name: 'CueQueen', wins: 38, streak: 3 },
  { rank: 4, name: 'BankShotBob', wins: 31, streak: 2 },
  { rank: 5, name: 'EightOnBreak', wins: 27, streak: 4 },
];

interface TrophyItem { icon: string; title: string; detail: string; }
const TROPHIES: TrophyItem[] = [
  { icon: '🏆', title: 'House Champion', detail: 'Most table wins this season' },
  { icon: '🎯', title: 'Perfect Break', detail: 'Pocket on the break 10x' },
  { icon: '🔥', title: 'Hot Streak', detail: 'Win 5 in a row' },
  { icon: '🧊', title: 'Ice in Veins', detail: 'Win on the 8 with ball-in-hand' },
];

interface SpecMatch { id: string; a: string; b: string; pot: number; status: string; }
const SPEC_MATCHES: SpecMatch[] = [
  { id: 'm1', a: 'SharkTank', b: 'CueQueen', pot: 2000, status: 'Final rack' },
  { id: 'm2', a: 'EightOnBreak', b: 'BankShotBob', pot: 500, status: 'Mid game' },
  { id: 'm3', a: 'NeonNell', b: 'ChalkDust', pot: 1000, status: 'Breaking' },
];

// ============================================================
// PHYSICS UTILITIES (preserved)
// ============================================================

function getInitialBalls(): Ball[] {
  const balls: Ball[] = [];
  balls.push({ id: 0, x: TABLE_WIDTH * 0.25, y: TABLE_HEIGHT / 2, vx: 0, vy: 0, color: BALL_COLORS[0], type: 'cue', pocketed: false, number: 0 });
  const rackX = TABLE_WIDTH * 0.7;
  const rackY = TABLE_HEIGHT / 2;
  const spacing = BALL_RADIUS * 2.1;
  const rackOrder = [1, 9, 2, 10, 8, 11, 3, 12, 4, 13, 5, 6, 14, 7, 15];
  let ballIndex = 0;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col <= row; col++) {
      const num = rackOrder[ballIndex];
      const x = rackX + row * spacing * 0.866;
      const y = rackY + (col - row / 2) * spacing;
      balls.push({ id: num, x, y, vx: 0, vy: 0, color: BALL_COLORS[num], type: num === 8 ? 'eight' : num < 8 ? 'solid' : 'stripe', pocketed: false, number: num });
      ballIndex++;
    }
  }
  return balls;
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function checkBallCollision(ball1: Ball, ball2: Ball): boolean {
  return distance(ball1.x, ball1.y, ball2.x, ball2.y) < BALL_RADIUS * 2;
}

function resolveBallCollision(ball1: Ball, ball2: Ball): void {
  const dx = ball2.x - ball1.x;
  const dy = ball2.y - ball1.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return;
  const nx = dx / dist, ny = dy / dist;
  const dvx = ball1.vx - ball2.vx, dvy = ball1.vy - ball2.vy;
  const dvn = dvx * nx + dvy * ny;
  if (dvn < 0) return;
  ball1.vx -= dvn * nx; ball1.vy -= dvn * ny;
  ball2.vx += dvn * nx; ball2.vy += dvn * ny;
  const overlap = BALL_RADIUS * 2 - dist;
  if (overlap > 0) {
    ball1.x -= (overlap / 2) * nx; ball1.y -= (overlap / 2) * ny;
    ball2.x += (overlap / 2) * nx; ball2.y += (overlap / 2) * ny;
  }
}

function checkPocket(ball: Ball): boolean {
  for (const pocket of POCKETS) {
    if (distance(ball.x, ball.y, pocket.x, pocket.y) < POCKET_RADIUS) return true;
  }
  return false;
}

function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
  return `rgb(${r}, ${g}, ${b})`;
}

const formatCoins = (n: number) => Math.max(0, Math.floor(n)).toLocaleString();

// ============================================================
// REUSABLE: Modal shell
// ============================================================

function Modal({ title, accent, icon, onClose, children, maxWidth }: {
  title: string; accent: string; icon: string; onClose: () => void; children: React.ReactNode; maxWidth?: number;
}) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(4, 3, 1, 0.78)', backdropFilter: 'blur(8px)', padding: '16px',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: maxWidth || 460, maxHeight: '90vh', overflowY: 'auto',
        background: `linear-gradient(180deg, ${WOOD_DARK} 0%, #120c05 100%)`,
        border: `1px solid ${accent}55`, borderRadius: '18px',
        boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 60px ${accent}22`,
        fontFamily: FONT, animation: 'panelIn 0.28s ease-out',
      }}>
        <div style={{
          position: 'sticky', top: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 18px', background: 'rgba(18,12,5,0.92)', backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${accent}33`, borderRadius: '18px 18px 0 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>{icon}</span>
            <h2 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: accent, letterSpacing: '0.5px' }}>{title}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" style={{
            width: '40px', height: '40px', minWidth: '40px', borderRadius: '12px', cursor: 'pointer',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)', color: '#fff', fontSize: '18px',
          }}>✕</button>
        </div>
        <div style={{ padding: '18px' }}>{children}</div>
      </div>
    </div>
  );
}

function ComplianceLine() {
  return (
    <p style={{ fontSize: '10.5px', lineHeight: 1.5, color: 'rgba(255,255,255,0.45)', margin: '14px 0 0', textAlign: 'center' }}>
      Gold Coins are for entertainment only and have no cash value. Sweeps Coins may be redeemable for prizes.
      21+ • No purchase necessary • Play responsibly.
    </p>
  );
}

// ============================================================
// HOTSPOTS
// ============================================================

interface HotspotData { id: PanelId; left: number; top: number; icon: string; label: string; sub: string; color: string; }
const HOTSPOTS: HotspotData[] = [
  { id: 'table', left: 50, top: 60, icon: '🎱', label: 'Pool Table', sub: 'Solo · vs AI · 2P', color: BRASS },
  { id: 'cue', left: 12, top: 45, icon: '🎯', label: 'Cue Rack', sub: 'Customize cue', color: '#deb887' },
  { id: 'trophy', left: 84, top: 30, icon: '🏆', label: 'Trophy Wall', sub: 'Leaderboard', color: BRASS_LIGHT },
  { id: 'spectator', left: 86, top: 64, icon: '👀', label: 'Spectator Seats', sub: 'Watch live', color: '#7ab4ff' },
  { id: 'chat', left: 24, top: 70, icon: '💬', label: 'Hall Chat', sub: 'Talk trash', color: '#2fe39a' },
];

function Hotspot({ data, onOpen }: { data: HotspotData; onOpen: (id: PanelId) => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={() => onOpen(data.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'absolute', left: `${data.left}%`, top: `${data.top}%`, transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        background: 'transparent', border: 'none', cursor: 'pointer', pointerEvents: 'auto',
        fontFamily: FONT, transition: 'transform 0.18s ease', zIndex: 1,
      }}
    >
      <span style={{
        width: '56px', height: '56px', minWidth: '56px', borderRadius: '50%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '26px',
        background: `radial-gradient(circle at 40% 35%, ${data.color}33 0%, rgba(10,8,5,0.85) 70%)`,
        border: `2px solid ${data.color}`,
        boxShadow: hover ? `0 0 28px ${data.color}, 0 0 8px ${data.color}` : `0 0 14px ${data.color}88`,
        transform: hover ? 'scale(1.12)' : 'scale(1)', transition: 'all 0.18s ease',
        animation: 'hotPulse 2.6s ease-in-out infinite',
      }}>{data.icon}</span>
      <span style={{
        padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap',
        background: 'rgba(10,8,5,0.82)', border: `1px solid ${data.color}66`,
        fontSize: '12px', fontWeight: 700, color: data.color,
      }}>{data.label}</span>
      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>{data.sub}</span>
    </button>
  );
}

// ============================================================
// POOL TABLE GAME (full preserved 8-ball engine + betting)
// ============================================================

function PoolTableGame({ currency, goldCoins, sweepsCoins, setGoldCoins, setSweepsCoins, cue, notify }: {
  currency: Currency;
  goldCoins: number;
  sweepsCoins: number;
  setGoldCoins: React.Dispatch<React.SetStateAction<number>>;
  setSweepsCoins: React.Dispatch<React.SetStateAction<number>>;
  cue: CueStyle;
  notify: (msg: string) => void;
}) {
  const [betAmount, setBetAmount] = useState(100);
  const [balls, setBalls] = useState<Ball[]>(() => getInitialBalls());
  const [gameState, setGameState] = useState<GameState>({
    phase: 'betting', currentPlayer: 0,
    players: [
      { id: '1', name: 'You', type: null, pocketedBalls: [], isAI: false },
      { id: '2', name: 'AI Opponent', type: null, pocketedBalls: [], isAI: true },
    ],
    winner: null, foul: false, foulReason: '', ballInHand: false, gameStarted: false, mode: 'ai',
  });
  const [aimAngle, setAimAngle] = useState(0);
  const [power, setPower] = useState(50);
  const [isAnimating, setIsAnimating] = useState(false);
  const [chips, setChips] = useState<{ id: number; left: number; delay: number }[]>([]);

  const animationRef = useRef<number | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const usingSweeps = currency === 'SC';
  const currentBalance = usingSweeps ? sweepsCoins : goldCoins;
  const currencyLabel = currency;
  const currencyColor = usingSweeps ? SC_GREEN : GC_GOLD;
  const potAmount = betAmount * 2;

  // Physics loop (preserved)
  const updatePhysics = useCallback(() => {
    setBalls(prevBalls => {
      let anyMoving = false;
      const newBalls = prevBalls.map(ball => {
        if (ball.pocketed) return ball;
        let { x, y, vx, vy } = ball;
        x += vx; y += vy;
        vx *= FRICTION; vy *= FRICTION;
        if (Math.abs(vx) < MIN_VELOCITY && Math.abs(vy) < MIN_VELOCITY) { vx = 0; vy = 0; }
        else { anyMoving = true; }
        const cushion = 25;
        if (x < cushion + BALL_RADIUS) { x = cushion + BALL_RADIUS; vx = -vx * 0.8; }
        if (x > TABLE_WIDTH - cushion - BALL_RADIUS) { x = TABLE_WIDTH - cushion - BALL_RADIUS; vx = -vx * 0.8; }
        if (y < cushion + BALL_RADIUS) { y = cushion + BALL_RADIUS; vy = -vy * 0.8; }
        if (y > TABLE_HEIGHT - cushion - BALL_RADIUS) { y = TABLE_HEIGHT - cushion - BALL_RADIUS; vy = -vy * 0.8; }
        return { ...ball, x, y, vx, vy };
      });
      for (let i = 0; i < newBalls.length; i++) {
        for (let j = i + 1; j < newBalls.length; j++) {
          if (!newBalls[i].pocketed && !newBalls[j].pocketed && checkBallCollision(newBalls[i], newBalls[j])) {
            resolveBallCollision(newBalls[i], newBalls[j]);
            anyMoving = true;
          }
        }
      }
      const pocketedThisTurn: number[] = [];
      newBalls.forEach(ball => {
        if (!ball.pocketed && checkPocket(ball)) { ball.pocketed = true; pocketedThisTurn.push(ball.number); }
      });
      if (pocketedThisTurn.length > 0) handlePocketedBalls(pocketedThisTurn);
      if (!anyMoving && isAnimating) { setIsAnimating(false); handleTurnEnd(); }
      return newBalls;
    });
    if (isAnimating) animationRef.current = requestAnimationFrame(updatePhysics);
  }, [isAnimating]);

  useEffect(() => {
    if (isAnimating) animationRef.current = requestAnimationFrame(updatePhysics);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isAnimating, updatePhysics]);

  const handlePocketedBalls = (pocketed: number[]) => {
    setGameState(prev => {
      const newState = { ...prev };
      const currentPlayer = prev.players[prev.currentPlayer];
      pocketed.forEach(ballNum => {
        if (ballNum === 0) { newState.foul = true; newState.foulReason = 'Cue ball pocketed!'; newState.ballInHand = true; }
        else if (ballNum === 8) {
          const remaining = balls.filter(b => b.type === currentPlayer.type && !b.pocketed);
          newState.winner = remaining.length > 0 || currentPlayer.type === null ? (prev.currentPlayer === 0 ? 1 : 0) : prev.currentPlayer;
          newState.phase = 'gameOver';
        } else {
          const ballType = ballNum < 8 ? 'solid' : 'stripe';
          if (currentPlayer.type === null && prev.phase !== 'break') {
            newState.players[prev.currentPlayer].type = ballType;
            newState.players[prev.currentPlayer === 0 ? 1 : 0].type = ballType === 'solid' ? 'stripe' : 'solid';
          }
          if (currentPlayer.type === null || currentPlayer.type === ballType) {
            newState.players[prev.currentPlayer].pocketedBalls.push(ballNum);
          } else { newState.foul = true; newState.foulReason = `Pocketed opponent's ball!`; }
        }
      });
      return newState;
    });
  };

  const handleTurnEnd = () => {
    setGameState(prev => {
      if (prev.phase === 'gameOver') return prev;
      const newState = { ...prev };
      const continueTurn = prev.players[prev.currentPlayer].pocketedBalls.length > 0 && !prev.foul;
      // In solo mode there is only one player; never switch turns.
      if (!continueTurn && prev.mode !== 'solo') { newState.currentPlayer = prev.currentPlayer === 0 ? 1 : 0; newState.foul = false; newState.foulReason = ''; }
      else if (!continueTurn) { newState.foul = false; newState.foulReason = ''; }
      const cueBall = balls.find(b => b.number === 0);
      if (cueBall?.pocketed) {
        setBalls(prevB => prevB.map(b => b.number === 0 ? { ...b, x: TABLE_WIDTH * 0.25, y: TABLE_HEIGHT / 2, pocketed: false, vx: 0, vy: 0 } : b));
      }
      newState.phase = 'aiming';
      if (newState.players[newState.currentPlayer].isAI && newState.phase !== 'gameOver') setTimeout(() => takeAIShot(), 1500);
      return newState;
    });
  };

  const takeShot = () => {
    if (isAnimating || gameState.phase === 'gameOver') return;
    const cueBall = balls.find(b => b.number === 0 && !b.pocketed);
    if (!cueBall) return;
    const powerMultiplier = power / 100 * MAX_POWER;
    setBalls(prev => prev.map(b => b.number === 0 ? { ...b, vx: Math.cos(aimAngle) * powerMultiplier, vy: Math.sin(aimAngle) * powerMultiplier } : b));
    setIsAnimating(true);
    setGameState(prev => ({ ...prev, phase: 'shooting' }));
  };

  const takeAIShot = () => {
    if (gameState.phase === 'gameOver') return;
    const cueBall = balls.find(b => b.number === 0 && !b.pocketed);
    if (!cueBall) return;
    const targetBalls = balls.filter(b => {
      if (b.pocketed || b.number === 0) return false;
      const playerType = gameState.players[gameState.currentPlayer].type;
      if (playerType === null) return b.number !== 8;
      if (playerType === 'solid') return b.number < 8;
      if (playerType === 'stripe') return b.number > 8;
      return false;
    });
    if (targetBalls.length === 0) {
      const eightBall = balls.find(b => b.number === 8 && !b.pocketed);
      if (eightBall) {
        setAimAngle(Math.atan2(eightBall.y - cueBall.y, eightBall.x - cueBall.x));
        setPower(60 + Math.random() * 30);
        setTimeout(takeShot, 500);
      }
      return;
    }
    const target = targetBalls[Math.floor(Math.random() * targetBalls.length)];
    setAimAngle(Math.atan2(target.y - cueBall.y, target.x - cueBall.x) + (Math.random() - 0.5) * 0.2);
    setPower(50 + Math.random() * 40);
    setTimeout(takeShot, 500);
  };

  const fireChips = () => {
    const burst = Array.from({ length: 7 }).map((_, i) => ({ id: Date.now() + i, left: 30 + Math.random() * 40, delay: Math.random() * 0.25 }));
    setChips(burst);
    setTimeout(() => setChips([]), 1100);
  };

  const startGame = (mode: 'solo' | 'ai' | 'local') => {
    const cost = mode === 'solo' ? 0 : betAmount;
    if (cost > 0) {
      if (currentBalance < cost) { notify(`Not enough ${usingSweeps ? 'Sweeps Coins' : 'Gold Coins'}`); return; }
      if (usingSweeps) setSweepsCoins(prev => prev - cost);
      else setGoldCoins(prev => prev - cost);
      fireChips();
    }
    setBalls(getInitialBalls());
    setGameState({
      phase: 'aiming', currentPlayer: 0,
      players: [
        { id: '1', name: 'You', type: null, pocketedBalls: [], isAI: false },
        { id: '2', name: mode === 'solo' ? 'Practice' : mode === 'ai' ? 'AI Opponent' : 'Player 2', type: null, pocketedBalls: [], isAI: mode === 'ai' },
      ],
      winner: null, foul: false, foulReason: '', ballInHand: false, gameStarted: true, mode,
    });
  };

  const handleAimMove = (e: React.MouseEvent) => {
    if (!tableRef.current || isAnimating || gameState.phase !== 'aiming') return;
    if (gameState.players[gameState.currentPlayer].isAI) return;
    const rect = tableRef.current.getBoundingClientRect();
    const scaleX = TABLE_WIDTH / rect.width, scaleY = TABLE_HEIGHT / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX, mouseY = (e.clientY - rect.top) * scaleY;
    const cueBall = balls.find(b => b.number === 0 && !b.pocketed);
    if (cueBall) setAimAngle(Math.atan2(mouseY - cueBall.y, mouseX - cueBall.x) + Math.PI);
  };

  const getTrajectoryPoints = () => {
    const cueBall = balls.find(b => b.number === 0 && !b.pocketed);
    if (!cueBall) return [];
    const points: { x: number; y: number }[] = [];
    const lineLength = 150 * (power / 100);
    for (let i = 0; i < 20; i++) {
      const t = i / 19;
      points.push({ x: cueBall.x + Math.cos(aimAngle) * lineLength * t, y: cueBall.y + Math.sin(aimAngle) * lineLength * t });
    }
    return points;
  };

  const renderBall = (ball: Ball) => {
    if (ball.pocketed) return null;
    const isStripe = ball.type === 'stripe', isCue = ball.type === 'cue', isEight = ball.type === 'eight';
    // Secondary fill-light: soft reflected bounce off the green felt on the lower-right,
    // so balls aren't lit by the single top-left hotspot alone. Layered ABOVE the base shading.
    const fillLight = `radial-gradient(circle at 72% 80%, rgba(150,214,166,0.22) 0%, rgba(150,214,166,0.08) 22%, rgba(150,214,166,0) 44%)`;
    return (
      <div key={ball.id} style={{
        position: 'absolute', left: ball.x - BALL_RADIUS, top: ball.y - BALL_RADIUS,
        width: BALL_RADIUS * 2, height: BALL_RADIUS * 2, borderRadius: '50%',
        background: isCue ? `radial-gradient(circle at 30% 28%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 18%), ${fillLight}, radial-gradient(circle at 35% 35%, #fff 0%, #ececec 35%, #cfcfcf 72%, #9a9a9a 100%)`
          : isEight ? `radial-gradient(circle at 30% 28%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 16%), ${fillLight}, radial-gradient(circle at 38% 38%, #3a3a3a 0%, #181818 55%, #000 100%)`
          : isStripe ? `radial-gradient(circle at 30% 28%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 16%), ${fillLight}, radial-gradient(circle at 35% 35%, #fff 0%, #f4f4f4 24%, ${ball.color} 26%, ${ball.color} 74%, #f4f4f4 75%, #fff 100%)`
          : `radial-gradient(circle at 30% 28%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 17%), ${fillLight}, radial-gradient(circle at 36% 36%, ${adjustColor(ball.color, 75)} 0%, ${ball.color} 52%, ${adjustColor(ball.color, -50)} 100%)`,
        boxShadow: `inset -3px -4px 9px rgba(0,0,0,0.5), inset 2px 2px 6px rgba(255,255,255,0.45), 0 5px 9px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.4)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10px', fontWeight: 'bold', color: isEight || [2, 4, 6, 10, 12, 14].includes(ball.number) ? '#fff' : '#000',
        zIndex: 10,
      }}>
        {!isCue && <span style={{ background: isStripe ? 'transparent' : '#fff', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}>{ball.number}</span>}
      </div>
    );
  };

  // ---- BETTING / SETUP PHASE ----
  if (gameState.phase === 'betting') {
    return (
      <div style={{ position: 'relative' }}>
        {chips.map(c => (
          <div key={c.id} style={{
            position: 'absolute', left: `${c.left}%`, top: '40%', width: '22px', height: '22px', borderRadius: '50%',
            background: `radial-gradient(circle at 35% 30%, ${currencyColor} 0%, ${adjustColor(currencyColor, -50)} 100%)`,
            border: '2px dashed rgba(255,255,255,0.7)', zIndex: 20, pointerEvents: 'none',
            animation: `chipToss 1s ease-out ${c.delay}s forwards`,
          }} />
        ))}
        <p style={{ margin: '0 0 14px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', textAlign: 'center' }}>
          Choose a stake and your game. Practice solo for free, or play for the pot.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {BET_AMOUNTS.map(amount => (
            <button key={amount} onClick={() => setBetAmount(amount)} disabled={amount > currentBalance} style={{
              padding: '12px 16px', minWidth: '70px', minHeight: '44px',
              background: betAmount === amount ? `linear-gradient(135deg, ${currencyColor} 0%, ${adjustColor(currencyColor, -30)} 100%)` : 'rgba(255,255,255,0.05)',
              border: `2px solid ${betAmount === amount ? currencyColor : 'rgba(255,255,255,0.2)'}`,
              borderRadius: '10px', color: betAmount === amount ? '#000' : '#fff',
              fontWeight: 700, fontSize: '15px', cursor: amount > currentBalance ? 'not-allowed' : 'pointer',
              opacity: amount > currentBalance ? 0.4 : 1, fontFamily: FONT,
            }}>{formatCoins(amount)}</button>
          ))}
        </div>

        <div style={{ textAlign: 'center', padding: '14px', background: `${BRASS}1a`, borderRadius: '12px', border: `1px solid ${BRASS}55`, marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>PRIZE POT</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: currencyColor, textShadow: `0 0 15px ${currencyColor}` }}>
            {formatCoins(potAmount)} {currencyLabel}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <button onClick={() => startGame('solo')} style={modeBtn('rgba(123,180,255,0.25)', '#7ab4ff')}>
            <div style={{ fontSize: '26px' }}>🧘</div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>Solo</div>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>Free practice</div>
          </button>
          <button onClick={() => startGame('ai')} style={modeBtn(`${BRASS}40`, BRASS)}>
            <div style={{ fontSize: '26px' }}>🤖</div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>vs AI</div>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>For the pot</div>
          </button>
          <button onClick={() => startGame('local')} style={modeBtn('rgba(16,185,129,0.3)', SC_GREEN)}>
            <div style={{ fontSize: '26px' }}>👥</div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>2 Player</div>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>Pass & play</div>
          </button>
        </div>
        <ComplianceLine />
      </div>
    );
  }

  // ---- ACTIVE GAME ----
  const me = gameState.players[gameState.currentPlayer];
  return (
    <div>
      {/* Player / pot bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '8px' }}>
        <div style={{
          flex: 1, padding: '8px 12px', borderRadius: '10px',
          background: gameState.currentPlayer === 0 ? `linear-gradient(135deg, ${BRASS}55 0%, rgba(139,105,20,0.4) 100%)` : 'rgba(26,18,8,0.6)',
          border: `2px solid ${gameState.currentPlayer === 0 ? BRASS : 'rgba(255,255,255,0.2)'}`,
        }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#fff' }}>{gameState.players[0].name}</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>{gameState.players[0].type === 'solid' ? 'Solids' : gameState.players[0].type === 'stripe' ? 'Stripes' : '—'}</div>
        </div>
        {gameState.mode !== 'solo' && (
          <div style={{ padding: '8px 14px', background: `${BRASS}33`, border: `2px solid ${BRASS}88`, borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)' }}>POT</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: BRASS }}>{formatCoins(potAmount)} {currencyLabel}</div>
          </div>
        )}
        {gameState.mode !== 'solo' && (
          <div style={{
            flex: 1, padding: '8px 12px', textAlign: 'right', borderRadius: '10px',
            background: gameState.currentPlayer === 1 ? 'linear-gradient(135deg, rgba(255,100,100,0.4) 0%, rgba(200,50,50,0.4) 100%)' : 'rgba(26,18,8,0.6)',
            border: `2px solid ${gameState.currentPlayer === 1 ? '#f66' : 'rgba(255,255,255,0.2)'}`,
          }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#fff' }}>{gameState.players[1].name}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>{gameState.players[1].type === 'solid' ? 'Solids' : gameState.players[1].type === 'stripe' ? 'Stripes' : '—'}</div>
          </div>
        )}
        {gameState.mode === 'solo' && (
          <div style={{ flex: 1, textAlign: 'right', fontSize: '12px', color: '#7ab4ff', fontWeight: 700 }}>Practice Mode</div>
        )}
      </div>

      {/* Table */}
      <div style={{
        background: 'linear-gradient(160deg, #6d4c34 0%, #4e342e 45%, #3a241c 75%, #4a2f23 100%)',
        padding: '16px', borderRadius: '14px', border: `3px solid ${BRASS}`,
        boxShadow: '0 28px 70px rgba(0,0,0,0.78), inset 0 2px 3px rgba(255,255,255,0.18), inset 0 -4px 10px rgba(0,0,0,0.55)',
      }}>
        <div
          ref={tableRef}
          onMouseMove={handleAimMove}
          onClick={() => { if (gameState.phase === 'aiming' && !gameState.players[gameState.currentPlayer].isAI) takeShot(); }}
          style={{
            width: '100%', aspectRatio: `${TABLE_WIDTH} / ${TABLE_HEIGHT}`, maxWidth: `${TABLE_WIDTH}px`, margin: '0 auto',
            background: `radial-gradient(ellipse 60% 46% at 50% 40%, rgba(255,244,214,0.18) 0%, rgba(255,238,196,0.07) 36%, rgba(255,238,196,0) 66%), radial-gradient(ellipse at 50% 42%, rgba(46,120,60,0.55) 0%, rgba(0,0,0,0) 60%), radial-gradient(ellipse 92% 88% at 50% 50%, rgba(0,0,0,0) 52%, rgba(18,52,70,0.20) 82%, rgba(8,28,40,0.34) 100%), repeating-linear-gradient(45deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 3px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.045) 0px, rgba(0,0,0,0.045) 1px, transparent 1px, transparent 3px), linear-gradient(135deg, ${FELT_GREEN} 0%, ${FELT_DEEP} 100%)`,
            borderRadius: '6px', position: 'relative', boxShadow: 'inset 0 0 50px rgba(0,0,0,0.6), inset 0 0 18px rgba(0,0,0,0.4)',
            cursor: gameState.phase === 'aiming' && !gameState.players[gameState.currentPlayer].isAI ? 'crosshair' : 'default',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, border: '20px solid #2d4a1c', borderRadius: '10px', pointerEvents: 'none',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.5), inset 6px 6px 14px rgba(0,0,0,0.55), inset -4px -4px 10px rgba(255,255,255,0.06)' }} />
          {/* Recessed playing well: rounded inner cushion corners + thin padded highlight bead where rail meets felt */}
          <div style={{ position: 'absolute', inset: '20px', borderRadius: '12px', pointerEvents: 'none',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.16), inset 0 0 0 1px rgba(20,52,28,0.85), inset 0 8px 16px rgba(0,0,0,0.45), inset 0 -3px 8px rgba(0,0,0,0.4)' }} />
          {/* LV-style monogram felt */}
          <div style={{ position: 'absolute', inset: '20px', opacity: 0.07, pointerEvents: 'none', overflow: 'hidden', borderRadius: '4px',
            backgroundImage: `radial-gradient(circle at 25% 25%, ${BRASS} 2px, transparent 3px), radial-gradient(circle at 75% 75%, ${BRASS} 2px, transparent 3px)`,
            backgroundSize: '48px 48px' }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            fontSize: '34px', fontWeight: 800, fontFamily: 'Georgia, serif',
            color: `${BRASS}1a`, letterSpacing: '6px', pointerEvents: 'none',
          }}>DF</div>

          {POCKETS.map((pocket, i) => (
            // Recessed pocket: rounded leather rim around a dark well that reads as a hole the ball drops into.
            <div key={i} style={{
              position: 'absolute', left: `${(pocket.x / TABLE_WIDTH) * 100}%`, top: `${(pocket.y / TABLE_HEIGHT) * 100}%`,
              transform: 'translate(-50%, -50%)', width: `${POCKET_RADIUS * 2.5}px`, height: `${POCKET_RADIUS * 2.5}px`,
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              // leather/rounded rim
              background: 'radial-gradient(circle at 38% 32%, #4a3220 0%, #2c1d12 46%, #160d07 100%)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.6), inset 0 1px 1px rgba(212,175,55,0.30), inset 0 -2px 4px rgba(0,0,0,0.7)',
              border: `1px solid ${BRASS}55`, pointerEvents: 'none',
            }}>
              {/* dark well with inner radial shadow — deepest at center so the ball appears to drop in */}
              <div style={{
                width: `${POCKET_RADIUS * 1.9}px`, height: `${POCKET_RADIUS * 1.9}px`, borderRadius: '50%',
                background: 'radial-gradient(circle at 50% 44%, #000 0%, #000 34%, #0c0c0c 64%, #20160c 100%)',
                boxShadow: 'inset 0 5px 12px rgba(0,0,0,0.95), inset 0 -2px 5px rgba(80,55,30,0.35)',
              }} />
            </div>
          ))}

          <div style={{
            position: 'absolute', inset: 0,
            transform: `scale(${tableRef.current ? tableRef.current.clientWidth / TABLE_WIDTH : 1})`, transformOrigin: 'top left',
          }}>
            {balls.map(ball => renderBall(ball))}
            {gameState.phase === 'aiming' && !isAnimating && !gameState.players[gameState.currentPlayer].isAI && (
              <>
                {getTrajectoryPoints().map((point, i) => (
                  <div key={i} style={{
                    position: 'absolute', left: point.x - 2, top: point.y - 2, width: '4px', height: '4px',
                    background: `rgba(212, 175, 55, ${1 - i * 0.05})`, borderRadius: '50%', boxShadow: '0 0 6px rgba(212,175,55,0.8)',
                  }} />
                ))}
                {(() => {
                  const cueBall = balls.find(b => b.number === 0 && !b.pocketed);
                  if (!cueBall) return null;
                  const offset = BALL_RADIUS + 10 + (power / 100) * 25;
                  return (
                    <div style={{
                      position: 'absolute', left: cueBall.x, top: cueBall.y, width: '150px', height: '8px',
                      background: cue.shaft, borderRadius: '4px', border: `1px solid ${cue.ring}55`,
                      transform: `rotate(${aimAngle * (180 / Math.PI) + 180}deg) translateX(${offset}px)`,
                      transformOrigin: 'left center', boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    }}>
                      <div style={{ position: 'absolute', left: '25px', top: 0, bottom: 0, width: '3px', background: cue.ring, borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', left: '60px', top: 0, bottom: 0, width: '3px', background: cue.ring, borderRadius: '2px' }} />
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      {gameState.phase === 'aiming' && !gameState.players[gameState.currentPlayer].isAI && (
        <div style={{ marginTop: '14px', padding: '14px', background: 'rgba(26,18,8,0.6)', borderRadius: '12px', border: `1px solid ${BRASS}55` }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '13px', color: '#fff' }}>POWER</span>
              <span style={{ color: power > 80 ? '#FF4444' : power > 50 ? BRASS : '#4CAF50', fontWeight: 700, fontSize: '13px' }}>{power}%</span>
            </div>
            <input type="range" min="10" max="100" value={power} onChange={(e) => setPower(Number(e.target.value))} style={{
              width: '100%', height: '16px', appearance: 'none',
              background: 'linear-gradient(90deg, #4CAF50 0%, #D4AF37 50%, #FF4444 100%)', borderRadius: '8px', cursor: 'pointer',
            }} />
          </div>
          <button onClick={takeShot} style={{
            width: '100%', padding: '14px', minHeight: '48px', background: `linear-gradient(135deg, ${BRASS} 0%, #B8860B 100%)`,
            border: 'none', borderRadius: '10px', color: '#000', fontSize: '18px', fontWeight: 800, cursor: 'pointer',
            boxShadow: `0 4px 15px ${BRASS}66`, fontFamily: FONT,
          }}>🎱 SHOOT</button>
        </div>
      )}

      {gameState.foul && gameState.foulReason && (
        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,68,68,0.2)', border: '1px solid rgba(255,68,68,0.5)', borderRadius: '10px', textAlign: 'center', color: '#FF6666' }}>
          ⚠️ {gameState.foulReason}
        </div>
      )}

      {gameState.phase === 'gameOver' && (
        <div style={{ marginTop: '14px', padding: '24px', borderRadius: '16px', textAlign: 'center', background: 'linear-gradient(135deg, #1a1208 0%, #2d1f0a 100%)', border: `2px solid ${BRASS}55` }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>{gameState.winner === 0 ? '🏆' : '😢'}</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px',
            background: gameState.winner === 0 ? `linear-gradient(135deg, ${BRASS}, ${BRASS_LIGHT})` : 'linear-gradient(135deg, #666, #444)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {gameState.mode === 'solo' ? 'PRACTICE OVER' : gameState.winner === 0 ? 'YOU WIN!' : 'YOU LOSE'}
          </h2>
          {gameState.winner === 0 && gameState.mode !== 'solo' && (
            <div style={{ fontSize: '20px', color: BRASS, marginBottom: '16px' }}>+{formatCoins(potAmount)} {currencyLabel}</div>
          )}
          <button onClick={() => {
            if (gameState.winner === 0 && gameState.mode !== 'solo') {
              if (usingSweeps) setSweepsCoins(prev => prev + potAmount);
              else setGoldCoins(prev => prev + potAmount);
              notify(`You won ${formatCoins(potAmount)} ${currencyLabel}!`);
            }
            setGameState(prev => ({ ...prev, phase: 'betting', gameStarted: false }));
            setBalls(getInitialBalls());
          }} style={{
            padding: '14px 36px', minHeight: '48px', background: `linear-gradient(135deg, ${BRASS} 0%, #B8860B 100%)`,
            border: 'none', borderRadius: '10px', color: '#000', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
          }}>Rack Again</button>
        </div>
      )}
    </div>
  );
}

function modeBtn(bg: string, border: string): React.CSSProperties {
  return {
    padding: '14px 8px', background: bg, border: `2px solid ${border}88`, borderRadius: '14px',
    color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
    minHeight: '90px', fontFamily: FONT,
  };
}

// ============================================================
// PANELS
// ============================================================

function CueRackPanel({ cueId, setCueId, onClose }: { cueId: string; setCueId: (id: string) => void; onClose: () => void }) {
  return (
    <Modal title="Cue Rack" accent="#deb887" icon="🎯" onClose={onClose}>
      <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Pick your stick. Your selection follows you to every table.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {CUE_STYLES.map(c => (
          <button key={c.id} onClick={() => setCueId(c.id)} style={{
            padding: '12px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', fontFamily: FONT,
            background: cueId === c.id ? `${c.ring}22` : 'rgba(255,255,255,0.04)',
            border: `2px solid ${cueId === c.id ? c.ring : 'rgba(255,255,255,0.15)'}`,
          }}>
            <div style={{ height: '10px', borderRadius: '5px', background: c.shaft, marginBottom: '10px', boxShadow: `0 0 8px ${c.ring}66` }} />
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{c.name}</div>
            <div style={{ fontSize: '11px', color: cueId === c.id ? c.ring : 'rgba(255,255,255,0.5)' }}>{cueId === c.id ? 'Equipped' : 'Tap to equip'}</div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

function TrophyPanel({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Trophy Wall & Leaderboard" accent={BRASS_LIGHT} icon="🏆" onClose={onClose} maxWidth={520}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '18px' }}>
        {TROPHIES.map(t => (
          <div key={t.title} style={{ padding: '12px', borderRadius: '12px', background: `${BRASS}14`, border: `1px solid ${BRASS}44` }}>
            <div style={{ fontSize: '26px' }}>{t.icon}</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: BRASS_LIGHT }}>{t.title}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{t.detail}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Hall Leaderboard</div>
      {LEADERBOARD.map(e => (
        <div key={e.rank} style={{
          display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', marginBottom: '6px', borderRadius: '10px',
          background: e.rank === 1 ? `${BRASS}22` : 'rgba(255,255,255,0.04)', border: `1px solid ${e.rank === 1 ? BRASS + '66' : 'rgba(255,255,255,0.1)'}`,
        }}>
          <span style={{ width: '24px', fontWeight: 800, color: e.rank <= 3 ? BRASS : 'rgba(255,255,255,0.6)' }}>#{e.rank}</span>
          <span style={{ flex: 1, fontWeight: 700, color: '#fff' }}>{e.name}</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{e.wins} wins</span>
          <span style={{ fontSize: '12px', color: '#2fe39a' }}>🔥 {e.streak}</span>
        </div>
      ))}
    </Modal>
  );
}

function SpectatorPanel({ onSideBet, onClose }: { onSideBet: (pot: number) => void; onClose: () => void }) {
  const [seat, setSeat] = useState<string | null>(null);
  const watching = SPEC_MATCHES.find(m => m.id === seat);
  return (
    <Modal title="Spectator Seats" accent="#7ab4ff" icon="👀" onClose={onClose} maxWidth={500}>
      <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Take a seat and watch live matches in the hall.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {SPEC_MATCHES.map(m => (
          <button key={m.id} onClick={() => setSeat(m.id)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '12px',
            cursor: 'pointer', fontFamily: FONT, textAlign: 'left',
            background: seat === m.id ? 'rgba(123,180,255,0.18)' : 'rgba(255,255,255,0.04)',
            border: `2px solid ${seat === m.id ? '#7ab4ff' : 'rgba(255,255,255,0.14)'}`,
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{m.a} vs {m.b}</div>
              <div style={{ fontSize: '11px', color: '#7ab4ff' }}>{m.status}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>POT</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: BRASS }}>{formatCoins(m.pot)}</div>
            </div>
          </button>
        ))}
      </div>
      {watching && (
        <div style={{ marginTop: '14px', padding: '14px', borderRadius: '12px', background: 'rgba(123,180,255,0.1)', border: '1px solid rgba(123,180,255,0.4)', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>You are watching <b style={{ color: '#fff' }}>{watching.a} vs {watching.b}</b></div>
          <button onClick={() => onSideBet(50)} style={{
            padding: '10px 18px', minHeight: '44px', borderRadius: '10px', cursor: 'pointer', fontFamily: FONT,
            background: `linear-gradient(135deg, ${BRASS} 0%, #B8860B 100%)`, border: 'none', color: '#000', fontWeight: 700,
          }}>Place 50 side bet on {watching.a}</button>
        </div>
      )}
      <ComplianceLine />
    </Modal>
  );
}

function ChatPanel({ onClose }: { onClose: () => void }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>(SEED_CHAT);
  const [draft, setDraft] = useState('');
  const send = () => {
    const t = draft.trim();
    if (!t) return;
    setMsgs(prev => [...prev, { id: `me${Date.now()}`, user: 'You', text: t, color: BRASS }]);
    setDraft('');
  };
  return (
    <Modal title="Hall Chat" accent="#2fe39a" icon="💬" onClose={onClose}>
      <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        {msgs.map(m => (
          <div key={m.id} style={{ padding: '8px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: m.color }}>{m.user}</span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', marginLeft: '6px' }}>{m.text}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          placeholder="Say something..."
          style={{ flex: 1, padding: '12px', minHeight: '44px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontFamily: FONT, fontSize: '13px' }}
        />
        <button onClick={send} style={{ padding: '0 18px', minHeight: '44px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: '#2fe39a', color: '#04140d', fontWeight: 700, fontFamily: FONT }}>Send</button>
      </div>
    </Modal>
  );
}

function CashierPanel({ goldCoins, sweepsCoins, onClose }: { goldCoins: number; sweepsCoins: number; onClose: () => void }) {
  return (
    <Modal title="Cashier" accent={BRASS} icon="🪙" onClose={onClose}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
        <div style={{ flex: 1, padding: '14px', borderRadius: '12px', background: `${GC_GOLD}1a`, border: `1px solid ${GC_GOLD}55`, textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>GOLD COINS</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: GC_GOLD }}>{formatCoins(goldCoins)}</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>Entertainment only</div>
        </div>
        <div style={{ flex: 1, padding: '14px', borderRadius: '12px', background: `${SC_GREEN}1a`, border: `1px solid ${SC_GREEN}55`, textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>SWEEPS COINS</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: SC_GREEN }}>{formatCoins(sweepsCoins)}</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>Redeemable for prizes</div>
        </div>
      </div>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', textAlign: 'center', margin: 0 }}>
        Collect your daily fortune at the Casino Floor to top up. No purchase necessary.
      </p>
      <ComplianceLine />
    </Modal>
  );
}

// ============================================================
// MAIN: FIRST-PERSON POOL HALL
// ============================================================

export default function PoolHall() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [goldCoins, setGoldCoins] = useState(10000);
  const [sweepsCoins, setSweepsCoins] = useState(500);
  const [currency, setCurrency] = useState<Currency>('GC');
  const [panel, setPanel] = useState<PanelId>(null);
  const [cueId, setCueId] = useState('classic');
  const [pendant, setPendant] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(true);

  const cue = CUE_STYLES.find(c => c.id === cueId) || CUE_STYLES[0];
  const currencyColor = currency === 'SC' ? SC_GREEN : GC_GOLD;

  const parallax = (factor: number) => ({ x: (mouse.x - 0.5) * 46 * factor, y: (mouse.y - 0.5) * 26 * factor });

  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      setMouse({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setPendant(0.86 + Math.random() * 0.14), 130);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 6000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const db = (window as any).__workspaceDb;
        if (db) {
          const result = await db.from('user_wallets').get();
          if (result?.data?.[0]) {
            setGoldCoins(result.data[0].gold_coins ?? 10000);
            setSweepsCoins(result.data[0].sweeps_coins ?? 500);
          }
        }
      } catch (e) { /* wallet not available; use defaults */ }
    })();
  }, []);

  const spend = (amt: number): boolean => {
    const bal = currency === 'SC' ? sweepsCoins : goldCoins;
    if (bal < amt) { notify('Not enough coins'); return false; }
    if (currency === 'SC') setSweepsCoins(p => p - amt); else setGoldCoins(p => p - amt);
    return true;
  };

  // Receding hall of tables (perspective floor plan)
  const hallTables = [
    { left: 50, top: 50, scale: 1.0, dim: 0 },
    { left: 30, top: 46, scale: 0.62, dim: 0.25 },
    { left: 70, top: 46, scale: 0.62, dim: 0.25 },
    { left: 38, top: 40, scale: 0.42, dim: 0.45 },
    { left: 62, top: 40, scale: 0.42, dim: 0.45 },
    { left: 44, top: 36, scale: 0.28, dim: 0.6 },
    { left: 56, top: 36, scale: 0.28, dim: 0.6 },
  ];

  return (
    <div ref={containerRef} style={{
      width: '100%', height: '100vh', position: 'relative', overflow: 'hidden',
      background: '#08060330', fontFamily: FONT, perspective: '1400px',
    }}>
      <style>{`
        @keyframes hotPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        @keyframes panelIn { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes toastIn { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes chipToss { 0% { transform: translateY(0) scale(0.6); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(-120px) scale(1) rotate(220deg); opacity: 0; } }
        @keyframes hintFade { 0%,80% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>

      {/* LAYER 0 — floor + vanishing depth */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0a0806 0%, #1a1410 42%, #2a201a 70%, #140d06 100%)' }} />
        {/* receding floorboards toward a vanishing point */}
        <div style={{
          position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)',
          width: '160%', height: '62%',
          background: 'repeating-linear-gradient(90deg, #2a1c12 0px, #2a1c12 60px, #1d130b 60px, #1d130b 64px)',
          clipPath: 'polygon(38% 0, 62% 0, 100% 100%, 0 100%)', opacity: 0.7,
        }} />
        <div style={{
          position: 'absolute', left: '50%', top: '34%', transform: 'translate(-50%,-50%)',
          width: '220px', height: '220px', borderRadius: '50%',
          background: `radial-gradient(circle, ${WARM}33 0%, transparent 70%)`, filter: 'blur(20px)',
        }} />
      </div>

      {/* LAYER 1 — far wall, trophy glow, neon sign (parallax 0.12) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, transform: `translate(${parallax(0.12).x}px, ${parallax(0.12).y}px)`, transition: 'transform 0.3s ease-out' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '46%',
          background: `repeating-linear-gradient(90deg, ${WOOD_MID} 0px, ${WOOD_MID} 96px, #2a1a14 96px, #2a1a14 100px)`, opacity: 0.55 }} />
        <div style={{
          position: 'absolute', left: '50%', top: '9%', transform: 'translateX(-50%)',
          fontSize: '40px', fontWeight: 900, color: BRASS, opacity: pendant,
          textShadow: `0 0 10px ${BRASS}, 0 0 26px ${BRASS}, 0 0 50px ${BRASS}`, letterSpacing: '6px', whiteSpace: 'nowrap',
        }}>POOL HALL</div>
        <div style={{ position: 'absolute', left: '50%', top: '20%', transform: 'translateX(-50%)', fontSize: '12px', letterSpacing: '4px', color: 'rgba(255,255,255,0.5)' }}>DAM FORTUNES · BACK ROOM</div>
        {/* framed art on far wall */}
        {[18, 82].map((x, i) => (
          <div key={i} style={{ position: 'absolute', left: `${x}%`, top: '14%', width: '70px', height: '90px',
            background: 'linear-gradient(180deg, rgba(50,40,30,0.5), rgba(30,20,15,0.5))', border: `3px solid ${BRASS}55`, borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', opacity: 0.6 }}>{i === 0 ? '🎱' : '🖼️'}</div>
        ))}
      </div>

      {/* LAYER 2 — receding hall of tables + pendant lights (parallax 0.3) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, transform: `translate(${parallax(0.3).x}px, ${parallax(0.3).y}px)`, transition: 'transform 0.25s ease-out' }}>
        {hallTables.map((t, i) => (
          <div key={i} style={{ position: 'absolute', left: `${t.left}%`, top: `${t.top}%`, transform: `translate(-50%,-50%) scale(${t.scale})` }}>
            {/* pendant light over each table */}
            <div style={{ position: 'absolute', left: '50%', top: '-90px', transform: 'translateX(-50%)' }}>
              <div style={{ width: '4px', height: '40px', background: BRASS, margin: '0 auto', opacity: 0.7 }} />
              <div style={{ width: '120px', height: '40px', borderRadius: '60px 60px 0 0', border: `3px solid ${BRASS}`, borderBottom: 'none',
                background: 'linear-gradient(180deg, #2d1f0a 0%, #1a1208 100%)' }}>
                <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '160px', height: '120px',
                  background: `radial-gradient(ellipse at top, ${WARM}${i === 0 ? 'cc' : '66'} 0%, transparent 70%)`, opacity: pendant, filter: 'blur(6px)' }} />
              </div>
            </div>
            {/* table */}
            <div style={{ width: '200px', height: '108px', borderRadius: '8px', border: '8px solid #5D4037',
              background: `linear-gradient(135deg, ${FELT_GREEN} 0%, ${FELT_DEEP} 100%)`,
              boxShadow: '0 16px 40px rgba(0,0,0,0.6)', opacity: 1 - t.dim, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.08, borderRadius: '4px',
                backgroundImage: `radial-gradient(circle at 30% 30%, ${BRASS} 2px, transparent 3px)`, backgroundSize: '34px 34px' }} />
              {[{x:6,y:6},{x:50,y:4},{x:94,y:6},{x:6,y:94},{x:50,y:96},{x:94,y:94}].map((p, j) => (
                <div key={j} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%,-50%)',
                  width: '14px', height: '14px', borderRadius: '50%', background: '#000', border: `2px solid ${BRASS}99` }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* LAYER 3 — lounge bar to the side + cue rack (parallax 0.55) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 3, transform: `translate(${parallax(0.55).x}px, ${parallax(0.55).y}px)`, transition: 'transform 0.2s ease-out' }}>
        {/* lounge bar right */}
        <div style={{ position: 'absolute', right: '2%', top: '40%', width: '170px', height: '120px',
          background: 'linear-gradient(180deg, #5c3317 0%, #3d2010 100%)', borderRadius: '10px 0 0 10px', boxShadow: '-6px 8px 24px rgba(0,0,0,0.5)' }}>
          <div style={{ position: 'absolute', top: '-44px', left: '10px', right: '10px', display: 'flex', gap: '6px', justifyContent: 'space-around', alignItems: 'flex-end' }}>
            {['#ff6b6b','#4ecdc4','#ffd93d','#a855f7','#2fe39a'].map((c, i) => (
              <div key={i} style={{ width: '12px', height: `${28 + (i % 3) * 10}px`, background: c, opacity: 0.7, borderRadius: '2px 2px 0 0' }} />
            ))}
          </div>
          <div style={{ position: 'absolute', bottom: '6px', left: 0, right: 0, textAlign: 'center', fontSize: '11px', color: BRASS_LIGHT, fontWeight: 700 }}>LOUNGE</div>
        </div>
        {/* cue rack left */}
        <div style={{ position: 'absolute', left: '4%', top: '32%', width: '92px', height: '160px',
          background: 'linear-gradient(180deg, #4a3020 0%, #2a1a10 100%)', borderRadius: '8px', border: '2px solid #5c4033', boxShadow: '6px 8px 24px rgba(0,0,0,0.5)' }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{ position: 'absolute', left: `${14 + i * 14}px`, top: '12px', width: '6px', height: '130px',
              background: 'linear-gradient(180deg, #f5deb3 0%, #deb887 50%, #8b4513 100%)', borderRadius: '3px', transform: 'rotate(4deg)' }} />
          ))}
        </div>
      </div>

      {/* LAYER 4 — foreground stools / plants (parallax 0.95) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 4, transform: `translate(${parallax(0.95).x}px, ${parallax(0.95).y}px)`, transition: 'transform 0.12s ease-out', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', left: '8%', bottom: '6%' }}>
          <div style={{ width: '34px', height: '10px', background: '#8b0000', borderRadius: '50%' }} />
          <div style={{ width: '5px', height: '60px', background: '#555', margin: '0 auto' }} />
        </div>
        <div style={{ position: 'absolute', right: '9%', bottom: '8%' }}>
          <div style={{ width: '34px', height: '10px', background: '#8b0000', borderRadius: '50%' }} />
          <div style={{ width: '5px', height: '60px', background: '#555', margin: '0 auto' }} />
        </div>
        <div style={{ position: 'absolute', left: '2%', bottom: '10%', fontSize: '46px' }}>🪴</div>
        <div style={{ position: 'absolute', right: '2%', bottom: '12%', fontSize: '46px' }}>🌿</div>
      </div>

      {/* LAYER 5 — HOTSPOTS (parallax 0.7) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 5, transform: `translate(${parallax(0.7).x}px, ${parallax(0.7).y}px)`, transition: 'transform 0.15s ease-out', pointerEvents: 'none' }}>
        {HOTSPOTS.map(h => <Hotspot key={h.id} data={h} onOpen={setPanel} />)}
      </div>

      {/* LAYER 6 — haze + vignette */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 38%, transparent 30%, rgba(0,0,0,0.55) 100%)' }} />

      {/* TOP BAR — currency toggle + cashier */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', background: 'linear-gradient(180deg, rgba(10,8,5,0.85) 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🎱</span>
          <span style={{ fontSize: '15px', fontWeight: 800, color: BRASS, letterSpacing: '1px' }}>POOL HALL</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setCurrency('GC')} style={curBtn(currency === 'GC', GC_GOLD)}>{formatCoins(goldCoins)} GC</button>
          <button onClick={() => setCurrency('SC')} style={curBtn(currency === 'SC', SC_GREEN)}>{formatCoins(sweepsCoins)} SC</button>
          <button onClick={() => setPanel('cashier')} style={{ ...curBtn(false, BRASS), padding: '8px 12px' }}>🪙</button>
        </div>
      </div>

      {/* WELCOME HINT */}
      {showHint && (
        <div style={{ position: 'absolute', top: '64px', left: '50%', transform: 'translateX(-50%)', zIndex: 49,
          padding: '8px 16px', borderRadius: '20px', background: 'rgba(10,8,5,0.8)', border: `1px solid ${BRASS}55`,
          color: 'rgba(255,255,255,0.85)', fontSize: '12px', whiteSpace: 'nowrap', animation: 'hintFade 6s ease-out forwards' }}>
          You just walked into the hall — tap any glowing spot to play
        </div>
      )}

      {/* MOBILE DOCK */}
      <div style={{ position: 'absolute', bottom: '40px', left: 0, right: 0, zIndex: 50, overflowX: 'auto', WebkitOverflowScrolling: 'touch',
        display: 'flex', gap: '8px', padding: '8px 12px', scrollbarWidth: 'none' }}>
        {HOTSPOTS.map(h => (
          <button key={h.id} onClick={() => setPanel(h.id)} style={{
            flex: '0 0 auto', minHeight: '44px', padding: '8px 12px', borderRadius: '12px', cursor: 'pointer', fontFamily: FONT,
            background: 'rgba(10,8,5,0.82)', border: `1px solid ${h.color}66`, color: h.color, fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap',
          }}>{h.icon} {h.label}</button>
        ))}
        <button onClick={() => { window.location.hash = 'game-pulse'; }} style={navBtn('#00d4ff')}>🎰 Casino Floor</button>
        <button onClick={() => { window.location.hash = 'jukebox'; }} style={navBtn('#ff5a7a')}>🍸 The Bar</button>
      </div>

      {/* COMPLIANCE FOOTER */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50, padding: '8px 16px',
        background: 'rgba(10,8,5,0.92)', borderTop: `1px solid ${BRASS}33`, textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '10.5px', color: 'rgba(255,255,255,0.5)' }}>
          <span style={{ color: currencyColor, fontWeight: 700 }}>{formatCoins(currency === 'SC' ? sweepsCoins : goldCoins)} {currency}</span>
          <span style={{ margin: '0 8px', opacity: 0.3 }}>•</span>21+ Only
          <span style={{ margin: '0 8px', opacity: 0.3 }}>•</span>No Purchase Necessary
          <span style={{ margin: '0 8px', opacity: 0.3 }}>•</span>Entertainment Only
        </p>
      </div>

      {/* PANELS */}
      {panel === 'table' && (
        <Modal title="Pool Table" accent={BRASS} icon="🎱" onClose={() => setPanel(null)} maxWidth={640}>
          <PoolTableGame
            currency={currency}
            goldCoins={goldCoins}
            sweepsCoins={sweepsCoins}
            setGoldCoins={setGoldCoins}
            setSweepsCoins={setSweepsCoins}
            cue={cue}
            notify={notify}
          />
        </Modal>
      )}
      {panel === 'cue' && <CueRackPanel cueId={cueId} setCueId={(id) => { setCueId(id); notify(`Equipped ${CUE_STYLES.find(c => c.id === id)?.name}`); }} onClose={() => setPanel(null)} />}
      {panel === 'trophy' && <TrophyPanel onClose={() => setPanel(null)} />}
      {panel === 'spectator' && <SpectatorPanel onSideBet={(amt) => { if (spend(amt)) notify(`Side bet placed: ${amt} ${currency}`); }} onClose={() => setPanel(null)} />}
      {panel === 'chat' && <ChatPanel onClose={() => setPanel(null)} />}
      {panel === 'cashier' && <CashierPanel goldCoins={goldCoins} sweepsCoins={sweepsCoins} onClose={() => setPanel(null)} />}

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '90px', left: '50%', zIndex: 400, transform: 'translateX(-50%)',
          padding: '12px 20px', borderRadius: '12px', background: 'rgba(10,8,5,0.95)', border: `1px solid ${BRASS}88`,
          color: '#fff', fontSize: '13px', fontWeight: 600, animation: 'toastIn 0.3s ease-out', boxShadow: `0 0 24px ${BRASS}44` }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function curBtn(active: boolean, color: string): React.CSSProperties {
  return {
    padding: '8px 12px', minHeight: '40px', borderRadius: '10px', cursor: 'pointer', fontFamily: FONT, fontSize: '13px', fontWeight: 700,
    background: active ? `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -30)} 100%)` : `${color}22`,
    border: `1px solid ${active ? color : color + '66'}`, color: active ? '#000' : color, whiteSpace: 'nowrap',
  };
}

function navBtn(color: string): React.CSSProperties {
  return {
    flex: '0 0 auto', minHeight: '44px', padding: '8px 12px', borderRadius: '12px', cursor: 'pointer', fontFamily: FONT,
    background: `${color}1a`, border: `1px solid ${color}66`, color, fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap',
  };
}
