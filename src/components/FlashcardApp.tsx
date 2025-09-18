import { useState, useEffect, useCallback } from 'react';
import { Flashcard } from '@/types/flashcard';
import { readExcelFile, groupFlashcardsByLetter, getAllAvailableLetters, FlashcardChapter } from '@/utils/excelReader';
import { FlashcardComponent } from './FlashcardComponent';
import { ChapterSidebar } from './ChapterSidebar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';

export function FlashcardApp() {
  const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>([]);
  const [chapters, setChapters] = useState<FlashcardChapter[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [currentFlashcards, setCurrentFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        setIsLoading(true);
        const cards = await readExcelFile('/words.xlsx');
        
        if (cards.length === 0) {
          throw new Error('No flashcards found in the Excel file');
        }
        
        setAllFlashcards(cards);
        setCurrentFlashcards(cards);
        
        // Group cards by chapters
        const groupedChapters = groupFlashcardsByLetter(cards);
        setChapters(groupedChapters);
        
        // Get available letters
        const letters = getAllAvailableLetters(cards);
        setAvailableLetters(letters);
        
        // Check if we're using sample data or actual Excel file
        try {
          const response = await fetch('/words.xlsx');
          if (response.ok) {
            toast({
              title: "Flashcards loaded!",
              description: `Successfully loaded ${cards.length} flashcards from Excel file. Organized into ${letters.length} chapters.`,
            });
          } else {
            toast({
              title: "Using sample data",
              description: `No Excel file found. Loaded ${cards.length} sample flashcards. Upload words.xlsx to use your own data.`,
            });
          }
        } catch {
          toast({
            title: "Using sample data", 
            description: `No Excel file found. Loaded ${cards.length} sample flashcards. Upload words.xlsx to use your own data.`,
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load flashcards';
        setError(errorMessage);
        toast({
          title: "Error loading flashcards",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadFlashcards();
  }, [toast]);

  // Update current flashcards when chapter selection changes
  useEffect(() => {
    if (selectedChapter === null) {
      setCurrentFlashcards(allFlashcards);
    } else {
      const chapter = chapters.find(ch => ch.letter === selectedChapter);
      setCurrentFlashcards(chapter ? chapter.cards : []);
    }
    setCurrentIndex(0); // Reset to first card when changing chapter
  }, [selectedChapter, allFlashcards, chapters]);

  const goToNext = useCallback(() => {
    if (currentFlashcards.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % currentFlashcards.length);
    }
  }, [currentFlashcards.length]);

  const goToPrevious = useCallback(() => {
    if (currentFlashcards.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + currentFlashcards.length) % currentFlashcards.length);
    }
  }, [currentFlashcards.length]);

  const resetToFirst = useCallback(() => {
    setCurrentIndex(0);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'ArrowRight' || event.code === 'KeyN') {
        event.preventDefault();
        goToNext();
      } else if (event.code === 'ArrowLeft' || event.code === 'KeyP') {
        event.preventDefault();
        goToPrevious();
      } else if (event.code === 'KeyR') {
        event.preventDefault();
        resetToFirst();
      } else if (event.code === 'KeyA') {
        event.preventDefault();
        setSelectedChapter(null); // Show all chapters
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious, resetToFirst]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg text-muted-foreground">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <h2 className="text-2xl font-bold text-destructive">Error Loading Flashcards</h2>
          <p className="text-muted-foreground">{error}</p>
          <div className="bg-muted p-6 rounded-lg text-left space-y-3">
            <p className="text-sm font-medium">Expected Excel file format:</p>
            <ul className="text-sm space-y-1">
              <li>• <strong>Column A:</strong> English words</li>
              <li>• <strong>Column B:</strong> Korean meanings</li>
              <li>• <strong>Column C:</strong> Synonyms (optional, comma-separated)</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Save as <code>words.xlsx</code> in the <code>/public</code> folder
            </p>
          </div>
          <Button 
            onClick={() => {
              const { downloadSampleFile } = require('@/utils/createSampleData');
              downloadSampleFile();
            }}
            className="w-full"
          >
            Download Sample Excel File
          </Button>
        </div>
      </div>
    );
  }

  if (allFlashcards.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Flashcards Found</h2>
          <p className="text-muted-foreground">Please add some data to your Excel file.</p>
        </div>
      </div>
    );
  }

  const currentCard = currentFlashcards[currentIndex];
  const chapterCounts = chapters.reduce((acc, chapter) => {
    acc[chapter.letter] = chapter.cards.length;
    return acc;
  }, {} as { [key: string]: number });

  const handleChapterSelect = (letter: string | null) => {
    setSelectedChapter(letter);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <ChapterSidebar
          availableLetters={availableLetters}
          selectedChapter={selectedChapter}
          chapterCounts={chapterCounts}
          onChapterSelect={handleChapterSelect}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header with sidebar trigger */}
          <header className="h-12 flex items-center border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold">Flashcards</h1>
              {selectedChapter && (
                <div className="text-sm text-muted-foreground">
                  Chapter {selectedChapter}
                </div>
              )}
            </div>
          </header>

          {/* Main flashcard area */}
          <main className="flex-1 flex items-center justify-center p-4">
            {currentFlashcards.length > 0 ? (
              <div className="w-full max-w-2xl space-y-6">
                {/* Card info */}
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">
                    Card {currentIndex + 1} of {currentFlashcards.length}
                    {selectedChapter && ` in Chapter ${selectedChapter}`}
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd> to flip card</p>
                    <p>Use <kbd className="px-2 py-1 bg-muted rounded text-xs">←→</kbd> or <kbd className="px-2 py-1 bg-muted rounded text-xs">N</kbd>/<kbd className="px-2 py-1 bg-muted rounded text-xs">P</kbd> to navigate</p>
                    <p>Press <kbd className="px-2 py-1 bg-muted rounded text-xs">A</kbd> to view all chapters</p>
                  </div>
                </div>

                {/* Flashcard */}
                <div className="flex justify-center">
                  <FlashcardComponent card={currentCard} />
                </div>

                {/* Controls */}
                <div className="flex justify-center items-center gap-4">
                  <Button
                    onClick={goToPrevious}
                    variant="outline"
                    size="lg"
                    disabled={currentFlashcards.length <= 1}
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Previous
                  </Button>
                  
                  <Button
                    onClick={resetToFirst}
                    variant="outline"
                    size="lg"
                    disabled={currentIndex === 0}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                  
                  <Button
                    onClick={goToNext}
                    variant="outline" 
                    size="lg"
                    disabled={currentFlashcards.length <= 1}
                  >
                    Next
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <h2 className="text-xl font-semibold">No flashcards in this chapter</h2>
                <p className="text-muted-foreground">
                  {selectedChapter 
                    ? `No words starting with "${selectedChapter}" found.`
                    : 'Please select a chapter from the sidebar.'
                  }
                </p>
                <Button onClick={() => setSelectedChapter(null)} variant="outline">
                  View All Chapters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}