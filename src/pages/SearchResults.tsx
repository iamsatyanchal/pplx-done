import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowUpIcon,
  BoldIcon,
  BrainCircuitIcon,
  CheckIcon,
  CopyIcon,
  FileTextIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  LayoutGridIcon,
  PencilIcon,
  RefreshCwIcon,
  ShareIcon,
  Sparkles,
  Square,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProcessingIndicator } from '@/components/search/ProcessingIndicator';
import { ImagePreview } from '@/components/search/ImagePreview';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: { src: string }[];
  isStreaming?: boolean;
  hasStartedStreaming?: boolean;
  documents?: File[];
  shouldShowImageLoading?: boolean;
}

const ImageSkeleton = () => (
  <div className="mt-4 grid grid-cols-4 dekh gap-2">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="animate-pulse bg-muted rounded-sm h-40 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    ))}
  </div>
);

const DocumentPreview = ({ file }: { file: File }) => (
  <div className="bg-muted p-4 rounded-lg animate-in fade-in-0 slide-in-from-bottom-4">
    <div className="flex items-center gap-2">
      <FileTextIcon className="h-5 w-5" />
      <span className="font-medium">{file.name}</span>
    </div>
    <div className="mt-2 text-sm text-muted-foreground">
      {(file.size / 1024).toFixed(1)} KB
    </div>
  </div>
);

const MessageSkeleton = () => (
  <div className="space-y-2">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="h-4 bg-muted rounded animate-pulse relative overflow-hidden"
        style={{ width: `${Math.random() * 40 + 60}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer" />
      </div>
    ))}
  </div>
);

const MessageContent = ({
  message,
  imageSearchEnabled,
  onEdit,
  onSaveEdit,
  onCancelEdit,
}: {
  message: Message;
  imageSearchEnabled: boolean;
  onEdit: (id: string) => void;
  onSaveEdit: (id: string, content: string) => void;
  onCancelEdit: (id: string) => void;
}) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message.images) {
      Promise.all(
        message.images.map(
          (img) =>
            new Promise((resolve) => {
              const image = new Image();
              image.src = img.src;
              image.onload = resolve;
            })
        )
      ).then(() => setImagesLoaded(true));
    }
  }, [message.images]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  useEffect(() => {
    const adjustBubbleWidth = () => {
      const bubble = messageRef.current;
      if (!bubble || message.role !== 'user') return;

      bubble.style.width = 'auto';
      const content = bubble.textContent || '';
      const wordCount = content.split(/\s+/).filter(Boolean);

      if (wordCount.length === 1) {
        bubble.style.width = 'auto';
      } else {
        bubble.style.width = 'auto';
        const originalHeight = bubble.clientHeight;
        let newWidth = bubble.clientWidth;

        while (newWidth > 0) {
          bubble.style.width = newWidth + 'px';
          if (bubble.clientHeight > originalHeight) {
            bubble.style.width = newWidth + 1 + 'px';
            break;
          }
          newWidth--;
        }
      }
    };
    adjustBubbleWidth();
    window.addEventListener('resize', adjustBubbleWidth);
    return () => window.removeEventListener('resize', adjustBubbleWidth);
  }, [message.content, message.role]);

  return (
    <div
      className={cn(
        'group relative',
        message.role === 'user' ? 'text-right' : '',
        'animate-in fade-in-0 duration-300'
      )}
    >
      <div
        ref={messageRef}
        className={cn(
          'inline-block text-left',
          message.role === 'user'
            ? 'mt-2.5 bg-primary text-primary-foreground user-msg mr-4'
            : 'rounded-lg pt-1 pl-4 w-[100%] pr-4 mobhai'
        )}
        style={message.role === 'user' ? { maxWidth: '80%' } : undefined}
      >
        {message.role === 'assistant' && (
          <>
            {message.documents && (
              <div className="mb-4 grid gap-2">
                {message.documents.map((doc, index) => (
                  <DocumentPreview key={index} file={doc} />
                ))}
              </div>
            )}
            <div className="mb-4">
              {!imagesLoaded &&
                imageSearchEnabled &&
                message.shouldShowImageLoading && <ImageSkeleton />}
              {message.images && imagesLoaded && (
                <div className="mt-4 grid grid-cols-4 dekh gap-2">
                  {message.images.slice(0, 4).map((image, i) => (
                    <ImagePreview
                      key={i}
                      src={image.src}
                      alt={`Result ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
            {!message.hasStartedStreaming ? (
              <MessageSkeleton />
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="markdown-body prose prose-neutral dark:prose-invert max-w-none mb-3"
              >
                {message.content}
              </ReactMarkdown>
            )}
          </>
        )}
        {message.role === 'user' && message.content}
      </div>
      {!message.isStreaming && (
        <div className="chhota flex pl-4 gap-1 transition-opacity">
          {/*message.role === 'user' && (
            <Button
              variant="ghost"
              size="sm"
              className="transition-opacity border"
              onClick={() => onEdit(message.id)}
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )*/}
          {message.role === 'assistant' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="transition-opacity border"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="transition-opacity border"
                onClick={handleCopy}
              >
                {isCopied ? (
                  <CheckIcon className="h-4 w-4 mr-2" />
                ) : (
                  <CopyIcon className="h-4 w-4 mr-2" />
                )}
                {isCopied ? 'Copied' : 'Copy'}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [imageSearchEnabled, setImageSearchEnabled] = useState(
    searchParams.get('images') !== 'false'
  );
  const [selectedModel, setSelectedModel] = useState(
    searchParams.get('model') || 'mixtral'
  );
  const [documents, setDocuments] = useState<File[]>([]);
  const [textFormatting, setTextFormatting] = useState({
    bold: false,
    italic: false,
    link: false,
    list: false,
  });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const initialQuery = searchParams.get('q') || '';

  useEffect(() => {
    if (initialQuery && !hasInitialized) {
      handleSearch(initialQuery);
      setHasInitialized(true);
    }
  }, [initialQuery, hasInitialized]);

  const scrollToBottom = useCallback(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const createMessage = useCallback(
    (
      role: 'user' | 'assistant',
      content: string,
      isStreaming = false,
      hasStartedStreaming = false
    ): Message => ({
      id: `${role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      isStreaming,
      hasStartedStreaming,
      documents: role === 'user' ? documents : undefined,
      shouldShowImageLoading: role === 'assistant' && imageSearchEnabled,
    }),
    [documents, imageSearchEnabled]
  );

  const updateLastBotMessage = useCallback(
    (content: string, isStreaming = true) => {
      setMessages((prev) => {
        const lastBotMessageIndex = prev.findLastIndex(
          (m) => m.role === 'assistant'
        );
        if (lastBotMessageIndex === -1) return prev;

        const newMessages = [...prev];
        newMessages[lastBotMessageIndex] = {
          ...newMessages[lastBotMessageIndex],
          content,
          isStreaming,
          hasStartedStreaming: true,
        };
        return newMessages;
      });
    },
    []
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments((prev) => [...prev, ...files]);
  };

  const handleFormatting = (type: keyof typeof textFormatting) => {
    setTextFormatting((prev) => ({ ...prev, [type]: !prev[type] }));

    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newMessage.substring(start, end);
    let formattedText = '';

    switch (type) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        break;
      case 'list':
        formattedText = `\n- ${selectedText}`;
        break;
    }

    const newValue =
      newMessage.substring(0, start) +
      formattedText +
      newMessage.substring(end);
    setNewMessage(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + formattedText.length,
        start + formattedText.length
      );
    }, 0);
  };

  const handleSearch = async (query: string) => {
    if (isLoading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    const userMessage = createMessage('user', query);
    const botMessage = createMessage('assistant', '', true, false);

    if (!hasInitialized && initialQuery === query) {
      setMessages([userMessage, botMessage]);
    } else {
      setMessages((prev) => [...prev, userMessage, botMessage]);
    }

    try {
      let imagesPromise;
      if (imageSearchEnabled) {
        imagesPromise = fetch(
          `https://red-panda-v1.koyeb.app/images?query=${encodeURIComponent(
            query
          )}&images=4`
        ).then((res) => res.json());
      }

      /*const response = await fetch(
        'https://bhkkhjgkk-mixtral-46-7b-fastapi-v2-stream.hf.space/generate/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: query,
            model: selectedModel,
            history: messages
              .filter((msg) => !msg.isStreaming)
              .reduce((acc, msg, index, arr) => {
                if (
                  msg.role === 'user' &&
                  arr[index + 1] &&
                  arr[index + 1].role === 'assistant'
                ) {
                  acc.push([msg.content, arr[index + 1].content]);
                }
                return acc;
              }, []),
            system_prompt: `YOU ARE AN AI ASSISTANT NAMED SHADOW AI`,
          }),
          signal: abortControllerRef.current.signal,
        }*/
        if (selectedModel == "lamma") { 
        var response = await fetch('https://red-panda-v1.koyeb.app/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          model: 'llama-3.1-70b',
          history: messages
            .filter((msg) => !msg.isStreaming)
            .map(({ role, content }) => ({ role, content })),
        }),
        signal: abortControllerRef.current.signal,
      }
      )}
      if (selectedModel == "online") { 
        var response = await fetch('https://red-panda-v1.koyeb.app/answeron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          model: 'llama-3.1-70b',
          history: messages
            .filter((msg) => !msg.isStreaming)
            .map(({ role, content }) => ({ role, content })),
        }),
        signal: abortControllerRef.current.signal,
      }
      )}
      if (selectedModel == "mixtral") {  
var response = await fetch(
        'https://bhkkhjgkk-mixtral-46-7b-fastapi-v2-stream.hf.space/generate/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: query,
            model: selectedModel,
            history: messages
              .filter((msg) => !msg.isStreaming)
              .reduce((acc, msg, index, arr) => {
                if (
                  msg.role === 'user' &&
                  arr[index + 1] &&
                  arr[index + 1].role === 'assistant'
                ) {
                  acc.push([msg.content, arr[index + 1].content]);
                }
                return acc;
              }, []),
            system_prompt: `YOU ARE AN AI ASSISTANT NAMED SHADOW AI`,
          }),
          signal: abortControllerRef.current.signal,
        }) }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value).replace('</s>', '');
        accumulatedContent += text;
        updateLastBotMessage(accumulatedContent.replace('</s>', ''));
      }

      const images = imageSearchEnabled ? await imagesPromise : undefined;
      setMessages((prev) => {
        const lastBotMessageIndex = prev.findLastIndex(
          (m) => m.role === 'assistant'
        );
        if (lastBotMessageIndex === -1) return prev;

        const newMessages = [...prev];
        newMessages[lastBotMessageIndex] = {
          ...newMessages[lastBotMessageIndex],
          content: accumulatedContent,
          images,
          isStreaming: false,
          hasStartedStreaming: true,
        };
        return newMessages;
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('Error:', error);
        toast.error('Failed to get response. Please try again.');
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      setDocuments([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !isLoading) {
      handleSearch(newMessage.trim());
      setNewMessage('');
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
      }
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-display font-bold text-xl">NewEra</h2>
            {isLoading && <ProcessingIndicator />}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <LayoutGridIcon className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button variant="outline" size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade
            </Button>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1 px-4">
        <div className="max-w-4xl mx-auto py-8 space-y-6">
          {messages.map((message) => (
            <MessageContent
              key={message.id}
              message={message}
              imageSearchEnabled={imageSearchEnabled}
              onEdit={() => {}}
              onSaveEdit={() => {}}
              onCancelEdit={() => {}}
            />
          ))}
          <div ref={chatEndRef} />
        </div>
      </ScrollArea>

      <div className="bg-background/80 sticky bottom-0">
        <div className="lg:w-[75%] w-[100%] mx-auto pb-3 pl-4 pr-4 pt-0 kyare">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative border rounded-xl transition-colors omk">
              <div className="flex gap-2 border-b p-1 pl-1">
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-[145px] h-8">
                    <BrainCircuitIcon className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixtral">Mixtral 8x7B</SelectItem>
                    <SelectItem value="lamma">Lamma-3.1-70b</SelectItem>
                    <SelectItem value="online">Web Search</SelectItem>
                  </SelectContent>
                </Select>
                <div className="w-px h-8 bg-border" />
                <Button
                  type="button"
                  variant={imageSearchEnabled ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setImageSearchEnabled(!imageSearchEnabled)}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>

                <div className="relative hover:bg-muted rounded-md">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="transition-colors absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <Button
                    type="button"
                    variant={documents.length > 0 ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                  >
                    <FileTextIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {documents.length > 0 && (
                <div className="flex gap-2 p-2 border-b overflow-x-auto">
                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className="bg-muted px-3 py-1 rounded-full text-sm flex items-center gap-2 animate-in fade-in-0 slide-in-from-bottom-4 whitespace-nowrap"
                    >
                      <FileTextIcon className="h-4 w-4" />
                      {doc.name}
                      <button
                        type="button"
                        className="hover:text-destructive"
                        onClick={() => {
                          setDocuments((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Textarea
                ref={textAreaRef}
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                placeholder="Type here to search anything.."
                className="markdown-body min-h-[50px] max-h-[200px] pr-24 pt-3 resize-none text-base bg-transparent border-none shadow-none focus:outline-none focus-visible:ring-0 focus-visible:border-0 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <div className="absolute right-3 mb-1 bottom-3 flex gap-2">
                <Button
                  type={isLoading ? 'button' : 'submit'}
                  size="icon"
                  className="h-8 w-8 rounded-lg bg-primary hover:bg-primary/90 transition-all duration-200"
                  disabled={
                    (!isLoading && !newMessage.trim()) ||
                    (isLoading && !abortControllerRef.current)
                  }
                  onClick={() => {
                    if (isLoading && abortControllerRef.current) {
                      abortControllerRef.current.abort();
                    }
                  }}
                >
                  {isLoading ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <ArrowUpIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}