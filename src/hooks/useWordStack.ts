import { useState, useEffect } from 'react';
import { Flashcard } from '@/types/flashcard';

export function useWordStack() {
  const [wordStack, setWordStack] = useState<Flashcard[]>([]);

  useEffect(() => {
    const savedWords = JSON.parse(localStorage.getItem('wordStack') || '[]');
    setWordStack(savedWords);
  }, []);

  const addToStack = (card: Flashcard) => {
    const updatedStack = [...wordStack];
    const existingIndex = updatedStack.findIndex(w => w.id === card.id);
    
    if (existingIndex === -1) {
      updatedStack.push(card);
      setWordStack(updatedStack);
      localStorage.setItem('wordStack', JSON.stringify(updatedStack));
    }
  };

  const removeFromStack = (cardId: number) => {
    const updatedStack = wordStack.filter(w => w.id !== cardId);
    setWordStack(updatedStack);
    localStorage.setItem('wordStack', JSON.stringify(updatedStack));
  };

  const isInStack = (cardId: number) => {
    return wordStack.some(w => w.id === cardId);
  };

  const shuffleStack = () => {
    const shuffled = [...wordStack].sort(() => Math.random() - 0.5);
    setWordStack(shuffled);
  };

  return {
    wordStack,
    addToStack,
    removeFromStack,
    isInStack,
    shuffleStack
  };
}