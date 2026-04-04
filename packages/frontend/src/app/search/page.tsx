'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search as SearchIcon, FileText, Star, User, Loader2, Eye } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, Badge } from '@/components/common';
import { api, formatViews } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

/* ------------------------------------------------------------------ */
/*  Mock search results                                                */
/* ------------------------------------------------------------------ */
function getMockResults(q: string) {
  const lower = q.toLowerCase();
  return {
    drops: [
      { id: 'mock-d1', type: 'drop', title: 'Charge Blade Master Guide', gameTag: 'MH_WILDS', author: 'GameMaster_KR', views: '24.3K' },
      { id: 'mock-d2', type: 'drop', title: 'Elden Ring Speedrun Route v4', gameTag: 'ELDEN_RING', author: 'SpeedKing', views: '18.1K' },
      { id: 'mock-d3', type: 'drop', title: 'Valorant Tier List S8', gameTag: 'VALORANT', author: 'TierGod', views: '41.2K' },
    ].filter((d) => d.title.toLowerCase().includes(lower) || d.gameTag.toLowerCase().includes(lower)),
    reviews: [
      { id: 'mock-r1', type: 'review', title: 'Elden Ring', rating: 92, author: 'DragonSlayer', views: '18.4K' },
      { id: 'mock-r2', type: 'review', title: 'Baldur\'s Gate 3', rating: 95, author: 'CriticalGamer', views: '31.2K' },
    ].filter((r) => r.title.toLowerCase().includes(lower)),
    nodes: [
      { id: 'mock-n1', type: 'node', displayName: 'GameMaster_KR', rank: 4, totalDrops: 12, totalReviews: 5 },
      { id: 'mock-n2', type: 'node', displayName: 'SpeedKing', rank: 3, totalDrops: 8, totalReviews: 3 },
    ].filter((n) => n.displayName.toLowerCase().includes(lower)),
  };
}

/* ------------------------------------------------------------------ */
/*  Result section component                                           */
/* ------------------------------------------------------------------ */
function ResultSection({
  title,
  icon: Icon,
  color,
  children,
  count,
}: {
  title: string;
  icon: React.ElementType;
  color: string;
  children: React.ReactNode;
  count: number;
}) {
  if (count === 0) return null;
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`h-4 w-4 ${color}`} />
        <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-pn-muted">
          {title}
        </h2>
        <span className="ml-1 rounded-full bg-pn-surface-2 px-2 py-0.5 text-[10px] font-mono text-pn-muted">
          {count}
        </span>
      </div>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
        {children}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Inner search content (uses useSearchParams)                        */
/* ------------------------------------------------------------------ */
function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: apiResults, loading, error } = useApi(
    () => (query ? api.search(query) : Promise.resolve(null)),
    [query],
  );

  // Normalize API results or fall back to mock
  const results = apiResults && !error
    ? {
        drops: Array.isArray(apiResults.drops) ? apiResults.drops : [],
        reviews: Array.isArray(apiResults.reviews) ? apiResults.reviews : [],
        nodes: Array.isArray(apiResults.nodes) ? apiResults.nodes : [],
      }
    : query
      ? getMockResults(query)
      : { drops: [], reviews: [], nodes: [] };

  const totalResults = results.drops.length + results.reviews.length + results.nodes.length;

  return (
    <>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <h1 className="font-primary text-3xl font-extrabold text-pn-white sm:text-4xl tracking-tight">
          Search Results
        </h1>
        {query && (
          <p className="mt-2 text-pn-muted text-lg">
            {loading
              ? 'Searching...'
              : `${totalResults} result${totalResults !== 1 ? 's' : ''} for "${query}"`}
          </p>
        )}
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-pn-green animate-spin" />
        </div>
      )}

      {/* No query */}
      {!loading && !query && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchIcon className="h-12 w-12 text-pn-muted/30 mb-4" />
          <p className="text-pn-muted text-lg">Enter a search term to find guides, reviews, and creators</p>
        </div>
      )}

      {/* Empty results */}
      {!loading && query && totalResults === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchIcon className="h-12 w-12 text-pn-muted/30 mb-4" />
          <p className="text-pn-muted text-lg">No results found for &ldquo;{query}&rdquo;</p>
          <p className="text-pn-muted/60 text-sm mt-1">Try a different search term</p>
        </div>
      )}

      {/* Results */}
      {!loading && totalResults > 0 && (
        <>
          {/* Drops */}
          <ResultSection title="Drops" icon={FileText} color="text-pn-green" count={results.drops.length}>
            {results.drops.map((drop: any) => (
              <motion.a key={drop.id} href={`/drop/${drop.id}`} variants={fadeUp}>
                <Card className="!p-4 group cursor-pointer hover:border-pn-border-light transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-pn-green/10 border border-pn-green/20">
                      <FileText className="h-4 w-4 text-pn-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="drop">DROP</Badge>
                        <span className="font-mono text-[9px] uppercase text-pn-amber">
                          {drop.gameTag}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-pn-white mt-1 group-hover:text-pn-green transition-colors truncate">
                        {drop.title}
                      </h3>
                      <p className="text-xs text-pn-muted mt-0.5">
                        by {drop.node?.displayName || drop.author}
                        {drop.views || drop.totalViews ? ` · ${formatViews(drop.views || drop.totalViews)} views` : ''}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.a>
            ))}
          </ResultSection>

          {/* Reviews */}
          <ResultSection title="Reviews" icon={Star} color="text-pn-cyan" count={results.reviews.length}>
            {results.reviews.map((review: any) => (
              <motion.a key={review.id} href={`/review/${review.id}`} variants={fadeUp}>
                <Card className="!p-4 group cursor-pointer hover:border-pn-border-light transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-pn-cyan/10 border border-pn-cyan/20">
                      <span className="font-mono text-sm font-bold text-pn-cyan">
                        {review.rating}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="review">REVIEW</Badge>
                      </div>
                      <h3 className="text-sm font-semibold text-pn-white mt-1 group-hover:text-pn-cyan transition-colors truncate">
                        {review.title || review.gameTag?.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-xs text-pn-muted mt-0.5">
                        by {review.node?.displayName || review.author}
                        {review.views || review.totalViews ? ` · ${formatViews(review.views || review.totalViews)} views` : ''}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.a>
            ))}
          </ResultSection>

          {/* Nodes */}
          <ResultSection title="Nodes" icon={User} color="text-pn-purple" count={results.nodes.length}>
            {results.nodes.map((node: any) => (
              <motion.a key={node.id} href={`/node/${node.id}`} variants={fadeUp}>
                <Card className="!p-4 group cursor-pointer hover:border-pn-border-light transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-pn-purple/10 border border-pn-purple/20 font-mono text-sm font-bold text-pn-purple">
                      {(node.displayName || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-pn-white group-hover:text-pn-purple transition-colors truncate">
                        {node.displayName}
                      </h3>
                      <p className="text-xs text-pn-muted mt-0.5">
                        Rank {node.rank} · {node.totalDrops} drops · {node.totalReviews} reviews
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.a>
            ))}
          </ResultSection>
        </>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function SearchPage() {
  return (
    <div className="min-h-screen bg-pn-black flex flex-col">
      <Header />

      {/* Background effects */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(42,42,50,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(42,42,50,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <main className="relative z-10 flex-1">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 pt-16 pb-20">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 text-pn-green animate-spin" />
              </div>
            }
          >
            <SearchContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
