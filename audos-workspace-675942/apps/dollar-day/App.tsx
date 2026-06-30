import { useState, useEffect, useCallback, useRef, useMemo, useId } from 'react';
import { BadgeDollarSign, CheckCircle2, Circle, Calendar, Flame, Gift, ChevronRight, Sparkles, Trophy, Clock, Loader2, CreditCard, History, Coins, TrendingUp, Star, Timer, Zap, AlertTriangle, Wrench, Wallet, ArrowUpCircle, ArrowDownCircle, Plus, Minus, DollarSign, ChevronDown, Info, Award, Crown, Lock, Unlock, ChevronLeft, X, Gem, Package, ShieldCheck, User, Shirt, Palette, Eye, Scissors, Watch, Glasses, Footprints, Save } from 'lucide-react';

/**
 * Dollar Day — 8D IMMERSIVE TREASURY VAULT for DAM Fortunes.
 *
 * 8-DIMENSIONAL PARALLAX DEPTH SYSTEM:
 * - DIMENSION 1: Far Background (Parallax 0.1x) - Vault ceiling, distant gold bars
 * - DIMENSION 2: Mid Background (Parallax 0.3x) - Neon treasury signs, wall sconces
 * - DIMENSION 3: Background Objects (Parallax 0.5x) - Safe deposit boxes, gold columns
 * - DIMENSION 4: Midground (Parallax 0.7x) - Treasure chests, coin stacks
 * - DIMENSION 5: Player Layer (Parallax 1.0x) - Main interactive content
 * - DIMENSION 6: Foreground Objects (Parallax 1.3x) - Floating coins, gems
 * - DIMENSION 7: Near Foreground (Parallax 1.5x) - Particles, light rays
 * - DIMENSION 8: UI Overlay (Fixed) - All UI elements
 *
 * PREMIUM FEATURES PRESERVED:
 * - Spectacular treasure chest opening animations
 * - Gold coin shower celebrations
 * - Calendar streak tracker with fire effects
 * - Premium flip-clock countdown
 * - VIP tier system
 * - Stripe payment integration
 * - Sweepstakes compliance
 */

declare global {
  interface Window {
    useWorkspaceDB: <T = any>(
      table: string,
      options?: { shared?: boolean; limit?: number; offset?: number; orderBy?: { column: string; direction: 'asc' | 'desc' }; filters?: Array<{ column: string; operator: string; value: any }> }
    ) => { data: T[]; loading: boolean; error: Error | null; total: number; refresh: () => void };
    __workspaceDb: any;
    __APP_ID__?: string;
    __SPACE_ID__?: string;
  }
}

interface PaymentConfig {
  enabled: boolean;
  mode: 'platform' | 'connect';
  stripeAccountId: string | null;
  platformFeeBps: number;
  currency: string;
  businessName: string;
  supportEmail?: string;
  defaultTrialDays?: number;
  defaultPriceCents?: number;
  defaultInterval?: string;
  defaultPriceId?: string | null;
}

// 8D Immersive Treasury Theme Colors
const CASINO_THEME = {
  bgDark: '#0a0a0f',
  bgCard: '#12121a',
  bgCardHover: '#1a1a24',
  bgElevated: '#1e1e28',
  bgMuted: '#2a2a36',
  gold: '#f5c842',
  goldLight: '#ffd966',
  goldDark: '#c9a227',
  goldDeep: '#9a7b0a',
  goldGlow: 'rgba(245, 200, 66, 0.4)',
  goldShine: 'rgba(255, 235, 150, 0.8)',
  green: '#10b981',
  greenLight: '#34d399',
  greenDark: '#059669',
  greenGlow: 'rgba(16, 185, 129, 0.4)',
  purple: '#a855f7',
  purpleLight: '#c084fc',
  purpleDark: '#9333ea',
  purpleGlow: 'rgba(168, 85, 247, 0.4)',
  red: '#ef4444',
  redDark: '#dc2626',
  redGlow: 'rgba(239, 68, 68, 0.4)',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  border: '#2d2d3a',
  borderLight: '#3d3d4a',
  gradientGoldMetallic: 'linear-gradient(135deg, #c9a227 0%, #f5c842 25%, #ffd966 50%, #f5c842 75%, #c9a227 100%)',
  gradientGoldShine: 'linear-gradient(135deg, #9a7b0a 0%, #f5c842 30%, #fff7c2 50%, #f5c842 70%, #9a7b0a 100%)',
  gradientGreen: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
  gradientPurple: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)',
  gradientDarkRadial: 'radial-gradient(ellipse at top, #1a1a24 0%, #0a0a0f 100%)',
  gradientTreasure: 'linear-gradient(180deg, #2d1f0a 0%, #1a1208 50%, #0d0905 100%)',
};

// Neon colors for 8D environment
const NEON_GOLD = '#ffd700';
const NEON_GREEN = '#00ff88';
const NEON_PURPLE = '#bf00ff';
const NEON_BLUE = '#00bfff';

// Coin packages
const COIN_PACKAGES = [
  { dollars: 1.99, goldCoins: 5000, sweepsCoins: 1, bonus: 0, label: '5,000 Gold Coins', tier: 'starter', badge: '🌟 STARTER', starter: true },
  { dollars: 4.99, goldCoins: 10000, sweepsCoins: 2, bonus: 0, label: '10,000 Gold Coins', tier: 'bronze', badge: null },
  { dollars: 9.99, goldCoins: 25000, sweepsCoins: 5, bonus: 0, label: '25,000 Gold Coins', tier: 'silver', badge: null },
  { dollars: 19.99, goldCoins: 60000, sweepsCoins: 12, bonus: 20, label: '60,000 Gold Coins', tier: 'gold', badge: '💫 20% BONUS' },
  { dollars: 49.99, goldCoins: 200000, sweepsCoins: 40, bonus: 0, label: '200,000 Gold Coins', popular: true, tier: 'platinum', badge: '⭐ BEST VALUE' },
  { dollars: 99.99, goldCoins: 500000, sweepsCoins: 100, bonus: 0, label: '500,000 Gold Coins', tier: 'diamond', badge: '👑 VIP CHOICE' },
];

const VIP_TIERS = [
  { name: 'Bronze', minStreak: 0, color: '#cd7f32', emoji: '🥉' },
  { name: 'Silver', minStreak: 7, color: '#c0c0c0', emoji: '🥈' },
  { name: 'Gold', minStreak: 14, color: '#ffd700', emoji: '🥇' },
  { name: 'Platinum', minStreak: 21, color: '#e5e4e2', emoji: '💎' },
  { name: 'Diamond', minStreak: 30, color: '#b9f2ff', emoji: '👑' },
];

// ============================================================================
// EXTENSIVE AVATAR CUSTOMIZATION OPTIONS
// ============================================================================

const AVATAR_OPTIONS = {
  // SKIN TONES - 12+ shades for diverse representation
  skinTones: [
    { id: 'pale', name: 'Pale', color: '#FFE7D1' },
    { id: 'fair', name: 'Fair', color: '#FFDFC4' },
    { id: 'light', name: 'Light', color: '#F0D5BE' },
    { id: 'light_medium', name: 'Light Medium', color: '#E5C298' },
    { id: 'medium', name: 'Medium', color: '#D4A574' },
    { id: 'tan', name: 'Tan', color: '#C68642' },
    { id: 'olive', name: 'Olive', color: '#B5885A' },
    { id: 'brown', name: 'Brown', color: '#A0522D' },
    { id: 'caramel', name: 'Caramel', color: '#8B5A2B' },
    { id: 'dark_brown', name: 'Dark Brown', color: '#6B4423' },
    { id: 'deep_brown', name: 'Deep Brown', color: '#5C4033' },
    { id: 'ebony', name: 'Ebony', color: '#3D2B1F' },
    { id: 'rich_ebony', name: 'Rich Ebony', color: '#2C1810' },
  ],

  // FACE SHAPES
  faceShapes: [
    { id: 'oval', name: 'Oval', emoji: '⬭' },
    { id: 'round', name: 'Round', emoji: '⭕' },
    { id: 'square', name: 'Square', emoji: '⬜' },
    { id: 'heart', name: 'Heart', emoji: '❤️' },
    { id: 'oblong', name: 'Oblong', emoji: '📐' },
  ],

  // EYE STYLES - 10+ options
  eyeStyles: [
    { id: 'almond', name: 'Almond', emoji: '👁️' },
    { id: 'round', name: 'Round', emoji: '⭕' },
    { id: 'hooded', name: 'Hooded', emoji: '😑' },
    { id: 'monolid', name: 'Monolid', emoji: '一' },
    { id: 'deep_set', name: 'Deep Set', emoji: '◉' },
    { id: 'wide_set', name: 'Wide Set', emoji: '◯◯' },
    { id: 'upturned', name: 'Upturned', emoji: '↗️' },
    { id: 'downturned', name: 'Downturned', emoji: '↘️' },
    { id: 'cat', name: 'Cat Eyes', emoji: '🐱' },
    { id: 'doe', name: 'Doe Eyes', emoji: '🦌' },
  ],

  // EYE COLORS
  eyeColors: [
    { id: 'brown', name: 'Brown', color: '#634e34' },
    { id: 'dark_brown', name: 'Dark Brown', color: '#3D2314' },
    { id: 'hazel', name: 'Hazel', color: '#8E7618' },
    { id: 'amber', name: 'Amber', color: '#B8860B' },
    { id: 'green', name: 'Green', color: '#2E8B57' },
    { id: 'blue', name: 'Blue', color: '#4169E1' },
    { id: 'gray', name: 'Gray', color: '#708090' },
    { id: 'black', name: 'Black', color: '#1C1C1C' },
    { id: 'violet', name: 'Violet', color: '#8B008B' },
  ],

  // EYEBROW STYLES
  eyebrowStyles: [
    { id: 'thick', name: 'Thick', emoji: '━━' },
    { id: 'thin', name: 'Thin', emoji: '──' },
    { id: 'arched', name: 'Arched', emoji: '⌒' },
    { id: 'straight', name: 'Straight', emoji: '―' },
    { id: 'bushy', name: 'Bushy', emoji: '▬▬' },
    { id: 'groomed', name: 'Groomed', emoji: '╌╌' },
    { id: 'angled', name: 'Angled', emoji: '╱╲' },
    { id: 'rounded', name: 'Rounded', emoji: '◠' },
    { id: 'feathered', name: 'Feathered', emoji: '↟' },
  ],

  // NOSE STYLES
  noseStyles: [
    { id: 'small', name: 'Small', emoji: '·' },
    { id: 'medium', name: 'Medium', emoji: '▴' },
    { id: 'wide', name: 'Wide', emoji: '◢◣' },
    { id: 'pointed', name: 'Pointed', emoji: '△' },
    { id: 'button', name: 'Button', emoji: '●' },
    { id: 'roman', name: 'Roman', emoji: '⌒' },
    { id: 'flat', name: 'Flat', emoji: '─' },
    { id: 'narrow', name: 'Narrow', emoji: '▏' },
    { id: 'upturned', name: 'Upturned', emoji: '⌃' },
  ],

  // MOUTH STYLES
  mouthStyles: [
    { id: 'full', name: 'Full Lips', emoji: '👄' },
    { id: 'thin', name: 'Thin Lips', emoji: '─' },
    { id: 'wide', name: 'Wide', emoji: '━━' },
    { id: 'heart', name: 'Heart-Shaped', emoji: '💋' },
    { id: 'pouty', name: 'Pouty', emoji: '😗' },
    { id: 'smirk', name: 'Smirk', emoji: '😏' },
    { id: 'neutral', name: 'Neutral', emoji: '😐' },
    { id: 'smile', name: 'Smile', emoji: '🙂' },
  ],

  // HAIR STYLES - 20+ options including cultural styles
  hairStyles: [
    { id: 'short', name: 'Short', emoji: '✂️' },
    { id: 'medium', name: 'Medium', emoji: '💇' },
    { id: 'long', name: 'Long', emoji: '💇‍♀️' },
    { id: 'buzz', name: 'Buzz Cut', emoji: '🪒' },
    { id: 'fade', name: 'Fade', emoji: '📉' },
    { id: 'undercut', name: 'Undercut', emoji: '⬛' },
    { id: 'mohawk', name: 'Mohawk', emoji: '🦔' },
    { id: 'braids', name: 'Braids', emoji: '🪢' },
    { id: 'box_braids', name: 'Box Braids', emoji: '📦' },
    { id: 'dreads', name: 'Dreads', emoji: '🔗' },
    { id: 'locs', name: 'Locs', emoji: '➰' },
    { id: 'cornrows', name: 'Cornrows', emoji: '〰️' },
    { id: 'afro', name: 'Afro', emoji: '🌳' },
    { id: 'curly', name: 'Curly', emoji: '🌀' },
    { id: 'wavy', name: 'Wavy', emoji: '〰️' },
    { id: 'straight', name: 'Straight', emoji: '│' },
    { id: 'ponytail', name: 'Ponytail', emoji: '🎀' },
    { id: 'bun', name: 'Bun', emoji: '🔘' },
    { id: 'bald', name: 'Bald', emoji: '🌕' },
    { id: 'receding', name: 'Receding', emoji: '↩️' },
    { id: 'twists', name: 'Twists', emoji: '🌪️' },
    { id: 'bantu_knots', name: 'Bantu Knots', emoji: '🔵' },
  ],

  // HAIR COLORS - Including vibrant options
  hairColors: [
    { id: 'black', name: 'Black', color: '#1C1C1C' },
    { id: 'dark_brown', name: 'Dark Brown', color: '#3D2314' },
    { id: 'brown', name: 'Brown', color: '#6B4423' },
    { id: 'light_brown', name: 'Light Brown', color: '#9B7653' },
    { id: 'blonde', name: 'Blonde', color: '#E6BE8A' },
    { id: 'platinum', name: 'Platinum', color: '#E5E4E2' },
    { id: 'red', name: 'Red', color: '#B7410E' },
    { id: 'auburn', name: 'Auburn', color: '#A52A2A' },
    { id: 'ginger', name: 'Ginger', color: '#D2691E' },
    { id: 'gray', name: 'Gray', color: '#808080' },
    { id: 'white', name: 'White', color: '#F5F5F5' },
    { id: 'pink', name: 'Pink', color: '#FF69B4' },
    { id: 'blue', name: 'Blue', color: '#1E90FF' },
    { id: 'purple', name: 'Purple', color: '#9400D3' },
    { id: 'green', name: 'Green', color: '#32CD32' },
    { id: 'rainbow', name: 'Rainbow', color: 'linear-gradient(90deg, red, orange, yellow, green, blue, purple)' },
    { id: 'ombre_blonde', name: 'Ombré Blonde', color: 'linear-gradient(180deg, #3D2314 0%, #E6BE8A 100%)' },
    { id: 'ombre_red', name: 'Ombré Red', color: 'linear-gradient(180deg, #1C1C1C 0%, #B7410E 100%)' },
  ],

  // FACIAL HAIR
  facialHair: [
    { id: 'none', name: 'None', emoji: '😶' },
    { id: 'stubble', name: 'Stubble', emoji: '🫠' },
    { id: 'goatee', name: 'Goatee', emoji: '🐐' },
    { id: 'full_beard', name: 'Full Beard', emoji: '🧔' },
    { id: 'mustache', name: 'Mustache', emoji: '👨' },
    { id: 'soul_patch', name: 'Soul Patch', emoji: '▪️' },
    { id: 'mutton_chops', name: 'Mutton Chops', emoji: '🐑' },
    { id: 'chinstrap', name: 'Chinstrap', emoji: '⌒' },
  ],

  // BODY TYPES
  bodyTypes: [
    { id: 'slim', name: 'Slim', emoji: '🧍' },
    { id: 'average', name: 'Average', emoji: '🧑' },
    { id: 'athletic', name: 'Athletic', emoji: '💪' },
    { id: 'muscular', name: 'Muscular', emoji: '🏋️' },
    { id: 'heavyset', name: 'Heavyset', emoji: '🐻' },
    { id: 'curvy', name: 'Curvy', emoji: '🎸' },
  ],

  // HEIGHT
  heights: [
    { id: 'short', name: 'Short', emoji: '📏' },
    { id: 'medium', name: 'Medium', emoji: '📐' },
    { id: 'tall', name: 'Tall', emoji: '📏' },
  ],

  // TOPS/SHIRTS
  topStyles: [
    { id: 'tshirt', name: 'T-Shirt', emoji: '👕' },
    { id: 'polo', name: 'Polo', emoji: '🎽' },
    { id: 'button_up', name: 'Button-Up', emoji: '👔' },
    { id: 'hoodie', name: 'Hoodie', emoji: '🧥' },
    { id: 'jacket', name: 'Jacket', emoji: '🧥' },
    { id: 'leather_jacket', name: 'Leather Jacket', emoji: '🖤' },
    { id: 'vest', name: 'Vest', emoji: '🦺' },
    { id: 'tank_top', name: 'Tank Top', emoji: '💪' },
    { id: 'jersey', name: 'Jersey', emoji: '🏀' },
    { id: 'suit', name: 'Suit Jacket', emoji: '🤵' },
    { id: 'blazer', name: 'Blazer', emoji: '📋' },
    { id: 'crop_top', name: 'Crop Top', emoji: '✨' },
    { id: 'trench_coat', name: 'Trench Coat', emoji: '🕵️' },
    { id: 'varsity_jacket', name: 'Varsity Jacket', emoji: '🅰️' },
    { id: 'turtleneck', name: 'Turtleneck', emoji: '🧣' },
    { id: 'gown', name: 'Gown / Dress', emoji: '👗' },
    { id: 'tracksuit', name: 'Tracksuit', emoji: '🏃‍♂️' },
    { id: 'overalls', name: 'Overalls', emoji: '🧑‍🌾' },
    { id: 'sweater', name: 'Knit Sweater', emoji: '🧶' },
    { id: 'cardigan', name: 'Cardigan', emoji: '🧥' },
    { id: 'flannel', name: 'Flannel', emoji: '🪵' },
    { id: 'henley', name: 'Henley', emoji: '👚' },
    { id: 'graphic_tee', name: 'Graphic Tee', emoji: '🎨' },
    { id: 'zip_hoodie', name: 'Zip Hoodie', emoji: '🤐' },
    { id: 'rugby', name: 'Rugby Shirt', emoji: '🏉' },
    { id: 'puffer', name: 'Puffer Jacket', emoji: '🧊' },
  ],

  // BOTTOMS/PANTS
  bottomStyles: [
    { id: 'jeans', name: 'Jeans', emoji: '👖' },
    { id: 'shorts', name: 'Shorts', emoji: '🩳' },
    { id: 'joggers', name: 'Joggers', emoji: '🏃' },
    { id: 'dress_pants', name: 'Dress Pants', emoji: '👔' },
    { id: 'cargo_pants', name: 'Cargo Pants', emoji: '📦' },
    { id: 'skirt', name: 'Skirt', emoji: '👗' },
    { id: 'mini_skirt', name: 'Mini Skirt', emoji: '💃' },
    { id: 'leggings', name: 'Leggings', emoji: '🧘' },
    { id: 'sweatpants', name: 'Sweatpants', emoji: '😴' },
    { id: 'capris', name: 'Capris', emoji: '🦵' },
    { id: 'wide_leg', name: 'Wide Leg', emoji: '🌊' },
    { id: 'chinos', name: 'Chinos', emoji: '🧵' },
    { id: 'corduroy', name: 'Corduroy', emoji: '🟤' },
    { id: 'track_pants', name: 'Track Pants', emoji: '🏟️' },
    { id: 'bootcut', name: 'Bootcut', emoji: '🤠' },
    { id: 'pleated_skirt', name: 'Pleated Skirt', emoji: '🎀' },
  ],

  // SHOES
  shoeStyles: [
    { id: 'sneakers', name: 'Sneakers', emoji: '👟' },
    { id: 'boots', name: 'Boots', emoji: '🥾' },
    { id: 'dress_shoes', name: 'Dress Shoes', emoji: '👞' },
    { id: 'sandals', name: 'Sandals', emoji: '🩴' },
    { id: 'high_heels', name: 'High Heels', emoji: '👠' },
    { id: 'loafers', name: 'Loafers', emoji: '🥿' },
    { id: 'jordans', name: 'Jordans', emoji: '🏀' },
    { id: 'yeezys', name: 'Yeezys', emoji: '✨' },
    { id: 'timberlands', name: 'Timbs', emoji: '🥾' },
    { id: 'hightops', name: 'High-Tops', emoji: '👟' },
    { id: 'chelsea', name: 'Chelsea Boots', emoji: '🥾' },
    { id: 'slides', name: 'Slides', emoji: '🩴' },
    { id: 'running_shoes', name: 'Running Shoes', emoji: '🏃‍♀️' },
    { id: 'platforms', name: 'Platforms', emoji: '👡' },
    { id: 'cleats', name: 'Cleats', emoji: '⚽' },
    { id: 'mary_janes', name: 'Mary Janes', emoji: '🎀' },
    { id: 'cowboy_boots', name: 'Cowboy Boots', emoji: '🤠' },
  ],

  // HATS
  hatStyles: [
    { id: 'none', name: 'None', emoji: '❌' },
    { id: 'snapback', name: 'Snapback', emoji: '🧢' },
    { id: 'beanie', name: 'Beanie', emoji: '🎿' },
    { id: 'fedora', name: 'Fedora', emoji: '🎩' },
    { id: 'cowboy', name: 'Cowboy Hat', emoji: '🤠' },
    { id: 'durag', name: 'Durag', emoji: '🧕' },
    { id: 'bandana', name: 'Bandana', emoji: '🎀' },
    { id: 'bucket_hat', name: 'Bucket Hat', emoji: '🪣' },
    { id: 'visor', name: 'Visor', emoji: '☀️' },
    { id: 'trucker', name: 'Trucker', emoji: '🚚' },
    { id: 'beret', name: 'Beret', emoji: '🎨' },
    { id: 'headphones', name: 'Headphones', emoji: '🎧' },
    { id: 'baseball_cap', name: 'Baseball Cap', emoji: '⚾' },
    { id: 'flat_cap', name: 'Flat Cap', emoji: '🧐' },
    { id: 'top_hat', name: 'Top Hat', emoji: '🎩' },
    { id: 'pom_beanie', name: 'Pom Beanie', emoji: '❄️' },
    { id: 'headband', name: 'Headband', emoji: '🎽' },
  ],

  // GLASSES
  glassesStyles: [
    { id: 'none', name: 'None', emoji: '❌' },
    { id: 'regular', name: 'Regular', emoji: '👓' },
    { id: 'sunglasses', name: 'Sunglasses', emoji: '🕶️' },
    { id: 'aviators', name: 'Aviators', emoji: '✈️' },
    { id: 'round_frames', name: 'Round Frames', emoji: '⭕' },
    { id: 'cat_eye', name: 'Cat Eye', emoji: '🐱' },
    { id: 'thick_frames', name: 'Thick Frames', emoji: '⬛' },
    { id: 'shield', name: 'Shield', emoji: '🥽' },
    { id: 'half_rim', name: 'Half Rim', emoji: '🤓' },
    { id: 'wayfarer', name: 'Wayfarers', emoji: '😎' },
    { id: 'rimless', name: 'Rimless', emoji: '🫧' },
    { id: 'sport_wrap', name: 'Sport Wrap', emoji: '🥽' },
    { id: 'monocle', name: 'Monocle', emoji: '🧐' },
  ],

  // JEWELRY OPTIONS
  jewelry: [
    { id: 'chain_gold', name: 'Gold Chain', emoji: '⛓️', color: '#FFD700', premium: false },
    { id: 'chain_silver', name: 'Silver Chain', emoji: '⛓️', color: '#C0C0C0', premium: false },
    { id: 'cuban_link', name: 'Cuban Link', emoji: '🔗', color: '#FFD700', premium: false },
    { id: 'watch_gold', name: 'Gold Watch', emoji: '⌚', color: '#FFD700', premium: false },
    { id: 'watch_silver', name: 'Silver Watch', emoji: '⌚', color: '#C0C0C0', premium: false },
    { id: 'rolex', name: 'Luxury Watch', emoji: '⌚', color: '#FFD700', premium: true },
    { id: 'earrings_studs', name: 'Stud Earrings', emoji: '💎', color: '#C0C0C0', premium: false },
    { id: 'earrings_hoops', name: 'Hoop Earrings', emoji: '⭕', color: '#FFD700', premium: false },
    { id: 'rings', name: 'Rings', emoji: '💍', color: '#FFD700', premium: false },
    { id: 'grills_gold', name: 'Gold Grills', emoji: '😬', color: '#FFD700', premium: true },
    { id: 'grills_diamond', name: 'Diamond Grills', emoji: '💎', color: '#B9F2FF', premium: true },
  ],

  // FACE ACCESSORIES (TATTOOS, MAKEUP)
  faceAccessories: [
    { id: 'none', name: 'None', emoji: '❌' },
    { id: 'tear_drop', name: 'Tear Drop Tattoo', emoji: '💧' },
    { id: 'face_tat_star', name: 'Star Tattoo', emoji: '⭐' },
    { id: 'face_tat_cross', name: 'Cross Tattoo', emoji: '✝️' },
    { id: 'face_tat_tribal', name: 'Tribal Tattoo', emoji: '🔱' },
    { id: 'makeup_natural', name: 'Natural Makeup', emoji: '💄' },
    { id: 'makeup_glam', name: 'Glam Makeup', emoji: '✨' },
    { id: 'makeup_dramatic', name: 'Dramatic Eyes', emoji: '👁️' },
    { id: 'freckles', name: 'Freckles', emoji: '🫣' },
    { id: 'beauty_mark', name: 'Beauty Mark', emoji: '•' },
    { id: 'face_tat_dollar', name: 'Dollar Tattoo', emoji: '💲' },
    { id: 'blush', name: 'Blush', emoji: '🌸' },
    { id: 'highlighter', name: 'Highlighter', emoji: '🌟' },
    { id: 'face_jewels', name: 'Face Jewels', emoji: '💎' },
  ],

  // PREVIEW BACKGROUNDS / SCENES
  backgrounds: [
    { id: 'plain', name: 'Plain', emoji: '⬛' },
    { id: 'spotlight', name: 'Spotlight', emoji: '🔦' },
    { id: 'gold_confetti', name: 'Gold Confetti', emoji: '🎉' },
    { id: 'casino_floor', name: 'Casino Floor', emoji: '🎰' },
    { id: 'penthouse', name: 'Penthouse', emoji: '🏙️' },
    { id: 'neon', name: 'Neon', emoji: '🌃' },
  ],

  // SPECIAL ITEMS (Premium - purchasable with Gold Coins)
  specialItems: [
    { id: 'vip_crown', name: 'VIP Crown', emoji: '👑', cost: 50000, description: 'Show everyone you\'re royalty' },
    { id: 'diamond_chain', name: 'Diamond Chain', emoji: '💎', cost: 100000, description: 'Iced out diamond Cuban link' },
    { id: 'designer_suit', name: 'Designer Suit', emoji: '🤵', cost: 75000, description: 'Custom tailored luxury suit' },
    { id: 'designer_dress', name: 'Designer Dress', emoji: '👗', cost: 75000, description: 'Haute couture gown' },
    { id: 'rare_jordans', name: 'Rare Jordans', emoji: '👟', cost: 30000, description: 'Limited edition sneakers' },
    { id: 'gold_teeth', name: 'Full Gold Grill', emoji: '😁', cost: 60000, description: '24K gold dental set' },
    { id: 'diamond_watch', name: 'Diamond Watch', emoji: '⌚', cost: 150000, description: 'AP with full diamonds' },
    { id: 'fur_coat', name: 'Fur Coat', emoji: '🧥', cost: 80000, description: 'Luxurious fur jacket' },
    { id: 'angel_wings', name: 'Angel Wings', emoji: '👼', cost: 200000, description: 'Rare celestial accessory' },
    { id: 'devil_horns', name: 'Devil Horns', emoji: '😈', cost: 200000, description: 'Rare demonic accessory' },
  ],

  // DEFAULT CLOTHING COLORS
  defaultColors: [
    '#FFFFFF', '#000000', '#1C1C1C', '#4A4A4A', '#808080',
    '#FF0000', '#FF4500', '#FF6347', '#DC143C', '#8B0000',
    '#FFA500', '#FFD700', '#FFFF00', '#F0E68C',
    '#32CD32', '#228B22', '#006400', '#90EE90',
    '#00BFFF', '#1E90FF', '#0000FF', '#000080', '#4169E1',
    '#9400D3', '#8B008B', '#DA70D6', '#FF69B4', '#FFC0CB',
    '#A0522D', '#8B4513', '#D2691E', '#DEB887',
  ],
};

// Avatar interface
interface AvatarData {
  skinTone: string;
  faceShape: string;
  eyeStyle: string;
  eyeColor: string;
  eyebrowStyle: string;
  noseStyle: string;
  mouthStyle: string;
  hairStyle: string;
  hairColor: string;
  facialHair: string;
  bodyType: string;
  height: string;
  topStyle: string;
  topColor: string;
  bottomStyle: string;
  bottomColor: string;
  shoesStyle: string;
  shoesColor: string;
  hatStyle: string;
  glassesStyle: string;
  jewelry: string[];
  faceAccessories: string[];
  specialItems: string[];
  background?: string;
}

const DEFAULT_AVATAR: AvatarData = {
  skinTone: 'medium',
  faceShape: 'oval',
  eyeStyle: 'almond',
  eyeColor: 'brown',
  eyebrowStyle: 'groomed',
  noseStyle: 'medium',
  mouthStyle: 'full',
  hairStyle: 'short',
  hairColor: 'black',
  facialHair: 'none',
  bodyType: 'average',
  height: 'medium',
  topStyle: 'tshirt',
  topColor: '#1E90FF',
  bottomStyle: 'jeans',
  bottomColor: '#1C1C1C',
  shoesStyle: 'sneakers',
  shoesColor: '#FFFFFF',
  hatStyle: 'none',
  glassesStyle: 'none',
  jewelry: [],
  faceAccessories: [],
  specialItems: [],
  background: 'spotlight',
};

const REDEMPTION_CONFIG = {
  minimumSC: 10,
  feePercent: 10,
  tiers: [
    { amount: 10, label: '$10' },
    { amount: 25, label: '$25' },
    { amount: 50, label: '$50' },
    { amount: 100, label: '$100' },
  ],
  // Payouts are reviewed and paid out MANUALLY by the house under the Official
  // Rules. There is no automated PayPal / money-out integration on the platform,
  // so we never advertise an instant or "same day" transfer.
  methods: [
    { id: 'manual', name: 'Manual Review', icon: '🧾', timeframe: 'Reviewed by the house', speed: 'standard', primary: true },
  ],
};

const stripePayments = {
  config: null as PaymentConfig | null,
  async loadConfig(): Promise<PaymentConfig | null> {
    if (this.config) return this.config;
    try {
      const result = await window.__workspaceDb.from('payment_config', { shared: true }).limit(1).get();
      if (result?.data && result.data.length > 0) {
        const row = result.data[0];
        this.config = {
          enabled: row.enabled ?? true,
          mode: row.mode ?? 'platform',
          stripeAccountId: row.stripe_account_id ?? null,
          platformFeeBps: row.platform_fee_bps ?? 0,
          currency: row.currency ?? 'usd',
          businessName: row.business_name ?? 'DAM Fortunes Casino',
          supportEmail: row.support_email ?? undefined,
        };
        return this.config;
      }
      this.config = { enabled: true, mode: 'platform', stripeAccountId: null, platformFeeBps: 0, currency: 'usd', businessName: 'DAM Fortunes Casino' };
      return this.config;
    } catch (e) {
      this.config = { enabled: true, mode: 'platform', stripeAccountId: null, platformFeeBps: 0, currency: 'usd', businessName: 'DAM Fortunes Casino' };
      return this.config;
    }
  },
  async isReady(): Promise<{ ready: boolean; reason?: string }> { return { ready: true }; },
  async createCheckout(options: { amount: number; productName: string; productDescription?: string; currency?: string; successUrl: string; cancelUrl: string; customerEmail?: string; metadata?: Record<string, string> }) {
    const response = await fetch('/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-App-Id': window.__APP_ID__ || window.__SPACE_ID__ || '' },
      body: JSON.stringify(options)
    });
    return response.json();
  },
  async getPaymentStatus(sessionId: string) { const response = await fetch(`/api/payments/status/${sessionId}`); return response.json(); },
  redirectToCheckout(checkoutUrl: string) { window.location.href = checkoutUrl; }
};

interface DollarDaySession { id: number; start_date: string; is_active: boolean; note: string; stripe_session_id?: string; created_at?: string; }
interface DayReward { id: number; day_number: number; claimed: boolean; reward_label: string; note: string; claimed_at?: string; created_at?: string; }
interface UserWallet { id: number; balance: number; sweeps_balance: number; total_deposited: number; total_withdrawn: number; total_won: number; total_lost: number; welcome_bonus_claimed: boolean; created_at?: string; }
interface WalletTransaction { id: number; type: 'deposit' | 'withdrawal' | 'bonus' | 'bet' | 'win' | 'daily_reward' | 'free_entry'; amount: number; sweeps_amount?: number; description: string; reference_id?: string; metadata?: any; created_at?: string; }

const REWARD_CATALOG = [
  { label: '500 GC + 0.5 SC', emoji: '🎡', value: 'Daily login bonus', goldCoins: 500, sweepsCoins: 0.5 },
  { label: '1,000 GC + 1 SC', emoji: '💵', value: 'Day 2 bonus coins', goldCoins: 1000, sweepsCoins: 1 },
  { label: '750 GC + 0.75 SC', emoji: '🎰', value: 'Mid-week boost', goldCoins: 750, sweepsCoins: 0.75 },
  { label: '500 GC + 0.5 SC', emoji: '💸', value: 'Loyalty reward', goldCoins: 500, sweepsCoins: 0.5 },
  { label: '1,500 GC + 1.5 SC', emoji: '💎', value: 'Day 5 milestone bonus', goldCoins: 1500, sweepsCoins: 1.5 },
  { label: '500 GC + 0.5 SC', emoji: '⚡', value: 'Power-up coins', goldCoins: 500, sweepsCoins: 0.5 },
  { label: '1,000 GC + 1 SC', emoji: '🌀', value: 'Week 1 completion', goldCoins: 1000, sweepsCoins: 1 },
  { label: '500 GC + 0.5 SC', emoji: '🔄', value: 'Daily refresh', goldCoins: 500, sweepsCoins: 0.5 },
  { label: '2,500 GC + 2.5 SC', emoji: '🏆', value: 'Almost at milestone!', goldCoins: 2500, sweepsCoins: 2.5 },
  { label: '3,000 GC + 3 SC', emoji: '🎁', value: 'Day 10 Mystery Bonus!', goldCoins: 3000, sweepsCoins: 3 },
  { label: '1,250 GC + 1.25 SC', emoji: '🎯', value: 'Target practice coins', goldCoins: 1250, sweepsCoins: 1.25 },
  { label: '1,000 GC + 1 SC', emoji: '💰', value: 'Cashback equivalent', goldCoins: 1000, sweepsCoins: 1 },
  { label: '3,500 GC + 3.5 SC', emoji: '✨', value: 'Lucky day bonus', goldCoins: 3500, sweepsCoins: 3.5 },
  { label: '2,500 GC + 2.5 SC', emoji: '🃏', value: 'VIP-tier coins', goldCoins: 2500, sweepsCoins: 2.5 },
  { label: '1,500 GC + 1.5 SC', emoji: '🌟', value: 'Half-month celebration', goldCoins: 1500, sweepsCoins: 1.5 },
  { label: '750 GC + 0.75 SC', emoji: '⚡', value: 'Quick boost', goldCoins: 750, sweepsCoins: 0.75 },
  { label: '5,000 GC + 5 SC', emoji: '💎', value: 'Day 17 — Big Bonus!', goldCoins: 5000, sweepsCoins: 5 },
  { label: '1,500 GC + 1.5 SC', emoji: '💸', value: 'Protection coins', goldCoins: 1500, sweepsCoins: 1.5 },
  { label: '1,750 GC + 1.75 SC', emoji: '🎰', value: 'Premium spin coins', goldCoins: 1750, sweepsCoins: 1.75 },
  { label: '1,000 GC + 1 SC', emoji: '🔄', value: 'Day 20 reload', goldCoins: 1000, sweepsCoins: 1 },
  { label: '6,000 GC + 6 SC', emoji: '🏆', value: 'Three-week milestone!', goldCoins: 6000, sweepsCoins: 6 },
  { label: '2,000 GC + 2 SC', emoji: '🎡', value: 'Premium title coins', goldCoins: 2000, sweepsCoins: 2 },
  { label: '2,500 GC + 2.5 SC', emoji: '🎁', value: 'VIP gift drop', goldCoins: 2500, sweepsCoins: 2.5 },
  { label: '2,000 GC + 2 SC', emoji: '💰', value: 'Elite protection', goldCoins: 2000, sweepsCoins: 2 },
  { label: '7,500 GC + 7.5 SC', emoji: '✨', value: 'Day 25 — Home stretch!', goldCoins: 7500, sweepsCoins: 7.5 },
  { label: '2,500 GC + 2.5 SC', emoji: '🌀', value: 'Massive spin day', goldCoins: 2500, sweepsCoins: 2.5 },
  { label: '1,000 GC + 1 SC', emoji: '⚡', value: 'Triple power day', goldCoins: 1000, sweepsCoins: 1 },
  { label: '10,000 GC + 10 SC', emoji: '🌟', value: 'Almost there!', goldCoins: 10000, sweepsCoins: 10 },
  { label: '1,500 GC + 1.5 SC', emoji: '🔄', value: 'Final countdown', goldCoins: 1500, sweepsCoins: 1.5 },
  { label: '🎉 Grand Finale!', emoji: '🎊', value: '25,000 GC + 25 SC — Day 30 Jackpot!', goldCoins: 25000, sweepsCoins: 25 },
];

const TOTAL_GOLD_COINS = REWARD_CATALOG.reduce((sum, r) => sum + r.goldCoins, 0);
const TOTAL_SWEEPS_COINS = REWARD_CATALOG.reduce((sum, r) => sum + r.sweepsCoins, 0);

function getDayStatus(dayNum: number, startDate: string): 'locked' | 'available' | 'claimed' {
  const start = new Date(startDate); const today = new Date();
  today.setHours(0, 0, 0, 0); start.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (dayNum - 1 > diffDays) return 'locked';
  return 'available';
}

function getDayProgress(startDate: string): number {
  const start = new Date(startDate); const today = new Date();
  today.setHours(0, 0, 0, 0); start.setHours(0, 0, 0, 0);
  return Math.min(30, Math.max(0, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1));
}

function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number } {
  const now = new Date(); const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  return { hours: Math.floor(diff / (1000 * 60 * 60)), minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)), seconds: Math.floor((diff % (1000 * 60)) / 1000) };
}

function getVipTier(streak: number) { for (let i = VIP_TIERS.length - 1; i >= 0; i--) { if (streak >= VIP_TIERS[i].minStreak) return VIP_TIERS[i]; } return VIP_TIERS[0]; }
function getNextVipTier(streak: number) { for (let i = 0; i < VIP_TIERS.length; i++) { if (streak < VIP_TIERS[i].minStreak) return VIP_TIERS[i]; } return null; }

function getTransactionIcon(type: string) {
  switch (type) {
    case 'deposit': return <ArrowDownCircle className="w-5 h-5" style={{ color: CASINO_THEME.green }} />;
    case 'withdrawal': return <ArrowUpCircle className="w-5 h-5" style={{ color: CASINO_THEME.red }} />;
    case 'bonus': case 'daily_reward': return <Gift className="w-5 h-5" style={{ color: CASINO_THEME.gold }} />;
    case 'free_entry': return <Star className="w-5 h-5" style={{ color: CASINO_THEME.purple }} />;
    case 'bet': return <Coins className="w-5 h-5" style={{ color: CASINO_THEME.red }} />;
    case 'win': return <Trophy className="w-5 h-5" style={{ color: CASINO_THEME.green }} />;
    default: return <DollarSign className="w-5 h-5" style={{ color: CASINO_THEME.textMuted }} />;
  }
}

// ============================================================================
// 8D IMMERSIVE ENVIRONMENT
// ============================================================================

function Immersive8DTreasury({ children, mousePos }: { children: React.ReactNode; mousePos: { x: number; y: number } }) {
  const [neonFlicker, setNeonFlicker] = useState(1);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; type: string; delay: number }>>([]);

  useEffect(() => {
    const flickerInterval = setInterval(() => {
      setNeonFlicker(0.85 + Math.random() * 0.15);
    }, 100);
    return () => clearInterval(flickerInterval);
  }, []);

  useEffect(() => {
    const newParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      type: ['gold', 'sparkle', 'dust', 'gem'][Math.floor(Math.random() * 4)],
      delay: Math.random() * 8,
    }));
    setParticles(newParticles);
  }, []);

  const parallax = (factor: number) => ({
    x: (mousePos.x - 0.5) * 35 * factor,
    y: (mousePos.y - 0.5) * 20 * factor,
  });

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      perspective: '1200px', perspectiveOrigin: '50% 50%',
      background: 'linear-gradient(180deg, #0d0905 0%, #0a0a0f 30%, #12121a 100%)',
    }}>

      {/* ===== DIMENSION 1: Far Background (Parallax 0.1x) ===== */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        transform: `translate(${parallax(0.1).x}px, ${parallax(0.1).y}px)`,
        transition: 'transform 0.3s ease-out',
      }}>
        {/* Vault Ceiling with Gold Trim */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '120px',
          background: 'linear-gradient(180deg, #1a1208 0%, #0d0905 100%)',
        }} />
        {/* Distant gold bar stacks */}
        {[15, 35, 65, 85].map((x, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${x}%`, top: '8%',
            width: '80px', height: '40px',
            background: 'linear-gradient(135deg, #9a7b0a 0%, #c9a227 50%, #9a7b0a 100%)',
            borderRadius: '4px',
            opacity: 0.3,
            boxShadow: `0 0 30px ${CASINO_THEME.goldGlow}`,
          }} />
        ))}
        {/* Vault door silhouette in far distance */}
        <div style={{
          position: 'absolute', left: '50%', top: '5%',
          transform: 'translateX(-50%)',
          width: '200px', height: '80px',
          borderRadius: '100px 100px 0 0',
          border: `3px solid ${CASINO_THEME.goldDark}`,
          opacity: 0.2,
        }} />
      </div>

      {/* ===== DIMENSION 2: Mid Background (Parallax 0.3x) ===== */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        transform: `translate(${parallax(0.3).x}px, ${parallax(0.3).y}px)`,
        transition: 'transform 0.25s ease-out',
      }}>
        {/* "TREASURY" Neon Sign */}
        <div style={{
          position: 'absolute', left: '50%', top: '6%', transform: 'translateX(-50%)',
          fontSize: '42px', fontWeight: 900, color: NEON_GOLD,
          textShadow: `0 0 10px ${NEON_GOLD}, 0 0 20px ${NEON_GOLD}, 0 0 40px ${NEON_GOLD}, 0 0 80px ${NEON_GOLD}`,
          letterSpacing: '8px', opacity: neonFlicker,
          fontFamily: 'Space Grotesk, system-ui, sans-serif',
        }}>
          TREASURY
        </div>
        {/* "8D VAULT" Sign */}
        <div style={{
          position: 'absolute', left: '50%', top: '13%', transform: 'translateX(-50%)',
          fontSize: '18px', fontWeight: 800, color: NEON_GREEN,
          textShadow: `0 0 8px ${NEON_GREEN}, 0 0 16px ${NEON_GREEN}, 0 0 32px ${NEON_GREEN}`,
          letterSpacing: '4px', opacity: neonFlicker * 0.9,
        }}>
          ✨ 8D IMMERSIVE VAULT ✨
        </div>
        {/* Wall sconces with golden light */}
        {[8, 92].map((x, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${x}%`, top: '20%',
            transform: 'translateX(-50%)',
          }}>
            <div style={{
              width: '30px', height: '50px',
              background: 'linear-gradient(180deg, #c9a227 0%, #9a7b0a 100%)',
              borderRadius: '8px 8px 15px 15px',
              boxShadow: `0 0 40px ${CASINO_THEME.gold}, 0 20px 60px ${CASINO_THEME.goldGlow}`,
            }} />
            <div style={{
              position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
              fontSize: '24px', filter: `drop-shadow(0 0 10px ${CASINO_THEME.gold})`,
            }}>🔥</div>
          </div>
        ))}
      </div>

      {/* ===== DIMENSION 3: Background Objects (Parallax 0.5x) ===== */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        transform: `translate(${parallax(0.5).x}px, ${parallax(0.5).y}px)`,
        transition: 'transform 0.2s ease-out',
      }}>
        {/* Safe deposit boxes grid - left side */}
        <div style={{
          position: 'absolute', left: '3%', top: '25%',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px',
        }}>
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} style={{
              width: '28px', height: '20px',
              background: 'linear-gradient(135deg, #3d3d4a 0%, #2d2d3a 100%)',
              border: `1px solid ${CASINO_THEME.gold}40`,
              borderRadius: '2px',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
            }}>
              <div style={{
                width: '4px', height: '4px', margin: '6px auto',
                background: CASINO_THEME.gold, borderRadius: '50%',
                boxShadow: `0 0 4px ${CASINO_THEME.gold}`,
              }} />
            </div>
          ))}
        </div>
        {/* Safe deposit boxes - right side */}
        <div style={{
          position: 'absolute', right: '3%', top: '25%',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px',
        }}>
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} style={{
              width: '28px', height: '20px',
              background: 'linear-gradient(135deg, #3d3d4a 0%, #2d2d3a 100%)',
              border: `1px solid ${CASINO_THEME.gold}40`,
              borderRadius: '2px',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
            }}>
              <div style={{
                width: '4px', height: '4px', margin: '6px auto',
                background: CASINO_THEME.gold, borderRadius: '50%',
                boxShadow: `0 0 4px ${CASINO_THEME.gold}`,
              }} />
            </div>
          ))}
        </div>
        {/* Gold columns */}
        {[12, 88].map((x, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${x}%`, top: '18%', bottom: '20%',
            width: '20px',
            background: `linear-gradient(90deg, ${CASINO_THEME.goldDark}, ${CASINO_THEME.gold}, ${CASINO_THEME.goldDark})`,
            borderRadius: '4px',
            boxShadow: `0 0 20px ${CASINO_THEME.goldGlow}`,
          }} />
        ))}
      </div>

      {/* ===== DIMENSION 4: Midground (Parallax 0.7x) ===== */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 4,
        transform: `translate(${parallax(0.7).x}px, ${parallax(0.7).y}px)`,
        transition: 'transform 0.15s ease-out',
      }}>
        {/* Large treasure chest left */}
        <div style={{
          position: 'absolute', left: '5%', bottom: '12%',
          fontSize: '60px',
          filter: `drop-shadow(0 0 20px ${CASINO_THEME.goldGlow})`,
          animation: 'float 4s ease-in-out infinite',
        }}>🏆</div>
        {/* Coin stacks */}
        <div style={{
          position: 'absolute', left: '18%', bottom: '15%',
          display: 'flex', gap: '8px',
        }}>
          {[40, 55, 45].map((h, i) => (
            <div key={i} style={{
              width: '20px', height: `${h}px`,
              background: `linear-gradient(90deg, ${CASINO_THEME.goldDark}, ${CASINO_THEME.gold}, ${CASINO_THEME.goldDark})`,
              borderRadius: '4px',
              boxShadow: `0 0 10px ${CASINO_THEME.goldGlow}`,
            }} />
          ))}
        </div>
        {/* Large treasure chest right */}
        <div style={{
          position: 'absolute', right: '5%', bottom: '12%',
          fontSize: '60px',
          filter: `drop-shadow(0 0 20px ${CASINO_THEME.purpleGlow})`,
          animation: 'float 4s ease-in-out infinite 1s',
        }}>💎</div>
        {/* Coin stacks right */}
        <div style={{
          position: 'absolute', right: '18%', bottom: '15%',
          display: 'flex', gap: '8px',
        }}>
          {[50, 40, 60].map((h, i) => (
            <div key={i} style={{
              width: '20px', height: `${h}px`,
              background: `linear-gradient(90deg, ${CASINO_THEME.goldDark}, ${CASINO_THEME.gold}, ${CASINO_THEME.goldDark})`,
              borderRadius: '4px',
              boxShadow: `0 0 10px ${CASINO_THEME.goldGlow}`,
            }} />
          ))}
        </div>
      </div>

      {/* ===== DIMENSION 5: Player Layer (Parallax 1.0x) - Main Content ===== */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 5,
        transform: `translate(${parallax(1.0).x}px, ${parallax(1.0).y}px)`,
        transition: 'transform 0.1s ease-out',
      }}>
        {children}
      </div>

      {/* ===== DIMENSION 6: Foreground Objects (Parallax 1.3x) ===== */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none',
        transform: `translate(${parallax(1.3).x}px, ${parallax(1.3).y}px)`,
        transition: 'transform 0.08s ease-out',
      }}>
        {/* Floating coins */}
        {[
          { x: 8, y: 30, emoji: '🪙', size: 28, delay: 0 },
          { x: 92, y: 35, emoji: '🪙', size: 32, delay: 1.5 },
          { x: 5, y: 60, emoji: '💰', size: 26, delay: 0.8 },
          { x: 95, y: 55, emoji: '✨', size: 20, delay: 2 },
          { x: 10, y: 80, emoji: '💎', size: 24, delay: 1.2 },
          { x: 90, y: 75, emoji: '🪙', size: 30, delay: 0.5 },
        ].map((coin, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${coin.x}%`, top: `${coin.y}%`,
            fontSize: `${coin.size}px`,
            animation: `float 3s ease-in-out infinite ${coin.delay}s`,
            filter: `drop-shadow(0 0 8px ${CASINO_THEME.goldGlow})`,
          }}>
            {coin.emoji}
          </div>
        ))}
        {/* Gem clusters */}
        <div style={{
          position: 'absolute', left: '3%', bottom: '25%',
          fontSize: '36px',
          animation: 'float 5s ease-in-out infinite 0.5s',
          filter: `drop-shadow(0 0 12px ${CASINO_THEME.purpleGlow})`,
        }}>💎</div>
        <div style={{
          position: 'absolute', right: '3%', bottom: '30%',
          fontSize: '40px',
          animation: 'float 5s ease-in-out infinite 1.5s',
          filter: `drop-shadow(0 0 12px ${CASINO_THEME.goldGlow})`,
        }}>🏅</div>
      </div>

      {/* ===== DIMENSION 7: Near Foreground (Parallax 1.5x) ===== */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 7, pointerEvents: 'none',
        transform: `translate(${parallax(1.5).x}px, ${parallax(1.5).y}px)`,
        transition: 'transform 0.05s ease-out',
      }}>
        {/* Gold dust particles */}
        {particles.map((p) => (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.type === 'gold' ? '4px' : p.type === 'gem' ? '6px' : '3px',
            height: p.type === 'gold' ? '4px' : p.type === 'gem' ? '6px' : '3px',
            borderRadius: '50%',
            background: p.type === 'gold' ? CASINO_THEME.gold
              : p.type === 'sparkle' ? '#fff'
              : p.type === 'gem' ? CASINO_THEME.purple
              : CASINO_THEME.goldLight,
            boxShadow: p.type === 'gold'
              ? `0 0 8px ${CASINO_THEME.gold}`
              : p.type === 'gem'
              ? `0 0 10px ${CASINO_THEME.purple}`
              : `0 0 4px ${CASINO_THEME.goldLight}`,
            animation: `floatParticle ${6 + p.delay}s ease-in-out infinite ${p.delay}s`,
            opacity: 0.7,
          }} />
        ))}
        {/* Light ray beams */}
        {[20, 50, 80].map((x, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${x}%`, top: 0,
            width: '3px', height: '100%',
            background: `linear-gradient(180deg, ${CASINO_THEME.goldGlow} 0%, transparent 40%, transparent 60%, ${CASINO_THEME.goldGlow}40 100%)`,
            opacity: 0.2 + Math.random() * 0.1,
            animation: `lightRay ${3 + i}s ease-in-out infinite ${i * 0.5}s`,
          }} />
        ))}
      </div>

      {/* ===== DIMENSION 8: UI Overlay (Fixed, no parallax) ===== */}
      {/* Vignette effect */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 8, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,10,15,0.6) 100%)',
      }} />

      {/* 8D Immersive Badge */}
      <div style={{
        position: 'absolute', top: '10px', right: '10px', zIndex: 9,
        padding: '4px 10px', borderRadius: '12px',
        background: 'linear-gradient(135deg, #9a7b0a 0%, #f5c842 50%, #9a7b0a 100%)',
        boxShadow: `0 0 15px ${CASINO_THEME.goldGlow}`,
        fontSize: '10px', fontWeight: 800, color: '#0a0a0f',
        letterSpacing: '1px',
      }}>
        8D IMMERSIVE
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes floatParticle {
          0% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          25% { transform: translate(10px, -20px) scale(1.1); opacity: 0.7; }
          50% { transform: translate(-5px, -40px) scale(1); opacity: 0.5; }
          75% { transform: translate(15px, -60px) scale(0.9); opacity: 0.6; }
          100% { transform: translate(0, -80px) scale(0.8); opacity: 0; }
        }
        @keyframes lightRay {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.3; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        @keyframes coinSpinSlow {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes gemFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.05); }
        }
        @keyframes textGlow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

// Premium Coin Balance Component
function PremiumCoinBalance({ goldCoins, sweepsCoins }: { goldCoins: number; sweepsCoins: number }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'center', gap: '12px', padding: '12px',
      background: `linear-gradient(135deg, ${CASINO_THEME.bgCard}ee, ${CASINO_THEME.bgElevated}ee)`,
      borderRadius: '16px',
      border: `2px solid ${CASINO_THEME.gold}40`,
      boxShadow: `0 4px 20px ${CASINO_THEME.goldGlow}40`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '24px', animation: 'coinSpinSlow 3s linear infinite' }}>🪙</span>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: CASINO_THEME.gold, fontFamily: 'Space Grotesk, system-ui' }}>
            {goldCoins.toLocaleString()}
          </div>
          <div style={{ fontSize: '10px', color: CASINO_THEME.textMuted }}>Gold Coins</div>
        </div>
      </div>
      <div style={{ width: '1px', background: CASINO_THEME.border }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '20px', animation: 'gemFloat 2s ease-in-out infinite' }}>💎</span>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: CASINO_THEME.purple, fontFamily: 'Space Grotesk, system-ui' }}>
            {sweepsCoins.toLocaleString()}
          </div>
          <div style={{ fontSize: '10px', color: CASINO_THEME.textMuted }}>Sweeps Coins</div>
        </div>
      </div>
    </div>
  );
}

// Premium Tab Navigation
function PremiumTabNav({ activeTab, onTabChange }: { activeTab: 'rewards' | 'wallet' | 'avatar'; onTabChange: (tab: 'rewards' | 'wallet' | 'avatar') => void }) {
  return (
    <div style={{
      display: 'flex', gap: '6px', padding: '12px 16px',
    }}>
      {[
        { id: 'rewards' as const, label: '🎁 Rewards', icon: Gift },
        { id: 'wallet' as const, label: '💰 Vault', icon: Wallet },
        { id: 'avatar' as const, label: '👤 Avatar', icon: User },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            flex: 1, padding: '10px 6px', borderRadius: '12px',
            background: activeTab === tab.id
              ? CASINO_THEME.gradientGoldMetallic
              : CASINO_THEME.bgCard,
            border: `2px solid ${activeTab === tab.id ? CASINO_THEME.gold : CASINO_THEME.border}`,
            color: activeTab === tab.id ? CASINO_THEME.bgDark : CASINO_THEME.textPrimary,
            fontWeight: 700, fontSize: '12px',
            boxShadow: activeTab === tab.id ? `0 0 20px ${CASINO_THEME.goldGlow}` : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// Animated Countdown
function AnimatedCountdown() {
  const [time, setTime] = useState(getTimeUntilMidnight());
  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeUntilMidnight()), 1000);
    return () => clearInterval(interval);
  }, []);

  const DigitBox = ({ value, label }: { value: string; label: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        width: '48px', height: '56px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(180deg, #1a1a24 0%, #12121a 50%, #1a1a24 100%)',
        boxShadow: `0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 ${CASINO_THEME.borderLight}`,
        fontSize: '24px', fontWeight: 800, color: CASINO_THEME.gold,
        fontFamily: 'Space Grotesk, monospace',
        textShadow: `0 0 10px ${CASINO_THEME.goldGlow}`,
      }}>
        {value}
      </div>
      <span style={{ fontSize: '10px', marginTop: '4px', color: CASINO_THEME.textMuted, textTransform: 'uppercase' }}>{label}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '12px' }}>
      <Timer style={{ width: '20px', height: '20px', color: CASINO_THEME.gold }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <DigitBox value={String(time.hours).padStart(2, '0')} label="HRS" />
        <span style={{ fontSize: '24px', fontWeight: 700, color: CASINO_THEME.gold, marginBottom: '16px' }}>:</span>
        <DigitBox value={String(time.minutes).padStart(2, '0')} label="MIN" />
        <span style={{ fontSize: '24px', fontWeight: 700, color: CASINO_THEME.gold, marginBottom: '16px' }}>:</span>
        <DigitBox value={String(time.seconds).padStart(2, '0')} label="SEC" />
      </div>
    </div>
  );
}

// Treasure Chest Button
function TreasureChest({ isOpen, onClick, disabled, goldCoins, sweepsCoins }: { isOpen: boolean; onClick: () => void; disabled: boolean; goldCoins: number; sweepsCoins: number }) {
  const [isShaking, setIsShaking] = useState(false);

  const handleClick = () => {
    if (disabled || isOpen) return;
    setIsShaking(true);
    setTimeout(() => { setIsShaking(false); onClick(); }, 600);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isOpen}
      style={{
        width: '100%', padding: '20px', borderRadius: '16px', border: 'none',
        background: isOpen ? CASINO_THEME.gradientGreen : CASINO_THEME.gradientGoldShine,
        boxShadow: isOpen
          ? `0 4px 20px ${CASINO_THEME.greenGlow}`
          : `0 8px 40px ${CASINO_THEME.goldGlow}, 0 0 60px ${CASINO_THEME.goldGlow}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transform: isShaking ? 'scale(1.02)' : 'scale(1)',
        animation: isShaking ? 'shake 0.1s ease-in-out infinite' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontSize: '56px',
          filter: isShaking ? 'drop-shadow(0 0 30px gold) brightness(1.4)' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
          animation: !isOpen && !isShaking ? 'bounce 2s ease-in-out infinite' : 'none',
        }}>
          {isOpen ? '✅' : '🎁'}
        </span>
        <span style={{
          fontSize: '18px', fontWeight: 800,
          color: isOpen ? 'white' : CASINO_THEME.bgDark,
          fontFamily: 'Space Grotesk, system-ui',
        }}>
          {isOpen ? '🎉 CLAIMED!' : isShaking ? '🔓 OPENING...' : '👆 TAP TO CLAIM'}
        </span>
        {!isOpen && !isShaking && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
            <span style={{
              padding: '6px 12px', borderRadius: '20px',
              background: 'rgba(0,0,0,0.2)', color: CASINO_THEME.bgDark,
              fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              🪙 +{goldCoins.toLocaleString()} GC
            </span>
            <span style={{
              padding: '6px 12px', borderRadius: '20px',
              background: 'rgba(0,0,0,0.2)', color: CASINO_THEME.bgDark,
              fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              💎 +{sweepsCoins} SC
            </span>
          </div>
        )}
      </div>
      <style>{`@keyframes shake { 0%, 100% { transform: translateX(0) scale(1.02); } 50% { transform: translateX(-3px) scale(1.02); } }`}</style>
    </button>
  );
}

// Gold Coin Shower
function GoldCoinShower({ active, onComplete }: { active: boolean; onComplete: () => void }) {
  const [coins, setCoins] = useState<Array<{ id: number; x: number; delay: number; size: number; type: string }>>([]);

  useEffect(() => {
    if (active) {
      const coinTypes = ['🪙', '💰', '✨', '⭐', '💎'];
      const newCoins = Array.from({ length: 50 }, (_, i) => ({
        id: i, x: Math.random() * 100, delay: Math.random() * 0.5,
        size: 20 + Math.random() * 24,
        type: coinTypes[Math.floor(Math.random() * coinTypes.length)],
      }));
      setCoins(newCoins);
      const timer = setTimeout(() => { onComplete(); setCoins([]); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!active || coins.length === 0) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at center, ${CASINO_THEME.goldShine} 0%, ${CASINO_THEME.goldGlow} 30%, transparent 70%)`,
        animation: 'flashOverlay 0.8s ease-out forwards',
      }} />
      {coins.map((coin) => (
        <div key={coin.id} style={{
          position: 'absolute', left: `${coin.x}%`, top: '-50px',
          fontSize: `${coin.size}px`,
          animation: `coinFall 2s ease-in ${coin.delay}s forwards`,
          filter: `drop-shadow(0 0 10px ${CASINO_THEME.gold})`,
        }}>
          {coin.type}
        </div>
      ))}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
        fontSize: '28px', fontWeight: 900, color: CASINO_THEME.gold,
        textShadow: `0 0 20px ${CASINO_THEME.gold}, 0 0 40px ${CASINO_THEME.goldGlow}`,
        animation: 'celebrationPop 0.6s ease-out forwards',
      }}>
        🎉 COINS COLLECTED! 🎉
      </div>
      <style>{`
        @keyframes flashOverlay { 0% { opacity: 0.8; } 100% { opacity: 0; } }
        @keyframes coinFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(120vh) rotate(720deg); opacity: 0; } }
        @keyframes celebrationPop { 0% { transform: translateX(-50%) scale(0); opacity: 0; } 50% { transform: translateX(-50%) scale(1.2); opacity: 1; } 100% { transform: translateX(-50%) scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

function avHexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = (hex || '').replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return { r: 200, g: 160, b: 120 };
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function avClampByte(v: number): number { return Math.max(0, Math.min(255, Math.round(v))); }
function avToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => avClampByte(v).toString(16).padStart(2, '0')).join('');
}
// pct < 0 darkens toward black, pct > 0 lightens toward white
function avShade(hex: string, pct: number): string {
  const { r, g, b } = avHexToRgb(hex);
  const t = pct < 0 ? 0 : 255;
  const p = Math.min(1, Math.abs(pct));
  return avToHex(r + (t - r) * p, g + (t - g) * p, b + (t - b) * p);
}

// ============================================================================
// AVATAR LIVE PREVIEW COMPONENT — high-fidelity layered SVG character
// ============================================================================

function AvatarPreview({ avatar, size = 'large' }: { avatar: AvatarData; size?: 'small' | 'medium' | 'large' }) {
  const rawUid = useId();
  const uid = 'av' + rawUid.replace(/[^a-zA-Z0-9]/g, '');

  // ---- Resolve colors with safe fallbacks (old saved avatars must not crash) ----
  const skin = AVATAR_OPTIONS.skinTones.find(s => s.id === avatar.skinTone)?.color || '#D4A574';
  const skinLight = avShade(skin, 0.16);
  const skinShadow = avShade(skin, -0.16);
  const skinDeep = avShade(skin, -0.34);

  const hairEntry = AVATAR_OPTIONS.hairColors.find(h => h.id === avatar.hairColor);
  const hairRaw = hairEntry?.color || '#1C1C1C';
  const hairIsGradient = typeof hairRaw === 'string' && hairRaw.startsWith('linear');
  const hairId = avatar.hairColor;
  const hairSolid = hairIsGradient
    ? (hairId === 'rainbow' ? '#7b2ff7' : hairId === 'ombre_blonde' ? '#7a5230' : hairId === 'ombre_red' ? '#5a1f0a' : '#2a2a2a')
    : hairRaw;
  const hairFill = hairIsGradient ? `url(#${uid}-hair)` : hairRaw;
  const hairShadow = avShade(hairSolid, -0.3);
  const hairHi = avShade(hairSolid, 0.25);

  const eyeColor = AVATAR_OPTIONS.eyeColors.find(e => e.id === avatar.eyeColor)?.color || '#634e34';
  const topColor = avatar.topColor || '#1E90FF';
  const topDark = avShade(topColor, -0.22);
  const topLight = avShade(topColor, 0.2);
  const bottomColor = avatar.bottomColor || '#1C1C1C';
  const bottomDark = avShade(bottomColor, -0.25);
  const shoesColor = avatar.shoesColor || '#FFFFFF';
  const shoesDark = avShade(shoesColor, -0.3);

  const has = (arr: any, id: string) => Array.isArray(arr) && arr.includes(id);
  const jewelry = Array.isArray(avatar.jewelry) ? avatar.jewelry : [];
  const faceAcc = Array.isArray(avatar.faceAccessories) ? avatar.faceAccessories : [];
  const special = Array.isArray(avatar.specialItems) ? avatar.specialItems : [];
  const bg = avatar.background || 'plain';

  // Premium-driven outfit overrides
  const hasFurCoat = has(special, 'fur_coat');
  const hasDesignerSuit = has(special, 'designer_suit');
  const hasDesignerDress = has(special, 'designer_dress');
  const hasDiamondChain = has(special, 'diamond_chain');
  const hasDiamondWatch = has(special, 'diamond_watch');
  const hasGoldTeeth = has(special, 'gold_teeth') || has(jewelry, 'grills_gold') || has(jewelry, 'grills_diamond');

  // ---- Sizing (viewBox keeps it crisp at any size) ----
  const px = size === 'large' ? 196 : size === 'medium' ? 128 : 86;
  const pxH = Math.round(px * 1.74);

  // ---- Body geometry ----
  const bt = avatar.bodyType || 'average';
  const shHW = bt === 'muscular' ? 50 : bt === 'athletic' ? 46 : bt === 'heavyset' ? 49 : bt === 'curvy' ? 40 : bt === 'slim' ? 34 : 41;
  const wHW = bt === 'heavyset' ? 45 : bt === 'muscular' ? 36 : bt === 'athletic' ? 31 : bt === 'curvy' ? 27 : bt === 'slim' ? 27 : 32;
  const hipHW = bt === 'curvy' ? 44 : bt === 'heavyset' ? 47 : bt === 'muscular' ? 35 : bt === 'athletic' ? 31 : bt === 'slim' ? 27 : 33;
  const neckHW = bt === 'muscular' || bt === 'heavyset' ? 9 : bt === 'slim' ? 6 : 7.5;

  // ---- Height scaling (proportional leg length) ----
  const ht = avatar.height || 'medium';
  const legExtend = ht === 'tall' ? 16 : ht === 'short' ? -12 : 0;

  const shoulderY = 156;
  const waistY = 250;
  const hipY = 256;
  const kneeY = 296 + legExtend * 0.5;
  const ankleY = 330 + legExtend;
  const footY = ankleY + 4;

  // ---- Head geometry ----
  const HX = 100;
  const headTop = 46;
  const chinY = 134;
  const eyeY = 90;
  const browY = 76;
  const noseTopY = 86;
  const mouthY = 116;

  const top = avatar.topStyle || 'tshirt';
  const bottom = avatar.bottomStyle || 'jeans';
  const isGown = top === 'gown' || hasDesignerDress;
  const isSuit = top === 'suit' || top === 'blazer' || hasDesignerSuit;
  const sleeveless = top === 'tank_top' || top === 'crop_top';
  const longSleeve = !sleeveless && ['hoodie','jacket','leather_jacket','suit','blazer','button_up','trench_coat','varsity_jacket','turtleneck','tracksuit','overalls','gown','sweater','cardigan','flannel','zip_hoodie','rugby','puffer'].includes(top) || hasFurCoat || hasDesignerSuit || hasDesignerDress;

  // ---- Face shape head element ----
  const fs = avatar.faceShape || 'oval';
  let headShape: JSX.Element;
  if (fs === 'round') {
    headShape = <ellipse cx={HX} cy={(headTop + chinY) / 2 + 2} rx={42} ry={42} fill={`url(#${uid}-skin)`} stroke={skinShadow} strokeWidth={0.5} />;
  } else if (fs === 'oblong') {
    headShape = <ellipse cx={HX} cy={(headTop + chinY) / 2} rx={33} ry={47} fill={`url(#${uid}-skin)`} stroke={skinShadow} strokeWidth={0.5} />;
  } else if (fs === 'square') {
    headShape = <path d={`M ${HX-37},67 Q ${HX-37},${headTop} ${HX},${headTop} Q ${HX+37},${headTop} ${HX+37},67 L ${HX+37},108 Q ${HX+37},${chinY-2} ${HX},${chinY} Q ${HX-37},${chinY-2} ${HX-37},108 Z`} fill={`url(#${uid}-skin)`} stroke={skinShadow} strokeWidth={0.5} />;
  } else if (fs === 'heart') {
    headShape = <path d={`M ${HX-38},72 Q ${HX-38},${headTop-2} ${HX},${headTop} Q ${HX+38},${headTop-2} ${HX+38},72 Q ${HX+38},104 ${HX},${chinY+2} Q ${HX-38},104 ${HX-38},72 Z`} fill={`url(#${uid}-skin)`} stroke={skinShadow} strokeWidth={0.5} />;
  } else {
    // oval (default)
    headShape = <ellipse cx={HX} cy={(headTop + chinY) / 2} rx={37} ry={45} fill={`url(#${uid}-skin)`} stroke={skinShadow} strokeWidth={0.5} />;
  }

  // ---- Eyes ----
  const es = avatar.eyeStyle || 'almond';
  const eyeCfg: Record<string, { rx: number; ry: number; rot: number; spread: number }> = {
    almond: { rx: 7, ry: 4.3, rot: 0, spread: 16 },
    round: { rx: 6, ry: 6, rot: 0, spread: 16 },
    hooded: { rx: 7, ry: 4.4, rot: 0, spread: 16 },
    monolid: { rx: 7.6, ry: 3.5, rot: 0, spread: 16 },
    deep_set: { rx: 6.2, ry: 4.2, rot: 0, spread: 15 },
    wide_set: { rx: 6.6, ry: 4.4, rot: 0, spread: 20 },
    upturned: { rx: 7, ry: 4.2, rot: -9, spread: 16 },
    downturned: { rx: 7, ry: 4.2, rot: 9, spread: 16 },
    cat: { rx: 7.6, ry: 4, rot: -13, spread: 16 },
    doe: { rx: 7, ry: 5.6, rot: 0, spread: 16 },
  };
  const ec = eyeCfg[es] || eyeCfg.almond;
  const irisR = Math.max(2.6, Math.min(ec.rx - 1.2, ec.ry + 0.4));
  const dramatic = has(faceAcc, 'makeup_dramatic') || has(faceAcc, 'makeup_glam');
  const renderEye = (cx: number, sign: number) => (
    <g key={`eye${sign}`} transform={`rotate(${ec.rot * sign} ${cx} ${eyeY})`}>
      <g className="avatar-motion" style={{ animation: `${uid}-blink 5.4s ease-in-out infinite`, transformOrigin: `${cx}px ${eyeY}px` }}>
        <ellipse cx={cx} cy={eyeY} rx={ec.rx} ry={ec.ry} fill="#fbfbfb" stroke={skinDeep} strokeWidth={0.5} />
        {es === 'hooded' && <path d={`M ${cx-ec.rx},${eyeY-1.5} Q ${cx},${eyeY-ec.ry-2.5} ${cx+ec.rx},${eyeY-1.5}`} fill="none" stroke={skinShadow} strokeWidth={1.6} strokeLinecap="round" />}
        <g className="avatar-motion" style={{ animation: `${uid}-gaze 8.6s ease-in-out infinite` }}>
          <circle cx={cx} cy={eyeY + 0.3} r={irisR} fill={eyeColor} />
          <circle cx={cx} cy={eyeY + 0.3} r={irisR * 0.5} fill="#1a1209" />
          <circle cx={cx - irisR * 0.35} cy={eyeY - irisR * 0.35} r={Math.max(0.9, irisR * 0.28)} fill="#ffffff" opacity={0.95} />
        </g>
      </g>
      {dramatic && <path d={`M ${cx-ec.rx-1},${eyeY} Q ${cx},${eyeY-ec.ry-1} ${cx+ec.rx+1.5},${eyeY-2} L ${cx+ec.rx+3.5},${eyeY-3.5}`} fill="none" stroke="#111" strokeWidth={1.4} strokeLinecap="round" />}
    </g>
  );

  // ---- Eyebrows ----
  const bs = avatar.eyebrowStyle || 'groomed';
  const browCfg: Record<string, { w: number; arch: number; angle: number }> = {
    thick: { w: 5, arch: 2, angle: 0 },
    thin: { w: 2, arch: 2, angle: 0 },
    arched: { w: 3, arch: 5.5, angle: 0 },
    straight: { w: 3.2, arch: 0, angle: 0 },
    bushy: { w: 6, arch: 2, angle: 0 },
    groomed: { w: 3, arch: 3, angle: 0 },
    angled: { w: 3.4, arch: 1, angle: 3 },
    rounded: { w: 3.4, arch: 4.5, angle: 0 },
    feathered: { w: 2.6, arch: 3, angle: 0 },
  };
  const bc = browCfg[bs] || browCfg.groomed;
  const renderBrow = (sign: number) => {
    const inner = HX + sign * 7;
    const mid = HX + sign * 15;
    const outer = HX + sign * 23;
    return (
      <path key={`brow${sign}`} d={`M ${inner},${browY + bc.angle} Q ${mid},${browY - bc.arch} ${outer},${browY + 1 - bc.angle}`} fill="none" stroke={hairSolid} strokeWidth={bc.w} strokeLinecap="round" opacity={0.95} />
    );
  };

  // ---- Nose ----
  const ns = avatar.noseStyle || 'medium';
  const noseCfg: Record<string, { w: number; len: number }> = {
    small: { w: 6, len: 12 }, medium: { w: 8, len: 16 }, wide: { w: 12.5, len: 15 },
    pointed: { w: 6, len: 19 }, button: { w: 7, len: 11 }, roman: { w: 8, len: 21 },
    flat: { w: 12, len: 12 }, narrow: { w: 5, len: 16 }, upturned: { w: 7, len: 13 },
  };
  const nc = noseCfg[ns] || noseCfg.medium;
  const noseBottom = noseTopY + nc.len;
  const noseTip = ns === 'upturned' ? noseBottom - 2 : noseBottom;

  // ---- Mouth ----
  const ms = avatar.mouthStyle || 'full';
  const makeupGlam = has(faceAcc, 'makeup_glam') || has(faceAcc, 'makeup_dramatic');
  const makeupNat = has(faceAcc, 'makeup_natural');
  const lipColor = makeupGlam ? '#c0314a' : makeupNat ? '#b9686a' : avShade(skin, -0.22);
  const lipLight = avShade(lipColor, 0.18);
  const mCfg: Record<string, { w: number; up: number; low: number }> = {
    full: { w: 12, up: 3, low: 4 }, thin: { w: 12, up: 1.3, low: 1.6 }, wide: { w: 16, up: 2.3, low: 2.6 },
    heart: { w: 10, up: 3.4, low: 3.6 }, pouty: { w: 10, up: 2.6, low: 5 }, smirk: { w: 12, up: 2, low: 2.4 },
    neutral: { w: 12, up: 1.6, low: 1.8 }, smile: { w: 13, up: 2, low: 2.6 },
  };
  const mc = mCfg[ms] || mCfg.full;

  // ---- Hair: back + front pieces ----
  const hs = avatar.hairStyle || 'short';
  const bald = hs === 'bald';
  const longBack = ['long', 'straight', 'wavy', 'curly'].includes(hs);
  const strandStyle = ['braids', 'box_braids', 'dreads', 'locs', 'twists'].includes(hs);

  const hairBack: JSX.Element[] = [];
  if (!bald) {
    if (hs === 'afro') {
      hairBack.push(<circle key="afroback" cx={HX} cy={78} r={52} fill={hairFill} stroke={hairShadow} strokeWidth={1} />);
    } else if (longBack) {
      const wob = hs === 'wavy' || hs === 'curly';
      hairBack.push(<path key="longback" d={`M ${HX-40},70 Q ${HX-52},150 ${HX-34},${wob?206:212} Q ${HX},${wob?224:218} ${HX+34},${wob?206:212} Q ${HX+52},150 ${HX+40},70 Q ${HX},58 ${HX-40},70 Z`} fill={hairFill} stroke={hairShadow} strokeWidth={1} />);
      if (hs === 'curly' || hs === 'wavy') {
        for (let i = -3; i <= 3; i++) hairBack.push(<circle key={`cb${i}`} cx={HX + i * 12} cy={200 + (i % 2) * 8} r={9} fill={hairFill} opacity={0.9} />);
      }
    } else if (hs === 'ponytail') {
      hairBack.push(<path key="pt" d={`M ${HX+30},62 Q ${HX+70},90 ${HX+54},150 Q ${HX+48},178 ${HX+34},176 Q ${HX+48},120 ${HX+24},70 Z`} fill={hairFill} stroke={hairShadow} strokeWidth={1} />);
    } else if (hs === 'bun') {
      hairBack.push(<circle key="bun" cx={HX} cy={42} r={17} fill={hairFill} stroke={hairShadow} strokeWidth={1} />);
    } else if (strandStyle) {
      const cnt = 7;
      const len = hs === 'twists' ? 150 : 196;
      for (let i = 0; i < cnt; i++) {
        const sx = HX - 36 + (i * 72) / (cnt - 1);
        const wob = hs === 'dreads' || hs === 'locs' ? 4 : 2;
        hairBack.push(<path key={`st${i}`} d={`M ${sx},58 Q ${sx - wob},${(58 + len) / 2} ${sx},${len} Q ${sx + wob},${(58 + len) / 2} ${sx + 4},58 Z`} fill={hairFill} stroke={hairShadow} strokeWidth={0.6} />);
        if (hs === 'box_braids' || hs === 'braids') {
          for (let k = 0; k < 5; k++) hairBack.push(<circle key={`bk${i}-${k}`} cx={sx + 2} cy={70 + k * ((len - 70) / 5)} r={2.6} fill={hairShadow} opacity={0.6} />);
        }
      }
    }
  }

  const hairFront: JSX.Element[] = [];
  if (!bald) {
    if (hs === 'afro') {
      hairFront.push(<path key="afrofront" d={`M ${HX-40},80 Q ${HX-46},44 ${HX},42 Q ${HX+46},44 ${HX+40},80 Q ${HX+20},62 ${HX},62 Q ${HX-20},62 ${HX-40},80 Z`} fill={hairFill} />);
    } else if (hs === 'mohawk') {
      hairFront.push(<path key="moh" d={`M ${HX-8},66 L ${HX-7},${headTop-18} Q ${HX},${headTop-24} ${HX+7},${headTop-18} L ${HX+8},66 Q ${HX},58 ${HX-8},66 Z`} fill={hairFill} stroke={hairShadow} strokeWidth={0.8} />);
    } else if (hs === 'buzz' || hs === 'fade') {
      const sideDrop = hs === 'fade' ? 60 : 70;
      hairFront.push(<path key="buzz" d={`M ${HX-37},${sideDrop} Q ${HX-40},${headTop} ${HX},${headTop-2} Q ${HX+40},${headTop} ${HX+37},${sideDrop} Q ${HX},58 ${HX-37},${sideDrop} Z`} fill={hairFill} opacity={hs === 'fade' ? 0.92 : 1} />);
    } else if (hs === 'bald' || hs === 'receding') {
      // receding: M-shaped hairline
      hairFront.push(<path key="rec" d={`M ${HX-37},78 Q ${HX-40},${headTop} ${HX-14},58 Q ${HX},70 ${HX+14},58 Q ${HX+40},${headTop} ${HX+37},78 Q ${HX+30},60 ${HX},60 Q ${HX-30},60 ${HX-37},78 Z`} fill={hairFill} stroke={hairShadow} strokeWidth={0.6} />);
    } else if (hs === 'bantu_knots') {
      hairFront.push(<path key="bantucap" d={`M ${HX-37},72 Q ${HX-40},${headTop} ${HX},${headTop-2} Q ${HX+40},${headTop} ${HX+37},72 Q ${HX},60 ${HX-37},72 Z`} fill={hairFill} />);
      for (let i = -2; i <= 2; i++) hairFront.push(<circle key={`bz${i}`} cx={HX + i * 16} cy={headTop - 4 + Math.abs(i) * 3} r={6} fill={hairFill} stroke={hairShadow} strokeWidth={0.6} />);
    } else if (hs === 'cornrows') {
      for (let i = -3; i <= 3; i++) hairFront.push(<path key={`cr${i}`} d={`M ${HX + i * 9},66 Q ${HX + i * 11},52 ${HX + i * 12},${headTop}`} fill="none" stroke={hairFill} strokeWidth={3} strokeLinecap="round" />);
    } else if (strandStyle) {
      hairFront.push(<path key="strandcap" d={`M ${HX-36},70 Q ${HX-40},${headTop} ${HX},${headTop-2} Q ${HX+40},${headTop} ${HX+36},70 Q ${HX},58 ${HX-36},70 Z`} fill={hairFill} />);
    } else if (hs === 'undercut') {
      hairFront.push(<path key="uc" d={`M ${HX-30},70 Q ${HX-36},${headTop} ${HX},${headTop-3} Q ${HX+36},${headTop} ${HX+30},70 Q ${HX+18},54 ${HX},54 Q ${HX-18},54 ${HX-30},70 Z`} fill={hairFill} stroke={hairShadow} strokeWidth={0.6} />);
    } else if (hs === 'ponytail' || hs === 'bun') {
      hairFront.push(<path key="ptcap" d={`M ${HX-36},72 Q ${HX-40},${headTop} ${HX},${headTop-2} Q ${HX+40},${headTop} ${HX+36},72 Q ${HX},58 ${HX-36},72 Z`} fill={hairFill} />);
    } else if (longBack) {
      // framing front fringe
      hairFront.push(<path key="lf" d={`M ${HX-40},80 Q ${HX-44},${headTop} ${HX},${headTop-3} Q ${HX+44},${headTop} ${HX+40},80 Q ${HX+34},58 ${HX+18},66 Q ${HX},58 ${HX-18},66 Q ${HX-34},58 ${HX-40},80 Z`} fill={hairFill} />);
    } else {
      // short / medium / fade fallback cap
      const drop = hs === 'medium' ? 86 : 76;
      hairFront.push(<path key="cap" d={`M ${HX-38},${drop} Q ${HX-42},${headTop} ${HX},${headTop-3} Q ${HX+42},${headTop} ${HX+38},${drop} Q ${HX+30},60 ${HX},60 Q ${HX-30},60 ${HX-38},${drop} Z`} fill={hairFill} stroke={hairShadow} strokeWidth={0.6} />);
    }
    // subtle highlight sheen on most hair
    if (!['cornrows'].includes(hs)) hairFront.push(<path key="sheen" d={`M ${HX-22},58 Q ${HX-6},50 ${HX+10},54`} fill="none" stroke={hairHi} strokeWidth={2.4} strokeLinecap="round" opacity={0.5} />);
  }

  // ---- Facial hair ----
  const fh = avatar.facialHair || 'none';
  const facialHair: JSX.Element[] = [];
  const beardFill = fh === 'stubble' ? hairSolid : hairFill;
  const beardOpacity = fh === 'stubble' ? 0.32 : 1;
  if (fh === 'full_beard' || fh === 'stubble') {
    facialHair.push(<path key="fb" d={`M ${HX-34},96 Q ${HX-36},126 ${HX},${chinY+6} Q ${HX+36},126 ${HX+34},96 Q ${HX+20},118 ${HX},116 Q ${HX-20},118 ${HX-34},96 Z`} fill={beardFill} opacity={beardOpacity} />);
    facialHair.push(<path key="mu" d={`M ${HX-12},110 Q ${HX},106 ${HX+12},110 Q ${HX},114 ${HX-12},110 Z`} fill={beardFill} opacity={beardOpacity} />);
  } else if (fh === 'goatee') {
    facialHair.push(<path key="gt" d={`M ${HX-9},120 Q ${HX},${chinY+4} ${HX+9},120 Q ${HX},126 ${HX-9},120 Z`} fill={beardFill} />);
    facialHair.push(<path key="sp" d={`M ${HX-3},122 L ${HX+3},122 L ${HX+2},127 L ${HX-2},127 Z`} fill={beardFill} />);
  } else if (fh === 'mustache') {
    facialHair.push(<path key="must" d={`M ${HX-13},110 Q ${HX},105 ${HX+13},110 Q ${HX+8},115 ${HX},113 Q ${HX-8},115 ${HX-13},110 Z`} fill={beardFill} />);
  } else if (fh === 'soul_patch') {
    facialHair.push(<ellipse key="solp" cx={HX} cy={124} rx={3.5} ry={4.5} fill={beardFill} />);
  } else if (fh === 'mutton_chops') {
    facialHair.push(<path key="mcL" d={`M ${HX-34},92 Q ${HX-36},122 ${HX-20},122 Q ${HX-22},104 ${HX-30},96 Z`} fill={beardFill} />);
    facialHair.push(<path key="mcR" d={`M ${HX+34},92 Q ${HX+36},122 ${HX+20},122 Q ${HX+22},104 ${HX+30},96 Z`} fill={beardFill} />);
  } else if (fh === 'chinstrap') {
    facialHair.push(<path key="cs" d={`M ${HX-33},94 Q ${HX-34},128 ${HX},${chinY+5} Q ${HX+34},128 ${HX+33},94`} fill="none" stroke={beardFill} strokeWidth={4} strokeLinecap="round" />);
  }

  // ---- Hat ----
  const hat = avatar.hatStyle || 'none';
  const hatEls: JSX.Element[] = [];
  if (hat !== 'none') {
    if (hat === 'snapback' || hat === 'trucker') {
      hatEls.push(<path key="cap" d={`M ${HX-38},56 Q ${HX},30 ${HX+38},56 Q ${HX},48 ${HX-38},56 Z`} fill={hat === 'trucker' ? topColor : '#222'} />);
      hatEls.push(<path key="brim" d={`M ${HX+8},56 Q ${HX+58},56 ${HX+56},62 Q ${HX+10},62 ${HX+8},56 Z`} fill={hat === 'trucker' ? avShade(topColor, -0.3) : '#111'} />);
      if (hat === 'trucker') hatEls.push(<rect key="mesh" x={HX-30} y={40} width={60} height={10} fill="#f0f0f0" opacity={0.5} rx={3} />);
    } else if (hat === 'beanie') {
      hatEls.push(<path key="bn" d={`M ${HX-38},60 Q ${HX-40},32 ${HX},30 Q ${HX+40},32 ${HX+38},60 Q ${HX},50 ${HX-38},60 Z`} fill={topColor} stroke={topDark} strokeWidth={1} />);
      hatEls.push(<rect key="fold" x={HX-40} y={56} width={80} height={9} rx={4} fill={topDark} />);
    } else if (hat === 'fedora') {
      hatEls.push(<ellipse key="brim" cx={HX} cy={58} rx={52} ry={9} fill="#3a2a18" />);
      hatEls.push(<path key="crown" d={`M ${HX-26},58 Q ${HX-24},32 ${HX},34 Q ${HX+24},32 ${HX+26},58 Z`} fill="#4a3520" />);
      hatEls.push(<rect key="band" x={HX-26} y={50} width={52} height={6} fill="#caa24a" />);
    } else if (hat === 'cowboy') {
      hatEls.push(<path key="cbrim" d={`M ${HX-56},58 Q ${HX},74 ${HX+56},58 Q ${HX},48 ${HX-56},58 Z`} fill="#7a4a1e" />);
      hatEls.push(<path key="ccrown" d={`M ${HX-22},58 Q ${HX-26},30 ${HX},32 Q ${HX+26},30 ${HX+22},58 Z`} fill="#8a5a2a" />);
    } else if (hat === 'durag') {
      hatEls.push(<path key="dr" d={`M ${HX-38},68 Q ${HX-42},38 ${HX},36 Q ${HX+42},38 ${HX+38},68 Q ${HX},56 ${HX-38},68 Z`} fill={topColor} />);
      hatEls.push(<path key="drtail" d={`M ${HX+30},60 Q ${HX+60},80 ${HX+44},120 L ${HX+34},116 Q ${HX+44},86 ${HX+24},66 Z`} fill={topColor} opacity={0.85} />);
    } else if (hat === 'bandana') {
      hatEls.push(<path key="bd" d={`M ${HX-38},64 Q ${HX},48 ${HX+38},64 L ${HX+36},58 Q ${HX},44 ${HX-36},58 Z`} fill={topColor} />);
      hatEls.push(<path key="bdk" d={`M ${HX-38},64 l -6,10 l 8,-2 Z`} fill={topDark} />);
    } else if (hat === 'bucket_hat') {
      hatEls.push(<path key="bh" d={`M ${HX-30},58 Q ${HX-34},38 ${HX},38 Q ${HX+34},38 ${HX+30},58 Z`} fill={topColor} />);
      hatEls.push(<path key="bhbrim" d={`M ${HX-46},58 Q ${HX},72 ${HX+46},58 Q ${HX},64 ${HX-46},58 Z`} fill={avShade(topColor, -0.15)} />);
    } else if (hat === 'visor') {
      hatEls.push(<path key="vb" d={`M ${HX-44},58 Q ${HX},72 ${HX+44},58 Q ${HX},62 ${HX-44},58 Z`} fill={topColor} />);
      hatEls.push(<rect key="vstrap" x={HX-38} y={54} width={76} height={6} rx={3} fill={avShade(topColor, -0.2)} />);
    } else if (hat === 'beret') {
      hatEls.push(<ellipse key="ber" cx={HX-4} cy={50} rx={34} ry={16} fill={topColor} />);
      hatEls.push(<circle key="bernub" cx={HX-4} cy={40} r={3} fill={topDark} />);
    } else if (hat === 'headphones') {
      hatEls.push(<path key="hp" d={`M ${HX-44},92 Q ${HX-46},40 ${HX},40 Q ${HX+46},40 ${HX+44},92`} fill="none" stroke="#222" strokeWidth={6} />);
      hatEls.push(<rect key="hpL" x={HX-52} y={84} width={14} height={22} rx={5} fill="#333" />);
      hatEls.push(<rect key="hpR" x={HX+38} y={84} width={14} height={22} rx={5} fill="#333" />);
    } else if (hat === 'baseball_cap') {
      hatEls.push(<path key="bccrown" d={`M ${HX-38},58 Q ${HX-40},34 ${HX},32 Q ${HX+40},34 ${HX+38},58 Q ${HX},48 ${HX-38},58 Z`} fill={topColor} stroke={topDark} strokeWidth={0.6} />);
      hatEls.push(<path key="bcbrim" d={`M ${HX+6},56 Q ${HX+54},58 ${HX+52},64 Q ${HX+8},64 ${HX+6},56 Z`} fill={avShade(topColor, -0.25)} />);
      hatEls.push(<circle key="bcbtn" cx={HX} cy={35} r={2} fill={topDark} />);
    } else if (hat === 'flat_cap') {
      hatEls.push(<path key="fccrown" d={`M ${HX-36},58 Q ${HX-38},40 ${HX},40 Q ${HX+34},40 ${HX+40},54 Q ${HX+44},58 ${HX+40},60 Q ${HX},52 ${HX-36},58 Z`} fill={topColor} stroke={topDark} strokeWidth={0.6} />);
      hatEls.push(<path key="fcbrim" d={`M ${HX+10},58 Q ${HX+42},56 ${HX+40},61 Q ${HX+12},62 ${HX+10},58 Z`} fill={avShade(topColor, -0.25)} />);
    } else if (hat === 'top_hat') {
      hatEls.push(<ellipse key="thbrim" cx={HX} cy={56} rx={46} ry={8} fill="#15151b" />);
      hatEls.push(<rect key="thcrown" x={HX-24} y={14} width={48} height={42} fill="#1a1a22" stroke="#000" strokeWidth={0.6} />);
      hatEls.push(<rect key="thband" x={HX-24} y={46} width={48} height={7} fill="#7a1020" />);
    } else if (hat === 'pom_beanie') {
      hatEls.push(<path key="pb" d={`M ${HX-38},60 Q ${HX-40},30 ${HX},28 Q ${HX+40},30 ${HX+38},60 Q ${HX},50 ${HX-38},60 Z`} fill={topColor} stroke={topDark} strokeWidth={1} />);
      hatEls.push(<rect key="pbfold" x={HX-40} y={56} width={80} height={9} rx={4} fill={topDark} />);
      hatEls.push(<circle key="pbpom" cx={HX} cy={24} r={6} fill={avShade(topColor, 0.3)} />);
    } else if (hat === 'headband') {
      hatEls.push(<path key="hb" d={`M ${HX-39},66 Q ${HX},54 ${HX+39},66 L ${HX+39},74 Q ${HX},62 ${HX-39},74 Z`} fill={topColor} stroke={topDark} strokeWidth={0.6} />);
      hatEls.push(<rect key="hbstripe" x={HX-39} y={68} width={78} height={2} fill="#fff" opacity={0.6} />);
    }
  }

  // ---- Glasses ----
  const gl = avatar.glassesStyle || 'none';
  const glassesEls: JSX.Element[] = [];
  if (gl !== 'none') {
    const lx = HX - 16, rx = HX + 16, gy = eyeY;
    const tinted = gl === 'sunglasses' || gl === 'aviators' || gl === 'shield' || gl === 'wayfarer' || gl === 'sport_wrap';
    const lensFill = tinted ? '#1b1b2a' : 'none';
    const lensOp = tinted ? 0.82 : 1;
    const frameColor = gl === 'aviators' ? '#caa24a' : '#15151b';
    const fw = gl === 'thick_frames' ? 3 : 1.8;
    if (gl === 'shield') {
      glassesEls.push(<path key="sh" d={`M ${HX-26},${gy-6} Q ${HX},${gy-9} ${HX+26},${gy-6} L ${HX+24},${gy+6} Q ${HX},${gy+9} ${HX-24},${gy+6} Z`} fill={lensFill} opacity={lensOp} stroke={frameColor} strokeWidth={2} />);
    } else if (gl === 'round_frames') {
      glassesEls.push(<circle key="l" cx={lx} cy={gy} r={8} fill={lensFill} opacity={lensOp} stroke={frameColor} strokeWidth={fw} />);
      glassesEls.push(<circle key="r" cx={rx} cy={gy} r={8} fill={lensFill} opacity={lensOp} stroke={frameColor} strokeWidth={fw} />);
    } else if (gl === 'aviators') {
      glassesEls.push(<path key="l" d={`M ${lx-9},${gy-5} Q ${lx-9},${gy+8} ${lx},${gy+8} Q ${lx+9},${gy+8} ${lx+9},${gy-5} Q ${lx},${gy-7} ${lx-9},${gy-5} Z`} fill={lensFill} opacity={lensOp} stroke={frameColor} strokeWidth={fw} />);
      glassesEls.push(<path key="r" d={`M ${rx-9},${gy-5} Q ${rx-9},${gy+8} ${rx},${gy+8} Q ${rx+9},${gy+8} ${rx+9},${gy-5} Q ${rx},${gy-7} ${rx-9},${gy-5} Z`} fill={lensFill} opacity={lensOp} stroke={frameColor} strokeWidth={fw} />);
    } else if (gl === 'cat_eye') {
      glassesEls.push(<path key="l" d={`M ${lx-9},${gy-2} Q ${lx-10},${gy+6} ${lx},${gy+6} Q ${lx+9},${gy+6} ${lx+10},${gy-2} Q ${lx+12},${gy-7} ${lx-9},${gy-2} Z`} fill={lensFill} opacity={lensOp} stroke={frameColor} strokeWidth={fw} />);
      glassesEls.push(<path key="r" d={`M ${rx+9},${gy-2} Q ${rx+10},${gy+6} ${rx},${gy+6} Q ${rx-9},${gy+6} ${rx-10},${gy-2} Q ${rx-12},${gy-7} ${rx+9},${gy-2} Z`} fill={lensFill} opacity={lensOp} stroke={frameColor} strokeWidth={fw} />);
    } else if (gl === 'wayfarer') {
      // bold trapezoidal acetate frames
      glassesEls.push(<path key="l" d={`M ${lx-10},${gy-6} L ${lx+9},${gy-6} L ${lx+8},${gy+6} L ${lx-9},${gy+6} Z`} fill={lensFill} opacity={lensOp} stroke={frameColor} strokeWidth={2.6} strokeLinejoin="round" />);
      glassesEls.push(<path key="r" d={`M ${rx+10},${gy-6} L ${rx-9},${gy-6} L ${rx-8},${gy+6} L ${rx+9},${gy+6} Z`} fill={lensFill} opacity={lensOp} stroke={frameColor} strokeWidth={2.6} strokeLinejoin="round" />);
    } else if (gl === 'rimless') {
      // minimal frameless lenses
      glassesEls.push(<rect key="l" x={lx-9} y={gy-5} width={18} height={10} rx={3} fill="none" stroke="#9aa3b2" strokeWidth={1} opacity={0.85} />);
      glassesEls.push(<rect key="r" x={rx-9} y={gy-5} width={18} height={10} rx={3} fill="none" stroke="#9aa3b2" strokeWidth={1} opacity={0.85} />);
    } else if (gl === 'sport_wrap') {
      // single curved wraparound shade across both eyes
      glassesEls.push(<path key="sw" d={`M ${HX-28},${gy-7} Q ${HX},${gy-10} ${HX+28},${gy-7} Q ${HX+30},${gy} ${HX+26},${gy+7} Q ${HX},${gy+4} ${HX-26},${gy+7} Q ${HX-30},${gy} ${HX-28},${gy-7} Z`} fill={lensFill} opacity={lensOp} stroke={frameColor} strokeWidth={1.6} />);
      glassesEls.push(<line key="swh" x1={HX-26} y1={gy-3} x2={HX+26} y2={gy-3} stroke="#fff" strokeWidth={0.8} opacity={0.3} />);
    } else if (gl === 'monocle') {
      // single round lens on one eye with a hanging chain
      glassesEls.push(<circle key="r" cx={rx} cy={gy} r={8.5} fill={lensFill} opacity={lensOp} stroke="#caa24a" strokeWidth={1.6} />);
      glassesEls.push(<path key="ch" d={`M ${rx},${gy+8.5} Q ${rx+4},${gy+20} ${rx-2},${gy+30}`} fill="none" stroke="#caa24a" strokeWidth={0.8} opacity={0.8} />);
    } else {
      // regular / sunglasses / thick / half_rim
      const ry2 = gl === 'half_rim' ? 5 : 6;
      glassesEls.push(<rect key="l" x={lx-9} y={gy-ry2} width={18} height={ry2*2} rx={4} fill={lensFill} opacity={lensOp} stroke={frameColor} strokeWidth={fw} />);
      glassesEls.push(<rect key="r" x={rx-9} y={gy-ry2} width={18} height={ry2*2} rx={4} fill={lensFill} opacity={lensOp} stroke={frameColor} strokeWidth={fw} />);
    }
    if (gl !== 'sport_wrap' && gl !== 'monocle') {
      glassesEls.push(<line key="br" x1={lx+9} y1={gy} x2={rx-9} y2={gy} stroke={frameColor} strokeWidth={fw} />);
      glassesEls.push(<line key="aL" x1={lx-9} y1={gy} x2={HX-34} y2={gy-3} stroke={frameColor} strokeWidth={fw} />);
      glassesEls.push(<line key="aR" x1={rx+9} y1={gy} x2={HX+34} y2={gy-3} stroke={frameColor} strokeWidth={fw} />);
    } else if (gl === 'sport_wrap') {
      glassesEls.push(<line key="aL" x1={HX-28} y1={gy-3} x2={HX-34} y2={gy-4} stroke={frameColor} strokeWidth={fw} />);
      glassesEls.push(<line key="aR" x1={HX+28} y1={gy-3} x2={HX+34} y2={gy-4} stroke={frameColor} strokeWidth={fw} />);
    }
  }

  // ---- Background scene ----
  const renderBackground = () => {
    if (bg === 'spotlight') {
      return <>
        <rect x={0} y={0} width={200} height={360} fill={`url(#${uid}-bgSpot)`} />
        <path d="M 60,0 L 140,0 L 188,300 L 12,300 Z" fill="#fff6d0" opacity={0.10} />
      </>;
    }
    if (bg === 'neon') {
      return <>
        <rect x={0} y={0} width={200} height={360} fill="#0a0a18" />
        <rect x={0} y={0} width={200} height={360} fill={`url(#${uid}-bgNeon)`} opacity={0.5} />
        <circle cx={40} cy={60} r={3} fill="#ff3df0" opacity={0.7} />
        <circle cx={160} cy={90} r={3} fill="#3df0ff" opacity={0.7} />
        <rect x={20} y={40} width={36} height={4} rx={2} fill="#ff3df0" opacity={0.6} />
        <rect x={148} y={70} width={32} height={4} rx={2} fill="#3df0ff" opacity={0.6} />
      </>;
    }
    if (bg === 'gold_confetti') {
      const dots: JSX.Element[] = [<rect key="bgc" x={0} y={0} width={200} height={360} fill="#1a1208" />];
      const cols = ['#f5c842', '#ffd966', '#fff1b8', '#c9a227'];
      for (let i = 0; i < 26; i++) {
        const cx = (i * 53) % 196 + 4, cy = (i * 89) % 320 + 8;
        dots.push(<rect key={`cf${i}`} x={cx} y={cy} width={5} height={8} rx={1.5} fill={cols[i % cols.length]} opacity={0.85} transform={`rotate(${(i * 47) % 360} ${cx} ${cy})`} />);
      }
      return <>{dots}</>;
    }
    if (bg === 'casino_floor') {
      const els: JSX.Element[] = [<rect key="cf" x={0} y={0} width={200} height={360} fill={`url(#${uid}-bgFloor)`} />];
      for (let i = 0; i < 6; i++) els.push(<line key={`fl${i}`} x1={0} y1={250 + i * 18} x2={200} y2={250 + i * 18} stroke="#6a2a2a" strokeWidth={1} opacity={0.4} />);
      els.push(<circle key="chip" cx={30} cy={300} r={9} fill="#d33" stroke="#fff" strokeWidth={2} opacity={0.6} />);
      els.push(<circle key="chip2" cx={172} cy={314} r={9} fill="#2a6" stroke="#fff" strokeWidth={2} opacity={0.6} />);
      return <>{els}</>;
    }
    if (bg === 'penthouse') {
      return <>
        <rect x={0} y={0} width={200} height={360} fill={`url(#${uid}-bgPent)`} />
        <rect x={14} y={20} width={172} height={210} fill="#11203a" opacity={0.5} rx={4} />
        {[40, 78, 116, 154].map(x => <line key={`v${x}`} x1={x} y1={20} x2={x} y2={230} stroke="#2a3f63" strokeWidth={1} opacity={0.6} />)}
        {[60, 100, 140, 180].map(y => <line key={`h${y}`} x1={14} y1={y} x2={186} y2={y} stroke="#2a3f63" strokeWidth={1} opacity={0.5} />)}
        {[28, 64, 96, 132, 168].map((x, i) => <rect key={`win${i}`} x={x} y={150 + (i % 3) * 14} width={6} height={10} fill="#ffd966" opacity={0.8} />)}
      </>;
    }
    // plain
    return <rect x={0} y={0} width={200} height={360} fill={`url(#${uid}-bgPlain)`} />;
  };

  // ---- Premium glow flag ----
  const premiumGlow = special.length > 0;

  return (
    <svg width={px} height={pxH} viewBox="0 0 200 360" style={{ display: 'block', overflow: 'visible' }} role="img" aria-label="Your avatar">
      <defs>
        <radialGradient id={`${uid}-skin`} cx="42%" cy="34%" r="78%">
          <stop offset="0%" stopColor={skinLight} />
          <stop offset="62%" stopColor={skin} />
          <stop offset="100%" stopColor={skinShadow} />
        </radialGradient>
        {hairIsGradient && hairId === 'rainbow' && (
          <linearGradient id={`${uid}-hair`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff3b30" /><stop offset="20%" stopColor="#ff9500" />
            <stop offset="40%" stopColor="#ffcc00" /><stop offset="60%" stopColor="#34c759" />
            <stop offset="80%" stopColor="#0a84ff" /><stop offset="100%" stopColor="#bf5af2" />
          </linearGradient>
        )}
        {hairIsGradient && hairId === 'ombre_blonde' && (
          <linearGradient id={`${uid}-hair`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3D2314" /><stop offset="100%" stopColor="#E6BE8A" />
          </linearGradient>
        )}
        {hairIsGradient && hairId === 'ombre_red' && (
          <linearGradient id={`${uid}-hair`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1C1C1C" /><stop offset="100%" stopColor="#B7410E" />
          </linearGradient>
        )}
        {hairIsGradient && !['rainbow', 'ombre_blonde', 'ombre_red'].includes(hairId) && (
          <linearGradient id={`${uid}-hair`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={hairShadow} /><stop offset="100%" stopColor={hairHi} />
          </linearGradient>
        )}
        <radialGradient id={`${uid}-bgPlain`} cx="50%" cy="32%" r="80%">
          <stop offset="0%" stopColor="#22222f" /><stop offset="100%" stopColor="#0a0a0f" />
        </radialGradient>
        <radialGradient id={`${uid}-bgSpot`} cx="50%" cy="26%" r="70%">
          <stop offset="0%" stopColor="#4a4636" /><stop offset="55%" stopColor="#1a1814" /><stop offset="100%" stopColor="#08070a" />
        </radialGradient>
        <linearGradient id={`${uid}-bgNeon`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff3df0" /><stop offset="100%" stopColor="#3df0ff" />
        </linearGradient>
        <linearGradient id={`${uid}-bgFloor`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2a0d0d" /><stop offset="100%" stopColor="#120505" />
        </linearGradient>
        <linearGradient id={`${uid}-bgPent`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0c1830" /><stop offset="100%" stopColor="#05080f" />
        </linearGradient>
        <filter id={`${uid}-glow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <style>{`
          @keyframes ${uid}-breathe { 0%,100% { transform: translateY(0) translateX(0) scaleY(1); } 25% { transform: translateY(-1.2px) translateX(-0.5px) scaleY(1.006); } 50% { transform: translateY(-2.5px) translateX(0) scaleY(1.012); } 75% { transform: translateY(-1.2px) translateX(0.5px) scaleY(1.006); } }
          @keyframes ${uid}-sparkle { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
          @keyframes ${uid}-blink { 0%, 92%, 100% { transform: scaleY(1); } 95.5%, 96.5% { transform: scaleY(0.08); } }
          @keyframes ${uid}-sway { 0%, 100% { transform: rotate(-1.1deg) translateY(0); } 25% { transform: rotate(0deg) translateY(-0.7px); } 50% { transform: rotate(1.1deg) translateY(0); } 75% { transform: rotate(0deg) translateY(-0.7px); } }
          @keyframes ${uid}-brows { 0%, 70%, 100% { transform: translateY(0); } 80%, 88% { transform: translateY(-1.3px); } }
          @keyframes ${uid}-mouth { 0%, 100% { transform: translateY(0) scaleY(1); } 50% { transform: translateY(0.5px) scaleY(0.965); } }
          @keyframes ${uid}-gaze { 0%, 44%, 100% { transform: translateX(0); } 54%, 90% { transform: translateX(1.7px); } }
          @keyframes ${uid}-nod { 0%, 30%, 100% { transform: rotate(0deg); } 40%, 48% { transform: rotate(1.4deg); } }
          @keyframes ${uid}-headturn { 0%, 16%, 100% { transform: translateX(0); } 50%, 60% { transform: translateX(-1.5px); } }
          @keyframes ${uid}-hairdrift { 0%, 100% { transform: rotate(-0.6deg) translateX(-0.3px); } 50% { transform: rotate(0.6deg) translateX(0.3px); } }
          @keyframes ${uid}-shift { 0%, 100% { transform: rotate(-0.45deg) translateX(-0.6px); } 50% { transform: rotate(0.45deg) translateX(0.6px); } }
          @keyframes ${uid}-armsettle { 0%, 100% { transform: rotate(0deg) translateY(0); } 30% { transform: rotate(0.55deg) translateY(0.7px); } 60% { transform: rotate(-0.3deg) translateY(0.3px); } }
          @keyframes ${uid}-shoulder { 0%, 100% { transform: rotate(0deg); } 35% { transform: rotate(0.6deg); } 70% { transform: rotate(-0.4deg); } }
          @media (prefers-reduced-motion: reduce) { .avatar-motion { animation: none !important; } }
        `}</style>
      </defs>

      {/* Background scene */}
      <g>{renderBackground()}</g>

      {/* Soft ground shadow */}
      <ellipse cx={HX} cy={footY + 8} rx={46} ry={9} fill="#000" opacity={0.34} />

      <g className="avatar-motion" style={{ animation: `${uid}-breathe 4.5s ease-in-out infinite, ${uid}-shift 11s ease-in-out infinite`, transformOrigin: '100px 200px' }}>

        {/* Angel wings (behind torso) */}
        {has(special, 'angel_wings') && (
          <g filter={`url(#${uid}-glow)`} opacity={0.92}>
            <path d={`M ${HX-20},170 Q ${HX-86},120 ${HX-92},196 Q ${HX-70},176 ${HX-20},206 Z`} fill="#fdfdff" stroke="#dfe6ff" strokeWidth={1} />
            <path d={`M ${HX+20},170 Q ${HX+86},120 ${HX+92},196 Q ${HX+70},176 ${HX+20},206 Z`} fill="#fdfdff" stroke="#dfe6ff" strokeWidth={1} />
          </g>
        )}
        {/* Devil horns drawn later above hair */}

        {/* Back hair */}
        <g>{hairBack}</g>

        {/* ---- BODY ---- */}
        {/* Legs (skin base) */}
        {!isGown && (<>
          <path d={`M ${HX-hipHW*0.5},${hipY} Q ${HX-14},${(hipY+ankleY)/2} ${HX-12},${ankleY} L ${HX-3},${ankleY} Q ${HX-2},${(hipY+ankleY)/2} ${HX-3},${hipY} Z`} fill={skin} />
          <path d={`M ${HX+hipHW*0.5},${hipY} Q ${HX+14},${(hipY+ankleY)/2} ${HX+12},${ankleY} L ${HX+3},${ankleY} Q ${HX+2},${(hipY+ankleY)/2} ${HX+3},${hipY} Z`} fill={skin} />
        </>)}

        {/* Bottoms garment */}
        {(() => {
          if (isGown) return null;
          if (bottom === 'skirt' || bottom === 'mini_skirt' || bottom === 'pleated_skirt') {
            const hemY = bottom === 'mini_skirt' ? 286 : 304;
            const skirtPath = <path d={`M ${HX-wHW},${hipY-2} L ${HX+wHW},${hipY-2} L ${HX+hipHW+8},${hemY} Q ${HX},${hemY+8} ${HX-hipHW-8},${hemY} Z`} fill={bottomColor} stroke={bottomDark} strokeWidth={0.6} />;
            if (bottom === 'pleated_skirt') {
              const pleats: JSX.Element[] = [];
              for (let i = 0; i < 7; i++) {
                const t = i / 6;
                const xTop = HX - wHW + t * (wHW * 2);
                const xBot = HX - hipHW - 8 + t * ((hipHW + 8) * 2);
                pleats.push(<line key={`pl${i}`} x1={xTop} y1={hipY} x2={xBot} y2={hemY} stroke={bottomDark} strokeWidth={1} opacity={0.55} />);
              }
              return <g>{skirtPath}<rect x={HX-wHW} y={hipY-2} width={wHW*2} height={4} fill={bottomDark} opacity={0.5} />{pleats}</g>;
            }
            return skirtPath;
          }
          const legEndY = bottom === 'shorts' ? kneeY - 8 : bottom === 'capris' ? (kneeY + ankleY) / 2 : ankleY + 2;
          const legW = bottom === 'leggings' ? 9 : bottom === 'wide_leg' ? 18 : bottom === 'bootcut' ? 16 : bottom === 'joggers' || bottom === 'sweatpants' || bottom === 'tracksuit' || bottom === 'track_pants' ? 14 : 12;
          const stripe = bottom === 'tracksuit' || bottom === 'track_pants';
          const cuffed = bottom === 'track_pants';
          return <g>
            <path d={`M ${HX-hipHW},${hipY-4} L ${HX+hipHW},${hipY-4} L ${HX+hipHW-2},${hipY+30} L ${HX+legW},${legEndY} L ${HX+2},${legEndY} L ${HX},${hipY+34} L ${HX-2},${legEndY} L ${HX-legW},${legEndY} L ${HX-hipHW+2},${hipY+30} Z`} fill={bottomColor} stroke={bottomDark} strokeWidth={0.6} />
            {stripe && <>
              <line x1={HX-hipHW+4} y1={hipY} x2={HX-legW+1} y2={legEndY} stroke="#fff" strokeWidth={2} opacity={0.7} />
              <line x1={HX+hipHW-4} y1={hipY} x2={HX+legW-1} y2={legEndY} stroke="#fff" strokeWidth={2} opacity={0.7} />
            </>}
            {cuffed && <>
              <rect x={HX-legW-1} y={legEndY-5} width={legW-1} height={5} rx={1.5} fill={bottomDark} opacity={0.8} />
              <rect x={HX+2} y={legEndY-5} width={legW-1} height={5} rx={1.5} fill={bottomDark} opacity={0.8} />
            </>}
            {(bottom === 'jeans' || bottom === 'bootcut') && <line x1={HX} y1={hipY} x2={HX} y2={legEndY} stroke={bottomDark} strokeWidth={1} opacity={0.5} />}
          </g>;
        })()}

        {/* Shoes */}
        {(() => {
          const sy = footY;
          const shoeFor = (cx: number) => {
            if (avatar.shoesStyle === 'high_heels') {
              return <g key={`sh${cx}`}><path d={`M ${cx-7},${sy-4} L ${cx+12},${sy-4} L ${cx+13},${sy} L ${cx-2},${sy} Z`} fill={shoesColor} stroke={shoesDark} strokeWidth={0.6} /><rect x={cx-3} y={sy} width={3} height={9} fill={shoesDark} /></g>;
            }
            if (avatar.shoesStyle === 'boots' || avatar.shoesStyle === 'timberlands') {
              const bootCol = avatar.shoesStyle === 'timberlands' ? '#c79a4a' : shoesColor;
              return <g key={`sh${cx}`}><rect x={cx-7} y={sy-16} width={14} height={16} rx={2} fill={bootCol} stroke={avShade(bootCol, -0.3)} strokeWidth={0.6} /><path d={`M ${cx-9},${sy} L ${cx+14},${sy} L ${cx+14},${sy+6} Q ${cx},${sy+9} ${cx-9},${sy+5} Z`} fill={avShade(bootCol, -0.2)} /></g>;
            }
            if (avatar.shoesStyle === 'dress_shoes' || avatar.shoesStyle === 'loafers') {
              return <path key={`sh${cx}`} d={`M ${cx-7},${sy-3} L ${cx+8},${sy-3} Q ${cx+18},${sy-2} ${cx+18},${sy+3} Q ${cx},${sy+6} ${cx-7},${sy+3} Z`} fill={shoesColor} stroke={shoesDark} strokeWidth={0.6} />;
            }
            if (avatar.shoesStyle === 'sandals') {
              return <g key={`sh${cx}`}><path d={`M ${cx-7},${sy+2} L ${cx+13},${sy+2} L ${cx+13},${sy+5} L ${cx-7},${sy+5} Z`} fill={shoesColor} /><path d={`M ${cx-2},${sy+2} l 4,-6 M ${cx+4},${sy+2} l 2,-6`} stroke={shoesDark} strokeWidth={1.4} /></g>;
            }
            if (avatar.shoesStyle === 'slides') {
              // flat slide with a single wide strap band
              return <g key={`sh${cx}`}><rect x={cx-7} y={sy+1} width={20} height={4} rx={1.5} fill={shoesColor} stroke={shoesDark} strokeWidth={0.5} /><path d={`M ${cx-3},${sy+1} Q ${cx+5},${sy-6} ${cx+11},${sy+1} Z`} fill={shoesColor} stroke={shoesDark} strokeWidth={0.6} /></g>;
            }
            if (avatar.shoesStyle === 'chelsea') {
              // ankle boot with elastic side panel
              return <g key={`sh${cx}`}><rect x={cx-7} y={sy-10} width={14} height={10} rx={2} fill={shoesColor} stroke={shoesDark} strokeWidth={0.6} /><path d={`M ${cx-8},${sy} L ${cx+15},${sy} Q ${cx+18},${sy} ${cx+18},${sy+4} Q ${cx},${sy+6} ${cx-8},${sy+3} Z`} fill={shoesDark} /><rect x={cx+2} y={sy-9} width={4} height={8} rx={1} fill={avShade(shoesColor, -0.18)} /></g>;
            }
            if (avatar.shoesStyle === 'platforms') {
              // chunky elevated sole under a rounded upper
              return <g key={`sh${cx}`}>
                <path d={`M ${cx-8},${sy-9} Q ${cx-9},${sy-3} ${cx-7},${sy-3} L ${cx+15},${sy-3} Q ${cx+18},${sy-4} ${cx+17},${sy-9} Q ${cx+4},${sy-12} ${cx-8},${sy-9} Z`} fill={shoesColor} stroke={shoesDark} strokeWidth={0.6} />
                <rect x={cx-9} y={sy-3} width={28} height={8} rx={2} fill={avShade(shoesColor, -0.12)} stroke={shoesDark} strokeWidth={0.5} />
              </g>;
            }
            if (avatar.shoesStyle === 'running_shoes') {
              // sleek low-profile runner with a contrast midsole + swoosh accent
              return <g key={`sh${cx}`}>
                <path d={`M ${cx-8},${sy-7} Q ${cx-10},${sy-1} ${cx-7},${sy} L ${cx+14},${sy} Q ${cx+20},${sy-2} ${cx+18},${sy-7} Q ${cx+4},${sy-10} ${cx-8},${sy-7} Z`} fill={shoesColor} stroke={shoesDark} strokeWidth={0.6} />
                <path d={`M ${cx-9},${sy} L ${cx+19},${sy} Q ${cx+21},${sy+1} ${cx+19},${sy+4} Q ${cx},${sy+6} ${cx-9},${sy+3} Z`} fill={avShade(shoesColor, 0.25)} stroke={shoesDark} strokeWidth={0.5} />
                <path d={`M ${cx+1},${sy-6} q 6,1 9,5`} fill="none" stroke="#fff" strokeWidth={1.2} opacity={0.7} />
              </g>;
            }
            if (avatar.shoesStyle === 'cleats') {
              // low athletic shoe with studded sole
              return <g key={`sh${cx}`}>
                <path d={`M ${cx-8},${sy-6} Q ${cx-9},${sy-1} ${cx-7},${sy} L ${cx+15},${sy} Q ${cx+19},${sy-1} ${cx+17},${sy-6} Q ${cx+4},${sy-8} ${cx-8},${sy-6} Z`} fill={shoesColor} stroke={shoesDark} strokeWidth={0.6} />
                <rect x={cx-9} y={sy} width={28} height={2.4} fill={shoesDark} />
                {[0,1,2,3].map(i => <rect key={`cl${i}`} x={cx-7+i*7} y={sy+2.4} width={2} height={2.6} fill={shoesDark} />)}
              </g>;
            }
            if (avatar.shoesStyle === 'mary_janes') {
              // rounded flat with an ankle strap and button
              return <g key={`sh${cx}`}>
                <path d={`M ${cx-7},${sy-3} Q ${cx+2},${sy-6} ${cx+12},${sy-3} Q ${cx+18},${sy-2} ${cx+17},${sy+2} Q ${cx},${sy+5} ${cx-7},${sy+2} Z`} fill={shoesColor} stroke={shoesDark} strokeWidth={0.6} />
                <path d={`M ${cx-1},${sy-5} l 0,-4 l 6,0 l 0,4`} fill="none" stroke={shoesDark} strokeWidth={1.2} />
                <circle cx={cx+5} cy={sy-9} r={1.1} fill={shoesDark} />
              </g>;
            }
            if (avatar.shoesStyle === 'cowboy_boots') {
              // shafted boot with a slanted heel and stitch line
              return <g key={`sh${cx}`}>
                <path d={`M ${cx-7},${sy-20} L ${cx+7},${sy-20} L ${cx+7},${sy-2} L ${cx+20},${sy} Q ${cx+22},${sy+1} ${cx+20},${sy+3} L ${cx-7},${sy+3} Z`} fill={shoesColor} stroke={avShade(shoesColor, -0.3)} strokeWidth={0.6} />
                <rect x={cx-7} y={sy+3} width={6} height={6} fill={avShade(shoesColor, -0.3)} />
                <path d={`M ${cx-7},${sy-13} l 14,0`} stroke={avShade(shoesColor, 0.22)} strokeWidth={0.8} />
              </g>;
            }
            // sneakers / jordans / yeezys / high-tops (chunky)
            return <g key={`sh${cx}`}>
              {avatar.shoesStyle === 'hightops' && <rect x={cx-7} y={sy-15} width={14} height={10} rx={2.5} fill={shoesColor} stroke={shoesDark} strokeWidth={0.6} />}
              <path d={`M ${cx-8},${sy-7} Q ${cx-9},${sy-2} ${cx-7},${sy} L ${cx+12},${sy} Q ${cx+18},${sy-1} ${cx+17},${sy-6} Q ${cx+4},${sy-9} ${cx-8},${sy-7} Z`} fill={shoesColor} stroke={shoesDark} strokeWidth={0.6} />
              <path d={`M ${cx-9},${sy} L ${cx+18},${sy} L ${cx+18},${sy+4} Q ${cx},${sy+6} ${cx-9},${sy+3} Z`} fill="#f4f4f4" stroke={shoesDark} strokeWidth={0.5} />
              {avatar.shoesStyle === 'jordans' && <path d={`M ${cx+2},${sy-7} l 4,3 l -1,4`} stroke={shoesDark} strokeWidth={1} fill="none" />}
              {avatar.shoesStyle === 'hightops' && <circle cx={cx-2} cy={sy-9} r={1} fill={shoesDark} />}
            </g>;
          };
          return <g>{shoeFor(HX - 12)}{shoeFor(HX + 2)}</g>;
        })()}

        {/* Neck */}
        <path d={`M ${HX-neckHW},126 L ${HX+neckHW},126 L ${HX+neckHW+1},${shoulderY-2} L ${HX-neckHW-1},${shoulderY-2} Z`} fill={skin} />
        <path d={`M ${HX-neckHW},126 L ${HX+neckHW},126 L ${HX+neckHW},134 Q ${HX},140 ${HX-neckHW},134 Z`} fill={skinShadow} opacity={0.5} />

        {/* Gown / dress overrides bottoms+torso lower */}
        {isGown && (
          <path d={`M ${HX-shHW},${shoulderY} Q ${HX-shHW-4},${shoulderY+40} ${HX-wHW-2},${waistY} L ${HX-hipHW-22},${footY-2} Q ${HX},${footY+10} ${HX+hipHW+22},${footY-2} L ${HX+wHW+2},${waistY} Q ${HX+shHW+4},${shoulderY+40} ${HX+shHW},${shoulderY} Q ${HX},${shoulderY-6} ${HX-shHW},${shoulderY} Z`} fill={isGown && hasDesignerDress ? '#b9134a' : topColor} stroke={avShade(isGown && hasDesignerDress ? '#b9134a' : topColor, -0.25)} strokeWidth={0.8} filter={hasDesignerDress ? `url(#${uid}-glow)` : undefined} />
        )}

        {/* Torso / top garment (skip if gown) */}
        {!isGown && (() => {
          const garmentColor = hasFurCoat ? '#8a5a2a' : isSuit && hasDesignerSuit ? '#15151f' : topColor;
          const gDark = avShade(garmentColor, -0.24);
          const torsoPath = `M ${HX-shHW},${shoulderY+4} C ${HX-shHW-3},${shoulderY+30} ${HX-wHW-4},${shoulderY+52} ${HX-wHW},${waistY} L ${HX+wHW},${waistY} C ${HX+wHW+4},${shoulderY+52} ${HX+shHW+3},${shoulderY+30} ${HX+shHW},${shoulderY+4} Q ${HX},${shoulderY-6} ${HX-shHW},${shoulderY+4} Z`;
          const details: JSX.Element[] = [];
          // collar / neckline
          if (top === 'turtleneck') details.push(<rect key="tn" x={HX-neckHW-2} y={120} width={(neckHW+2)*2} height={18} rx={5} fill={garmentColor} />);
          else if (top === 'tshirt' || top === 'jersey' || top === 'tracksuit') details.push(<path key="crew" d={`M ${HX-12},${shoulderY+2} Q ${HX},${shoulderY+12} ${HX+12},${shoulderY+2}`} fill="none" stroke={gDark} strokeWidth={2} />);
          else if (top === 'polo' || top === 'button_up' || top === 'tracksuit') {
            details.push(<path key="colL" d={`M ${HX-3},${shoulderY} L ${HX-14},${shoulderY+10} L ${HX-3},${shoulderY+12} Z`} fill={topLight} />);
            details.push(<path key="colR" d={`M ${HX+3},${shoulderY} L ${HX+14},${shoulderY+10} L ${HX+3},${shoulderY+12} Z`} fill={topLight} />);
          }
          if (top === 'button_up' || isSuit || hasFurCoat || top === 'trench_coat' || top === 'overalls') {
            details.push(<line key="placket" x1={HX} y1={shoulderY+6} x2={HX} y2={waistY-4} stroke={gDark} strokeWidth={1.4} />);
            const btnN = top === 'trench_coat' ? 4 : 3;
            for (let i = 0; i < btnN; i++) details.push(<circle key={`btn${i}`} cx={HX} cy={shoulderY+24+i*22} r={2} fill={top === 'trench_coat' || isSuit ? '#caa24a' : '#ffffff'} opacity={0.85} />);
          }
          if (isSuit) {
            details.push(<path key="lapL" d={`M ${HX},${shoulderY+4} L ${HX-20},${shoulderY+18} L ${HX-6},${waistY-30} Z`} fill={avShade(garmentColor, 0.08)} />);
            details.push(<path key="lapR" d={`M ${HX},${shoulderY+4} L ${HX+20},${shoulderY+18} L ${HX+6},${waistY-30} Z`} fill={avShade(garmentColor, 0.08)} />);
            details.push(<path key="shirt" d={`M ${HX-6},${shoulderY+10} L ${HX+6},${shoulderY+10} L ${HX+4},${waistY-30} L ${HX-4},${waistY-30} Z`} fill="#f4f4f4" />);
            details.push(<path key="tie" d={`M ${HX-3},${shoulderY+12} L ${HX+3},${shoulderY+12} L ${HX+4},${waistY-40} L ${HX},${waistY-32} L ${HX-4},${waistY-40} Z`} fill="#9a1b2e" />);
          }
          if (top === 'vest') details.push(<path key="vest" d={`M ${HX-10},${shoulderY+6} L ${HX},${waistY-20} L ${HX+10},${shoulderY+6} Z`} fill={skin} />);
          if (top === 'jersey') details.push(<text key="num" x={HX} y={shoulderY+48} textAnchor="middle" fontSize="20" fontWeight="800" fill={topLight}>23</text>);
          if (top === 'varsity_jacket') { details.push(<text key="vletter" x={HX} y={shoulderY+44} textAnchor="middle" fontSize="18" fontWeight="900" fill={topLight}>D</text>); details.push(<line key="vstripe" x1={HX-shHW} y1={waistY-6} x2={HX+shHW} y2={waistY-6} stroke={topLight} strokeWidth={3} />); }
          if (top === 'overalls') { details.push(<line key="ovL" x1={HX-14} y1={shoulderY} x2={HX-10} y2={shoulderY+30} stroke={gDark} strokeWidth={4} />); details.push(<line key="ovR" x1={HX+14} y1={shoulderY} x2={HX+10} y2={shoulderY+30} stroke={gDark} strokeWidth={4} />); }
          if (top === 'hoodie') { details.push(<path key="hood" d={`M ${HX-16},${shoulderY+2} Q ${HX},${shoulderY+24} ${HX+16},${shoulderY+2} Q ${HX},${shoulderY-4} ${HX-16},${shoulderY+2} Z`} fill={gDark} />); details.push(<line key="dsL" x1={HX-5} y1={shoulderY+14} x2={HX-5} y2={shoulderY+34} stroke="#eee" strokeWidth={1.6} />); details.push(<line key="dsR" x1={HX+5} y1={shoulderY+14} x2={HX+5} y2={shoulderY+34} stroke="#eee" strokeWidth={1.6} />); details.push(<rect key="pkt" x={HX-16} y={waistY-32} width={32} height={18} rx={3} fill={gDark} opacity={0.5} />); }
          if (top === 'leather_jacket' || top === 'jacket') { details.push(<line key="zip" x1={HX} y1={shoulderY+6} x2={HX} y2={waistY-4} stroke={gDark} strokeWidth={2} />); if (top === 'leather_jacket') details.push(<path key="shine" d={`M ${HX-shHW+6},${shoulderY+14} Q ${HX-10},${shoulderY+40} ${HX-shHW+10},${waistY-20}`} fill="none" stroke={topLight} strokeWidth={3} opacity={0.4} />); }
          if (top === 'crop_top') details.push(<rect key="crop" x={HX-wHW} y={waistY-26} width={wHW*2} height={26} fill={skin} />);
          if (hasFurCoat) { for (let i = 0; i < 14; i++) { const fx = HX-shHW+2 + (i*(shHW*2-4))/13; details.push(<circle key={`fur${i}`} cx={fx} cy={shoulderY+6} r={5} fill="#a06a32" />); details.push(<circle key={`furw${i}`} cx={fx} cy={waistY-4} r={5} fill="#a06a32" />); } }
          if (top === 'sweater') {
            // crew neckline + ribbed hem + collar band for a knit look
            details.push(<path key="swneck" d={`M ${HX-13},${shoulderY+2} Q ${HX},${shoulderY+13} ${HX+13},${shoulderY+2}`} fill="none" stroke={gDark} strokeWidth={3} />);
            details.push(<rect key="swhem" x={HX-wHW} y={waistY-7} width={wHW*2} height={7} fill={avShade(garmentColor, -0.12)} />);
            for (let i = 0; i < 5; i++) details.push(<line key={`swr${i}`} x1={HX-wHW+3+i*((wHW*2-6)/4)} y1={waistY-7} x2={HX-wHW+3+i*((wHW*2-6)/4)} y2={waistY} stroke={gDark} strokeWidth={0.8} opacity={0.6} />);
          }
          if (top === 'cardigan') {
            // open front with offset placket + buttons down one side
            details.push(<line key="cgL" x1={HX-3} y1={shoulderY+8} x2={HX-3} y2={waistY-3} stroke={gDark} strokeWidth={1.4} />);
            details.push(<line key="cgR" x1={HX+3} y1={shoulderY+8} x2={HX+3} y2={waistY-3} stroke={gDark} strokeWidth={1.4} />);
            details.push(<path key="cgshirt" d={`M ${HX-3},${shoulderY+10} L ${HX+3},${shoulderY+10} L ${HX+2},${waistY-6} L ${HX-2},${waistY-6} Z`} fill="#f1f1f1" />);
            for (let i = 0; i < 4; i++) details.push(<circle key={`cgb${i}`} cx={HX-3} cy={shoulderY+18+i*18} r={1.6} fill={avShade(garmentColor, 0.2)} />);
          }
          if (top === 'flannel') {
            // button placket + plaid cross-hatch
            details.push(<line key="flpl" x1={HX} y1={shoulderY+6} x2={HX} y2={waistY-4} stroke={gDark} strokeWidth={1.4} />);
            for (let i = 0; i < 3; i++) details.push(<circle key={`flb${i}`} cx={HX} cy={shoulderY+22+i*22} r={1.6} fill="#f4f4f4" opacity={0.85} />);
            for (let i = 0; i < 4; i++) details.push(<line key={`flv${i}`} x1={HX-wHW+6+i*((wHW*2-12)/3)} y1={shoulderY+6} x2={HX-wHW+6+i*((wHW*2-12)/3)} y2={waistY-4} stroke={avShade(garmentColor, -0.28)} strokeWidth={1.2} opacity={0.55} />);
            for (let i = 0; i < 4; i++) details.push(<line key={`flh${i}`} x1={HX-shHW+4} y1={shoulderY+20+i*22} x2={HX+shHW-4} y2={shoulderY+20+i*22} stroke={avShade(garmentColor, -0.28)} strokeWidth={1.2} opacity={0.55} />);
          }
          if (top === 'henley') {
            // short placket with a couple of buttons
            details.push(<path key="hnneck" d={`M ${HX-11},${shoulderY+2} Q ${HX},${shoulderY+11} ${HX+11},${shoulderY+2}`} fill="none" stroke={gDark} strokeWidth={2} />);
            details.push(<line key="hnpl" x1={HX} y1={shoulderY+8} x2={HX} y2={shoulderY+40} stroke={gDark} strokeWidth={1.2} />);
            details.push(<circle key="hnb0" cx={HX} cy={shoulderY+18} r={1.4} fill="#f4f4f4" opacity={0.85} />);
            details.push(<circle key="hnb1" cx={HX} cy={shoulderY+30} r={1.4} fill="#f4f4f4" opacity={0.85} />);
          }
          if (top === 'graphic_tee') {
            // crew neckline + a printed chest graphic (circle badge with a star)
            details.push(<path key="gtneck" d={`M ${HX-12},${shoulderY+2} Q ${HX},${shoulderY+12} ${HX+12},${shoulderY+2}`} fill="none" stroke={gDark} strokeWidth={2} />);
            details.push(<circle key="gtbadge" cx={HX} cy={shoulderY+40} r={13} fill={topLight} opacity={0.9} stroke={gDark} strokeWidth={0.8} />);
            details.push(<path key="gtstar" d={`M ${HX},${shoulderY+31} l 2.4,5 l 5.4,0.6 l -3.9,3.6 l 1.2,5.4 l -5.1,-2.7 l -5.1,2.7 l 1.2,-5.4 l -3.9,-3.6 l 5.4,-0.6 Z`} fill={garmentColor} />);
          }
          if (top === 'zip_hoodie') {
            // hood + full-length center zip with pull + two front pockets
            details.push(<path key="zhhood" d={`M ${HX-16},${shoulderY+2} Q ${HX},${shoulderY+24} ${HX+16},${shoulderY+2} Q ${HX},${shoulderY-4} ${HX-16},${shoulderY+2} Z`} fill={gDark} />);
            details.push(<line key="zhzip" x1={HX} y1={shoulderY+6} x2={HX} y2={waistY-4} stroke={avShade(garmentColor, 0.25)} strokeWidth={1.8} />);
            for (let i = 0; i < 7; i++) details.push(<line key={`zht${i}`} x1={HX-1.6} y1={shoulderY+10+i*((waistY-shoulderY-16)/6)} x2={HX+1.6} y2={shoulderY+10+i*((waistY-shoulderY-16)/6)} stroke={gDark} strokeWidth={0.7} />);
            details.push(<circle key="zhpull" cx={HX} cy={shoulderY+12} r={2.1} fill="#e8e8e8" stroke={gDark} strokeWidth={0.5} />);
            details.push(<path key="zhpkL" d={`M ${HX-wHW+1},${waistY-30} L ${HX-5},${waistY-22} L ${HX-5},${waistY-6} L ${HX-wHW+1},${waistY-6} Z`} fill={gDark} opacity={0.45} />);
            details.push(<path key="zhpkR" d={`M ${HX+wHW-1},${waistY-30} L ${HX+5},${waistY-22} L ${HX+5},${waistY-6} L ${HX+wHW-1},${waistY-6} Z`} fill={gDark} opacity={0.45} />);
          }
          if (top === 'rugby') {
            // polo-style collar + short button placket + horizontal contrast stripes
            const stripeCol = avShade(garmentColor, 0.28);
            for (let i = 0; i < 4; i++) details.push(<rect key={`rgst${i}`} x={HX-shHW} y={shoulderY+16+i*22} width={shHW*2} height={9} fill={stripeCol} opacity={0.7} />);
            details.push(<path key="rgcolL" d={`M ${HX-3},${shoulderY} L ${HX-15},${shoulderY+11} L ${HX-3},${shoulderY+13} Z`} fill="#f4f4f4" />);
            details.push(<path key="rgcolR" d={`M ${HX+3},${shoulderY} L ${HX+15},${shoulderY+11} L ${HX+3},${shoulderY+13} Z`} fill="#f4f4f4" />);
            details.push(<line key="rgpl" x1={HX} y1={shoulderY+8} x2={HX} y2={shoulderY+34} stroke={gDark} strokeWidth={1.2} />);
            details.push(<circle key="rgb0" cx={HX} cy={shoulderY+18} r={1.4} fill="#f4f4f4" />);
            details.push(<circle key="rgb1" cx={HX} cy={shoulderY+28} r={1.4} fill="#f4f4f4" />);
          }
          if (top === 'puffer') {
            // collar + center zip + quilted horizontal channels
            details.push(<rect key="pfcol" x={HX-neckHW-2} y={shoulderY-2} width={(neckHW+2)*2} height={9} rx={3} fill={gDark} />);
            details.push(<line key="pfzip" x1={HX} y1={shoulderY+6} x2={HX} y2={waistY-4} stroke={avShade(garmentColor, 0.22)} strokeWidth={1.8} />);
            for (let i = 1; i < 5; i++) details.push(<path key={`pfq${i}`} d={`M ${HX-shHW+2},${shoulderY+i*((waistY-shoulderY)/5)} Q ${HX},${shoulderY+i*((waistY-shoulderY)/5)+3} ${HX+shHW-2},${shoulderY+i*((waistY-shoulderY)/5)}`} fill="none" stroke={gDark} strokeWidth={1.1} opacity={0.55} />);
          }
          return <g className="avatar-motion" style={{ animation: `${uid}-shoulder 10.3s ease-in-out infinite`, transformOrigin: `${HX}px ${shoulderY}px` }}>
            <path d={torsoPath} fill={garmentColor} stroke={gDark} strokeWidth={0.8} filter={(hasFurCoat || hasDesignerSuit) ? `url(#${uid}-glow)` : undefined} />
            {details}
          </g>;
        })()}

        {/* Arms + hands */}
        {(() => {
          const armW = 6;
          const sleeveColor = sleeveless ? skin : hasFurCoat ? '#8a5a2a' : isSuit && hasDesignerSuit ? '#15151f' : top === 'varsity_jacket' ? '#e8e8e8' : topColor;
          const sleeveEndY = sleeveless ? shoulderY : longSleeve ? 244 : 196;
          const armFor = (sx: number, sign: number) => (
            <g key={`arm${sign}`}>
              {/* upper sleeve */}
              <path d={`M ${sx},${shoulderY} Q ${sx + sign*8},${shoulderY+40} ${sx + sign*4},${sleeveEndY} L ${sx + sign*4 - sign*armW*2},${sleeveEndY} Q ${sx - sign*armW*2 + sign*6},${shoulderY+40} ${sx - sign*armW},${shoulderY} Z`} fill={sleeveColor} stroke={avShade(sleeveColor, -0.2)} strokeWidth={0.5} />
              {/* forearm skin if short sleeve */}
              {!sleeveless && !longSleeve && <rect x={sx + sign*4 - sign*armW*2 - (sign<0?armW:0)} y={sleeveEndY-2} width={armW*1.6} height={48} rx={armW} fill={skin} />}
              {/* hand */}
              <circle cx={sx + sign*2} cy={sleeveless || longSleeve ? sleeveEndY + 6 : sleeveEndY + 46} r={6.5} fill={skin} stroke={skinShadow} strokeWidth={0.5} />
            </g>
          );
          return <g className="avatar-motion" style={{ animation: `${uid}-armsettle 8.7s ease-in-out infinite`, transformOrigin: `${HX}px ${shoulderY}px` }}>{armFor(HX - shHW + 5, -1)}{armFor(HX + shHW - 5, 1)}</g>;
        })()}

        {/* Wrist watch */}
        {(has(jewelry, 'watch_gold') || has(jewelry, 'watch_silver') || has(jewelry, 'rolex') || hasDiamondWatch) && (() => {
          const wy = sleeveless || longSleeve ? 244 + 6 : 244 + 46;
          const wcol = has(jewelry, 'watch_silver') ? '#dcdce0' : '#f5c842';
          return <g filter={hasDiamondWatch ? `url(#${uid}-glow)` : undefined}>
            <rect x={HX + shHW - 5 - 5} y={wy - 10} width={11} height={6} rx={2} fill={wcol} stroke={avShade(wcol, -0.3)} strokeWidth={0.5} />
            {hasDiamondWatch && <circle cx={HX + shHW - 5} cy={wy - 7} r={2.2} fill="#bdf0ff" />}
          </g>;
        })()}

        {/* ---- HEAD ---- (gentle neck-pivot sway, composes over breathe) */}
        <g className="avatar-motion" style={{ animation: `${uid}-sway 6.2s ease-in-out infinite`, transformOrigin: '100px 128px' }}>
        <g className="avatar-motion" style={{ animation: `${uid}-headturn 13.5s ease-in-out infinite`, transformOrigin: '100px 120px' }}>
        <g className="avatar-motion" style={{ animation: `${uid}-nod 9.4s ease-in-out infinite`, transformOrigin: '100px 128px' }}>
        {/* Ears */}
        <ellipse cx={HX - 35} cy={96} rx={5} ry={8} fill={skin} stroke={skinShadow} strokeWidth={0.5} />
        <ellipse cx={HX + 35} cy={96} rx={5} ry={8} fill={skin} stroke={skinShadow} strokeWidth={0.5} />
        {/* Earrings */}
        {(has(jewelry, 'earrings_studs') || has(jewelry, 'earrings_hoops')) && (<>
          {has(jewelry, 'earrings_hoops')
            ? <>
                <circle cx={HX - 35} cy={104} r={3.5} fill="none" stroke="#f5c842" strokeWidth={1.4} />
                <circle cx={HX + 35} cy={104} r={3.5} fill="none" stroke="#f5c842" strokeWidth={1.4} />
              </>
            : <>
                <circle cx={HX - 35} cy={103} r={2} fill="#bdf0ff" stroke="#fff" strokeWidth={0.5} />
                <circle cx={HX + 35} cy={103} r={2} fill="#bdf0ff" stroke="#fff" strokeWidth={0.5} />
              </>}
        </>)}

        {headShape}
        {/* cheek shading */}
        <ellipse cx={HX - 22} cy={104} rx={7} ry={5} fill={skinShadow} opacity={0.28} />
        <ellipse cx={HX + 22} cy={104} rx={7} ry={5} fill={skinShadow} opacity={0.28} />
        {has(faceAcc, 'blush') && (<>
          <ellipse cx={HX - 22} cy={104} rx={7} ry={4.5} fill="#ff7a9a" opacity={0.4} />
          <ellipse cx={HX + 22} cy={104} rx={7} ry={4.5} fill="#ff7a9a" opacity={0.4} />
        </>)}
        {has(faceAcc, 'highlighter') && <ellipse cx={HX} cy={84} rx={6} ry={3} fill="#fff" opacity={0.35} />}

        {/* Front hair (subtle idle drift) */}
        <g className="avatar-motion" style={{ animation: `${uid}-hairdrift 7.8s ease-in-out infinite`, transformOrigin: `${HX}px ${headTop}px` }}>{hairFront}</g>

        {/* Eyebrows (subtle idle micro-raise) */}
        <g className="avatar-motion" style={{ animation: `${uid}-brows 7.3s ease-in-out infinite`, transformOrigin: `${HX}px ${browY}px` }}>
          {renderBrow(-1)}
          {renderBrow(1)}
        </g>

        {/* Eyes */}
        {renderEye(HX - ec.spread, -1)}
        {renderEye(HX + ec.spread, 1)}

        {/* Nose */}
        <g>
          <path d={`M ${HX-1.5},${noseTopY} Q ${HX-nc.w*0.5},${noseTopY+nc.len*0.7} ${HX-nc.w*0.55},${noseTip}`} fill="none" stroke={skinShadow} strokeWidth={1.4} strokeLinecap="round" opacity={0.6} />
          <ellipse cx={HX} cy={noseTip} rx={nc.w*0.5} ry={Math.max(1.6, nc.w*0.3)} fill={skinShadow} opacity={0.45} />
          <ellipse cx={HX - nc.w*0.32} cy={noseTip+1} rx={1.3} ry={1} fill={skinDeep} opacity={0.6} />
          <ellipse cx={HX + nc.w*0.32} cy={noseTip+1} rx={1.3} ry={1} fill={skinDeep} opacity={0.6} />
        </g>

        {/* Facial hair */}
        <g>{facialHair}</g>

        {/* Mouth (gentle idle settle) */}
        <g className="avatar-motion" style={{ animation: `${uid}-mouth 5.1s ease-in-out infinite`, transformOrigin: `${HX}px ${mouthY}px` }}>
          {ms === 'smirk' ? (
            <path d={`M ${HX-mc.w},${mouthY+1} Q ${HX},${mouthY-1} ${HX+mc.w},${mouthY-3}`} fill="none" stroke={lipColor} strokeWidth={2.4} strokeLinecap="round" />
          ) : ms === 'neutral' ? (
            <line x1={HX-mc.w} y1={mouthY} x2={HX+mc.w} y2={mouthY} stroke={lipColor} strokeWidth={2.2} strokeLinecap="round" />
          ) : ms === 'smile' ? (
            <g>
              <path d={`M ${HX-mc.w},${mouthY-1} Q ${HX},${mouthY+mc.low+3} ${HX+mc.w},${mouthY-1} Q ${HX},${mouthY+1} ${HX-mc.w},${mouthY-1} Z`} fill="#fff" stroke={lipColor} strokeWidth={0.6} />
              <path d={`M ${HX-mc.w},${mouthY-1} Q ${HX},${mouthY-mc.up-2} ${HX+mc.w},${mouthY-1}`} fill="none" stroke={lipColor} strokeWidth={2.2} strokeLinecap="round" />
            </g>
          ) : (
            <g>
              <path d={`M ${HX-mc.w},${mouthY} Q ${HX},${mouthY+mc.low} ${HX+mc.w},${mouthY} Q ${HX},${mouthY+1} ${HX-mc.w},${mouthY} Z`} fill={lipLight} />
              <path d={`M ${HX-mc.w},${mouthY} Q ${HX-mc.w*0.4},${mouthY-mc.up} ${HX},${mouthY-0.5} Q ${HX+mc.w*0.4},${mouthY-mc.up} ${HX+mc.w},${mouthY} Q ${HX},${mouthY+1} ${HX-mc.w},${mouthY} Z`} fill={lipColor} />
              <path d={`M ${HX-mc.w*0.85},${mouthY} Q ${HX},${mouthY+1} ${HX+mc.w*0.85},${mouthY}`} fill="none" stroke={avShade(lipColor, -0.35)} strokeWidth={0.8} />
            </g>
          )}
          {hasGoldTeeth && <rect x={HX-mc.w*0.6} y={mouthY-1} width={mc.w*1.2} height={3} rx={1} fill={has(jewelry, 'grills_diamond') ? '#cdeeff' : '#f5c842'} filter={`url(#${uid}-glow)`} />}
        </g>

        {/* Face accessories (tattoos / marks) */}
        {has(faceAcc, 'tear_drop') && <path d={`M ${HX-22},${eyeY+6} q -2,4 0,6 q 2,-2 0,-6 Z`} fill="#2a6fff" />}
        {has(faceAcc, 'beauty_mark') && <circle cx={HX+12} cy={mouthY-6} r={1.6} fill="#3a2a20" />}
        {has(faceAcc, 'freckles') && [...Array(6)].map((_, i) => <circle key={`fr${i}`} cx={HX - 16 + (i % 3) * 6 + (i > 2 ? 22 : 0)} cy={100 + (i % 2) * 4} r={1.1} fill={skinDeep} opacity={0.7} />)}
        {has(faceAcc, 'face_tat_star') && <path d={`M ${HX+24},${eyeY-2} l 1.6,3.4 l 3.6,0.4 l -2.6,2.4 l 0.8,3.6 l -3.4,-1.8 l -3.4,1.8 l 0.8,-3.6 l -2.6,-2.4 l 3.6,-0.4 Z`} fill="#111" />}
        {has(faceAcc, 'face_tat_cross') && <g stroke="#111" strokeWidth={1.6}><line x1={HX-24} y1={eyeY-4} x2={HX-24} y2={eyeY+4} /><line x1={HX-27} y1={eyeY-1} x2={HX-21} y2={eyeY-1} /></g>}
        {has(faceAcc, 'face_tat_tribal') && <path d={`M ${HX+22},${browY-2} q 6,4 4,12 q 4,-6 -1,-12 Z`} fill="#111" opacity={0.85} />}
        {has(faceAcc, 'face_tat_dollar') && <text x={HX-24} y={104} textAnchor="middle" fontSize="11" fontWeight="900" fill="#111">$</text>}
        {has(faceAcc, 'face_jewels') && [0, 1, 2].map(i => <circle key={`jw${i}`} cx={HX - 26} cy={eyeY + 8 + i * 4} r={1.4} fill="#bdf0ff" stroke="#fff" strokeWidth={0.4} />)}

        {/* Glasses */}
        <g>{glassesEls}</g>

        {/* Hat (over hair) */}
        <g>{hatEls}</g>

        {/* Devil horns */}
        {has(special, 'devil_horns') && (
          <g filter={`url(#${uid}-glow)`}>
            <path d={`M ${HX-20},58 Q ${HX-28},40 ${HX-30},48 Q ${HX-26},54 ${HX-16},62 Z`} fill="#c0202e" />
            <path d={`M ${HX+20},58 Q ${HX+28},40 ${HX+30},48 Q ${HX+26},54 ${HX+16},62 Z`} fill="#c0202e" />
          </g>
        )}
        </g>{/* end head nod group */}
        </g>{/* end head micro-turn group */}
        </g>{/* end head sway group */}

        {/* Neck jewelry / chains */}
        {(has(jewelry, 'chain_gold') || has(jewelry, 'chain_silver') || has(jewelry, 'cuban_link') || hasDiamondChain) && (() => {
          const chainCol = has(jewelry, 'chain_silver') ? '#d4d4dc' : '#f5c842';
          const isCuban = has(jewelry, 'cuban_link') || hasDiamondChain;
          return <g filter={hasDiamondChain ? `url(#${uid}-glow)` : undefined}>
            <path d={`M ${HX-neckHW-2},${shoulderY-2} Q ${HX},${shoulderY+18} ${HX+neckHW+2},${shoulderY-2}`} fill="none" stroke={chainCol} strokeWidth={isCuban ? 4 : 2.4} strokeLinecap="round" />
            {isCuban && [...Array(7)].map((_, i) => {
              const t = i / 6;
              const cx = HX - neckHW - 2 + t * (neckHW * 2 + 4);
              const cy = shoulderY - 2 + Math.sin(t * Math.PI) * 18;
              return <rect key={`lk${i}`} x={cx - 2} y={cy - 1.5} width={4} height={3.5} rx={1} fill={hasDiamondChain ? '#cdeeff' : avShade(chainCol, -0.1)} stroke={avShade(chainCol, -0.3)} strokeWidth={0.4} />;
            })}
            {hasDiamondChain && <path d={`M ${HX-4},${shoulderY+14} l 4,-5 l 4,5 l -4,6 Z`} fill="#dff6ff" stroke="#9fd9ff" strokeWidth={0.6} />}
          </g>;
        })()}

        {/* VIP crown (premium, glowing) */}
        {has(special, 'vip_crown') && (
          <g filter={`url(#${uid}-glow)`}>
            <path d={`M ${HX-22},46 L ${HX-22},30 L ${HX-11},40 L ${HX},26 L ${HX+11},40 L ${HX+22},30 L ${HX+22},46 Z`} fill="#ffd54a" stroke="#caa024" strokeWidth={1} />
            <rect x={HX-22} y={44} width={44} height={6} fill="#e8b93a" />
            <circle cx={HX} cy={34} r={2.4} fill="#ff4d6d" />
            <circle cx={HX-14} cy={40} r={2} fill="#34d3ff" />
            <circle cx={HX+14} cy={40} r={2} fill="#34d3ff" />
          </g>
        )}

        {/* Premium sparkle accents */}
        {premiumGlow && [0, 1, 2].map(i => (
          <circle key={`spk${i}`} className="avatar-motion" cx={HX + [-50, 52, 40][i]} cy={[120, 180, 70][i]} r={1.8} fill="#fff6c0" style={{ animation: `${uid}-sparkle ${1.6 + i * 0.4}s ease-in-out infinite ${i * 0.3}s` }} />
        ))}

      </g>
    </svg>
  );
}

// ============================================================================
// AVATAR CREATOR COMPONENT WITH CATEGORY TABS
// ============================================================================

type AvatarCategory = 'face' | 'hair' | 'body' | 'clothing' | 'accessories' | 'special';

function AvatarCreator({
  avatar,
  onUpdate,
  onSave,
  saving,
  goldCoins
}: {
  avatar: AvatarData;
  onUpdate: (updates: Partial<AvatarData>) => void;
  onSave: () => void;
  saving: boolean;
  goldCoins: number;
}) {
  const [activeCategory, setActiveCategory] = useState<AvatarCategory>('face');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  const categories: { id: AvatarCategory; label: string; icon: string }[] = [
    { id: 'face', label: 'Face', icon: '😊' },
    { id: 'hair', label: 'Hair', icon: '💇' },
    { id: 'body', label: 'Body', icon: '🧍' },
    { id: 'clothing', label: 'Clothes', icon: '👕' },
    { id: 'accessories', label: 'Extras', icon: '💎' },
    { id: 'special', label: 'Premium', icon: '👑' },
  ];

  const toggleArrayItem = (arr: string[], item: string): string[] => {
    return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
  };

  const renderOptionGrid = (
    options: Array<{ id: string; name: string; emoji?: string; color?: string }>,
    selectedValue: string,
    onChange: (id: string) => void,
    showColor = false
  ) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: showColor ? 'repeat(6, 1fr)' : 'repeat(4, 1fr)',
      gap: '6px',
      maxHeight: '150px',
      overflowY: 'auto',
      padding: '4px',
    }}>
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          style={{
            padding: showColor ? '8px' : '8px 4px',
            borderRadius: '8px',
            border: selectedValue === opt.id ? `2px solid ${CASINO_THEME.gold}` : `1px solid ${CASINO_THEME.border}`,
            background: showColor && opt.color ? (opt.color.startsWith('linear') ? opt.color : opt.color) : (selectedValue === opt.id ? `${CASINO_THEME.gold}20` : CASINO_THEME.bgElevated),
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            transition: 'all 0.15s ease',
            minHeight: showColor ? '36px' : 'auto',
          }}
        >
          {!showColor && opt.emoji && <span style={{ fontSize: '16px' }}>{opt.emoji}</span>}
          {!showColor && <span style={{ fontSize: '9px', color: selectedValue === opt.id ? CASINO_THEME.gold : CASINO_THEME.textSecondary, fontWeight: selectedValue === opt.id ? 700 : 500 }}>{opt.name}</span>}
        </button>
      ))}
    </div>
  );

  const renderColorPicker = (currentColor: string, onChange: (color: string) => void, label: string) => (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', color: CASINO_THEME.textSecondary }}>{label}</span>
        <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: currentColor, border: `2px solid ${CASINO_THEME.border}` }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '4px' }}>
        {AVATAR_OPTIONS.defaultColors.map(color => (
          <button
            key={color}
            onClick={() => onChange(color)}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              background: color,
              border: currentColor === color ? `2px solid ${CASINO_THEME.gold}` : `1px solid ${CASINO_THEME.border}`,
              cursor: 'pointer',
              transition: 'transform 0.1s ease',
            }}
          />
        ))}
      </div>
    </div>
  );

  const renderMultiSelect = (
    options: Array<{ id: string; name: string; emoji: string; premium?: boolean; color?: string }>,
    selectedItems: string[],
    onChange: (items: string[]) => void
  ) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(toggleArrayItem(selectedItems, opt.id))}
          style={{
            padding: '10px 6px',
            borderRadius: '8px',
            border: selectedItems.includes(opt.id) ? `2px solid ${CASINO_THEME.gold}` : `1px solid ${CASINO_THEME.border}`,
            background: selectedItems.includes(opt.id) ? `${CASINO_THEME.gold}20` : CASINO_THEME.bgElevated,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            position: 'relative',
          }}
        >
          {opt.premium && <span style={{ position: 'absolute', top: 2, right: 2, fontSize: '8px' }}>⭐</span>}
          <span style={{ fontSize: '18px' }}>{opt.emoji}</span>
          <span style={{ fontSize: '9px', color: selectedItems.includes(opt.id) ? CASINO_THEME.gold : CASINO_THEME.textSecondary }}>{opt.name}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      background: `${CASINO_THEME.bgCard}ee`,
      borderRadius: '16px',
      border: `2px solid ${CASINO_THEME.gold}40`,
      padding: '16px',
      boxShadow: `0 0 30px ${CASINO_THEME.goldGlow}20`,
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: CASINO_THEME.gold, marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <User style={{ width: 20, height: 20 }} />
          Avatar Creator
        </h2>
        <p style={{ fontSize: '11px', color: CASINO_THEME.textMuted }}>Customize your casino character</p>
      </div>

      {/* Live Preview */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '16px',
        background: 'linear-gradient(180deg, #1a1a24 0%, #0d0905 100%)',
        borderRadius: '12px',
        border: `1px solid ${CASINO_THEME.border}`,
        minHeight: '200px',
      }}>
        <AvatarPreview avatar={avatar} size="large" />
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        overflowX: 'auto',
        padding: '4px 0',
      }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              flex: '1 0 auto',
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeCategory === cat.id ? CASINO_THEME.gradientGoldMetallic : CASINO_THEME.bgElevated,
              color: activeCategory === cat.id ? CASINO_THEME.bgDark : CASINO_THEME.textSecondary,
              fontWeight: activeCategory === cat.id ? 700 : 500,
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              transition: 'all 0.2s ease',
              minWidth: '50px',
            }}
          >
            <span style={{ fontSize: '16px' }}>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Category Content */}
      <div style={{
        background: CASINO_THEME.bgElevated,
        borderRadius: '12px',
        padding: '12px',
        maxHeight: '300px',
        overflowY: 'auto',
      }}>
        {activeCategory === 'face' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '6px' }}>Skin Tone</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {AVATAR_OPTIONS.skinTones.map(tone => (
                  <button
                    key={tone.id}
                    onClick={() => onUpdate({ skinTone: tone.id })}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: '50%',
                      background: tone.color,
                      border: avatar.skinTone === tone.id ? `3px solid ${CASINO_THEME.gold}` : `2px solid ${CASINO_THEME.border}`,
                      cursor: 'pointer',
                      boxShadow: avatar.skinTone === tone.id ? `0 0 8px ${CASINO_THEME.gold}` : 'none',
                    }}
                    title={tone.name}
                  />
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '6px' }}>Face Shape</h4>
              {renderOptionGrid(AVATAR_OPTIONS.faceShapes, avatar.faceShape, (id) => onUpdate({ faceShape: id }))}
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '6px' }}>Eyes</h4>
              {renderOptionGrid(AVATAR_OPTIONS.eyeStyles, avatar.eyeStyle, (id) => onUpdate({ eyeStyle: id }))}
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '6px' }}>Eye Color</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '4px' }}>
                {AVATAR_OPTIONS.eyeColors.map(color => (
                  <button
                    key={color.id}
                    onClick={() => onUpdate({ eyeColor: color.id })}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: '50%',
                      background: color.color,
                      border: avatar.eyeColor === color.id ? `3px solid ${CASINO_THEME.gold}` : `2px solid ${CASINO_THEME.border}`,
                      cursor: 'pointer',
                    }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '6px' }}>Eyebrows</h4>
              {renderOptionGrid(AVATAR_OPTIONS.eyebrowStyles, avatar.eyebrowStyle, (id) => onUpdate({ eyebrowStyle: id }))}
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '6px' }}>Nose</h4>
              {renderOptionGrid(AVATAR_OPTIONS.noseStyles, avatar.noseStyle, (id) => onUpdate({ noseStyle: id }))}
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '6px' }}>Mouth</h4>
              {renderOptionGrid(AVATAR_OPTIONS.mouthStyles, avatar.mouthStyle, (id) => onUpdate({ mouthStyle: id }))}
            </div>
          </div>
        )}

        {activeCategory === 'hair' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '6px' }}>Hair Style (22 options)</h4>
              {renderOptionGrid(AVATAR_OPTIONS.hairStyles, avatar.hairStyle, (id) => onUpdate({ hairStyle: id }))}
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '6px' }}>Hair Color</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
                {AVATAR_OPTIONS.hairColors.map(color => (
                  <button
                    key={color.id}
                    onClick={() => onUpdate({ hairColor: color.id })}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '6px',
                      background: color.color,
                      border: avatar.hairColor === color.id ? `2px solid ${CASINO_THEME.gold}` : `1px solid ${CASINO_THEME.border}`,
                      cursor: 'pointer',
                      minHeight: '36px',
                    }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '6px' }}>Facial Hair</h4>
              {renderOptionGrid(AVATAR_OPTIONS.facialHair, avatar.facialHair, (id) => onUpdate({ facialHair: id }))}
            </div>
          </div>
        )}

        {activeCategory === 'body' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '6px' }}>Body Type</h4>
              {renderOptionGrid(AVATAR_OPTIONS.bodyTypes, avatar.bodyType, (id) => onUpdate({ bodyType: id }))}
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '6px' }}>Height</h4>
              {renderOptionGrid(AVATAR_OPTIONS.heights, avatar.height, (id) => onUpdate({ height: id }))}
            </div>
          </div>
        )}

        {activeCategory === 'clothing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '6px' }}>Top</h4>
              {renderOptionGrid(AVATAR_OPTIONS.topStyles, avatar.topStyle, (id) => onUpdate({ topStyle: id }))}
              {renderColorPicker(avatar.topColor, (color) => onUpdate({ topColor: color }), 'Top Color')}
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '6px' }}>Bottoms</h4>
              {renderOptionGrid(AVATAR_OPTIONS.bottomStyles, avatar.bottomStyle, (id) => onUpdate({ bottomStyle: id }))}
              {renderColorPicker(avatar.bottomColor, (color) => onUpdate({ bottomColor: color }), 'Bottom Color')}
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '6px' }}>Footwear</h4>
              {renderOptionGrid(AVATAR_OPTIONS.shoeStyles, avatar.shoesStyle, (id) => onUpdate({ shoesStyle: id }))}
              {renderColorPicker(avatar.shoesColor, (color) => onUpdate({ shoesColor: color }), 'Shoe Color')}
            </div>
          </div>
        )}

        {activeCategory === 'accessories' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '6px' }}>Headwear</h4>
              {renderOptionGrid(AVATAR_OPTIONS.hatStyles, avatar.hatStyle, (id) => onUpdate({ hatStyle: id }))}
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '6px' }}>Eyewear</h4>
              {renderOptionGrid(AVATAR_OPTIONS.glassesStyles, avatar.glassesStyle, (id) => onUpdate({ glassesStyle: id }))}
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '6px' }}>Jewelry (select multiple)</h4>
              {renderMultiSelect(AVATAR_OPTIONS.jewelry, avatar.jewelry, (items) => onUpdate({ jewelry: items }))}
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '6px' }}>Face (tattoos, makeup)</h4>
              {renderMultiSelect(AVATAR_OPTIONS.faceAccessories.filter(f => f.id !== 'none'), avatar.faceAccessories, (items) => onUpdate({ faceAccessories: items }))}
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '6px' }}>Background Scene</h4>
              {renderOptionGrid(AVATAR_OPTIONS.backgrounds, avatar.background || 'plain', (id) => onUpdate({ background: id }))}
            </div>
          </div>
        )}

        {activeCategory === 'special' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              padding: '12px',
              background: `linear-gradient(135deg, ${CASINO_THEME.goldDeep}30, ${CASINO_THEME.bgCard})`,
              borderRadius: '8px',
              border: `1px solid ${CASINO_THEME.gold}40`,
              marginBottom: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Crown style={{ width: 16, height: 16, color: CASINO_THEME.gold }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: CASINO_THEME.gold }}>Premium Items</span>
              </div>
              <p style={{ fontSize: '10px', color: CASINO_THEME.textMuted }}>Purchase exclusive items with your Gold Coins</p>
              <p style={{ fontSize: '11px', color: CASINO_THEME.gold, marginTop: '4px' }}>Your Balance: 🪙 {goldCoins.toLocaleString()} GC</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {AVATAR_OPTIONS.specialItems.map(item => {
                const owned = avatar.specialItems.includes(item.id);
                const canAfford = goldCoins >= item.cost;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (owned) {
                        // Un-equip an item you already own
                        onUpdate({ specialItems: avatar.specialItems.filter(i => i !== item.id) });
                      } else if (canAfford) {
                        // Affordability gating: only players who can cover the GC cost may equip
                        onUpdate({ specialItems: [...avatar.specialItems, item.id] });
                      }
                    }}
                    disabled={!owned && !canAfford}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: owned ? `2px solid ${CASINO_THEME.gold}` : `1px solid ${CASINO_THEME.border}`,
                      background: owned ? `${CASINO_THEME.gold}20` : CASINO_THEME.bgCard,
                      cursor: owned || canAfford ? 'pointer' : 'not-allowed',
                      opacity: !owned && !canAfford ? 0.5 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span style={{ fontSize: '28px' }}>{item.emoji}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: owned ? CASINO_THEME.gold : CASINO_THEME.textPrimary }}>{item.name}</span>
                    <span style={{ fontSize: '9px', color: CASINO_THEME.textMuted, textAlign: 'center' }}>{item.description}</span>
                    {!owned && (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: canAfford ? CASINO_THEME.green : CASINO_THEME.red,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        🪙 {item.cost.toLocaleString()} GC
                      </span>
                    )}
                    {owned && (
                      <span style={{ fontSize: '10px', color: CASINO_THEME.green, fontWeight: 700 }}>✓ OWNED</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={saving}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          border: 'none',
          background: CASINO_THEME.gradientGoldShine,
          color: CASINO_THEME.bgDark,
          fontSize: '15px',
          fontWeight: 800,
          cursor: saving ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: `0 0 20px ${CASINO_THEME.goldGlow}`,
        }}
      >
        {saving ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: 18, height: 18 }} />}
        {saving ? 'Saving...' : 'Save Avatar'}
      </button>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// Database avatar record interface
interface UserAvatarRecord {
  id: number;
  username?: string;
  skin_tone?: string;
  face?: string;
  hair?: string;
  hair_color?: string;
  facial_hair?: string;
  height?: string;
  pants_style?: string;
  pants_color?: string;
  shoes_style?: string;
  shoes_color?: string;
  hat_style?: string;
  glasses_style?: string;
  jewelry?: string[];
  face_tattoos?: string[];
  makeup?: string[];
  special_items?: string[];
  shirt?: string;
  shirt_color?: string;
  accessories?: any;
}

export default function DollarDay() {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const { data: sessions, loading: sessLoading, refresh: refreshSessions } = window.useWorkspaceDB<DollarDaySession>('dollar_day_sessions', { orderBy: { column: 'created_at', direction: 'desc' }, limit: 1 });
  const { data: rewards, loading: rewardsLoading, refresh: refreshRewards } = window.useWorkspaceDB<DayReward>('dollar_day_rewards', { orderBy: { column: 'day_number', direction: 'asc' }, limit: 30 });
  const { data: wallets, loading: walletsLoading, refresh: refreshWallets } = window.useWorkspaceDB<UserWallet>('user_wallets', { limit: 1 });
  const { data: transactions, loading: transactionsLoading, refresh: refreshTransactions } = window.useWorkspaceDB<WalletTransaction>('wallet_transactions', { orderBy: { column: 'created_at', direction: 'desc' }, limit: 50 });
  const { data: avatars, loading: avatarsLoading, refresh: refreshAvatars } = window.useWorkspaceDB<UserAvatarRecord>('user_avatars', { limit: 1 });

  const [mainTab, setMainTab] = useState<'rewards' | 'wallet' | 'avatar'>('rewards');
  const [avatarData, setAvatarData] = useState<AvatarData>(DEFAULT_AVATAR);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [setupNote, setSetupNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [claimingDay, setClaimingDay] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [paymentVerifying, setPaymentVerifying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showCoinShower, setShowCoinShower] = useState(false);
  const [stripeSetupStatus, setStripeSetupStatus] = useState<'checking' | 'ready' | 'setting_up'>('ready');

  const session = sessions?.[0] || null;
  const wallet = wallets?.[0] || null;
  const savedAvatar = avatars?.[0] || null;
  const loading = sessLoading || rewardsLoading || walletsLoading || transactionsLoading || avatarsLoading;

  // Load saved avatar data from database
  useEffect(() => {
    if (savedAvatar && !avatarsLoading) {
      // Extra face/body fields + background live in the `accessories` JSON blob.
      // Guard against strings / null so avatars saved before this change can't crash.
      let acc: any = savedAvatar.accessories;
      if (typeof acc === 'string') { try { acc = JSON.parse(acc); } catch { acc = {}; } }
      if (!acc || typeof acc !== 'object') acc = {};
      const loadedAvatar: AvatarData = {
        skinTone: savedAvatar.skin_tone || DEFAULT_AVATAR.skinTone,
        faceShape: savedAvatar.face || DEFAULT_AVATAR.faceShape,
        eyeStyle: acc.eyeStyle || DEFAULT_AVATAR.eyeStyle,
        eyeColor: acc.eyeColor || DEFAULT_AVATAR.eyeColor,
        eyebrowStyle: acc.eyebrowStyle || DEFAULT_AVATAR.eyebrowStyle,
        noseStyle: acc.noseStyle || DEFAULT_AVATAR.noseStyle,
        mouthStyle: acc.mouthStyle || DEFAULT_AVATAR.mouthStyle,
        hairStyle: savedAvatar.hair || DEFAULT_AVATAR.hairStyle,
        hairColor: savedAvatar.hair_color || DEFAULT_AVATAR.hairColor,
        facialHair: savedAvatar.facial_hair || DEFAULT_AVATAR.facialHair,
        bodyType: acc.bodyType || DEFAULT_AVATAR.bodyType,
        height: savedAvatar.height || DEFAULT_AVATAR.height,
        topStyle: savedAvatar.shirt || DEFAULT_AVATAR.topStyle,
        topColor: savedAvatar.shirt_color || DEFAULT_AVATAR.topColor,
        bottomStyle: savedAvatar.pants_style || DEFAULT_AVATAR.bottomStyle,
        bottomColor: savedAvatar.pants_color || DEFAULT_AVATAR.bottomColor,
        shoesStyle: savedAvatar.shoes_style || DEFAULT_AVATAR.shoesStyle,
        shoesColor: savedAvatar.shoes_color || DEFAULT_AVATAR.shoesColor,
        hatStyle: savedAvatar.hat_style || DEFAULT_AVATAR.hatStyle,
        glassesStyle: savedAvatar.glasses_style || DEFAULT_AVATAR.glassesStyle,
        jewelry: Array.isArray(savedAvatar.jewelry) ? savedAvatar.jewelry : DEFAULT_AVATAR.jewelry,
        faceAccessories: Array.isArray(savedAvatar.face_tattoos) ? savedAvatar.face_tattoos : DEFAULT_AVATAR.faceAccessories,
        specialItems: Array.isArray(savedAvatar.special_items) ? savedAvatar.special_items : DEFAULT_AVATAR.specialItems,
        background: acc.background || DEFAULT_AVATAR.background,
      };
      setAvatarData(loadedAvatar);
    }
  }, [savedAvatar, avatarsLoading]);

  // Save avatar to database
  const handleSaveAvatar = async () => {
    setSavingAvatar(true);
    try {
      const avatarRecord = {
        skin_tone: avatarData.skinTone,
        face: avatarData.faceShape,
        hair: avatarData.hairStyle,
        hair_color: avatarData.hairColor,
        facial_hair: avatarData.facialHair,
        height: avatarData.height,
        shirt: avatarData.topStyle,
        shirt_color: avatarData.topColor,
        pants_style: avatarData.bottomStyle,
        pants_color: avatarData.bottomColor,
        shoes_style: avatarData.shoesStyle,
        shoes_color: avatarData.shoesColor,
        hat_style: avatarData.hatStyle,
        glasses_style: avatarData.glassesStyle,
        jewelry: avatarData.jewelry,
        face_tattoos: avatarData.faceAccessories,
        special_items: avatarData.specialItems,
        accessories: {
          eyeStyle: avatarData.eyeStyle,
          eyeColor: avatarData.eyeColor,
          eyebrowStyle: avatarData.eyebrowStyle,
          noseStyle: avatarData.noseStyle,
          mouthStyle: avatarData.mouthStyle,
          bodyType: avatarData.bodyType,
          background: avatarData.background,
        },
      };

      if (savedAvatar) {
        await window.__workspaceDb.from('user_avatars').update(savedAvatar.id, avatarRecord);
      } else {
        await window.__workspaceDb.from('user_avatars').insert(avatarRecord);
      }
      refreshAvatars();
      setShowCoinShower(true); // Celebrate!
    } catch (error) {
      console.error('Failed to save avatar:', error);
    } finally {
      setSavingAvatar(false);
    }
  };

  // Update avatar state
  const handleUpdateAvatar = (updates: Partial<AvatarData>) => {
    setAvatarData(prev => ({ ...prev, ...updates }));
  };

  // Mouse tracking for 8D parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Initialize wallet
  useEffect(() => {
    const initWallet = async () => {
      if (!walletsLoading && !wallet) {
        try {
          await window.__workspaceDb.from('user_wallets').insert({
            balance: 1000, sweeps_balance: 1, total_deposited: 0, total_withdrawn: 0,
            total_won: 0, total_lost: 0, welcome_bonus_claimed: true,
          });
          await window.__workspaceDb.from('wallet_transactions').insert({
            type: 'bonus', amount: 1000, sweeps_amount: 1, description: '🎉 Welcome Bonus — 1,000 GC + 1 SC FREE!',
          });
          refreshWallets(); refreshTransactions();
        } catch (e) { console.error('Failed to initialize wallet:', e); }
      }
    };
    initWallet();
  }, [walletsLoading, wallet]);

  // Check Stripe URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stripeSessionId = urlParams.get('session_id');
    if (stripeSessionId && !session) {
      verifyPaymentAndActivate(stripeSessionId);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [session]);

  const verifyPaymentAndActivate = async (stripeSessionId: string) => {
    setPaymentVerifying(true);
    try {
      const status = await stripePayments.getPaymentStatus(stripeSessionId);
      if (status.status === 'complete' && status.paymentStatus === 'paid') {
        const today = new Date().toISOString().split('T')[0];
        await window.__workspaceDb.from('dollar_day_sessions').insert({ start_date: today, is_active: true, note: setupNote || 'Activated', stripe_session_id: stripeSessionId });
        for (let d = 1; d <= 30; d++) {
          const cat = REWARD_CATALOG[d - 1];
          await window.__workspaceDb.from('dollar_day_rewards').insert({ day_number: d, claimed: false, reward_label: cat.label, note: cat.value });
        }
        if (wallet) {
          await window.__workspaceDb.from('user_wallets').update(wallet.id, { balance: (wallet.balance || 0) + 5000, sweeps_balance: (wallet.sweeps_balance || 0) + 5 });
          await window.__workspaceDb.from('wallet_transactions').insert({ type: 'bonus', amount: 5000, sweeps_amount: 5, description: '🎁 Welcome Package Bonus!' });
        }
        refreshSessions(); refreshRewards(); refreshWallets(); refreshTransactions();
        setShowCoinShower(true);
      }
    } catch (error) { console.error('Payment verification error:', error); }
    finally { setPaymentVerifying(false); }
  };

  const rewardMap: Record<number, DayReward> = {};
  if (rewards) rewards.forEach(r => { rewardMap[r.day_number] = r; });

  const claimedCount = rewards?.filter(r => r.claimed).length || 0;
  const currentDay = session ? getDayProgress(session.start_date) : 0;

  useEffect(() => {
    if (!rewards || rewards.length === 0) return;
    let s = 0;
    for (let d = 1; d <= 30; d++) { if (rewardMap[d]?.claimed) s++; else break; }
    setStreak(s);
  }, [rewards]);

  const handleActivateOffer = async () => {
    setBusy(true); setPaymentError(null);
    try {
      const currentUrl = window.location.href.split('?')[0];
      const { checkoutUrl, error } = await stripePayments.createCheckout({
        amount: 100,
        productName: 'Welcome Package — 5,000 Gold Coins',
        productDescription: `5,000 GC + 5 SC + 30 days of daily bonuses! Total: ${TOTAL_GOLD_COINS.toLocaleString()} GC + ${TOTAL_SWEEPS_COINS} SC`,
        successUrl: `${currentUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: currentUrl,
        metadata: { offer_type: 'welcome_package_30', gold_coins: '5000', sweeps_coins: '5' }
      });
      if (error) { setStripeSetupStatus('setting_up'); setBusy(false); return; }
      if (checkoutUrl) stripePayments.redirectToCheckout(checkoutUrl);
      else { setStripeSetupStatus('setting_up'); setBusy(false); }
    } catch (error) { setStripeSetupStatus('setting_up'); setBusy(false); }
  };

  const handleClaimDay = async (dayNum: number) => {
    if (!session || claimingDay !== null) return;
    const existing = rewardMap[dayNum];
    if (!existing || existing.claimed) return;
    setClaimingDay(dayNum);
    try {
      await window.__workspaceDb.from('dollar_day_rewards').update(existing.id, { claimed: true, claimed_at: new Date().toISOString() });
      const goldEarned = REWARD_CATALOG[dayNum - 1]?.goldCoins || 0;
      const sweepsEarned = REWARD_CATALOG[dayNum - 1]?.sweepsCoins || 0;
      if ((goldEarned > 0 || sweepsEarned > 0) && wallet) {
        await window.__workspaceDb.from('user_wallets').update(wallet.id, { balance: (wallet.balance || 0) + goldEarned, sweeps_balance: (wallet.sweeps_balance || 0) + sweepsEarned });
        await window.__workspaceDb.from('wallet_transactions').insert({ type: 'daily_reward', amount: goldEarned, sweeps_amount: sweepsEarned, description: `🎁 Day ${dayNum} — ${REWARD_CATALOG[dayNum - 1]?.label}` });
        refreshWallets(); refreshTransactions();
      }
      setShowCoinShower(true);
      refreshRewards();
    } finally { setClaimingDay(null); }
  };

  const handleBuyCoins = async (pkg: typeof COIN_PACKAGES[0]) => {
    setBusy(true);
    try {
      const currentUrl = window.location.href.split('?')[0];
      const { checkoutUrl, error } = await stripePayments.createCheckout({
        amount: pkg.dollars * 100,
        productName: `${pkg.goldCoins.toLocaleString()} Gold Coins`,
        productDescription: `${pkg.goldCoins.toLocaleString()} GC + ${pkg.sweepsCoins} SC${pkg.bonus > 0 ? ` (${pkg.bonus}% bonus!)` : ''}`,
        successUrl: `${currentUrl}?session_id={CHECKOUT_SESSION_ID}&payment_type=coins`,
        cancelUrl: currentUrl,
        metadata: { purchase_type: 'coin_package', gold_coins: String(pkg.goldCoins), sweeps_coins: String(pkg.sweepsCoins) }
      });
      if (checkoutUrl) stripePayments.redirectToCheckout(checkoutUrl);
    } catch (error) { console.error('Purchase error:', error); }
    finally { setBusy(false); }
  };

  const todayReward = rewardMap[currentDay];
  const isTodayClaimed = todayReward?.claimed || false;

  if (loading || paymentVerifying) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '100vh' }}>
        <Immersive8DTreasury mousePos={mousePos}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '20px' }}>
            <div style={{ fontSize: '48px', animation: 'coinSpinSlow 1.5s linear infinite', filter: `drop-shadow(0 0 20px ${CASINO_THEME.gold})` }}>🪙</div>
            <p style={{ marginTop: '16px', color: CASINO_THEME.gold, fontWeight: 700, textShadow: `0 0 20px ${CASINO_THEME.goldGlow}` }}>
              {paymentVerifying ? '💰 Opening your treasure...' : '🏦 Loading vault...'}
            </p>
          </div>
        </Immersive8DTreasury>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '100vh' }}>
      <Immersive8DTreasury mousePos={mousePos}>
        <GoldCoinShower active={showCoinShower} onComplete={() => setShowCoinShower(false)} />

        <div style={{ position: 'relative', zIndex: 10, padding: '60px 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '500px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{
            textAlign: 'center', padding: '16px',
            background: `linear-gradient(135deg, ${CASINO_THEME.bgCard}ee, ${CASINO_THEME.bgElevated}ee)`,
            borderRadius: '16px', border: `2px solid ${CASINO_THEME.gold}`,
            boxShadow: `0 0 30px ${CASINO_THEME.goldGlow}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              {['💰', '🎰', '🎁', '💎', '🪙'].map((e, i) => (
                <span key={i} style={{ fontSize: '20px', animation: `bounce 1s ease-in-out ${i * 0.1}s infinite` }}>{e}</span>
              ))}
            </div>
            <h1 style={{
              fontSize: '24px', fontWeight: 900, letterSpacing: '4px',
              color: CASINO_THEME.gold,
              textShadow: `0 0 20px ${CASINO_THEME.goldGlow}`,
              fontFamily: 'Space Grotesk, system-ui',
            }}>
              DOLLAR DAY
            </h1>
            <p style={{ fontSize: '11px', color: CASINO_THEME.textMuted, marginTop: '4px' }}>8D Immersive Treasury Experience</p>
          </div>

          {/* Balance */}
          <PremiumCoinBalance goldCoins={wallet?.balance || 0} sweepsCoins={wallet?.sweeps_balance || 0} />

          {/* Tab Navigation */}
          <PremiumTabNav activeTab={mainTab} onTabChange={setMainTab} />

          {/* Content */}
          {mainTab === 'avatar' ? (
            /* AVATAR TAB */
            <AvatarCreator
              avatar={avatarData}
              onUpdate={handleUpdateAvatar}
              onSave={handleSaveAvatar}
              saving={savingAvatar}
              goldCoins={wallet?.balance || 0}
            />
          ) : mainTab === 'wallet' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Vault Display */}
              <div style={{
                padding: '24px', borderRadius: '16px', textAlign: 'center',
                background: CASINO_THEME.gradientTreasure,
                border: `3px solid ${CASINO_THEME.gold}`,
                boxShadow: `0 0 50px ${CASINO_THEME.goldGlow}`,
              }}>
                <p style={{ fontSize: '11px', letterSpacing: '3px', color: CASINO_THEME.textMuted, marginBottom: '12px' }}>💰 YOUR TREASURE VAULT 💰</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '40px', animation: 'float 2s ease-in-out infinite' }}>🪙</span>
                  <span style={{ fontSize: '42px', fontWeight: 900, color: CASINO_THEME.gold, fontFamily: 'Space Grotesk', textShadow: `0 0 30px ${CASINO_THEME.gold}` }}>
                    {(wallet?.balance || 0).toLocaleString()}
                  </span>
                  <span style={{ fontSize: '18px', color: CASINO_THEME.textSecondary }}>GC</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '8px' }}>
                  <span style={{ fontSize: '28px', animation: 'float 2s ease-in-out infinite 0.3s' }}>💎</span>
                  <span style={{ fontSize: '32px', fontWeight: 900, color: CASINO_THEME.purple, fontFamily: 'Space Grotesk', textShadow: `0 0 20px ${CASINO_THEME.purpleGlow}` }}>
                    {(wallet?.sweeps_balance || 0).toLocaleString()}
                  </span>
                  <span style={{ fontSize: '14px', color: CASINO_THEME.textMuted }}>SC</span>
                </div>
              </div>

              {/* Coin Packages */}
              <div style={{ padding: '16px', borderRadius: '12px', background: `${CASINO_THEME.bgCard}ee`, border: `1px solid ${CASINO_THEME.border}` }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard style={{ width: '16px', height: '16px', color: CASINO_THEME.gold }} />
                  Premium Coin Packages
                </h3>
                <p style={{ fontSize: '11px', color: CASINO_THEME.textMuted, marginBottom: '12px' }}>Buy Gold Coins, get FREE Sweeps Coins</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {COIN_PACKAGES.map((pkg, i) => (
                    <button
                      key={i}
                      onClick={() => handleBuyCoins(pkg)}
                      disabled={busy}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px', borderRadius: '10px', border: 'none',
                        background: pkg.popular ? CASINO_THEME.gradientGoldMetallic : CASINO_THEME.bgElevated,
                        color: pkg.popular ? CASINO_THEME.bgDark : CASINO_THEME.textPrimary,
                        cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: pkg.popular ? `0 0 20px ${CASINO_THEME.goldGlow}` : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>🪙</span>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 700, fontSize: '13px' }}>{pkg.label}</div>
                          <div style={{ fontSize: '10px', opacity: 0.8 }}>+{pkg.sweepsCoins} SC FREE</div>
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 12px', borderRadius: '8px',
                        background: pkg.popular ? CASINO_THEME.bgDark : CASINO_THEME.gold,
                        color: pkg.popular ? CASINO_THEME.gold : CASINO_THEME.bgDark,
                        fontWeight: 800, fontSize: '13px',
                      }}>
                        ${pkg.dollars}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Transactions */}
              <div style={{ padding: '16px', borderRadius: '12px', background: `${CASINO_THEME.bgCard}ee`, border: `1px solid ${CASINO_THEME.border}` }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History style={{ width: '16px', height: '16px', color: CASINO_THEME.gold }} />
                  Recent Activity
                </h3>
                {transactions && transactions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {transactions.slice(0, 10).map((tx) => (
                      <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', background: CASINO_THEME.bgElevated }}>
                        {getTransactionIcon(tx.type)}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12px', color: CASINO_THEME.textPrimary }}>{tx.description}</div>
                          <div style={{ fontSize: '10px', color: CASINO_THEME.textMuted }}>{tx.created_at ? new Date(tx.created_at).toLocaleDateString() : 'Just now'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: tx.amount >= 0 ? CASINO_THEME.gold : CASINO_THEME.red }}>
                            {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString()} GC
                          </div>
                          {tx.sweeps_amount && tx.sweeps_amount > 0 && (
                            <div style={{ fontSize: '10px', color: CASINO_THEME.purple }}>+{tx.sweeps_amount} SC</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: CASINO_THEME.textMuted }}>
                    <History style={{ width: '32px', height: '32px', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: '12px' }}>No activity yet</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* REWARDS TAB */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {!session ? (
                /* Welcome Package */
                <div style={{
                  padding: '24px', borderRadius: '16px', textAlign: 'center',
                  background: `linear-gradient(135deg, ${CASINO_THEME.goldDeep}30, ${CASINO_THEME.bgCard}ee)`,
                  border: `3px solid ${CASINO_THEME.gold}`,
                  boxShadow: `0 0 40px ${CASINO_THEME.goldGlow}`,
                }}>
                  <div style={{
                    width: '100px', height: '100px', margin: '0 auto 16px', borderRadius: '24px',
                    background: CASINO_THEME.gradientGoldShine,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '52px', boxShadow: `0 0 60px ${CASINO_THEME.goldGlow}`,
                    animation: 'float 3s ease-in-out infinite',
                  }}>🎁</div>
                  <h2 style={{ fontSize: '22px', fontWeight: 900, color: CASINO_THEME.textPrimary, fontFamily: 'Space Grotesk', marginBottom: '8px' }}>
                    30 Days of <span style={{ color: CASINO_THEME.gold }}>Daily Treasures</span>
                  </h2>
                  <p style={{ fontSize: '13px', color: CASINO_THEME.textSecondary, marginBottom: '16px' }}>
                    Unlock your Welcome Package and claim daily Gold Coin + Sweeps Coin bonuses!
                  </p>
                  <div style={{
                    padding: '12px', borderRadius: '12px', marginBottom: '16px',
                    background: `${CASINO_THEME.purpleDark}30`, border: `1px solid ${CASINO_THEME.purple}40`,
                  }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: CASINO_THEME.purple }}>✨ NO PURCHASE NECESSARY TO PLAY</p>
                    <p style={{ fontSize: '10px', color: CASINO_THEME.textMuted, marginTop: '4px' }}>Free entry methods available</p>
                  </div>
                  <div style={{
                    padding: '16px', borderRadius: '12px', marginBottom: '16px',
                    background: CASINO_THEME.bgElevated, border: `2px solid ${CASINO_THEME.gold}40`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '12px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px' }}>🪙</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: CASINO_THEME.gold }}>5,000 GC</div>
                        <div style={{ fontSize: '10px', color: CASINO_THEME.textMuted }}>Instant Bonus</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px' }}>💎</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: CASINO_THEME.green }}>5 SC FREE</div>
                        <div style={{ fontSize: '10px', color: CASINO_THEME.textMuted }}>Sweeps Coins</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px' }}>🎁</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: CASINO_THEME.purple }}>30 Days</div>
                        <div style={{ fontSize: '10px', color: CASINO_THEME.textMuted }}>Daily Rewards</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: CASINO_THEME.textMuted, borderTop: `1px solid ${CASINO_THEME.border}`, paddingTop: '12px' }}>
                      Total Value: <span style={{ color: CASINO_THEME.gold, fontWeight: 700 }}>{TOTAL_GOLD_COINS.toLocaleString()} GC</span> +
                      <span style={{ color: CASINO_THEME.green, fontWeight: 700 }}> {TOTAL_SWEEPS_COINS} SC</span>
                    </div>
                  </div>
                  <button
                    onClick={handleActivateOffer}
                    disabled={busy}
                    style={{
                      width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                      background: CASINO_THEME.gradientGoldShine,
                      color: CASINO_THEME.bgDark, fontSize: '18px', fontWeight: 900,
                      cursor: busy ? 'not-allowed' : 'pointer',
                      boxShadow: `0 0 30px ${CASINO_THEME.goldGlow}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      animation: busy ? 'none' : 'pulseGlow 2s infinite',
                    }}
                  >
                    {busy ? <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} /> : '🎁'}
                    {busy ? 'Processing...' : 'Unlock for $1.00 — HUGE Value!'}
                  </button>
                  <p style={{ fontSize: '10px', color: CASINO_THEME.textMuted, marginTop: '8px' }}>
                    Must be 21+ and a legal US resident. Void where prohibited.
                  </p>
                </div>
              ) : (
                /* Active Session */
                <>
                  {/* Streak & Progress */}
                  {streak > 0 && (
                    <div style={{
                      padding: '12px 16px', borderRadius: '12px',
                      background: `linear-gradient(135deg, ${CASINO_THEME.goldDeep}40, ${CASINO_THEME.bgCard}ee)`,
                      border: `2px solid ${CASINO_THEME.gold}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%',
                          background: CASINO_THEME.gradientGoldMetallic,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '20px', boxShadow: `0 0 15px ${CASINO_THEME.goldGlow}`,
                        }}>🔥</div>
                        <div>
                          <div style={{ fontSize: '11px', color: CASINO_THEME.textMuted }}>Current Streak</div>
                          <div style={{ fontSize: '18px', fontWeight: 900, color: CASINO_THEME.gold, fontFamily: 'Space Grotesk' }}>
                            {streak} Day{streak !== 1 ? 's' : ''} 🔥
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: CASINO_THEME.textMuted }}>Progress</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: CASINO_THEME.green }}>
                          {claimedCount}/30 Days
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Today's Reward */}
                  <div style={{
                    padding: '20px', borderRadius: '16px', textAlign: 'center',
                    background: `${CASINO_THEME.bgCard}ee`, border: `2px solid ${CASINO_THEME.gold}40`,
                  }}>
                    <div style={{ fontSize: '12px', color: CASINO_THEME.textMuted, marginBottom: '4px' }}>Day {currentDay} of 30</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '12px' }}>
                      {todayReward ? REWARD_CATALOG[currentDay - 1]?.label : "Today's Reward"}
                    </div>
                    <TreasureChest
                      isOpen={isTodayClaimed}
                      onClick={() => handleClaimDay(currentDay)}
                      disabled={claimingDay !== null || !todayReward || isTodayClaimed}
                      goldCoins={REWARD_CATALOG[currentDay - 1]?.goldCoins || 0}
                      sweepsCoins={REWARD_CATALOG[currentDay - 1]?.sweepsCoins || 0}
                    />
                  </div>

                  {/* Countdown */}
                  <div style={{
                    padding: '12px', borderRadius: '12px', textAlign: 'center',
                    background: `${CASINO_THEME.bgCard}ee`, border: `1px solid ${CASINO_THEME.border}`,
                  }}>
                    <div style={{ fontSize: '11px', color: CASINO_THEME.textMuted, marginBottom: '4px' }}>
                      {isTodayClaimed ? 'Next reward unlocks in:' : 'Time remaining today:'}
                    </div>
                    <AnimatedCountdown />
                  </div>

                  {/* Calendar Preview */}
                  <div style={{
                    padding: '16px', borderRadius: '12px',
                    background: `${CASINO_THEME.bgCard}ee`, border: `1px solid ${CASINO_THEME.border}`,
                  }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, color: CASINO_THEME.textPrimary, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar style={{ width: '14px', height: '14px', color: CASINO_THEME.gold }} />
                      30-Day Journey
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} style={{ textAlign: 'center', fontSize: '9px', fontWeight: 700, color: CASINO_THEME.textMuted }}>{d}</div>
                      ))}
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(dayNum => {
                        const reward = rewardMap[dayNum];
                        const status = reward?.claimed ? 'claimed' : getDayStatus(dayNum, session.start_date);
                        const isToday = dayNum === currentDay;
                        return (
                          <div
                            key={dayNum}
                            style={{
                              aspectRatio: '1', borderRadius: '6px',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                              fontSize: '10px',
                              background: status === 'claimed' ? CASINO_THEME.green
                                : isToday ? CASINO_THEME.gold
                                : CASINO_THEME.bgElevated,
                              border: `1px solid ${status === 'claimed' ? CASINO_THEME.green : isToday ? CASINO_THEME.gold : CASINO_THEME.border}`,
                              color: (status === 'claimed' || isToday) ? 'white' : status === 'locked' ? CASINO_THEME.textMuted : CASINO_THEME.textPrimary,
                              opacity: status === 'locked' ? 0.5 : 1,
                              boxShadow: isToday && status !== 'claimed' ? `0 0 10px ${CASINO_THEME.goldGlow}` : 'none',
                            }}
                          >
                            {status === 'claimed' ? '✓' : dayNum}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px', fontSize: '10px', color: CASINO_THEME.textMuted }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: CASINO_THEME.green }} /> Claimed
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: CASINO_THEME.gold }} /> Today
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: CASINO_THEME.bgMuted }} /> Locked
                      </span>
                    </div>
                  </div>

                  {/* Total Earned */}
                  <div style={{
                    padding: '12px', borderRadius: '12px', textAlign: 'center',
                    background: `linear-gradient(135deg, ${CASINO_THEME.greenDark}20, ${CASINO_THEME.bgCard}ee)`,
                    border: `1px solid ${CASINO_THEME.green}40`,
                  }}>
                    <div style={{ fontSize: '11px', color: CASINO_THEME.textMuted, marginBottom: '4px' }}>Total Earned from Daily Rewards</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                      <span style={{ color: CASINO_THEME.gold, fontWeight: 700 }}>
                        🪙 {rewards?.reduce((sum, r) => r.claimed ? sum + (REWARD_CATALOG[r.day_number - 1]?.goldCoins || 0) : sum, 0).toLocaleString()} GC
                      </span>
                      <span style={{ color: CASINO_THEME.purple, fontWeight: 700 }}>
                        💎 {rewards?.reduce((sum, r) => r.claimed ? sum + (REWARD_CATALOG[r.day_number - 1]?.sweepsCoins || 0) : sum, 0)} SC
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Compliance Footer */}
          <div style={{
            padding: '12px', borderRadius: '8px', marginTop: '8px',
            background: `${CASINO_THEME.bgCard}aa`, border: `1px solid ${CASINO_THEME.border}`,
            fontSize: '10px', color: CASINO_THEME.textMuted, textAlign: 'center',
          }}>
            <p style={{ fontWeight: 600, color: CASINO_THEME.textSecondary }}>NO PURCHASE NECESSARY to enter or claim prizes.</p>
            <p style={{ marginTop: '4px' }}>Gold Coins = entertainment only. Sweeps Coins = redeemable per rules. Must be 21+.</p>
          </div>
        </div>
      </Immersive8DTreasury>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
