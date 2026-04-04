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
  Eye,
  Clock,
  ThumbsUp,
} from "lucide-react";
import { FEATURES } from "@/lib/constants";
import { api, formatViews, formatUsdc, type Drop, type Node, type Review } from "@/lib/api";
import { useWallet } from "@/components/providers/SuiProvider";
import { useApi } from "@/hooks/useApi";
import Header from "@/components/layout/Header";

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
// Mock Data
// ---------------------------------------------------------------------------
const MOCK_DROPS: Array<{
  id: string;
  title: string;
  gameTag: string;
  price: string;
  totalViews: string;
  author: string;
  gradientFrom: string;
  gradientTo: string;
}> = [
  { id: "drop-1", title: "Charge Blade Master Guide", gameTag: "Monster Hunter Wilds", price: "3990000", totalViews: "12400", author: "GameMaster_KR", gradientFrom: "from-emerald-600", gradientTo: "to-teal-900" },
  { id: "drop-2", title: "Shadow of the Erdtree Boss Guide", gameTag: "Elden Ring", price: "4990000", totalViews: "28700", author: "StellarGuide", gradientFrom: "from-amber-600", gradientTo: "to-orange-900" },
  { id: "drop-3", title: "Bow Build Guide Season 2", gameTag: "Monster Hunter Wilds", price: "2990000", totalViews: "8300", author: "HunterPro_JP", gradientFrom: "from-green-600", gradientTo: "to-emerald-900" },
  { id: "drop-4", title: "No-Hit All Bosses Guide", gameTag: "Stellar Blade", price: "3490000", totalViews: "15200", author: "IndieHunter_99", gradientFrom: "from-violet-600", gradientTo: "to-purple-900" },
  { id: "drop-5", title: "FF7 Rebirth Hard Mode Walkthrough", gameTag: "Final Fantasy", price: "0", totalViews: "42100", author: "RPG_Sage", gradientFrom: "from-blue-600", gradientTo: "to-indigo-900" },
  { id: "drop-6", title: "Best Pal Tier List v3", gameTag: "Palworld", price: "0", totalViews: "67500", author: "PalMaster", gradientFrom: "from-cyan-600", gradientTo: "to-blue-900" },
  { id: "drop-7", title: "Silksong Hidden Boss Guide", gameTag: "Hollow Knight", price: "1990000", totalViews: "9800", author: "BugKnight_22", gradientFrom: "from-slate-500", gradientTo: "to-gray-900" },
  { id: "drop-8", title: "GTA VI 100% Mission Guide", gameTag: "GTA VI", price: "5990000", totalViews: "95200", author: "ViceCity_Pro", gradientFrom: "from-pink-600", gradientTo: "to-rose-900" },
];

const MOCK_CREATORS: Array<{
  id: string;
  displayName: string;
  rank: string;
  rankColor: string;
  totalDrops: number;
  totalEarned: string;
  initial: string;
  avatarColor: string;
}> = [
  { id: "node-1", displayName: "GameMaster_KR", rank: "DIAMOND", rankColor: "text-pn-blue", totalDrops: 47, totalEarned: "4280000000", initial: "G", avatarColor: "bg-blue-500" },
  { id: "node-2", displayName: "StellarGuide", rank: "GOLD", rankColor: "text-pn-amber", totalDrops: 23, totalEarned: "2140000000", initial: "S", avatarColor: "bg-amber-500" },
  { id: "node-3", displayName: "IndieHunter_99", rank: "SILVER", rankColor: "text-pn-muted", totalDrops: 15, totalEarned: "920000000", initial: "I", avatarColor: "bg-gray-400" },
  { id: "node-4", displayName: "RPG_Sage", rank: "GOLD", rankColor: "text-pn-amber", totalDrops: 31, totalEarned: "1870000000", initial: "R", avatarColor: "bg-purple-500" },
  { id: "node-5", displayName: "HunterPro_JP", rank: "SILVER", rankColor: "text-pn-muted", totalDrops: 12, totalEarned: "640000000", initial: "H", avatarColor: "bg-green-500" },
  { id: "node-6", displayName: "ViceCity_Pro", rank: "GOLD", rankColor: "text-pn-amber", totalDrops: 19, totalEarned: "1520000000", initial: "V", avatarColor: "bg-pink-500" },
];

const MOCK_REVIEWS: Array<{
  id: string;
  gameTag: string;
  rating: number;
  verifiedPlaytimeHours: number;
  author: string;
  helpfulCount: number;
  title: string;
}> = [
  { id: "review-1", gameTag: "Monster Hunter Wilds", rating: 87, verifiedPlaytimeHours: 240, author: "GameMaster_KR", helpfulCount: 342, title: "Monster Hunter Wilds" },
  { id: "review-2", gameTag: "Elden Ring", rating: 92, verifiedPlaytimeHours: 180, author: "StellarGuide", helpfulCount: 518, title: "Elden Ring: Shadow of the Erdtree" },
  { id: "review-3", gameTag: "Stellar Blade", rating: 78, verifiedPlaytimeHours: 65, author: "IndieHunter_99", helpfulCount: 127, title: "Stellar Blade" },
  { id: "review-4", gameTag: "Final Fantasy", rating: 95, verifiedPlaytimeHours: 310, author: "RPG_Sage", helpfulCount: 891, title: "Final Fantasy VII Rebirth" },
];

const QUICK_LINKS = [
  { label: "Grid Market", href: "/grid-market", accent: "pn-purple", description: "Buy pixel ads on creator pages" },
  { label: "Quest Board", href: "/quest", accent: "pn-amber", description: "Complete bounties and earn USDC" },
  { label: "Game Shop", href: "/shop", accent: "pn-amber", description: "Creator-curated game recommendations" },
  { label: "Dashboard", href: "/dashboard", accent: "pn-green", description: "Track your revenue and content" },
];

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
      <motion.path
        d="M40 2L74 22V66L40 86L6 66V22L40 2Z"
        stroke="#00FF88"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <motion.path
        d="M40 14L62 26V54L40 66L18 54V26L40 14Z"
        stroke="#00FF88"
        strokeWidth="1.5"
        fill="rgba(0,255,136,0.05)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
      />
      <motion.path
        d="M34 30L52 42L34 54V30Z"
        fill="#00FF88"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        style={{ transformOrigin: "40px 42px" }}
      />
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
// Feature Card (Platform section)
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
      className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-pn-border bg-pn-surface/60 p-6 backdrop-blur-sm transition-colors hover:border-pn-border-light"
    >
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
// Drop Card (Trending Drops)
// ---------------------------------------------------------------------------
function DropCard({
  drop,
  mock,
  index,
}: {
  drop?: Drop;
  mock?: (typeof MOCK_DROPS)[number];
  index: number;
}) {
  const id = drop?.id ?? mock!.id;
  const title = drop?.title ?? mock!.title;
  const gameTag = drop?.gameTag ?? mock!.gameTag;
  const price = drop?.price ?? mock!.price;
  const views = drop?.totalViews ?? mock!.totalViews;
  const author = drop?.node?.displayName ?? drop?.author?.slice(0, 10) ?? mock!.author;
  const isFree = Number(price) === 0;
  const gradFrom = mock?.gradientFrom ?? "from-emerald-600";
  const gradTo = mock?.gradientTo ?? "to-teal-900";

  return (
    <motion.a
      href={`/drop/${id}`}
      custom={index}
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group flex min-w-[280px] flex-shrink-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-pn-border bg-pn-surface/60 backdrop-blur-sm transition-colors hover:border-pn-border-light"
    >
      {/* Thumbnail placeholder */}
      <div className={`relative h-36 bg-gradient-to-br ${gradFrom} ${gradTo}`}>
        <div className="absolute inset-0 bg-black/20" />
        <span className="absolute left-3 top-3 rounded-full bg-pn-black/70 px-2.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-medium tracking-wide text-pn-text-bright backdrop-blur-sm">
          {gameTag}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-pn-text-bright group-hover:text-pn-white transition-colors">
          {title}
        </h3>
        <p className="mb-3 text-xs text-pn-muted">{author}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className={`font-[family-name:var(--font-mono)] text-sm font-bold ${isFree ? "text-pn-muted" : "text-pn-green"}`}>
            {isFree ? "FREE" : `$${formatUsdc(price)} USDC`}
          </span>
          <span className="flex items-center gap-1 text-xs text-pn-muted">
            <Eye className="h-3 w-3" />
            {formatViews(views)}
          </span>
        </div>
      </div>
    </motion.a>
  );
}

// ---------------------------------------------------------------------------
// Creator Card (Top Creators)
// ---------------------------------------------------------------------------
function CreatorCard({
  node,
  mock,
  index,
}: {
  node?: Node;
  mock?: (typeof MOCK_CREATORS)[number];
  index: number;
}) {
  const id = node?.id ?? mock!.id;
  const name = node?.displayName ?? mock!.displayName;
  const totalDrops = node?.totalDrops ?? mock!.totalDrops;
  const totalEarned = node?.totalEarned ?? mock!.totalEarned;
  const initial = name.charAt(0).toUpperCase();
  const avatarColor = mock?.avatarColor ?? "bg-pn-green";
  const rankLabel = mock?.rank ?? (node?.rank && node.rank >= 5 ? "DIAMOND" : node?.rank && node.rank >= 3 ? "GOLD" : "SILVER");
  const rankColor = mock?.rankColor ?? "text-pn-blue";

  return (
    <motion.a
      href={`/node/${id}`}
      custom={index}
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group flex min-w-[220px] flex-shrink-0 flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-pn-border bg-pn-surface/60 p-5 backdrop-blur-sm transition-colors hover:border-pn-border-light"
    >
      {/* Avatar */}
      <div className={`flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white ${avatarColor}`}>
        {initial}
      </div>

      <div className="text-center">
        <h3 className="text-sm font-semibold text-pn-text-bright group-hover:text-pn-white transition-colors">
          {name}
        </h3>
        <span className={`font-[family-name:var(--font-mono)] text-[10px] font-bold tracking-widest ${rankColor}`}>
          {rankLabel}
        </span>
      </div>

      <div className="flex w-full items-center justify-between border-t border-pn-border pt-3 text-xs text-pn-muted">
        <span>{totalDrops} drops</span>
        <span className="font-[family-name:var(--font-mono)] text-pn-green">${formatUsdc(totalEarned)}</span>
      </div>
    </motion.a>
  );
}

// ---------------------------------------------------------------------------
// Review Card (Recent Reviews)
// ---------------------------------------------------------------------------
function ReviewCard({
  review,
  mock,
  index,
}: {
  review?: Review;
  mock?: (typeof MOCK_REVIEWS)[number];
  index: number;
}) {
  const id = review?.id ?? mock!.id;
  const gameTag = review?.gameTag ?? mock!.gameTag;
  const rating = review ? (review.rating / 10).toFixed(1) : (mock!.rating / 10).toFixed(1);
  const playtime = review?.verifiedPlaytimeHours ?? mock!.verifiedPlaytimeHours;
  const author = review?.node?.displayName ?? review?.author?.slice(0, 10) ?? mock!.author;
  const helpful = review?.helpfulCount ?? mock!.helpfulCount;
  const title = mock?.title ?? gameTag;

  return (
    <motion.a
      href={`/review/${id}`}
      custom={index}
      variants={fadeUp}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group flex gap-4 rounded-[var(--radius-lg)] border border-pn-border bg-pn-surface/60 p-5 backdrop-blur-sm transition-colors hover:border-pn-border-light"
    >
      {/* Rating number */}
      <div className="flex flex-shrink-0 flex-col items-center justify-center">
        <span className="font-[family-name:var(--font-mono)] text-3xl font-bold text-pn-cyan">
          {rating}
        </span>
        <span className="text-[10px] text-pn-muted">/10</span>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-full border border-pn-cyan/20 bg-pn-cyan/10 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-medium tracking-wider text-pn-cyan">
            REVIEW
          </span>
          <span className="text-[10px] text-pn-muted">{gameTag}</span>
        </div>
        <h3 className="mb-2 text-sm font-semibold text-pn-text-bright group-hover:text-pn-white transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-pn-muted">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {playtime}h verified
          </span>
          <span>by {author}</span>
          <span className="flex items-center gap-1 ml-auto">
            <ThumbsUp className="h-3 w-3" />
            {helpful}
          </span>
        </div>
      </div>
    </motion.a>
  );
}

// ===========================================================================
// Page
// ===========================================================================
export default function LandingPage() {
  const { connect } = useWallet();
  const { data: apiDrops } = useApi(() => api.getDrops({ take: 8 }), []);
  const { data: apiNodes } = useApi(() => api.getNodes({ take: 6 }), []);
  const { data: apiReviews } = useApi(() => api.getReviews({ take: 4 }), []);

  return (
    <div className="relative min-h-screen bg-pn-black">
      {/* Background effects */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(42,42,50,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(42,42,50,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-pn-green/5 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 z-0 h-[400px] w-[400px] translate-x-1/3 rounded-full bg-pn-cyan/3 blur-[100px]" />

      {/* ================================================================= */}
      {/* HEADER                                                            */}
      {/* ================================================================= */}
      <Header />

      {/* ================================================================= */}
      {/* HERO                                                              */}
      {/* ================================================================= */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 pb-16 pt-24 sm:pt-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex max-w-3xl flex-col items-center text-center"
        >
          {/* Logo */}
          <motion.div custom={0} variants={fadeUp} className="mb-6">
            <HexLogo />
          </motion.div>

          {/* Wordmark */}
          <motion.h1
            custom={1}
            variants={fadeUp}
            className="mb-3 text-5xl font-black tracking-tight sm:text-6xl md:text-7xl"
            style={{ fontFamily: "var(--font-sans), Outfit, system-ui, sans-serif" }}
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

          {/* Subtitle */}
          <motion.p
            custom={3}
            variants={fadeUp}
            className="mb-8 text-lg text-pn-text-bright sm:text-xl"
          >
            Where your guides become revenue.
          </motion.p>

          {/* Feature badges */}
          <motion.div
            custom={4}
            variants={fadeUp}
            className="mb-10 flex flex-wrap items-center justify-center gap-2"
          >
            {FEATURES.map((f, i) => (
              <FeatureBadge key={f.key} label={f.label} color={f.color} index={i} />
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            custom={5}
            variants={fadeUp}
            className="flex flex-col items-center gap-4 sm:flex-row"
          >
            <a
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-pn-green px-8 py-3.5 font-semibold text-pn-black transition-all hover:bg-pn-green-dim hover:shadow-lg hover:shadow-pn-green/20"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#explore"
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-pn-border px-8 py-3.5 font-semibold text-pn-text-bright transition-all hover:border-pn-border-light hover:bg-pn-surface"
            >
              Learn More
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-12"
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
      {/* EXPLORE (Main Content)                                            */}
      {/* ================================================================= */}
      <section id="explore" className="relative z-10 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            {/* Section header */}
            <motion.div custom={0} variants={fadeUp} className="mb-12 text-center">
              <span className="mb-3 inline-block font-[family-name:var(--font-mono)] text-xs font-semibold tracking-[0.3em] text-pn-green">
                EXPLORE
              </span>
              <h2 className="text-3xl font-bold text-pn-white sm:text-4xl">
                Discover Game Guides &amp; Reviews
              </h2>
            </motion.div>

            {/* ---- Trending Drops ---- */}
            <motion.div custom={1} variants={fadeUp} className="mb-14">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-pn-text-bright">Trending Drops</h3>
                <a href="/drops" className="text-sm text-pn-muted hover:text-pn-green transition-colors">
                  View all &rarr;
                </a>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {(apiDrops && apiDrops.length > 0 ? apiDrops : MOCK_DROPS).map((item, i) => {
                  const isApi = apiDrops && apiDrops.length > 0;
                  const mockFallback = !isApi ? MOCK_DROPS[i] : undefined;
                  return (
                    <DropCard
                      key={isApi ? (item as Drop).id : (item as typeof MOCK_DROPS[number]).id}
                      drop={isApi ? (item as Drop) : undefined}
                      mock={!isApi ? (item as typeof MOCK_DROPS[number]) : mockFallback}
                      index={i}
                    />
                  );
                })}
              </div>
            </motion.div>

            {/* ---- Top Creators ---- */}
            <motion.div custom={2} variants={fadeUp} className="mb-14">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-pn-text-bright">Top Creators</h3>
                <a href="/creators" className="text-sm text-pn-muted hover:text-pn-green transition-colors">
                  View all &rarr;
                </a>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {(apiNodes && apiNodes.length > 0 ? apiNodes : MOCK_CREATORS).map((item, i) => {
                  const isApi = apiNodes && apiNodes.length > 0;
                  return (
                    <CreatorCard
                      key={isApi ? (item as Node).id : (item as typeof MOCK_CREATORS[number]).id}
                      node={isApi ? (item as Node) : undefined}
                      mock={!isApi ? (item as typeof MOCK_CREATORS[number]) : undefined}
                      index={i}
                    />
                  );
                })}
              </div>
            </motion.div>

            {/* ---- Recent Reviews ---- */}
            <motion.div custom={3} variants={fadeUp} className="mb-14">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-pn-text-bright">Recent Reviews</h3>
                <a href="/reviews" className="text-sm text-pn-muted hover:text-pn-green transition-colors">
                  View all &rarr;
                </a>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(apiReviews && apiReviews.length > 0 ? apiReviews : MOCK_REVIEWS).map((item, i) => {
                  const isApi = apiReviews && apiReviews.length > 0;
                  return (
                    <ReviewCard
                      key={isApi ? (item as Review).id : (item as typeof MOCK_REVIEWS[number]).id}
                      review={isApi ? (item as Review) : undefined}
                      mock={!isApi ? (item as typeof MOCK_REVIEWS[number]) : undefined}
                      index={i}
                    />
                  );
                })}
              </div>
            </motion.div>

            {/* ---- Quick Links ---- */}
            <motion.div custom={4} variants={fadeUp}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {QUICK_LINKS.map((link) => {
                  const classes = colorClassMap[link.accent] ?? colorClassMap["pn-green"];
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      className="group flex flex-col gap-2 rounded-[var(--radius-lg)] border border-pn-border bg-pn-surface/60 p-5 backdrop-blur-sm transition-all hover:border-pn-border-light hover:-translate-y-1"
                    >
                      <span className={`font-[family-name:var(--font-mono)] text-xs font-bold tracking-widest ${classes.text}`}>
                        {link.label.toUpperCase()}
                      </span>
                      <span className="text-sm text-pn-muted group-hover:text-pn-text-bright transition-colors">
                        {link.description}
                      </span>
                      <ArrowRight className={`mt-auto h-4 w-4 ${classes.text} opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1`} />
                    </a>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* PLATFORM (Features Grid)                                          */}
      {/* ================================================================= */}
      <section id="features" className="relative z-10 px-4 py-24 sm:py-32">
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pn-green/3 blur-[150px]" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="relative z-10 mx-auto max-w-5xl"
        >
          <motion.div custom={0} variants={fadeUp} className="mb-14 text-center">
            <span className="mb-3 inline-block font-[family-name:var(--font-mono)] text-xs font-semibold tracking-[0.3em] text-pn-green">
              PLATFORM
            </span>
            <h2 className="text-3xl font-bold text-pn-white sm:text-4xl">
              Everything for Creators
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-pn-muted">
              From writing guides to earning revenue. Six core modules that power the creator economy.
            </p>
          </motion.div>

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
              Start Earning Today
            </h2>
            <p className="mb-8 text-pn-muted">
              Connect your wallet and join the PlayNode creator economy.
            </p>
            <button
              onClick={connect}
              className="group inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-pn-green px-10 py-4 text-lg font-semibold text-pn-black transition-all hover:bg-pn-green-dim hover:shadow-lg hover:shadow-pn-green/20"
            >
              Connect Wallet
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ================================================================= */}
      {/* FOOTER                                                            */}
      {/* ================================================================= */}
      <footer className="relative z-10 border-t border-pn-border px-4 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <span className="text-lg font-bold">
              <span className="text-pn-white">Play</span>
              <span className="text-pn-green">Node</span>
            </span>
            <span className="text-xs text-pn-muted">Play. Share. Earn.</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-pn-muted">
            <a href="/about" className="hover:text-pn-white transition-colors">About</a>
            <a href="/docs" className="hover:text-pn-white transition-colors">Docs</a>
            <a href="https://github.com/playnode" target="_blank" rel="noopener noreferrer" className="hover:text-pn-white transition-colors">GitHub</a>
            <a href="https://discord.gg/playnode" target="_blank" rel="noopener noreferrer" className="hover:text-pn-white transition-colors">Discord</a>
          </nav>
          <p className="font-[family-name:var(--font-mono)] text-xs text-pn-muted">
            &copy; 2026 PlayNode
          </p>
        </div>
      </footer>
    </div>
  );
}
