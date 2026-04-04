'use client';

import { type FC, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Badge, Button, Card, UsdcAmount, StatCard } from '@/components/common';
import { api, formatViews, formatUsdc } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { useWallet } from '@/components/providers/SuiProvider';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const stats = [
  { label: 'Total Grids', value: '1,240' },
  { label: 'Available Pixels', value: '48.2K' },
  { label: 'Avg Price/Pixel', value: '2.40 USDC' },
  { label: 'Monthly Revenue', value: '28.4K USDC', change: '+14%' },
];

type SortOption = 'popular' | 'price' | 'availability';

interface GridListing {
  creator: string;
  pageTitle: string;
  pixels: boolean[][];
  occupancy: number;
  priceMin: number;
  priceMax: number;
  monthlyViews: string;
  colors: string[];
}

const gridListings: GridListing[] = [
  {
    creator: 'GameMaster_KR',
    pageTitle: 'MH Wilds Complete Walkthrough',
    pixels: [[true,true,true,false,false,true,true,false,false,false],[true,true,false,false,true,true,false,false,false,false],[false,true,true,true,false,false,false,false,false,false],[true,false,false,true,true,false,false,false,false,false],[false,false,true,false,false,true,false,false,false,false]],
    occupancy: 34, priceMin: 1.5, priceMax: 4.0, monthlyViews: '128K',
    colors: ['bg-pn-purple', 'bg-pn-cyan', 'bg-pn-green', 'bg-pn-amber'],
  },
  {
    creator: 'SoulsBorne_Pro',
    pageTitle: 'Elden Ring DLC Boss Guide',
    pixels: [[true,true,true,true,true,false,false,false,false,false],[true,true,true,true,false,false,false,true,false,false],[true,true,false,false,false,false,true,true,false,false],[false,true,true,false,false,false,false,false,false,false],[false,false,true,true,false,false,false,false,false,false]],
    occupancy: 48, priceMin: 2.0, priceMax: 5.5, monthlyViews: '95K',
    colors: ['bg-pn-red', 'bg-pn-amber', 'bg-pn-purple', 'bg-pn-cyan'],
  },
  {
    creator: 'RPG_Queen',
    pageTitle: 'FF7 Rebirth Complete Walkthrough',
    pixels: [[true,true,false,true,true,true,false,false,true,false],[true,false,false,true,true,false,false,true,true,false],[false,false,true,false,true,true,false,false,false,false],[true,true,false,false,false,true,true,false,false,false],[false,true,true,false,false,false,true,false,false,false]],
    occupancy: 52, priceMin: 1.8, priceMax: 3.5, monthlyViews: '84K',
    colors: ['bg-pn-blue', 'bg-pn-green', 'bg-pn-amber', 'bg-pn-purple'],
  },
  {
    creator: 'IndieDev_Lee',
    pageTitle: "Baldur's Gate 3 Multiplayer Guide",
    pixels: [[true,true,true,true,true,true,true,false,false,false],[true,true,true,true,true,true,false,false,false,false],[true,true,true,false,true,false,false,false,false,false],[true,true,false,false,false,false,false,false,false,false],[true,false,false,false,false,false,false,false,false,false]],
    occupancy: 62, priceMin: 3.0, priceMax: 7.0, monthlyViews: '210K',
    colors: ['bg-pn-green', 'bg-pn-purple', 'bg-pn-cyan', 'bg-pn-red'],
  },
  {
    creator: 'FPS_Hawk',
    pageTitle: 'Valorant Agent Tier List',
    pixels: [[true,false,false,false,false,false,false,false,false,false],[true,true,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false,false],[false,false,true,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false,false]],
    occupancy: 10, priceMin: 0.8, priceMax: 1.5, monthlyViews: '42K',
    colors: ['bg-pn-red', 'bg-pn-cyan'],
  },
  {
    creator: 'MMO_Sage',
    pageTitle: 'Lost Ark Season 3 Raid Guide',
    pixels: [[true,true,true,true,false,true,true,true,false,false],[true,true,true,false,false,true,true,false,false,false],[true,true,false,false,true,false,true,true,false,false],[false,true,true,true,false,false,false,true,false,false],[false,false,true,true,true,false,false,false,false,false]],
    occupancy: 58, priceMin: 2.5, priceMax: 6.0, monthlyViews: '175K',
    colors: ['bg-pn-amber', 'bg-pn-purple', 'bg-pn-green', 'bg-pn-blue'],
  },
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
  const { connected, connect } = useWallet();

  const { data: apiGrids } = useApi(() => api.getGrids(), []);

  const displayGrids = apiGrids
    ? apiGrids.map((g) => ({
        creator: 'Game Curator',
        pageTitle: `Grid ${String(g.id).slice(0, 8)}`,
        pixels: gridListings[0].pixels,
        occupancy: g.totalPixels > 0 ? Math.round((g.soldPixels / g.totalPixels) * 100) : 0,
        priceMin: Number(g.basePrice) / 1_000_000,
        priceMax: (Number(g.basePrice) / 1_000_000) * 3,
        monthlyViews: formatViews(g.monthlyViews),
        colors: gridListings[0].colors,
      }))
    : null;

  const displayListings = displayGrids || gridListings;

  const displayStats = Array.isArray(apiGrids) && apiGrids.length > 0
    ? [
        { label: 'Total Grids', value: String(apiGrids.length) },
        { label: 'Available Pixels', value: formatViews(String(apiGrids.reduce((sum, g) => sum + (g.totalPixels - g.soldPixels), 0))) },
        { label: 'Avg Price/Pixel', value: stats[2].value },
        { label: 'Monthly Revenue', value: `$${formatUsdc(String(apiGrids.reduce((sum, g) => sum + Number(g.totalRevenue), 0)))}`, change: stats[3].change },
      ]
    : stats;

  const sortLabels: Record<SortOption, string> = {
    popular: 'Popular',
    price: 'Price',
    availability: 'Availability',
  };

  return (
    <div className="min-h-screen bg-pn-black">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-0 lg:ml-56 pt-16">
          <div className="px-4 lg:px-6 py-6 space-y-8">
            {/* Small title */}
            <h1 className="font-mono text-sm font-semibold uppercase tracking-wider text-pn-muted">
              Pixel Grid Market
            </h1>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {displayStats.map((s) => (
                <StatCard key={s.label} label={s.label} value={s.value} change={s.change} />
              ))}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-pn-muted">
                Sort by
              </span>
              {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    sort === key
                      ? 'bg-pn-white text-pn-black font-semibold'
                      : 'bg-pn-surface-2 text-pn-muted hover:text-pn-white'
                  }`}
                >
                  {sortLabels[key]}
                </button>
              ))}
            </div>

            {/* Grid Listings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayListings.map((grid, i) => (
                <Card key={grid.pageTitle + i} className="h-full">
                  <div className="flex flex-col gap-4">
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

                    <div className="bg-pn-dark rounded-lg p-3 border border-pn-border/50">
                      <PixelGrid pixels={grid.pixels} colors={grid.colors} />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-1">Occupancy</p>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-pn-purple">{grid.occupancy}%</span>
                          <div className="flex-1 h-1.5 bg-pn-surface-2 rounded-full overflow-hidden">
                            <div className="h-full bg-pn-purple rounded-full" style={{ width: `${grid.occupancy}%` }} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-1">Price Range</p>
                        <span className="font-mono text-sm font-bold text-pn-green">${grid.priceMin} - ${grid.priceMax}</span>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-1">Monthly Views</p>
                        <span className="font-mono text-sm font-bold text-pn-white">{grid.monthlyViews}</span>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      size="md"
                      className="!bg-pn-purple/10 !border-pn-purple/30 !text-pn-purple hover:!bg-pn-purple/20 w-full"
                      onClick={() => {
                        if (!connected) { connect(); return; }
                        alert('Pixel purchase flow coming soon.');
                      }}
                    >
                      Advertise
                    </Button>
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

export default GridMarketPage;
