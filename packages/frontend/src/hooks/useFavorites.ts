'use client';
import { useState, useEffect } from 'react';

interface Favorites {
  games: string[];      // game tags
  drops: string[];      // drop IDs
  reviews: string[];    // review IDs
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorites>({ games: [], drops: [], reviews: [] });

  useEffect(() => {
    const saved = localStorage.getItem('playnode_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const save = (updated: Favorites) => {
    setFavorites(updated);
    localStorage.setItem('playnode_favorites', JSON.stringify(updated));
  };

  const toggleGame = (tag: string) => {
    const games = favorites.games.includes(tag)
      ? favorites.games.filter(g => g !== tag)
      : [...favorites.games, tag];
    save({ ...favorites, games });
  };

  const toggleDrop = (id: string) => {
    const drops = favorites.drops.includes(id)
      ? favorites.drops.filter(d => d !== id)
      : [...favorites.drops, id];
    save({ ...favorites, drops });
  };

  const toggleReview = (id: string) => {
    const reviews = favorites.reviews.includes(id)
      ? favorites.reviews.filter(r => r !== id)
      : [...favorites.reviews, id];
    save({ ...favorites, reviews });
  };

  const isGameFavorite = (tag: string) => favorites.games.includes(tag);
  const isDropFavorite = (id: string) => favorites.drops.includes(id);
  const isReviewFavorite = (id: string) => favorites.reviews.includes(id);

  return { favorites, toggleGame, toggleDrop, toggleReview, isGameFavorite, isDropFavorite, isReviewFavorite };
}
