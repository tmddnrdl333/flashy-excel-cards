import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Flashcard } from '@/types/flashcard';
import { Deck, Card } from '@/types/deck';
import { readExcelFile, groupFlashcardsByLetter, getAllAvailableLetters, FlashcardChapter } from '@/utils/excelReader';
import { FlashcardComponent } from './FlashcardComponent';
import { ChapterSidebar } from './ChapterSidebar';
import { FileImportButton } from './FileImportButton';
import { DeckControls } from './DeckControls';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle, Home } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { useWordStack } from '@/hooks/useWordStack';
import { useDeckStorage } from '@/hooks/useDeckStorage';

// Convert Card to Flashcard for compatibility
function cardToFlashcard(card: Card): Flashcard {
  return {
    id: parseInt(card.id.replace(/[^0-9]/g, '')) || Math.random(),
    english: card.word,
    korean: card.meaning,
    synonyms: card.synonyms || []
  };
}

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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { 
    wordStack, 
    knownWords, 
    addToStack, 
    addToKnownWords, 
    removeFromStack, 
    removeFromKnownWords, 
    isInStack, 
    isKnown, 
    shuffleStack, 
    shuffleKnownWords 
  } = useWordStack();

  const {
    currentDeck,
    loading: deckLoading,
    filter,
    setFilter,
    setCardStatus,
    getCardStatus,
    getFilteredCards,
    getStatsSummary,
    loadDeck,
    exportDeck
  } = useDeckStorage();

  // Convert deck cards to flashcards when deck changes
  useEffect(() => {
    if (currentDeck) {
      const flashcards = currentDeck.cards.map(cardToFlashcard);
      setAllFlashcards(flashcards);
      
      // Group cards by chapters
      const groupedChapters = groupFlashcardsByLetter(flashcards);
      setChapters(groupedChapters);
      
      // Get available letters
      const letters = getAllAvailableLetters(flashcards);
      setAvailableLetters(letters);
      
      // Set initial chapter from URL params
      const chapterParam = searchParams.get('chapter');
      setSelectedChapter(chapterParam);
      
      setError(null);
    }
  }, [currentDeck, searchParams]);

  // Fallback to Excel file if no deck is loaded
  useEffect(() => {
    if (!deckLoading && !currentDeck && allFlashcards.length === 0) {
      const loadFlashcards = async () => {
        try {
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
        }
      };

      loadFlashcards();
    }
  }, [deckLoading, currentDeck, allFlashcards.length, toast, searchParams]);

  // Update current flashcards when chapter selection changes
  useEffect(() => {
    let cards: Flashcard[] = [];
    
    if (selectedChapter === 'STACK') {
      cards = [...wordStack].sort(() => Math.random() - 0.5); // Random order for word stack
    } else if (selectedChapter === 'KNOWN') {
      cards = [...knownWords];
    } else if (selectedChapter === 'UNKNOWN') {
      cards = [...wordStack];
    } else if (selectedChapter === null) {
      cards = allFlashcards;
    } else {
      const chapter = chapters.find(ch => ch.letter === selectedChapter);
      cards = chapter ? chapter.cards : [];
    }
    
    setCurrentFlashcards(cards);
    setOriginalOrder([...cards]);
    setCurrentIndex(0); // Reset to first card when changing chapter
  }, [selectedChapter, allFlashcards, chapters, wordStack, knownWords]);

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
    if (selectedChapter === 'STACK' || selectedChapter === 'UNKNOWN') {
      shuffleStack();
    } else if (selectedChapter === 'KNOWN') {
      shuffleKnownWords();
    } else {
      const shuffled = [...currentFlashcards].sort(() => Math.random() - 0.5);
      setCurrentFlashcards(shuffled);
      setCurrentIndex(0);
      toast({
        title: "Cards shuffled!",
        description: "The order has been randomized.",
      });
    }
  }, [currentFlashcards, selectedChapter, shuffleStack, shuffleKnownWords, toast]);

  const undoShuffle = useCallback(() => {
    setCurrentFlashcards([...originalOrder]);
    setCurrentIndex(0);
    toast({
      title: "Order restored!",
      description: "Cards are back to original order.",
    });
  }, [originalOrder, toast]);

  const handleKnowWord = useCallback(async () => {
    const currentCard = currentFlashcards[currentIndex];
    
    // Use persistent storage if deck is loaded
    if (currentDeck) {
      await setCardStatus(currentCard.english, 'know');
    }
    
    // Legacy word stack functionality
    if (selectedChapter === 'STACK' || selectedChapter === 'UNKNOWN') {
      removeFromStack(currentCard.id);
      toast({
        title: "Word removed from stack!",
        description: `"${currentCard.english}" removed from your study list.`,
      });
    } else if (selectedChapter === 'KNOWN') {
      removeFromKnownWords(currentCard.id);
      toast({
        title: "Word removed from known words!",
        description: `"${currentCard.english}" removed from known words.`,
      });
    } else {
      addToKnownWords(currentCard);
      if (!currentDeck) {
        toast({
          title: "Added to known words!",
          description: `"${currentCard.english}" marked as known.`,
        });
      }
    }
    goToNext();
  }, [currentFlashcards, currentIndex, currentDeck, setCardStatus, selectedChapter, removeFromStack, removeFromKnownWords, addToKnownWords, toast, goToNext]);

  const handleDontKnowWord = useCallback(async () => {
    const currentCard = currentFlashcards[currentIndex];
    
    // Use persistent storage if deck is loaded
    if (currentDeck) {
      await setCardStatus(currentCard.english, 'dont_know');
    }
    
    // Legacy word stack functionality
    if (selectedChapter === 'KNOWN') {
      removeFromKnownWords(currentCard.id);
      toast({
        title: "Word removed from known words!",
        description: `"${currentCard.english}" removed from known words.`,
      });
    } else if (selectedChapter === 'STACK' || selectedChapter === 'UNKNOWN') {
      toast({
        title: "Keep studying!",
        description: `"${currentCard.english}" stays in your study list.`,
      });
    } else {
      addToStack(currentCard);
      if (!currentDeck) {
        toast({
          title: "Added to word stack!",
          description: `"${currentCard.english}" added to your study list.`,
        });
      }
    }
    goToNext();
  }, [currentFlashcards, currentIndex, currentDeck, setCardStatus, selectedChapter, addToStack, removeFromKnownWords, toast, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'ArrowRight') {
        event.preventDefault();
        handleKnowWord();
      } else if (event.code === 'ArrowLeft') {
        event.preventDefault();
        handleDontKnowWord();
      } else if (event.code === 'KeyZ') {
        event.preventDefault();
        undoShuffle();
      } else if (event.code === 'KeyR') {
        event.preventDefault();
        resetToFirst();
      } else if (event.code === 'KeyA') {
        event.preventDefault();
        setSelectedChapter(null); // Show all chapters
      } else if (event.code === 'KeyS') {
        event.preventDefault();
        shuffleCards();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKnowWord, handleDontKnowWord, undoShuffle, resetToFirst, shuffleCards]);

  if (deckLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg text-muted-foreground">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (error && !currentDeck) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <h2 className="text-2xl font-bold text-destructive">No Flashcard Deck Found</h2>
          <p className="text-muted-foreground">Import an Excel file to get started, or the existing Excel file couldn't be loaded.</p>
          <div className="bg-muted p-6 rounded-lg text-left space-y-3">
            <p className="text-sm font-medium">Expected Excel file format:</p>
            <ul className="text-sm space-y-1">
              <li>• <strong>Column A:</strong> English words</li>
              <li>• <strong>Column B:</strong> Korean meanings</li>
              <li>• <strong>Column C:</strong> Synonyms (optional, comma-separated)</li>
            </ul>
          </div>
          <FileImportButton onDeckLoaded={loadDeck} />
        </div>
      </div>
    );
  }

  if ((!currentDeck && allFlashcards.length === 0) || (currentDeck && currentDeck.cards.length === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold">No Flashcards Found</h2>
          <p className="text-muted-foreground">Import an Excel file to get started.</p>
          <FileImportButton onDeckLoaded={loadDeck} />
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

  const stats = getStatsSummary();

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
          knownWordsCount={knownWords.length}
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
              <h1 className="text-lg font-semibold">
                {currentDeck ? currentDeck.name : 'Flashcards'}
              </h1>
              {selectedChapter && (
                <div className="text-sm text-muted-foreground">
                  {selectedChapter === 'STACK' ? 'Word Stack' : 
                   selectedChapter === 'KNOWN' ? 'Known Words' :
                   selectedChapter === 'UNKNOWN' ? 'Unknown Words' :
                   `Chapter ${selectedChapter}`}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <FileImportButton 
                onDeckLoaded={loadDeck} 
                isReimport={!!currentDeck}
                disabled={false}
              />
            </div>
          </header>

          {/* Deck controls */}
          {currentDeck && (
            <div className="p-4 border-b">
              <DeckControls
                filter={filter}
                onFilterChange={setFilter}
                stats={stats}
                onExport={exportDeck}
                onShuffle={shuffleCards}
                disabled={currentFlashcards.length <= 1}
              />
            </div>
          )}

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
                    <p>Use <kbd className="px-2 py-1 bg-muted rounded text-xs">←</kbd> Don't Know • <kbd className="px-2 py-1 bg-muted rounded text-xs">→</kbd> Know • <kbd className="px-2 py-1 bg-muted rounded text-xs">Z</kbd> Undo</p>
                    <p><kbd className="px-2 py-1 bg-muted rounded text-xs">S</kbd> Shuffle • <kbd className="px-2 py-1 bg-muted rounded text-xs">R</kbd> Reset</p>
                  </div>
                </div>

                {/* Flashcard */}
                <div className="flex justify-center">
                  <FlashcardComponent card={currentCard} />
                </div>

                {/* Knowledge buttons */}
                <div className="flex justify-center items-center gap-4 mb-4">
                  <Button
                    onClick={handleDontKnowWord}
                    variant="destructive"
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-5 w-5" />
                    Don't Know (←)
                  </Button>
                  
                  <Button
                    onClick={handleKnowWord}
                    variant="default"
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    I Know This (→)
                  </Button>
                </div>

                {/* Navigation Controls */}
                <div className="flex justify-center items-center gap-4">
                  <Button
                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    variant="outline"
                    size="lg"
                    disabled={currentIndex === 0}
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
                    onClick={() => setCurrentIndex(Math.min(currentFlashcards.length - 1, currentIndex + 1))}
                    variant="outline" 
                    size="lg"
                    disabled={currentIndex === currentFlashcards.length - 1}
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