import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';

interface AppSidebarProps {
  children: React.ReactNode;
  className?: string;
}

export function AppSidebar({ children, className }: AppSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="h-full flex flex-col">
            {children}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col w-64 border-r bg-card h-screen sticky top-0 overflow-hidden",
        className
      )}>
        {children}
      </aside>
    </>
  );
}
