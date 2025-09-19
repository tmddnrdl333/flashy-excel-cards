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
    
    const flashcards: Flashcard[] = [];
    let skippedRows = 0;
    
    // Skip header row if it exists
    const startRow = 1;
    
    for (let i = startRow; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      
      // Debug: Log first few rows to understand the structure
      if (i < 10) {
        console.log(`Row ${i}:`, row, 'Length:', row.length, 'Has data:', !!row[0], !!row[1]);
      }
      
      // Check if row has data (more lenient check)
      if (row && row.length >= 2 && row[0] !== undefined && row[0] !== null && row[0] !== '' && 
          row[1] !== undefined && row[1] !== null && row[1] !== '') {
        const synonyms = row[2] ? String(row[2]).split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
        
        flashcards.push({
          id: i,
          english: String(row[0]).trim(),
          korean: String(row[1]).trim(),
          synonyms
        });
      } else {
        skippedRows++;
        // Log some skipped rows for debugging
        if (skippedRows < 10) {
          console.log(`Skipped row ${i}:`, row);
        }
      }
    }
    
    console.log('Successfully parsed flashcards:', flashcards.length);
    console.log('Skipped rows:', skippedRows);
    
    return flashcards;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw error;
  }
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