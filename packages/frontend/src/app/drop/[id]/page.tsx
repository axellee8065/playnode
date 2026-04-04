"use client";

import { useParams } from "next/navigation";
import {
  Eye,
  ShoppingCart,
  Calendar,
  Lock,
  ThumbsUp,
  CheckCircle,
  Diamond,
  Coffee,
  Gamepad2,
} from "lucide-react";
import { Badge, Button, Card, UsdcAmount } from "@/components/common";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ContentCard from "@/components/feed/ContentCard";
import { api, formatViews } from "@/lib/api";
import { getGameLabel } from "@/lib/games";
import { DetailSkeleton } from "@/components/common/Skeleton";
import { useApi } from "@/hooks/useApi";
import { useWallet } from "@/components/providers/SuiProvider";
import { useSubscriptions } from "@/hooks/useSubscriptions";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const DROP = {
  title: "Monster Hunter Wilds: Charge Blade Master Guide",
  author: {
    name: "GameMaster_KR",
    avatar: null,
    rank: "DIAMOND",
    bio: "10-year Monster Hunter series veteran. Charge Blade specialist game curator. MH:W all-weapon solo clear.",
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
    text: "Worth every penny of $3.99. Honestly way more organized than YouTube guides. The matchup-specific tips are especially useful.",
    helpful: 91,
  },
];

const RELATED_DROPS = [
  {
    id: "related-1",
    title: "Long Sword Master Guide",
    author: "BladeRunner_KR",
    price: "2990000",
    views: "18100",
    gameTag: "MH_WILDS",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "related-2",
    title: "Great Sword Counter Timing Complete Guide",
    author: "GreatSword_Main",
    price: "1990000",
    views: "12700",
    gameTag: "MH_WILDS",
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: "related-3",
    title: "Wilds Endgame Gear Setup Complete Guide",
    author: "MetaHunter",
    price: "4990000",
    views: "31500",
    gameTag: "MH_WILDS",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "related-4",
    title: "Bow Build Max DPS Setup",
    author: "BowGod",
    price: "5490000",
    views: "19800",
    gameTag: "MH_WILDS",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function AvatarCircle({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
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

// ===========================================================================
// Page
// ===========================================================================
export default function DropDetailPage() {
  const params = useParams();
  const dropId = params.id as string;
  const { connected, connect } = useWallet();
  const { toggle: toggleSubscription, isSubscribed } = useSubscriptions();

  // Fetch live data from API
  const { data: apiDrop, loading } = useApi(() => api.getDrop(dropId), [dropId]);
  const { data: apiRelated } = useApi(
    () => api.getDrops({ gameTag: apiDrop?.gameTag || DROP.gameTag, take: 4 }),
    [apiDrop?.gameTag]
  );

  // Show loading skeleton instead of mock data that causes flicker
  if (loading && !apiDrop) {
    return (
      <div className="min-h-screen bg-pn-black">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-0 lg:ml-56 pt-16">
            <DetailSkeleton />
          </main>
        </div>
      </div>
    );
  }

  // Map API drop to display values, fall back to mock
  const drop = apiDrop
    ? {
        title: apiDrop.title,
        author: { ...DROP.author, name: apiDrop.node?.displayName || apiDrop.author },
        date: apiDrop.createdAt ? new Date(String(apiDrop.createdAt)).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
        views: formatViews(apiDrop.totalViews),
        purchases: apiDrop.totalPurchases,
        price: Number(apiDrop.price) / 1_000_000,
        gameTag: apiDrop.gameTag,
        totalEarned: Number(apiDrop.totalEarned) / 1_000_000,
        version: `v${apiDrop.version}`,
        lastUpdate: apiDrop.updatedAt ? new Date(String(apiDrop.updatedAt)).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
        isPremium: apiDrop.isPremium,
        category: apiDrop.category,
      }
    : { ...DROP, isPremium: true, category: 0 };

  const curatorNodeId = apiDrop?.nodeId || 'mock-node';
  const curatorSubscribed = isSubscribed(curatorNodeId);

  const relatedDrops =
    Array.isArray(apiRelated) && apiRelated.length > 0
      ? apiRelated
          .filter((d) => d.id !== dropId)
          .slice(0, 4)
          .map((d) => ({
            id: d.id,
            title: d.title,
            author: d.node?.displayName || d.author,
            price: d.price,
            views: d.totalViews,
            gameTag: d.gameTag,
            createdAt: d.createdAt,
          }))
      : RELATED_DROPS;

  return (
    <div className="min-h-screen bg-pn-black">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-0 lg:ml-56 pt-16">
          <div className="flex flex-col lg:flex-row gap-6 px-4 lg:px-6 py-6">
            {/* ============================================================= */}
            {/* MAIN CONTENT (LEFT ~65%)                                      */}
            {/* ============================================================= */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Game tag + category badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-pn-amber/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-pn-amber">
                  <Gamepad2 className="h-3 w-3" />
                  {getGameLabel(drop.gameTag)}
                </span>
                <Badge variant="drop">GUIDE</Badge>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-pn-white leading-tight">
                {drop.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-pn-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  {drop.views} views
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {drop.date}
                </span>
                {drop.price > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pn-green/10 text-pn-green font-mono text-xs font-bold">
                    {drop.price.toFixed(2)} USDC
                  </span>
                )}
                {drop.price === 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-pn-green/10 text-pn-green font-mono text-xs font-bold">
                    FREE
                  </span>
                )}
              </div>

              {/* Curator info bar */}
              <div className="flex items-center gap-3 py-3 border-y border-pn-border">
                <AvatarCircle initials="GM" size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-pn-white text-sm">
                      {drop.author.name}
                    </span>
                    <RankBadge rank={drop.author.rank} />
                    {drop.author.verified && (
                      <CheckCircle className="h-3.5 w-3.5 text-pn-green" />
                    )}
                  </div>
                </div>
                <Button
                  variant={curatorSubscribed ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => {
                    if (!connected) { connect(); return; }
                    toggleSubscription(curatorNodeId);
                  }}
                  className={curatorSubscribed ? '!text-pn-green !border-pn-green' : ''}
                >
                  {curatorSubscribed ? 'Subscribed' : 'Subscribe'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (!connected) { connect(); return; }
                    const amount = prompt('Enter tip amount in USDC (e.g. 1.00):');
                    if (amount) alert(`Ping of ${amount} USDC sent!`);
                  }}
                >
                  <Coffee className="h-3.5 w-3.5" />
                  Ping
                </Button>
              </div>

              {/* Content body */}
              <Card className="!p-0 overflow-hidden">
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
                      Charge Blade combo routes along with frame data.
                    </p>
                    <div className="flex h-32 items-center justify-center rounded-lg border border-pn-border bg-pn-dark">
                      <span className="font-mono text-sm text-pn-muted">
                        [ Frame Data Table ]
                      </span>
                    </div>
                  </div>

                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-pn-dark/70 backdrop-blur-[2px]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pn-surface-2 border border-pn-border mb-3">
                      <Lock className="h-6 w-6 text-pn-muted" />
                    </div>
                    <p className="text-sm font-medium text-pn-white">
                      Purchase to unlock the full guide
                    </p>
                    <p className="mt-1 text-xs text-pn-muted">
                      5 sections &middot; ~4,200 words &middot; 12 screenshots
                    </p>
                  </div>
                </div>
              </Card>

              {/* Purchase banner */}
              {drop.price > 0 && (
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
                        80% of your purchase goes directly to the game curator.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="lg"
                      className="shrink-0"
                      onClick={() => {
                        if (!connected) { connect(); return; }
                        alert(`Purchase initiated for ${drop.price.toFixed(2)} USDC.`);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Purchase
                    </Button>
                  </div>
                </div>
              )}

              {/* Community Tips */}
              <div>
                <h3 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-pn-muted">
                  Community
                </h3>
                <div className="space-y-3">
                  {COMMUNITY_TIPS.map((tip, i) => (
                    <Card key={i} className="!p-4">
                      <div className="flex gap-3">
                        <AvatarCircle initials={tip.avatar} size="sm" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-pn-white">
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
              </div>
            </div>

            {/* ============================================================= */}
            {/* RIGHT SIDEBAR (~35%)                                          */}
            {/* ============================================================= */}
            <div className="w-full lg:w-[360px] shrink-0 space-y-4">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-pn-muted">
                Related Guides
              </h3>
              {relatedDrops.map((rd) => (
                <ContentCard
                  key={rd.id}
                  type="drop"
                  id={rd.id}
                  title={rd.title}
                  gameTag={rd.gameTag}
                  author={rd.author}
                  views={formatViews(rd.views)}
                  price={String(Number(rd.price) / 1_000_000)}
                  isPremium={Number(rd.price) > 0}
                  createdAt={rd.createdAt}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
