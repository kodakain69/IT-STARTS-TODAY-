import React, { useState, useEffect } from 'react';


import { AlertCircle, Contact } from 'lucide-react';
import { createRoot } from 'react-dom/client';
const Fallback = (props: any) => <section data-stub-component="Fallback">{props.children}</section>;
// Fallback wrapper to prevent crashes from missing icons
const IconFallback = ({ icon: Icon, fallback: Fallback = AlertCircle, ...props }) => {
  if (!Icon) {
    console.warn('Icon component is undefined, using fallback');
    return <Fallback {...props} />;
  }
  try {
    return <Icon {...props} />;
  } catch (e) {
    console.error('Icon render failed:', e);
    return <Fallback {...props} />;
  }
};

// Create safe icon components for potentially non-existent icons
const createSafeIcon = (IconComponent, iconName) => {
  if (typeof IconComponent === 'undefined') {
    console.warn(`Icon "${iconName}" not found, using AlertCircle as fallback`);
    return AlertCircle;
  }
  return IconComponent;
};

// ============================================================================
// DAM Fortunes Casino - Professional Sweepstakes Gaming Platform
// Legal sweepstakes model with dual currency system (Gold Coins + Sweeps Coins)
// Fully compliant with sweepstakes regulations
// ============================================================================

// Brand Constants
const BRAND_NAME = "DAM Fortunes Casino";
const TAGLINE = "Play FREE. Win Real Prizes.";
const PRIMARY_COLOR = "#000000";
const ACCENT_GOLD = "#D4AF37";
const ACCENT_EMERALD = "#10B981";
const ACCENT_RED = "#DC2626";
const FONT_FAMILY = "'Space Grotesk', sans-serif";
const HERO_VIDEO_URL = "https://storage.googleapis.com/audos-images/workspace-media/620c79a8-fb1b-461a-a4a2-ccfeca56918f/1777432313080_55a895lf.mp4";
const APP_URL = "https://app.damfortunes.com";
const SUPPORT_EMAIL = "support@damfortunes.com";
const SPONSOR_ADDRESS = "DAM Fortunes Casino, [Contact for address]";

// Page Types for Routing
type PageType = "home" | "rules" | "terms" | "privacy";

// Types
interface GameArea {
  icon: string;
  title: string;
  description: string;
  highlight: string;
}

interface Step {
  number: number;
  title: string;
  description: string;
  icon: string;
}

// Styles Object
const styles: Record<string, React.CSSProperties> = {
  // Base Container
  container: {
    fontFamily: FONT_FAMILY,
    color: "#ffffff",
    backgroundColor: "#0a0a0a",
    minHeight: "100vh",
    margin: 0,
    padding: 0,
    overflowX: "hidden",
  },

  // Hero Section
  heroSection: {
    position: "relative",
    width: "100%",
    height: "100vh",
    minHeight: "700px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  heroVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 0,
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.95) 100%)",
    zIndex: 1,
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    color: "#ffffff",
    padding: "20px",
    maxWidth: "1000px",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(212, 175, 55, 0.15)",
    border: "1px solid rgba(212, 175, 55, 0.4)",
    color: ACCENT_GOLD,
    padding: "10px 24px",
    borderRadius: "50px",
    fontSize: "0.9rem",
    fontWeight: 600,
    marginBottom: "24px",
    letterSpacing: "0.5px",
  },
  heroTitle: {
    fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
    fontWeight: 700,
    marginBottom: "20px",
    lineHeight: 1.05,
    letterSpacing: "-1px",
  },
  heroTitleGold: {
    background: `linear-gradient(135deg, ${ACCENT_GOLD} 0%, #F5D78E 50%, ${ACCENT_GOLD} 100%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSubtitle: {
    fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
    marginBottom: "40px",
    opacity: 0.9,
    maxWidth: "750px",
    margin: "0 auto 40px auto",
    lineHeight: 1.6,
    fontWeight: 400,
  },
  heroButtons: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  primaryButton: {
    background: `linear-gradient(135deg, ${ACCENT_GOLD} 0%, #B8962E 100%)`,
    color: "#000000",
    border: "none",
    padding: "20px 56px",
    fontSize: "1.2rem",
    fontWeight: 700,
    borderRadius: "50px",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    boxShadow: "0 8px 32px rgba(212, 175, 55, 0.35)",
    transition: "all 0.3s ease",
    fontFamily: FONT_FAMILY,
  },
  noPurchaseBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "rgba(255,255,255,0.8)",
    fontSize: "0.95rem",
    marginTop: "8px",
  },
  scrollIndicator: {
    position: "absolute",
    bottom: "40px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    color: "rgba(255,255,255,0.6)",
    fontSize: "0.85rem",
    animation: "bounce 2s infinite",
  },

  // Section Base Styles
  section: {
    padding: "100px 24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  sectionDark: {
    background: "#0a0a0a",
  },
  sectionAlt: {
    background: "#111111",
  },
  sectionTitle: {
    fontSize: "clamp(2rem, 4vw, 3rem)",
    fontWeight: 700,
    textAlign: "center",
    marginBottom: "16px",
    color: "#ffffff",
  },
  sectionSubtitle: {
    fontSize: "1.15rem",
    textAlign: "center",
    color: "rgba(255,255,255,0.7)",
    marginBottom: "60px",
    maxWidth: "700px",
    margin: "0 auto 60px auto",
    lineHeight: 1.7,
  },

  // How It Works Section
  howItWorksSection: {
    background: "#111111",
    padding: "100px 24px",
  },
  stepsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "32px",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  stepCard: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "40px 28px",
    textAlign: "center",
    position: "relative",
    transition: "all 0.3s ease",
  },
  stepNumber: {
    position: "absolute",
    top: "-20px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${ACCENT_GOLD} 0%, #B8962E 100%)`,
    color: "#000000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.1rem",
    fontWeight: 700,
    boxShadow: "0 4px 16px rgba(212, 175, 55, 0.3)",
  },
  stepIcon: {
    fontSize: "3rem",
    marginBottom: "20px",
    marginTop: "12px",
  },
  stepTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    marginBottom: "12px",
    color: "#ffffff",
  },
  stepDesc: {
    fontSize: "0.95rem",
    color: "rgba(255,255,255,0.7)",
    lineHeight: 1.6,
  },

  // Dual Currency Section
  currencySection: {
    background: "#0a0a0a",
    padding: "100px 24px",
  },
  currencyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "32px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  currencyCard: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "24px",
    padding: "48px 36px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  },
  currencyCardGold: {
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  currencyCardGreen: {
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  currencyIconWrapper: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 28px auto",
    fontSize: "2.8rem",
  },
  goldCoinBg: {
    background: `linear-gradient(135deg, ${ACCENT_GOLD} 0%, #F5D78E 50%, ${ACCENT_GOLD} 100%)`,
    boxShadow: "0 8px 32px rgba(212, 175, 55, 0.4)",
  },
  sweepsCoinBg: {
    background: `linear-gradient(135deg, ${ACCENT_EMERALD} 0%, #34D399 50%, ${ACCENT_EMERALD} 100%)`,
    boxShadow: "0 8px 32px rgba(16, 185, 129, 0.4)",
  },
  currencyTitle: {
    fontSize: "1.6rem",
    fontWeight: 700,
    marginBottom: "8px",
    color: "#ffffff",
  },
  currencyTagline: {
    fontSize: "1rem",
    fontWeight: 600,
    marginBottom: "20px",
  },
  currencyTaglineGold: {
    color: ACCENT_GOLD,
  },
  currencyTaglineGreen: {
    color: ACCENT_EMERALD,
  },
  currencyDesc: {
    fontSize: "1rem",
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.7,
  },
  currencyBullets: {
    textAlign: "left",
    marginTop: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  currencyBullet: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    fontSize: "0.95rem",
    color: "rgba(255,255,255,0.8)",
    lineHeight: 1.5,
  },
  bulletIcon: {
    flexShrink: 0,
    marginTop: "2px",
  },

  // Games/Features Section
  gamesSection: {
    background: "#111111",
    padding: "100px 24px",
  },
  gamesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  gameCard: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "36px 28px",
    textAlign: "center",
    transition: "all 0.3s ease",
    cursor: "default",
  },
  gameIcon: {
    fontSize: "3.5rem",
    marginBottom: "20px",
  },
  gameTitle: {
    fontSize: "1.3rem",
    fontWeight: 700,
    marginBottom: "12px",
    color: "#ffffff",
  },
  gameDesc: {
    fontSize: "0.95rem",
    color: "rgba(255,255,255,0.7)",
    lineHeight: 1.6,
    marginBottom: "16px",
  },
  gameHighlight: {
    display: "inline-block",
    background: "rgba(212, 175, 55, 0.15)",
    color: ACCENT_GOLD,
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: 600,
  },

  // Trust & Compliance Section
  trustSection: {
    background: "#0a0a0a",
    padding: "100px 24px",
  },
  trustGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "24px",
    maxWidth: "1000px",
    margin: "0 auto 60px auto",
  },
  trustItem: {
    textAlign: "center",
    padding: "32px 20px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  trustIcon: {
    fontSize: "2.5rem",
    marginBottom: "16px",
  },
  trustTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#ffffff",
    marginBottom: "8px",
  },
  trustDesc: {
    fontSize: "0.85rem",
    color: "rgba(255,255,255,0.6)",
    lineHeight: 1.5,
  },
  complianceBox: {
    background: "linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.03) 100%)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    borderRadius: "20px",
    padding: "40px",
    maxWidth: "900px",
    margin: "0 auto",
    textAlign: "center",
  },
  complianceTitle: {
    fontSize: "1.3rem",
    fontWeight: 700,
    color: ACCENT_EMERALD,
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },
  complianceText: {
    fontSize: "1rem",
    color: "rgba(255,255,255,0.8)",
    lineHeight: 1.8,
    maxWidth: "700px",
    margin: "0 auto",
  },

  // Final CTA Section
  ctaSection: {
    background: `linear-gradient(180deg, #111111 0%, #0a0a0a 100%)`,
    padding: "100px 24px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  },
  ctaGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "600px",
    height: "400px",
    background: `radial-gradient(ellipse, rgba(212, 175, 55, 0.08) 0%, transparent 70%)`,
    pointerEvents: "none",
  },
  ctaContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: "700px",
    margin: "0 auto",
  },
  ctaTitle: {
    fontSize: "clamp(2rem, 5vw, 3rem)",
    fontWeight: 700,
    marginBottom: "20px",
    color: "#ffffff",
  },
  ctaSubtitle: {
    fontSize: "1.15rem",
    color: "rgba(255,255,255,0.8)",
    marginBottom: "40px",
    lineHeight: 1.7,
  },
  ctaFeatures: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "32px",
    marginBottom: "40px",
  },
  ctaFeature: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "rgba(255,255,255,0.9)",
    fontSize: "1rem",
  },
  ctaFeatureIcon: {
    color: ACCENT_EMERALD,
    fontSize: "1.2rem",
  },

  // Footer
  footer: {
    background: "#050505",
    padding: "60px 24px 40px 24px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  footerContent: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  footerTop: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "40px",
  },
  footerLogo: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#ffffff",
    marginBottom: "8px",
  },
  footerTagline: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.9rem",
  },
  footerLinks: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "32px",
    marginBottom: "40px",
  },
  footerLink: {
    color: "rgba(255,255,255,0.7)",
    textDecoration: "none",
    fontSize: "0.9rem",
    transition: "color 0.2s ease",
    cursor: "pointer",
  },
  footerDisclaimer: {
    background: "rgba(255,255,255,0.03)",
    borderRadius: "12px",
    padding: "28px",
    textAlign: "center",
    marginBottom: "32px",
  },
  disclaimerTitle: {
    color: ACCENT_GOLD,
    fontWeight: 700,
    fontSize: "0.9rem",
    marginBottom: "12px",
    letterSpacing: "1px",
  },
  disclaimerText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "0.85rem",
    lineHeight: 1.8,
    maxWidth: "800px",
    margin: "0 auto",
  },
  footerBottom: {
    textAlign: "center",
    color: "rgba(255,255,255,0.4)",
    fontSize: "0.8rem",
    paddingTop: "24px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },

  // Legal Pages Styles
  legalPage: {
    fontFamily: FONT_FAMILY,
    color: "#ffffff",
    backgroundColor: "#0a0a0a",
    minHeight: "100vh",
    margin: 0,
    padding: 0,
  },
  legalHeader: {
    background: "#050505",
    padding: "20px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    position: "sticky" as const,
    top: 0,
    zIndex: 100,
  },
  legalHeaderContent: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legalHeaderLogo: {
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#ffffff",
    textDecoration: "none",
    cursor: "pointer",
  },
  backLink: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: ACCENT_GOLD,
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "opacity 0.2s ease",
  },
  legalContent: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "60px 24px 100px 24px",
  },
  legalTitle: {
    fontSize: "clamp(2rem, 4vw, 3rem)",
    fontWeight: 700,
    marginBottom: "16px",
    color: "#ffffff",
  },
  legalLastUpdated: {
    fontSize: "0.9rem",
    color: "rgba(255,255,255,0.5)",
    marginBottom: "48px",
    paddingBottom: "32px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  legalSection: {
    marginBottom: "40px",
  },
  legalSectionTitle: {
    fontSize: "1.4rem",
    fontWeight: 700,
    color: ACCENT_GOLD,
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  legalSectionNumber: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "rgba(212, 175, 55, 0.15)",
    border: "1px solid rgba(212, 175, 55, 0.3)",
    fontSize: "0.9rem",
    fontWeight: 700,
    color: ACCENT_GOLD,
  },
  legalParagraph: {
    fontSize: "1rem",
    color: "rgba(255,255,255,0.85)",
    lineHeight: 1.8,
    marginBottom: "16px",
  },
  legalList: {
    listStyle: "none",
    padding: 0,
    margin: "16px 0",
  },
  legalListItem: {
    position: "relative" as const,
    paddingLeft: "28px",
    marginBottom: "12px",
    fontSize: "1rem",
    color: "rgba(255,255,255,0.85)",
    lineHeight: 1.7,
  },
  legalListBullet: {
    position: "absolute" as const,
    left: 0,
    top: "2px",
    color: ACCENT_EMERALD,
    fontWeight: 700,
  },
  legalHighlight: {
    background: "rgba(212, 175, 55, 0.1)",
    border: "1px solid rgba(212, 175, 55, 0.2)",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
  },
  legalHighlightTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: ACCENT_GOLD,
    marginBottom: "12px",
  },
  legalHighlightText: {
    fontSize: "1rem",
    color: "rgba(255,255,255,0.9)",
    lineHeight: 1.7,
  },
  legalSubsection: {
    marginTop: "24px",
    marginBottom: "20px",
  },
  legalSubsectionTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#ffffff",
    marginBottom: "12px",
  },
  legalTable: {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginBottom: "24px",
    marginTop: "16px",
  },
  legalTableHeader: {
    background: "rgba(255,255,255,0.05)",
    textAlign: "left" as const,
    padding: "12px 16px",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: ACCENT_GOLD,
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  legalTableCell: {
    padding: "12px 16px",
    fontSize: "0.95rem",
    color: "rgba(255,255,255,0.8)",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    verticalAlign: "top" as const,
  },
  legalContactBox: {
    background: "rgba(16, 185, 129, 0.08)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    borderRadius: "12px",
    padding: "24px",
    marginTop: "48px",
  },
  legalContactTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: ACCENT_EMERALD,
    marginBottom: "12px",
  },
  legalContactText: {
    fontSize: "1rem",
    color: "rgba(255,255,255,0.85)",
    lineHeight: 1.7,
  },
  legalLink: {
    color: ACCENT_GOLD,
    textDecoration: "underline",
    cursor: "pointer",
  },
};

// Game Areas Data
const gameAreas: GameArea[] = [
  {
    icon: "🎰",
    title: "Casino Floor",
    description: "Classic slots, table-style games, and exciting jackpot opportunities. The heart of the casino experience.",
    highlight: "Slots & Games",
  },
  {
    icon: "🎱",
    title: "Pool Hall",
    description: "Compete in virtual pool matches using your Gold Coins. Challenge yourself and climb the leaderboards.",
    highlight: "Skill Games",
  },
  {
    icon: "🍺",
    title: "The Bar",
    description: "Hang out in our social lounge with live chat, pinball, plinko, and darts. Meet fellow players.",
    highlight: "Social Zone",
  },
  {
    icon: "🎁",
    title: "Dollar Day",
    description: "Claim your daily rewards and Gold Coin packages. New bonuses every day for active players.",
    highlight: "Daily Rewards",
  },
];

// Steps Data
const steps: Step[] = [
  {
    number: 1,
    title: "Sign Up Free",
    description: "Create your account in seconds. No credit card required, no purchase necessary to start playing.",
    icon: "✨",
  },
  {
    number: 2,
    title: "Get Free Coins",
    description: "Receive your welcome bonus of Gold Coins instantly. Earn bonus Sweeps Coins through free entry methods.",
    icon: "🪙",
  },
  {
    number: 3,
    title: "Play Casino Games",
    description: "Enjoy slots, pool, arcade games, and more. Use Gold Coins for fun or Sweeps Coins for prize eligibility.",
    icon: "🎰",
  },
  {
    number: 4,
    title: "Redeem Prizes",
    description: "Accumulated Sweeps Coins can be redeemed for real prizes and cash equivalents per official rules.",
    icon: "🏆",
  },
];

// Trust Items Data
const trustItems = [
  {
    icon: "🆓",
    title: "No Purchase Necessary",
    description: "Free entry method always available",
  },
  {
    icon: "🔒",
    title: "Secure Platform",
    description: "Your data is protected",
  },
  {
    icon: "🎂",
    title: "21+ Only",
    description: "Age verification required",
  },
  {
    icon: "📋",
    title: "Official Rules",
    description: "Full transparency on terms",
  },
];

// =============================================================================
// OFFICIAL SWEEPSTAKES RULES PAGE
// =============================================================================
interface LegalPageProps {
  onNavigate: (page: PageType) => void;
}

function OfficialRulesPage({ onNavigate }: LegalPageProps): React.ReactElement {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div style={styles.legalPage}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { margin: 0; padding: 0; background: #0a0a0a; }
      `}</style>

      {/* Header */}
      <header style={styles.legalHeader}>
        <div style={styles.legalHeaderContent}>
          <span style={styles.legalHeaderLogo} onClick={() => onNavigate("home")}>
            {BRAND_NAME}
          </span>
          <span style={styles.backLink} onClick={() => onNavigate("home")}>
            ← Back to Home
          </span>
        </div>
      </header>

      {/* Content */}
      <main style={styles.legalContent}>
        <h1 style={styles.legalTitle}>Official Sweepstakes Rules</h1>
        <p style={styles.legalLastUpdated}>Last Updated: {currentDate}</p>

        {/* Important Notice */}
        <div style={styles.legalHighlight}>
          <div style={styles.legalHighlightTitle}>⚠️ NO PURCHASE NECESSARY TO ENTER OR WIN</div>
          <p style={styles.legalHighlightText}>
            A purchase or payment of any kind will not increase your chances of winning.
            Void where prohibited by law. Must be 21 years or older to participate.
          </p>
        </div>

        {/* Section 1: Promotion Name & Sponsor */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>1</span>
            Promotion Name and Sponsor
          </h2>
          <p style={styles.legalParagraph}>
            <strong>Promotion Name:</strong> {BRAND_NAME} Sweepstakes Promotion
          </p>
          <p style={styles.legalParagraph}>
            <strong>Sponsor:</strong> {BRAND_NAME}
          </p>
          <p style={styles.legalParagraph}>
            <strong>Address:</strong> {SPONSOR_ADDRESS}
          </p>
          <p style={styles.legalParagraph}>
            The Sponsor is responsible for all aspects of this Promotion, including the collection,
            submission, and processing of entries, and the overall administration of the Promotion.
          </p>
        </div>

        {/* Section 2: Eligibility */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>2</span>
            Eligibility
          </h2>
          <p style={styles.legalParagraph}>
            The {BRAND_NAME} Sweepstakes Promotion is open only to legal residents of the United States
            who are twenty-one (21) years of age or older at the time of entry. Void where prohibited
            by law.
          </p>
          <p style={styles.legalParagraph}>
            Employees, officers, and directors of the Sponsor, its parent company, subsidiaries,
            affiliates, advertising and promotion agencies, and members of their immediate families
            (spouse, parents, siblings, children) or households are not eligible to participate.
          </p>
          <p style={styles.legalParagraph}>
            By participating in this Promotion, you agree to be bound by these Official Rules and
            the decisions of the Sponsor, which are final and binding in all matters related to the Promotion.
          </p>
        </div>

        {/* Section 3: Promotion Period */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>3</span>
            Promotion Period
          </h2>
          <p style={styles.legalParagraph}>
            The {BRAND_NAME} Sweepstakes Promotion is an ongoing promotion with no predetermined end date.
            The Sponsor reserves the right to modify, suspend, or terminate the Promotion at any time
            for any reason, including but not limited to technical difficulties, regulatory changes,
            or business considerations.
          </p>
          <p style={styles.legalParagraph}>
            Participants will be notified of any material changes to the Promotion Period through
            updates to these Official Rules and/or notifications on the Platform.
          </p>
        </div>

        {/* Section 4: How to Enter */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>4</span>
            How to Enter (Free Entry Methods)
          </h2>
          <p style={styles.legalParagraph}>
            <strong>NO PURCHASE IS NECESSARY.</strong> There are multiple free methods to obtain
            Sweeps Coins and participate in the Promotion:
          </p>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>A. Free Account Registration</h3>
            <p style={styles.legalParagraph}>
              Create a free account at damfortunes.com. Upon successful registration and
              verification of your account, you will receive a welcome bonus of Gold Coins and
              Sweeps Coins as specified on the Platform at the time of registration.
            </p>
          </div>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>B. Daily Login Bonus</h3>
            <p style={styles.legalParagraph}>
              Receive free Gold Coins daily by logging into your account. Active accounts may also
              receive periodic Sweeps Coin bonuses through daily login rewards and promotional offers.
            </p>
          </div>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>C. Free Mail-In Entry</h3>
            <p style={styles.legalParagraph}>
              To receive free Sweeps Coins without making any purchase, hand-print your full legal name,
              complete address (including city, state, and ZIP code), email address associated with your
              {BRAND_NAME} account, and date of birth on a 3x5 inch card or piece of paper and mail it to:
            </p>
            <p style={styles.legalParagraph}>
              <strong>{BRAND_NAME} Free Entry Request</strong><br />
              {SPONSOR_ADDRESS}
            </p>
            <p style={styles.legalParagraph}>
              Limit: Five (5) free mail-in requests per person per calendar month. Each valid mail-in
              request will be credited with Sweeps Coins as specified on the Platform (currently 5 SC
              per valid request). Mail-in requests must be handwritten and sent via regular U.S. mail.
              Requests sent in bulk, by commercial mail services, or that are mechanically reproduced
              will not be accepted.
            </p>
          </div>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>D. Social Media Promotions</h3>
            <p style={styles.legalParagraph}>
              From time to time, {BRAND_NAME} may offer Sweeps Coins through social media contests,
              giveaways, and promotional events. Details of such promotions will be announced on our
              official social media channels and/or the Platform.
            </p>
          </div>
        </div>

        {/* Section 5: Virtual Currency System */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>5</span>
            Virtual Currency System
          </h2>

          <table style={styles.legalTable}>
            <thead>
              <tr>
                <th style={styles.legalTableHeader}>Currency Type</th>
                <th style={styles.legalTableHeader}>Description</th>
                <th style={styles.legalTableHeader}>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.legalTableCell}><strong>Gold Coins (GC)</strong></td>
                <td style={styles.legalTableCell}>
                  Virtual entertainment currency used for gameplay on the Platform.
                  Gold Coins are for entertainment purposes only.
                </td>
                <td style={styles.legalTableCell}>
                  <strong>No monetary value.</strong> Cannot be redeemed for cash, prizes,
                  or anything of value. Not transferable.
                </td>
              </tr>
              <tr>
                <td style={styles.legalTableCell}><strong>Sweeps Coins (SC)</strong></td>
                <td style={styles.legalTableCell}>
                  Promotional currency awarded as bonuses with Gold Coin package purchases,
                  through free entry methods, or via promotional offers. Used for prize-eligible gameplay.
                </td>
                <td style={styles.legalTableCell}>
                  <strong>Redeemable for prizes</strong> at a rate of 1 SC = $1 USD.
                  Minimum 50 SC required to redeem.
                </td>
              </tr>
            </tbody>
          </table>

          <div style={styles.legalHighlight}>
            <div style={styles.legalHighlightTitle}>Important Currency Clarification</div>
            <p style={styles.legalHighlightText}>
              Sweeps Coins are NEVER sold directly. They are awarded as promotional bonuses
              alongside Gold Coin package purchases or obtained through free entry methods.
              The purchase of Gold Coins does not guarantee any Sweeps Coins winnings and does
              not improve your chances of winning.
            </p>
          </div>
        </div>

        {/* Section 6: Prize Redemption */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>6</span>
            Prize Redemption
          </h2>
          <p style={styles.legalParagraph}>
            Accumulated Sweeps Coins can be redeemed for cash prizes at a rate of 1 SC = $1 USD (less
            any applicable fees). The minimum redemption amount is 50 Sweeps Coins ($50 USD).
          </p>
          <ul style={styles.legalList}>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✓</span>
              Prize redemptions are processed via approved payment methods as available on the Platform
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✓</span>
              Account verification is required before any redemption can be processed
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✓</span>
              Processing times vary based on verification status and payment method (typically 3-7 business days)
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✓</span>
              Winners are responsible for all applicable federal, state, and local taxes on prizes
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✓</span>
              The Sponsor may require winners to complete and return an IRS Form W-9 or W-8BEN for tax reporting purposes
            </li>
          </ul>
        </div>

        {/* Section 7: Odds of Winning */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>7</span>
            Odds of Winning
          </h2>
          <p style={styles.legalParagraph}>
            The odds of winning depend on game outcomes, which are determined by certified random
            number generators (RNGs), and the number of participants in the Promotion. Odds vary
            by game and are displayed within each game interface on the Platform.
          </p>
          <p style={styles.legalParagraph}>
            Purchase of Gold Coins does not improve the odds of winning Sweeps Coin prizes. All
            participants using Sweeps Coins have equal chances based on gameplay outcomes.
          </p>
        </div>

        {/* Section 8: General Conditions */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>8</span>
            General Conditions
          </h2>
          <ul style={styles.legalList}>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>•</span>
              All decisions of the Sponsor regarding the Promotion are final and binding
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>•</span>
              The Sponsor reserves the right to modify, suspend, or terminate the Promotion at any time
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>•</span>
              The Sponsor reserves the right to disqualify any participant who tampers with the entry process,
              violates these Official Rules, or acts in an unsportsmanlike or disruptive manner
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>•</span>
              By participating, entrants grant the Sponsor permission to use their name, likeness,
              and entry information for promotional purposes without additional compensation
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>•</span>
              The Sponsor is not responsible for lost, late, misdirected, damaged, incomplete,
              illegible, or postage-due mail
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>•</span>
              The Sponsor is not responsible for technical failures, human error, or other issues
              that may affect participation in the Promotion
            </li>
          </ul>
        </div>

        {/* Section 9: Privacy */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>9</span>
            Privacy
          </h2>
          <p style={styles.legalParagraph}>
            Personal information collected from participants is subject to the {BRAND_NAME}{" "}
            <span style={styles.legalLink} onClick={() => onNavigate("privacy")}>Privacy Policy</span>.
            By participating in this Promotion, you consent to the collection, use, and disclosure
            of your personal information as described therein.
          </p>
        </div>

        {/* Section 10: Governing Law */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>10</span>
            Governing Law and Jurisdiction
          </h2>
          <p style={styles.legalParagraph}>
            These Official Rules and any disputes arising out of or related to the Promotion shall
            be governed by and construed in accordance with the laws of the State of South Carolina,
            without regard to its conflict of law provisions.
          </p>
          <p style={styles.legalParagraph}>
            Any legal proceedings arising out of or related to these Official Rules or the Promotion
            shall be brought exclusively in the state or federal courts located in South Carolina,
            and you consent to the personal jurisdiction of such courts.
          </p>
        </div>

        {/* Contact Box */}
        <div style={styles.legalContactBox}>
          <div style={styles.legalContactTitle}>📧 Questions About the Official Rules?</div>
          <p style={styles.legalContactText}>
            If you have questions about these Official Sweepstakes Rules or need assistance,
            please contact us at <strong>{SUPPORT_EMAIL}</strong>
          </p>
        </div>
      </main>

      {/* Simple Footer */}
      <footer style={{ ...styles.footer, padding: "24px" }}>
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>
          © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// =============================================================================
// TERMS AND CONDITIONS PAGE
// =============================================================================
function TermsAndConditionsPage({ onNavigate }: LegalPageProps): React.ReactElement {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div style={styles.legalPage}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { margin: 0; padding: 0; background: #0a0a0a; }
      `}</style>

      {/* Header */}
      <header style={styles.legalHeader}>
        <div style={styles.legalHeaderContent}>
          <span style={styles.legalHeaderLogo} onClick={() => onNavigate("home")}>
            {BRAND_NAME}
          </span>
          <span style={styles.backLink} onClick={() => onNavigate("home")}>
            ← Back to Home
          </span>
        </div>
      </header>

      {/* Content */}
      <main style={styles.legalContent}>
        <h1 style={styles.legalTitle}>Terms and Conditions</h1>
        <p style={styles.legalLastUpdated}>Last Updated: {currentDate}</p>

        {/* Important Notice */}
        <div style={styles.legalHighlight}>
          <div style={styles.legalHighlightTitle}>📋 Please Read Carefully</div>
          <p style={styles.legalHighlightText}>
            By accessing or using {BRAND_NAME}, you agree to be bound by these Terms and Conditions.
            If you do not agree to these terms, please do not use the Platform.
          </p>
        </div>

        {/* Section 1: Acceptance of Terms */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>1</span>
            Acceptance of Terms
          </h2>
          <p style={styles.legalParagraph}>
            These Terms and Conditions (&quot;Terms&quot;) constitute a legally binding agreement between you
            and {BRAND_NAME} (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) governing your access to and use of
            the {BRAND_NAME} website, mobile applications, and all related services (collectively,
            the &quot;Platform&quot;).
          </p>
          <p style={styles.legalParagraph}>
            By creating an account, accessing, or using the Platform, you acknowledge that you have
            read, understood, and agree to be bound by these Terms, our{" "}
            <span style={styles.legalLink} onClick={() => onNavigate("privacy")}>Privacy Policy</span>,
            and our{" "}
            <span style={styles.legalLink} onClick={() => onNavigate("rules")}>Official Sweepstakes Rules</span>.
          </p>
        </div>

        {/* Section 2: Eligibility */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>2</span>
            Eligibility Requirements
          </h2>
          <p style={styles.legalParagraph}>
            To use the Platform, you must meet all of the following requirements:
          </p>
          <ul style={styles.legalList}>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✓</span>
              Be at least twenty-one (21) years of age
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✓</span>
              Be a legal resident of the United States
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✓</span>
              Not be located in any jurisdiction where participation is prohibited by law
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✓</span>
              Have the legal capacity to enter into a binding agreement
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✓</span>
              Not be an employee or immediate family member of employees of the Company
            </li>
          </ul>
          <p style={styles.legalParagraph}>
            <strong>Void where prohibited.</strong> It is your responsibility to ensure that your
            participation complies with all applicable laws in your jurisdiction.
          </p>
        </div>

        {/* Section 3: Account Registration */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>3</span>
            Account Registration
          </h2>
          <p style={styles.legalParagraph}>
            To access certain features of the Platform, you must create an account. When registering,
            you agree to:
          </p>
          <ul style={styles.legalList}>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>•</span>
              Provide accurate, current, and complete information during registration
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>•</span>
              Maintain and promptly update your account information to keep it accurate and current
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>•</span>
              Maintain the security and confidentiality of your login credentials
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>•</span>
              Notify us immediately of any unauthorized access to or use of your account
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>•</span>
              Accept responsibility for all activities that occur under your account
            </li>
          </ul>
          <p style={styles.legalParagraph}>
            <strong>One Account Per Person:</strong> Each person may only register for and maintain
            one (1) account on the Platform. Creating multiple accounts is strictly prohibited and
            may result in termination of all associated accounts and forfeiture of any virtual
            currency balances.
          </p>
        </div>

        {/* Section 4: Virtual Currency */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>4</span>
            Virtual Currency
          </h2>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>Gold Coins</h3>
            <p style={styles.legalParagraph}>
              Gold Coins are virtual entertainment currency with <strong>no cash value</strong>.
              Gold Coins cannot be exchanged for cash, prizes, or anything of monetary value.
              Gold Coins are for entertainment purposes only and are used for casual gameplay
              on the Platform.
            </p>
          </div>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>Sweeps Coins</h3>
            <p style={styles.legalParagraph}>
              Sweeps Coins are promotional currency that may be redeemed for prizes in accordance
              with our{" "}
              <span style={styles.legalLink} onClick={() => onNavigate("rules")}>Official Sweepstakes Rules</span>.
              Sweeps Coins are never sold directly — they are awarded as promotional bonuses with
              Gold Coin package purchases or obtained through free entry methods.
            </p>
          </div>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>Ownership</h3>
            <p style={styles.legalParagraph}>
              All virtual currency (Gold Coins and Sweeps Coins) remains the property of {BRAND_NAME}.
              You are granted a limited, personal, non-transferable, non-sublicensable, revocable
              license to use virtual currency solely on the Platform in accordance with these Terms.
            </p>
            <p style={styles.legalParagraph}>
              Virtual currency cannot be transferred, sold, or exchanged outside the Platform.
              Any attempt to do so will result in immediate account termination and forfeiture
              of all virtual currency balances.
            </p>
          </div>
        </div>

        {/* Section 5: Prohibited Conduct */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>5</span>
            Prohibited Conduct
          </h2>
          <p style={styles.legalParagraph}>
            You agree not to engage in any of the following prohibited activities:
          </p>
          <ul style={styles.legalList}>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✗</span>
              Creating multiple accounts or using false identity information
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✗</span>
              Using automated systems, bots, scripts, or other software to access or interact with the Platform
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✗</span>
              Exploiting bugs, glitches, or errors in the Platform for unfair advantage
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✗</span>
              Colluding with other users to manipulate game outcomes
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✗</span>
              Engaging in any form of fraud, money laundering, or illegal activity
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✗</span>
              Harassing, threatening, or abusing other users or staff
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✗</span>
              Attempting to reverse engineer, decompile, or disassemble the Platform
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✗</span>
              Circumventing or attempting to circumvent any security measures
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✗</span>
              Using the Platform in any way that violates applicable laws or regulations
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✗</span>
              Selling, trading, or transferring your account or virtual currency to third parties
            </li>
          </ul>
        </div>

        {/* Section 6: Intellectual Property */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>6</span>
            Intellectual Property
          </h2>
          <p style={styles.legalParagraph}>
            All content on the Platform, including but not limited to text, graphics, logos, icons,
            images, audio clips, video clips, data compilations, software, and the overall design
            and arrangement of the Platform (&quot;Content&quot;), is the exclusive property of {BRAND_NAME}
            or its licensors and is protected by United States and international copyright, trademark,
            and other intellectual property laws.
          </p>
          <p style={styles.legalParagraph}>
            You may not copy, reproduce, distribute, modify, create derivative works of, publicly
            display, publicly perform, republish, download, store, or transmit any Content without
            the prior written consent of {BRAND_NAME}.
          </p>
        </div>

        {/* Section 7: Disclaimer of Warranties */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>7</span>
            Disclaimer of Warranties
          </h2>
          <p style={styles.legalParagraph}>
            THE PLATFORM IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF
            ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
          </p>
          <p style={styles.legalParagraph}>
            {BRAND_NAME} does not warrant that: (a) the Platform will function uninterrupted, secure,
            or available at any particular time or location; (b) any errors or defects will be
            corrected; (c) the Platform is free of viruses or other harmful components; or (d) the
            results of using the Platform will meet your requirements.
          </p>
        </div>

        {/* Section 8: Limitation of Liability */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>8</span>
            Limitation of Liability
          </h2>
          <p style={styles.legalParagraph}>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL {BRAND_NAME.toUpperCase()},
            ITS AFFILIATES, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION
            LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
          </p>
          <ul style={styles.legalList}>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>•</span>
              Your access to or use of or inability to access or use the Platform
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>•</span>
              Any conduct or content of any third party on the Platform
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>•</span>
              Any content obtained from the Platform
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>•</span>
              Unauthorized access, use, or alteration of your transmissions or content
            </li>
          </ul>
        </div>

        {/* Section 9: Indemnification */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>9</span>
            Indemnification
          </h2>
          <p style={styles.legalParagraph}>
            You agree to defend, indemnify, and hold harmless {BRAND_NAME} and its affiliates,
            licensors, and service providers, and their respective officers, directors, employees,
            contractors, agents, licensors, suppliers, successors, and assigns from and against any
            claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees
            (including reasonable attorneys&apos; fees) arising out of or relating to your violation of
            these Terms or your use of the Platform.
          </p>
        </div>

        {/* Section 10: Termination */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>10</span>
            Termination
          </h2>
          <p style={styles.legalParagraph}>
            We may suspend or terminate your account and access to the Platform immediately, without
            prior notice or liability, for any reason whatsoever, including without limitation if
            you breach these Terms.
          </p>
          <p style={styles.legalParagraph}>
            Upon termination, your right to use the Platform will immediately cease. All provisions
            of these Terms which by their nature should survive termination shall survive, including
            ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
          </p>
          <p style={styles.legalParagraph}>
            If your account is terminated for violation of these Terms, you may forfeit any unredeemed
            virtual currency balances. Sweeps Coins that have been legitimately earned and verified
            may be redeemable subject to our standard verification procedures.
          </p>
        </div>

        {/* Section 11: Modifications to Terms */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>11</span>
            Modifications to Terms
          </h2>
          <p style={styles.legalParagraph}>
            We reserve the right to modify or replace these Terms at any time at our sole discretion.
            If a revision is material, we will provide at least thirty (30) days notice prior to any
            new terms taking effect, either through a notice on the Platform or via email to the
            address associated with your account.
          </p>
          <p style={styles.legalParagraph}>
            Your continued use of the Platform after any changes to these Terms constitutes your
            acceptance of the new Terms. If you do not agree to the new Terms, you must stop using
            the Platform.
          </p>
        </div>

        {/* Section 12: Governing Law */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>12</span>
            Governing Law
          </h2>
          <p style={styles.legalParagraph}>
            These Terms and your use of the Platform shall be governed by and construed in accordance
            with the laws of the State of South Carolina, without regard to its conflict of law provisions.
          </p>
          <p style={styles.legalParagraph}>
            Any legal action or proceeding arising out of or related to these Terms or the Platform
            shall be brought exclusively in the state or federal courts located in South Carolina,
            and you consent to the personal jurisdiction of such courts.
          </p>
        </div>

        {/* Section 13: Contact Information */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>13</span>
            Contact Information
          </h2>
          <p style={styles.legalParagraph}>
            If you have any questions about these Terms and Conditions, please contact us:
          </p>
          <ul style={styles.legalList}>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>📧</span>
              Email: <strong>{SUPPORT_EMAIL}</strong>
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>📍</span>
              Address: {SPONSOR_ADDRESS}
            </li>
          </ul>
        </div>

        {/* Contact Box */}
        <div style={styles.legalContactBox}>
          <div style={styles.legalContactTitle}>Need Help?</div>
          <p style={styles.legalContactText}>
            Our support team is here to assist you with any questions about these Terms or your account.
            Contact us at <strong>{SUPPORT_EMAIL}</strong>
          </p>
        </div>
      </main>

      {/* Simple Footer */}
      <footer style={{ ...styles.footer, padding: "24px" }}>
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>
          © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// =============================================================================
// PRIVACY POLICY PAGE (Comprehensive)
// =============================================================================
function PrivacyPolicyPage({ onNavigate }: LegalPageProps): React.ReactElement {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div style={styles.legalPage}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { margin: 0; padding: 0; background: #0a0a0a; }
      `}</style>

      {/* Header */}
      <header style={styles.legalHeader}>
        <div style={styles.legalHeaderContent}>
          <span style={styles.legalHeaderLogo} onClick={() => onNavigate("home")}>
            {BRAND_NAME}
          </span>
          <span style={styles.backLink} onClick={() => onNavigate("home")}>
            ← Back to Home
          </span>
        </div>
      </header>

      {/* Content */}
      <main style={styles.legalContent}>
        <h1 style={styles.legalTitle}>Privacy Policy</h1>
        <p style={styles.legalLastUpdated}>Last Updated: {currentDate}</p>

        {/* Important Notice */}
        <div style={styles.legalHighlight}>
          <div style={styles.legalHighlightTitle}>🔒 Your Privacy Matters</div>
          <p style={styles.legalHighlightText}>
            {BRAND_NAME} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates damfortunes.com (the &quot;Platform&quot;).
            This Privacy Policy explains how we collect, use, disclose, and protect your personal
            information when you use our Platform. By using our Platform, you consent to the practices
            described in this policy.
          </p>
        </div>

        {/* Section 1: Introduction */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>1</span>
            Introduction
          </h2>
          <p style={styles.legalParagraph}>
            {BRAND_NAME} is committed to protecting your privacy and ensuring the security of your
            personal information. This Privacy Policy describes the types of information we may
            collect from you or that you may provide when you visit our Platform, and our practices
            for collecting, using, maintaining, protecting, and disclosing that information.
          </p>
          <p style={styles.legalParagraph}>
            This policy applies to information we collect on the Platform, in email, text, and other
            electronic messages between you and the Platform, and through mobile and desktop
            applications you download from the Platform.
          </p>
          <p style={styles.legalParagraph}>
            Please read this policy carefully to understand our policies and practices regarding your
            information and how we will treat it. If you do not agree with our policies and practices,
            your choice is not to use our Platform.
          </p>
        </div>

        {/* Section 2: Information We Collect */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>2</span>
            Information We Collect
          </h2>
          <p style={styles.legalParagraph}>
            We collect several types of information from and about users of our Platform:
          </p>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>Account Information</h3>
            <ul style={styles.legalList}>
              <li style={styles.legalListItem}>
                <span style={styles.legalListBullet}>•</span>
                Full legal name
              </li>
              <li style={styles.legalListItem}>
                <span style={styles.legalListBullet}>•</span>
                Email address
              </li>
              <li style={styles.legalListItem}>
                <span style={styles.legalListBullet}>•</span>
                Date of birth (for age verification — must be 21+)
              </li>
              <li style={styles.legalListItem}>
                <span style={styles.legalListBullet}>•</span>
                Mailing address (required for prize redemption and verification)
              </li>
              <li style={styles.legalListItem}>
                <span style={styles.legalListBullet}>•</span>
                Phone number (optional, for account security)
              </li>
            </ul>
          </div>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>Payment Information</h3>
            <p style={styles.legalParagraph}>
              When you purchase Gold Coin packages, payment information is processed securely through
              our third-party payment processors (including Stripe, PayPal, and Chime). <strong>We do
              not store full credit card numbers, CVV codes, or complete bank account details on our
              servers.</strong> We retain only transaction identifiers, partial card numbers (last 4 digits),
              and billing addresses necessary for record-keeping and customer support.
            </p>
          </div>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>Usage Data</h3>
            <ul style={styles.legalList}>
              <li style={styles.legalListItem}>
                <span style={styles.legalListBullet}>•</span>
                Gameplay history and activity logs
              </li>
              <li style={styles.legalListItem}>
                <span style={styles.legalListBullet}>•</span>
                Gold Coin and Sweeps Coin balances and transaction history
              </li>
              <li style={styles.legalListItem}>
                <span style={styles.legalListBullet}>•</span>
                Game preferences and settings
              </li>
              <li style={styles.legalListItem}>
                <span style={styles.legalListBullet}>•</span>
                Chat messages sent in public chat rooms
              </li>
              <li style={styles.legalListItem}>
                <span style={styles.legalListBullet}>•</span>
                Login timestamps and session duration
              </li>
            </ul>
          </div>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>Device Information</h3>
            <ul style={styles.legalList}>
              <li style={styles.legalListItem}>
                <span style={styles.legalListBullet}>•</span>
                IP address and approximate geographic location
              </li>
              <li style={styles.legalListItem}>
                <span style={styles.legalListBullet}>•</span>
                Browser type and version
              </li>
              <li style={styles.legalListItem}>
                <span style={styles.legalListBullet}>•</span>
                Operating system
              </li>
              <li style={styles.legalListItem}>
                <span style={styles.legalListBullet}>•</span>
                Device identifiers (device type, screen resolution)
              </li>
              <li style={styles.legalListItem}>
                <span style={styles.legalListBullet}>•</span>
                Referring URLs and pages visited
              </li>
            </ul>
          </div>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>Cookies and Tracking Technologies</h3>
            <p style={styles.legalParagraph}>
              We use cookies, web beacons, and similar tracking technologies to collect information
              about your browsing activities and to distinguish you from other users of our Platform.
              For more details, see Section 8: Cookies Policy below.
            </p>
          </div>
        </div>

        {/* Section 3: How We Use Your Information */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>3</span>
            How We Use Your Information
          </h2>
          <p style={styles.legalParagraph}>
            We use the information we collect about you for the following purposes:
          </p>
          <ul style={styles.legalList}>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✓</span>
              <strong>Account Management:</strong> To create, maintain, and manage your account and provide customer support
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✓</span>
              <strong>Gold Coin Purchases:</strong> To process your Gold Coin package purchases and provide transaction receipts
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✓</span>
              <strong>Prize Fulfillment:</strong> To administer Sweeps Coins redemptions and deliver prizes to verified winners
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✓</span>
              <strong>Age and Eligibility Verification:</strong> To verify that you are at least 21 years old and eligible to participate
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✓</span>
              <strong>Communications:</strong> To send you important account notifications, promotional offers, and Platform updates (with opt-out options)
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✓</span>
              <strong>Platform Improvement:</strong> To analyze usage patterns, improve our services, and enhance user experience
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✓</span>
              <strong>Security and Fraud Prevention:</strong> To detect, investigate, and prevent fraudulent transactions, abuse, and security threats
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>✓</span>
              <strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes
            </li>
          </ul>
        </div>

        {/* Section 4: Information Sharing */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>4</span>
            Information Sharing
          </h2>

          <div style={styles.legalHighlight}>
            <div style={styles.legalHighlightTitle}>We Do Not Sell Your Personal Information</div>
            <p style={styles.legalHighlightText}>
              {BRAND_NAME} does not sell, rent, or trade your personal information to third parties
              for their marketing purposes. We only share your information as described below.
            </p>
          </div>

          <p style={styles.legalParagraph}>
            We may share your personal information with the following categories of recipients:
          </p>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>Payment Processors</h3>
            <p style={styles.legalParagraph}>
              We share necessary payment information with our third-party payment processors (Stripe,
              PayPal, Chime) to process Gold Coin package purchases and prize redemptions. These
              processors have their own privacy policies and security measures.
            </p>
          </div>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>Prize Fulfillment Partners</h3>
            <p style={styles.legalParagraph}>
              When you redeem Sweeps Coins for prizes, we may share your name and shipping address
              with fulfillment partners to deliver physical prizes or process cash prize payments.
            </p>
          </div>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>Service Providers</h3>
            <p style={styles.legalParagraph}>
              We work with trusted service providers who perform services on our behalf, such as
              hosting, analytics, customer support, and email delivery. These providers are bound
              by confidentiality agreements and are prohibited from using your information for any
              purpose other than providing services to us.
            </p>
          </div>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>Legal Authorities</h3>
            <p style={styles.legalParagraph}>
              We may disclose your information when required by law, such as in response to a
              subpoena, court order, or other legal process, or when we believe disclosure is
              necessary to protect our rights, your safety, or the safety of others.
            </p>
          </div>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>Business Transfers</h3>
            <p style={styles.legalParagraph}>
              If {BRAND_NAME} is involved in a merger, acquisition, or sale of assets, your personal
              information may be transferred as part of that transaction. We will provide notice
              before your information is transferred and becomes subject to a different privacy policy.
            </p>
          </div>
        </div>

        {/* Section 5: Data Security */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>5</span>
            Data Security
          </h2>
          <p style={styles.legalParagraph}>
            We implement industry-standard security measures designed to protect your personal
            information from unauthorized access, alteration, disclosure, or destruction:
          </p>
          <ul style={styles.legalList}>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>🔒</span>
              <strong>SSL/TLS Encryption:</strong> All data transmitted between your browser and our servers is encrypted using SSL/TLS protocols
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>🔒</span>
              <strong>Secure Data Storage:</strong> Personal information is stored on secure servers with access controls and encryption at rest
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>🔒</span>
              <strong>Password Protection:</strong> Your account password is hashed and never stored in plain text
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>🔒</span>
              <strong>Regular Security Assessments:</strong> We conduct periodic security reviews and vulnerability assessments
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>🔒</span>
              <strong>Employee Training:</strong> Our team is trained on data protection best practices and privacy requirements
            </li>
          </ul>
          <p style={styles.legalParagraph}>
            While we strive to use commercially acceptable means to protect your personal information,
            no method of transmission over the Internet or electronic storage is 100% secure. We cannot
            guarantee absolute security but are committed to maintaining the highest practical standards.
          </p>
        </div>

        {/* Section 6: Your Rights and Choices */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>6</span>
            Your Rights and Choices
          </h2>
          <p style={styles.legalParagraph}>
            You have several rights regarding your personal information:
          </p>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>Access Your Information</h3>
            <p style={styles.legalParagraph}>
              You can request a copy of the personal information we hold about you by contacting
              our support team at {SUPPORT_EMAIL}.
            </p>
          </div>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>Correct Inaccurate Information</h3>
            <p style={styles.legalParagraph}>
              You can update your account information directly through your account settings, or
              contact us to correct any inaccurate or incomplete information.
            </p>
          </div>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>Request Account Deletion</h3>
            <p style={styles.legalParagraph}>
              You may request deletion of your account and associated personal information by
              contacting us at {SUPPORT_EMAIL}. Please note that we may retain certain information
              as required by law or for legitimate business purposes (such as fraud prevention
              and legal compliance).
            </p>
          </div>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>Opt-Out of Marketing Communications</h3>
            <p style={styles.legalParagraph}>
              You can opt-out of receiving promotional emails by clicking the &quot;unsubscribe&quot; link
              in any marketing email, or by contacting us directly. Note that you may still receive
              transactional emails related to your account (such as purchase confirmations and
              security alerts).
            </p>
          </div>

          <div style={styles.legalHighlight}>
            <div style={styles.legalHighlightTitle}>California Residents — CCPA Rights</div>
            <p style={styles.legalHighlightText}>
              If you are a California resident, you have additional rights under the California
              Consumer Privacy Act (CCPA), including:<br /><br />
              • <strong>Right to Know:</strong> Request information about the categories and specific
              pieces of personal information we have collected about you<br />
              • <strong>Right to Delete:</strong> Request deletion of your personal information,
              subject to certain exceptions<br />
              • <strong>Right to Non-Discrimination:</strong> We will not discriminate against you
              for exercising any of your CCPA rights<br /><br />
              To exercise your CCPA rights, contact us at {SUPPORT_EMAIL} with &quot;CCPA Request&quot; in
              the subject line.
            </p>
          </div>
        </div>

        {/* Section 7: Children's Privacy */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>7</span>
            {`Children's Privacy`}
          </h2>
          <p style={styles.legalParagraph}>
            Our Platform is intended solely for users who are 21 years of age or older. <strong>We
            do not knowingly collect personal information from anyone under the age of 21.</strong>
          </p>
          <p style={styles.legalParagraph}>
            If you are under 21 years of age, you are not permitted to use our Platform or provide
            any personal information to us. If we learn that we have collected personal information
            from an underage user, we will take immediate steps to delete that information.
          </p>
          <p style={styles.legalParagraph}>
            If you believe that someone under 21 has provided us with personal information, please
            contact us immediately at {SUPPORT_EMAIL} so we can investigate and take appropriate action.
          </p>
        </div>

        {/* Section 8: Cookies Policy */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>8</span>
            Cookies Policy
          </h2>
          <p style={styles.legalParagraph}>
            We use cookies and similar tracking technologies to collect and track information
            about your use of our Platform. Cookies are small data files placed on your device.
          </p>

          <table style={styles.legalTable}>
            <thead>
              <tr>
                <th style={styles.legalTableHeader}>Cookie Type</th>
                <th style={styles.legalTableHeader}>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.legalTableCell}><strong>Essential Cookies</strong></td>
                <td style={styles.legalTableCell}>
                  Required for the Platform to function properly. These cookies enable core
                  functionality such as security, network management, and accessibility.
                  You cannot opt out of these cookies.
                </td>
              </tr>
              <tr>
                <td style={styles.legalTableCell}><strong>Analytics Cookies</strong></td>
                <td style={styles.legalTableCell}>
                  Help us understand how visitors interact with our Platform by collecting
                  and reporting information anonymously. This helps us improve our services.
                </td>
              </tr>
              <tr>
                <td style={styles.legalTableCell}><strong>Preference Cookies</strong></td>
                <td style={styles.legalTableCell}>
                  Allow the Platform to remember choices you make (such as your language or
                  region) and provide enhanced, personalized features.
                </td>
              </tr>
              <tr>
                <td style={styles.legalTableCell}><strong>Marketing Cookies</strong></td>
                <td style={styles.legalTableCell}>
                  Used to track visitors across websites to display relevant advertisements.
                  These cookies are set by us and our advertising partners.
                </td>
              </tr>
            </tbody>
          </table>

          <div style={styles.legalSubsection}>
            <h3 style={styles.legalSubsectionTitle}>Managing Cookie Preferences</h3>
            <p style={styles.legalParagraph}>
              Most web browsers allow you to control cookies through their settings. You can set
              your browser to refuse all or some cookies, or to alert you when cookies are being
              sent. However, if you disable or refuse cookies, some features of our Platform may
              not function properly.
            </p>
          </div>
        </div>

        {/* Section 9: Changes to This Policy */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>9</span>
            Changes to This Policy
          </h2>
          <p style={styles.legalParagraph}>
            We may update this Privacy Policy from time to time to reflect changes in our practices
            or for other operational, legal, or regulatory reasons. We will notify you of any
            material changes by:
          </p>
          <ul style={styles.legalList}>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>•</span>
              Posting the updated Privacy Policy on this page with a new &quot;Last Updated&quot; date
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>•</span>
              Sending an email notification to the address associated with your account for significant changes
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>•</span>
              Displaying a prominent notice on the Platform
            </li>
          </ul>
          <p style={styles.legalParagraph}>
            We encourage you to review this Privacy Policy periodically to stay informed about
            how we are protecting your information. Your continued use of the Platform after any
            changes to this Privacy Policy constitutes your acceptance of those changes.
          </p>
        </div>

        {/* Section 10: Contact Us */}
        <div style={styles.legalSection}>
          <h2 style={styles.legalSectionTitle}>
            <span style={styles.legalSectionNumber}>10</span>
            Contact Us
          </h2>
          <p style={styles.legalParagraph}>
            If you have any questions, concerns, or requests regarding this Privacy Policy or
            our data practices, please contact us:
          </p>
          <ul style={styles.legalList}>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>📧</span>
              Email: <strong>{SUPPORT_EMAIL}</strong>
            </li>
            <li style={styles.legalListItem}>
              <span style={styles.legalListBullet}>📍</span>
              Address: {SPONSOR_ADDRESS}
            </li>
          </ul>
          <p style={styles.legalParagraph}>
            We aim to respond to all privacy-related inquiries within 30 days.
          </p>
        </div>

        {/* Related Legal Documents */}
        <div style={styles.legalHighlight}>
          <div style={styles.legalHighlightTitle}>📋 Related Legal Documents</div>
          <p style={styles.legalHighlightText}>
            This Privacy Policy should be read in conjunction with our other legal documents:<br /><br />
            • <span style={styles.legalLink} onClick={() => onNavigate("rules")}>Official Sweepstakes Rules</span> — Rules governing our sweepstakes promotion<br />
            • <span style={styles.legalLink} onClick={() => onNavigate("terms")}>Terms and Conditions</span> — Terms governing your use of the Platform
          </p>
        </div>

        {/* Contact Box */}
        <div style={styles.legalContactBox}>
          <div style={styles.legalContactTitle}>📧 Privacy Questions?</div>
          <p style={styles.legalContactText}>
            Our team is here to help with any privacy-related questions or concerns.
            Contact us at <strong>{SUPPORT_EMAIL}</strong> and we will respond promptly.
          </p>
        </div>
      </main>

      {/* Simple Footer */}
      <footer style={{ ...styles.footer, padding: "24px" }}>
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>
          © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// =============================================================================
// Main App Component with Routing
// =============================================================================
function DAMFortunesCasinoApp(): React.ReactElement {
  const [currentPage, setCurrentPage] = useState<PageType>("home");

  // Handle URL-based routing on mount and popstate
  useEffect(() => {
    const handleRouting = (): void => {
      const path = window.location.pathname;
      if (path === "/rules") {
        setCurrentPage("rules");
      } else if (path === "/terms") {
        setCurrentPage("terms");
      } else if (path === "/privacy") {
        setCurrentPage("privacy");
      } else {
        setCurrentPage("home");
      }
    };

    handleRouting();
    window.addEventListener("popstate", handleRouting);
    return () => window.removeEventListener("popstate", handleRouting);
  }, []);

  const navigateTo = (page: PageType): void => {
    setCurrentPage(page);
    const newPath = page === "home" ? "/" : `/${page}`;
    window.history.pushState({}, "", newPath);
    window.scrollTo(0, 0);
  };

  // Render based on current page
  if (currentPage === "rules") {
    return <OfficialRulesPage onNavigate={navigateTo} />;
  }
  if (currentPage === "terms") {
    return <TermsAndConditionsPage onNavigate={navigateTo} />;
  }
  if (currentPage === "privacy") {
    return <PrivacyPolicyPage onNavigate={navigateTo} />;
  }

  // Home page (landing page)
  return <LandingPageContent onNavigate={navigateTo} />;
}

// =============================================================================
// Landing Page Content Component
// =============================================================================
function LandingPageContent({ onNavigate }: LegalPageProps): React.ReactElement {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const handlePlayNow = (): void => {
    window.location.href = APP_URL;
  };

  return (
    <div style={styles.container}>
      {/* Google Fonts & Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          padding: 0;
          background: #0a0a0a;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
          40% { transform: translateX(-50%) translateY(-10px); }
          60% { transform: translateX(-50%) translateY(-5px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .primary-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 40px rgba(212, 175, 55, 0.45) !important;
        }

        .game-card:hover {
          transform: translateY(-5px);
          border-color: rgba(212, 175, 55, 0.3) !important;
          background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%) !important;
        }

        .step-card:hover {
          transform: translateY(-3px);
          border-color: rgba(212, 175, 55, 0.2) !important;
        }

        .footer-link:hover {
          color: #ffffff !important;
        }

        .currency-card:hover {
          transform: translateY(-5px);
        }

        @media (max-width: 768px) {
          .hero-buttons {
            flex-direction: column !important;
            width: 100%;
          }
          .cta-features {
            flex-direction: column;
            gap: 16px !important;
          }
        }
      `}</style>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <video
          style={styles.heroVideo}
          src={HERO_VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
        />
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <span>⭐</span>
            <span>Sweepstakes Gaming Platform</span>
          </div>
          <h1 style={styles.heroTitle}>
            Play{" "}
            <span style={styles.heroTitleGold}>FREE</span>.
            <br />
            Win Real Prizes.
          </h1>
          <p style={styles.heroSubtitle}>
            Experience the thrill of casino-style entertainment with our dual currency system.
            Collect Gold Coins for fun and Sweeps Coins redeemable for real prizes — all with no purchase necessary.
          </p>
          <div style={styles.heroButtons} className="hero-buttons">
            <button
              className="primary-btn"
              style={{
                ...styles.primaryButton,
                transform: hoveredButton === "hero" ? "translateY(-3px) scale(1.02)" : "none",
              }}
              onMouseEnter={() => setHoveredButton("hero")}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={handlePlayNow}
              data-section="hero-cta"
            >
              Claim Your Free Coins
            </button>
            <div style={styles.noPurchaseBadge}>
              <span style={{ color: ACCENT_EMERALD }}>✓</span>
              <span>No Purchase Necessary to Play or Win</span>
            </div>
          </div>
        </div>
        <div style={styles.scrollIndicator}>
          <span>Scroll to learn more</span>
          <span style={{ fontSize: "1.2rem" }}>↓</span>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={styles.howItWorksSection}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <p style={styles.sectionSubtitle}>
            Getting started is simple, free, and takes less than a minute.
            No credit card required — ever.
          </p>
          <div style={styles.stepsContainer}>
            {steps.map((step) => (
              <div key={step.number} className="step-card" style={styles.stepCard}>
                <div style={styles.stepNumber}>{step.number}</div>
                <div style={styles.stepIcon}>{step.icon}</div>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepDesc}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Currency Explainer Section */}
      <section style={styles.currencySection}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={styles.sectionTitle}>Two Ways to Play</h2>
          <p style={styles.sectionSubtitle}>
            Our sweepstakes platform uses a dual currency system that keeps gameplay fun
            and gives you real chances to win prizes — all while staying 100% legal.
          </p>
          <div style={styles.currencyGrid}>
            {/* Gold Coins Card */}
            <div className="currency-card" style={{ ...styles.currencyCard, ...styles.currencyCardGold }}>
              <div style={{ ...styles.currencyIconWrapper, ...styles.goldCoinBg }}>
                🪙
              </div>
              <h3 style={styles.currencyTitle}>Gold Coins</h3>
              <p style={{ ...styles.currencyTagline, ...styles.currencyTaglineGold }}>
                Play for Fun
              </p>
              <p style={styles.currencyDesc}>
                Your free entertainment currency. Use Gold Coins on any game for pure fun
                — no purchase necessary.
              </p>
              <div style={styles.currencyBullets}>
                <div style={styles.currencyBullet}>
                  <span style={{ ...styles.bulletIcon, color: ACCENT_GOLD }}>✓</span>
                  <span>Free daily login bonuses</span>
                </div>
                <div style={styles.currencyBullet}>
                  <span style={{ ...styles.bulletIcon, color: ACCENT_GOLD }}>✓</span>
                  <span>For entertainment purposes only</span>
                </div>
                <div style={styles.currencyBullet}>
                  <span style={{ ...styles.bulletIcon, color: ACCENT_GOLD }}>✓</span>
                  <span>No cash value — just fun</span>
                </div>
              </div>
            </div>

            {/* Sweeps Coins Card */}
            <div className="currency-card" style={{ ...styles.currencyCard, ...styles.currencyCardGreen }}>
              <div style={{ ...styles.currencyIconWrapper, ...styles.sweepsCoinBg }}>
                💎
              </div>
              <h3 style={styles.currencyTitle}>Sweeps Coins</h3>
              <p style={{ ...styles.currencyTagline, ...styles.currencyTaglineGreen }}>
                Win Real Prizes
              </p>
              <p style={styles.currencyDesc}>
                Our promotional currency that can be redeemed for real prizes and cash equivalents
                under official sweepstakes rules.
              </p>
              <div style={styles.currencyBullets}>
                <div style={styles.currencyBullet}>
                  <span style={{ ...styles.bulletIcon, color: ACCENT_EMERALD }}>✓</span>
                  <span>Earned through free entry methods</span>
                </div>
                <div style={styles.currencyBullet}>
                  <span style={{ ...styles.bulletIcon, color: ACCENT_EMERALD }}>✓</span>
                  <span>Redeemable for real prizes</span>
                </div>
                <div style={styles.currencyBullet}>
                  <span style={{ ...styles.bulletIcon, color: ACCENT_EMERALD }}>✓</span>
                  <span>Bonus with Gold Coin packages</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Games & Features Section */}
      <section style={styles.gamesSection}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={styles.sectionTitle}>Explore the Casino</h2>
          <p style={styles.sectionSubtitle}>
            From high-energy slots to laid-back social games, find your perfect spot
            in our virtual casino bar experience.
          </p>
          <div style={styles.gamesGrid}>
            {gameAreas.map((area, index) => (
              <div key={index} className="game-card" style={styles.gameCard}>
                <div style={styles.gameIcon}>{area.icon}</div>
                <h3 style={styles.gameTitle}>{area.title}</h3>
                <p style={styles.gameDesc}>{area.description}</p>
                <span style={styles.gameHighlight}>{area.highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Compliance Section */}
      <section style={styles.trustSection}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={styles.sectionTitle}>Play With Confidence</h2>
          <p style={styles.sectionSubtitle}>
            We operate as a fully compliant sweepstakes platform — not a gambling site.
            Your trust and safety are our top priorities.
          </p>
          <div style={styles.trustGrid}>
            {trustItems.map((item, index) => (
              <div key={index} style={styles.trustItem}>
                <div style={styles.trustIcon}>{item.icon}</div>
                <h4 style={styles.trustTitle}>{item.title}</h4>
                <p style={styles.trustDesc}>{item.description}</p>
              </div>
            ))}
          </div>
          <div style={styles.complianceBox}>
            <h3 style={styles.complianceTitle}>
              <span>✅</span>
              <span>This is NOT Gambling</span>
            </h3>
            <p style={styles.complianceText}>
              {BRAND_NAME} is a promotional sweepstakes platform. Gold Coins are for entertainment
              only and have no cash value. Sweeps Coins are promotional currency awarded as bonuses
              and through free entry methods — they are never sold directly. You can always participate
              for free with no purchase necessary. This model is legal in most U.S. states and follows
              the same structure as Chumba Casino, Pulsz, and other established sweepstakes platforms.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaGlow} />
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>
            Ready to Play?
          </h2>
          <p style={styles.ctaSubtitle}>
            Join thousands of players enjoying free casino-style entertainment every day.
            Your welcome bonus is waiting — no purchase required.
          </p>
          <div style={styles.ctaFeatures} className="cta-features">
            <div style={styles.ctaFeature}>
              <span style={styles.ctaFeatureIcon}>✓</span>
              <span>Free to Join</span>
            </div>
            <div style={styles.ctaFeature}>
              <span style={styles.ctaFeatureIcon}>✓</span>
              <span>Daily Coin Bonuses</span>
            </div>
            <div style={styles.ctaFeature}>
              <span style={styles.ctaFeatureIcon}>✓</span>
              <span>Real Prize Redemption</span>
            </div>
          </div>
          <button
            className="primary-btn"
            style={{
              ...styles.primaryButton,
              transform: hoveredButton === "cta" ? "translateY(-3px) scale(1.02)" : "none",
            }}
            onMouseEnter={() => setHoveredButton("cta")}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={handlePlayNow}
            data-section="final-cta"
          >
            Play Now — It&apos;s Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerTop}>
            <div style={styles.footerLogo}>{BRAND_NAME}</div>
            <div style={styles.footerTagline}>Easy play. Daily fortunes.</div>
          </div>

          <div style={styles.footerLinks}>
            <span
              className="footer-link"
              style={styles.footerLink}
              onClick={() => onNavigate("rules")}
            >
              Official Sweepstakes Rules
            </span>
            <span
              className="footer-link"
              style={styles.footerLink}
              onClick={() => onNavigate("terms")}
            >
              Terms of Service
            </span>
            <span
              className="footer-link"
              style={styles.footerLink}
              onClick={() => onNavigate("privacy")}
            >
              Privacy Policy
            </span>
            <span className="footer-link" style={styles.footerLink}>Responsible Play</span>
            <span className="footer-link" style={styles.footerLink}>Contact Us</span>
          </div>

          <div style={styles.footerDisclaimer}>
            <div style={styles.disclaimerTitle}>NO PURCHASE NECESSARY</div>
            <p style={styles.disclaimerText}>
              Free entry method available. Sweeps Coins can be obtained through promotional offers,
              daily bonuses, and free mail-in entries. Must be 21 years or older to participate.
              Void where prohibited by law. Gold Coins are for entertainment purposes only and have
              no cash value. Sweeps Coins may be redeemed for prizes subject to verification and
              compliance with official sweepstakes rules. This is a promotional sweepstakes platform,
              not a gambling site. See{" "}
              <span
                style={{ color: ACCENT_GOLD, textDecoration: "underline", cursor: "pointer" }}
                onClick={() => onNavigate("rules")}
              >
                Official Rules
              </span>{" "}
              for complete details.
            </p>
          </div>

          <div style={styles.footerBottom}>
            © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Mount the app to the DOM
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<DAMFortunesCasinoApp />);
}
