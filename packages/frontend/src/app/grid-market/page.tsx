'use client';

import { type FC, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import { Badge, Button, Card, UsdcAmount, StatCard } from '@/components/common';

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
  { label: 'Total Grids', value: '1,240' },
  { label: 'Available Pixels', value: '48.2K' },
  { label: 'Avg Price/Pixel', value: '$2.40' },
  { label: 'Monthly Revenue', value: '$28.4K', change: '+14%' },
];

type SortOption = 'popular' | 'price' | 'availability';

interface GridListing {
  creator: string;
  pageTitle: string;
  pixels: boolean[][]; // 10x5 grid, true = occupied
  occupancy: number;
  priceMin: number;
  priceMax: number;
  monthlyViews: string;
  colors: string[];
}

const gridListings: GridListing[] = [
  {
    creator: 'GameMaster_KR',
    pageTitle: '몬헌 와일즈 종합 공략',
    pixels: [
      [true, true, true, false, false, true, true, false, false, false],
      [true, true, false, false, true, true, false, false, false, false],
      [false, true, true, true, false, false, false, false, false, false],
      [true, false, false, true, true, false, false, false, false, false],
      [false, false, true, false, false, true, false, false, false, false],
    ],
    occupancy: 34,
    priceMin: 1.5,
    priceMax: 4.0,
    monthlyViews: '128K',
    colors: ['bg-pn-purple', 'bg-pn-cyan', 'bg-pn-green', 'bg-pn-amber'],
  },
  {
    creator: 'SoulsBorne_Pro',
    pageTitle: '엘든 링 DLC 보스 가이드',
    pixels: [
      [true, true, true, true, true, false, false, false, false, false],
      [true, true, true, true, false, false, false, true, false, false],
      [true, true, false, false, false, false, true, true, false, false],
      [false, true, true, false, false, false, false, false, false, false],
      [false, false, true, true, false, false, false, false, false, false],
    ],
    occupancy: 48,
    priceMin: 2.0,
    priceMax: 5.5,
    monthlyViews: '95K',
    colors: ['bg-pn-red', 'bg-pn-amber', 'bg-pn-purple', 'bg-pn-cyan'],
  },
  {
    creator: 'RPG_Queen',
    pageTitle: 'FF7 리버스 완전 공략',
    pixels: [
      [true, true, false, true, true, true, false, false, true, false],
      [true, false, false, true, true, false, false, true, true, false],
      [false, false, true, false, true, true, false, false, false, false],
      [true, true, false, false, false, true, true, false, false, false],
      [false, true, true, false, false, false, true, false, false, false],
    ],
    occupancy: 52,
    priceMin: 1.8,
    priceMax: 3.5,
    monthlyViews: '84K',
    colors: ['bg-pn-blue', 'bg-pn-green', 'bg-pn-amber', 'bg-pn-purple'],
  },
  {
    creator: 'IndieDev_Lee',
    pageTitle: '발더스 게이트 3 멀티 가이드',
    pixels: [
      [true, true, true, true, true, true, true, false, false, false],
      [true, true, true, true, true, true, false, false, false, false],
      [true, true, true, false, true, false, false, false, false, false],
      [true, true, false, false, false, false, false, false, false, false],
      [true, false, false, false, false, false, false, false, false, false],
    ],
    occupancy: 62,
    priceMin: 3.0,
    priceMax: 7.0,
    monthlyViews: '210K',
    colors: ['bg-pn-green', 'bg-pn-purple', 'bg-pn-cyan', 'bg-pn-red'],
  },
  {
    creator: 'FPS_Hawk',
    pageTitle: 'Valorant 에이전트 티어 리스트',
    pixels: [
      [true, false, false, false, false, false, false, false, false, false],
      [true, true, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, true, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
    ],
    occupancy: 10,
    priceMin: 0.8,
    priceMax: 1.5,
    monthlyViews: '42K',
    colors: ['bg-pn-red', 'bg-pn-cyan'],
  },
  {
    creator: 'MMO_Sage',
    pageTitle: '로스트아크 시즌3 레이드 가이드',
    pixels: [
      [true, true, true, true, false, true, true, true, false, false],
      [true, true, true, false, false, true, true, false, false, false],
      [true, true, false, false, true, false, true, true, false, false],
      [false, true, true, true, false, false, false, true, false, false],
      [false, false, true, true, true, false, false, false, false, false],
    ],
    occupancy: 58,
    priceMin: 2.5,
    priceMax: 6.0,
    monthlyViews: '175K',
    colors: ['bg-pn-amber', 'bg-pn-purple', 'bg-pn-green', 'bg-pn-blue'],
  },
];

const howItWorks = [
  {
    step: 1,
    title: '그리드 선택',
    description: '인기 크리에이터 페이지의 광고 그리드를 탐색하고 원하는 그리드를 선택하세요.',
  },
  {
    step: 2,
    title: '픽셀 구매',
    description: 'USDC로 원하는 픽셀 영역을 직접 구매하세요. 가격은 페이지 트래픽에 따라 결정됩니다.',
  },
  {
    step: 3,
    title: '광고 게재',
    description: '구매한 픽셀에 배너, 이미지, 링크를 등록하면 즉시 광고가 게재됩니다.',
  },
];

const pricingTiers = [
  { tier: 'Bronze', pv: '~10K PV', price: '$0.50 - $1.50', color: 'text-pn-amber' },
  { tier: 'Silver', pv: '10K - 50K PV', price: '$1.50 - $3.00', color: 'text-pn-text' },
  { tier: 'Gold', pv: '50K - 200K PV', price: '$3.00 - $6.00', color: 'text-pn-amber' },
  { tier: 'Diamond', pv: '200K+ PV', price: '$6.00 - $12.00', color: 'text-pn-purple' },
];

/* ------------------------------------------------------------------ */
/*  Mini Pixel Grid Component                                          */
/* ------------------------------------------------------------------ */

const PixelGrid: FC<{ pixels: boolean[][]; colors: string[] }> = ({ pixels, colors }) => {
  let colorIdx = 0;
  return (
    <div className="grid grid-cols-10 gap-[2px]">
      {pixels.flat().map((occupied, i) => {
        let bgClass = 'bg-pn-surface-2';
        if (occupied) {
          bgClass = colors[colorIdx % colors.length];
          colorIdx++;
        }
        return (
          <div
            key={i}
            className={`w-full aspect-square rounded-[2px] ${bgClass} ${occupied ? 'opacity-80' : 'opacity-40'}`}
          />
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const GridMarketPage: FC = () => {
  const [sort, setSort] = useState<SortOption>('popular');

  const sortLabels: Record<SortOption, string> = {
    popular: '인기순',
    price: '가격순',
    availability: '잔여율순',
  };

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
          {/* Purple glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pn-purple/10 blur-[100px]" />

          <div className="relative z-10">
            <span className="mb-3 inline-block font-mono text-xs font-semibold tracking-[0.3em] text-pn-purple">
              PIXEL GRID
            </span>
            <h1 className="text-pn-white text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              PIXEL GRID MARKET
            </h1>
            <p className="text-pn-muted text-base sm:text-lg max-w-xl mx-auto">
              크리에이터 페이지에 광고하고, USDC로 직접 결제하세요.
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

        {/* ---- Filter Bar ---- */}
        <motion.div
          className="flex flex-wrap items-center gap-3"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-pn-muted">
            Sort by
          </span>
          {(Object.keys(sortLabels) as SortOption[]).map((key) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-colors ${
                sort === key
                  ? 'bg-pn-purple/20 text-pn-purple border border-pn-purple/30'
                  : 'text-pn-muted hover:text-pn-text bg-pn-surface border border-pn-border hover:border-pn-border-light'
              }`}
            >
              {sortLabels[key]}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-pn-muted">
              PV Range
            </span>
            <select className="bg-pn-surface border border-pn-border rounded-lg px-3 py-1.5 text-xs font-mono text-pn-text focus:outline-none focus:border-pn-purple">
              <option>All</option>
              <option>~10K</option>
              <option>10K - 50K</option>
              <option>50K - 200K</option>
              <option>200K+</option>
            </select>
          </div>
        </motion.div>

        {/* ---- Grid Listings ---- */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {gridListings.map((grid, i) => (
            <motion.div key={grid.pageTitle} variants={fadeUp} custom={i}>
              <Card className="h-full">
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-pn-purple/20 border border-pn-purple/30 flex items-center justify-center">
                          <span className="text-[10px] font-mono text-pn-purple font-bold">
                            {grid.creator[0]}
                          </span>
                        </div>
                        <span className="text-sm text-pn-text font-medium">{grid.creator}</span>
                      </div>
                      <h3 className="text-pn-white font-semibold text-base">{grid.pageTitle}</h3>
                    </div>
                    <Badge variant="grid">GRID</Badge>
                  </div>

                  {/* Pixel Grid Visualization */}
                  <div className="bg-pn-dark rounded-lg p-3 border border-pn-border/50">
                    <PixelGrid pixels={grid.pixels} colors={grid.colors} />
                  </div>

                  {/* Info Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-1">
                        Occupancy
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-pn-purple">
                          {grid.occupancy}%
                        </span>
                        <div className="flex-1 h-1.5 bg-pn-surface-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-pn-purple rounded-full"
                            style={{ width: `${grid.occupancy}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-1">
                        Price Range
                      </p>
                      <span className="font-mono text-sm font-bold text-pn-green">
                        ${grid.priceMin} - ${grid.priceMax}
                      </span>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-1">
                        Monthly Views
                      </p>
                      <span className="font-mono text-sm font-bold text-pn-white">
                        {grid.monthlyViews}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    variant="secondary"
                    size="md"
                    className="!bg-pn-purple/10 !border-pn-purple/30 !text-pn-purple hover:!bg-pn-purple/20 w-full"
                  >
                    광고하기
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ---- How It Works ---- */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="text-center mb-8">
            <span className="mb-3 inline-block font-mono text-xs font-semibold tracking-[0.3em] text-pn-purple">
              HOW IT WORKS
            </span>
            <h2 className="text-pn-white text-2xl sm:text-3xl font-bold">
              3단계로 광고 시작하기
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            {howItWorks.map((item, i) => (
              <motion.div key={item.step} variants={fadeUp} custom={i}>
                <Card className="h-full text-center">
                  <div className="w-12 h-12 rounded-full bg-pn-purple/10 border border-pn-purple/30 flex items-center justify-center mx-auto mb-4">
                    <span className="font-mono text-lg font-bold text-pn-purple">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-pn-white font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-pn-muted text-sm leading-relaxed">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ---- Pricing Info ---- */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <Card>
            <div className="text-center mb-6">
              <span className="mb-2 inline-block font-mono text-xs font-semibold tracking-[0.3em] text-pn-purple">
                DYNAMIC PRICING
              </span>
              <h2 className="text-pn-white text-xl sm:text-2xl font-bold mb-2">
                트래픽 기반 동적 가격
              </h2>
              <p className="text-pn-muted text-sm max-w-lg mx-auto">
                픽셀 가격은 크리에이터 페이지의 월간 페이지뷰(PV)에 따라 동적으로 결정됩니다.
                높은 트래픽의 페이지일수록 광고 가치가 높습니다.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-pn-border">
                    <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-pn-muted font-medium text-left">
                      Tier
                    </th>
                    <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-pn-muted font-medium text-left">
                      Monthly PV
                    </th>
                    <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-pn-muted font-medium text-right">
                      Price / Pixel
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pricingTiers.map((tier) => (
                    <tr
                      key={tier.tier}
                      className="border-b border-pn-border/50 hover:bg-pn-surface-2/40 transition-colors"
                    >
                      <td className={`px-4 py-3 font-semibold ${tier.color}`}>
                        {tier.tier}
                      </td>
                      <td className="px-4 py-3 font-mono text-pn-text">{tier.pv}</td>
                      <td className="px-4 py-3 font-mono text-pn-green text-right font-bold">
                        {tier.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default GridMarketPage;
