// Sample flashcard data for the app
export const sampleFlashcards = [
  {
    id: 1,
    english: 'Hello',
    korean: '안녕하세요',
    isKnown: false
  },
  {
    id: 2,
    english: 'Thank you',
    korean: '감사합니다',
    isKnown: false
  },
  {
    id: 3,
    english: 'Goodbye',
    korean: '안녕히 가세요',
    isKnown: false
  },
  {
    id: 4,
    english: 'Beautiful',
    korean: '아름다운',
    isKnown: false
  },
  {
    id: 5,
    english: 'Study',
    korean: '공부하다',
    isKnown: false
  },
  {
    id: 6,
    english: 'Friend',
    korean: '친구',
    isKnown: false
  },
  {
    id: 7,
    english: 'Food',
    korean: '음식',
    isKnown: false
  },
  {
    id: 8,
    english: 'Happy',
    korean: '행복한',
    isKnown: false
  }
];

// Function to convert sample data to Excel format
export function getSampleExcelData() {
  return [
    ['English', 'Korean', 'IsKnown'],
    ...sampleFlashcards.map(card => [
      card.english,
      card.korean,
      card.isKnown
    ])
  ];
}