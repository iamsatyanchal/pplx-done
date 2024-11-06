import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  query: string;
  setQuery: (value: string) => void;
}

export function SearchInput({ query, setQuery }: SearchInputProps) {
  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Ask me anything..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-14 pl-5 pr-14 text-lg rounded-2xl border-2 transition-colors focus:outline-none focus-visible:ring-0 focus-visible:border-2"
      />
      <Button
        type="submit"
        size="icon"
        className={cn(
          'absolute right-2 top-2 h-10 w-10 rounded-xl',
          'transition-all duration-200 ease-in-out',
          'hover:scale-105 active:scale-95'
        )}
      >
        <SearchIcon className="h-5 w-5" />
      </Button>
    </div>
  );
}