export interface Card {
  id: string;
  word: string;
  meaning: string;
  synonyms?: string[];
}

export interface Deck {
  id: string;
  name: string;
  createdAt: number;
  cards: Card[];
}

export interface CardStat {
  id: string;
  status: 'know' | 'dont_know';
  updatedAt: number;
}

export type DeckMetadata = {
  lastDeckId: string;
  lastSourceUri?: string;
  lastImportedAt: number;
};