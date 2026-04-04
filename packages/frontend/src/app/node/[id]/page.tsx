"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Coffee, Link2 } from "lucide-react";
import { Button, Card } from "@/components/common";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ContentCard from "@/components/feed/ContentCard";
import { api, formatUsdc, formatViews } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { useWallet } from "@/components/providers/SuiProvider";
import { useSubscriptions } from "@/hooks/useSubscriptions";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const CREATOR = {
  displayName: "GameMaster_KR",
  bio: "Monster Hunter & Elden Ring specialist game curator. 842 hours of verified playtime.",
  rank: "DIAMOND",
  verified: true,
};

const PLATFORMS = [
  { name: "Steam", username: "GameMaster_KR", verified: true, hours: "2,400" },
  { name: "Riot", username: "GM_Korea#KR1", verified: true, hours: "380" },
];

type Tab = "content" | "reviews" | "about";

const MOCK_DROPS = [
  { id: "nd-1", title: "MH Wilds: Charge Blade Master Guide", gameTag: "MH_WILDS", price: "3990000", views: "48200", isPremium: true, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), category: 0 },
  { id: "nd-2", title: "Elden Ring DLC Complete Boss Walkthrough", gameTag: "ELDEN_RING", price: "5990000", views: "112000", isPremium: true, createdAt: new Date(Date.now() - 86400000 * 12).toISOString(), category: 0 },
  { id: "nd-3", title: "VALORANT Season 8 Iso Complete Guide", gameTag: "VALORANT", price: "0", views: "23100", isPremium: false, createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), category: 5 },
  { id: "nd-4", title: "MH Wilds: Bow Build & Combo Routes Complete Guide", gameTag: "MH_WILDS", price: "3990000", views: "31700", isPremium: true, createdAt: new Date(Date.now() - 86400000 * 20).toISOString(), category: 1 },
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function NodeProfilePage() {
  const params = useParams();
  const nodeId = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>("content");
  const { connected, connect } = useWallet();
  const { toggle: toggleSubscription, isSubscribed } = useSubscriptions();
  const nodeSubscribed = isSubscribed(nodeId);

  // Fetch live data from API
  const { data: apiNode } = useApi(() => api.getNode(nodeId), [nodeId]);
  const { data: apiDrops } = useApi(() => api.getNodeDrops(nodeId), [nodeId]);
  const { data: apiReviews } = useApi(() => api.getNodeReviews(nodeId), [nodeId]);

  const creator = apiNode
    ? {
        displayName: apiNode.displayName,
        bio: apiNode.bio || CREATOR.bio,
        rank: apiNode.rank >= 4 ? 'DIAMOND' : apiNode.rank >= 3 ? 'GOLD' : apiNode.rank >= 2 ? 'SILVER' : 'BRONZE',
        verified: true,
      }
    : CREATOR;

  const displayDrops = apiDrops
    ? apiDrops.map((d, i) => ({
        id: d.id || `nd-${i}`,
        title: d.title,
        gameTag: d.gameTag,
        price: d.price,
        views: d.totalViews,
        isPremium: d.isPremium,
        createdAt: d.createdAt,
        category: d.category ?? 5,
        author: d.node?.displayName || d.author,
      }))
    : MOCK_DROPS.map((d) => ({ ...d, author: creator.displayName }));

  const displayReviews = apiReviews
    ? apiReviews.map((r, i) => ({
        id: r.id || `nr-${i}`,
        title: `${r.gameTag?.replace(/_/g, ' ')} Review`,
        gameTag: r.gameTag,
        author: r.node?.displayName || r.author,
        rating: r.rating / 10,
        views: r.totalViews,
        verifiedHours: r.verifiedPlaytimeHours,
        createdAt: r.createdAt,
      }))
    : [];

  const tabs: { key: Tab; label: string }[] = [
    { key: "content", label: "Content" },
    { key: "reviews", label: "Reviews" },
    { key: "about", label: "About" },
  ];

  return (
    <div className="min-h-screen bg-pn-black">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-0 lg:ml-56 pt-16">
          {/* Channel banner */}
          <div className="h-[200px] w-full bg-gradient-to-br from-pn-green/20 via-pn-surface to-pn-purple/10 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-pn-black via-pn-black/40 to-transparent" />
          </div>

          {/* Channel info row */}
          <div className="px-4 lg:px-6 -mt-10 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
              {/* Avatar */}
              <div className="h-20 w-20 shrink-0 rounded-full border-2 border-pn-green bg-pn-surface-2 flex items-center justify-center text-2xl font-bold text-pn-green select-none">
                {creator.displayName.charAt(0)}
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-pn-white">
                    {creator.displayName}
                  </h1>
                  {creator.verified && (
                    <CheckCircle size={16} className="text-pn-green" />
                  )}
                  <span className="font-mono text-[10px] uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md font-bold">
                    {creator.rank}
                  </span>
                </div>
                <p className="text-sm text-pn-muted mt-1">
                  1,240 subscribers
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant={nodeSubscribed ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => {
                    if (!connected) { connect(); return; }
                    toggleSubscription(nodeId);
                  }}
                  className={nodeSubscribed ? '!text-pn-green !border-pn-green' : ''}
                >
                  {nodeSubscribed ? 'Subscribed' : 'Subscribe'}
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
            </div>

            {/* Tabs */}
            <div className="flex border-b border-pn-border">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`relative px-5 py-3 text-sm font-medium transition-colors ${
                    activeTab === t.key
                      ? "text-pn-white"
                      : "text-pn-muted hover:text-pn-text"
                  }`}
                >
                  {t.label}
                  {activeTab === t.key && (
                    <motion.div
                      layoutId="nodeActiveTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-pn-green"
                      transition={{ duration: 0.25 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="px-4 lg:px-6 py-6">
            {activeTab === "content" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayDrops.map((drop) => (
                  <ContentCard
                    key={drop.id}
                    type="drop"
                    id={drop.id}
                    title={drop.title}
                    gameTag={drop.gameTag}
                    author={drop.author || creator.displayName}
                    views={formatViews(drop.views)}
                    price={drop.isPremium ? String(Number(drop.price) / 1_000_000) : undefined}
                    isPremium={drop.isPremium}
                    createdAt={drop.createdAt}
                    category={drop.category}
                  />
                ))}
                {displayDrops.length === 0 && (
                  <p className="text-pn-muted text-sm col-span-full text-center py-12">
                    No content yet.
                  </p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayReviews.map((r) => (
                  <ContentCard
                    key={r.id}
                    type="review"
                    id={r.id}
                    title={r.title}
                    gameTag={r.gameTag}
                    author={r.author}
                    views={formatViews(r.views)}
                    rating={r.rating}
                    verifiedHours={r.verifiedHours}
                    createdAt={r.createdAt}
                  />
                ))}
                {displayReviews.length === 0 && (
                  <p className="text-pn-muted text-sm col-span-full text-center py-12">
                    No reviews yet.
                  </p>
                )}
              </div>
            )}

            {activeTab === "about" && (
              <div className="max-w-2xl space-y-6">
                {/* Bio */}
                <Card>
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-pn-muted mb-3">
                    About
                  </h3>
                  <p className="text-sm text-pn-text leading-relaxed">
                    {creator.bio}
                  </p>
                </Card>

                {/* Game Profiles */}
                <Card>
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-pn-muted mb-3">
                    Connected Game Profiles
                  </h3>
                  <div className="space-y-3">
                    {PLATFORMS.map((p) => (
                      <div
                        key={p.name}
                        className="flex items-center justify-between py-2 border-b border-pn-border last:border-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-pn-white">{p.name}</p>
                          <p className="text-xs text-pn-muted">{p.username}</p>
                        </div>
                        <span className="font-mono text-xs text-pn-muted">{p.hours} hrs</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Stats */}
                <Card>
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-pn-muted mb-3">
                    Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-pn-muted">Total Content</p>
                      <p className="text-lg font-bold text-pn-white">{apiNode?.totalDrops ?? 47}</p>
                    </div>
                    <div>
                      <p className="text-xs text-pn-muted">Total Reviews</p>
                      <p className="text-lg font-bold text-pn-white">{apiNode?.totalReviews ?? 12}</p>
                    </div>
                    <div>
                      <p className="text-xs text-pn-muted">Total Views</p>
                      <p className="text-lg font-bold text-pn-white">{apiNode ? formatViews(apiNode.totalViews) : '284K'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-pn-muted">Subscribers</p>
                      <p className="text-lg font-bold text-pn-white">1,240</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
