import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, RefreshCw } from 'lucide-react';
import { FileImportService } from '@/services/fileImport';
import { Deck } from '@/types/deck';
import { useToast } from '@/components/ui/use-toast';

interface FileImportButtonProps {
  onDeckLoaded: (deck: Deck) => void;
  isReimport?: boolean;
  disabled?: boolean;
}

export function FileImportButton({ onDeckLoaded, isReimport = false, disabled = false }: FileImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const deck = await FileImportService.importFromFile(file);
      onDeckLoaded(deck);
      
      toast({
        title: "File imported successfully",
        description: `Loaded ${deck.cards.length} cards from ${deck.name}`,
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to import the Excel file. Please check the file format.",
        variant: "destructive",
      });
    }

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Button 
        onClick={handleClick}
        disabled={disabled}
        variant={isReimport ? "outline" : "default"}
        className="gap-2"
      >
        {isReimport ? <RefreshCw className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
        {isReimport ? "Re-import Excel" : "Choose Excel File"}
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
}