import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Shuffle } from 'lucide-react';
import { FilterType } from '@/hooks/useDeckStorage';

interface DeckControlsProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  stats: {
    know: number;
    dontKnow: number;
    total: number;
    unrated: number;
  };
  onExport: () => void;
  onShuffle?: () => void;
  disabled?: boolean;
}

export function DeckControls({ 
  filter, 
  onFilterChange, 
  stats, 
  onExport, 
  onShuffle,
  disabled = false 
}: DeckControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-muted/30 rounded-lg">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">
          Total: {stats.total}
        </Badge>
        <Badge variant="default" className="bg-green-500">
          Know: {stats.know}
        </Badge>
        <Badge variant="destructive">
          Don't Know: {stats.dontKnow}
        </Badge>
        <Badge variant="outline">
          Unrated: {stats.unrated}
        </Badge>
      </div>

      <div className="flex gap-2 items-center">
        <Select value={filter} onValueChange={onFilterChange} disabled={disabled}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cards</SelectItem>
            <SelectItem value="know">Known Only</SelectItem>
            <SelectItem value="dont_know">Unknown Only</SelectItem>
          </SelectContent>
        </Select>

        {onShuffle && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onShuffle}
            disabled={disabled}
            className="gap-1"
          >
            <Shuffle className="h-4 w-4" />
            Shuffle
          </Button>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          onClick={onExport}
          disabled={disabled}
          className="gap-1"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
}