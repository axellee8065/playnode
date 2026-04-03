'use client';

import { type FC, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  Clock,
  Monitor,
  ExternalLink,
  Star,
  ChevronRight,
} from 'lucide-react';
import { Badge, Button, Card } from '@/components/common';

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

const review = {
  title: '엘든 링: Shadow of the Erdtree 완벽 리뷰',
  game: 'Elden Ring: Shadow of the Erdtree',
  author: {
    name: 'SoulsMaster_KR',
    avatar: null,
    verified: true,
    tier: 'Expert',
    drops: 42,
    followers: '12.8K',
  },
  verification: {
    playtime: 842,
    platform: 'Steam',
    badge: 'EXPERT',
  },
  overall: 8.7,
  categories: [
    { label: 'Story', score: 9.2, color: 'bg-pn-cyan' },
    { label: 'Graphics', score: 9.5, color: 'bg-pn-cyan' },
    { label: 'Combat', score: 8.8, color: 'bg-pn-cyan' },
    { label: 'Endgame', score: 7.5, color: 'bg-pn-amber' },
    { label: 'Value', score: 8.5, color: 'bg-pn-cyan' },
  ],
  helpful: 1247,
  date: '2026-03-18',
};

const reviewContent = [
  {
    heading: '그림자 땅의 새로운 도전',
    body: 'Shadow of the Erdtree는 프롬소프트웨어가 만든 DLC 중 가장 야심찬 확장팩입니다. 광활한 그림자 땅은 본편의 사이 사이에 숨겨진 비밀로 가득하며, 새로운 NPC들과의 만남은 엘든 링 세계관에 깊이를 더합니다. 메시머의 이야기는 마리카와 황금률의 이면을 탐구하며, 시리즈 전체를 관통하는 주제에 새로운 시각을 제공합니다.',
  },
  {
    heading: '전투 시스템의 진화',
    body: '새로운 무기 카테고리와 전투 기술은 기존 빌드에 신선한 변화를 가져왔습니다. 특히 이도류 시스템과 경무기 스탠스는 액션의 깊이를 한 단계 끌어올렸습니다. 보스전은 여전히 도전적이지만, DLC 전용 스켈트리 레벨링 시스템 덕분에 난이도 곡선이 더 매끄럽게 느껴집니다. 다만 일부 후반 보스의 패턴이 반복적으로 느껴지는 점은 아쉬운 부분입니다.',
  },
  {
    heading: '비주얼과 사운드',
    body: '레이 트레이싱이 적용된 그림자 땅의 풍경은 숨막히게 아름답습니다. 황혼빛이 감도는 들판, 붉은 안개에 뒤덮인 성채, 그리고 지하 세계의 형광빛 동굴까지 — 각 지역의 아트 디렉션은 완벽에 가깝습니다. 사운드트랙 역시 오케스트라 편성이 확대되어 보스전의 긴장감을 극대화합니다.',
  },
  {
    heading: '종합 평가',
    body: '842시간의 플레이타임 동안 Shadow of the Erdtree는 한 번도 지루하지 않았습니다. 본편을 사랑한 플레이어라면 반드시 경험해야 할 DLC이며, 올해 최고의 확장팩이라 단언할 수 있습니다. 엔드게임 콘텐츠의 반복성과 일부 밸런스 이슈가 완벽한 점수를 주지 못하게 했지만, 그럼에도 불구하고 최고 수준의 게임 경험입니다.',
  },
];

const relatedReviews = [
  { title: 'Stellar Blade — 액션의 새로운 기준', author: 'GameHunter_KR', score: 8.2 },
  { title: 'Black Myth: Wukong 심층 리뷰', author: 'RPG_Master', score: 9.0 },
  { title: 'Armored Core VI 완벽 분석', author: 'MechaPilot', score: 8.5 },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

const RatingBar: FC<{
  label: string;
  score: number;
  color: string;
  delay: number;
}> = ({ label, score, color, delay }) => (
  <div className="flex items-center gap-4">
    <span className="w-20 text-sm text-pn-text shrink-0">{label}</span>
    <div className="flex-1 h-3 bg-pn-surface-2 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${(score / 10) * 100}%` }}
        transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      />
    </div>
    <span className="font-mono text-sm font-bold text-pn-white w-8 text-right">
      {score.toFixed(1)}
    </span>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const ReviewPage: FC = () => {
  const [helpful, setHelpful] = useState<'up' | 'down' | null>(null);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful);

  const handleHelpful = (vote: 'up' | 'down') => {
    if (helpful === vote) {
      setHelpful(null);
      if (vote === 'up') setHelpfulCount(review.helpful);
    } else {
      setHelpful(vote);
      if (vote === 'up') setHelpfulCount(review.helpful + 1);
      else setHelpfulCount(review.helpful);
    }
  };

  return (
    <div className="min-h-screen bg-pn-black">
      <main className="max-w-[1200px] mx-auto px-4 lg:px-6 py-10">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8"
        >
          {/* ========================================================= */}
          {/* Main Column                                                */}
          {/* ========================================================= */}
          <div className="space-y-6">
            {/* ---- Header ---- */}
            <motion.div variants={fadeUp}>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="review">REVIEW</Badge>
                <span className="font-mono text-[10px] text-pn-muted uppercase tracking-wider">
                  {review.date}
                </span>
              </div>
              <h1 className="text-pn-white text-2xl sm:text-3xl font-bold leading-tight mb-4">
                {review.title}
              </h1>
              <div className="flex items-center gap-3">
                {/* Author avatar placeholder */}
                <div className="w-10 h-10 rounded-full bg-pn-surface-2 border border-pn-border flex items-center justify-center">
                  <span className="font-mono text-xs text-pn-cyan">
                    {review.author.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-pn-white">
                      {review.author.name}
                    </span>
                    {review.author.verified && (
                      <CheckCircle className="w-3.5 h-3.5 text-pn-cyan" />
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-pn-muted uppercase tracking-wider">
                    {review.author.tier} Reviewer
                  </span>
                </div>
              </div>
            </motion.div>

            {/* ---- Verification Banner ---- */}
            <motion.div variants={fadeUp}>
              <div className="rounded-xl border border-pn-cyan/20 bg-pn-cyan/5 p-5">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-pn-cyan" />
                    <span className="font-mono text-lg font-bold text-pn-cyan">
                      {review.verification.playtime}시간
                    </span>
                    <span className="text-sm text-pn-text">Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 font-mono uppercase tracking-wider text-pn-cyan bg-pn-cyan/15 border border-pn-cyan/30"
                      style={{ fontSize: '9px', lineHeight: '16px' }}
                    >
                      {review.verification.badge}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-pn-muted" />
                    <span className="text-sm text-pn-text">
                      {review.verification.platform}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-pn-muted uppercase tracking-wider">
                    검증된 플레이타임
                  </span>
                </div>
              </div>
            </motion.div>

            {/* ---- Overall Rating ---- */}
            <motion.div variants={fadeUp}>
              <Card>
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  {/* Score circle */}
                  <div className="relative flex-shrink-0">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="currentColor"
                        className="text-pn-surface-2"
                        strokeWidth="6"
                      />
                      <motion.circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="currentColor"
                        className="text-pn-cyan"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 52}
                        strokeDashoffset={2 * Math.PI * 52}
                        animate={{
                          strokeDashoffset:
                            2 * Math.PI * 52 * (1 - review.overall / 10),
                        }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        style={{
                          transformOrigin: '60px 60px',
                          transform: 'rotate(-90deg)',
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-mono text-5xl font-bold text-pn-cyan leading-none">
                        {review.overall.toFixed(1)}
                      </span>
                      <span className="font-mono text-xs text-pn-muted mt-1">
                        / 10
                      </span>
                    </div>
                  </div>

                  {/* Category bars */}
                  <div className="flex-1 w-full space-y-3">
                    {review.categories.map((cat, i) => (
                      <RatingBar
                        key={cat.label}
                        label={cat.label}
                        score={cat.score}
                        color={cat.color}
                        delay={0.3 + i * 0.1}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* ---- Review Content ---- */}
            <motion.div variants={fadeUp} className="space-y-6">
              {reviewContent.map((section, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="space-y-3"
                >
                  <h2 className="text-pn-white text-lg font-bold flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full bg-pn-cyan inline-block" />
                    {section.heading}
                  </h2>
                  <p className="text-pn-text text-sm leading-relaxed pl-3">
                    {section.body}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* ---- Helpful Section ---- */}
            <motion.div variants={fadeUp}>
              <Card>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-pn-white text-sm font-medium mb-1">
                      이 리뷰가 도움이 되었나요?
                    </p>
                    <p className="font-mono text-[11px] text-pn-muted">
                      {helpfulCount.toLocaleString()}명이 도움됨
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleHelpful('up')}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors font-mono text-xs ${
                        helpful === 'up'
                          ? 'bg-pn-green/10 border-pn-green/30 text-pn-green'
                          : 'bg-pn-surface-2 border-pn-border text-pn-muted hover:text-pn-text hover:border-pn-border-light'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      도움됨
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleHelpful('down')}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors font-mono text-xs ${
                        helpful === 'down'
                          ? 'bg-pn-red/10 border-pn-red/30 text-pn-red'
                          : 'bg-pn-surface-2 border-pn-border text-pn-muted hover:text-pn-text hover:border-pn-border-light'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      아니요
                    </motion.button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* ========================================================= */}
          {/* Sidebar                                                    */}
          {/* ========================================================= */}
          <div className="space-y-6">
            {/* Author Card */}
            <motion.div variants={fadeUp}>
              <Card>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-pn-surface-2 border border-pn-border flex items-center justify-center mb-3">
                    <span className="font-mono text-xl text-pn-cyan">
                      {review.author.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm font-semibold text-pn-white">
                      {review.author.name}
                    </span>
                    {review.author.verified && (
                      <CheckCircle className="w-3.5 h-3.5 text-pn-cyan" />
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-pn-muted uppercase tracking-wider mb-4">
                    {review.author.tier} Reviewer
                  </span>
                  <div className="w-full grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-pn-surface-2 rounded-lg p-2.5">
                      <div className="font-mono text-sm font-bold text-pn-white">
                        {review.author.drops}
                      </div>
                      <div className="font-mono text-[9px] text-pn-muted uppercase">
                        Drops
                      </div>
                    </div>
                    <div className="bg-pn-surface-2 rounded-lg p-2.5">
                      <div className="font-mono text-sm font-bold text-pn-white">
                        {review.author.followers}
                      </div>
                      <div className="font-mono text-[9px] text-pn-muted uppercase">
                        Followers
                      </div>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full">
                    프로필 보기
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Shop Link */}
            <motion.div variants={fadeUp}>
              <Card>
                <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-3">
                  이 게임 구매하기
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-pn-white">
                    {review.game}
                  </span>
                </div>
                <Button variant="primary" size="sm" className="w-full">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Shop에서 보기
                </Button>
              </Card>
            </motion.div>

            {/* Related Reviews */}
            <motion.div variants={fadeUp}>
              <Card>
                <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-4">
                  관련 리뷰
                </p>
                <div className="space-y-3">
                  {relatedReviews.map((r) => (
                    <motion.div
                      key={r.title}
                      whileHover={{ x: 2 }}
                      className="flex items-start justify-between gap-3 p-2.5 rounded-lg hover:bg-pn-surface-2/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-pn-text font-medium truncate group-hover:text-pn-white transition-colors">
                          {r.title}
                        </p>
                        <p className="font-mono text-[10px] text-pn-muted mt-0.5">
                          by {r.author}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="w-3 h-3 text-pn-amber fill-pn-amber" />
                        <span className="font-mono text-xs font-bold text-pn-white">
                          {r.score.toFixed(1)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ x: 2 }}
                  className="w-full flex items-center justify-center gap-1 mt-3 pt-3 border-t border-pn-border text-xs text-pn-muted hover:text-pn-cyan transition-colors font-mono"
                >
                  모든 리뷰 보기
                  <ChevronRight className="w-3 h-3" />
                </motion.button>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ReviewPage;
