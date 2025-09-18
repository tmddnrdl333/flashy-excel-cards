import * as XLSX from 'xlsx';
import { Flashcard } from '@/types/flashcard';

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
    
    const flashcards: Flashcard[] = [];
    
    // Skip header row if it exists
    const startRow = 1;
    
    for (let i = startRow; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      
      if (row.length >= 2 && row[0] && row[1]) {
        const synonyms = row[2] ? String(row[2]).split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
        
        flashcards.push({
          id: i,
          english: String(row[0]).trim(),
          korean: String(row[1]).trim(),
          synonyms
        });
      }
    }
    
    return flashcards;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw error;
  }
}