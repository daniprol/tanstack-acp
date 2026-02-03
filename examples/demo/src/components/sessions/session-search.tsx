import * as React from "react"
import { Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { SessionSearchProps } from "./types"

export function SessionSearch({
  value,
  onChange,
  placeholder = "Search conversations...",
}: SessionSearchProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleClear = () => {
    onChange("")
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "pl-9 pr-9 h-10",
          "bg-zinc-50 dark:bg-zinc-900",
          "border-zinc-200 dark:border-zinc-800",
          "focus-visible:ring-blue-500"
        )}
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-zinc-400 hover:text-zinc-600"
          onClick={handleClear}
          type="button"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
