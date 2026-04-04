export const GAME_CATEGORIES = [
  { slug: 'monster-hunter-wilds', label: 'Monster Hunter Wilds', tag: 'monster_hunter_wilds' },
  { slug: 'elden-ring', label: 'Elden Ring', tag: 'elden_ring' },
  { slug: 'stellar-blade', label: 'Stellar Blade', tag: 'stellar_blade' },
  { slug: 'ff7-rebirth', label: 'FF7 Rebirth', tag: 'ff7_rebirth' },
  { slug: 'palworld', label: 'Palworld', tag: 'palworld' },
  { slug: 'hollow-knight-silksong', label: 'Hollow Knight: Silksong', tag: 'hollow_knight_silksong' },
  { slug: 'gta-vi', label: 'GTA VI', tag: 'gta_vi' },
  { slug: 'hades-2', label: 'Hades II', tag: 'hades_2' },
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
  return GAME_CATEGORIES.find(g => g.tag === tag)?.label || tag.replace(/_/g, ' ');
}

export function getCategoryLabel(id: number): string {
  return CONTENT_CATEGORIES.find(c => c.id === id)?.label || 'Guide';
}
