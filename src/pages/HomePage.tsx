import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GithubIcon, TwitterIcon } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SearchControls } from '@/components/search/SearchControls';
import { SearchInput } from '@/components/search/SearchInput';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [imageSearch, setImageSearch] = useState(false);
  const [selectedModel, setSelectedModel] = useState('mixtral');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const searchParams = new URLSearchParams({
        q: query,
        imageSearch: imageSearch.toString(),
        model: selectedModel,
      });
      navigate(`/search-result?${searchParams.toString()}`);
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <header className="border-b hidden">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h2 className="font-display font-bold text-xl">NewEra</h2>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <GithubIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <TwitterIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl space-y-8">
          <div className="text-center space-y-4 pt-4">
            <h1 className="font-display text-6xl md:text-7xl font-black pb-3 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50">
              Search Reimagined
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              Experience the future of search with AI-powered insights
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative space-y-4">
            <TooltipProvider>
              {/*<SearchControls
                imageSearch={imageSearch}
                setImageSearch={setImageSearch}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
              /> */}
              <SearchInput query={query} setQuery={setQuery} />
            </TooltipProvider>
          </form>
        </div>
      </main>

      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between text-sm text-muted-foreground">
          <div>© 2024 NewEra Search. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              About
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
