// Sample flashcard data for the app
export const sampleFlashcards = [
  {
    id: 1,
    english: 'Hello',
    korean: '안녕하세요',
    synonyms: ['Hi', 'Greetings', 'Hey']
  },
  {
    id: 2,
    english: 'Thank you',
    korean: '감사합니다',
    synonyms: ['Thanks', 'Gratitude', 'Appreciate']
  },
  {
    id: 3,
    english: 'Goodbye',
    korean: '안녕히 가세요',
    synonyms: ['Farewell', 'See you later', 'Bye']
  },
  {
    id: 4,
    english: 'Beautiful',
    korean: '아름다운',
    synonyms: ['Pretty', 'Lovely', 'Gorgeous']
  },
  {
    id: 5,
    english: 'Study',
    korean: '공부하다',
    synonyms: ['Learn', 'Research', 'Practice']
  },
  {
    id: 6,
    english: 'Friend',
    korean: '친구',
    synonyms: ['Buddy', 'Pal', 'Mate']
  },
  {
    id: 7,
    english: 'Food',
    korean: '음식',
    synonyms: ['Meal', 'Cuisine', 'Dish']
  },
  {
    id: 8,
    english: 'Happy',
    korean: '행복한',
    synonyms: ['Joyful', 'Cheerful', 'Glad']
  }
];

// Function to convert sample data to Excel format
export function getSampleExcelData() {
  return [
    ['English', 'Korean', 'Synonyms'],
    ...sampleFlashcards.map(card => [
      card.english,
      card.korean,
      card.synonyms.join(', ')
    ])
  ];
}