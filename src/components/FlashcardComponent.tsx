import { useState, useEffect } from 'react';
import { Flashcard } from '@/types/flashcard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FlashcardComponentProps {
  card: Flashcard;
}

export function FlashcardComponent({ card }: FlashcardComponentProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [card.id]);

  // Keyboard support for flipping
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        setIsFlipped(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClick = () => {
    setIsFlipped(prev => !prev);
  };

  return (
    <div 
      className="cursor-pointer select-none"
      style={{ perspective: '1000px' }}
      onClick={handleClick}
    >
      <div 
        className={`
          relative w-96 h-64 transition-transform duration-500
          ${isFlipped ? '' : ''}
        `}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front of card */}
        <Card 
          className="absolute inset-0 w-full h-full shadow-card hover:shadow-card-hover transition-shadow duration-300"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <CardContent className="flex items-center justify-center h-full p-8">
            <div className="text-center space-y-4">
              <div className="text-sm uppercase tracking-wide text-muted-foreground font-medium">
                English
              </div>
              <div className="text-3xl font-bold text-card-foreground">
                {card.english}
              </div>
              <div className="text-sm text-muted-foreground">
                Click or press Space to flip
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card 
          className="absolute inset-0 w-full h-full shadow-card hover:shadow-card-hover transition-shadow duration-300"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <CardContent className="flex items-center justify-center h-full p-8">
            <div className="text-center space-y-4 w-full">
              <div className="text-sm uppercase tracking-wide text-muted-foreground font-medium">
                Korean
              </div>
              <div className="text-3xl font-bold text-card-foreground mb-4">
                {card.korean}
              </div>
              
              {card.synonyms.length > 0 && (
                <div className="border-t pt-4 space-y-2">
                  <div className="text-sm uppercase tracking-wide text-muted-foreground font-medium">
                    Synonyms
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {card.synonyms.map((synonym, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {synonym}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-sm text-muted-foreground pt-2">
                Click or press Space to flip back
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}