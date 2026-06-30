// Bouncer - 8D IMMERSIVE VIP Nightclub Entrance Experience for DAM Fortunes Casino
// ============================================================================
// SWEEPSTAKES CASINO COMPLIANCE:
// - Must be 21+ ONLY to play (not 18+)
// - No purchase necessary to play
// - Gold Coins are for entertainment only and have no cash value
// - This is the entrance checkpoint where players verify age and accept terms
// ============================================================================
// 8D IMMERSIVE PARALLAX ENVIRONMENT:
// - Dimension 1 (0.1x): Far background - night sky, distant city lights
// - Dimension 2 (0.3x): Mid background - neon signs, club facade
// - Dimension 3 (0.5x): Background objects - spotlights, paparazzi flashes
// - Dimension 4 (0.7x): Midground - velvet ropes, brass stanchions
// - Dimension 5 (1.0x): Player layer - main interactive content
// - Dimension 6 (1.3x): Foreground objects - floating VIP badges, confetti
// - Dimension 7 (1.5x): Near foreground - sparkles, lens flares
// - Dimension 8 (Fixed): UI overlay - vignette, 8D badge
// ============================================================================
import React, { useState, useEffect, useCallback } from 'react';
import { useSpaceRuntime } from '../../SpaceRuntimeContext';

// Database table for storing verification status
const VERIFICATION_TABLE = 'bouncer_verifications';
// Verification validity period (24 hours in milliseconds)
const VERIFICATION_VALIDITY_MS = 24 * 60 * 60 * 1000;

// ============================================================================
// TYPES
// ============================================================================
interface VerificationState {
  step: 'entrance' | 'id_check' | 'verifying' | 'terms' | 'access_granted' | 'access_denied';
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  termsAccepted: boolean;
  rulesAccepted: boolean;
  isVerified: boolean;
  error: string | null;
}

// ============================================================================
// CONSTANTS - Casino/Nightclub Theme
// ============================================================================
const COLORS = {
  background: '#0a0a0a',
  gold: '#d4af37',
  goldLight: '#f4d03f',
  goldDark: '#b8960c',
  velvetRed: '#8b0000',
  velvetLight: '#a52a2a',
  neonPink: '#ff1493',
  neonPurple: '#9932cc',
  neonBlue: '#00bfff',
  success: '#22c55e',
  error: '#dc2626',
  warning: '#f59e0b',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  textGold: '#d4af37',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function isValidDate(month: string, day: string, year: string): boolean {
  const m = parseInt(month, 10);
  const d = parseInt(day, 10);
  const y = parseInt(year, 10);

  if (isNaN(m) || isNaN(d) || isNaN(y)) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  if (y < 1900 || y > new Date().getFullYear()) return false;

  const date = new Date(y, m - 1, d);
  return date.getMonth() === m - 1 && date.getDate() === d;
}

// ============================================================================
// 8D IMMERSIVE NIGHTCLUB ENTRANCE ENVIRONMENT
// ============================================================================
function Immersive8DNightclub({
  children,
  mousePos,
  step
}: {
  children: React.ReactNode;
  mousePos: { x: number; y: number };
  step: string;
}) {
  const [neonFlicker, setNeonFlicker] = useState(1);
  const [spotlightAngle, setSpotlightAngle] = useState(0);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    type: 'sparkle' | 'confetti' | 'flash' | 'star';
    delay: number;
    color: string;
  }>>([]);

  // Parallax calculation for depth effect
  const parallax = (factor: number) => ({
    x: (mousePos.x - 0.5) * 40 * factor,
    y: (mousePos.y - 0.5) * 25 * factor,
  });

  // Neon flicker effect
  useEffect(() => {
    const interval = setInterval(() => {
      setNeonFlicker(0.85 + Math.random() * 0.15);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Spotlight sweep
  useEffect(() => {
    const interval = setInterval(() => {
      setSpotlightAngle(prev => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Generate particles
  useEffect(() => {
    const particleTypes: Array<'sparkle' | 'confetti' | 'flash' | 'star'> = ['sparkle', 'confetti', 'flash', 'star'];
    const colors = ['#ff1493', '#d4af37', '#9932cc', '#00bfff', '#ffffff'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      type: particleTypes[Math.floor(Math.random() * particleTypes.length)],
      delay: Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      perspective: '1200px',
      perspectiveOrigin: '50% 50%',
      background: 'linear-gradient(180deg, #050508 0%, #0a0a12 30%, #0d0510 60%, #0a0808 100%)',
    }}>
      {/* ============================================ */}
      {/* DIMENSION 1: Far Background (0.1x parallax) */}
      {/* Night sky with city lights                  */}
      {/* ============================================ */}
      <div style={{
        position: 'absolute',
        inset: 0,
        transform: `translate(${parallax(0.1).x}px, ${parallax(0.1).y}px)`,
        transition: 'transform 0.3s ease-out',
      }}>
        {/* Stars in the night sky */}
        {Array.from({ length: 80 }, (_, i) => (
          <div
            key={`star-${i}`}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 40}%`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              borderRadius: '50%',
              background: '#ffffff',
              opacity: 0.3 + Math.random() * 0.5,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Distant city skyline silhouette */}
        <div style={{
          position: 'absolute',
          bottom: '30%',
          left: 0,
          right: 0,
          height: '200px',
          opacity: 0.15,
        }}>
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={`building-${i}`}
              style={{
                position: 'absolute',
                left: `${i * 5}%`,
                bottom: 0,
                width: `${30 + Math.random() * 40}px`,
                height: `${60 + Math.random() * 140}px`,
                background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a15 100%)',
                borderRadius: '2px 2px 0 0',
              }}
            >
              {/* Building windows */}
              {Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, j) => (
                <div
                  key={j}
                  style={{
                    position: 'absolute',
                    left: `${20 + Math.random() * 60}%`,
                    top: `${10 + j * 12}%`,
                    width: '4px',
                    height: '4px',
                    background: Math.random() > 0.5 ? '#ffeb3b' : '#ff9800',
                    opacity: 0.6 + Math.random() * 0.4,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ============================================ */}
      {/* DIMENSION 2: Mid Background (0.3x parallax) */}
      {/* Neon club signs and facade                  */}
      {/* ============================================ */}
      <div style={{
        position: 'absolute',
        inset: 0,
        transform: `translate(${parallax(0.3).x}px, ${parallax(0.3).y}px)`,
        transition: 'transform 0.25s ease-out',
      }}>
        {/* "VIP ENTRANCE" neon sign */}
        <div style={{
          position: 'absolute',
          top: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 'clamp(32px, 6vw, 56px)',
          fontWeight: 900,
          color: COLORS.neonPink,
          fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: '8px',
          opacity: neonFlicker,
          textShadow: `
            0 0 10px ${COLORS.neonPink},
            0 0 20px ${COLORS.neonPink},
            0 0 40px ${COLORS.neonPink},
            0 0 80px ${COLORS.neonPink}
          `,
        }}>
          VIP ENTRANCE
        </div>

        {/* "DAM FORTUNES" secondary sign */}
        <div style={{
          position: 'absolute',
          top: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 'clamp(18px, 3vw, 28px)',
          fontWeight: 700,
          color: COLORS.gold,
          fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: '6px',
          textShadow: `
            0 0 10px ${COLORS.gold},
            0 0 20px ${COLORS.gold},
            0 0 40px rgba(212, 175, 55, 0.5)
          `,
        }}>
          DAM FORTUNES CASINO
        </div>

        {/* Club facade pillars */}
        {[-1, 1].map((side, i) => (
          <div
            key={`pillar-${i}`}
            style={{
              position: 'absolute',
              [side === -1 ? 'left' : 'right']: '8%',
              top: '15%',
              bottom: '10%',
              width: '40px',
              background: 'linear-gradient(90deg, #1a1a2e 0%, #2a2a3e 50%, #1a1a2e 100%)',
              borderRadius: '4px',
              boxShadow: `
                inset 2px 0 10px rgba(255,255,255,0.05),
                ${side * 5}px 0 30px rgba(0,0,0,0.5)
              `,
            }}
          >
            {/* Gold trim */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '30px',
              background: 'linear-gradient(180deg, #f4d03f 0%, #d4af37 50%, #b8960c 100%)',
              borderRadius: '4px 4px 0 0',
            }} />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '30px',
              background: 'linear-gradient(180deg, #b8960c 0%, #d4af37 50%, #f4d03f 100%)',
              borderRadius: '0 0 4px 4px',
            }} />
          </div>
        ))}
      </div>

      {/* ============================================ */}
      {/* DIMENSION 3: Background (0.5x parallax)     */}
      {/* Spotlights and paparazzi flashes            */}
      {/* ============================================ */}
      <div style={{
        position: 'absolute',
        inset: 0,
        transform: `translate(${parallax(0.5).x}px, ${parallax(0.5).y}px)`,
        transition: 'transform 0.2s ease-out',
        pointerEvents: 'none',
      }}>
        {/* Sweeping spotlights */}
        {[0, 1, 2].map((i) => (
          <div
            key={`spotlight-${i}`}
            style={{
              position: 'absolute',
              top: '5%',
              left: `${25 + i * 25}%`,
              width: '200px',
              height: '600px',
              background: `linear-gradient(
                ${180 + Math.sin((spotlightAngle + i * 120) * Math.PI / 180) * 30}deg,
                rgba(255, 255, 255, 0.1) 0%,
                transparent 70%
              )`,
              transformOrigin: 'top center',
              transform: `rotate(${Math.sin((spotlightAngle + i * 120) * Math.PI / 180) * 20}deg)`,
              opacity: 0.4,
              filter: 'blur(2px)',
            }}
          />
        ))}

        {/* Paparazzi flash effects */}
        {step === 'entrance' && Array.from({ length: 8 }, (_, i) => (
          <div
            key={`flash-${i}`}
            style={{
              position: 'absolute',
              left: `${10 + Math.random() * 80}%`,
              top: `${30 + Math.random() * 40}%`,
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: '0 0 20px 10px rgba(255,255,255,0.8)',
              animation: `paparazziFlash 3s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* ============================================ */}
      {/* DIMENSION 4: Midground (0.7x parallax)      */}
      {/* Velvet ropes and brass stanchions           */}
      {/* ============================================ */}
      <div style={{
        position: 'absolute',
        inset: 0,
        transform: `translate(${parallax(0.7).x}px, ${parallax(0.7).y}px)`,
        transition: 'transform 0.15s ease-out',
        pointerEvents: 'none',
      }}>
        {/* Velvet rope stanchions */}
        {step === 'entrance' && [-1, 1].map((side, i) => (
          <div
            key={`stanchion-${i}`}
            style={{
              position: 'absolute',
              [side === -1 ? 'left' : 'right']: '15%',
              bottom: '20%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Brass ball top */}
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f4d03f 0%, #d4af37 50%, #b8960c 100%)',
              boxShadow: '0 2px 15px rgba(212, 175, 55, 0.5), inset 0 -3px 6px rgba(0,0,0,0.3)',
            }} />
            {/* Post */}
            <div style={{
              width: '14px',
              height: '180px',
              background: 'linear-gradient(90deg, #b8960c 0%, #f4d03f 30%, #d4af37 50%, #f4d03f 70%, #b8960c 100%)',
              boxShadow: '3px 0 15px rgba(0,0,0,0.3)',
            }} />
            {/* Base */}
            <div style={{
              width: '50px',
              height: '20px',
              borderRadius: '50%',
              background: 'linear-gradient(180deg, #f4d03f 0%, #b8960c 100%)',
              boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
            }} />
          </div>
        ))}

        {/* Velvet rope (curved) */}
        {step === 'entrance' && (
          <svg
            style={{
              position: 'absolute',
              bottom: '32%',
              left: '15%',
              width: '70%',
              height: '80px',
              pointerEvents: 'none',
            }}
            viewBox="0 0 600 80"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="ropeGrad8D" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a52a2a" />
                <stop offset="50%" stopColor="#8b0000" />
                <stop offset="100%" stopColor="#5c0000" />
              </linearGradient>
              <filter id="ropeShadow8D">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.6)" />
              </filter>
            </defs>
            <path
              d="M 0 20 Q 300 70 600 20"
              stroke="url(#ropeGrad8D)"
              strokeWidth="20"
              fill="none"
              strokeLinecap="round"
              filter="url(#ropeShadow8D)"
            />
            <path
              d="M 0 20 Q 300 70 600 20"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
              fill="none"
              strokeDasharray="25 12"
            />
          </svg>
        )}

        {/* Red carpet perspective */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '30%',
          width: '40%',
          height: '45%',
          background: `
            linear-gradient(180deg,
              rgba(139,0,0,0) 0%,
              rgba(139,0,0,0.4) 30%,
              rgba(139,0,0,0.8) 70%,
              #8b0000 100%
            )
          `,
          transform: 'perspective(400px) rotateX(50deg)',
          transformOrigin: 'bottom center',
        }}>
          {/* Carpet texture */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `
              repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 6px)
            `,
          }} />
          {/* Gold trim */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: '30%',
            bottom: 0,
            width: '10px',
            background: 'linear-gradient(180deg, transparent 0%, #d4af37 50%, #f4d03f 100%)',
          }} />
          <div style={{
            position: 'absolute',
            right: 0,
            top: '30%',
            bottom: 0,
            width: '10px',
            background: 'linear-gradient(180deg, transparent 0%, #d4af37 50%, #f4d03f 100%)',
          }} />
        </div>
      </div>

      {/* ============================================ */}
      {/* DIMENSION 5: Player Layer (1.0x parallax)   */}
      {/* Main interactive content                    */}
      {/* ============================================ */}
      <div style={{
        position: 'absolute',
        inset: 0,
        transform: `translate(${parallax(1.0).x}px, ${parallax(1.0).y}px)`,
        transition: 'transform 0.1s ease-out',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}>
        {children}
      </div>

      {/* ============================================ */}
      {/* DIMENSION 6: Foreground (1.3x parallax)     */}
      {/* Floating VIP badges, confetti               */}
      {/* ============================================ */}
      <div style={{
        position: 'absolute',
        inset: 0,
        transform: `translate(${parallax(1.3).x}px, ${parallax(1.3).y}px)`,
        transition: 'transform 0.08s ease-out',
        pointerEvents: 'none',
      }}>
        {/* Floating VIP badges */}
        {[
          { x: 5, y: 20, size: 40 },
          { x: 90, y: 35, size: 35 },
          { x: 8, y: 70, size: 30 },
          { x: 88, y: 75, size: 38 },
        ].map((badge, i) => (
          <div
            key={`badge-${i}`}
            style={{
              position: 'absolute',
              left: `${badge.x}%`,
              top: `${badge.y}%`,
              width: `${badge.size}px`,
              height: `${badge.size}px`,
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #d4af37 0%, #b8960c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: `${badge.size * 0.35}px`,
              fontWeight: 900,
              color: '#0a0a0a',
              boxShadow: `
                0 0 20px rgba(212, 175, 55, 0.5),
                inset 0 -2px 6px rgba(0,0,0,0.3)
              `,
              animation: `floatBadge ${4 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
              opacity: 0.7,
            }}
          >
            VIP
          </div>
        ))}

        {/* Confetti particles */}
        {step === 'access_granted' && particles.filter(p => p.type === 'confetti').slice(0, 20).map(p => (
          <div
            key={`confetti-${p.id}`}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: '8px',
              height: '12px',
              background: p.color,
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `confettiFall 3s linear infinite`,
              animationDelay: `${p.delay}s`,
              opacity: 0.8,
            }}
          />
        ))}
      </div>

      {/* ============================================ */}
      {/* DIMENSION 7: Near Foreground (1.5x parallax)*/}
      {/* Sparkles, lens flares, light rays           */}
      {/* ============================================ */}
      <div style={{
        position: 'absolute',
        inset: 0,
        transform: `translate(${parallax(1.5).x}px, ${parallax(1.5).y}px)`,
        transition: 'transform 0.05s ease-out',
        pointerEvents: 'none',
      }}>
        {/* Sparkle particles */}
        {particles.filter(p => p.type === 'sparkle').map(p => (
          <div
            key={`sparkle-${p.id}`}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: '4px',
              height: '4px',
              background: p.color,
              borderRadius: '50%',
              boxShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}`,
              animation: `sparkle8D 2s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}

        {/* Lens flares */}
        {[
          { x: 20, y: 15, size: 60, color: 'rgba(255, 20, 147, 0.2)' },
          { x: 80, y: 12, size: 50, color: 'rgba(153, 50, 204, 0.2)' },
          { x: 50, y: 8, size: 80, color: 'rgba(212, 175, 55, 0.15)' },
        ].map((flare, i) => (
          <div
            key={`flare-${i}`}
            style={{
              position: 'absolute',
              left: `${flare.x}%`,
              top: `${flare.y}%`,
              width: `${flare.size}px`,
              height: `${flare.size}px`,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${flare.color} 0%, transparent 70%)`,
              animation: `pulseLensFlare 3s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}

        {/* Light rays from top */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={`ray-${i}`}
            style={{
              position: 'absolute',
              top: '-5%',
              left: `${15 + i * 18}%`,
              width: '2px',
              height: '40%',
              background: `linear-gradient(180deg,
                rgba(255, 255, 255, 0.3) 0%,
                rgba(255, 255, 255, 0.1) 50%,
                transparent 100%
              )`,
              transform: `rotate(${-10 + i * 5}deg)`,
              opacity: 0.4,
              animation: `lightRay8D 4s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* ============================================ */}
      {/* DIMENSION 8: UI Overlay (Fixed position)    */}
      {/* Vignette, 8D badge                          */}
      {/* ============================================ */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
      }}>
        {/* Vignette overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)`,
        }} />

        {/* Neon border glow */}
        <div style={{
          position: 'absolute',
          inset: 0,
          boxShadow: `
            inset 0 0 100px rgba(255, 20, 147, 0.1),
            inset 0 0 200px rgba(153, 50, 204, 0.05)
          `,
        }} />

        {/* 8D Immersive badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          padding: '6px 14px',
          background: 'linear-gradient(135deg, rgba(255, 20, 147, 0.3) 0%, rgba(153, 50, 204, 0.3) 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 20, 147, 0.5)',
          backdropFilter: 'blur(10px)',
        }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '2px',
            textShadow: '0 0 10px rgba(255, 20, 147, 0.8)',
          }}>
            8D IMMERSIVE
          </span>
        </div>
      </div>

      {/* CSS Keyframe Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        @keyframes paparazziFlash {
          0%, 90%, 100% { opacity: 0; transform: scale(0.5); }
          92% { opacity: 1; transform: scale(1.5); }
          95% { opacity: 0; transform: scale(2); }
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(5deg); }
          50% { transform: translateY(-8px) rotate(-3deg); }
          75% { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes sparkle8D {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes pulseLensFlare {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.3); }
        }
        @keyframes lightRay8D {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes neonFlicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
          20%, 24%, 55% { opacity: 0.6; }
        }
        @keyframes buttonPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes scanLine {
          0%, 100% { top: 0; }
          50% { top: calc(100% - 4px); }
        }
        @keyframes loadingDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes badgeReveal {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          60% { transform: scale(1.2) rotate(10deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes doorOpenLeft {
          0% { transform: perspective(1000px) rotateY(0deg); }
          100% { transform: perspective(1000px) rotateY(-90deg); }
        }
        @keyframes doorOpenRight {
          0% { transform: perspective(1000px) rotateY(0deg); }
          100% { transform: perspective(1000px) rotateY(90deg); }
        }
        @keyframes lightBurst {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(5); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(20); opacity: 0; }
        }
        @keyframes welcomeFade {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shakeIn {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
          50% { box-shadow: 0 0 0 15px rgba(220, 38, 38, 0); }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// ID CARD INPUT COMPONENT (8D styled)
// ============================================================================
function IDCardInput({
  state,
  onChange,
  onVerify,
}: {
  state: VerificationState;
  onChange: (field: string, value: string) => void;
  onVerify: () => void;
}) {
  const canVerify = state.birthMonth && state.birthDay && state.birthYear &&
    isValidDate(state.birthMonth, state.birthDay, state.birthYear);

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(20,15,25,0.95) 0%, rgba(10,10,15,0.98) 100%)',
      borderRadius: '20px',
      border: '2px solid rgba(255, 20, 147, 0.3)',
      padding: '28px',
      maxWidth: '420px',
      width: '90%',
      boxShadow: `
        0 25px 80px rgba(0,0,0,0.6),
        0 0 40px rgba(255, 20, 147, 0.1),
        inset 0 1px 0 rgba(255,255,255,0.05)
      `,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated neon border top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #ff1493 0%, #9932cc 50%, #ff1493 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s linear infinite',
      }} />

      {/* ID Icon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
      }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(255, 20, 147, 0.2) 0%, rgba(153, 50, 204, 0.2) 100%)',
          border: '2px solid rgba(255, 20, 147, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          boxShadow: '0 0 30px rgba(255, 20, 147, 0.3)',
        }}>
          🪪
        </div>
      </div>

      <h2 style={{
        color: COLORS.neonPink,
        fontSize: '22px',
        fontWeight: 700,
        textAlign: 'center',
        marginBottom: '8px',
        fontFamily: "'Space Grotesk', sans-serif",
        textShadow: '0 0 20px rgba(255, 20, 147, 0.5)',
      }}>
        Age Verification Required
      </h2>

      {/* 21+ Badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '16px',
      }}>
        <span style={{
          padding: '8px 20px',
          borderRadius: '25px',
          background: 'rgba(220, 38, 38, 0.15)',
          border: '2px solid #dc2626',
          color: '#dc2626',
          fontSize: '18px',
          fontWeight: 800,
          letterSpacing: '2px',
          boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)',
        }}>
          21+ ONLY
        </span>
      </div>

      <p style={{
        color: COLORS.textSecondary,
        fontSize: '14px',
        textAlign: 'center',
        marginBottom: '24px',
      }}>
        You must be <strong style={{ color: '#dc2626' }}>21 or older</strong> to enter DAM Fortunes Casino
      </p>

      {/* Date inputs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Month', placeholder: 'MM', field: 'birthMonth', max: 2, flex: 1 },
          { label: 'Day', placeholder: 'DD', field: 'birthDay', max: 2, flex: 1 },
          { label: 'Year', placeholder: 'YYYY', field: 'birthYear', max: 4, flex: 1.5 },
        ].map((input) => (
          <div key={input.field} style={{ flex: input.flex }}>
            <label style={{
              display: 'block',
              color: COLORS.textSecondary,
              fontSize: '11px',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              {input.label}
            </label>
            <input
              type="text"
              placeholder={input.placeholder}
              maxLength={input.max}
              value={(state as any)[input.field]}
              onChange={(e) => onChange(input.field, e.target.value.replace(/\D/g, ''))}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                border: '2px solid rgba(255, 20, 147, 0.2)',
                background: 'rgba(0,0,0,0.5)',
                color: COLORS.textPrimary,
                fontSize: '18px',
                fontWeight: 600,
                textAlign: 'center',
                outline: 'none',
                transition: 'all 0.3s ease',
                fontFamily: "'Space Grotesk', monospace",
              }}
            />
          </div>
        ))}
      </div>

      {/* Error */}
      {state.error && (
        <div style={{
          background: 'rgba(220, 38, 38, 0.1)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          borderRadius: '10px',
          padding: '12px',
          marginBottom: '16px',
          color: COLORS.error,
          fontSize: '14px',
          textAlign: 'center',
          animation: 'shake 0.5s ease-in-out',
        }}>
          {state.error}
        </div>
      )}

      {/* Verify Button */}
      <button
        onClick={onVerify}
        disabled={!canVerify}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '12px',
          border: 'none',
          background: canVerify
            ? 'linear-gradient(145deg, #ff1493 0%, #9932cc 100%)'
            : 'rgba(100, 100, 100, 0.3)',
          color: canVerify ? '#fff' : '#666',
          fontSize: '16px',
          fontWeight: 700,
          cursor: canVerify ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s ease',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          fontFamily: "'Space Grotesk', sans-serif",
          boxShadow: canVerify ? '0 4px 30px rgba(255, 20, 147, 0.4)' : 'none',
        }}
      >
        Verify Age
      </button>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// VERIFYING ANIMATION
// ============================================================================
function VerifyingAnimation() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
    }}>
      <div style={{
        width: '120px',
        height: '80px',
        border: '3px solid rgba(255, 20, 147, 0.3)',
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '24px',
        background: 'rgba(10,10,20,0.8)',
      }}>
        <div style={{
          position: 'absolute',
          inset: '10px',
          background: 'rgba(255, 20, 147, 0.1)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
        }}>
          🪪
        </div>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, transparent 0%, #22c55e 50%, transparent 100%)',
          boxShadow: '0 0 20px #22c55e',
          animation: 'scanLine 1.5s ease-in-out infinite',
        }} />
      </div>

      <div style={{
        color: COLORS.neonPink,
        fontSize: '18px',
        fontWeight: 600,
        marginBottom: '8px',
        fontFamily: "'Space Grotesk', sans-serif",
        textShadow: '0 0 20px rgba(255, 20, 147, 0.5)',
      }}>
        Checking ID...
      </div>

      <div style={{ color: COLORS.textSecondary, fontSize: '14px', marginBottom: '16px' }}>
        Verifying your age
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: COLORS.neonPink,
              animation: 'loadingDot 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// TERMS ACCEPTANCE (8D styled)
// ============================================================================
function TermsAcceptance({
  state,
  onChange,
  onAccept,
}: {
  state: VerificationState;
  onChange: (field: string, value: boolean) => void;
  onAccept: () => void;
}) {
  const canProceed = state.termsAccepted && state.rulesAccepted;

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(20,15,25,0.95) 0%, rgba(10,10,15,0.98) 100%)',
      borderRadius: '20px',
      border: '2px solid rgba(34, 197, 94, 0.3)',
      padding: '28px',
      maxWidth: '440px',
      width: '90%',
      boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 40px rgba(34, 197, 94, 0.1)',
    }}>
      {/* Success icon */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px',
      }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)',
          border: '3px solid rgba(34, 197, 94, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          animation: 'popIn 0.5s ease-out',
          boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)',
        }}>
          ✓
        </div>
      </div>

      <h2 style={{
        color: COLORS.success,
        fontSize: '22px',
        fontWeight: 700,
        textAlign: 'center',
        marginBottom: '8px',
        fontFamily: "'Space Grotesk', sans-serif",
        textShadow: '0 0 20px rgba(34, 197, 94, 0.5)',
      }}>
        Age Verified
      </h2>

      <p style={{
        color: COLORS.textSecondary,
        fontSize: '14px',
        textAlign: 'center',
        marginBottom: '24px',
      }}>
        Please review and accept our terms to enter
      </p>

      {/* Checkboxes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
        {[
          { field: 'termsAccepted', title: 'I accept the Terms of Service', desc: 'I agree to the Terms of Service and Privacy Policy' },
          { field: 'rulesAccepted', title: 'I accept the Sweepstakes Rules', desc: 'I have read and agree to the Official Sweepstakes Rules' },
        ].map((item) => (
          <label
            key={item.field}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              cursor: 'pointer',
              padding: '14px',
              borderRadius: '10px',
              background: (state as any)[item.field] ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${(state as any)[item.field] ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255,255,255,0.1)'}`,
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '8px',
              border: `2px solid ${(state as any)[item.field] ? COLORS.success : 'rgba(255,255,255,0.3)'}`,
              background: (state as any)[item.field] ? COLORS.success : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              flexShrink: 0,
            }}>
              {(state as any)[item.field] && (
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>✓</span>
              )}
            </div>
            <input
              type="checkbox"
              checked={(state as any)[item.field]}
              onChange={(e) => onChange(item.field, e.target.checked)}
              style={{ display: 'none' }}
            />
            <div>
              <div style={{ color: COLORS.textPrimary, fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                {item.title}
              </div>
              <div style={{ color: COLORS.textSecondary, fontSize: '12px' }}>
                {item.desc}
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Sweepstakes disclaimer */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        borderRadius: '10px',
        padding: '14px',
        marginBottom: '20px',
      }}>
        <p style={{
          color: COLORS.textSecondary,
          fontSize: '11px',
          lineHeight: 1.6,
          margin: 0,
          textAlign: 'center',
        }}>
          <strong style={{ color: COLORS.gold }}>🎰 Sweepstakes Promotional Platform</strong>
          <br />
          No purchase necessary to play. Gold Coins are for entertainment only and have no cash value.
          <br />
          <span style={{ color: '#dc2626', fontWeight: 600 }}>Must be 21 years or older.</span>
          {' '}Void where prohibited.
        </p>
      </div>

      {/* Enter Button */}
      <button
        onClick={onAccept}
        disabled={!canProceed}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '12px',
          border: 'none',
          background: canProceed
            ? 'linear-gradient(145deg, #22c55e 0%, #16a34a 100%)'
            : 'rgba(100, 100, 100, 0.3)',
          color: canProceed ? '#fff' : '#666',
          fontSize: '16px',
          fontWeight: 700,
          cursor: canProceed ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s ease',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          fontFamily: "'Space Grotesk', sans-serif",
          boxShadow: canProceed ? '0 4px 30px rgba(34, 197, 94, 0.4)' : 'none',
        }}
      >
        Enter Casino
      </button>
    </div>
  );
}

// ============================================================================
// ACCESS GRANTED ANIMATION (8D)
// ============================================================================
function AccessGrantedAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'badge' | 'doors' | 'welcome'>('badge');

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('doors'), 1500);
    const timer2 = setTimeout(() => setPhase('welcome'), 3000);
    const timer3 = setTimeout(onComplete, 4500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #050508 0%, #0a0a12 50%, #0d0510 100%)',
      zIndex: 100,
      overflow: 'hidden',
    }}>
      {phase === 'badge' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'badgeReveal 1.5s ease-out',
        }}>
          <div style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #ff1493 0%, #9932cc 50%, #ff1493 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '56px',
            boxShadow: `
              0 0 60px rgba(255, 20, 147, 0.6),
              0 0 120px rgba(153, 50, 204, 0.4),
              inset 0 -4px 20px rgba(0,0,0,0.3)
            `,
            marginBottom: '24px',
          }}>
            👑
          </div>
          <div style={{
            color: COLORS.neonPink,
            fontSize: '36px',
            fontWeight: 700,
            fontFamily: "'Space Grotesk', sans-serif",
            textShadow: `
              0 0 20px rgba(255, 20, 147, 0.8),
              0 0 40px rgba(255, 20, 147, 0.5)
            `,
          }}>
            VIP ACCESS
          </div>
        </div>
      )}

      {phase === 'doors' && (
        <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex' }}>
          <div style={{
            width: '50%',
            height: '100%',
            background: 'linear-gradient(90deg, #1a1a2e 0%, #2a2a3e 50%, #1a1a2e 100%)',
            borderRight: '4px solid #ff1493',
            animation: 'doorOpenLeft 1.5s ease-in-out forwards',
            transformOrigin: 'left center',
            boxShadow: 'inset -20px 0 40px rgba(255, 20, 147, 0.2)',
          }} />
          <div style={{
            width: '50%',
            height: '100%',
            background: 'linear-gradient(90deg, #1a1a2e 0%, #2a2a3e 50%, #1a1a2e 100%)',
            borderLeft: '4px solid #ff1493',
            animation: 'doorOpenRight 1.5s ease-in-out forwards',
            transformOrigin: 'right center',
            boxShadow: 'inset 20px 0 40px rgba(255, 20, 147, 0.2)',
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 20, 147, 0.8) 0%, transparent 70%)',
            animation: 'lightBurst 1.5s ease-out forwards',
          }} />
        </div>
      )}

      {phase === 'welcome' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'welcomeFade 1.5s ease-out',
        }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎰</div>
          <div style={{
            color: COLORS.neonPink,
            fontSize: '32px',
            fontWeight: 700,
            fontFamily: "'Space Grotesk', sans-serif",
            textAlign: 'center',
            marginBottom: '8px',
            textShadow: '0 0 30px rgba(255, 20, 147, 0.5)',
          }}>
            Welcome to DAM Fortunes
          </div>
          <div style={{ color: COLORS.textSecondary, fontSize: '18px' }}>
            Good luck and have fun!
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ACCESS DENIED (8D styled)
// ============================================================================
function AccessDenied({ onRetry }: { onRetry: () => void }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      animation: 'shakeIn 0.5s ease-out',
    }}>
      <div style={{
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)',
        border: '3px solid rgba(220, 38, 38, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '44px',
        marginBottom: '24px',
        animation: 'pulse 2s infinite',
        boxShadow: '0 0 30px rgba(220, 38, 38, 0.3)',
        color: '#dc2626',
      }}>
        ✕
      </div>

      <h2 style={{
        color: COLORS.error,
        fontSize: '26px',
        fontWeight: 700,
        marginBottom: '12px',
        fontFamily: "'Space Grotesk', sans-serif",
        textShadow: '0 0 20px rgba(220, 38, 38, 0.3)',
      }}>
        Access Denied
      </h2>

      <p style={{
        color: COLORS.textSecondary,
        fontSize: '16px',
        textAlign: 'center',
        maxWidth: '340px',
        marginBottom: '24px',
        lineHeight: 1.6,
      }}>
        Sorry, you must be <strong style={{ color: '#dc2626' }}>21 years or older</strong> to enter DAM Fortunes Casino.
      </p>

      <div style={{
        background: 'rgba(220, 38, 38, 0.1)',
        border: '1px solid rgba(220, 38, 38, 0.3)',
        borderRadius: '12px',
        padding: '16px 24px',
        marginBottom: '24px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '3px solid #dc2626',
            color: '#dc2626',
            fontSize: '16px',
            fontWeight: 800,
          }}>
            21+
          </span>
        </div>
        <p style={{
          color: COLORS.textSecondary,
          fontSize: '12px',
          margin: '12px 0 0 0',
          textAlign: 'center',
        }}>
          Age verification is required by law for sweepstakes casino platforms.
        </p>
      </div>

      <button
        onClick={onRetry}
        style={{
          padding: '14px 36px',
          borderRadius: '12px',
          border: '2px solid rgba(255, 20, 147, 0.4)',
          background: 'rgba(255, 20, 147, 0.1)',
          color: COLORS.neonPink,
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        Try Again
      </button>
    </div>
  );
}

// ============================================================================
// ENTRANCE SCREEN (8D styled)
// ============================================================================
function EntranceScreen({ onApproach }: { onApproach: () => void }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 10,
    }}>
      {/* 21+ Badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px',
      }}>
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'linear-gradient(145deg, rgba(220, 38, 38, 0.3) 0%, rgba(139, 0, 0, 0.4) 100%)',
          border: '4px solid #dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 40px rgba(220, 38, 38, 0.5), inset 0 0 20px rgba(220, 38, 38, 0.2)',
        }}>
          <span style={{
            color: '#ffffff',
            fontSize: '32px',
            fontWeight: 800,
            fontFamily: "'Space Grotesk', sans-serif",
            textShadow: '0 0 15px rgba(255, 255, 255, 0.5)',
          }}>
            21+
          </span>
        </div>
      </div>

      {/* Casino name */}
      <h1 style={{
        color: COLORS.gold,
        fontSize: 'clamp(28px, 6vw, 48px)',
        fontWeight: 700,
        textAlign: 'center',
        marginBottom: '8px',
        fontFamily: "'Space Grotesk', sans-serif",
        textShadow: '0 0 40px rgba(212, 175, 55, 0.4)',
      }}>
        DAM Fortunes Casino
      </h1>

      <p style={{
        color: COLORS.textSecondary,
        fontSize: 'clamp(14px, 3vw, 18px)',
        textAlign: 'center',
        marginBottom: '24px',
        fontStyle: 'italic',
      }}>
        Easy play. Daily fortunes.
      </p>

      {/* Sweepstakes box */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '14px',
        padding: '18px 24px',
        maxWidth: '420px',
        width: '90%',
        marginBottom: '32px',
        textAlign: 'center',
      }}>
        <p style={{
          color: COLORS.textSecondary,
          fontSize: '12px',
          lineHeight: 1.7,
          margin: 0,
        }}>
          <strong style={{ color: COLORS.gold }}>🎰 Sweepstakes Promotional Platform</strong>
          <br />
          No purchase necessary to play. Gold Coins are for entertainment only and have no cash value.
          <br />
          <strong style={{ color: '#dc2626' }}>Must be 21 years or older.</strong>
        </p>
      </div>

      {/* Approach button */}
      <button
        onClick={onApproach}
        style={{
          padding: '20px 52px',
          borderRadius: '16px',
          border: '3px solid #ff1493',
          background: 'linear-gradient(145deg, rgba(255, 20, 147, 0.2) 0%, rgba(153, 50, 204, 0.2) 100%)',
          color: COLORS.neonPink,
          fontSize: '18px',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          fontFamily: "'Space Grotesk', sans-serif",
          boxShadow: '0 0 40px rgba(255, 20, 147, 0.3)',
          animation: 'buttonPulse 2s ease-in-out infinite',
        }}
      >
        Approach Entrance
      </button>

      {/* Bottom notice */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#dc2626',
        fontSize: '14px',
        fontWeight: 600,
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          border: '3px solid #dc2626',
          fontSize: '12px',
          fontWeight: 800,
          background: 'rgba(220, 38, 38, 0.1)',
        }}>
          21+
        </span>
        <span>ADULTS ONLY • Must be 21+ to enter</span>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function Bouncer({ appConfig }: { appConfig?: any }) {
  const { mode, sessionId, spaceId, onAppOpen } = useSpaceRuntime();

  // 8D Mouse tracking
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Use WorkspaceDB
  const { data: verificationData, loading: dbLoading, refresh: refreshVerification } =
    (window as any).useWorkspaceDB(VERIFICATION_TABLE, {
      orderBy: { column: 'created_at', direction: 'desc' },
      limit: 1,
    });

  const [state, setState] = useState<VerificationState>({
    step: 'entrance',
    birthMonth: '',
    birthDay: '',
    birthYear: '',
    termsAccepted: false,
    rulesAccepted: false,
    isVerified: false,
    error: null,
  });

  const [isCheckingVerification, setIsCheckingVerification] = useState(true);

  // Check existing verification
  useEffect(() => {
    if (dbLoading) return;
    setIsCheckingVerification(false);

    try {
      if (verificationData && verificationData.length > 0) {
        const record = verificationData[0];
        if (record.verified && record.verified_at) {
          const verifiedTime = new Date(record.verified_at).getTime();
          const now = Date.now();
          if (now - verifiedTime < VERIFICATION_VALIDITY_MS) {
            setState(prev => ({ ...prev, step: 'access_granted', isVerified: true }));
          }
        }
      }
    } catch (e) {
      console.error('[Bouncer] Error checking verification:', e);
    }
  }, [verificationData, dbLoading]);

  const handleChange = useCallback((field: string, value: string | boolean) => {
    setState(prev => ({ ...prev, [field]: value, error: null }));
  }, []);

  const handleVerify = useCallback(() => {
    const { birthMonth, birthDay, birthYear } = state;

    if (!isValidDate(birthMonth, birthDay, birthYear)) {
      setState(prev => ({ ...prev, error: 'Please enter a valid date of birth' }));
      return;
    }

    setState(prev => ({ ...prev, step: 'verifying' }));

    setTimeout(() => {
      const birthDate = new Date(
        parseInt(birthYear, 10),
        parseInt(birthMonth, 10) - 1,
        parseInt(birthDay, 10)
      );
      const age = calculateAge(birthDate);

      if (age >= 21) {
        setState(prev => ({ ...prev, step: 'terms' }));
      } else {
        setState(prev => ({ ...prev, step: 'access_denied' }));
      }
    }, 2000);
  }, [state.birthMonth, state.birthDay, state.birthYear]);

  const handleAccept = useCallback(async () => {
    setState(prev => ({ ...prev, step: 'access_granted', isVerified: true }));

    try {
      const db = (window as any).__workspaceDb;
      await db.from(VERIFICATION_TABLE).insert({
        verified: true,
        verified_at: new Date().toISOString(),
      });
      refreshVerification();
    } catch (e) {
      console.error('[Bouncer] Error storing verification:', e);
    }
  }, [refreshVerification]);

  const handleAccessGranted = useCallback(() => {
    if (onAppOpen) {
      onAppOpen('game-pulse');
    }
  }, [onAppOpen]);

  const handleRetry = useCallback(() => {
    setState({
      step: 'entrance',
      birthMonth: '',
      birthDay: '',
      birthYear: '',
      termsAccepted: false,
      rulesAccepted: false,
      isVerified: false,
      error: null,
    });
  }, []);

  // Loading
  if (dbLoading || isCheckingVerification) {
    return (
      <div style={{
        minHeight: '100%',
        background: 'linear-gradient(180deg, #050508 0%, #0a0a12 50%, #0d0510 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Space Grotesk', sans-serif",
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(255, 20, 147, 0.3)',
            borderTopColor: COLORS.neonPink,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ color: COLORS.textSecondary, fontSize: '14px' }}>Checking access...</p>
        </div>
      </div>
    );
  }

  // Access granted animation
  if (state.step === 'access_granted' && !state.isVerified) {
    return <AccessGrantedAnimation onComplete={handleAccessGranted} />;
  }

  // Already verified
  if (state.isVerified) {
    return (
      <div style={{
        minHeight: '100%',
        position: 'relative',
        fontFamily: "'Space Grotesk', sans-serif",
      }}>
        <Immersive8DNightclub mousePos={mousePos} step="verified">
          <div style={{
            background: 'linear-gradient(145deg, rgba(20,15,25,0.95) 0%, rgba(10,10,15,0.98) 100%)',
            borderRadius: '20px',
            border: '2px solid rgba(34, 197, 94, 0.3)',
            padding: '36px',
            maxWidth: '420px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 40px rgba(34, 197, 94, 0.1)',
          }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)',
              border: '3px solid rgba(34, 197, 94, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              margin: '0 auto 24px',
              boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)',
            }}>
              ✓
            </div>

            <h2 style={{
              color: COLORS.success,
              fontSize: '26px',
              fontWeight: 700,
              marginBottom: '12px',
              textShadow: '0 0 20px rgba(34, 197, 94, 0.5)',
            }}>
              Access Verified
            </h2>

            <p style={{
              color: COLORS.textSecondary,
              fontSize: '14px',
              marginBottom: '24px',
            }}>
              You have already been verified. Enjoy the casino!
            </p>

            <button
              onClick={handleAccessGranted}
              style={{
                padding: '16px 36px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(145deg, #22c55e 0%, #16a34a 100%)',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                boxShadow: '0 4px 30px rgba(34, 197, 94, 0.4)',
              }}
            >
              Enter Casino
            </button>
          </div>
        </Immersive8DNightclub>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100%',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Space Grotesk', sans-serif",
    }}>
      <Immersive8DNightclub mousePos={mousePos} step={state.step}>
        {state.step === 'entrance' && (
          <EntranceScreen onApproach={() => setState(prev => ({ ...prev, step: 'id_check' }))} />
        )}

        {state.step === 'id_check' && (
          <IDCardInput state={state} onChange={handleChange} onVerify={handleVerify} />
        )}

        {state.step === 'verifying' && <VerifyingAnimation />}

        {state.step === 'terms' && (
          <TermsAcceptance state={state} onChange={handleChange} onAccept={handleAccept} />
        )}

        {state.step === 'access_denied' && <AccessDenied onRetry={handleRetry} />}
      </Immersive8DNightclub>

      {/* Footer compliance */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 20px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.95) 100%)',
        textAlign: 'center',
        zIndex: 60,
      }}>
        <p style={{
          color: COLORS.textSecondary,
          fontSize: '11px',
          margin: 0,
          lineHeight: 1.5,
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          <strong style={{ color: COLORS.gold }}>🎰 SWEEPSTAKES PROMOTIONAL PLATFORM</strong>
          <br />
          No purchase necessary to play. Gold Coins are for entertainment only and have no cash value.
          <br />
          <span style={{ color: '#dc2626', fontWeight: 600 }}>Must be 21 years or older.</span>
          {' '}Void where prohibited.
        </p>
      </div>
    </div>
  );
}
