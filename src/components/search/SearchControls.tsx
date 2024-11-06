import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageIcon, FileTextIcon, BrainCircuitIcon } from 'lucide-react';

interface SearchControlsProps {
  imageSearch: boolean;
  setImageSearch: (value: boolean) => void;
  selectedModel: string;
  setSelectedModel: (value: string) => void;
}

export function SearchControls({
  imageSearch,
  setImageSearch,
  selectedModel,
  setSelectedModel,
}: SearchControlsProps) {
  return (
    <div className="flex gap-2 justify-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={imageSearch ? 'secondary' : 'ghost'}
            size="icon"
            className="h-10 w-10"
            onClick={() => setImageSearch(!imageSearch)}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle image search</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10"
          >
            <FileTextIcon className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Attach documents</p>
        </TooltipContent>
      </Tooltip>

      <Select value={selectedModel} onValueChange={setSelectedModel}>
        <SelectTrigger className="w-[180px]">
          <BrainCircuitIcon className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Select Model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="gpt-4">GPT-4</SelectItem>
          <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
          <SelectItem value="claude">Claude</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}