import { CardStat } from '@/types/deck';
import { PrefsStorage } from './prefs';

export class StatsStorage {
  private static getStatsKey(deckId: string): string {
    return `stats_${deckId}`;
  }

  static async saveCardStat(deckId: string, cardId: string, status: 'know' | 'dont_know'): Promise<void> {
    try {
      const statsKey = this.getStatsKey(deckId);
      const existingStats = await this.getCardStatsByDeck(deckId);
      
      const cardStat: CardStat = {
        id: cardId,
        status,
        updatedAt: Date.now()
      };

      const updatedStats = {
        ...existingStats,
        [cardId]: cardStat
      };

      await PrefsStorage.set(statsKey, updatedStats);
    } catch (error) {
      console.error('Failed to save card stat:', error);
      throw error;
    }
  }

  static async getCardStatsByDeck(deckId: string): Promise<Record<string, CardStat>> {
    try {
      const statsKey = this.getStatsKey(deckId);
      const stats = await PrefsStorage.get<Record<string, CardStat>>(statsKey);
      return stats || {};
    } catch (error) {
      console.error('Failed to get card stats:', error);
      return {};
    }
  }

  static async getCardStat(deckId: string, cardId: string): Promise<CardStat | null> {
    const stats = await this.getCardStatsByDeck(deckId);
    return stats[cardId] || null;
  }

  static async removeCardStat(deckId: string, cardId: string): Promise<void> {
    try {
      const statsKey = this.getStatsKey(deckId);
      const existingStats = await this.getCardStatsByDeck(deckId);
      
      if (existingStats[cardId]) {
        delete existingStats[cardId];
        await PrefsStorage.set(statsKey, existingStats);
      }
    } catch (error) {
      console.error('Failed to remove card stat:', error);
      throw error;
    }
  }

  static async clearDeckStats(deckId: string): Promise<void> {
    try {
      const statsKey = this.getStatsKey(deckId);
      await PrefsStorage.remove(statsKey);
    } catch (error) {
      console.error('Failed to clear deck stats:', error);
      throw error;
    }
  }

  static async getStatsSummary(deckId: string): Promise<{ know: number; dontKnow: number; total: number }> {
    const stats = await this.getCardStatsByDeck(deckId);
    const statValues = Object.values(stats);
    
    return {
      know: statValues.filter(s => s.status === 'know').length,
      dontKnow: statValues.filter(s => s.status === 'dont_know').length,
      total: statValues.length
    };
  }
}