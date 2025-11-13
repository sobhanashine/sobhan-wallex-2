'use client'
import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'

export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger
export function PopoverContent({ className, ...props }: PopoverPrimitive.PopoverContentProps) {
  return (
    <PopoverPrimitive.Content className={cn('z-50 rounded-md border bg-white p-2 text-zinc-900 shadow-md dark:bg-zinc-900 dark:text-zinc-100', className)} {...props} />
  )
}