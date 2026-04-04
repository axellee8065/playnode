export const GAME_CATEGORIES = [
  { slug: 'monster-hunter-wilds', label: 'Monster Hunter Wilds', tag: 'monster-hunter-wilds' },
  { slug: 'elden-ring', label: 'Elden Ring', tag: 'elden-ring' },
  { slug: 'stellar-blade', label: 'Stellar Blade', tag: 'stellar-blade' },
  { slug: 'ff7-rebirth', label: 'FF7 Rebirth', tag: 'ff7-rebirth' },
  { slug: 'palworld', label: 'Palworld', tag: 'palworld' },
  { slug: 'hollow-knight-silksong', label: 'Hollow Knight: Silksong', tag: 'hollow-knight-silksong' },
  { slug: 'gta-vi', label: 'GTA VI', tag: 'gta-vi' },
  { slug: 'hades-2', label: 'Hades II', tag: 'hades-2' },
];

export const CONTENT_CATEGORIES = [
  { id: 0, label: 'Boss Guide' },
  { id: 1, label: 'Build Guide' },
  { id: 2, label: 'Quest Guide' },
  { id: 3, label: 'Tier List' },
  { id: 4, label: 'Speedrun' },
  { id: 5, label: 'General' },
];

export function getGameLabel(tag: string): string {
  // Match by tag (hyphen) or slug, case-insensitive
  const found = GAME_CATEGORIES.find(
    g => g.tag === tag || g.slug === tag || g.tag === tag.replace(/_/g, '-')
  );
  return found?.label || tag.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function getCategoryLabel(id: number): string {
  return CONTENT_CATEGORIES.find(c => c.id === id)?.label || 'Guide';
}
