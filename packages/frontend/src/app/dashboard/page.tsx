'use client';

import { type FC, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Badge, Button, Card, UsdcAmount } from '@/components/common';
import { api, formatUsdc, formatViews } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { useWallet } from '@/components/providers/SuiProvider';

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
  { label: 'Total Earned', amount: 4280.0, change: '+23%', size: 'lg' as const },
  { label: 'This Month', amount: 1240.0, change: '+18%', size: 'md' as const },
  { label: 'Pending Wire', amount: 380.0, change: '+5%', size: 'md' as const },
  { label: 'Total Views', value: '284K', change: '+12%' },
];

const weeklyRevenue = [
  { day: 'Mon', value: 120 },
  { day: 'Tue', value: 210 },
  { day: 'Wed', value: 175 },
  { day: 'Thu', value: 310 },
  { day: 'Fri', value: 260 },
  { day: 'Sat', value: 90 },
  { day: 'Sun', value: 140 },
];

const revenueMax = Math.max(...weeklyRevenue.map((d) => d.value));

const sources = [
  { name: 'Drops', pct: 65, amount: 2782.0, color: 'bg-pn-green' },
  { name: 'Pixel Grid', pct: 18, amount: 770.4, color: 'bg-pn-purple' },
  { name: 'Shop', pct: 10, amount: 428.0, color: 'bg-pn-amber' },
  { name: 'Subscriptions', pct: 5, amount: 214.0, color: 'bg-pn-red' },
  { name: 'Tips', pct: 2, amount: 85.6, color: 'bg-pn-red' },
];

type ContentTab = 'all' | 'drops' | 'reviews' | 'shop';

interface ContentRow {
  title: string;
  type: 'drop' | 'review' | 'shop';
  views: string;
  revenue: number;
  date: string;
  status: 'published' | 'draft' | 'pending';
}

const contentRows: ContentRow[] = [
  {
    title: 'Monster Hunter Wilds - Early Weapon Guide',
    type: 'drop',
    views: '48.2K',
    revenue: 820.0,
    date: '2026-03-28',
    status: 'published',
  },
  {
    title: 'Elden Ring DLC - Complete Boss Walkthrough',
    type: 'drop',
    views: '35.1K',
    revenue: 640.0,
    date: '2026-03-22',
    status: 'published',
  },
  {
    title: 'Stellar Blade - Honest Review',
    type: 'review',
    views: '22.8K',
    revenue: 310.0,
    date: '2026-03-15',
    status: 'published',
  },
  {
    title: 'Palworld Multiplayer Setup Guide',
    type: 'drop',
    views: '18.5K',
    revenue: 280.0,
    date: '2026-03-10',
    status: 'published',
  },
  {
    title: 'GTA VI Pre-Order Link',
    type: 'shop',
    views: '12.3K',
    revenue: 190.0,
    date: '2026-03-05',
    status: 'published',
  },
  {
    title: 'Hollow Knight: Silksong Review (Draft)',
    type: 'review',
    views: '--',
    revenue: 0,
    date: '2026-04-02',
    status: 'draft',
  },
];

const statusStyle: Record<string, string> = {
  published: 'text-pn-green',
  draft: 'text-pn-muted',
  pending: 'text-pn-amber',
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

const AnimatedBar: FC<{ pct: number; colorClass: string; delay: number }> = ({
  pct,
  colorClass,
  delay,
}) => (
  <motion.div
    className={`h-full rounded-sm ${colorClass}`}
    initial={{ width: 0 }}
    animate={{ width: `${pct}%` }}
    transition={{ duration: 0.7, delay, ease: 'easeOut' }}
  />
);

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const DashboardPage: FC = () => {
  const [tab, setTab] = useState<ContentTab>('all');
  const { connected, connect } = useWallet();

  // Fetch live data from API (falls back to mock data below if unavailable)
  const { data: apiDrops } = useApi(() => api.getDrops({ take: 10 }), []);
  const { data: apiNodes } = useApi(() => api.getNodes({ take: 1 }), []);

  // Map API drops into content rows format, or fall back to mock
  const liveContentRows: ContentRow[] | null = Array.isArray(apiDrops) && apiDrops.length > 0
    ? apiDrops.map((d) => ({
        title: d.title,
        type: 'drop' as const,
        views: formatViews(d.totalViews),
        revenue: Number(d.totalEarned) / 1_000_000,
        date: String(d.createdAt).slice(0, 10),
        status: 'published' as const,
      }))
    : null;

  const displayRows = liveContentRows || contentRows;

  const filteredRows =
    tab === 'all'
      ? displayRows
      : displayRows.filter((r) => {
          if (tab === 'drops') return r.type === 'drop';
          if (tab === 'reviews') return r.type === 'review';
          return r.type === 'shop';
        });

  return (
    <div className="min-h-screen bg-pn-black">
      <Header />

      <main className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8 space-y-8">
        {/* ---- Page title ---- */}
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <h1 className="text-pn-white text-2xl font-bold">Creator Dashboard</h1>
          <p className="text-pn-muted text-sm mt-1">
            Track your revenue, manage content, and grow your audience.
          </p>
        </motion.div>

        {/* ---- Stat cards ---- */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={fadeUp}>
              <Card className="h-full">
                <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-2">
                  {s.label}
                </p>
                <div className="flex items-end gap-2">
                  {'amount' in s ? (
                    <UsdcAmount
                      amount={s.amount!}
                      size={s.size ?? 'md'}
                      showLabel
                    />
                  ) : (
                    <span className="font-mono font-bold text-2xl text-pn-white">
                      {s.value}
                    </span>
                  )}
                  {s.change && (
                    <span className="font-mono text-xs font-medium text-pn-green mb-0.5">
                      {s.change}
                    </span>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ---- Charts row ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Weekly Revenue Bar Chart */}
          <motion.div
            className="lg:col-span-3"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.25 }}
          >
            <Card>
              <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-5">
                Weekly Revenue
              </p>
              <div className="flex items-end gap-3 h-40">
                {weeklyRevenue.map((d, i) => {
                  const heightPct = (d.value / revenueMax) * 100;
                  return (
                    <div
                      key={d.day}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <span className="font-mono text-[10px] text-pn-green">
                        ${d.value}
                      </span>
                      <div className="w-full bg-pn-surface-2 rounded-sm overflow-hidden relative" style={{ height: '100px' }}>
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 bg-pn-green/80 rounded-sm"
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPct}%` }}
                          transition={{
                            duration: 0.6,
                            delay: 0.3 + i * 0.06,
                            ease: 'easeOut',
                          }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-pn-muted">
                        {d.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Revenue Breakdown */}
          <motion.div
            className="lg:col-span-2"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.35 }}
          >
            <Card className="h-full">
              <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-5">
                Revenue by Source
              </p>
              <div className="space-y-4">
                {sources.map((src, i) => (
                  <div key={src.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-pn-text">{src.name}</span>
                      <div className="flex items-center gap-2">
                        <UsdcAmount amount={src.amount} size="sm" />
                        <span className="font-mono text-[10px] text-pn-muted">
                          {src.pct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-pn-surface-2 rounded-sm overflow-hidden">
                      <AnimatedBar
                        pct={src.pct}
                        colorClass={src.color}
                        delay={0.4 + i * 0.08}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ---- Content Management ---- */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.45 }}
        >
          <Card className="!p-0 overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center gap-1 px-5 pt-5 pb-3 border-b border-pn-border">
              {(['all', 'drops', 'reviews', 'shop'] as ContentTab[]).map(
                (t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-colors ${
                      tab === t
                        ? 'bg-pn-surface-2 text-pn-white'
                        : 'text-pn-muted hover:text-pn-text hover:bg-pn-surface-2/50'
                    }`}
                  >
                    {t}
                  </button>
                ),
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-pn-border text-left">
                    <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-pn-muted font-medium">
                      Title
                    </th>
                    <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-pn-muted font-medium">
                      Type
                    </th>
                    <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-pn-muted font-medium text-right">
                      Views
                    </th>
                    <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-pn-muted font-medium text-right">
                      Revenue
                    </th>
                    <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-pn-muted font-medium hidden md:table-cell">
                      Date
                    </th>
                    <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-pn-muted font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, i) => (
                    <motion.tr
                      key={row.title}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-pn-border/50 hover:bg-pn-surface-2/40 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-pn-white font-medium max-w-[280px] truncate">
                        {row.title}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={row.type}>
                          {row.type}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-pn-text">
                        {row.views}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {row.revenue > 0 ? (
                          <UsdcAmount amount={row.revenue} size="sm" />
                        ) : (
                          <span className="text-pn-muted font-mono text-sm">--</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-pn-muted text-xs hidden md:table-cell">
                        {row.date}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`font-mono text-[10px] uppercase tracking-wider ${statusStyle[row.status]}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* ---- Quick Actions ---- */}
        <motion.div
          className="flex flex-wrap items-center gap-3"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.55 }}
        >
          <Button variant="primary" size="lg" onClick={() => window.location.href = '/drops/create'}>
            Create New Drop
          </Button>
          <Button variant="secondary" size="lg" onClick={() => window.location.href = '/reviews/create'}>
            Write Review
          </Button>
          <Button variant="secondary" size="lg" onClick={() => alert('Shop link creation coming soon.')}>
            Add Shop Link
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="!text-pn-green"
            onClick={() => {
              if (!connected) { connect(); return; }
              alert('Wire withdrawal initiated. On-chain transfer coming soon.');
            }}
          >
            Wire Withdrawal
          </Button>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
