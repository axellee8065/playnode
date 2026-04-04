'use client';

import { type FC } from 'react';
import { Bookmark } from 'lucide-react';
import { getGameLabel, getCategoryLabel } from '@/lib/games';
import { useFavorites } from '@/hooks/useFavorites';

interface ContentCardProps {
  type: 'drop' | 'review';
  id: string;
  title: string;
  gameTag: string;
  author: string;
  views: string;
  price?: string;
  isPremium?: boolean;
  rating?: number;
  verifiedHours?: number;
  createdAt: string;
  category?: number;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return Math.abs(hash);
}

function tagToGradient(tag: string): string {
  const h = hashCode(tag);
  const hue1 = h % 360;
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 60%, 18%) 0%, hsl(${hue2}, 50%, 12%) 100%)`;
}

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

const ContentCard: FC<ContentCardProps> = ({
  type,
  id,
  title,
  gameTag,
  author,
  views,
  price,
  isPremium,
  rating,
  verifiedHours,
  createdAt,
  category,
}) => {
  const href = type === 'drop' ? `/drop/${id}` : `/review/${id}`;
  const gameLabel = getGameLabel(gameTag);
  const typeBadge = type === 'drop' ? 'GUIDE' : 'REVIEW';
  const categoryLabel = category !== undefined ? getCategoryLabel(category) : null;
  const isFree = !isPremium && (!price || price === '0');
  const { toggleDrop, toggleReview, isDropFavorite, isReviewFavorite } = useFavorites();
  const isFavorited = type === 'drop' ? isDropFavorite(id) : isReviewFavorite(id);

  return (
    <div className="group relative block rounded-xl transition-all duration-200 hover:scale-[1.02] hover:border-pn-border-light">
      <a href={href} className="block">
      {/* Thumbnail */}
      <div
        className="relative aspect-video w-full rounded-xl overflow-hidden"
        style={{ background: tagToGradient(gameTag) }}
      >
        {/* Game badge — top-left */}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-pn-black/70 text-[10px] font-semibold text-pn-white backdrop-blur-sm truncate max-w-[70%]">
          {gameLabel}
        </span>

        {/* Price badge — top-right */}
        <span
          className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-sm ${
            isFree
              ? 'bg-pn-green/10 text-pn-green'
              : 'bg-pn-surface/80 text-pn-white'
          }`}
        >
          {isFree ? 'FREE' : `${price} USDC`}
        </span>

        {/* Type badge — bottom-right */}
        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-pn-black/70 text-[10px] font-semibold text-pn-white backdrop-blur-sm">
          {typeBadge}
        </span>

        {/* Category badge — bottom-left (only for drops with a category) */}
        {categoryLabel && (
          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-pn-black/70 text-[10px] text-pn-muted backdrop-blur-sm">
            {categoryLabel}
          </span>
        )}
      </div>

      {/* Info area */}
      <div className="p-3 flex gap-3">
        {/* Curator avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pn-surface-2 flex items-center justify-center text-xs font-bold text-pn-white uppercase">
          {author.charAt(0)}
        </div>

        {/* Text column */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-pn-white line-clamp-2 leading-snug">
            {title}
          </h3>
          <p className="text-xs text-pn-muted mt-1 truncate">
            {author}
            <span className="mx-1">&middot;</span>
            {views} views
            <span className="mx-1">&middot;</span>
            {timeAgo(createdAt)}
          </p>
          {type === 'review' && rating !== undefined && (
            <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-pn-cyan/10 text-pn-cyan text-[11px] font-semibold">
              {rating.toFixed(1)}/10
            </span>
          )}
          {type === 'review' && verifiedHours !== undefined && verifiedHours > 0 && (
            <span className="inline-block mt-1.5 ml-1.5 px-2 py-0.5 rounded-md bg-pn-surface-2 text-pn-muted text-[11px]">
              {verifiedHours}h played
            </span>
          )}
        </div>

        {/* Bookmark button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            type === 'drop' ? toggleDrop(id) : toggleReview(id);
          }}
          className="flex-shrink-0 self-start mt-1"
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Bookmark
            size={16}
            className={isFavorited ? 'fill-pn-amber text-pn-amber' : 'text-pn-muted hover:text-pn-white'}
          />
        </button>
      </div>
      </a>
    </div>
  );
};

export default ContentCard;
