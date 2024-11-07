import { useEffect, useRef, useState } from 'react';
import { Copy, BookOpen, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Position {
  x: number;
  y: number;
}

interface Definition {
  word: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
}

export function TextSelectionMenu() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [showDefinition, setShowDefinition] = useState(false);
  const [definition, setDefinition] = useState<Definition | null>(null);
  const [selectedMeaningIndex, setSelectedMeaningIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const definitionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect) {
          setPosition({
            x: rect.left + window.scrollX + (rect.width / 2) - 75,
            y: rect.top + window.scrollY - 45
          });
          setSelectedText(text);
          setIsVisible(true);
          setShowDefinition(false);
        }
      } else {
        setIsVisible(false);
        setShowDefinition(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        definitionRef.current && 
        !definitionRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
        setShowDefinition(false);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedText);
      toast.success('Copied to clipboard');
      setIsVisible(false);
    } catch (err) {
      toast.error('Failed to copy text');
    }
  };

  const handleDefine = async () => {
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
          selectedText
        )}`
      );
      const data = await response.json();
      setDefinition(data[0]);
      setSelectedMeaningIndex(0);
      setShowDefinition(true);
    } catch (error) {
      toast.error('Failed to fetch definition');
    }
  };

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(selectedText);
    window.speechSynthesis.speak(utterance);
    setIsVisible(false);
  };

  if (!isVisible && !showDefinition) return null;

  return (
    <>
      {isVisible && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-background border rounded-lg shadow-lg p-1 flex gap-1 animate-in fade-in-0 slide-in-from-bottom-4"
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDefine}
          >
            <BookOpen className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleSpeak}
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {showDefinition && definition && (
        <div
          ref={definitionRef}
          className="fixed z-50 bg-background/95 backdrop-blur-sm border rounded-xl shadow-lg p-6 max-w-sm animate-in fade-in-0 slide-in-from-bottom-4"
          style={{
            left: position.x,
            top: position.y + 45,
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="border absolute right-2 top-2 h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setShowDefinition(false)}
            style={{marginRight: '7px', marginTop: '7px'}}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="space-y-4">
            <div>
              <h3 className="font-display text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70"  style={{marginTop: '-18px'}}>
                {definition.word}
              </h3>
              <div className="flex gap-2 mt-1">
                {definition.meanings.map((meaning, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMeaningIndex(index)}
                    className={cn(
                      "text-xs px-2 py-1 rounded-full transition-colors",
                      selectedMeaningIndex === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    )}
                  >
                    {meaning.partOfSpeech}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {definition.meanings[selectedMeaningIndex].definitions.slice(0, 2).map((def, index) => (
                <div key={index} className="space-y-1">
                  <p className="text-sm leading-relaxed">
                    {index + 1}. {def.definition}
                  </p>
                  {def.example && (
                    <p className="text-sm text-muted-foreground pl-4 border-l-2 border-muted">
                      "{def.example}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
