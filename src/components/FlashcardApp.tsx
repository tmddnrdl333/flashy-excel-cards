import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Flashcard } from '@/types/flashcard';
import { readExcelFile, groupFlashcardsByLetter, getAllAvailableLetters, FlashcardChapter } from '@/utils/excelReader';
import { FlashcardComponent } from './FlashcardComponent';
import { ChapterSidebar } from './ChapterSidebar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, Undo2, CheckCircle, XCircle, Home } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { useWordStack } from '@/hooks/useWordStack';

export function FlashcardApp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>([]);
  const [chapters, setChapters] = useState<FlashcardChapter[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [currentFlashcards, setCurrentFlashcards] = useState<Flashcard[]>([]);
  const [originalOrder, setOriginalOrder] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { wordStack, addToStack, removeFromStack, isInStack, shuffleStack } = useWordStack();

  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        setIsLoading(true);
        const cards = await readExcelFile('/words.xlsx');
        
        if (cards.length === 0) {
          throw new Error('No flashcards found in the Excel file');
        }
        
        setAllFlashcards(cards);
        
        // Group cards by chapters
        const groupedChapters = groupFlashcardsByLetter(cards);
        setChapters(groupedChapters);
        
        // Get available letters
        const letters = getAllAvailableLetters(cards);
        setAvailableLetters(letters);
        
        // Set initial chapter from URL params
        const chapterParam = searchParams.get('chapter');
        setSelectedChapter(chapterParam);
        
        toast({
          title: "Flashcards loaded!",
          description: `Successfully loaded ${cards.length} flashcards from Excel file. Organized into ${letters.length} chapters.`,
        });
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
  }, [toast, searchParams]);

  // Update current flashcards when chapter selection changes
  useEffect(() => {
    let cards: Flashcard[] = [];
    
    if (selectedChapter === 'STACK') {
      cards = [...wordStack].sort(() => Math.random() - 0.5); // Random order for word stack
    } else if (selectedChapter === 'KNOWN') {
      cards = allFlashcards.filter(card => card.isKnown);
    } else if (selectedChapter === 'UNKNOWN') {
      cards = allFlashcards.filter(card => !card.isKnown);
    } else if (selectedChapter === null) {
      cards = allFlashcards;
    } else {
      const chapter = chapters.find(ch => ch.letter === selectedChapter);
      cards = chapter ? chapter.cards : [];
    }
    
    setCurrentFlashcards(cards);
    setOriginalOrder([...cards]);
    setCurrentIndex(0); // Reset to first card when changing chapter
  }, [selectedChapter, allFlashcards, chapters, wordStack]);

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

  const shuffleCards = useCallback(() => {
    if (selectedChapter === 'STACK') {
      shuffleStack();
    } else {
      const shuffled = [...currentFlashcards].sort(() => Math.random() - 0.5);
      setCurrentFlashcards(shuffled);
      setCurrentIndex(0);
      toast({
        title: "Cards shuffled!",
        description: "The order has been randomized.",
      });
    }
  }, [currentFlashcards, selectedChapter, shuffleStack, toast]);

  const undoShuffle = useCallback(() => {
    setCurrentFlashcards([...originalOrder]);
    setCurrentIndex(0);
    toast({
      title: "Order restored!",
      description: "Cards are back to original order.",
    });
  }, [originalOrder, toast]);

  const handleKnowWord = useCallback(() => {
    const currentCard = currentFlashcards[currentIndex];
    
    // Update the flashcard to mark as known
    const updatedFlashcards = allFlashcards.map(card => 
      card.id === currentCard.id ? { ...card, isKnown: true } : card
    );
    setAllFlashcards(updatedFlashcards);
    
    // Remove from word stack if it was there
    if (selectedChapter === 'STACK') {
      removeFromStack(currentCard.id);
      toast({
        title: "Word removed from stack!",
        description: `"${currentCard.english}" marked as known and removed from study list.`,
      });
    } else {
      toast({
        title: "Great!",
        description: `"${currentCard.english}" marked as known!`,
      });
    }
    
    // Move to next card
    if (currentIndex < currentFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentFlashcards, currentIndex, selectedChapter, removeFromStack, toast, allFlashcards]);

  const handleDontKnowWord = useCallback(() => {
    const currentCard = currentFlashcards[currentIndex];
    
    // Update the flashcard to mark as unknown
    const updatedFlashcards = allFlashcards.map(card => 
      card.id === currentCard.id ? { ...card, isKnown: false } : card
    );
    setAllFlashcards(updatedFlashcards);
    
    // Add to word stack
    addToStack({ ...currentCard, isKnown: false });
    
    if (selectedChapter === 'STACK') {
      toast({
        title: "Keep studying!",
        description: `"${currentCard.english}" stays in your study list.`,
      });
    } else {
      toast({
        title: "Added to word stack!",
        description: `"${currentCard.english}" marked as unknown and added to study list.`,
      });
    }
    
    // Move to next card
    if (currentIndex < currentFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentFlashcards, currentIndex, selectedChapter, addToStack, toast, allFlashcards]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'ArrowLeft') {
        event.preventDefault();
        handleKnowWord();
      } else if (event.code === 'ArrowRight') {
        event.preventDefault();
        handleDontKnowWord();
      } else if (event.code === 'KeyZ') {
        event.preventDefault();
        undoShuffle();
      } else if (event.code === 'KeyS') {
        event.preventDefault();
        shuffleCards();
      } else if (event.code === 'KeyA') {
        event.preventDefault();
        setSelectedChapter(null); // Show all chapters
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKnowWord, handleDontKnowWord, undoShuffle, shuffleCards]);

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
                  wordStackCount={wordStack.length}
                  knownCount={allFlashcards.filter(card => card.isKnown).length}
                  unknownCount={allFlashcards.filter(card => !card.isKnown).length}
                />

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header with sidebar trigger */}
          <header className="h-12 flex items-center justify-between border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
              <h1 className="text-lg font-semibold">Flashcards</h1>
              {selectedChapter && (
                <div className="text-sm text-muted-foreground">
                  {selectedChapter === 'STACK' ? 'Word Stack' : 
                   selectedChapter === 'KNOWN' ? 'Known Words' :
                   selectedChapter === 'UNKNOWN' ? 'Unknown Words' :
                   `Chapter ${selectedChapter}`}
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={shuffleCards}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={currentFlashcards.length <= 1}
              >
                <Shuffle className="h-4 w-4" />
                Shuffle
              </Button>
              <Button
                onClick={undoShuffle}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={currentFlashcards.length <= 1}
              >
                <Undo2 className="h-4 w-4" />
                Undo
              </Button>
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
                    <p><kbd className="px-2 py-1 bg-muted rounded text-xs">←</kbd> I Know This • <kbd className="px-2 py-1 bg-muted rounded text-xs">→</kbd> Don't Know</p>
                    <p><kbd className="px-2 py-1 bg-muted rounded text-xs">S</kbd> Shuffle • <kbd className="px-2 py-1 bg-muted rounded text-xs">Z</kbd> Undo • <kbd className="px-2 py-1 bg-muted rounded text-xs">A</kbd> All Words</p>
                  </div>
                </div>

                {/* Flashcard */}
                <div className="flex justify-center">
                  <FlashcardComponent card={currentCard} />
                </div>

                {/* Knowledge buttons */}
                <div className="flex justify-center items-center gap-4 mb-4">
                  <Button
                    onClick={handleKnowWord}
                    variant="default"
                    size="lg"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-5 w-5" />
                    I Know This (←)
                  </Button>
                  
                  <Button
                    onClick={handleDontKnowWord}
                    variant="destructive"
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-5 w-5" />
                    Don't Know (→)
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