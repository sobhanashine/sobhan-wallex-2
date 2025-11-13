'use client'
import * as React from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import { cn } from '@/lib/utils'

export function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return <CommandPrimitive className={cn('flex h-full w-full flex-col overflow-hidden rounded-md border bg-background text-foreground', className)} {...props} />
}
export const CommandInput = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="flex items-center border-b px-3">
    <input className={cn('flex h-10 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-zinc-400', className)} {...props} />
  </div>
)
export const CommandList = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('max-h-64 overflow-y-auto', className)} {...props} />
)
export const CommandEmpty = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-3 text-sm text-zinc-500', className)} {...props} />
)
export const CommandGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-1', className)} {...props} />
)
export const CommandItem = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800', className)} {...props} />
)