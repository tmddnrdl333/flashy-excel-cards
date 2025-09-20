import { useState, useEffect, useCallback } from 'react';
import { Deck, Card, CardStat } from '@/types/deck';
import { StatsStorage } from '@/storage/stats';
import { DeckCache } from '@/storage/cache';
import { FileImportService } from '@/services/fileImport';
import { useToast } from '@/components/ui/use-toast';

export type FilterType = 'all' | 'know' | 'dont_know';

export function useDeckStorage() {
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  const [cardStats, setCardStats] = useState<Record<string, CardStat>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load card stats when deck changes
  useEffect(() => {
    if (currentDeck) {
      loadCardStats();
    }
  }, [currentDeck]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const deck = await FileImportService.loadLastDeck();
      setCurrentDeck(deck);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCardStats = async () => {
    if (!currentDeck) return;
    
    try {
      const stats = await StatsStorage.getCardStatsByDeck(currentDeck.id);
      setCardStats(stats);
    } catch (error) {
      console.error('Failed to load card stats:', error);
    }
  };

  const setCardStatus = useCallback(async (cardId: string, status: 'know' | 'dont_know') => {
    if (!currentDeck) return;

    try {
      await StatsStorage.saveCardStat(currentDeck.id, cardId, status);
      
      // Update local state
      setCardStats(prev => ({
        ...prev,
        [cardId]: {
          id: cardId,
          status,
          updatedAt: Date.now()
        }
      }));

      toast({
        title: status === 'know' ? "Marked as known" : "Marked as unknown",
        description: "Card status saved",
      });
    } catch (error) {
      console.error('Failed to save card status:', error);
      toast({
        title: "Failed to save",
        description: "Could not save card status",
        variant: "destructive",
      });
    }
  }, [currentDeck, toast]);

  const getCardStatus = useCallback((cardId: string): 'know' | 'dont_know' | null => {
    return cardStats[cardId]?.status || null;
  }, [cardStats]);

  const getFilteredCards = useCallback((): Card[] => {
    if (!currentDeck) return [];

    const cards = currentDeck.cards;
    
    switch (filter) {
      case 'know':
        return cards.filter(card => cardStats[card.id]?.status === 'know');
      case 'dont_know':
        return cards.filter(card => cardStats[card.id]?.status === 'dont_know');
      default:
        return cards;
    }
  }, [currentDeck, cardStats, filter]);

  const getStatsSummary = useCallback(() => {
    if (!currentDeck) return { know: 0, dontKnow: 0, total: 0, unrated: 0 };

    const know = currentDeck.cards.filter(card => cardStats[card.id]?.status === 'know').length;
    const dontKnow = currentDeck.cards.filter(card => cardStats[card.id]?.status === 'dont_know').length;
    const total = currentDeck.cards.length;
    const unrated = total - know - dontKnow;

    return { know, dontKnow, total, unrated };
  }, [currentDeck, cardStats]);

  const loadDeck = useCallback((deck: Deck) => {
    setCurrentDeck(deck);
    setFilter('all'); // Reset filter when loading new deck
  }, []);

  const exportDeck = useCallback(async () => {
    if (!currentDeck) return;

    try {
      await DeckCache.exportDeck(currentDeck.id);
      toast({
        title: "Export initiated",
        description: "Check your device's share menu",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export the deck",
        variant: "destructive",
      });
    }
  }, [currentDeck, toast]);

  return {
    currentDeck,
    cardStats,
    loading,
    filter,
    setFilter,
    setCardStatus,
    getCardStatus,
    getFilteredCards,
    getStatsSummary,
    loadDeck,
    exportDeck,
    refreshStats: loadCardStats
  };
}