import React, { useState, useEffect } from 'react';
import { AlertCircle, Navigation } from 'lucide-react';
import { createRoot } from 'react-dom/client';

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

// === SECTION 1: IMPORTS AND TYPES ===

interface NavLink {
  label: string;
  href: string;
  dataSectionId: string;
}

interface Benefit {
  icon: string;
  title: string;
  description: string;
  dataTitleId: string;
  dataDescId: string;
}

interface Feature {
  id: string;
  badge: string;
  icon: string;
  title: string;
  description: string;
  dataTitleId: string;
  dataDescId: string;
}

interface FAQ {
  question: string;
  answer: string;
  dataQId: string;
  dataAId: string;
}

interface FooterLink {
  label: string;
  href: string;
  dataSectionId: string;
}

// === SECTION 2: CONSTANTS AND CONFIGURATION ===
const WORKSPACE_BRAND_NAME = 'DAM Fortunes Casino';
const WORKSPACE_PRIMARY_COLOR = '#3B82F6';
const WORKSPACE_CONTRAST_COLOR = '#FFFFFF';
const WORKSPACE_HIGHLIGHT_COLOR = '#8B5CF6';
const WORKSPACE_CTA_URL = 'https://dam-fortunes-675942.audoapps.com/os';
const WORKSPACE_FONT = 'Inter, system-ui, sans-serif';

const LEGAL_DISCLAIMER = 'NO PURCHASE NECESSARY to enter Sweepstakes. Void where prohibited by law. Must be 18+ (21+ in MA) and a legal resident of the United States or Canada (excluding Quebec). Sweepstakes Coins (SC) have no monetary value and cannot be purchased. Gold Coins (GC) are virtual currency used for entertainment purposes only. GC packages may include bonus SC. SC can be redeemed for real prizes at a rate determined by the operator. Standard data rates may apply. See Official Rules for complete details, eligibility requirements, and prize claim procedures.';

const RESPONSIBLE_PLAY_NOTICE = 'If you or someone you know has a gambling problem, call 1-800-GAMBLER (1-800-426-2537) or visit www.ncpgambling.org for help. Play responsibly. Set limits. This platform operates as a sweepstakes promotion and is NOT an online casino or gambling site.';

// === SECTION 3: STRUCTURED CONTENT DATA ===
const NAV_LINKS: NavLink[] = [
  { label: 'Features', href: '#features', dataSectionId: 'nav-1-label' },
  { label: 'How It Works', href: '#how', dataSectionId: 'nav-2-label' },
  { label: 'FAQ', href: '#faq', dataSectionId: 'nav-3-label' },
  { label: 'Legal', href: '#legal', dataSectionId: 'nav-4-label' },
];

const BENEFITS: Benefit[] = [
  {
    icon: '🎰',
    title: 'No Purchase Necessary',
    description: 'Claim free Sweepstakes Coins daily through mail-in entries, social media giveaways, and login bonuses. No payment ever required to participate.',
    dataTitleId: 'benefit-1-title',
    dataDescId: 'benefit-1-description',
  },
  {
    icon: '🛡️',
    title: '100% Legal & Compliant',
    description: 'Operates under sweepstakes law in eligible US states and Canadian provinces. Fully regulated with transparent Official Rules accessible at all times.',
    dataTitleId: 'benefit-2-title',
    dataDescId: 'benefit-2-description',
  },
  {
    icon: '🏆',
    title: 'Real Prize Redemption',
    description: 'Redeem Sweepstakes Coins for real prizes including gift cards, merchandise, and cash equivalents. All redemptions processed within standard timelines.',
    dataTitleId: 'benefit-3-title',
    dataDescId: 'benefit-3-description',
  },
  {
    icon: '🔒',
    title: 'Verified & Secure',
    description: 'Age verification, identity checks, and geo-fencing ensure only eligible participants can play. SSL encryption protects all personal data.',
    dataTitleId: 'benefit-4-title',
    dataDescId: 'benefit-4-description',
  },
];

const FEATURES: Feature[] = [
  {
    id: 'feature-1',
    badge: 'Step 1',
    icon: '📝',
    title: 'Create Your Free Account',
    description: 'Sign up with basic information. Age and location verification ensures you meet eligibility requirements. Must be 18+ (21+ in MA) and located in an eligible jurisdiction. No credit card required.',
    dataTitleId: 'feature-1-title',
    dataDescId: 'feature-1-description',
  },
  {
    id: 'feature-2',
    badge: 'Step 2',
    icon: '🎁',
    title: 'Claim Free Sweepstakes Coins',
    description: 'Receive complimentary Sweepstakes Coins (SC) through daily login bonuses, social media promotions, and free mail-in entry. Gold Coins for entertainment can also be obtained through optional promotional packages.',
    dataTitleId: 'feature-2-title',
    dataDescId: 'feature-2-description',
  },
  {
    id: 'feature-3',
    badge: 'Step 3',
    icon: '🎮',
    title: 'Play Casino-Style Games',
    description: 'Enjoy slots, table games, and more using your virtual currencies. All games use certified Random Number Generators (RNG) for fair outcomes. Games are for entertainment — outcomes with SC determine prize eligibility.',
    dataTitleId: 'feature-3-title',
    dataDescId: 'feature-3-description',
  },
  {
    id: 'feature-4',
    badge: 'Step 4',
    icon: '💰',
    title: 'Redeem SC for Real Prizes',
    description: 'Accumulated Sweepstakes Coins can be redeemed for real prizes once minimum thresholds are met. Standard verification and processing times apply. See Official Rules for complete redemption terms and conditions.',
    dataTitleId: 'feature-4-title',
    dataDescId: 'feature-4-description',
  },
];

const FAQS: FAQ[] = [
  {
    question: 'Is DAM Fortunes Casino a real money gambling site?',
    answer: 'No. DAM Fortunes Casino operates as a sweepstakes promotion, NOT a real-money online casino. You play using Gold Coins (for entertainment only) and Sweepstakes Coins (which can be redeemed for prizes). No purchase is necessary to obtain Sweepstakes Coins.',
    dataQId: 'faq-1-q',
    dataAId: 'faq-1-a',
  },
  {
    question: 'Is it legal to play on DAM Fortunes Casino?',
    answer: 'Yes, sweepstakes casinos operate legally in most US states and Canadian provinces under sweepstakes promotional law. However, residents of Washington state, Idaho, and Quebec are currently excluded. You must be 18+ (21+ in Massachusetts) to participate. Always check your local laws.',
    dataQId: 'faq-2-q',
    dataAId: 'faq-2-a',
  },
  {
    question: 'Do I need to purchase anything to play?',
    answer: 'Absolutely not. NO PURCHASE IS NECESSARY. You can receive free Sweepstakes Coins through daily login bonuses, social media giveaways, promotional events, and free mail-in entry methods. Optional Gold Coin packages are available for extended entertainment, which may include bonus Sweepstakes Coins.',
    dataQId: 'faq-3-q',
    dataAId: 'faq-3-a',
  },
  {
    question: 'How do I get free Sweepstakes Coins?',
    answer: 'Free SC can be obtained via: (1) Daily login bonus, (2) Social media promotions and contests, (3) Mail-in entry — send a handwritten request per the Official Rules, (4) Special promotional events. The mail-in method ensures the "no purchase necessary" requirement is always met.',
    dataQId: 'faq-4-q',
    dataAId: 'faq-4-a',
  },
  {
    question: 'What is the difference between Gold Coins and Sweepstakes Coins?',
    answer: 'Gold Coins (GC) are virtual currency used purely for entertainment — they have zero monetary value and cannot be redeemed for prizes. Sweepstakes Coins (SC) are the promotional currency that can be redeemed for real prizes once minimum redemption thresholds are met, subject to verification.',
    dataQId: 'faq-5-q',
    dataAId: 'faq-5-a',
  },
  {
    question: 'How do I redeem my Sweepstakes Coins?',
    answer: 'Once you have accumulated the minimum required SC (as outlined in the Official Rules), you can submit a redemption request. Identity verification (KYC) is required before any redemption. Processing times vary but are typically completed within 5-10 business days after verification.',
    dataQId: 'faq-6-q',
    dataAId: 'faq-6-a',
  },
  {
    question: 'What age do I need to be to play?',
    answer: 'You must be at least 18 years old in most jurisdictions, or 21 years old in Massachusetts. Age verification is conducted during registration and may be re-verified during the prize redemption process.',
    dataQId: 'faq-7-q',
    dataAId: 'faq-7-a',
  },
  {
    question: 'Is my personal information safe?',
    answer: 'Yes. We use industry-standard SSL encryption, secure data storage, and comply with applicable privacy laws. Your personal information is used solely for account management, eligibility verification, and prize fulfillment. See our Privacy Policy for complete details.',
    dataQId: 'faq-8-q',
    dataAId: 'faq-8-a',
  },
];

const FOOTER_LINKS: FooterLink[] = [
  { label: 'Official Rules', href: '#legal', dataSectionId: 'footer-link-1-label' },
  { label: 'Privacy Policy', href: '#legal', dataSectionId: 'footer-link-2-label' },
  { label: 'Terms of Service', href: '#legal', dataSectionId: 'footer-link-3-label' },
  { label: 'Responsible Play', href: '#legal', dataSectionId: 'footer-link-4-label' },
  { label: 'Contact Us', href: '#legal', dataSectionId: 'footer-link-5-label' },
];

// === SECTION 4: NAVIGATION SECTION ===
const Navigation: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div
        className="fixed top-0 left-0 h-[3px] z-[60]"
        style={{ width: `${scrollProgress * 100}%`, backgroundColor: WORKSPACE_HIGHLIGHT_COLOR }}
      />
      <header className="fixed top-0 inset-x-0 z-50">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-4 mb-3 rounded-2xl border border-white/10 shadow-lg" style={{ backdropFilter: 'blur(12px)', background: 'rgba(15, 15, 30, 0.85)' }}>
            <div className="flex items-center justify-between px-4 py-3">
              <a href="#" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg" style={{ backgroundColor: WORKSPACE_PRIMARY_COLOR, color: WORKSPACE_CONTRAST_COLOR }}>
                  D
                </div>
                <span className="text-xl font-bold tracking-tight" style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}>
                  {WORKSPACE_BRAND_NAME}
                </span>
              </a>
              <div className="hidden md:flex items-center gap-6">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.dataSectionId}
                    href={link.href}
                    data-section={link.dataSectionId}
                    className="text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: 'rgba(255,255,255,0.8)', fontFamily: WORKSPACE_FONT }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={WORKSPACE_CTA_URL}
                  data-section="cta-nav"
                  className="hidden md:inline-flex px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 shadow-lg"
                  style={{ backgroundColor: WORKSPACE_PRIMARY_COLOR, color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
                >
                  Play Free Now
                </a>
                <button
                  className="md:hidden p-2 rounded-lg"
                  style={{ color: WORKSPACE_CONTRAST_COLOR }}
                  onClick={() => setMobileOpen(!mobileOpen)}
                  aria-label="Toggle menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
            {mobileOpen && (
              <div className="md:hidden px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.dataSectionId}
                    href={link.href}
                    className="block text-sm font-medium py-2"
                    style={{ color: 'rgba(255,255,255,0.8)', fontFamily: WORKSPACE_FONT }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href={WORKSPACE_CTA_URL}
                  className="block text-center px-5 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: WORKSPACE_PRIMARY_COLOR, color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
                >
                  Play Free Now
                </a>
              </div>
            )}
          </div>
        </nav>
      </header>
    </>
  );
};

// === SECTION 5: HERO SECTION ===
const HeroSection: React.FC = () => {
  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden" style={{ background: `linear-gradient(135deg, #0f0f1e 0%, #1a1a3e 50%, #0f0f1e 100%)` }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ backgroundColor: WORKSPACE_PRIMARY_COLOR }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ backgroundColor: WORKSPACE_HIGHLIGHT_COLOR }} />
      </div>
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="reveal">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 mb-8" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <span className="text-green-400 text-sm">✓</span>
            <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: WORKSPACE_FONT }}>
              Legal Sweepstakes Casino • No Purchase Necessary • 18+
            </span>
          </div>
        </div>
        <div className="reveal">
          <h1
            data-section="hero-title"
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight"
            style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
          >
            Free-to-Play Casino Games.{' '}
            <span style={{ color: WORKSPACE_HIGHLIGHT_COLOR }}>Real Prizes.</span>
          </h1>
        </div>
        <div className="reveal">
          <p
            data-section="hero-subtitle"
            className="text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.7)', fontFamily: WORKSPACE_FONT }}
          >
            {WORKSPACE_BRAND_NAME} is a 100% legal sweepstakes casino. Play your favorite casino-style games with free Sweepstakes Coins — no purchase ever required. Redeem SC for real prizes. Available in most US states & Canadian provinces.
          </p>
        </div>
        <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <a
            href={WORKSPACE_CTA_URL}
            data-section="cta-primary"
            className="px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 shadow-2xl"
            style={{ backgroundColor: WORKSPACE_PRIMARY_COLOR, color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT, boxShadow: `0 0 40px ${WORKSPACE_PRIMARY_COLOR}40` }}
          >
            🎰 Claim Free Coins Now
          </a>
          <a
            href="#how"
            data-section="cta-secondary"
            className="px-8 py-4 rounded-xl text-lg font-bold border border-white/20 transition-all hover:bg-white/5"
            style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
          >
            How It Works →
          </a>
        </div>
        <div className="reveal">
          <div className="inline-flex flex-wrap items-center justify-center gap-4 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: WORKSPACE_FONT }}>
            <span className="flex items-center gap-1">🔒 SSL Encrypted</span>
            <span>•</span>
            <span className="flex items-center gap-1">✓ RNG Certified</span>
            <span>•</span>
            <span className="flex items-center gap-1">🛡️ Sweepstakes Compliant</span>
            <span>•</span>
            <span className="flex items-center gap-1">18+ Only</span>
          </div>
        </div>
        <div className="reveal mt-8 p-4 rounded-xl border border-yellow-500/30 max-w-2xl mx-auto" style={{ background: 'rgba(234, 179, 8, 0.08)' }}>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: WORKSPACE_FONT }}>
            ⚠️ <strong style={{ color: 'rgba(255,255,255,0.8)' }}>IMPORTANT:</strong> This is a sweepstakes promotion, NOT an online gambling site. No purchase necessary. Void where prohibited. Must be 18+ (21+ in MA). Not available in WA, ID, or Quebec. See Official Rules.
          </p>
        </div>
      </div>
    </section>
  );
};

// === SECTION 6: SOCIAL PROOF SECTION ===
const SocialProofSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28" style={{ background: '#0a0a1a' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal text-center mb-16">
          <h2
            data-section="benefits-title"
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
          >
            Why Players Trust {WORKSPACE_BRAND_NAME}
          </h2>
          <p
            data-section="benefits-subtitle"
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.6)', fontFamily: WORKSPACE_FONT }}
          >
            Built from the ground up for legal compliance, player safety, and genuine entertainment value.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BENEFITS.map((benefit, index) => (
            <div
              key={benefit.dataTitleId}
              className="reveal rounded-2xl p-8 border border-white/5 transition-all hover:border-white/10"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <span className="text-4xl mb-5 block">{benefit.icon}</span>
              <h3
                data-section={benefit.dataTitleId}
                className="text-xl font-bold mb-3"
                style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
              >
                {benefit.title}
              </h3>
              <p
                data-section={benefit.dataDescId}
                className="text-sm leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.6)', fontFamily: WORKSPACE_FONT }}
              >
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
        <div className="reveal mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '200+', label: 'Casino-Style Games' },
            { value: '50K+', label: 'Active Players' },
            { value: '24/7', label: 'Customer Support' },
            { value: '100%', label: 'Legal & Compliant' },
          ].map((stat) => (
            <div key={stat.label} className="p-4">
              <div className="text-3xl font-extrabold mb-1" style={{ color: WORKSPACE_HIGHLIGHT_COLOR, fontFamily: WORKSPACE_FONT }}>
                {stat.value}
              </div>
              <div className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: WORKSPACE_FONT }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// === SECTION 7: FEATURES SECTION ===
const FeaturesSection: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState('feature-1');

  useEffect(() => {
    const wrappers = Array.from(document.querySelectorAll('[data-feature-id]')) as HTMLElement[];
    if (wrappers.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-feature-id');
            if (id) setActiveFeature(id);
          }
        });
      },
      { threshold: 0.6 }
    );
    wrappers.forEach((w) => io.observe(w));
    return () => io.disconnect();
  }, []);

  return (
    <section id="features" className="relative py-24" style={{ background: '#0f0f1e' }}>
      <div id="how" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="sticky top-24 z-10 mb-16 pb-8 text-center" style={{ background: 'rgba(15,15,30,0.95)', backdropFilter: 'blur(8px)' }}>
          <div className="reveal">
            <h2
              data-section="features-heading"
              className="text-4xl md:text-5xl font-bold mb-3"
              style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
            >
              How It Works
            </h2>
            <p
              data-section="features-subheading"
              className="text-lg"
              style={{ color: 'rgba(255,255,255,0.5)', fontFamily: WORKSPACE_FONT }}
            >
              Four simple steps to start playing. Scroll through the walkthrough below.
            </p>
          </div>
        </div>

        {FEATURES.map((feat) => (
          <div
            key={feat.id}
            id={`wrap-${feat.id}`}
            data-feature-id={feat.id}
            className="min-h-[60vh] flex items-center justify-center mb-32 last:mb-0"
          >
            <a
              href={WORKSPACE_CTA_URL}
              className="w-full max-w-2xl mx-auto group cursor-pointer block"
            >
              <div
                className="rounded-3xl border-2 p-8 md:p-12 shadow-sm hover:shadow-md transition-all"
                style={{
                  borderColor: activeFeature === feat.id ? `${WORKSPACE_HIGHLIGHT_COLOR}40` : 'rgba(255,255,255,0.08)',
                  background: activeFeature === feat.id ? 'rgba(139,92,246,0.05)' : 'rgba(255,255,255,0.02)',
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="text-sm font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${WORKSPACE_HIGHLIGHT_COLOR}20`, color: WORKSPACE_HIGHLIGHT_COLOR, fontFamily: WORKSPACE_FONT }}
                  >
                    {feat.badge}
                  </span>
                  <span className="text-2xl">{feat.icon}</span>
                </div>

                <h3
                  data-section={feat.dataTitleId}
                  className="text-2xl md:text-3xl font-bold mb-4"
                  style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
                >
                  {feat.title}
                </h3>

                <p
                  data-section={feat.dataDescId}
                  className="text-base md:text-lg mb-6 leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.6)', fontFamily: WORKSPACE_FONT }}
                >
                  {feat.description}
                </p>

                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium group-hover:gap-3 transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
                >
                  Tap to try <span>→</span>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

// === SECTION 8: FAQ SECTION ===
const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 md:py-28" style={{ background: '#0a0a1a' }}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="reveal text-center mb-16">
          <h2
            data-section="faq-heading"
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
          >
            Frequently Asked Questions
          </h2>
          <p
            data-section="faq-subheading"
            className="text-lg"
            style={{ color: 'rgba(255,255,255,0.5)', fontFamily: WORKSPACE_FONT }}
          >
            Everything you need to know about playing legally at {WORKSPACE_BRAND_NAME}.
          </p>
        </div>
        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div
              key={faq.dataQId}
              className="reveal rounded-2xl border border-white/5 overflow-hidden transition-all"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span
                  data-section={faq.dataQId}
                  className="text-base font-semibold pr-4"
                  style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
                >
                  {faq.question}
                </span>
                <span
                  className="text-2xl flex-shrink-0 transition-transform duration-300"
                  style={{ color: WORKSPACE_HIGHLIGHT_COLOR, transform: openIndex === index ? 'rotate(45deg)' : 'rotate(0deg)' }}
                >
                  +
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p
                    data-section={faq.dataAId}
                    className="text-sm leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.6)', fontFamily: WORKSPACE_FONT }}
                  >
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// === SECTION 9: FINAL CTA AND FOOTER ===
const FinalCTASection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${WORKSPACE_PRIMARY_COLOR}15 0%, ${WORKSPACE_HIGHLIGHT_COLOR}15 100%)`, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10" style={{ backgroundColor: WORKSPACE_PRIMARY_COLOR }} />
      </div>
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="reveal">
          <h2
            data-section="final-cta-title"
            className="text-3xl md:text-5xl font-extrabold mb-6"
            style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
          >
            Ready to Play? It's 100% Free.
          </h2>
        </div>
        <div className="reveal">
          <p
            data-section="final-cta-subtitle"
            className="text-lg mb-10 max-w-xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.6)', fontFamily: WORKSPACE_FONT }}
          >
            Join thousands of players enjoying legal, sweepstakes-based casino entertainment. Claim your free Sweepstakes Coins today — no purchase necessary, ever.
          </p>
        </div>
        <div className="reveal">
          <a
            href={WORKSPACE_CTA_URL}
            data-section="cta-final"
            className="inline-flex px-10 py-5 rounded-xl text-lg font-bold transition-all hover:scale-105 shadow-2xl"
            style={{ backgroundColor: WORKSPACE_PRIMARY_COLOR, color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT, boxShadow: `0 0 50px ${WORKSPACE_PRIMARY_COLOR}50` }}
          >
            🎰 Start Playing Free
          </a>
        </div>
        <div className="reveal mt-8">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: WORKSPACE_FONT }}>
            No purchase necessary • 18+ (21+ in MA) • Void where prohibited • See Official Rules
          </p>
        </div>
      </div>
    </section>
  );
};

const LegalSection: React.FC = () => {
  return (
    <section id="legal" className="py-16 md:py-20" style={{ background: '#060612' }}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="reveal">
          <h2
            data-section="legal-heading"
            className="text-2xl md:text-3xl font-bold mb-8 text-center"
            style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
          >
            Legal Disclosures & Responsible Play
          </h2>
        </div>

        <div className="reveal space-y-6">
          <div className="rounded-2xl border border-yellow-500/20 p-6" style={{ background: 'rgba(234, 179, 8, 0.05)' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#EAB308', fontFamily: WORKSPACE_FONT }}>
              ⚠️ Sweepstakes Disclaimer
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: WORKSPACE_FONT }}>
              {LEGAL_DISCLAIMER}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 p-6" style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#EF4444', fontFamily: WORKSPACE_FONT }}>
              🆘 Responsible Play & Problem Gambling Help
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: WORKSPACE_FONT }}>
              {RESPONSIBLE_PLAY_NOTICE}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: WORKSPACE_FONT }}>
              📋 Eligibility Requirements
            </h3>
            <ul className="text-xs leading-relaxed space-y-2" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: WORKSPACE_FONT }}>
              <li>• Must be 18 years or older (21+ in Massachusetts)</li>
              <li>• Must be a legal resident of the United States (excluding WA, ID) or Canada (excluding Quebec)</li>
              <li>• Must complete age and identity verification</li>
              <li>• Employees, officers, and immediate family of {WORKSPACE_BRAND_NAME} and affiliated companies are ineligible</li>
              <li>• Void where prohibited or restricted by law</li>
              <li>• Subject to all applicable federal, state, provincial, and local laws</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-blue-500/20 p-6" style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: WORKSPACE_PRIMARY_COLOR, fontFamily: WORKSPACE_FONT }}>
              🔐 Player Protection Measures
            </h3>
            <ul className="text-xs leading-relaxed space-y-2" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: WORKSPACE_FONT }}>
              <li>• Self-exclusion options available at any time</li>
              <li>• Session time reminders and activity limits</li>
              <li>• Cooling-off periods upon request</li>
              <li>• Account closure available immediately</li>
              <li>• Age verification via third-party services</li>
              <li>• Geo-fencing technology to block ineligible jurisdictions</li>
              <li>• All game outcomes determined by certified Random Number Generators (RNG)</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: WORKSPACE_FONT }}>
              📬 Alternative Method of Entry (AMOE)
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: WORKSPACE_FONT }}>
              To receive free Sweepstakes Coins without any purchase, you may send a handwritten request on a 3"x5" card including your full name, registered email address, and a statement requesting Sweepstakes Coins. Mail to the address listed in the Official Rules. Limit of one request per envelope, one envelope per day. Standard USPS postage required. See Official Rules for complete AMOE details and current mailing address.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="py-12 border-t border-white/5" style={{ background: '#050510' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ backgroundColor: WORKSPACE_PRIMARY_COLOR, color: WORKSPACE_CONTRAST_COLOR }}>
              D
            </div>
            <span className="text-lg font-bold" style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}>
              {WORKSPACE_BRAND_NAME}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.dataSectionId}
                href={link.href}
                data-section={link.dataSectionId}
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: 'rgba(255,255,255,0.5)', fontFamily: WORKSPACE_FONT }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 space-y-4">
          <p
            data-section="footer-tagline"
            className="text-xs leading-relaxed text-center max-w-3xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.35)', fontFamily: WORKSPACE_FONT }}
          >
            {WORKSPACE_BRAND_NAME} is a sweepstakes promotional platform. No purchase is necessary to participate. Gold Coins have no monetary value. Sweepstakes Coins can be redeemed for prizes subject to the Official Rules. This is NOT an online gambling site. Must be 18+ (21+ in MA). Void where prohibited. Not available in Washington, Idaho, or Quebec.
          </p>
          <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: WORKSPACE_FONT }}>
            If you or someone you know has a gambling problem, call 1-800-GAMBLER or visit ncpgambling.org
          </p>
          <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: WORKSPACE_FONT }}>
            © {new Date().getFullYear()} {WORKSPACE_BRAND_NAME}. All rights reserved. | 18+ | Play Responsibly
          </p>
        </div>
      </div>
    </footer>
  );
};

// === SECTION 10: MAIN COMPONENT AND ROOT RENDER ===
const LandingPage: React.FC = () => {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('reveal-visible');
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-full overflow-y-auto" style={{ fontFamily: WORKSPACE_FONT, background: '#0f0f1e' }}>
      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }
        html {
          scroll-behavior: smooth;
        }
        * {
          -webkit-font-smoothing: antialiased;
        }
      `}</style>
      <Navigation />
      <HeroSection />
      <SocialProofSection />
      <FeaturesSection />
      <FAQSection />
      <FinalCTASection />
      <LegalSection />
      <Footer />
    </div>
  );
};

export default LandingPage;

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<LandingPage />);