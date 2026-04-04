'use client';

import { type FC, useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Badge, Button, Card, StatCard } from '@/components/common';
import { api, formatUsdc } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { useWallet } from '@/components/providers/SuiProvider';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const stats = [
  { label: 'Open Quests', value: '24' },
  { label: 'Total Rewarded', value: '12.4K USDC', change: '+32%' },
  { label: 'Avg Reward', value: '180 USDC' },
  { label: 'Active Curators', value: '89', change: '+8%' },
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
  { id: 'q1', title: 'Write MH Wilds Charge Blade Guide', gameTag: 'Monster Hunter Wilds', category: 'writing', reward: 200, deadline: '2026-04-15', minRank: 'Silver', status: 'OPEN', description: 'Write a beginner-to-intermediate guide covering Charge Blade basic combos, GP, SAED timing, and more. Minimum 3,000 words with at least 5 screenshots.', publisher: 'Capcom KR' },
  { id: 'q2', title: 'Elden Ring DLC Localization', gameTag: 'Elden Ring', category: 'translation', reward: 150, deadline: '2026-04-20', minRank: 'Gold', status: 'OPEN', description: "Translate 200 item descriptions and NPC dialogues from Shadow of the Erdtree DLC. Archaic tone matching the game's lore is required.", publisher: 'FromSoftware' },
  { id: 'q3', title: "Baldur's Gate 3 Multiplayer Video Production", gameTag: "Baldur's Gate 3", category: 'video', reward: 350, deadline: '2026-04-25', minRank: 'Silver', status: 'OPEN', description: '4-player co-op highlight video (10-15 min). Includes editing, subtitles, and thumbnail.', publisher: 'Larian Studios' },
  { id: 'q4', title: 'Stellar Blade Combat System Review', gameTag: 'Stellar Blade', category: 'review', reward: 120, deadline: '2026-04-12', minRank: 'Bronze', status: 'IN_PROGRESS', description: 'In-depth review covering combat system pros and cons, boss difficulty analysis, and comparison with other action games.', publisher: 'SHIFT UP' },
  { id: 'q5', title: 'GTA VI Pre-Release Info Comprehensive Guide', gameTag: 'GTA VI', category: 'writing', reward: 250, deadline: '2026-05-01', minRank: 'Gold', status: 'OPEN', description: 'Pre-release guide compiling released trailers, interviews, and leak info.', publisher: 'Community' },
  { id: 'q6', title: 'Lost Ark Season 3 Raid Walkthrough Video', gameTag: 'Lost Ark', category: 'video', reward: 180, deadline: '2026-04-18', minRank: 'Silver', status: 'IN_PROGRESS', description: 'Echidna Hard Mode Gates 1-4 walkthrough video with mechanic explanations.', publisher: 'Smilegate RPG' },
];

const categoryLabels: Record<QuestCategory, string> = {
  all: 'All', writing: 'Writing', review: 'Review', video: 'Video', translation: 'Translation',
};

const rankColors: Record<string, string> = {
  Bronze: 'text-pn-amber', Silver: 'text-pn-text', Gold: 'text-pn-amber', Diamond: 'text-pn-purple',
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
const QuestPage: FC = () => {
  const [category, setCategory] = useState<QuestCategory>('all');
  const { connected, connect } = useWallet();

  const { data: apiQuests } = useApi(() => api.getQuests(), []);

  const displayQuests: Quest[] = apiQuests
    ? apiQuests.map((q) => ({
        id: q.id,
        title: q.title,
        gameTag: q.gameTag,
        category: 'writing' as QuestCategory,
        reward: Number(q.rewardAmount) / 1_000_000,
        deadline: String(q.deadline).slice(0, 10),
        minRank: q.minRank >= 3 ? 'Gold' : q.minRank >= 2 ? 'Silver' : 'Bronze',
        status: q.status === 0 ? 'OPEN' as const : 'IN_PROGRESS' as const,
        description: q.description,
        publisher: String(q.creator).slice(0, 10) + '...',
      }))
    : quests;

  const filteredQuests = category === 'all'
    ? displayQuests
    : displayQuests.filter((q) => q.category === category);

  return (
    <div className="min-h-screen bg-pn-black">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-0 lg:ml-56 pt-16">
          <div className="px-4 lg:px-6 py-6 space-y-8">
            {/* Small title */}
            <h1 className="font-mono text-sm font-semibold uppercase tracking-wider text-pn-muted">
              Quest Board
            </h1>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s) => (
                <StatCard key={s.label} label={s.label} value={s.value} change={s.change} />
              ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(categoryLabels) as QuestCategory[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    category === key
                      ? 'bg-pn-white text-pn-black font-semibold'
                      : 'bg-pn-surface-2 text-pn-muted hover:text-pn-white'
                  }`}
                >
                  {categoryLabels[key]}
                </button>
              ))}
            </div>

            {/* Quest List */}
            <div className="space-y-4">
              {filteredQuests.map((quest) => (
                <Card key={quest.id} className="!p-0 overflow-hidden">
                  <div className="flex">
                    <div className="w-1 bg-pn-amber shrink-0" />
                    <div className="flex-1 p-5">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-pn-white font-semibold text-base">{quest.title}</h3>
                            <Badge variant="quest">{quest.gameTag}</Badge>
                            <span className={`font-mono text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                              quest.status === 'OPEN' ? 'bg-pn-green/10 text-pn-green' : 'bg-pn-amber/10 text-pn-amber'
                            }`}>
                              {quest.status === 'OPEN' ? 'OPEN' : 'IN PROGRESS'}
                            </span>
                          </div>
                          <p className="text-pn-muted text-xs font-mono mb-2">by {quest.publisher}</p>
                          <p className="text-pn-text text-sm leading-relaxed mb-3 line-clamp-2">{quest.description}</p>
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] uppercase tracking-wider text-pn-muted">Deadline</span>
                              <span className="font-mono text-xs text-pn-text">{quest.deadline}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] uppercase tracking-wider text-pn-muted">Min Rank</span>
                              <span className={`font-mono text-xs font-semibold ${rankColors[quest.minRank] || 'text-pn-text'}`}>{quest.minRank}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] uppercase tracking-wider text-pn-muted">Type</span>
                              <span className="font-mono text-xs text-pn-text capitalize">{quest.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex lg:flex-col items-center lg:items-end gap-3 lg:gap-4 shrink-0">
                          <div className="text-right">
                            <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-1">Reward</p>
                            <span className="font-mono text-2xl font-bold text-pn-amber">${quest.reward.toFixed(2)}</span>
                            <span className="ml-1 font-mono text-[10px] text-pn-muted">USDC</span>
                          </div>
                          <Button
                            variant="secondary"
                            size="md"
                            className="!bg-pn-amber/10 !border-pn-amber/30 !text-pn-amber hover:!bg-pn-amber/20 whitespace-nowrap"
                            disabled={quest.status === 'IN_PROGRESS'}
                            onClick={() => {
                              if (quest.status === 'IN_PROGRESS') return;
                              if (!connected) { connect(); return; }
                              alert(`Quest "${quest.title}" accepted!`);
                            }}
                          >
                            {quest.status === 'OPEN' ? 'Accept' : 'In Progress'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuestPage;
