"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Star,
  ShoppingBag,
  LayoutGrid,
  Target,
  Trophy,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { FEATURES, STATS } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

// ---------------------------------------------------------------------------
// Icon map
// ---------------------------------------------------------------------------
const iconMap: Record<string, React.ElementType> = {
  Zap,
  Star,
  ShoppingBag,
  LayoutGrid,
  Target,
  Trophy,
};

// Color map for Tailwind classes
const colorClassMap: Record<string, { text: string; bg: string; border: string; shadow: string }> = {
  "pn-green": {
    text: "text-pn-green",
    bg: "bg-pn-green/10",
    border: "border-pn-green/20",
    shadow: "shadow-pn-green/5",
  },
  "pn-cyan": {
    text: "text-pn-cyan",
    bg: "bg-pn-cyan/10",
    border: "border-pn-cyan/20",
    shadow: "shadow-pn-cyan/5",
  },
  "pn-purple": {
    text: "text-pn-purple",
    bg: "bg-pn-purple/10",
    border: "border-pn-purple/20",
    shadow: "shadow-pn-purple/5",
  },
  "pn-amber": {
    text: "text-pn-amber",
    bg: "bg-pn-amber/10",
    border: "border-pn-amber/20",
    shadow: "shadow-pn-amber/5",
  },
  "pn-blue": {
    text: "text-pn-blue",
    bg: "bg-pn-blue/10",
    border: "border-pn-blue/20",
    shadow: "shadow-pn-blue/5",
  },
  "pn-red": {
    text: "text-pn-red",
    bg: "bg-pn-red/10",
    border: "border-pn-red/20",
    shadow: "shadow-pn-red/5",
  },
};

// ---------------------------------------------------------------------------
// Hex Logo SVG
// ---------------------------------------------------------------------------
function HexLogo() {
  return (
    <motion.svg
      width="80"
      height="90"
      viewBox="0 0 80 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Outer hex */}
      <motion.path
        d="M40 2L74 22V66L40 86L6 66V22L40 2Z"
        stroke="#00FF88"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      {/* Inner hex */}
      <motion.path
        d="M40 14L62 26V54L40 66L18 54V26L40 14Z"
        stroke="#00FF88"
        strokeWidth="1.5"
        fill="rgba(0,255,136,0.05)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
      />
      {/* Play triangle */}
      <motion.path
        d="M34 30L52 42L34 54V30Z"
        fill="#00FF88"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        style={{ transformOrigin: "40px 42px" }}
      />
      {/* Node dots */}
      {[
        [40, 2],
        [74, 22],
        [74, 66],
        [40, 86],
        [6, 66],
        [6, 22],
      ].map(([cx, cy], i) => (
        <motion.circle
          key={i}
          cx={cx}
          cy={cy}
          r="3"
          fill="#00FF88"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
        />
      ))}
    </motion.svg>
  );
}

// ---------------------------------------------------------------------------
// Feature Badge
// ---------------------------------------------------------------------------
function FeatureBadge({
  label,
  color,
  index,
}: {
  label: string;
  color: string;
  index: number;
}) {
  const classes = colorClassMap[color] ?? colorClassMap["pn-green"];
  return (
    <motion.span
      custom={index}
      variants={fadeUp}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-[family-name:var(--font-mono)] text-xs font-medium tracking-wider ${classes.text} ${classes.bg} ${classes.border}`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${classes.text}`}
        style={{ backgroundColor: "currentColor" }}
      />
      {label}
    </motion.span>
  );
}

// ---------------------------------------------------------------------------
// Feature Card
// ---------------------------------------------------------------------------
function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
}) {
  const Icon = iconMap[feature.icon] ?? Zap;
  const classes = colorClassMap[feature.color] ?? colorClassMap["pn-green"];

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group relative overflow-hidden rounded-[var(--radius-lg)] border border-pn-border bg-pn-surface/60 p-6 backdrop-blur-sm transition-colors hover:border-pn-border-light`}
    >
      {/* Glow on hover */}
      <div
        className={`absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 ${classes.bg}`}
      />

      <div className="relative z-10">
        <div
          className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border ${classes.bg} ${classes.border}`}
        >
          <Icon className={`h-5 w-5 ${classes.text}`} />
        </div>

        <div className="mb-1 flex items-center gap-2">
          <span
            className={`font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-widest ${classes.text}`}
          >
            {feature.label}
          </span>
        </div>

        <h3 className="mb-2 text-lg font-semibold text-pn-text-bright">
          {feature.title}
        </h3>
        <p className="text-sm leading-relaxed text-pn-muted">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------
function StatCard({
  stat,
  index,
}: {
  stat: (typeof STATS)[number];
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      className="text-center"
    >
      <div className="font-[family-name:var(--font-mono)] text-3xl font-bold text-pn-green md:text-4xl">
        {stat.value}
      </div>
      <div className="mt-1 text-sm text-pn-muted">{stat.label}</div>
    </motion.div>
  );
}

// ===========================================================================
// Page
// ===========================================================================
export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      {/* ----------------------------------------------------------------- */}
      {/* Background effects                                                */}
      {/* ----------------------------------------------------------------- */}

      {/* Grid background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(42,42,50,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(42,42,50,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Green glow — top center */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-pn-green/5 blur-[120px]" />

      {/* Secondary cyan glow — right */}
      <div className="pointer-events-none absolute right-0 top-1/3 z-0 h-[400px] w-[400px] translate-x-1/3 rounded-full bg-pn-cyan/3 blur-[100px]" />

      {/* ================================================================= */}
      {/* HERO                                                              */}
      {/* ================================================================= */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pb-20 pt-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex max-w-3xl flex-col items-center text-center"
        >
          {/* Logo */}
          <motion.div custom={0} variants={fadeUp} className="mb-8">
            <HexLogo />
          </motion.div>

          {/* Wordmark */}
          <motion.h1
            custom={1}
            variants={fadeUp}
            className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl"
          >
            <span className="text-pn-white">Play</span>
            <span className="text-pn-green">Node</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            custom={2}
            variants={fadeUp}
            className="mb-3 font-[family-name:var(--font-mono)] text-sm tracking-[0.35em] text-pn-muted sm:text-base"
          >
            PLAY&nbsp;&nbsp;&middot;&nbsp;&nbsp;SHARE&nbsp;&nbsp;&middot;&nbsp;&nbsp;EARN
          </motion.p>

          {/* Korean subtitle */}
          <motion.p
            custom={3}
            variants={fadeUp}
            className="mb-10 text-lg text-pn-text-bright sm:text-xl"
          >
            공략이 수익이 되는 곳.
          </motion.p>

          {/* Feature badges */}
          <motion.div
            custom={4}
            variants={fadeUp}
            className="mb-12 flex flex-wrap items-center justify-center gap-2"
          >
            {FEATURES.map((f, i) => (
              <FeatureBadge
                key={f.key}
                label={f.label}
                color={f.color}
                index={i}
              />
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            custom={5}
            variants={fadeUp}
            className="flex flex-col items-center gap-4 sm:flex-row"
          >
            <button className="group inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-pn-green px-8 py-3.5 font-semibold text-pn-black transition-all hover:bg-pn-green-dim hover:shadow-lg hover:shadow-pn-green/20">
              시작하기
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-pn-border px-8 py-3.5 font-semibold text-pn-text-bright transition-all hover:border-pn-border-light hover:bg-pn-surface">
              자세히 보기
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-5 w-5 text-pn-muted" />
          </motion.div>
        </motion.div>
      </section>

      {/* ================================================================= */}
      {/* STATS                                                             */}
      {/* ================================================================= */}
      <section className="relative z-10 border-y border-pn-border bg-pn-dark/50 backdrop-blur-sm">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="mx-auto grid max-w-4xl grid-cols-1 gap-8 px-4 py-16 sm:grid-cols-3"
        >
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </motion.div>
      </section>

      {/* ================================================================= */}
      {/* FEATURES GRID                                                     */}
      {/* ================================================================= */}
      <section className="relative z-10 px-4 py-24 sm:py-32">
        {/* Section glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pn-green/3 blur-[150px]" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="relative z-10 mx-auto max-w-5xl"
        >
          {/* Section header */}
          <motion.div custom={0} variants={fadeUp} className="mb-14 text-center">
            <span className="mb-3 inline-block font-[family-name:var(--font-mono)] text-xs font-semibold tracking-[0.3em] text-pn-green">
              PLATFORM
            </span>
            <h2 className="text-3xl font-bold text-pn-white sm:text-4xl">
              크리에이터를 위한 모든 것
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-pn-muted">
              공략 작성부터 수익 창출까지. PlayNode의 6가지 핵심 모듈이
              크리에이터 경제를 완성합니다.
            </p>
          </motion.div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.key} feature={feature} index={i + 1} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* ================================================================= */}
      {/* CTA BOTTOM                                                        */}
      {/* ================================================================= */}
      <section className="relative z-10 px-4 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div custom={0} variants={fadeUp}>
            <span className="mb-4 inline-block font-[family-name:var(--font-mono)] text-xs font-semibold tracking-[0.3em] text-pn-green">
              GET STARTED
            </span>
            <h2 className="mb-4 text-3xl font-bold text-pn-white sm:text-4xl">
              지금 바로 시작하세요
            </h2>
            <p className="mb-8 text-pn-muted">
              Sui 지갑을 연결하고 PlayNode 크리에이터 경제에 참여하세요.
            </p>
            <button className="group inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-pn-green px-10 py-4 text-lg font-semibold text-pn-black transition-all hover:bg-pn-green-dim hover:shadow-lg hover:shadow-pn-green/20">
              지갑 연결하기
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ================================================================= */}
      {/* FOOTER                                                            */}
      {/* ================================================================= */}
      <footer className="relative z-10 border-t border-pn-border px-4 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">
              <span className="text-pn-white">Play</span>
              <span className="text-pn-green">Node</span>
            </span>
            <span className="text-xs text-pn-muted">v0.1.0</span>
          </div>
          <p className="font-[family-name:var(--font-mono)] text-xs text-pn-muted">
            Built on Sui &middot; Powered by creators
          </p>
        </div>
      </footer>
    </div>
  );
}
