'use client';

import { type FC, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { Badge, Button, Card, UsdcAmount } from '@/components/common';
import { api, formatUsdc, formatViews } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  DollarSign,
  Settings,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Animation                                                          */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

/* ------------------------------------------------------------------ */
/*  Studio Sidebar                                                     */
/* ------------------------------------------------------------------ */

type StudioTab = 'overview' | 'content' | 'analytics' | 'revenue' | 'settings';

const sidebarLinks: { id: StudioTab; label: string; icon: React.ElementType; href?: string; badge?: string }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/studio' },
  { id: 'content', label: 'Content', icon: FileText, href: '/studio/content' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: 'Soon' },
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

const StudioSidebar: FC<{ active: StudioTab }> = ({ active }) => (
  <aside className="hidden md:flex flex-col w-[240px] fixed left-0 top-14 bottom-0 bg-pn-dark border-r border-pn-border overflow-y-auto">
    <div className="px-4 py-5">
      <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-1">
        Creator Studio
      </p>
    </div>
    <nav className="flex-1 px-2 space-y-0.5">
      {sidebarLinks.map((link) => {
        const Icon = link.icon;
        const isActive = link.id === active;
        const Wrapper = link.href ? Link : ('button' as any);
        const wrapperProps = link.href ? { href: link.href } : {};
        return (
          <Wrapper
            key={link.id}
            {...wrapperProps}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-pn-surface-2 text-pn-white'
                : 'text-pn-muted hover:text-pn-text hover:bg-pn-surface-2/50'
            }`}
          >
            <Icon size={18} />
            <span>{link.label}</span>
            {link.badge && (
              <span className="ml-auto text-[10px] font-mono bg-pn-surface-3 text-pn-muted px-1.5 py-0.5 rounded">
                {link.badge}
              </span>
            )}
          </Wrapper>
        );
      })}
    </nav>
  </aside>
);

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

type ContentStatus = 'published' | 'draft' | 'pending';
type ContentTab = 'all' | 'published' | 'drafts';

interface ContentItem {
  id: string;
  title: string;
  type: 'drop' | 'review' | 'shop';
  views: string;
  revenue: number;
  date: string;
  status: ContentStatus;
  thumbnail?: string;
}

const mockContent: ContentItem[] = [
  { id: '1', title: 'Monster Hunter Wilds - Early Weapon Guide', type: 'drop', views: '48.2K', revenue: 820.0, date: '2026-03-28', status: 'published' },
  { id: '2', title: 'Elden Ring DLC - Complete Boss Walkthrough', type: 'drop', views: '35.1K', revenue: 640.0, date: '2026-03-22', status: 'published' },
  { id: '3', title: 'Stellar Blade - Honest Review', type: 'review', views: '22.8K', revenue: 310.0, date: '2026-03-15', status: 'published' },
  { id: '4', title: 'Palworld Multiplayer Setup Guide', type: 'drop', views: '18.5K', revenue: 280.0, date: '2026-03-10', status: 'published' },
  { id: '5', title: 'GTA VI Pre-Order Link', type: 'shop', views: '12.3K', revenue: 190.0, date: '2026-03-05', status: 'published' },
  { id: '6', title: 'Hollow Knight: Silksong Review (Draft)', type: 'review', views: '--', revenue: 0, date: '2026-04-02', status: 'draft' },
  { id: '7', title: 'FF7 Rebirth - Platinum Trophy Roadmap', type: 'drop', views: '--', revenue: 0, date: '2026-04-03', status: 'draft' },
  { id: '8', title: 'Hades II - Best Boon Combos', type: 'drop', views: '8.1K', revenue: 120.0, date: '2026-02-28', status: 'published' },
  { id: '9', title: 'Monster Hunter Wilds - Endgame Farming Routes', type: 'drop', views: '55.8K', revenue: 920.0, date: '2026-02-20', status: 'published' },
  { id: '10', title: 'Elden Ring - Speedrun Guide (Pending)', type: 'drop', views: '--', revenue: 0, date: '2026-04-01', status: 'pending' },
];

const statusStyle: Record<string, string> = {
  published: 'text-pn-green',
  draft: 'text-pn-muted',
  pending: 'text-pn-amber',
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const StudioContentPage: FC = () => {
  const [tab, setTab] = useState<ContentTab>('all');
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Fetch live data
  const { data: apiDrops } = useApi(() => api.getDrops({ take: 20 }), []);

  const liveContent: ContentItem[] | null =
    Array.isArray(apiDrops) && apiDrops.length > 0
      ? apiDrops.map((d) => ({
          id: d.id,
          title: d.title,
          type: 'drop' as const,
          views: formatViews(d.totalViews),
          revenue: Number(d.totalEarned) / 1_000_000,
          date: String(d.createdAt).slice(0, 10),
          status: 'published' as const,
        }))
      : null;

  const allContent = liveContent || mockContent;

  const filtered = useMemo(() => {
    let items = allContent;

    // Filter by tab
    if (tab === 'published') items = items.filter((c) => c.status === 'published');
    if (tab === 'drafts') items = items.filter((c) => c.status === 'draft');

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((c) => c.title.toLowerCase().includes(q));
    }

    return items;
  }, [allContent, tab, search]);

  const tabs: { id: ContentTab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: allContent.length },
    { id: 'published', label: 'Published', count: allContent.filter((c) => c.status === 'published').length },
    { id: 'drafts', label: 'Drafts', count: allContent.filter((c) => c.status === 'draft').length },
  ];

  return (
    <div className="min-h-screen bg-pn-black">
      <Header />
      <div className="flex">
        <StudioSidebar active="content" />
        <main className="flex-1 ml-0 md:ml-[240px] pt-14">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-8 space-y-6">
            {/* Page header */}
            <motion.div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <div>
                <h1 className="text-pn-white text-2xl font-bold">Content</h1>
                <p className="text-pn-muted text-sm mt-1">
                  Manage all your drops, reviews, and shop links.
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => (window.location.href = '/drops/create')}
              >
                Create New
              </Button>
            </motion.div>

            {/* Tabs + Search */}
            <motion.div
              className="flex flex-col sm:flex-row sm:items-center gap-4"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-1">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-colors ${
                      tab === t.id
                        ? 'bg-pn-surface-2 text-pn-white'
                        : 'text-pn-muted hover:text-pn-text hover:bg-pn-surface-2/50'
                    }`}
                  >
                    {t.label}
                    <span className="ml-1.5 text-pn-muted">{t.count}</span>
                  </button>
                ))}
              </div>
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-pn-muted" />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-pn-surface rounded-lg border border-pn-border text-sm text-pn-text placeholder:text-pn-muted focus:outline-none focus:border-pn-green/50 transition-colors"
                />
              </div>
            </motion.div>

            {/* Content Table */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.2 }}
            >
              <Card className="!p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-pn-border text-left">
                        <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-pn-muted font-medium w-8">
                          {/* Thumbnail */}
                        </th>
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
                        <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-pn-muted font-medium">
                          Status
                        </th>
                        <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-pn-muted font-medium hidden md:table-cell">
                          Date
                        </th>
                        <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-pn-muted font-medium w-10">
                          {/* Actions */}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((row, i) => (
                        <motion.tr
                          key={row.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-pn-border/50 hover:bg-pn-surface-2/40 transition-colors group"
                        >
                          {/* Thumbnail placeholder */}
                          <td className="px-5 py-3">
                            <div className="w-24 h-14 bg-pn-surface-2 rounded-md flex items-center justify-center">
                              <FileText size={16} className="text-pn-muted" />
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-pn-white font-medium max-w-[280px] truncate">
                            {row.title}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge variant={row.type}>{row.type}</Badge>
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
                          <td className="px-5 py-3.5">
                            <span
                              className={`font-mono text-[10px] uppercase tracking-wider ${statusStyle[row.status]}`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-pn-muted text-xs hidden md:table-cell">
                            {row.date}
                          </td>
                          <td className="px-5 py-3.5 relative">
                            <button
                              onClick={() => setMenuOpen(menuOpen === row.id ? null : row.id)}
                              className="p-1 rounded-md hover:bg-pn-surface-2 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <MoreVertical size={16} className="text-pn-muted" />
                            </button>
                            {menuOpen === row.id && (
                              <div className="absolute right-5 top-full mt-1 z-20 bg-pn-surface border border-pn-border rounded-lg shadow-xl py-1 min-w-[120px]">
                                <button
                                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-pn-text hover:bg-pn-surface-2 transition-colors"
                                  onClick={() => {
                                    setMenuOpen(null);
                                    alert('Edit coming soon');
                                  }}
                                >
                                  <Pencil size={12} /> Edit
                                </button>
                                <button
                                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-pn-surface-2 transition-colors"
                                  onClick={() => {
                                    setMenuOpen(null);
                                    alert('Delete coming soon');
                                  }}
                                >
                                  <Trash2 size={12} /> Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-5 py-12 text-center">
                            <p className="text-pn-muted font-mono text-sm">No content found.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudioContentPage;
