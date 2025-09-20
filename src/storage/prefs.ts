import { Preferences } from '@capacitor/preferences';

export class PrefsStorage {
  static async set(key: string, value: any): Promise<void> {
    await Preferences.set({
      key,
      value: JSON.stringify(value)
    });
  }

  static async get<T>(key: string): Promise<T | null> {
    const result = await Preferences.get({ key });
    return result.value ? JSON.parse(result.value) : null;
  }

  static async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }

  static async clear(): Promise<void> {
    await Preferences.clear();
  }

  // Deck metadata helpers
  static async getLastDeckId(): Promise<string | null> {
    return this.get<string>('lastDeckId');
  }

  static async setLastDeckId(deckId: string): Promise<void> {
    await this.set('lastDeckId', deckId);
  }

  static async getLastSourceUri(): Promise<string | null> {
    return this.get<string>('lastSourceUri');
  }

  static async setLastSourceUri(uri: string): Promise<void> {
    await this.set('lastSourceUri', uri);
  }

  static async getLastImportedAt(): Promise<number | null> {
    return this.get<number>('lastImportedAt');
  }

  static async setLastImportedAt(timestamp: number): Promise<void> {
    await this.set('lastImportedAt', timestamp);
  }
}