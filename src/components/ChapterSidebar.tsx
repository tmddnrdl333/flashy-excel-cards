import { Book, Hash, Brain } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

interface ChapterSidebarProps {
  availableLetters: string[];
  selectedChapter: string | null;
  chapterCounts: { [key: string]: number };
  onChapterSelect: (letter: string | null) => void;
  wordStackCount?: number;
}

export function ChapterSidebar({
  availableLetters,
  selectedChapter,
  chapterCounts,
  onChapterSelect,
  wordStackCount = 0,
}: ChapterSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  // Generate all letters A-Z
  const allLetters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-60'} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium flex items-center gap-2">
            <Book className="h-4 w-4" />
            {!collapsed && 'Chapters'}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {/* All Words Option */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onChapterSelect(null)}
                  className={`${
                    selectedChapter === null
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  } ${collapsed ? 'justify-center' : 'justify-between'}`}
                >
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span>All Words</span>}
                  </div>
                  {!collapsed && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {Object.values(chapterCounts).reduce((sum, count) => sum + count, 0)}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Word Stack Option */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onChapterSelect('STACK')}
                  className={`${
                    selectedChapter === 'STACK'
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  } ${collapsed ? 'justify-center' : 'justify-between'}`}
                >
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span>Word Stack</span>}
                  </div>
                  {!collapsed && (
                    <Badge variant="default" className="ml-auto text-xs">
                      {wordStackCount}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Letter Chapters */}
              {allLetters.map((letter) => {
                const hasWords = availableLetters.includes(letter);
                const count = chapterCounts[letter] || 0;
                const isSelected = selectedChapter === letter;

                return (
                  <SidebarMenuItem key={letter}>
                    <SidebarMenuButton
                      onClick={() => hasWords && onChapterSelect(letter)}
                      disabled={!hasWords}
                      className={`${
                        isSelected
                          ? 'bg-primary text-primary-foreground font-medium'
                          : hasWords
                          ? 'hover:bg-accent hover:text-accent-foreground'
                          : 'opacity-50 cursor-not-allowed'
                      } ${collapsed ? 'justify-center' : 'justify-between'}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 flex items-center justify-center text-xs font-bold">
                          {letter}
                        </div>
                        {!collapsed && (
                          <span className={hasWords ? 'text-foreground' : 'text-muted-foreground'}>
                            Chapter {letter}
                          </span>
                        )}
                      </div>
                      {!collapsed && hasWords && (
                        <Badge 
                          variant={isSelected ? 'secondary' : 'outline'} 
                          className="ml-auto text-xs"
                        >
                          {count}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}