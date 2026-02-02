import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Terminal, AlertCircle } from 'lucide-react';

interface ChatEmptyStateProps {
  isConnected: boolean;
  hasActiveSession: boolean;
  onCreateSession: () => void;
}

export function ChatEmptyState({
  isConnected,
  hasActiveSession,
  onCreateSession,
}: ChatEmptyStateProps) {
  if (!isConnected) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Terminal className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Not Connected</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Select an agent and click Connect to start chatting
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasActiveSession) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Terminal className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-medium">No Active Session</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Create a new session or load an existing one to start chatting
            </p>
          </div>
          <Button onClick={onCreateSession}>Create Session</Button>
        </div>
      </div>
    );
  }

  return null;
}

interface ChatErrorProps {
  error: Error;
}

export function ChatError({ error }: ChatErrorProps) {
  return (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error.message || 'An error occurred while sending the message.'}
        </AlertDescription>
      </Alert>
    </div>
  );
}
