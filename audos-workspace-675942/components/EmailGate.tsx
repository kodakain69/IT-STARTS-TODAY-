import { useState, useEffect } from 'react';
import { useSpaceRuntime } from '../SpaceRuntimeContext';
import type { DesktopThemeTokens } from '../types';

// Version marker for auto-upgrade detection
export const EMAIL_GATE_VERSION = 37; // v37: Refined casino theming with exact copy per spec - "Welcome to DAM Fortunes Casino" headline, updated CTAs and value props

interface EmailGateProps {
  spaceId: string;
  branding?: {
    name?: string;
    tagline?: string;
    logoUrl?: string;
    heroVideoUrl?: string;
  };
  themeTokens?: DesktopThemeTokens;
  gdprEnabled?: boolean;
  privacyPolicyUrl?: string;
}

type GateStep = 'loading' | 'email' | 'complete';

// Casino theme colors - deep dark 8D aesthetic with gold and neon accents
const COLORS = {
  bgDark: '#0a0a0a',
  bgDeep: '#050505',
  bgCard: '#111111',
  bgSection: '#080808',
  gold: '#FFD700',
  goldLight: '#FFEC8B',
  goldDark: '#B8860B',
  goldMuted: '#D4AF37',
  neonPink: '#FF1493',
  neonCyan: '#00FFFF',
  neonPurple: '#9400D3',
  text: '#ffffff',
  textMuted: '#b0b0b0',
  textDim: '#666666',
  border: '#2a2a2a',
  borderGold: '#4a3f20',
  success: '#22c55e',
  error: '#ef4444',
};

// Generate a simple session ID
function generateSessionId(): string {
  return `wses_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Get visitor ID from cookie or create one
function getVisitorId(): string {
  if (typeof document === 'undefined') return '';

  const VISITOR_COOKIE = 'audos_vid';
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(VISITOR_COOKIE + '=')) {
      return cookie.substring(VISITOR_COOKIE.length + 1);
    }
  }

  // Create new visitor ID
  const visitorId = 'vid_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${VISITOR_COOKIE}=${visitorId}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  return visitorId;
}

export function EmailGate({ spaceId, branding, themeTokens, gdprEnabled, privacyPolicyUrl }: EmailGateProps) {
  const { setSessionId, visitorId: contextVisitorId } = useSpaceRuntime();

  // Core state
  const [step, setStep] = useState<GateStep>('loading');
  const [email, setEmail] = useState('');
  const [isOver21, setIsOver21] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      try {
        const sessionKey = `space_session_${spaceId}`;
        const stored = localStorage.getItem(sessionKey);
        if (stored) {
          const session = JSON.parse(stored);
          const sessionId = session.workspaceSessionId || session.sessionId || session.id;
          if (sessionId) {
            setSessionId(sessionId);
            setStep('complete');
            return;
          }
        }
      } catch (err) {
        console.error('[EmailGate] Session check failed:', err);
      }
      setStep('email');
    };
    checkSession();
  }, [spaceId, setSessionId]);

  // Handle email submission - direct registration (no OTP)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isOver21) {
      setError('You must confirm you are 21 years of age or older to enter');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Direct registration - no OTP needed
      const visitorId = contextVisitorId || getVisitorId();
      const newSessionId = generateSessionId();

      const registerResponse = await fetch(`/api/space/${spaceId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          sessionId: newSessionId,
          visitorId,
          metadata: {
            source: 'email_gate',
            ageVerified: true,
            marketingConsent,
          },
        }),
      });

      if (!registerResponse.ok) {
        const data = await registerResponse.json().catch(() => ({}));
        throw new Error(data.error || data.message || 'Failed to create session');
      }

      const registerData = await registerResponse.json();
      const effectiveSessionId = registerData.workspaceSessionId || registerData.sessionId || newSessionId;

      // Save session to localStorage
      const sessionKey = `space_session_${spaceId}`;
      const session = {
        id: effectiveSessionId,
        workspaceSessionId: effectiveSessionId,
        email: email.trim().toLowerCase(),
        contactId: registerData.contactId || null,
        timestamp: Date.now(),
        isReturningUser: !!registerData.isReturningUser,
        metadata: { source: 'email_gate', ageVerified: true, marketingConsent },
      };
      localStorage.setItem(sessionKey, JSON.stringify(session));

      // Update context
      setSessionId(effectiveSessionId);

      // Dispatch event for other components
      try {
        window.dispatchEvent(new CustomEvent('audos:session-established', {
          detail: { workspaceSessionId: effectiveSessionId, email: email.trim().toLowerCase() },
        }));
      } catch (eventErr) {
        console.warn('[EmailGate] Failed to dispatch session event:', eventErr);
      }

      setStep('complete');
    } catch (err: unknown) {
      console.error('[EmailGate] Registration failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete signup';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (step === 'loading') {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: COLORS.bgDark,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <div style={{
          width: 48,
          height: 48,
          border: `3px solid ${COLORS.border}`,
          borderTopColor: COLORS.gold,
          borderRadius: '50%',
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

  // Complete state - user is authenticated
  if (step === 'complete') {
    return null;
  }

  const brandName = branding?.name || 'DAM Fortunes Casino';
  const tagline = branding?.tagline || 'Easy play. Daily fortunes.';

  // Full-page 8D immersive casino landing experience
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: COLORS.bgDark,
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 10px ${COLORS.gold}) drop-shadow(0 0 20px ${COLORS.gold});
            opacity: 1;
          }
          50% {
            filter: drop-shadow(0 0 20px ${COLORS.gold}) drop-shadow(0 0 40px ${COLORS.goldDark});
            opacity: 0.8;
          }
        }
        @keyframes neonFlicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
          20%, 24%, 55% { opacity: 0.6; }
        }
        @keyframes coinSpin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .email-input {
          transition: all 0.3s ease;
        }
        .email-input:focus {
          border-color: ${COLORS.gold} !important;
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.25), 0 0 30px rgba(255, 215, 0, 0.15) !important;
        }
        .cta-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cta-button:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 15px 40px rgba(255, 215, 0, 0.5), 0 0 60px rgba(255, 215, 0, 0.3) !important;
        }
        .cta-button:active:not(:disabled) {
          transform: translateY(-1px) scale(1.01);
        }
        .feature-card {
          transition: all 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          border-color: ${COLORS.gold} !important;
          box-shadow: 0 10px 40px rgba(255, 215, 0, 0.15);
        }
        .age-checkbox:hover {
          border-color: ${COLORS.gold} !important;
        }
      `}</style>

      {/* ========== HERO SECTION ========== */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        position: 'relative',
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(255, 215, 0, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 60%, rgba(148, 0, 211, 0.08) 0%, transparent 40%),
          radial-gradient(ellipse at 20% 80%, rgba(255, 20, 147, 0.06) 0%, transparent 35%),
          linear-gradient(180deg, ${COLORS.bgDark} 0%, #050008 50%, ${COLORS.bgDark} 100%)
        `,
        overflow: 'hidden',
      }}>
        {/* Animated background elements - casino atmosphere */}
        <div style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}>
          {/* Slot machine icon */}
          <div style={{
            position: 'absolute',
            top: '8%',
            left: '5%',
            fontSize: 70,
            opacity: 0.12,
            animation: 'float 5s ease-in-out infinite, glow 3s ease-in-out infinite',
          }}>🎰</div>

          {/* Gold coins */}
          <div style={{
            position: 'absolute',
            bottom: '12%',
            right: '6%',
            fontSize: 60,
            opacity: 0.15,
            animation: 'float 6s ease-in-out infinite, coinSpin 4s linear infinite',
            animationDelay: '1s',
          }}>🪙</div>

          {/* Dice */}
          <div style={{
            position: 'absolute',
            top: '35%',
            right: '10%',
            fontSize: 50,
            opacity: 0.1,
            animation: 'float 7s ease-in-out infinite',
            animationDelay: '2s',
          }}>🎲</div>

          {/* Diamond */}
          <div style={{
            position: 'absolute',
            bottom: '30%',
            left: '8%',
            fontSize: 45,
            opacity: 0.1,
            animation: 'float 5.5s ease-in-out infinite, neonFlicker 4s ease-in-out infinite',
            animationDelay: '0.5s',
          }}>💎</div>

          {/* Playing cards */}
          <div style={{
            position: 'absolute',
            top: '60%',
            right: '20%',
            fontSize: 40,
            opacity: 0.08,
            animation: 'float 8s ease-in-out infinite',
            animationDelay: '3s',
          }}>🃏</div>

          {/* Neon glow lines */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            maxWidth: 600,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)`,
            opacity: 0.3,
            animation: 'pulse 2s ease-in-out infinite',
          }} />
        </div>

        {/* Logo area with neon effect */}
        <div style={{
          marginBottom: 20,
          textAlign: 'center',
          animation: 'slideIn 0.6s ease-out',
        }}>
          {branding?.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={brandName}
              style={{
                height: 90,
                width: 'auto',
                objectFit: 'contain',
                filter: `drop-shadow(0 0 20px rgba(255, 215, 0, 0.4))`,
              }}
            />
          ) : (
            <div style={{
              fontSize: 80,
              lineHeight: 1,
              animation: 'glow 2s ease-in-out infinite',
            }}>🎰</div>
          )}
        </div>

        {/* Brand name with neon text effect */}
        <h1 style={{
          fontSize: 'clamp(2.2rem, 7vw, 4rem)',
          fontWeight: 700,
          color: COLORS.text,
          margin: 0,
          textAlign: 'center',
          letterSpacing: '-0.02em',
          textShadow: `0 0 40px rgba(255, 215, 0, 0.3), 0 0 80px rgba(255, 215, 0, 0.1)`,
          animation: 'slideIn 0.6s ease-out 0.1s both',
        }}>
          {brandName}
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: 'clamp(1rem, 3vw, 1.3rem)',
          color: COLORS.gold,
          margin: '8px 0 40px',
          fontWeight: 500,
          textAlign: 'center',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          animation: 'slideIn 0.6s ease-out 0.2s both',
        }}>
          {tagline}
        </p>

        {/* Main headline */}
        <div style={{
          maxWidth: 640,
          textAlign: 'center',
          marginBottom: 16,
          animation: 'slideIn 0.6s ease-out 0.3s both',
        }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
            fontWeight: 700,
            color: COLORS.text,
            margin: 0,
            marginBottom: 16,
            lineHeight: 1.2,
            textShadow: '0 2px 20px rgba(0, 0, 0, 0.5)',
          }}>
            Welcome to DAM Fortunes Casino
          </h2>
          <p style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)',
            color: COLORS.gold,
            margin: 0,
            lineHeight: 1.6,
            fontWeight: 600,
          }}>
            Play FREE. Win Real Prizes.
          </p>
        </div>

        {/* Value props strip */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          marginBottom: 32,
          animation: 'slideIn 0.6s ease-out 0.4s both',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 20px',
            backgroundColor: 'rgba(255, 215, 0, 0.08)',
            borderRadius: 30,
            border: `1px solid rgba(255, 215, 0, 0.2)`,
          }}>
            <span style={{ fontSize: 18 }}>🎁</span>
            <span style={{
              fontSize: 14,
              color: COLORS.goldLight,
              fontWeight: 500,
            }}>
              Free Gold Coins on Sign Up
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 20px',
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
            borderRadius: 30,
            border: `1px solid rgba(34, 197, 94, 0.2)`,
          }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <span style={{
              fontSize: 14,
              color: '#22c55e',
              fontWeight: 500,
            }}>
              No Purchase Necessary to Play or Win
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 20px',
            backgroundColor: 'rgba(148, 0, 211, 0.08)',
            borderRadius: 30,
            border: `1px solid rgba(148, 0, 211, 0.2)`,
          }}>
            <span style={{ fontSize: 18 }}>🔞</span>
            <span style={{
              fontSize: 14,
              color: '#c084fc',
              fontWeight: 500,
            }}>
              21+ Only – Must verify age to enter
            </span>
          </div>
        </div>

        {/* Email signup card */}
        <div style={{
          width: '100%',
          maxWidth: 460,
          backgroundColor: 'rgba(17, 17, 17, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 20,
          padding: '36px 32px',
          border: `1px solid ${COLORS.borderGold}`,
          boxShadow: `
            0 25px 80px rgba(0, 0, 0, 0.6),
            0 0 100px rgba(255, 215, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.05)
          `,
          position: 'relative',
          animation: 'slideIn 0.6s ease-out 0.5s both',
        }}>
          {/* Gold accent line at top */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '15%',
            right: '15%',
            height: 3,
            background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)`,
            borderRadius: '0 0 4px 4px',
            boxShadow: `0 0 20px ${COLORS.gold}`,
          }} />

          {/* Welcome bonus badge */}
          <div style={{
            textAlign: 'center',
            marginBottom: 24,
            padding: '14px 20px',
            background: `linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)`,
            borderRadius: 12,
            border: `1px solid rgba(255, 215, 0, 0.3)`,
          }}>
            <div style={{
              fontSize: 13,
              color: COLORS.goldMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 6,
            }}>
              Welcome Bonus
            </div>
            <div style={{
              fontSize: 22,
              fontWeight: 700,
              color: COLORS.gold,
              textShadow: `0 0 20px rgba(255, 215, 0, 0.4)`,
            }}>
              10,000 Gold Coins + 1 FREE Sweeps Coin
            </div>
          </div>

          <form onSubmit={handleEmailSubmit}>
            {/* Age verification - Required 21+ */}
            <label
              className="age-checkbox"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 20,
                cursor: 'pointer',
                padding: 16,
                backgroundColor: isOver21 ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                borderRadius: 12,
                border: `2px solid ${isOver21 ? COLORS.success : COLORS.border}`,
                transition: 'all 0.3s ease',
              }}
            >
              <input
                type="checkbox"
                checked={isOver21}
                onChange={(e) => setIsOver21(e.target.checked)}
                style={{
                  width: 24,
                  height: 24,
                  accentColor: COLORS.gold,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              />
              <span style={{
                fontSize: 15,
                color: COLORS.text,
                fontWeight: 500,
                lineHeight: 1.4,
              }}>
                I confirm I am 21 years of age or older
              </span>
            </label>

            {/* Email input */}
            <div style={{ marginBottom: 16 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to start playing"
                disabled={isSubmitting}
                className="email-input"
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  fontSize: 16,
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: `2px solid ${COLORS.border}`,
                  borderRadius: 12,
                  color: COLORS.text,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* GDPR consent block - legally required */}
            {gdprEnabled && (
              <div style={{ marginBottom: 16 }}>
                <p style={{
                  fontSize: 12,
                  color: COLORS.textDim,
                  margin: '0 0 10px 0',
                  lineHeight: 1.5,
                }}>
                  By signing up, you agree to our{' '}
                  <a
                    href={privacyPolicyUrl || '/privacy'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: COLORS.gold, textDecoration: 'underline' }}
                  >
                    Privacy Policy
                  </a>
                </p>
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  cursor: 'pointer',
                  padding: 12,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 8,
                  border: `1px solid ${COLORS.border}`,
                }}>
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    style={{
                      width: 18,
                      height: 18,
                      accentColor: COLORS.gold,
                      cursor: 'pointer',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  />
                  <span style={{
                    fontSize: 13,
                    color: COLORS.textMuted,
                    lineHeight: 1.4,
                  }}>
                    I agree to receive promotional emails and offers
                  </span>
                </label>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div style={{
                padding: 14,
                marginBottom: 16,
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${COLORS.error}`,
                borderRadius: 10,
                color: COLORS.error,
                fontSize: 14,
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            {/* Submit button with gold gradient */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="cta-button"
              style={{
                width: '100%',
                padding: '18px 28px',
                fontSize: 18,
                fontWeight: 700,
                color: '#000000',
                background: `linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 50%, ${COLORS.goldDark} 100%)`,
                border: 'none',
                borderRadius: 12,
                cursor: isSubmitting ? 'wait' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: `0 8px 30px rgba(255, 215, 0, 0.35), 0 0 40px rgba(255, 215, 0, 0.15)`,
                letterSpacing: '0.02em',
              }}
            >
              {isSubmitting ? 'Creating Your Account...' : 'CLAIM YOUR FREE COINS'}
            </button>

            {/* Trust indicators */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              marginTop: 18,
              flexWrap: 'wrap',
            }}>
              <span style={{
                fontSize: 12,
                color: COLORS.textMuted,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}>
                🔒 No credit card required
              </span>
              <span style={{
                fontSize: 12,
                color: COLORS.textMuted,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}>
                ⚡ Instant access
              </span>
            </div>
          </form>
        </div>

        {/* Compliance text below card */}
        <p style={{
          fontSize: 12,
          color: COLORS.textDim,
          textAlign: 'center',
          marginTop: 24,
          maxWidth: 400,
          lineHeight: 1.6,
          animation: 'slideIn 0.6s ease-out 0.6s both',
        }}>
          By entering, you confirm you are 21 years or older and agree to our Official Rules
        </p>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          opacity: 0.5,
        }}>
          <span style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: '0.1em' }}>SCROLL</span>
          <div style={{
            width: 24,
            height: 38,
            border: `2px solid ${COLORS.textMuted}`,
            borderRadius: 12,
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 8,
          }}>
            <div style={{
              width: 4,
              height: 10,
              backgroundColor: COLORS.gold,
              borderRadius: 2,
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          </div>
        </div>
      </section>

      {/* ========== VALUE PROPS SECTION ========== */}
      <section style={{
        padding: '100px 20px',
        backgroundColor: COLORS.bgSection,
        borderTop: `1px solid ${COLORS.border}`,
        position: 'relative',
      }}>
        {/* Subtle glow accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: 1,
          background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)`,
          opacity: 0.3,
        }} />

        <div style={{
          maxWidth: 1000,
          margin: '0 auto',
        }}>
          <h3 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            fontWeight: 700,
            color: COLORS.text,
            textAlign: 'center',
            margin: 0,
            marginBottom: 16,
          }}>
            Why Players Choose DAM Fortunes
          </h3>
          <p style={{
            fontSize: 16,
            color: COLORS.textMuted,
            textAlign: 'center',
            margin: 0,
            marginBottom: 50,
            maxWidth: 500,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            A sweepstakes casino experience like no other
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 28,
          }}>
            {/* Value prop 1 */}
            <div
              className="feature-card"
              style={{
                backgroundColor: 'rgba(17, 17, 17, 0.7)',
                borderRadius: 16,
                padding: 32,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div style={{
                fontSize: 48,
                marginBottom: 20,
                filter: `drop-shadow(0 0 15px rgba(255, 215, 0, 0.3))`,
              }}>🎁</div>
              <h4 style={{
                fontSize: 20,
                fontWeight: 600,
                color: COLORS.text,
                margin: 0,
                marginBottom: 12,
              }}>
                Daily Free Coins
              </h4>
              <p style={{
                fontSize: 15,
                color: COLORS.textMuted,
                margin: 0,
                lineHeight: 1.7,
              }}>
                Log in every day and claim your free Gold Coins. Build your bankroll with daily login streaks and bonuses.
              </p>
            </div>

            {/* Value prop 2 */}
            <div
              className="feature-card"
              style={{
                backgroundColor: 'rgba(17, 17, 17, 0.7)',
                borderRadius: 16,
                padding: 32,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div style={{
                fontSize: 48,
                marginBottom: 20,
                filter: `drop-shadow(0 0 15px rgba(255, 20, 147, 0.3))`,
              }}>💎</div>
              <h4 style={{
                fontSize: 20,
                fontWeight: 600,
                color: COLORS.text,
                margin: 0,
                marginBottom: 12,
              }}>
                Real Prizes with Sweeps Coins
              </h4>
              <p style={{
                fontSize: 15,
                color: COLORS.textMuted,
                margin: 0,
                lineHeight: 1.7,
              }}>
                Earn Sweeps Coins through gameplay and redeem them for cash prizes, gift cards, and more via PayPal.
              </p>
            </div>

            {/* Value prop 3 */}
            <div
              className="feature-card"
              style={{
                backgroundColor: 'rgba(17, 17, 17, 0.7)',
                borderRadius: 16,
                padding: 32,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div style={{
                fontSize: 48,
                marginBottom: 20,
                filter: `drop-shadow(0 0 15px rgba(0, 255, 255, 0.3))`,
              }}>🎵</div>
              <h4 style={{
                fontSize: 20,
                fontWeight: 600,
                color: COLORS.text,
                margin: 0,
                marginBottom: 12,
              }}>
                Social Casino Vibes
              </h4>
              <p style={{
                fontSize: 15,
                color: COLORS.textMuted,
                margin: 0,
                lineHeight: 1.7,
              }}>
                Live chat, jukebox, avatars, and arcade games. Experience a real casino hangout with friends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS SECTION ========== */}
      <section style={{
        padding: '100px 20px',
        backgroundColor: COLORS.bgDark,
        borderTop: `1px solid ${COLORS.border}`,
      }}>
        <div style={{
          maxWidth: 800,
          margin: '0 auto',
        }}>
          <h3 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            fontWeight: 700,
            color: COLORS.text,
            textAlign: 'center',
            margin: 0,
            marginBottom: 50,
          }}>
            Start Playing in 3 Simple Steps
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 36,
          }}>
            {/* Step 1 */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 24,
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.goldDark} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 700,
                color: '#000',
                flexShrink: 0,
                boxShadow: `0 0 30px rgba(255, 215, 0, 0.3)`,
              }}>1</div>
              <div style={{ paddingTop: 4 }}>
                <h4 style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: COLORS.text,
                  margin: 0,
                  marginBottom: 8,
                }}>
                  Enter Your Email
                </h4>
                <p style={{
                  fontSize: 16,
                  color: COLORS.textMuted,
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  Confirm you are 21+ and create your free account in seconds. No credit card needed.
                </p>
              </div>
            </div>

            {/* Connector line */}
            <div style={{
              width: 2,
              height: 30,
              backgroundColor: COLORS.border,
              marginLeft: 27,
              background: `linear-gradient(180deg, ${COLORS.gold}, ${COLORS.border})`,
            }} />

            {/* Step 2 */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 24,
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.goldDark} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 700,
                color: '#000',
                flexShrink: 0,
                boxShadow: `0 0 30px rgba(255, 215, 0, 0.3)`,
              }}>2</div>
              <div style={{ paddingTop: 4 }}>
                <h4 style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: COLORS.text,
                  margin: 0,
                  marginBottom: 8,
                }}>
                  Claim Your Welcome Bonus
                </h4>
                <p style={{
                  fontSize: 16,
                  color: COLORS.textMuted,
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  Get 10,000 Gold Coins + 1 Sweeps Coin instantly — completely free, no purchase required.
                </p>
              </div>
            </div>

            {/* Connector line */}
            <div style={{
              width: 2,
              height: 30,
              backgroundColor: COLORS.border,
              marginLeft: 27,
              background: `linear-gradient(180deg, ${COLORS.gold}, ${COLORS.border})`,
            }} />

            {/* Step 3 */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 24,
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.goldDark} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 700,
                color: '#000',
                flexShrink: 0,
                boxShadow: `0 0 30px rgba(255, 215, 0, 0.3)`,
              }}>3</div>
              <div style={{ paddingTop: 4 }}>
                <h4 style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: COLORS.text,
                  margin: 0,
                  marginBottom: 8,
                }}>
                  Play & Win Real Prizes
                </h4>
                <p style={{
                  fontSize: 16,
                  color: COLORS.textMuted,
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  Explore slots, table games, and our social arcade. Redeem Sweeps Coins for cash via PayPal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== DUAL CURRENCY EXPLAINER ========== */}
      <section style={{
        padding: '100px 20px',
        backgroundColor: COLORS.bgSection,
        borderTop: `1px solid ${COLORS.border}`,
      }}>
        <div style={{
          maxWidth: 900,
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <h3 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            fontWeight: 700,
            color: COLORS.text,
            margin: 0,
            marginBottom: 16,
          }}>
            Two Currencies, Endless Possibilities
          </h3>
          <p style={{
            fontSize: 16,
            color: COLORS.textMuted,
            margin: 0,
            marginBottom: 50,
            maxWidth: 550,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6,
          }}>
            Our sweepstakes model is legal in most US states. Here is how it works:
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 28,
          }}>
            {/* Gold Coins */}
            <div style={{
              backgroundColor: 'rgba(17, 17, 17, 0.9)',
              borderRadius: 20,
              padding: 36,
              border: `2px solid ${COLORS.gold}`,
              textAlign: 'center',
              boxShadow: `0 0 40px rgba(255, 215, 0, 0.1)`,
            }}>
              <div style={{
                fontSize: 56,
                marginBottom: 20,
                animation: 'coinSpin 6s linear infinite',
              }}>🪙</div>
              <h4 style={{
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.gold,
                margin: 0,
                marginBottom: 14,
              }}>
                Gold Coins
              </h4>
              <p style={{
                fontSize: 15,
                color: COLORS.textMuted,
                margin: 0,
                lineHeight: 1.7,
              }}>
                Free-play entertainment currency with no cash value. Use for casual gameplay and fun. Claim daily for free!
              </p>
            </div>

            {/* Sweeps Coins */}
            <div style={{
              backgroundColor: 'rgba(17, 17, 17, 0.9)',
              borderRadius: 20,
              padding: 36,
              border: `2px solid ${COLORS.neonPink}`,
              textAlign: 'center',
              boxShadow: `0 0 40px rgba(255, 20, 147, 0.1)`,
            }}>
              <div style={{
                fontSize: 56,
                marginBottom: 20,
                animation: 'glow 2s ease-in-out infinite',
              }}>💎</div>
              <h4 style={{
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.neonPink,
                margin: 0,
                marginBottom: 14,
              }}>
                Sweeps Coins
              </h4>
              <p style={{
                fontSize: 15,
                color: COLORS.textMuted,
                margin: 0,
                lineHeight: 1.7,
              }}>
                Awarded as bonuses with Gold Coin packages. Redeemable for real cash prizes via PayPal under official sweepstakes rules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA SECTION ========== */}
      <section style={{
        padding: '100px 20px',
        backgroundColor: COLORS.bgDark,
        borderTop: `1px solid ${COLORS.border}`,
        position: 'relative',
        background: `
          radial-gradient(ellipse at center, rgba(255, 215, 0, 0.1) 0%, transparent 60%),
          radial-gradient(ellipse at 30% 70%, rgba(148, 0, 211, 0.05) 0%, transparent 40%),
          ${COLORS.bgDark}
        `,
      }}>
        <div style={{
          maxWidth: 520,
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 60, marginBottom: 20 }}>🎰</div>

          <h3 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            fontWeight: 700,
            color: COLORS.text,
            margin: 0,
            marginBottom: 16,
          }}>
            Ready to Play?
          </h3>
          <p style={{
            fontSize: 17,
            color: COLORS.textMuted,
            margin: 0,
            marginBottom: 36,
            lineHeight: 1.6,
          }}>
            Your 10,000 Gold Coins are waiting. No purchase necessary — just enter your email and start winning.
          </p>

          {/* Second email form for bottom of page */}
          <form onSubmit={handleEmailSubmit}>
            <label
              className="age-checkbox"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
                marginBottom: 20,
                cursor: 'pointer',
                padding: 16,
                backgroundColor: isOver21 ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                borderRadius: 12,
                border: `2px solid ${isOver21 ? COLORS.success : COLORS.border}`,
                transition: 'all 0.3s ease',
              }}
            >
              <input
                type="checkbox"
                checked={isOver21}
                onChange={(e) => setIsOver21(e.target.checked)}
                style={{
                  width: 24,
                  height: 24,
                  accentColor: COLORS.gold,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              />
              <span style={{
                fontSize: 15,
                color: COLORS.text,
                fontWeight: 500,
              }}>
                I confirm I am 21 years of age or older
              </span>
            </label>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to start playing"
                disabled={isSubmitting}
                className="email-input"
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  fontSize: 16,
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: `2px solid ${COLORS.border}`,
                  borderRadius: 12,
                  color: COLORS.text,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="cta-button"
                style={{
                  width: '100%',
                  padding: '18px 28px',
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#000000',
                  background: `linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 50%, ${COLORS.goldDark} 100%)`,
                  border: 'none',
                  borderRadius: 12,
                  cursor: isSubmitting ? 'wait' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  boxShadow: `0 8px 30px rgba(255, 215, 0, 0.35)`,
                }}
              >
                {isSubmitting ? 'Creating Your Account...' : 'CLAIM YOUR FREE COINS'}
              </button>
            </div>
          </form>

          <p style={{
            fontSize: 12,
            color: COLORS.textDim,
            marginTop: 20,
          }}>
            No Purchase Necessary to Play or Win • 21+ Only
          </p>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer style={{
        padding: '50px 20px',
        backgroundColor: COLORS.bgDeep,
        borderTop: `1px solid ${COLORS.border}`,
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 11,
          color: COLORS.textDim,
          margin: 0,
          marginBottom: 14,
          lineHeight: 2,
          maxWidth: 600,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          21+ | No Purchase Necessary to play Gold Coins | Sweepstakes Rules Apply | Void where prohibited
          <br />
          Gold Coins have no cash value. Sweeps Coins redeemable for prizes per official rules.
        </p>
        <p style={{
          fontSize: 13,
          color: COLORS.textDim,
          margin: 0,
        }}>
          {brandName} © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

export default EmailGate;
