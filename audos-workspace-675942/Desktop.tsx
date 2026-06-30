import { useState, useEffect, Suspense, LazyExoticComponent, ComponentType, Component, ErrorInfo, ReactNode, useCallback } from 'react';
import { Bot, Folder, X, Activity, Settings as SettingsIcon, Gift, Calendar, Lock, Crown, Diamond, Star, Sparkles, Trophy, DollarSign, Banknote, Circle, Music, User } from 'lucide-react';
import type { SpaceConfig, DesktopBranding, DesktopThemeTokens } from './types';
import { useSpaceRuntime } from './SpaceRuntimeContext';
import AgentChat from './components/AgentChat';
import FileBrowser from './components/FileBrowser';
import EmailGate from './components/EmailGate';
import Settings from './components/Settings';
import JukeboxPlayer from './components/JukeboxPlayer';

// ============================================================
// ERROR BOUNDARY - Catches any crash and shows fallback UI
// ============================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Desktop ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0f',
          color: '#ffffff',
          fontFamily: '"Space Grotesk", system-ui, sans-serif',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Something went wrong</h1>
          <p style={{ color: '#9ca3af', marginBottom: '24px', maxWidth: '400px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#f59e0b',
              color: '#000000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================
// SIMPLE ICON MAP
// ============================================================

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  'default': Activity,
  'activity': Activity,
  'bot': Bot,
  'folder': Folder,
  'settings': SettingsIcon,
  'gift': Gift,
  'calendar': Calendar,
  'lock': Lock,
  'crown': Crown,
  'diamond': Diamond,
  'star': Star,
  'sparkles': Sparkles,
  'trophy': Trophy,
  'dollar': DollarSign,
  'banknote': Banknote,
  'circle': Circle,
  'music': Music,
  // Casino specific
  'slots': Diamond,
  'casino': Crown,
  'jackpot': Star,
  'fortune': Sparkles,
  'prize': Trophy,
  'winnings': DollarSign,
  'bet': Banknote,
  'coins': Circle,
  'game': Sparkles,
  'games': Sparkles,
  'dollar-day': Gift,
  'rewards': Gift,
  'daily': Calendar,
  'bouncer': Lock,
  'jukebox': Music,
  // Diamond Strike specific
  'game-pulse': Diamond,
  'diamond-strike': Diamond,
  'avatar': User,
  'player': User,
};

// ============================================================
// THEME RESOLVER
// ============================================================

function resolveGenesisRuntimeTheme(config: SpaceConfig) {
  const branding = (config.desktop?.branding || {}) as DesktopBranding;
  const themeTokens = (config.desktop?.themeTokens || {}) as DesktopThemeTokens;
  const headingFont = themeTokens.typography?.headingFont || branding.headingFont || 'Space Grotesk';
  const bodyFont = themeTokens.typography?.bodyFont || branding.bodyFont || headingFont;

  return {
    branding: {
      name: branding.name || config.name || 'Welcome',
      tagline: branding.tagline,
      logoUrl: branding.logoUrl || (config as any).iconUrl || (config as any).logoUrl,
    },
    themeTokens: {
      palette: themeTokens.palette || branding.palette || branding.colors,
      typography: {
        headingFont,
        bodyFont,
        fontFamily: themeTokens.typography?.fontFamily || `"${headingFont}", system-ui, -apple-system, sans-serif`,
      },
      shell: themeTokens.shell,
      cssVariables: themeTokens.cssVariables || {},
    },
  };
}

// ============================================================
// APP ERROR BOUNDARY
// ============================================================

interface AppErrorBoundaryProps {
  appName?: string;
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryKey: number;
}

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, retryKey: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<AppErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[AppErrorBoundary] App "${this.props.appName || 'unknown'}" crashed:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: '#ffffff' }}>
            {this.props.appName ? `"${this.props.appName}" failed to load` : 'App failed to load'}
          </h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px', maxWidth: '400px', margin: '0 auto 20px' }}>
            {this.state.error?.message || 'An unexpected error occurred while loading this app.'}
          </p>
          <button
            onClick={() => {
              this.setState((prev) => ({ hasError: false, error: null, retryKey: prev.retryKey + 1 }));
            }}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: '1px solid #f59e0b',
              background: 'rgba(245,158,11,0.1)',
              color: '#f59e0b',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            ↻ Retry
          </button>
        </div>
      );
    }
    return <div key={this.state.retryKey}>{this.props.children}</div>;
  }
}

// ============================================================
// LOADING SPINNER
// ============================================================

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: '200px',
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        border: '2px solid rgba(245,158,11,0.3)',
        borderTopColor: '#f59e0b',
        animation: 'spin 1s linear infinite',
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// AVATAR & PLAYER PROFILE TYPES
// ============================================================

interface PlayerProfile {
  id: string;
  username: string;
  age: number;
  location: { country: string; state: string };
  gender: 'Male' | 'Female' | 'Other';
  joinDate: string;
  facebookLinked: boolean;
  avatarColor: string;
  avatarAccessory: 'none' | 'hat' | 'glasses' | 'bowtie' | 'headphones' | 'crown';
  currentRoom: string; // room id where they're located
  positionX: number; // relative position within room (0-100%)
  positionY: number; // relative position within room (0-100%)
}

// Mock player data
const MOCK_PLAYERS: PlayerProfile[] = [
  // The Bar - 4 players (gold badge)
  {
    id: 'player-1',
    username: 'LuckyLisa',
    age: 28,
    location: { country: 'USA', state: 'Texas' },
    gender: 'Female',
    joinDate: '2024-03-15',
    facebookLinked: true,
    avatarColor: '#ff6b9d',
    avatarAccessory: 'crown',
    currentRoom: 'bar',
    positionX: 35,
    positionY: 65,
  },
  {
    id: 'player-2',
    username: 'HighRoller_Mike',
    age: 34,
    location: { country: 'USA', state: 'Nevada' },
    gender: 'Male',
    joinDate: '2023-11-02',
    facebookLinked: false,
    avatarColor: '#4ecdc4',
    avatarAccessory: 'glasses',
    currentRoom: 'bar',
    positionX: 70,
    positionY: 55,
  },
  {
    id: 'player-3',
    username: 'ChillVibes_Alex',
    age: 23,
    location: { country: 'UK', state: 'London' },
    gender: 'Other',
    joinDate: '2024-03-22',
    facebookLinked: false,
    avatarColor: '#74b9ff',
    avatarAccessory: 'headphones',
    currentRoom: 'bar',
    positionX: 50,
    positionY: 40,
  },
  {
    id: 'player-4',
    username: 'BarFly_Jenny',
    age: 30,
    location: { country: 'USA', state: 'Colorado' },
    gender: 'Female',
    joinDate: '2024-01-10',
    facebookLinked: true,
    avatarColor: '#ffd93d',
    avatarAccessory: 'none',
    currentRoom: 'bar',
    positionX: 25,
    positionY: 50,
  },
  // Casino Floor - 2 players (cyan badge)
  {
    id: 'player-5',
    username: 'SlotKing99',
    age: 42,
    location: { country: 'USA', state: 'Florida' },
    gender: 'Male',
    joinDate: '2023-08-10',
    facebookLinked: false,
    avatarColor: '#6c5ce7',
    avatarAccessory: 'hat',
    currentRoom: 'casino',
    positionX: 35,
    positionY: 50,
  },
  {
    id: 'player-6',
    username: 'NightOwl_Sam',
    age: 29,
    location: { country: 'USA', state: 'California' },
    gender: 'Other',
    joinDate: '2024-02-28',
    facebookLinked: true,
    avatarColor: '#a29bfe',
    avatarAccessory: 'none',
    currentRoom: 'casino',
    positionX: 65,
    positionY: 45,
  },
  // Pool Hall - 2 players (green badge)
  {
    id: 'player-7',
    username: 'PoolShark_Danny',
    age: 31,
    location: { country: 'USA', state: 'New York' },
    gender: 'Male',
    joinDate: '2023-12-05',
    facebookLinked: false,
    avatarColor: '#00b894',
    avatarAccessory: 'bowtie',
    currentRoom: 'pool',
    positionX: 40,
    positionY: 50,
  },
  {
    id: 'player-8',
    username: 'BilliardsBabe',
    age: 26,
    location: { country: 'USA', state: 'Arizona' },
    gender: 'Female',
    joinDate: '2024-04-01',
    facebookLinked: true,
    avatarColor: '#fd79a8',
    avatarAccessory: 'glasses',
    currentRoom: 'pool',
    positionX: 65,
    positionY: 45,
  },
];

// Map room names/ids to the room identifiers used in mock data
const getRoomKeyForPlayer = (appId: string, appName: string): string => {
  const name = appName.toLowerCase();
  if (name.includes('jukebox') || name.includes('bar')) return 'bar';
  if (name.includes('casino') || appId === 'game-pulse' || name.includes('diamond')) return 'casino';
  if (name.includes('pool')) return 'pool';
  return appId;
};

// Get player count for a specific room
const getPlayerCountForRoom = (appId: string, appName: string): number => {
  const roomKey = getRoomKeyForPlayer(appId, appName);
  return MOCK_PLAYERS.filter(p => p.currentRoom === roomKey).length;
};

// Get badge color for room based on room type
const getBadgeColorForRoom = (appId: string, appName: string): string => {
  const name = appName.toLowerCase();
  // The Bar uses gold
  if (name.includes('jukebox') || name.includes('bar')) return '#f59e0b';
  // Casino Floor uses cyan
  if (name.includes('casino') || appId === 'game-pulse' || name.includes('diamond')) return '#00d4ff';
  // Pool Hall uses green
  if (name.includes('pool')) return '#22c55e';
  // Default
  return '#f59e0b';
};

// ============================================================
// FLOOR PLAN ROOM CONFIGURATION
// ============================================================

interface RoomConfig {
  id: string;
  name: string;
  label: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  description: string;
  doorwayPosition?: 'top' | 'bottom' | 'left' | 'right';
}

// ============================================================
// MAIN DESKTOP COMPONENT
// ============================================================

interface SpaceDesktopProps {
  mode: 'entrepreneur' | 'customer';
  spaceId: string;
  sessionId?: string;
  config: SpaceConfig;
  apps: Record<string, LazyExoticComponent<any>>;
  LoadingSpinner: ComponentType;
  initialAppId?: string | null;
}

type WindowId = 'files' | 'agent' | 'settings' | string;

export default function SpaceDesktop({
  mode,
  spaceId,
  sessionId: _unusedProp,
  config,
  apps,
  LoadingSpinner,
  initialAppId
}: SpaceDesktopProps) {
  const { sessionId, isBootstrappingSession, trackEvent } = useSpaceRuntime();

  // Core state - kept minimal
  const [activeWindowId, setActiveWindowId] = useState<WindowId | null>(null);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  // Avatar social system state
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);
  const [socialNotification, setSocialNotification] = useState<{ type: string; playerName: string } | null>(null);

  // Show email gate for customer mode if no session
  const showEmailGate = mode === 'customer' && !sessionId && !isBootstrappingSession;

  // Get current app config and component
  const isAppWindow = activeWindowId && !['files', 'agent', 'settings'].includes(activeWindowId);
  const currentAppConfig = isAppWindow ? config.apps.find(app => app.id === activeWindowId) : null;
  const CurrentApp = isAppWindow && activeWindowId ? apps[activeWindowId] : null;

  // Resolve theme
  const runtimeTheme = resolveGenesisRuntimeTheme(config);

  // Handle URL hash on mount
  useEffect(() => {
    if (!sessionId) return;

    const hash = window.location.hash.slice(1).toLowerCase();
    const urlAppParam = new URLSearchParams(window.location.search).get('app') || initialAppId;
    const deepLinkId = hash || urlAppParam?.toLowerCase() || '';

    if (deepLinkId) {
      const matchingApp = config.apps.find(
        app => app.id.toLowerCase() === deepLinkId || app.name.toLowerCase() === deepLinkId
      );
      if (matchingApp) {
        setActiveWindowId(matchingApp.id);
        return;
      }
      if (deepLinkId === 'files' || deepLinkId === 'memory') {
        setActiveWindowId('files');
        return;
      }
      if (deepLinkId === 'settings') {
        setActiveWindowId('settings');
        return;
      }
    }
  }, [sessionId, config.apps, initialAppId]);

  // Update URL hash when window changes
  useEffect(() => {
    if (activeWindowId && activeWindowId !== 'agent') {
      window.location.hash = activeWindowId;
    } else if (!activeWindowId) {
      window.location.hash = '';
    }
  }, [activeWindowId]);

  // Open app handler
  const openApp = useCallback((appId: string) => {
    const app = config.apps.find(a => a.id === appId);
    if (app) {
      trackEvent('app_opened', { appId, appName: app.name });
    }
    setActiveWindowId(appId);
    setIsAgentOpen(false);
  }, [config.apps, trackEvent]);

  // Close window handler
  const closeWindow = useCallback(() => {
    setActiveWindowId(null);
  }, []);

  // Show loading while bootstrapping session
  if (isBootstrappingSession) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0f',
        color: '#f59e0b',
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
      }}>
        <LoadingFallback />
        <p style={{ marginTop: '16px', opacity: 0.7 }}>Setting up your account...</p>
      </div>
    );
  }

  // Show email gate if no session in customer mode
  if (showEmailGate) {
    return (
      <ErrorBoundary>
        <EmailGate
          spaceId={spaceId}
          branding={runtimeTheme.branding}
          themeTokens={runtimeTheme.themeTokens}
        />
      </ErrorBoundary>
    );
  }

  // Get icon for an app
  const getAppIcon = (app: { icon?: string; name: string; id?: string }) => {
    if (app.icon && iconMap[app.icon]) return iconMap[app.icon];
    // Check app ID first for precise matching
    const appId = (app as any).id?.toLowerCase() || '';
    if (appId === 'game-pulse') return iconMap['diamond'];
    const nameLower = app.name.toLowerCase();
    if (nameLower.includes('diamond') || nameLower.includes('strike')) return iconMap['diamond'];
    if (nameLower.includes('casino') || nameLower.includes('slot')) return iconMap['casino'];
    if (nameLower.includes('pool')) return iconMap['games'];
    if (nameLower.includes('dollar')) return iconMap['dollar-day'];
    if (nameLower.includes('bouncer')) return iconMap['bouncer'];
    if (nameLower.includes('jukebox') || nameLower.includes('bar')) return iconMap['music'];
    return iconMap['default'];
  };

  // Get color for an app
  const getAppColor = (appId: string, appName: string) => {
    const name = appName.toLowerCase();
    // Diamond Strike uses deep blue neon aesthetic with cyan accents
    if (appId === 'game-pulse' || name.includes('diamond') || name.includes('strike')) return '#00d4ff';
    if (name.includes('casino') || name.includes('slot')) return '#fbbf24';
    if (name.includes('pool')) return '#22c55e';
    if (appId === 'dollar-day' || name.includes('dollar')) return '#fde047';
    if (appId.toLowerCase() === 'bouncer' || name.includes('bouncer')) return '#d4af37';
    if (name.includes('jukebox') || name.includes('bar')) return '#f59e0b';
    return '#ec4899';
  };

  // Map app IDs to room configs for floor plan
  const getRoomConfig = (appId: string, appName: string): Partial<RoomConfig> => {
    const name = appName.toLowerCase();

    // The Bar - Main lobby (center)
    if (name.includes('jukebox') || name.includes('bar')) {
      return {
        label: 'THE BAR',
        description: 'First-Person Lounge • Bartender (Add Coins & Redeem) • Jukebox • Games • Chat',
        color: '#f59e0b',
      };
    }
    // Casino Floor - Back room left (First-Person Posterboard Gallery)
    if (name.includes('casino') || appId === 'game-pulse' || name.includes('diamond')) {
      return {
        label: 'CASINO FLOOR',
        description: 'First-Person Walk-In • 26 Games • 7 Studios • Cashier & Payout Requests',
        color: '#00d4ff',
      };
    }
    // Pool Hall - Back room right
    if (name.includes('pool')) {
      return {
        label: 'POOL HALL',
        description: 'First-Person Walk-In • 8-Ball • Betting & Spectator',
        color: '#22c55e',
      };
    }
    // Dollar Day - Cashier booth with Avatar Creator & 3D Vault
    if (name.includes('dollar') || appId === 'dollar-day') {
      return {
        label: 'TREASURY',
        description: 'Daily Rewards • Premium Avatar Studio • 3D Vault',
        color: '#fde047',
      };
    }
    // Bouncer - Entrance
    if (name.includes('bouncer')) {
      return {
        label: 'ENTRANCE',
        description: 'Bouncer',
        color: '#d4af37',
      };
    }
    return {
      label: appName.toUpperCase(),
      description: '',
      color: '#ec4899',
    };
  };

  // Build room layout from apps
  const buildRoomLayout = (): { rooms: RoomConfig[]; dollarApp: typeof config.apps[number] | null } => {
    const rooms: RoomConfig[] = [];
    let barApp: typeof config.apps[number] | null = null;
    let casinoApp: typeof config.apps[number] | null = null;
    let poolApp: typeof config.apps[number] | null = null;
    let dollarApp: typeof config.apps[number] | null = null;
    let bouncerApp: typeof config.apps[number] | null = null;
    const otherApps: typeof config.apps = [];

    // Categorize apps
    config.apps.forEach(app => {
      const name = app.name.toLowerCase();
      if (name.includes('jukebox') || name.includes('bar')) {
        barApp = app;
      } else if (name.includes('casino') || app.id === 'game-pulse' || name.includes('diamond')) {
        casinoApp = app;
      } else if (name.includes('pool')) {
        poolApp = app;
      } else if (name.includes('dollar') || app.id === 'dollar-day') {
        dollarApp = app;
      } else if (name.includes('bouncer')) {
        bouncerApp = app;
      } else {
        otherApps.push(app);
      }
    });

    // Layout: The Bar in center (contains cashier), Casino Floor top-left, Pool Hall top-right
    // Bouncer at bottom (entrance). Dollar Day is accessed via The Bar.

    // The Bar - Main Lobby (large, center) - includes the Cashier/Dollar Day inside
    if (barApp) {
      const roomConfig = getRoomConfig(barApp.id, barApp.name);
      rooms.push({
        id: barApp.id,
        name: barApp.name,
        label: roomConfig.label || 'THE BAR',
        color: roomConfig.color || '#f59e0b',
        x: 20,
        y: 30,
        width: 60,
        height: 45,
        description: 'First-Person Lounge • Jukebox • Games • Chat • Cashier',
      });
    }

    // Casino Floor - Back room (top-left)
    if (casinoApp) {
      const roomConfig = getRoomConfig(casinoApp.id, casinoApp.name);
      rooms.push({
        id: casinoApp.id,
        name: casinoApp.name,
        label: roomConfig.label || 'CASINO FLOOR',
        color: roomConfig.color || '#00d4ff',
        x: 5,
        y: 5,
        width: 38,
        height: 28,
        description: roomConfig.description || 'First-Person Walk-In • 26 Games • 7 Studios',
        doorwayPosition: 'bottom',
      });
    }

    // Pool Hall - Back room (top-right)
    if (poolApp) {
      const roomConfig = getRoomConfig(poolApp.id, poolApp.name);
      rooms.push({
        id: poolApp.id,
        name: poolApp.name,
        label: roomConfig.label || 'POOL HALL',
        color: roomConfig.color || '#22c55e',
        x: 57,
        y: 5,
        width: 38,
        height: 28,
        description: roomConfig.description || 'Tables & Betting',
        doorwayPosition: 'bottom',
      });
    }

    // NOTE: Dollar Day (Cashier) is now inside The Bar, not a separate room
    // Store reference for the cashier indicator inside The Bar
    // The dollarApp is still functional - clicking The Bar takes you to the lobby

    // Bouncer - Entrance (bottom-center)
    if (bouncerApp) {
      const roomConfig = getRoomConfig(bouncerApp.id, bouncerApp.name);
      rooms.push({
        id: bouncerApp.id,
        name: bouncerApp.name,
        label: roomConfig.label || 'ENTRANCE',
        color: roomConfig.color || '#d4af37',
        x: 30,
        y: 80,
        width: 40,
        height: 15,
        description: roomConfig.description || 'Bouncer',
      });
    }

    // Add any other apps in remaining space (excluding Dollar Day which is in The Bar)
    otherApps.forEach((app, index) => {
      const roomConfig = getRoomConfig(app.id, app.name);
      rooms.push({
        id: app.id,
        name: app.name,
        label: roomConfig.label || app.name.toUpperCase(),
        color: roomConfig.color || '#ec4899',
        x: 85,
        y: 30 + (index * 18),
        width: 12,
        height: 15,
        description: roomConfig.description || '',
      });
    });

    return { rooms, dollarApp };
  };

  const { rooms, dollarApp } = buildRoomLayout();

  return (
    <ErrorBoundary>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Blueprint/Floor Plan Styles */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes room-glow {
          0%, 100% { box-shadow: inset 0 0 20px rgba(var(--room-color-rgb), 0.1), 0 0 10px rgba(var(--room-color-rgb), 0.2); }
          50% { box-shadow: inset 0 0 30px rgba(var(--room-color-rgb), 0.2), 0 0 20px rgba(var(--room-color-rgb), 0.4); }
        }
        @keyframes doorway-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 20px 20px; }
        }
        @keyframes avatar-bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes avatar-wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
        @keyframes notification-slide {
          0% { transform: translateX(100%); opacity: 0; }
          10% { transform: translateX(0); opacity: 1; }
          90% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        @keyframes player-count-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.9;
            box-shadow: 0 0 8px var(--badge-color, #f59e0b);
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
            box-shadow: 0 0 16px var(--badge-color, #f59e0b), 0 0 24px var(--badge-color, #f59e0b);
          }
        }
        @keyframes room-hover-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(var(--room-color-rgb), 0.3),
                        inset 0 0 15px rgba(var(--room-color-rgb), 0.1);
          }
          50% {
            box-shadow: 0 0 35px rgba(var(--room-color-rgb), 0.5),
                        inset 0 0 25px rgba(var(--room-color-rgb), 0.15);
          }
        }
        .player-avatar {
          animation: avatar-bob 2s ease-in-out infinite;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .player-avatar:hover {
          transform: scale(1.2) translateY(-2px);
          z-index: 100;
        }
        .blueprint-grid {
          background-image:
            linear-gradient(rgba(0, 180, 216, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 180, 216, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .room-card {
          transition: transform 0.3s ease-out, box-shadow 0.3s ease-out, border-color 0.3s ease-out, background 0.3s ease-out;
        }
        .room-card:hover {
          transform: scale(1.02);
          z-index: 10;
        }
        .room-enter-button {
          opacity: 0;
          transform: translateX(-50%) translateY(4px);
          transition: opacity 0.3s ease-out, transform 0.3s ease-out;
        }
        .room-card:hover .room-enter-button {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        .player-count-badge {
          animation: player-count-pulse 2.5s ease-in-out infinite;
        }
        .corridor {
          background: linear-gradient(90deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.1) 50%, rgba(245, 158, 11, 0.05) 100%);
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          background: '#050508',
          fontFamily: '"Space Grotesk", system-ui, sans-serif',
          color: '#ffffff',
        }}
      >
        {/* === MAIN CONTENT AREA === */}
        <div style={{ minHeight: '100vh', position: 'relative' }}>

          {/* No active window - Show floor plan */}
          {!activeWindowId && (
            <div className="blueprint-grid" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              minHeight: '100vh',
              padding: '20px',
              background: 'linear-gradient(180deg, #050508 0%, #0a0a12 50%, #050508 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Blueprint header */}
              <div style={{
                textAlign: 'center',
                marginBottom: '20px',
                position: 'relative',
                zIndex: 5,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  marginBottom: '8px',
                }}>
                  <div style={{
                    width: '60px',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #f59e0b)',
                  }} />
                  <h1 style={{
                    fontSize: 'clamp(20px, 4vw, 28px)',
                    fontWeight: 700,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    {runtimeTheme.branding.name || 'DAM Fortunes Casino'}
                  </h1>
                  <div style={{
                    width: '60px',
                    height: '2px',
                    background: 'linear-gradient(90deg, #f59e0b, transparent)',
                  }} />
                </div>
                <p style={{
                  color: 'rgba(0, 180, 216, 0.8)',
                  fontSize: '11px',
                  letterSpacing: '4px',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                }}>
                  Floor Plan • Select a Room to Enter
                </p>

                {/* Online Players Indicator */}
                <div style={{
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '20px',
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    boxShadow: '0 0 8px #22c55e',
                    animation: 'pulse-glow 2s ease-in-out infinite',
                  }} />
                  <span style={{
                    fontSize: '12px',
                    color: '#22c55e',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                  }}>
                    {MOCK_PLAYERS.length} Players Online
                  </span>
                  <span style={{
                    fontSize: '10px',
                    color: 'rgba(34, 197, 94, 0.6)',
                  }}>
                    • Click avatars to interact
                  </span>
                </div>
              </div>

              {/* Floor Plan Container */}
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '800px',
                aspectRatio: '4/3',
                background: 'rgba(5, 5, 10, 0.9)',
                border: '2px solid rgba(0, 180, 216, 0.3)',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 0 40px rgba(0, 180, 216, 0.1), inset 0 0 60px rgba(0, 0, 0, 0.5)',
              }}>
                {/* Blueprint grid overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `
                    linear-gradient(rgba(0, 180, 216, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 180, 216, 0.05) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                  pointerEvents: 'none',
                }} />

                {/* Corridors connecting rooms */}
                {/* Corridor from Bar to Casino Floor (left doorway) */}
                <div className="corridor" style={{
                  position: 'absolute',
                  left: '18%',
                  top: '30%',
                  width: '6%',
                  height: '12%',
                  border: '1px dashed rgba(245, 158, 11, 0.3)',
                  borderRadius: '4px',
                }} />
                {/* Corridor from Bar to Pool Hall (right doorway) */}
                <div className="corridor" style={{
                  position: 'absolute',
                  right: '18%',
                  top: '30%',
                  width: '6%',
                  height: '12%',
                  border: '1px dashed rgba(245, 158, 11, 0.3)',
                  borderRadius: '4px',
                }} />
                {/* Corridor from Bar to Entrance (bottom) */}
                <div className="corridor" style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bottom: '18%',
                  width: '20%',
                  height: '6%',
                  border: '1px dashed rgba(245, 158, 11, 0.3)',
                  borderRadius: '4px',
                }} />

                {/* Cashier Counter inside The Bar - visual indicator (clickable to open Dollar Day) */}
                {dollarApp && (
                  <button
                    onClick={() => openApp(dollarApp.id)}
                    onMouseEnter={() => setHoveredRoom('cashier')}
                    onMouseLeave={() => setHoveredRoom(null)}
                    className="room-card"
                    style={{
                      position: 'absolute',
                      left: '55%',
                      top: '42%',
                      width: '18%',
                      height: '18%',
                      background: hoveredRoom === 'cashier'
                        ? 'rgba(253, 224, 71, 0.28)'
                        : 'rgba(253, 224, 71, 0.1)',
                      border: `2px solid ${hoveredRoom === 'cashier' ? '#fde047' : 'rgba(253, 224, 71, 0.5)'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 5,
                      boxShadow: hoveredRoom === 'cashier'
                        ? '0 0 35px rgba(253, 224, 71, 0.5), 0 0 50px rgba(253, 224, 71, 0.25), inset 0 0 20px rgba(253, 224, 71, 0.1)'
                        : '0 0 10px rgba(253, 224, 71, 0.15)',
                    }}
                  >
                    {/* Cash register icon */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginBottom: '4px',
                      transition: 'transform 0.3s ease-out',
                      transform: hoveredRoom === 'cashier' ? 'scale(1.15)' : 'scale(1)',
                    }}>
                      <Banknote style={{
                        color: '#fde047',
                        width: 'clamp(12px, 2vw, 18px)',
                        height: 'clamp(12px, 2vw, 18px)',
                        filter: hoveredRoom === 'cashier' ? 'drop-shadow(0 0 6px #fde047)' : 'none',
                        transition: 'filter 0.3s ease-out',
                      }} />
                      <DollarSign style={{
                        color: '#fde047',
                        width: 'clamp(12px, 2vw, 18px)',
                        height: 'clamp(12px, 2vw, 18px)',
                        filter: hoveredRoom === 'cashier' ? 'drop-shadow(0 0 6px #fde047)' : 'none',
                        transition: 'filter 0.3s ease-out',
                      }} />
                    </div>
                    <span style={{
                      fontSize: 'clamp(8px, 1.3vw, 11px)',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      color: hoveredRoom === 'cashier' ? '#fde047' : 'rgba(253, 224, 71, 0.9)',
                      textTransform: 'uppercase',
                      transition: 'color 0.3s ease-out, text-shadow 0.3s ease-out',
                      textShadow: hoveredRoom === 'cashier' ? '0 0 10px #fde04780' : 'none',
                    }}>
                      Cashier
                    </span>
                    <span style={{
                      fontSize: 'clamp(6px, 1vw, 9px)',
                      color: hoveredRoom === 'cashier' ? 'rgba(253, 224, 71, 0.8)' : 'rgba(253, 224, 71, 0.6)',
                      marginTop: '2px',
                      transition: 'color 0.3s ease-out',
                    }}>
                      Dollar Day
                    </span>
                    {/* Enter prompt on hover - using CSS class for smooth fade */}
                    <div
                      className="room-enter-button"
                      style={{
                        position: 'absolute',
                        bottom: '-20px',
                        left: '50%',
                        background: 'linear-gradient(135deg, #fde047 0%, #fde047cc 100%)',
                        color: '#000',
                        padding: '3px 10px',
                        borderRadius: '10px',
                        fontSize: '8px',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 12px rgba(253, 224, 71, 0.5)',
                      }}
                    >
                      Buy / Cash Out
                    </div>
                  </button>
                )}

                {/* Jukebox indicator inside The Bar */}
                <div style={{
                  position: 'absolute',
                  left: '28%',
                  top: '42%',
                  width: '15%',
                  height: '18%',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px dashed rgba(245, 158, 11, 0.3)',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}>
                  <Music style={{
                    color: 'rgba(245, 158, 11, 0.6)',
                    width: 'clamp(14px, 2.5vw, 20px)',
                    height: 'clamp(14px, 2.5vw, 20px)',
                    marginBottom: '4px',
                  }} />
                  <span style={{
                    fontSize: 'clamp(7px, 1.2vw, 10px)',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    color: 'rgba(245, 158, 11, 0.5)',
                    textTransform: 'uppercase',
                  }}>
                    Jukebox
                  </span>
                </div>

                {/* Room Elements */}
                {rooms.map(room => {
                  const isHovered = hoveredRoom === room.id;
                  const IconComponent = getAppIcon({ id: room.id, name: room.name });
                  const playerCount = getPlayerCountForRoom(room.id, room.name);
                  const badgeColor = getBadgeColorForRoom(room.id, room.name);

                  // Convert hex to RGB for CSS variable
                  const hexToRgb = (hex: string) => {
                    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result
                      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
                      : '245, 158, 11';
                  };

                  return (
                    <button
                      key={room.id}
                      onClick={() => openApp(room.id)}
                      onMouseEnter={() => setHoveredRoom(room.id)}
                      onMouseLeave={() => setHoveredRoom(null)}
                      className="room-card"
                      style={{
                        position: 'absolute',
                        left: `${room.x}%`,
                        top: `${room.y}%`,
                        width: `${room.width}%`,
                        height: `${room.height}%`,
                        background: isHovered
                          ? `rgba(${hexToRgb(room.color)}, 0.18)`
                          : `rgba(${hexToRgb(room.color)}, 0.05)`,
                        border: `2px solid ${isHovered ? room.color : `rgba(${hexToRgb(room.color)}, 0.4)`}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        boxShadow: isHovered
                          ? `0 0 40px rgba(${hexToRgb(room.color)}, 0.5), 0 0 60px rgba(${hexToRgb(room.color)}, 0.25), inset 0 0 25px rgba(${hexToRgb(room.color)}, 0.12)`
                          : `0 0 15px rgba(${hexToRgb(room.color)}, 0.15)`,
                        animation: isHovered ? 'room-hover-glow 2s ease-in-out infinite' : 'none',
                        // @ts-ignore - CSS variable
                        '--room-color-rgb': hexToRgb(room.color),
                      } as React.CSSProperties}
                    >
                      {/* Player Count Badge */}
                      {playerCount > 0 && (
                        <div
                          className="player-count-badge"
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            background: `linear-gradient(135deg, ${badgeColor}dd 0%, ${badgeColor}aa 100%)`,
                            borderRadius: '20px',
                            border: `1px solid ${badgeColor}`,
                            // @ts-ignore - CSS variable
                            '--badge-color': badgeColor,
                            zIndex: 5,
                          } as React.CSSProperties}
                        >
                          <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: '#ffffff',
                            boxShadow: '0 0 4px #ffffff',
                          }} />
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#000000',
                            letterSpacing: '0.5px',
                          }}>
                            {playerCount}
                          </span>
                        </div>
                      )}

                      {/* Room icon */}
                      <div style={{
                        width: 'clamp(28px, 5vw, 40px)',
                        height: 'clamp(28px, 5vw, 40px)',
                        borderRadius: '50%',
                        background: `rgba(${hexToRgb(room.color)}, 0.2)`,
                        border: `1px solid ${room.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '8px',
                        transition: 'all 0.3s ease-out',
                        transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                        boxShadow: isHovered ? `0 0 20px rgba(${hexToRgb(room.color)}, 0.5)` : 'none',
                      }}>
                        <IconComponent
                          className="w-5 h-5"
                          style={{
                            color: room.color,
                            width: 'clamp(16px, 3vw, 24px)',
                            height: 'clamp(16px, 3vw, 24px)',
                          }}
                        />
                      </div>

                      {/* Room label */}
                      <span style={{
                        fontSize: 'clamp(10px, 1.8vw, 14px)',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        color: isHovered ? room.color : 'rgba(255, 255, 255, 0.9)',
                        textAlign: 'center',
                        transition: 'color 0.3s ease-out, text-shadow 0.3s ease-out',
                        textTransform: 'uppercase',
                        textShadow: isHovered ? `0 0 10px ${room.color}80` : 'none',
                      }}>
                        {room.label}
                      </span>

                      {/* Room description */}
                      {room.description && (
                        <span style={{
                          fontSize: 'clamp(8px, 1.2vw, 11px)',
                          color: isHovered ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.5)',
                          marginTop: '2px',
                          textAlign: 'center',
                          transition: 'color 0.3s ease-out',
                        }}>
                          {room.description}
                        </span>
                      )}

                      {/* Doorway indicator */}
                      {room.doorwayPosition && (
                        <div style={{
                          position: 'absolute',
                          ...(room.doorwayPosition === 'bottom' ? { bottom: '-8px', left: '50%', transform: 'translateX(-50%)', width: '30%', height: '4px' } : {}),
                          ...(room.doorwayPosition === 'top' ? { top: '-8px', left: '50%', transform: 'translateX(-50%)', width: '30%', height: '4px' } : {}),
                          ...(room.doorwayPosition === 'left' ? { left: '-8px', top: '50%', transform: 'translateY(-50%)', width: '4px', height: '30%' } : {}),
                          ...(room.doorwayPosition === 'right' ? { right: '-8px', top: '50%', transform: 'translateY(-50%)', width: '4px', height: '30%' } : {}),
                          background: room.color,
                          borderRadius: '2px',
                          boxShadow: isHovered ? `0 0 10px ${room.color}` : 'none',
                          animation: isHovered ? 'doorway-pulse 1s ease-in-out infinite' : 'none',
                          transition: 'box-shadow 0.3s ease-out',
                        }} />
                      )}

                      {/* Enter prompt on hover - using CSS class for smooth fade */}
                      <div
                        className="room-enter-button"
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          left: '50%',
                          background: `linear-gradient(135deg, ${room.color} 0%, ${room.color}cc 100%)`,
                          color: '#000',
                          padding: '5px 14px',
                          borderRadius: '14px',
                          fontSize: '10px',
                          fontWeight: 700,
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                          boxShadow: `0 2px 12px ${room.color}60`,
                        }}
                      >
                        Enter Room
                      </div>
                    </button>
                  );
                })}

                {/* Player Avatars - Sims-style social layer */}
                {rooms.map(room => {
                  const roomKey = getRoomKeyForPlayer(room.id, room.name);
                  const playersInRoom = MOCK_PLAYERS.filter(p => p.currentRoom === roomKey);

                  return playersInRoom.map(player => {
                    // Calculate absolute position within the room
                    const absoluteX = room.x + (player.positionX / 100) * room.width;
                    const absoluteY = room.y + (player.positionY / 100) * room.height;
                    const isHovered = hoveredPlayer === player.id;

                    // Accessory rendering
                    const renderAccessory = () => {
                      switch (player.avatarAccessory) {
                        case 'crown':
                          return <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px' }}>👑</span>;
                        case 'hat':
                          return <span style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', fontSize: '8px' }}>🎩</span>;
                        case 'glasses':
                          return <span style={{ position: 'absolute', top: '2px', left: '50%', transform: 'translateX(-50%)', fontSize: '6px' }}>👓</span>;
                        case 'bowtie':
                          return <span style={{ position: 'absolute', bottom: '-2px', left: '50%', transform: 'translateX(-50%)', fontSize: '6px' }}>🎀</span>;
                        case 'headphones':
                          return <span style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', fontSize: '8px' }}>🎧</span>;
                        default:
                          return null;
                      }
                    };

                    return (
                      <button
                        key={player.id}
                        className="player-avatar"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlayer(player);
                        }}
                        onMouseEnter={() => setHoveredPlayer(player.id)}
                        onMouseLeave={() => setHoveredPlayer(null)}
                        style={{
                          position: 'absolute',
                          left: `${absoluteX}%`,
                          top: `${absoluteY}%`,
                          width: 'clamp(20px, 3vw, 28px)',
                          height: 'clamp(20px, 3vw, 28px)',
                          borderRadius: '50%',
                          background: player.avatarColor,
                          border: `2px solid ${isHovered ? '#ffffff' : 'rgba(255,255,255,0.5)'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#ffffff',
                          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                          zIndex: isHovered ? 50 : 20,
                          boxShadow: isHovered
                            ? `0 0 15px ${player.avatarColor}, 0 4px 12px rgba(0,0,0,0.4)`
                            : `0 2px 8px rgba(0,0,0,0.3)`,
                          animationDelay: `${Math.random() * 2}s`,
                          transform: 'translate(-50%, -50%)',
                        }}
                        title={player.username}
                      >
                        {renderAccessory()}
                        {player.username.charAt(0).toUpperCase()}

                        {/* Username tooltip on hover */}
                        {isHovered && (
                          <div style={{
                            position: 'absolute',
                            bottom: '-22px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(0,0,0,0.9)',
                            color: '#ffffff',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '9px',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            border: `1px solid ${player.avatarColor}`,
                            zIndex: 100,
                          }}>
                            {player.username}
                          </div>
                        )}
                      </button>
                    );
                  });
                })}

                {/* Settings room - small utility room */}
                <button
                  onClick={() => setActiveWindowId('settings')}
                  onMouseEnter={() => setHoveredRoom('settings')}
                  onMouseLeave={() => setHoveredRoom(null)}
                  className="room-card"
                  style={{
                    position: 'absolute',
                    right: '2%',
                    bottom: '2%',
                    width: '12%',
                    height: '12%',
                    background: hoveredRoom === 'settings'
                      ? 'rgba(156, 163, 175, 0.18)'
                      : 'rgba(156, 163, 175, 0.05)',
                    border: `1px solid ${hoveredRoom === 'settings' ? '#9ca3af' : 'rgba(156, 163, 175, 0.3)'}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    boxShadow: hoveredRoom === 'settings'
                      ? '0 0 25px rgba(156, 163, 175, 0.3), inset 0 0 15px rgba(156, 163, 175, 0.1)'
                      : 'none',
                  }}
                >
                  <SettingsIcon
                    className="w-4 h-4"
                    style={{
                      color: hoveredRoom === 'settings' ? '#9ca3af' : 'rgba(156, 163, 175, 0.6)',
                      marginBottom: '4px',
                      transition: 'transform 0.3s ease-out, color 0.3s ease-out',
                      transform: hoveredRoom === 'settings' ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                  <span style={{
                    fontSize: '8px',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    color: hoveredRoom === 'settings' ? '#9ca3af' : 'rgba(156, 163, 175, 0.8)',
                    textTransform: 'uppercase',
                    transition: 'color 0.3s ease-out',
                  }}>
                    Settings
                  </span>
                </button>

                {/* Compass/Orientation indicator */}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  width: '40px',
                  height: '40px',
                  border: '1px solid rgba(0, 180, 216, 0.3)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: 'rgba(0, 180, 216, 0.6)',
                  fontWeight: 700,
                }}>
                  N
                </div>

                {/* Scale indicator */}
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <div style={{
                    width: '50px',
                    height: '2px',
                    background: 'rgba(0, 180, 216, 0.4)',
                  }} />
                  <span style={{
                    fontSize: '8px',
                    color: 'rgba(0, 180, 216, 0.5)',
                    letterSpacing: '1px',
                  }}>
                    50 FT
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div style={{
                marginTop: '20px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '16px',
                maxWidth: '800px',
              }}>
                {rooms.map(room => (
                  <div key={room.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: 0.7,
                  }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      background: room.color,
                      borderRadius: '2px',
                    }} />
                    <span style={{
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      letterSpacing: '0.5px',
                    }}>
                      {room.label}
                    </span>
                  </div>
                ))}
                {/* Cashier legend entry (inside The Bar) */}
                {dollarApp && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: 0.7,
                  }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      background: '#fde047',
                      borderRadius: '2px',
                    }} />
                    <span style={{
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      letterSpacing: '0.5px',
                    }}>
                      CASHIER <span style={{ fontSize: '9px', opacity: 0.6 }}>(in Bar)</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Chat with agent button */}
              <button
                onClick={() => setIsAgentOpen(true)}
                style={{
                  marginTop: '24px',
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)',
                  border: '1px solid rgba(245, 158, 11, 0.5)',
                  borderRadius: '8px',
                  color: '#f59e0b',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  letterSpacing: '1px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                  e.currentTarget.style.color = '#000000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)';
                  e.currentTarget.style.color = '#f59e0b';
                }}
              >
                <Bot className="w-5 h-5" />
                Ask the Concierge
              </button>
            </div>
          )}

          {/* Active Window - App Content */}
          {activeWindowId && activeWindowId !== 'agent' && (
            <div style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Window Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                background: 'rgba(0,0,0,0.5)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={closeWindow}
                    style={{
                      padding: '8px',
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h2 style={{ fontSize: '18px', fontWeight: 600 }}>
                    {currentAppConfig?.name ||
                     (activeWindowId === 'files' ? 'Memory' :
                      activeWindowId === 'settings' ? 'Settings' :
                      'App')}
                  </h2>
                </div>
                <button
                  onClick={() => setIsAgentOpen(true)}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(245,158,11,0.2)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: '8px',
                    color: '#f59e0b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  <Bot className="w-4 h-4" />
                  Ask Otto
                </button>
              </div>

              {/* Window Content */}
              <div style={{ flex: 1, overflow: 'auto' }}>
                {activeWindowId === 'files' && (
                  <AppErrorBoundary appName="Memory">
                    <Suspense fallback={<LoadingFallback />}>
                      <FileBrowser spaceId={spaceId} onFileSelect={() => {}} />
                    </Suspense>
                  </AppErrorBoundary>
                )}

                {activeWindowId === 'settings' && (
                  <AppErrorBoundary appName="Settings">
                    <Suspense fallback={<LoadingFallback />}>
                      <Settings />
                    </Suspense>
                  </AppErrorBoundary>
                )}

                {CurrentApp && currentAppConfig && (
                  <AppErrorBoundary appName={currentAppConfig.name}>
                    <Suspense fallback={<LoadingFallback />}>
                      <CurrentApp />
                    </Suspense>
                  </AppErrorBoundary>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Social Notification Toast */}
        {socialNotification && (
          <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(22, 163, 74, 0.95) 100%)',
            color: '#ffffff',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            zIndex: 200,
            animation: 'notification-slide 3s ease-in-out forwards',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
            fontWeight: 500,
          }}>
            <span style={{ fontSize: '20px' }}>
              {socialNotification.type === 'wave' ? '👋' : socialNotification.type === 'friend' ? '➕' : '💬'}
            </span>
            <span>
              {socialNotification.type === 'wave'
                ? `You waved at ${socialNotification.playerName}!`
                : socialNotification.type === 'friend'
                ? `Friend request sent to ${socialNotification.playerName}!`
                : `Opening DM with ${socialNotification.playerName}...`}
            </span>
          </div>
        )}

        {/* Player Profile Modal */}
        {selectedPlayer && (
          <div
            onClick={() => setSelectedPlayer(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              zIndex: 150,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '400px',
                background: 'linear-gradient(180deg, #1a1a2e 0%, #12121a 100%)',
                borderRadius: '20px',
                border: `2px solid ${selectedPlayer.avatarColor}`,
                overflow: 'hidden',
                boxShadow: `0 0 40px ${selectedPlayer.avatarColor}40, 0 20px 60px rgba(0, 0, 0, 0.5)`,
              }}
            >
              {/* Profile Header with Avatar */}
              <div style={{
                position: 'relative',
                padding: '32px 24px 24px',
                background: `linear-gradient(180deg, ${selectedPlayer.avatarColor}20 0%, transparent 100%)`,
                textAlign: 'center',
              }}>
                {/* Close button */}
                <button
                  onClick={() => setSelectedPlayer(null)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                  }}
                >
                  ✕
                </button>

                {/* Large Avatar */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: selectedPlayer.avatarColor,
                  border: '4px solid rgba(255, 255, 255, 0.3)',
                  margin: '0 auto 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#ffffff',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  boxShadow: `0 0 30px ${selectedPlayer.avatarColor}60`,
                }}>
                  {selectedPlayer.username.charAt(0).toUpperCase()}
                  {/* Accessory for large avatar */}
                  {selectedPlayer.avatarAccessory === 'crown' && (
                    <span style={{ position: 'absolute', top: '-20px', fontSize: '24px' }}>👑</span>
                  )}
                  {selectedPlayer.avatarAccessory === 'hat' && (
                    <span style={{ position: 'absolute', top: '-16px', fontSize: '20px' }}>🎩</span>
                  )}
                  {selectedPlayer.avatarAccessory === 'glasses' && (
                    <span style={{ position: 'absolute', top: '20px', fontSize: '16px' }}>👓</span>
                  )}
                  {selectedPlayer.avatarAccessory === 'headphones' && (
                    <span style={{ position: 'absolute', top: '-12px', fontSize: '20px' }}>🎧</span>
                  )}
                  {selectedPlayer.avatarAccessory === 'bowtie' && (
                    <span style={{ position: 'absolute', bottom: '-8px', fontSize: '16px' }}>🎀</span>
                  )}
                </div>

                {/* Username */}
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: '4px',
                }}>
                  {selectedPlayer.username}
                </h2>

                {/* Online status */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  color: '#22c55e',
                  fontSize: '12px',
                  fontWeight: 500,
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    boxShadow: '0 0 8px #22c55e',
                  }} />
                  Online Now
                </div>
              </div>

              {/* Profile Details */}
              <div style={{
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                {/* Age */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                }}>
                  <span style={{ fontSize: '18px' }}>🎂</span>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Age</div>
                    <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 500 }}>{selectedPlayer.age} years old</div>
                  </div>
                </div>

                {/* Location */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                }}>
                  <span style={{ fontSize: '18px' }}>📍</span>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</div>
                    <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 500 }}>{selectedPlayer.location.country}, {selectedPlayer.location.state}</div>
                  </div>
                </div>

                {/* Gender */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                }}>
                  <span style={{ fontSize: '18px' }}>{selectedPlayer.gender === 'Male' ? '♂️' : selectedPlayer.gender === 'Female' ? '♀️' : '⚧️'}</span>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gender</div>
                    <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 500 }}>{selectedPlayer.gender}</div>
                  </div>
                </div>

                {/* Member Since */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                }}>
                  <span style={{ fontSize: '18px' }}>⭐</span>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Member Since</div>
                    <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 500 }}>
                      {new Date(selectedPlayer.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Facebook Link */}
                {selectedPlayer.facebookLinked && (
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #1877f2 0%, #0d65d9 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}>
                    <span style={{ fontSize: '18px' }}>📘</span>
                    View Facebook Profile
                  </button>
                )}
              </div>

              {/* Social Action Buttons */}
              <div style={{
                padding: '16px 24px',
                display: 'flex',
                gap: '10px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                {/* Wave Button */}
                <button
                  onClick={() => {
                    setSocialNotification({ type: 'wave', playerName: selectedPlayer.username });
                    setTimeout(() => setSocialNotification(null), 3000);
                    setSelectedPlayer(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#000000',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>👋</span>
                  Wave
                </button>

                {/* Add Friend Button */}
                <button
                  onClick={() => {
                    setSocialNotification({ type: 'friend', playerName: selectedPlayer.username });
                    setTimeout(() => setSocialNotification(null), 3000);
                    setSelectedPlayer(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>➕</span>
                  Add Friend
                </button>

                {/* Message Button */}
                <button
                  onClick={() => {
                    setSocialNotification({ type: 'dm', playerName: selectedPlayer.username });
                    setTimeout(() => setSocialNotification(null), 3000);
                    setSelectedPlayer(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>💬</span>
                  Message
                </button>
              </div>

              {/* Community Disclaimer */}
              <div style={{
                padding: '16px 24px 20px',
                textAlign: 'center',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <p style={{
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.4)',
                  lineHeight: 1.5,
                  margin: 0,
                }}>
                  {`DAM's Fortune Casino is not responsible for anything that happens outside of this platform. Everyone welcome 21+. No creepers.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Agent Chat Modal */}
        {isAgentOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 100,
          }}>
            <div style={{
              width: '100%',
              maxWidth: '600px',
              maxHeight: '80vh',
              background: '#12121a',
              borderRadius: '16px',
              border: '1px solid rgba(245,158,11,0.3)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Chat Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Bot className="w-6 h-6" style={{ color: '#f59e0b' }} />
                  <span style={{ fontSize: '18px', fontWeight: 600 }}>Otto</span>
                </div>
                <button
                  onClick={() => setIsAgentOpen(false)}
                  style={{
                    padding: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Content */}
              <div style={{ flex: 1, overflow: 'auto' }}>
                <AppErrorBoundary appName="Agent Chat">
                  <Suspense fallback={<LoadingFallback />}>
                    <AgentChat
                      spaceId={spaceId}
                      onFileAccess={() => {}}
                    />
                  </Suspense>
                </AppErrorBoundary>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Footer - Below Dock */}
        {!activeWindowId && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '8px 16px',
            background: 'rgba(0, 0, 0, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            textAlign: 'center',
            zIndex: 60,
          }}>
            <p style={{
              margin: 0,
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.4)',
              letterSpacing: '0.3px',
              lineHeight: 1.5,
            }}>
              © 2026 DAM Fortunes Casino • 21+ Only • No Purchase Necessary • For Entertainment Only • <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Official Rules</span> | <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Terms</span> | <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Privacy</span>
            </p>
          </div>
        )}

        {/* Bottom Dock - Mobile */}
        <div style={{
          position: 'fixed',
          bottom: !activeWindowId ? '32px' : 0,
          left: 0,
          right: 0,
          padding: '12px 16px 24px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.9) 100%)',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          zIndex: 50,
          transition: 'bottom 0.3s ease',
        }}>
          {config.apps.slice(0, 4).map(app => {
            const IconComponent = getAppIcon(app);
            const color = getAppColor(app.id, app.name);
            const isActive = activeWindowId === app.id;
            return (
              <button
                key={app.id}
                onClick={() => openApp(app.id)}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: isActive ? color : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <IconComponent className="w-6 h-6" style={{ color: isActive ? '#000000' : color }} />
              </button>
            );
          })}

          {/* Agent button */}
          <button
            onClick={() => setIsAgentOpen(true)}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: isAgentOpen ? '#f59e0b' : 'rgba(245,158,11,0.2)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Bot className="w-6 h-6" style={{ color: isAgentOpen ? '#000000' : '#f59e0b' }} />
          </button>
        </div>

        {/* === SHELL-LEVEL MUSIC PLAYER (persists across all rooms/apps) === */}
        <JukeboxPlayer />
      </div>
    </ErrorBoundary>
  );
}
