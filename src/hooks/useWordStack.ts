import { useState, useEffect } from 'react';
import { Flashcard } from '@/types/flashcard';

export function useWordStack() {
  const [wordStack, setWordStack] = useState<Flashcard[]>([]);
  const [knownWords, setKnownWords] = useState<Flashcard[]>([]);

  useEffect(() => {
    const savedWords = JSON.parse(localStorage.getItem('wordStack') || '[]');
    const savedKnownWords = JSON.parse(localStorage.getItem('knownWords') || '[]');
    setWordStack(savedWords);
    setKnownWords(savedKnownWords);
  }, []);

  const addToStack = (card: Flashcard) => {
    const updatedStack = [...wordStack];
    const existingIndex = updatedStack.findIndex(w => w.id === card.id);
    
    if (existingIndex === -1) {
      updatedStack.push(card);
      setWordStack(updatedStack);
      localStorage.setItem('wordStack', JSON.stringify(updatedStack));
    }
    
    // Remove from known words if it exists there
    const updatedKnownWords = knownWords.filter(w => w.id !== card.id);
    setKnownWords(updatedKnownWords);
    localStorage.setItem('knownWords', JSON.stringify(updatedKnownWords));
  };

  const addToKnownWords = (card: Flashcard) => {
    const updatedKnownWords = [...knownWords];
    const existingIndex = updatedKnownWords.findIndex(w => w.id === card.id);
    
    if (existingIndex === -1) {
      updatedKnownWords.push(card);
      setKnownWords(updatedKnownWords);
      localStorage.setItem('knownWords', JSON.stringify(updatedKnownWords));
    }
    
    // Remove from word stack if it exists there
    const updatedStack = wordStack.filter(w => w.id !== card.id);
    setWordStack(updatedStack);
    localStorage.setItem('wordStack', JSON.stringify(updatedStack));
  };

  const removeFromStack = (cardId: number) => {
    const updatedStack = wordStack.filter(w => w.id !== cardId);
    setWordStack(updatedStack);
    localStorage.setItem('wordStack', JSON.stringify(updatedStack));
  };

  const removeFromKnownWords = (cardId: number) => {
    const updatedKnownWords = knownWords.filter(w => w.id !== cardId);
    setKnownWords(updatedKnownWords);
    localStorage.setItem('knownWords', JSON.stringify(updatedKnownWords));
  };

  const isInStack = (cardId: number) => {
    return wordStack.some(w => w.id === cardId);
  };

  const isKnown = (cardId: number) => {
    return knownWords.some(w => w.id === cardId);
  };

  const shuffleStack = () => {
    const shuffled = [...wordStack].sort(() => Math.random() - 0.5);
    setWordStack(shuffled);
  };

  const shuffleKnownWords = () => {
    const shuffled = [...knownWords].sort(() => Math.random() - 0.5);
    setKnownWords(shuffled);
  };

  return {
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
  };
}