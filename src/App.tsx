import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import SearchResults from '@/pages/SearchResults';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { TextSelectionMenu } from '@/components/TextSelectionMenu';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <TextSelectionMenu />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search-result" element={<SearchResults />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </ThemeProvider>
  );
}

export default App;