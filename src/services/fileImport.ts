import { Deck, Card } from '@/types/deck';
import { readExcelFile } from '@/utils/excelReader';
import { DeckCache } from '@/storage/cache';
import { PrefsStorage } from '@/storage/prefs';

export class FileImportService {
  static async importFromFile(file: File): Promise<Deck> {
    try {
      // Parse the Excel file
      const flashcards = await readExcelFile(file);
      
      // Convert flashcards to cards format
      const cards: Card[] = flashcards.map(flashcard => ({
        id: this.generateCardId(flashcard.english, flashcard.korean),
        word: flashcard.english,
        meaning: flashcard.korean,
        synonyms: flashcard.synonyms?.length ? flashcard.synonyms : undefined
      }));

      // Create deck
      const deckId = this.generateDeckId(file.name);
      const deck: Deck = {
        id: deckId,
        name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        createdAt: Date.now(),
        cards
      };

      // Save to cache
      await DeckCache.saveDeckToCache(deck);
      await DeckCache.setLastDeckId(deckId);
      await PrefsStorage.setLastImportedAt(Date.now());

      return deck;
    } catch (error) {
      console.error('Failed to import file:', error);
      throw error;
    }
  }

  static async reimportFromFile(): Promise<Deck | null> {
    // This would trigger the file picker
    // For now, we'll return null and let the UI handle the file selection
    return null;
  }

  private static generateDeckId(filename: string): string {
    // Generate a stable ID based on filename and timestamp
    const cleanName = filename.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    return `${cleanName}_${Date.now()}`;
  }

  private static generateCardId(word: string, meaning: string): string {
    // Generate a stable ID based on card content
    const combined = `${word}_${meaning}`.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    return combined;
  }

  static async loadLastDeck(): Promise<Deck | null> {
    try {
      const lastDeckId = await DeckCache.getLastDeckId();
      if (!lastDeckId) {
        return null;
      }

      return await DeckCache.loadDeckFromCache(lastDeckId);
    } catch (error) {
      console.error('Failed to load last deck:', error);
      return null;
    }
  }
}