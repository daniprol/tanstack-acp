import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Send, Settings, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { MODEL_OPTIONS } from '@/types';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  onSendMessage,
  selectedModel,
  onModelChange,
  isLoading = false,
  disabled = false,
  placeholder = 'Type your message...',
  className,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = useCallback(() => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading || disabled) return;

    onSendMessage(trimmedInput);
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, isLoading, disabled, onSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isDisabled = isLoading || disabled || !input.trim();
  const selectedModelInfo = MODEL_OPTIONS.find((m) => m.id === selectedModel);

  return (
    <div
      className={cn(
        'border-t bg-background p-4 space-y-3',
        className
      )}
    >
      {/* Options Collapsible */}
      <Collapsible open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
        <div className="flex items-center justify-between">
          {/* Model Selector */}
          <div className="flex items-center gap-2">
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {MODEL_OPTIONS.map((model) => (
                  <SelectItem key={model.id} value={model.id} className="text-xs">
                    <div className="flex flex-col">
                      <span>{model.name}</span>
                      <span className="text-xs text-zinc-500">
                        {model.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Options Toggle */}
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-zinc-500"
              >
                <Settings className="w-3.5 h-3.5 mr-1" />
                Options
                {isOptionsOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 ml-1" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 ml-1" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>

          {/* Selected Model Info */}
          {selectedModelInfo && (
            <span className="text-xs text-zinc-500 hidden sm:inline">
              {selectedModelInfo.description}
            </span>
          )}
        </div>

        {/* Options Content */}
        <CollapsibleContent className="pt-2">
          <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Additional configuration options will appear here. Currently using:{' '}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {selectedModelInfo?.name || 'Default'}
              </span>
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Input Area */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading || disabled}
          className={cn(
            'min-h-[60px] max-h-[200px] resize-none pr-12 py-3',
            'bg-zinc-50 dark:bg-zinc-900/50',
            'focus-visible:ring-brand'
          )}
          rows={1}
        />

        {/* Send Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className={cn(
                  'absolute right-2 bottom-2 h-8 w-8',
                  'bg-brand text-brand-foreground hover:bg-brand/90',
                  'transition-all duration-200',
                  isDisabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={handleSubmit}
                disabled={isDisabled}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{isLoading ? 'Sending...' : 'Send message (Enter)'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Hint */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Press Shift+Enter for new line</span>
        <span className={cn('transition-opacity', input.length > 0 ? 'opacity-100' : 'opacity-0')}>
          {input.length} characters
        </span>
      </div>
    </div>
  );
}
