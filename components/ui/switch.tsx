'use client'
import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

export function Switch({ className, ...props }: SwitchPrimitive.SwitchProps) {
  return (
    <SwitchPrimitive.Root className={cn('peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-zinc-300 bg-zinc-200 p-1 transition-colors data-[state=checked]:bg-zinc-900 dark:border-zinc-700 dark:bg-zinc-700', className)} {...props}>
      <SwitchPrimitive.Thumb className="block h-4 w-4 rounded-full bg-white transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
    </SwitchPrimitive.Root>
  )
}