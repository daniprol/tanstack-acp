import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';
import type { IdentifiedPermissionRequest } from 'tanstack-acp';
import type { RequestPermissionResponse } from '@agentclientprotocol/sdk';

interface PermissionDialogProps {
  request: IdentifiedPermissionRequest | null;
  onResolve: (permissionId: string, response: RequestPermissionResponse) => void;
  onReject: (permissionId: string, error: Error) => void;
}

export function PermissionDialog({
  request,
  onResolve,
  onReject,
}: PermissionDialogProps) {
  if (!request) return null;

  const handleAllowOnce = () => {
    onResolve(request.permissionId, {
      outcome: { outcome: 'allow_once' },
    });
  };

  const handleAllowAlways = () => {
    onResolve(request.permissionId, {
      outcome: { outcome: 'allow_always' },
    });
  };

  const handleReject = () => {
    onReject(request.permissionId, new Error('User rejected permission'));
  };

  return (
    <Dialog open={!!request} onOpenChange={() => handleReject()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-yellow-500" />
            <DialogTitle>Permission Request</DialogTitle>
          </div>
          <DialogDescription>
            The agent is requesting permission to execute a tool.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted p-3 rounded-md">
            <p className="font-medium text-sm">{request.toolCall.title}</p>
            {request.toolCall.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {request.toolCall.description}
              </p>
            )}
          </div>

          {request.options.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Choose an option:</p>
              <div className="space-y-2">
                {request.options.map((option) => (
                  <Button
                    key={option.optionId}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() =>
                      onResolve(request.permissionId, {
                        outcome: {
                          outcome: 'selected',
                          optionId: option.optionId,
                        },
                      })
                    }
                  >
                    <div>
                      <p className="font-medium">{option.name}</p>
                      {option.description && (
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              Review this request carefully. Allowing access may enable the agent
              to make changes to your system.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleReject} className="sm:w-auto w-full">
            Deny
          </Button>
          <div className="flex gap-2 sm:w-auto w-full">
            <Button variant="secondary" onClick={handleAllowOnce} className="flex-1">
              Allow Once
            </Button>
            <Button onClick={handleAllowAlways} className="flex-1">
              Allow Always
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
