import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { readExcelFile, groupFlashcardsByLetter, FlashcardChapter } from '@/utils/excelReader';
import { BookOpen, Brain, Shuffle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ChapterSelection() {
  const [chapters, setChapters] = useState<FlashcardChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wordStackCount, setWordStackCount] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadChapters = async () => {
      try {
        const flashcards = await readExcelFile('/words.xlsx');
        const groupedChapters = groupFlashcardsByLetter(flashcards);
        setChapters(groupedChapters);
        
        // Load word stack count
        const savedWords = JSON.parse(localStorage.getItem('wordStack') || '[]');
        setWordStackCount(savedWords.length);
        
        toast({
          title: "Chapters loaded!",
          description: `Found ${groupedChapters.length} chapters with ${flashcards.length} total words.`,
        });
      } catch (error) {
        toast({
          title: "Error loading chapters",
          description: "Failed to load flashcard chapters.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadChapters();
  }, [toast]);

  const handleChapterSelect = (letter: string | null) => {
    if (letter === 'STACK') {
      navigate('/flashcards?chapter=STACK');
    } else if (letter === null) {
      navigate('/flashcards');
    } else {
      navigate(`/flashcards?chapter=${letter}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg text-muted-foreground">Loading chapters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Flashcard Chapters
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose a chapter to start learning vocabulary
          </p>
        </div>

        {/* Special Chapters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* All Words */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleChapterSelect(null)}>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <BookOpen className="h-5 w-5" />
                All Words
              </CardTitle>
              <CardDescription>Study all vocabulary words together</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {chapters.reduce((total, chapter) => total + chapter.cards.length, 0)} words
              </Badge>
            </CardContent>
          </Card>

          {/* Word Stack */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20" onClick={() => handleChapterSelect('STACK')}>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-primary">
                <Brain className="h-5 w-5" />
                Word Stack
              </CardTitle>
              <CardDescription>Review words you don't know yet</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge variant="default" className="text-lg px-4 py-2">
                {wordStackCount} words
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* A-Z Chapters */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-center">Alphabetical Chapters</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {chapters.map((chapter) => (
              <Card
                key={chapter.letter}
                className="hover:shadow-lg transition-shadow cursor-pointer text-center"
                onClick={() => handleChapterSelect(chapter.letter)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold text-primary">
                    {chapter.letter}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="text-sm">
                    {chapter.cards.length} words
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}