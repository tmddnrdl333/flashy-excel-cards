import * as XLSX from 'xlsx';

export function createSampleExcelFile() {
  // Sample data for demonstration
  const sampleData = [
    ['English', 'Korean', 'Synonyms'],
    ['Hello', '안녕하세요', 'Hi, Greetings'],
    ['Thank you', '감사합니다', 'Thanks, Gratitude'],
    ['Goodbye', '안녕히 가세요', 'Farewell, See you later'],
    ['Beautiful', '아름다운', 'Pretty, Lovely, Gorgeous'],
    ['Study', '공부하다', 'Learn, Research'],
    ['Friend', '친구', 'Buddy, Pal, Mate'],
    ['Food', '음식', 'Meal, Cuisine'],
    ['Happy', '행복한', 'Joyful, Cheerful, Glad'],
    ['Book', '책', 'Novel, Publication'],
    ['Water', '물', 'Liquid, H2O']
  ];

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
  
  // Add the worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Flashcards');
  
  // Generate array buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  return excelBuffer;
}

export function downloadSampleFile() {
  const buffer = createSampleExcelFile();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'words.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}