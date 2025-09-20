import { Deck } from '@/types/deck';
import { FileStorage } from './files';
import { PrefsStorage } from './prefs';

export class DeckCache {
  private static DECKS_DIR = 'decks';

  static async loadDeckFromCache(deckId: string): Promise<Deck | null> {
    try {
      const path = `${this.DECKS_DIR}/${deckId}.json`;
      const exists = await FileStorage.fileExists(path);
      
      if (!exists) {
        return null;
      }

      const data = await FileStorage.readFile(path);
      return JSON.parse(data) as Deck;
    } catch (error) {
      console.error('Failed to load deck from cache:', error);
      return null;
    }
  }

  static async saveDeckToCache(deck: Deck): Promise<void> {
    try {
      await FileStorage.mkdir(this.DECKS_DIR);
      const path = `${this.DECKS_DIR}/${deck.id}.json`;
      await FileStorage.writeFile(path, JSON.stringify(deck, null, 2));
    } catch (error) {
      console.error('Failed to save deck to cache:', error);
      throw error;
    }
  }

  static async getLastDeckId(): Promise<string | null> {
    return PrefsStorage.getLastDeckId();
  }

  static async setLastDeckId(deckId: string): Promise<void> {
    await PrefsStorage.setLastDeckId(deckId);
  }

  static async deleteDeckFromCache(deckId: string): Promise<void> {
    try {
      const path = `${this.DECKS_DIR}/${deckId}.json`;
      await FileStorage.deleteFile(path);
    } catch (error) {
      console.error('Failed to delete deck from cache:', error);
    }
  }

  static async exportDeck(deckId: string): Promise<void> {
    try {
      const path = `${this.DECKS_DIR}/${deckId}.json`;
      await FileStorage.shareFile(path, `Export deck: ${deckId}`);
    } catch (error) {
      console.error('Failed to export deck:', error);
      throw error;
    }
  }

  static async listCachedDecks(): Promise<string[]> {
    // This is a simplified implementation
    // In a real app, you might want to maintain a deck index
    const lastDeckId = await this.getLastDeckId();
    return lastDeckId ? [lastDeckId] : [];
  }
}