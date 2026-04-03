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
import { api, formatUsdc, formatViews } from "@/lib/api";
import { useApi } from "@/hooks/useApi";

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
  title: "몬스터 헌터 와일즈: 차지블레이드 마스터 가이드",
  author: {
    name: "GameMaster_KR",
    avatar: null,
    rank: "DIAMOND",
    bio: "몬스터 헌터 시리즈 10년차 베테랑. 차지블레이드 전문 크리에이터. MH:W 올 무기 솔로 클리어.",
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
    text: "SAED 타이밍 가이드가 정말 도움됐습니다. 특히 와일즈에서 새로 추가된 카운터 윈도우 설명이 최고예요.",
    helpful: 47,
  },
  {
    avatar: "SW",
    name: "SwordMaster_92",
    text: "GP 카운터에서 AED 연계 부분 추가 설명 부탁드립니다. 프레임 데이터도 있으면 좋겠어요!",
    helpful: 23,
  },
  {
    avatar: "MK",
    name: "몬헌킹",
    text: "3.99달러 아깝지 않습니다. 솔직히 유튜브 가이드보다 훨씬 체계적이에요. 특히 매치업별 팁이 실전에서 바로 써먹을 수 있어서 좋았습니다.",
    helpful: 91,
  },
];

const RELATED_DROPS = [
  {
    title: "태도 마스터 가이드",
    author: "BladeRunner_KR",
    price: 2.99,
    views: "18.1K",
    tag: "MONSTER_HUNTER_WILDS",
  },
  {
    title: "대검 카운터 타이밍 완전 정복",
    author: "GreatSword_Main",
    price: 1.99,
    views: "12.7K",
    tag: "MONSTER_HUNTER_WILDS",
  },
  {
    title: "와일즈 엔드게임 장비 세팅 총정리",
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
        date: apiDrop.createdAt.slice(0, 10).replace(/-/g, '.'),
        views: formatViews(apiDrop.totalViews),
        purchases: apiDrop.totalPurchases,
        price: Number(apiDrop.price) / 1_000_000,
        gameTag: apiDrop.gameTag,
        totalEarned: Number(apiDrop.totalEarned) / 1_000_000,
        version: `v${apiDrop.version}`,
        lastUpdate: apiDrop.updatedAt.slice(0, 10).replace(/-/g, '.'),
      }
    : DROP;

  const relatedDrops = apiRelated
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
                      이 가이드를 구매하면 크리에이터에게 80%가 직접 전달됩니다.
                    </p>
                  </div>
                  <Button variant="primary" size="lg" className="shrink-0">
                    <ShoppingCart className="h-4 w-4" />
                    구매하기
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
                    1. 차지블레이드 기본 메카닉
                  </h2>
                  <p className="text-sm leading-relaxed text-pn-text">
                    차지블레이드는 몬스터 헌터 시리즈에서 가장 복잡한 무기 중 하나입니다.
                    검 모드와 도끼 모드를 자유롭게 전환하며, 병 에너지를 축적하고
                    방출하는 독특한 시스템을 갖추고 있습니다. 와일즈에서는 새로운
                    &quot;와일드 카운터&quot; 시스템이 추가되어 가드 포인트의 활용도가
                    더욱 높아졌습니다.
                  </p>
                  <p className="text-sm leading-relaxed text-pn-text">
                    기본적으로 검 모드에서 공격을 통해 병 에너지를 충전하고, 충전된
                    에너지를 도끼 모드의 강력한 방출 공격에 사용합니다. 효율적인 플레이를
                    위해서는 GP(가드 포인트) 타이밍, 충전 사이클, 그리고 AED/SAED
                    선택의 판단력이 중요합니다.
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
                      2. 고급 콤보 루트 & 프레임 데이터
                    </h2>
                    <p className="text-sm leading-relaxed text-pn-text">
                      이 섹션에서는 차지블레이드의 모든 고급 콤보 루트를 프레임
                      데이터와 함께 상세히 분석합니다. 각 공격의 모션 값, 히트
                      프레임, 캔슬 윈도우를 정리하여 실전에서 최적의 DPS를 뽑아낼
                      수 있도록 안내합니다.
                    </p>
                    <div className="flex h-32 items-center justify-center rounded-lg border border-pn-border bg-pn-dark">
                      <span className="font-mono text-sm text-pn-muted">
                        [ Frame Data Table ]
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-pn-white">
                      3. 매치업 가이드 — 몬스터별 공략
                    </h2>
                    <p className="text-sm leading-relaxed text-pn-text">
                      와일즈의 주요 몬스터 25종에 대한 차지블레이드 전용 매치업
                      가이드입니다. 몬스터별 최적의 포지셔닝, GP 활용 타이밍,
                      추천 장비 세팅을 모두 다룹니다.
                    </p>
                  </div>

                  {/* Lock overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-pn-dark/70 backdrop-blur-[2px]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pn-surface-2 border border-pn-border mb-3">
                      <Lock className="h-6 w-6 text-pn-muted" />
                    </div>
                    <p className="text-sm font-medium text-pn-text-bright">
                      전체 가이드를 보려면 구매하세요
                    </p>
                    <p className="mt-1 text-xs text-pn-muted">
                      총 5개 섹션 &middot; 약 4,200자 &middot; 스크린샷 12장
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
                        <button className="mt-2 inline-flex items-center gap-1.5 text-xs text-pn-muted hover:text-pn-green transition-colors">
                          <ThumbsUp className="h-3 w-3" />
                          도움이 됐어요 ({tip.helpful})
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
                  <Button variant="primary" size="sm" className="w-full">
                    Node 방문
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" size="sm" className="w-full">
                      <Coffee className="h-3.5 w-3.5" />
                      Ping
                    </Button>
                    <Button variant="secondary" size="sm" className="w-full">
                      <Link2 className="h-3.5 w-3.5" />
                      Link 구독
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
                >
                  이 가이드에 광고하기
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
                      몬스터 헌터 와일즈
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
                <Button variant="secondary" size="sm" className="w-full mb-2">
                  <ExternalLink className="h-3.5 w-3.5" />
                  구매하기
                </Button>
                <p className="text-[10px] text-pn-muted text-center">
                  이 링크로 구매 시 크리에이터를 지원합니다
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
                          (최종 업데이트: {drop.lastUpdate})
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
    </div>
  );
}
