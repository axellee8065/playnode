"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Eye,
  Link2,
  Clock,
  Gamepad2,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Badge, Button, Card, UsdcAmount } from "@/components/common";

// ---------------------------------------------------------------------------
// Animation helpers
// ---------------------------------------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const CREATOR = {
  displayName: "GameMaster_KR",
  bio: "몬스터 헌터, 엘든 링 전문 공략 크리에이터. 842시간의 검증된 플레이.",
  rank: "DIAMOND",
  verified: true,
};

const STATS = [
  { label: "Total Drops", value: "47" },
  { label: "Total Reviews", value: "12" },
  { label: "Total Views", value: "284K" },
  { label: "Links", value: "1,240" },
  { label: "Total Earned", value: "$4,280.00", usdc: true },
];

const PLATFORMS = [
  {
    name: "Steam",
    username: "GameMaster_KR",
    verified: true,
    hours: "2,400",
    color: "pn-cyan",
  },
  {
    name: "Riot",
    username: "GM_Korea#KR1",
    verified: true,
    hours: "380",
    color: "pn-red",
  },
];

const TABS = ["Drops", "Reviews", "Shop", "Grid"] as const;
type Tab = (typeof TABS)[number];

interface Drop {
  id: number;
  title: string;
  game: string;
  gameVariant: "drop" | "review" | "shop" | "grid" | "quest" | "rank";
  price: number | null;
  views: string;
  date: string;
}

const DROPS: Drop[] = [
  {
    id: 1,
    title: "몬헌 와일즈: 차지블레이드 마스터 가이드",
    game: "MH Wilds",
    gameVariant: "drop",
    price: 3.99,
    views: "48.2K",
    date: "2026-03-15",
  },
  {
    id: 2,
    title: "엘든 링 DLC 보스 공략 완벽 정리",
    game: "Elden Ring",
    gameVariant: "quest",
    price: 5.99,
    views: "112K",
    date: "2026-02-28",
  },
  {
    id: 3,
    title: "발로란트 시즌8 아이소 완벽 가이드",
    game: "VALORANT",
    gameVariant: "rank",
    price: null,
    views: "23.1K",
    date: "2026-03-22",
  },
  {
    id: 4,
    title: "몬헌 와일즈: 활 빌드 & 콤보 루트 총정리",
    game: "MH Wilds",
    gameVariant: "drop",
    price: 3.99,
    views: "31.7K",
    date: "2026-01-10",
  },
];

// Pixel grid colors for preview
const PIXEL_COLORS = [
  [1, 0, 0, 2, 0, 3, 0, 0, 1, 0],
  [0, 3, 0, 0, 1, 0, 2, 0, 0, 0],
  [0, 0, 2, 0, 0, 0, 0, 1, 0, 3],
  [1, 0, 0, 0, 3, 0, 0, 0, 2, 0],
  [0, 2, 0, 1, 0, 0, 3, 0, 0, 1],
];

const pixelColorMap: Record<number, string> = {
  0: "bg-pn-surface-2",
  1: "bg-pn-green",
  2: "bg-pn-cyan",
  3: "bg-pn-purple",
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function NodeProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("Drops");

  return (
    <div className="min-h-screen bg-pn-black text-pn-white">
      {/* ----------------------------------------------------------------- */}
      {/* Banner + Avatar */}
      {/* ----------------------------------------------------------------- */}
      <div className="relative">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-[240px] w-full bg-gradient-to-br from-pn-green/20 via-pn-surface to-pn-purple/10"
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-pn-black via-pn-black/40 to-transparent" />
        </motion.div>

        {/* Avatar + Identity */}
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-start gap-4 -mt-12 sm:flex-row sm:items-end sm:gap-6">
            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="h-24 w-24 shrink-0 rounded-full border-2 border-pn-green bg-pn-surface-2 flex items-center justify-center text-3xl font-bold text-pn-green select-none"
            >
              GM
            </motion.div>

            {/* Name + badges */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col gap-2 pb-1"
            >
              <div className="flex items-center gap-3 flex-wrap">
                <h1
                  className="font-primary font-extrabold text-pn-white leading-tight"
                  style={{ fontSize: "32px" }}
                >
                  {CREATOR.displayName}
                </h1>
                {CREATOR.verified && (
                  <span className="flex items-center gap-1 rounded-full bg-pn-blue/15 px-2.5 py-0.5 text-pn-blue">
                    <CheckCircle size={14} />
                    <span className="text-xs font-medium">Verified</span>
                  </span>
                )}
                <span className="flex items-center gap-1 rounded-full bg-pn-blue/10 px-2.5 py-0.5 text-pn-blue font-mono text-[10px] uppercase tracking-widest font-bold">
                  {CREATOR.rank} RANK
                </span>
              </div>
              <p className="text-pn-text text-sm max-w-xl leading-relaxed">
                {CREATOR.bio}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Main content area */}
      {/* ----------------------------------------------------------------- */}
      <div className="mx-auto max-w-6xl px-6 mt-10">
        {/* Stats Row */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              custom={i}
              className="bg-pn-surface border border-pn-border rounded-xl p-4"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-1.5">
                {stat.label}
              </p>
              {stat.usdc ? (
                <UsdcAmount amount={4280} size="sm" showLabel />
              ) : (
                <span className="text-pn-white font-bold text-xl leading-none">
                  {stat.value}
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Game Profiles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-10"
        >
          <h2 className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-3">
            Connected Game Profiles
          </h2>
          <div className="flex flex-wrap gap-3">
            {PLATFORMS.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-3 bg-pn-surface border border-pn-border rounded-xl px-4 py-3"
              >
                <div
                  className={`h-9 w-9 rounded-lg bg-pn-surface-2 flex items-center justify-center text-${p.color}`}
                >
                  <Gamepad2 size={18} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-pn-white">
                      {p.name}
                    </span>
                    {p.verified && (
                      <ShieldCheck size={13} className="text-pn-green" />
                    )}
                  </div>
                  <span className="text-xs text-pn-muted">{p.username}</span>
                </div>
                <div className="ml-3 flex items-center gap-1 text-pn-muted">
                  <Clock size={12} />
                  <span className="font-mono text-xs">{p.hours}hrs</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* Two-column layout: Content + Sidebar */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex gap-8">
          {/* Left: Tabs + Content */}
          <div className="flex-1 min-w-0">
            {/* Tab bar */}
            <div className="flex border-b border-pn-border mb-6">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-5 py-3 text-sm font-medium transition-colors duration-150 ${
                    activeTab === tab
                      ? "text-pn-white"
                      : "text-pn-muted hover:text-pn-text"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-pn-green"
                      transition={{ duration: 0.25 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "Drops" && (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-16"
              >
                {DROPS.map((drop, i) => (
                  <motion.div key={drop.id} variants={fadeUp} custom={i}>
                    <Card className="flex flex-col gap-3 hover:border-pn-green/30">
                      {/* Thumbnail placeholder */}
                      <div className="h-36 w-full rounded-lg bg-pn-surface-2 flex items-center justify-center text-pn-muted">
                        <Gamepad2 size={32} className="opacity-30" />
                      </div>

                      {/* Info */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={drop.gameVariant}>
                            {drop.game}
                          </Badge>
                        </div>
                        <h3 className="text-sm font-semibold text-pn-white leading-snug line-clamp-2">
                          {drop.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-pn-muted text-xs">
                            <span className="flex items-center gap-1">
                              <Eye size={12} />
                              {drop.views}
                            </span>
                            <span>{drop.date}</span>
                          </div>
                          {drop.price !== null ? (
                            <span className="font-mono text-sm font-bold text-pn-green">
                              ${drop.price.toFixed(2)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-pn-green/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-pn-green">
                              FREE
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === "Reviews" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-pn-muted"
              >
                <p className="text-sm">12개의 리뷰가 곧 표시됩니다.</p>
              </motion.div>
            )}

            {activeTab === "Shop" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-pn-muted"
              >
                <p className="text-sm">Shop 아이템 준비 중...</p>
              </motion.div>
            )}

            {activeTab === "Grid" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-pn-muted"
              >
                <p className="text-sm">Pixel Grid 전체 보기 준비 중...</p>
              </motion.div>
            )}
          </div>

          {/* Right Sidebar (desktop) */}
          <aside className="hidden lg:flex w-72 shrink-0 flex-col gap-4">
            {/* Ping button */}
            <Card className="flex flex-col gap-3">
              <Button
                variant="secondary"
                size="lg"
                className="w-full border-pn-red/40 text-pn-red hover:bg-pn-red/10 hover:border-pn-red/60"
              >
                <span className="mr-1">☕</span> Ping 보내기
              </Button>
              <p className="text-[11px] text-pn-muted text-center">
                크리에이터에게 응원의 팁을 보내세요
              </p>
            </Card>

            {/* Link (subscribe) button */}
            <Card className="flex flex-col gap-3">
              <Button
                variant="secondary"
                size="lg"
                className="w-full border-pn-red/40 text-pn-red hover:bg-pn-red/10 hover:border-pn-red/60"
              >
                <Link2 size={16} className="mr-1" />
                Link 구독 $4.99/mo
              </Button>
              <p className="text-[11px] text-pn-muted text-center">
                독점 콘텐츠 및 얼리 액세스
              </p>
            </Card>

            {/* Pixel Grid preview */}
            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-[10px] uppercase tracking-wider text-pn-muted">
                  Pixel Grid
                </h3>
                <ChevronRight size={14} className="text-pn-muted" />
              </div>
              <div className="flex flex-col gap-1">
                {PIXEL_COLORS.map((row, ri) => (
                  <div key={ri} className="flex gap-1">
                    {row.map((c, ci) => (
                      <div
                        key={ci}
                        className={`h-5 flex-1 rounded-sm ${pixelColorMap[c]} ${c !== 0 ? "opacity-80" : ""}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </Card>

            {/* Advertise link */}
            <button className="flex items-center justify-center gap-1.5 py-3 text-xs text-pn-muted hover:text-pn-text transition-colors">
              <span>이 Node에 광고하기</span>
              <ChevronRight size={13} />
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
