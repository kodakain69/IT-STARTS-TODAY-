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
const WORKSPACE_BRAND_NAME = "DAM Fortunes Casino";
const WORKSPACE_PRIMARY_COLOR = "#3B82F6";
const WORKSPACE_CONTRAST_COLOR = "#FFFFFF";
const WORKSPACE_HIGHLIGHT_COLOR = "#8B5CF6";
const WORKSPACE_CTA_URL = "https://dam-fortunes-675942.audoapps.com/os";
const WORKSPACE_FONT = "Inter";

// === SECTION 3: STRUCTURED CONTENT DATA ===
const NAV_LINKS: NavLink[] = [
  { label: "Features", href: "#features", dataSectionId: "nav-1-label" },
  { label: "How it Works", href: "#how", dataSectionId: "nav-2-label" },
  { label: "FAQ", href: "#faq", dataSectionId: "nav-3-label" },
];

const BENEFITS: Benefit[] = [
  {
    icon: "🎰",
    title: "500+ Premium Games",
    description: "From classic slots to live dealer tables, experience a world-class gaming library curated for every type of player.",
    dataTitleId: "benefit-1-title",
    dataDescId: "benefit-1-description",
  },
  {
    icon: "⚡",
    title: "Instant Payouts",
    description: "No waiting around. Withdraw your winnings instantly with our lightning-fast payout processing system.",
    dataTitleId: "benefit-2-title",
    dataDescId: "benefit-2-description",
  },
  {
    icon: "🛡️",
    title: "Fully Licensed & Secure",
    description: "Play with confidence knowing every game is provably fair and your data is protected with bank-grade encryption.",
    dataTitleId: "benefit-3-title",
    dataDescId: "benefit-3-description",
  },
  {
    icon: "🎁",
    title: "Generous Welcome Bonus",
    description: "Start your journey with an incredible welcome package designed to maximize your first plays at the tables.",
    dataTitleId: "benefit-4-title",
    dataDescId: "benefit-4-description",
  },
];

const FEATURES: Feature[] = [
  {
    id: "feature-1",
    badge: "Step 1",
    icon: "📝",
    title: "Create Your Account",
    description: "Sign up in under 60 seconds. No lengthy forms, no hassle — just a quick registration and you're ready to explore the full casino experience.",
    dataTitleId: "feature-1-title",
    dataDescId: "feature-1-description",
  },
  {
    id: "feature-2",
    badge: "Step 2",
    icon: "💰",
    title: "Make Your First Deposit",
    description: "Choose from a wide range of payment methods including crypto, cards, and e-wallets. Your deposit is processed instantly so you can start playing right away.",
    dataTitleId: "feature-2-title",
    dataDescId: "feature-2-description",
  },
  {
    id: "feature-3",
    badge: "Step 3",
    icon: "🎲",
    title: "Pick Your Game",
    description: "Browse our massive library of slots, table games, and live dealer experiences. Filter by category, provider, or popularity to find your perfect match.",
    dataTitleId: "feature-3-title",
    dataDescId: "feature-3-description",
  },
  {
    id: "feature-4",
    badge: "Step 4",
    icon: "🏆",
    title: "Win & Withdraw Instantly",
    description: "Hit it big and cash out immediately. Our instant withdrawal system means your winnings are in your wallet faster than anywhere else.",
    dataTitleId: "feature-4-title",
    dataDescId: "feature-4-description",
  },
];

const FAQS: FAQ[] = [
  {
    question: "Is DAM Fortunes Casino fully licensed?",
    answer: "Yes, we operate under a fully regulated gaming license. All games are independently audited for fairness, and we maintain strict compliance with international gambling regulations.",
    dataQId: "faq-1-q",
    dataAId: "faq-1-a",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept major credit and debit cards, popular e-wallets like Skrill and Neteller, bank transfers, and a range of cryptocurrencies including Bitcoin and Ethereum.",
    dataQId: "faq-2-q",
    dataAId: "faq-2-a",
  },
  {
    question: "How fast are withdrawals processed?",
    answer: "Most withdrawals are processed within minutes. Depending on your chosen payment method, funds typically appear in your account within 1-24 hours.",
    dataQId: "faq-3-q",
    dataAId: "faq-3-a",
  },
  {
    question: "Can I play on my mobile device?",
    answer: "Absolutely! Our platform is fully optimized for mobile browsers. Enjoy the complete casino experience on your smartphone or tablet — no app download required.",
    dataQId: "faq-4-q",
    dataAId: "faq-4-a",
  },
  {
    question: "What is the welcome bonus?",
    answer: "New players receive a generous welcome package that includes deposit match bonuses and free spins. Check our promotions page for the latest offers after signing up.",
    dataQId: "faq-5-q",
    dataAId: "faq-5-a",
  },
];

const FOOTER_LINKS: FooterLink[] = [
  { label: "Terms & Conditions", href: "#", dataSectionId: "footer-link-1-label" },
  { label: "Privacy Policy", href: "#", dataSectionId: "footer-link-2-label" },
  { label: "Responsible Gaming", href: "#", dataSectionId: "footer-link-3-label" },
  { label: "Support", href: "#", dataSectionId: "footer-link-4-label" },
];

// === SECTION 4: NAVIGATION SECTION ===
const Navigation: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div
        className="fixed top-0 left-0 h-[3px] z-[60]"
        style={{ width: `${scrollProgress * 100}%`, backgroundColor: WORKSPACE_HIGHLIGHT_COLOR }}
      />
      <header className="fixed top-0 inset-x-0 z-50">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="mt-4 mb-3 rounded-2xl border border-white/10 shadow-lg"
            style={{ backdropFilter: 'blur(12px)', background: 'rgba(15, 15, 30, 0.85)' }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <a href="#" className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg"
                  style={{ backgroundColor: WORKSPACE_PRIMARY_COLOR, color: WORKSPACE_CONTRAST_COLOR }}
                >
                  D
                </div>
                <span
                  className="text-xl font-bold tracking-tight"
                  style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
                  data-section="nav-brand"
                >
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
                    style={{ color: 'rgba(255,255,255,0.75)', fontFamily: WORKSPACE_FONT }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={WORKSPACE_CTA_URL}
                  data-section="cta-primary"
                  className="hidden md:inline-flex px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg"
                  style={{
                    backgroundColor: WORKSPACE_PRIMARY_COLOR,
                    color: WORKSPACE_CONTRAST_COLOR,
                    fontFamily: WORKSPACE_FONT,
                  }}
                >
                  Get Started
                </a>
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-2 rounded-lg"
                  style={{ color: WORKSPACE_CONTRAST_COLOR }}
                >
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    {mobileOpen ? (
                      <>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </>
                    ) : (
                      <>
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>
            {mobileOpen && (
              <div className="md:hidden px-4 pb-4 border-t border-white/10">
                <div className="flex flex-col gap-3 pt-3">
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link.dataSectionId}
                      href={link.href}
                      data-section={link.dataSectionId}
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-medium py-2"
                      style={{ color: 'rgba(255,255,255,0.75)', fontFamily: WORKSPACE_FONT }}
                    >
                      {link.label}
                    </a>
                  ))}
                  <a
                    href={WORKSPACE_CTA_URL}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-center mt-1"
                    style={{
                      backgroundColor: WORKSPACE_PRIMARY_COLOR,
                      color: WORKSPACE_CONTRAST_COLOR,
                      fontFamily: WORKSPACE_FONT,
                    }}
                  >
                    Get Started
                  </a>
                </div>
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
    <section
      id="hero"
      className="relative pt-32 pb-24 md:pt-44 md:pb-36 overflow-hidden"
      style={{ background: `linear-gradient(160deg, #0a0a1a 0%, #111133 40%, #0f0f2e 100%)` }}
    >
      {/* Decorative elements */}
      <div
        className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: WORKSPACE_PRIMARY_COLOR }}
      />
      <div
        className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
        style={{ background: WORKSPACE_HIGHLIGHT_COLOR }}
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="reveal">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
            style={{
              background: 'rgba(139, 92, 246, 0.15)',
              color: WORKSPACE_HIGHLIGHT_COLOR,
              border: '1px solid rgba(139, 92, 246, 0.3)',
              fontFamily: WORKSPACE_FONT,
            }}
          >
            🎰 The #1 Online Casino Experience
          </div>
        </div>

        <h1
          className="reveal text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] mb-6"
          style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
          data-section="hero-title"
        >
          Your Fortune{' '}
          <span
            style={{
              background: `linear-gradient(135deg, ${WORKSPACE_PRIMARY_COLOR}, ${WORKSPACE_HIGHLIGHT_COLOR})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Awaits
          </span>
        </h1>

        <p
          className="reveal text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.65)', fontFamily: WORKSPACE_FONT }}
          data-section="hero-subtitle"
        >
          Experience world-class gaming with 500+ premium slots, live dealer tables, and instant payouts.
          Fully licensed, provably fair, and designed for winners.
        </p>

        <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={WORKSPACE_CTA_URL}
            data-section="hero-cta-primary"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-bold transition-all hover:scale-105 hover:shadow-2xl"
            style={{
              backgroundColor: WORKSPACE_PRIMARY_COLOR,
              color: WORKSPACE_CONTRAST_COLOR,
              fontFamily: WORKSPACE_FONT,
              boxShadow: `0 0 40px ${WORKSPACE_PRIMARY_COLOR}44`,
            }}
          >
            Start Playing Now
            <span className="text-xl">→</span>
          </a>
          <a
            href="#features"
            data-section="hero-cta-secondary"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-medium transition-all hover:bg-white/10"
            style={{
              color: WORKSPACE_CONTRAST_COLOR,
              fontFamily: WORKSPACE_FONT,
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            See How It Works
          </a>
        </div>

        {/* Stats bar */}
        <div className="reveal mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: '500+', label: 'Games' },
            { value: '50K+', label: 'Active Players' },
            { value: '<1min', label: 'Avg. Payout' },
            { value: '24/7', label: 'Live Support' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div
                className="text-2xl md:text-3xl font-bold"
                style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
              >
                {stat.value}
              </div>
              <div
                className="text-sm mt-1"
                style={{ color: 'rgba(255,255,255,0.5)', fontFamily: WORKSPACE_FONT }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// === SECTION 6: SOCIAL PROOF SECTION ===
const SocialProofSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28" style={{ background: '#0d0d24' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal text-center mb-16">
          <h2
            className="text-3xl md:text-5xl font-bold mb-4"
            style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
            data-section="social-proof-title"
          >
            Why Players Choose{' '}
            <span style={{ color: WORKSPACE_HIGHLIGHT_COLOR }}>{WORKSPACE_BRAND_NAME}</span>
          </h2>
          <p
            className="text-lg max-w-xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.55)', fontFamily: WORKSPACE_FONT }}
            data-section="social-proof-subtitle"
          >
            Everything you need for an unmatched gaming experience, all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BENEFITS.map((benefit, idx) => (
            <div
              key={idx}
              className="reveal rounded-2xl p-8 border transition-all hover:border-white/20 hover:shadow-lg group"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <div className="text-4xl mb-5">{benefit.icon}</div>
              <h3
                className="text-xl font-bold mb-3"
                style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
                data-section={benefit.dataTitleId}
              >
                {benefit.title}
              </h3>
              <p
                className="leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.55)', fontFamily: WORKSPACE_FONT }}
                data-section={benefit.dataDescId}
              >
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Testimonial strip */}
        <div className="reveal mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Alex M.', quote: 'Best casino I\'ve played at. Withdrawals are genuinely instant!', rating: 5 },
            { name: 'Sarah K.', quote: 'The live dealer games are incredible. Feels like being in Vegas.', rating: 5 },
            { name: 'James R.', quote: 'Great welcome bonus and the game selection is massive. Highly recommend.', rating: 5 },
          ].map((testimonial, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-6 border"
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderColor: 'rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p
                className="text-sm mb-4 leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.65)', fontFamily: WORKSPACE_FONT }}
              >
                "{testimonial.quote}"
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
              >
                {testimonial.name}
              </p>
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
    <section id="features" className="relative py-24" style={{ background: '#090920' }}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div
          className="sticky top-24 z-10 mb-16 pb-8 text-center"
          style={{
            background: 'rgba(9,9,32,0.95)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <h2
            className="text-4xl md:text-5xl font-bold mb-3"
            style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
            data-section="features-title"
          >
            How It Works
          </h2>
          <p
            className="text-lg"
            style={{ color: 'rgba(255,255,255,0.5)', fontFamily: WORKSPACE_FONT }}
            data-section="features-subtitle"
          >
            From sign-up to cashout in four simple steps.
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {FEATURES.map((feat) => (
              <div
                key={feat.id}
                className="w-3 h-3 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: activeFeature === feat.id ? WORKSPACE_HIGHLIGHT_COLOR : 'rgba(255,255,255,0.15)',
                  transform: activeFeature === feat.id ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
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
              style={{ textDecoration: 'none' }}
            >
              <div
                className="rounded-3xl border-2 p-8 md:p-12 transition-all duration-500 hover:shadow-xl"
                style={{
                  borderColor: activeFeature === feat.id ? `${WORKSPACE_HIGHLIGHT_COLOR}55` : 'rgba(255,255,255,0.08)',
                  background: activeFeature === feat.id ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255,255,255,0.02)',
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-sm font-medium px-3 py-1 rounded-full"
                    style={{
                      color: WORKSPACE_HIGHLIGHT_COLOR,
                      background: 'rgba(139, 92, 246, 0.15)',
                      fontFamily: WORKSPACE_FONT,
                    }}
                  >
                    {feat.badge}
                  </span>
                  <span className="text-2xl">{feat.icon}</span>
                </div>

                <h3
                  className="text-2xl md:text-3xl font-bold mb-4"
                  style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
                  data-section={feat.dataTitleId}
                >
                  {feat.title}
                </h3>

                <p
                  className="text-base md:text-lg mb-6 leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.55)', fontFamily: WORKSPACE_FONT }}
                  data-section={feat.dataDescId}
                >
                  {feat.description}
                </p>

                <div
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all group-hover:gap-3"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: WORKSPACE_CONTRAST_COLOR,
                    fontFamily: WORKSPACE_FONT,
                  }}
                >
                  Tap to try <span className="transition-transform group-hover:translate-x-1">→</span>
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
    <section id="faq" className="py-20 md:py-28" style={{ background: '#0d0d24' }}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="reveal text-center mb-14">
          <h2
            className="text-3xl md:text-5xl font-bold mb-4"
            style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
            data-section="faq-title"
          >
            Frequently Asked Questions
          </h2>
          <p
            className="text-lg"
            style={{ color: 'rgba(255,255,255,0.5)', fontFamily: WORKSPACE_FONT }}
            data-section="faq-subtitle"
          >
            Got questions? We've got answers.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="reveal rounded-2xl border overflow-hidden transition-all"
              style={{
                borderColor: openIndex === idx ? `${WORKSPACE_HIGHLIGHT_COLOR}44` : 'rgba(255,255,255,0.08)',
                background: openIndex === idx ? 'rgba(139, 92, 246, 0.04)' : 'rgba(255,255,255,0.02)',
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span
                  className="text-base md:text-lg font-semibold pr-4"
                  style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
                  data-section={faq.dataQId}
                >
                  {faq.question}
                </span>
                <span
                  className="text-2xl shrink-0 transition-transform duration-300"
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    transform: openIndex === idx ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}
                >
                  +
                </span>
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: openIndex === idx ? '300px' : '0',
                  opacity: openIndex === idx ? 1 : 0,
                }}
              >
                <p
                  className="px-6 pb-5 leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.55)', fontFamily: WORKSPACE_FONT }}
                  data-section={faq.dataAId}
                >
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// === SECTION 9: FINAL CTA AND FOOTER ===
const FinalCTA: React.FC = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden" style={{ background: '#090920' }}>
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at center, ${WORKSPACE_PRIMARY_COLOR}22, transparent 60%)`,
        }}
      />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="reveal">
          <div className="text-5xl mb-6">🎰</div>
          <h2
            className="text-3xl md:text-5xl font-bold mb-5"
            style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
            data-section="final-cta-title"
          >
            Ready to Test Your Fortune?
          </h2>
          <p
            className="text-lg mb-10 max-w-xl mx-auto leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.55)', fontFamily: WORKSPACE_FONT }}
            data-section="final-cta-subtitle"
          >
            Join thousands of players already winning at {WORKSPACE_BRAND_NAME}.
            Sign up today and claim your welcome bonus.
          </p>
          <a
            href={WORKSPACE_CTA_URL}
            data-section="final-cta-button"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl text-lg font-bold transition-all hover:scale-105 hover:shadow-2xl"
            style={{
              backgroundColor: WORKSPACE_PRIMARY_COLOR,
              color: WORKSPACE_CONTRAST_COLOR,
              fontFamily: WORKSPACE_FONT,
              boxShadow: `0 0 50px ${WORKSPACE_PRIMARY_COLOR}44`,
            }}
          >
            Join {WORKSPACE_BRAND_NAME}
            <span className="text-xl">→</span>
          </a>
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="py-12 border-t" style={{ background: '#070718', borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: WORKSPACE_PRIMARY_COLOR, color: WORKSPACE_CONTRAST_COLOR }}
            >
              D
            </div>
            <span
              className="font-bold"
              style={{ color: WORKSPACE_CONTRAST_COLOR, fontFamily: WORKSPACE_FONT }}
            >
              {WORKSPACE_BRAND_NAME}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.dataSectionId}
                href={link.href}
                data-section={link.dataSectionId}
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: 'rgba(255,255,255,0.45)', fontFamily: WORKSPACE_FONT }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p
            className="text-xs leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.3)', fontFamily: WORKSPACE_FONT }}
            data-section="footer-tagline"
          >
            © {new Date().getFullYear()} {WORKSPACE_BRAND_NAME}. All rights reserved.
            Gambling can be addictive. Please play responsibly. Must be 18+ to participate.
            Licensed and regulated. Terms and conditions apply.
          </p>
        </div>
      </div>
    </footer>
  );
};

// === SECTION 10: MAIN COMPONENT AND ROOT RENDER ===
const LandingPage: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

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

  // Reveal animations
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
    <div className="min-h-full overflow-y-auto" style={{ fontFamily: WORKSPACE_FONT, background: '#070718' }}>
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
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>

      <Navigation scrollProgress={scrollProgress} />
      <HeroSection />
      <SocialProofSection />
      <FeaturesSection />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default LandingPage;

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<LandingPage />);