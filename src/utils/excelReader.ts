import * as XLSX from 'xlsx';
import { Flashcard } from '@/types/flashcard';

export interface FlashcardChapter {
  letter: string;
  cards: Flashcard[];
}

export async function readExcelFile(filePath: string): Promise<Flashcard[]> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      // If Excel file doesn't exist, return sample data
      if (response.status === 404) {
        const { sampleFlashcards } = await import('@/utils/sampleWords');
        return sampleFlashcards;
      }
      throw new Error(`Failed to fetch Excel file: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    if (!worksheet) {
      throw new Error('No worksheet found in Excel file');
    }
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log('Excel file parsing debug:');
    console.log('Total rows in Excel:', jsonData.length);
    console.log('First 5 rows:', jsonData.slice(0, 5));
    
    const flashcards: Flashcard[] = [];
    
    // Skip header row if it exists
    const startRow = 1;
    
    for (let i = startRow; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      
      // More lenient check - just need English and Korean
      if (row && row.length >= 2 && 
          row[0] !== undefined && row[0] !== null && String(row[0]).trim() !== '' && 
          row[1] !== undefined && row[1] !== null && String(row[1]).trim() !== '') {
        const isKnown = row[2] ? Boolean(row[2]) : false;
        
        flashcards.push({
          id: i,
          english: String(row[0]).trim(),
          korean: String(row[1]).trim(),
          isKnown
        });
      }
    }
    
    return flashcards;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw error;
  }
}

export function getKnownFlashcards(flashcards: Flashcard[]): Flashcard[] {
  return flashcards.filter(card => card.isKnown);
}

export function getUnknownFlashcards(flashcards: Flashcard[]): Flashcard[] {
  return flashcards.filter(card => !card.isKnown);
}

export function groupFlashcardsByLetter(flashcards: Flashcard[]): FlashcardChapter[] {
  const chapters: { [key: string]: Flashcard[] } = {};
  
  // Group flashcards by first letter
  flashcards.forEach(card => {
    const firstLetter = card.english.charAt(0).toUpperCase();
    if (!chapters[firstLetter]) {
      chapters[firstLetter] = [];
    }
    chapters[firstLetter].push(card);
  });
  
  // Convert to array and sort alphabetically
  const result: FlashcardChapter[] = Object.keys(chapters)
    .sort()
    .map(letter => ({
      letter,
      cards: chapters[letter].sort((a, b) => a.english.localeCompare(b.english))
    }));
    
  return result;
}

export function getAllAvailableLetters(flashcards: Flashcard[]): string[] {
  const letters = new Set<string>();
  flashcards.forEach(card => {
    letters.add(card.english.charAt(0).toUpperCase());
  });
  return Array.from(letters).sort();
}