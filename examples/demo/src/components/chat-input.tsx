import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Send, Loader2 } from 'lucide-react';
import { useChatInput } from '@/hooks/use-chat-input';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSubmit, disabled, placeholder }: ChatInputProps) {
  const {
    input,
    handleInputChange,
    handleSubmit,
    handleKeyDown,
    textareaRef,
  } = useChatInput({
    onSubmit,
    disabled,
  });
  
  return (
    <form onSubmit={handleSubmit} className="relative">
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Type a message...'}
        disabled={disabled}
        rows={1}
        className={cn(
          'min-h-[60px] resize-none pr-12 py-3',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />
      <Button
        type="submit"
        size="icon"
        disabled={disabled || !input.trim()}
        className="absolute right-2 bottom-2 h-8 w-8"
      >
        {disabled ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </Button>
    </form>
  );
}
