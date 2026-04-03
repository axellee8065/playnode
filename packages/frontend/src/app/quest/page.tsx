'use client';

import { type FC, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import { Badge, Button, Card, UsdcAmount, StatCard } from '@/components/common';
import { api, formatUsdc } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const stats = [
  { label: 'Open Quests', value: '24' },
  { label: 'Total Rewarded', value: '$12.4K', change: '+32%' },
  { label: 'Avg Reward', value: '$180' },
  { label: 'Active Creators', value: '89', change: '+8%' },
];

type QuestCategory = 'all' | 'writing' | 'review' | 'video' | 'translation';

interface Quest {
  id: string;
  title: string;
  gameTag: string;
  category: QuestCategory;
  reward: number;
  deadline: string;
  minRank: string;
  status: 'OPEN' | 'IN_PROGRESS';
  description: string;
  publisher: string;
}

const quests: Quest[] = [
  {
    id: 'q1',
    title: '몬헌 와일즈 차지블레이드 가이드 작성',
    gameTag: 'Monster Hunter Wilds',
    category: 'writing',
    reward: 200,
    deadline: '2026-04-15',
    minRank: 'Silver',
    status: 'OPEN',
    description:
      '차지블레이드의 기본 콤보, GP, SAED 타이밍 등을 포함한 초중급 가이드를 작성해주세요. 최소 3,000자 이상, 스크린샷 5장 이상 포함.',
    publisher: 'Capcom KR',
  },
  {
    id: 'q2',
    title: '엘든 링 DLC 한국어 번역',
    gameTag: 'Elden Ring',
    category: 'translation',
    reward: 150,
    deadline: '2026-04-20',
    minRank: 'Gold',
    status: 'OPEN',
    description:
      'Shadow of the Erdtree DLC 아이템 설명문 및 NPC 대화 200건의 영한 번역. 게임 세계관에 맞는 고풍체 번역 필요.',
    publisher: 'FromSoftware',
  },
  {
    id: 'q3',
    title: '발더스 게이트 3 멀티 플레이 영상 제작',
    gameTag: "Baldur's Gate 3",
    category: 'video',
    reward: 350,
    deadline: '2026-04-25',
    minRank: 'Silver',
    status: 'OPEN',
    description:
      '4인 코옵 플레이 하이라이트 영상 (10-15분). 편집, 자막, 썸네일 포함. 유튜브 업로드 기준.',
    publisher: 'Larian Studios',
  },
  {
    id: 'q4',
    title: 'Stellar Blade 전투 시스템 리뷰',
    gameTag: 'Stellar Blade',
    category: 'review',
    reward: 120,
    deadline: '2026-04-12',
    minRank: 'Bronze',
    status: 'IN_PROGRESS',
    description:
      '전투 시스템의 장단점, 보스별 난이도 분석, 타 액션게임과의 비교를 포함한 심층 리뷰. 2,000자 이상.',
    publisher: 'SHIFT UP',
  },
  {
    id: 'q5',
    title: 'GTA VI 사전 정보 종합 가이드',
    gameTag: 'GTA VI',
    category: 'writing',
    reward: 250,
    deadline: '2026-05-01',
    minRank: 'Gold',
    status: 'OPEN',
    description:
      '공개된 트레일러, 인터뷰, 유출 정보를 종합한 사전 가이드. 맵, 캐릭터, 신규 시스템 등을 체계적으로 정리.',
    publisher: 'Community',
  },
  {
    id: 'q6',
    title: '로스트아크 시즌3 레이드 공략 영상',
    gameTag: 'Lost Ark',
    category: 'video',
    reward: 180,
    deadline: '2026-04-18',
    minRank: 'Silver',
    status: 'IN_PROGRESS',
    description:
      '에키드나 하드 모드 1-4관문 공략 영상. 각 관문별 기믹 설명, 추천 각인/스펙 포함. 자막 필수.',
    publisher: 'Smilegate RPG',
  },
];

const categoryLabels: Record<QuestCategory, string> = {
  all: 'All',
  writing: 'Writing',
  review: 'Review',
  video: 'Video',
  translation: 'Translation',
};

const rankColors: Record<string, string> = {
  Bronze: 'text-pn-amber',
  Silver: 'text-pn-text',
  Gold: 'text-pn-amber',
  Diamond: 'text-pn-purple',
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const QuestPage: FC = () => {
  const [category, setCategory] = useState<QuestCategory>('all');

  // Fetch live data from API
  const { data: apiQuests } = useApi(() => api.getQuests(), []);

  // Map API quests to display format, fall back to mock
  const displayQuests: Quest[] = apiQuests
    ? apiQuests.map((q) => ({
        id: q.id,
        title: q.title,
        gameTag: q.gameTag,
        category: 'writing' as QuestCategory,
        reward: Number(q.rewardAmount) / 1_000_000,
        deadline: q.deadline.slice(0, 10),
        minRank: q.minRank >= 3 ? 'Gold' : q.minRank >= 2 ? 'Silver' : 'Bronze',
        status: q.status === 0 ? 'OPEN' as const : 'IN_PROGRESS' as const,
        description: q.description,
        publisher: q.creator.slice(0, 10) + '...',
      }))
    : quests;

  const filteredQuests =
    category === 'all'
      ? displayQuests
      : displayQuests.filter((q) => q.category === category);

  return (
    <div className="min-h-screen bg-pn-black">
      <Header />

      <main className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8 space-y-10">
        {/* ---- Hero ---- */}
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-pn-border bg-pn-surface/40 px-6 py-14 text-center"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          {/* Amber glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pn-amber/10 blur-[100px]" />

          <div className="relative z-10">
            <span className="mb-3 inline-block font-mono text-xs font-semibold tracking-[0.3em] text-pn-amber">
              BOUNTY SYSTEM
            </span>
            <h1 className="text-pn-white text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              QUEST BOARD
            </h1>
            <p className="text-pn-muted text-base sm:text-lg max-w-xl mx-auto">
              게임 퍼블리셔와 유저가 올린 바운티를 수행하고 USDC를 받으세요.
            </p>
          </div>
        </motion.div>

        {/* ---- Stats Row ---- */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={fadeUp}>
              <StatCard label={s.label} value={s.value} change={s.change} />
            </motion.div>
          ))}
        </motion.div>

        {/* ---- Filter Tabs ---- */}
        <motion.div
          className="flex flex-wrap items-center gap-2"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          {(Object.keys(categoryLabels) as QuestCategory[]).map((key) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-colors ${
                category === key
                  ? 'bg-pn-amber/20 text-pn-amber border border-pn-amber/30'
                  : 'text-pn-muted hover:text-pn-text bg-pn-surface border border-pn-border hover:border-pn-border-light'
              }`}
            >
              {categoryLabels[key]}
            </button>
          ))}
        </motion.div>

        {/* ---- Quest List ---- */}
        <motion.div
          className="space-y-4"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {filteredQuests.map((quest, i) => (
            <motion.div key={quest.id} variants={fadeUp} custom={i}>
              <Card className="!p-0 overflow-hidden">
                <div className="flex">
                  {/* Amber left accent */}
                  <div className="w-1 bg-pn-amber shrink-0" />

                  <div className="flex-1 p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Left content */}
                      <div className="flex-1 min-w-0">
                        {/* Top row: title + badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-pn-white font-semibold text-base">
                            {quest.title}
                          </h3>
                          <Badge variant="quest">{quest.gameTag}</Badge>
                          <span
                            className={`font-mono text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                              quest.status === 'OPEN'
                                ? 'bg-pn-green/10 text-pn-green'
                                : 'bg-pn-amber/10 text-pn-amber'
                            }`}
                          >
                            {quest.status === 'OPEN' ? 'OPEN' : 'IN PROGRESS'}
                          </span>
                        </div>

                        {/* Publisher */}
                        <p className="text-pn-muted text-xs font-mono mb-2">
                          by {quest.publisher}
                        </p>

                        {/* Description */}
                        <p className="text-pn-text text-sm leading-relaxed mb-3 line-clamp-2">
                          {quest.description}
                        </p>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] uppercase tracking-wider text-pn-muted">
                              Deadline
                            </span>
                            <span className="font-mono text-xs text-pn-text">
                              {quest.deadline}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] uppercase tracking-wider text-pn-muted">
                              Min Rank
                            </span>
                            <span
                              className={`font-mono text-xs font-semibold ${rankColors[quest.minRank] || 'text-pn-text'}`}
                            >
                              {quest.minRank}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] uppercase tracking-wider text-pn-muted">
                              Type
                            </span>
                            <span className="font-mono text-xs text-pn-text capitalize">
                              {quest.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: reward + CTA */}
                      <div className="flex lg:flex-col items-center lg:items-end gap-3 lg:gap-4 shrink-0">
                        <div className="text-right">
                          <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-1">
                            Reward
                          </p>
                          <span className="font-mono text-2xl font-bold text-pn-amber">
                            ${quest.reward.toFixed(2)}
                          </span>
                          <span className="ml-1 font-mono text-[10px] text-pn-muted">
                            USDC
                          </span>
                        </div>
                        <Button
                          variant="secondary"
                          size="md"
                          className="!bg-pn-amber/10 !border-pn-amber/30 !text-pn-amber hover:!bg-pn-amber/20 whitespace-nowrap"
                          disabled={quest.status === 'IN_PROGRESS'}
                        >
                          {quest.status === 'OPEN' ? '수락하기' : '진행 중'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ---- My Quests Section ---- */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="mb-6">
            <span className="mb-2 inline-block font-mono text-xs font-semibold tracking-[0.3em] text-pn-amber">
              MY QUESTS
            </span>
            <h2 className="text-pn-white text-xl sm:text-2xl font-bold">
              수락한 퀘스트
            </h2>
          </div>

          <Card className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-pn-surface-2 border border-pn-border flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-pn-muted">?</span>
            </div>
            <p className="text-pn-muted text-sm mb-1">
              아직 수락한 퀘스트가 없습니다
            </p>
            <p className="text-pn-muted/60 text-xs font-mono">
              위 퀘스트 목록에서 원하는 퀘스트를 수락하세요.
            </p>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default QuestPage;
