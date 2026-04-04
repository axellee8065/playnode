"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  ShoppingCart,
  Calendar,
  Lock,
  ThumbsUp,
  ExternalLink,
  CheckCircle,
  Diamond,
  Coffee,
  Link2,
  Gamepad2,
} from "lucide-react";
import { Badge, Button, Card, UsdcAmount } from "@/components/common";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { api, formatUsdc, formatViews } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { useWallet } from "@/components/providers/SuiProvider";

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const DROP = {
  title: "Monster Hunter Wilds: Charge Blade Master Guide",
  author: {
    name: "GameMaster_KR",
    avatar: null,
    rank: "DIAMOND",
    bio: "10-year Monster Hunter series veteran. Charge Blade specialist creator. MH:W all-weapon solo clear.",
    verified: true,
  },
  date: "2024.03.15",
  views: "24.3K",
  purchases: 842,
  price: 3.99,
  gameTag: "MONSTER_HUNTER_WILDS",
  totalEarned: 3359.58,
  version: "v3",
  lastUpdate: "2024.03.20",
};

const COMMUNITY_TIPS = [
  {
    avatar: "HN",
    name: "HunterNova",
    text: "The SAED timing guide was really helpful. Especially the explanation of the new counter window added in Wilds was the best.",
    helpful: 47,
  },
  {
    avatar: "SW",
    name: "SwordMaster_92",
    text: "Could you add more explanation on the GP counter to AED transition? Frame data would be great too!",
    helpful: 23,
  },
  {
    avatar: "MK",
    name: "MH_King",
    text: "Worth every penny of $3.99. Honestly way more organized than YouTube guides. The matchup-specific tips are especially useful and immediately applicable in practice.",
    helpful: 91,
  },
];

const RELATED_DROPS = [
  {
    title: "Long Sword Master Guide",
    author: "BladeRunner_KR",
    price: 2.99,
    views: "18.1K",
    tag: "MONSTER_HUNTER_WILDS",
  },
  {
    title: "Great Sword Counter Timing Complete Guide",
    author: "GreatSword_Main",
    price: 1.99,
    views: "12.7K",
    tag: "MONSTER_HUNTER_WILDS",
  },
  {
    title: "Wilds Endgame Gear Setup Complete Guide",
    author: "MetaHunter",
    price: 4.99,
    views: "31.5K",
    tag: "MONSTER_HUNTER_WILDS",
  },
];

const PIXEL_GRID_STATE = [
  [1, 0, 0, 1, 0, 0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
  [0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
];

const PIXEL_COLORS = [
  "bg-pn-green",
  "bg-pn-cyan",
  "bg-pn-amber",
  "bg-pn-purple",
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AvatarCircle({
  initials,
  size = "md",
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeMap = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-9 w-9 text-xs",
    lg: "h-14 w-14 text-lg",
  };
  return (
    <div
      className={`${sizeMap[size]} flex items-center justify-center rounded-full bg-pn-surface-2 border border-pn-border font-mono font-bold text-pn-green`}
    >
      {initials}
    </div>
  );
}

function RankBadge({ rank }: { rank: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-blue-400">
      <Diamond className="h-2.5 w-2.5" />
      {rank}
    </span>
  );
}

function StatRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-pn-border last:border-b-0">
      <span className="text-sm text-pn-muted">{label}</span>
      <span className="text-sm font-medium text-pn-text-bright">{value}</span>
    </div>
  );
}

// ===========================================================================
// Page
// ===========================================================================
export default function DropDetailPage() {
  const params = useParams();
  const dropId = params.id as string;
  const { connected, connect } = useWallet();

  // Fetch live data from API
  const { data: apiDrop } = useApi(() => api.getDrop(dropId), [dropId]);
  const { data: apiRelated } = useApi(
    () => api.getDrops({ gameTag: apiDrop?.gameTag || DROP.gameTag, take: 3 }),
    [apiDrop?.gameTag]
  );

  // Map API drop to display values, fall back to mock
  const drop = apiDrop
    ? {
        title: apiDrop.title,
        author: { ...DROP.author, name: apiDrop.node?.displayName || apiDrop.author },
        date: String(apiDrop.createdAt).slice(0, 10).replace(/-/g, '.'),
        views: formatViews(apiDrop.totalViews),
        purchases: apiDrop.totalPurchases,
        price: Number(apiDrop.price) / 1_000_000,
        gameTag: apiDrop.gameTag,
        totalEarned: Number(apiDrop.totalEarned) / 1_000_000,
        version: `v${apiDrop.version}`,
        lastUpdate: String(apiDrop.updatedAt).slice(0, 10).replace(/-/g, '.'),
      }
    : DROP;

  const relatedDrops = Array.isArray(apiRelated) && apiRelated.length > 0
    ? apiRelated.filter((d) => d.id !== dropId).slice(0, 3).map((d) => ({
        title: d.title,
        author: d.node?.displayName || d.author,
        price: Number(d.price) / 1_000_000,
        views: formatViews(d.totalViews),
        tag: d.gameTag,
      }))
    : RELATED_DROPS;

  return (
    <div className="relative min-h-screen">
      <Header />
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

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex flex-col gap-8 lg:flex-row"
        >
          {/* ============================================================= */}
          {/* MAIN CONTENT (LEFT ~70%)                                      */}
          {/* ============================================================= */}
          <div className="flex-1 min-w-0 lg:max-w-[70%] space-y-8">
            {/* ----- Header ----- */}
            <motion.div custom={0} variants={fadeUp}>
              <Badge variant="drop" className="mb-4">
                DROP
              </Badge>

              <h1 className="font-primary text-3xl font-extrabold text-pn-white leading-tight sm:text-4xl">
                {drop.title}
              </h1>

              {/* Author row */}
              <div className="mt-4 flex items-center gap-3">
                <AvatarCircle initials="GM" />
                <span className="font-semibold text-pn-text-bright">
                  {drop.author.name}
                </span>
                <RankBadge rank={drop.author.rank} />
                {drop.author.verified && (
                  <CheckCircle className="h-4 w-4 text-pn-green" />
                )}
              </div>

              {/* Meta row */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-pn-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {drop.date}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  {drop.views} views
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShoppingCart className="h-3.5 w-3.5" />
                  {drop.purchases} purchases
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-pn-amber/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-pn-amber">
                  <Gamepad2 className="h-3 w-3" />
                  {drop.gameTag}
                </span>
              </div>
            </motion.div>

            {/* ----- Price / Purchase Banner ----- */}
            <motion.div custom={1} variants={fadeUp}>
              <div
                className="rounded-xl p-[1px]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,255,136,0.4), rgba(0,212,255,0.2), rgba(0,255,136,0.1))",
                }}
              >
                <div className="rounded-[11px] bg-gradient-to-r from-[rgba(0,255,136,0.08)] to-[rgba(0,212,255,0.04)] px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <UsdcAmount amount={drop.price} size="lg" showLabel />
                    <p className="mt-1.5 text-xs text-pn-muted">
                      80% of your purchase goes directly to the creator.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    className="shrink-0"
                    onClick={() => {
                      if (!connected) { connect(); return; }
                      alert(`Purchase initiated for $${drop.price} USDC. Transaction signing will be available when mainnet launches.`);
                    }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Purchase
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* ----- Content Area ----- */}
            <motion.div custom={2} variants={fadeUp}>
              <Card className="!p-0 overflow-hidden">
                {/* Visible section */}
                <div className="p-6 sm:p-8 space-y-5">
                  <h2 className="text-xl font-bold text-pn-white">
                    1. Charge Blade Basic Mechanics
                  </h2>
                  <p className="text-sm leading-relaxed text-pn-text">
                    The Charge Blade is one of the most complex weapons in the
                    Monster Hunter series. It freely switches between sword mode
                    and axe mode, featuring a unique system of accumulating and
                    releasing phial energy. In Wilds, the new &quot;Wild
                    Counter&quot; system has been added, making guard points even
                    more versatile.
                  </p>
                  <p className="text-sm leading-relaxed text-pn-text">
                    Fundamentally, you charge phial energy through attacks in
                    sword mode and use that charged energy for powerful discharge
                    attacks in axe mode. For efficient play, mastering GP (Guard
                    Point) timing, charge cycles, and AED/SAED decision-making
                    is essential.
                  </p>

                  {/* Mock screenshot placeholder */}
                  <div className="flex h-48 items-center justify-center rounded-lg border border-pn-border bg-pn-dark">
                    <span className="font-mono text-sm text-pn-muted">
                      [ Screenshot — GP Counter Timing Window ]
                    </span>
                  </div>
                </div>

                {/* Locked / blurred section */}
                <div className="relative">
                  <div className="p-6 sm:p-8 space-y-4 blur-sm select-none pointer-events-none">
                    <h2 className="text-xl font-bold text-pn-white">
                      2. Advanced Combo Routes & Frame Data
                    </h2>
                    <p className="text-sm leading-relaxed text-pn-text">
                      This section provides a detailed analysis of all advanced
                      Charge Blade combo routes along with frame data. It covers
                      motion values, hit frames, and cancel windows for each
                      attack to help you achieve optimal DPS in practice.
                    </p>
                    <div className="flex h-32 items-center justify-center rounded-lg border border-pn-border bg-pn-dark">
                      <span className="font-mono text-sm text-pn-muted">
                        [ Frame Data Table ]
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-pn-white">
                      3. Matchup Guide — Monster-by-Monster Walkthrough
                    </h2>
                    <p className="text-sm leading-relaxed text-pn-text">
                      A Charge Blade-specific matchup guide for all 25 major
                      monsters in Wilds. Covers optimal positioning, GP timing,
                      and recommended gear setups for each monster.
                    </p>
                  </div>

                  {/* Lock overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-pn-dark/70 backdrop-blur-[2px]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pn-surface-2 border border-pn-border mb-3">
                      <Lock className="h-6 w-6 text-pn-muted" />
                    </div>
                    <p className="text-sm font-medium text-pn-text-bright">
                      Purchase to unlock the full guide
                    </p>
                    <p className="mt-1 text-xs text-pn-muted">
                      5 sections &middot; ~4,200 words &middot; 12 screenshots
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* ----- Community Tips ----- */}
            <motion.div custom={3} variants={fadeUp}>
              <h3 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-pn-green">
                Community Tips
              </h3>
              <div className="space-y-3">
                {COMMUNITY_TIPS.map((tip, i) => (
                  <Card key={i} className="!p-4">
                    <div className="flex gap-3">
                      <AvatarCircle initials={tip.avatar} size="sm" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-pn-text-bright">
                          {tip.name}
                        </span>
                        <p className="mt-1 text-sm leading-relaxed text-pn-text">
                          {tip.text}
                        </p>
                        <button
                          className="mt-2 inline-flex items-center gap-1.5 text-xs text-pn-muted hover:text-pn-green transition-colors"
                          onClick={() => {
                            fetch(`/api/reviews/${dropId}/helpful`, { method: 'POST' }).catch(() => {});
                          }}
                        >
                          <ThumbsUp className="h-3 w-3" />
                          Helpful ({tip.helpful})
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* ----- Related Drops ----- */}
            <motion.div custom={4} variants={fadeUp}>
              <h3 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-pn-green">
                Related Drops
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                {relatedDrops.map((rd, i) => (
                  <Card
                    key={i}
                    className="!p-4 shrink-0 w-[260px] cursor-pointer"
                  >
                    <div className="mb-2 flex h-24 items-center justify-center rounded-lg bg-pn-dark border border-pn-border">
                      <Gamepad2 className="h-6 w-6 text-pn-muted" />
                    </div>
                    <span className="inline-flex items-center rounded-md bg-pn-amber/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-pn-amber mb-1.5">
                      {rd.tag}
                    </span>
                    <h4 className="text-sm font-semibold text-pn-text-bright leading-snug line-clamp-2">
                      {rd.title}
                    </h4>
                    <p className="mt-1 text-xs text-pn-muted">{rd.author}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <UsdcAmount amount={rd.price} size="sm" showLabel />
                      <span className="text-[11px] text-pn-muted">
                        {rd.views} views
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ============================================================= */}
          {/* SIDEBAR (RIGHT ~30%)                                          */}
          {/* ============================================================= */}
          <div className="w-full lg:w-[30%] lg:min-w-[300px] space-y-6">
            {/* ----- Creator Card ----- */}
            <motion.div custom={1} variants={fadeUp}>
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <AvatarCircle initials="GM" size="lg" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-pn-text-bright">
                        {drop.author.name}
                      </span>
                      <CheckCircle className="h-3.5 w-3.5 text-pn-green" />
                    </div>
                    <RankBadge rank={drop.author.rank} />
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-pn-muted mb-4">
                  {drop.author.bio}
                </p>
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => window.location.href = `/node/${dropId}`}
                  >
                    Visit Node
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        if (!connected) { connect(); return; }
                        const amount = prompt('Enter tip amount in USDC (e.g. 1.00):');
                        if (amount) alert(`Ping of $${amount} USDC sent! Transaction will be processed on-chain.`);
                      }}
                    >
                      <Coffee className="h-3.5 w-3.5" />
                      Ping
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        if (!connected) { connect(); return; }
                        alert('Link subscription of $4.99/mo started! Recurring payments will be set up on-chain.');
                      }}
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Link Subscribe
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* ----- Pixel Grid ----- */}
            <motion.div custom={2} variants={fadeUp}>
              <Card>
                <h4 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-pn-muted">
                  Pixel Grid
                </h4>
                <div className="space-y-1">
                  {PIXEL_GRID_STATE.map((row, ri) => (
                    <div key={ri} className="flex gap-1">
                      {row.map((cell, ci) => (
                        <div
                          key={ci}
                          className={`h-5 flex-1 rounded-[3px] border transition-colors ${
                            cell
                              ? `${PIXEL_COLORS[(ri + ci) % PIXEL_COLORS.length]} border-transparent opacity-80`
                              : "bg-pn-dark border-pn-border hover:border-pn-border-light"
                          }`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <a
                  href="#"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-pn-green hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!connected) { connect(); return; }
                    alert('Pixel purchase flow coming soon. Select pixels and pay with USDC.');
                  }}
                >
                  Advertise on this guide
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Card>
            </motion.div>

            {/* ----- Shop Links ----- */}
            <motion.div custom={3} variants={fadeUp}>
              <Card>
                <h4 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-pn-muted">
                  Shop
                </h4>
                <div className="flex gap-3 items-center mb-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-pn-dark border border-pn-border">
                    <Gamepad2 className="h-5 w-5 text-pn-amber" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-pn-text-bright leading-snug">
                      Monster Hunter Wilds
                    </p>
                    <p className="text-[11px] text-pn-muted">
                      Steam &middot; Action RPG
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-pn-dark border border-pn-border px-3 py-2.5 mb-2">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-pn-muted"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2a10 10 0 0 1 10 10c0 4.42-2.87 8.17-6.84 9.49l-3.02-4.31a3.25 3.25 0 1 0-4.28 0l-3.02 4.31A10 10 0 0 1 12 2z" />
                    </svg>
                    <span className="text-sm font-medium text-pn-text-bright">
                      Steam
                    </span>
                  </div>
                  <span className="font-mono text-sm font-bold text-pn-text-bright">
                    $59.99
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full mb-2"
                  onClick={() => window.open('https://store.steampowered.com', '_blank')}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Purchase
                </Button>
                <p className="text-[10px] text-pn-muted text-center">
                  Purchasing through this link supports the creator
                </p>
              </Card>
            </motion.div>

            {/* ----- Drop Stats ----- */}
            <motion.div custom={4} variants={fadeUp}>
              <Card>
                <h4 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-pn-muted">
                  Drop Stats
                </h4>
                <div>
                  <StatRow label="Total Views" value={drop.views} />
                  <StatRow
                    label="Total Purchases"
                    value={DROP.purchases.toLocaleString()}
                  />
                  <StatRow
                    label="Total Earned"
                    value={
                      <UsdcAmount
                        amount={drop.totalEarned}
                        size="sm"
                        showLabel
                      />
                    }
                  />
                  <StatRow
                    label="Version"
                    value={
                      <span>
                        {drop.version}{" "}
                        <span className="text-pn-muted text-[11px]">
                          (Last updated: {drop.lastUpdate})
                        </span>
                      </span>
                    }
                  />
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
