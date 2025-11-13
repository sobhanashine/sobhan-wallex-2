'use client'
import * as React from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type DateRange = 'today' | 'week' | 'month' | '3months' | '6months' | 'year' | 'custom'

interface DateFilterProps {
  value: DateRange
  onChange: (value: DateRange, from?: number, to?: number) => void
  className?: string
}

const dateRanges = [
  { value: 'today' as DateRange, label: 'امروز', days: 1 },
  { value: 'week' as DateRange, label: 'هفته', days: 7 },
  { value: 'month' as DateRange, label: 'ماه', days: 30 },
  { value: '3months' as DateRange, label: '۳ ماه', days: 90 },
  { value: '6months' as DateRange, label: '۶ ماه', days: 180 },
  { value: 'year' as DateRange, label: 'سال', days: 365 },
]

export function DateFilter({ value, onChange, className }: DateFilterProps) {
  const [open, setOpen] = React.useState(false)
  const [customFrom, setCustomFrom] = React.useState('')
  const [customTo, setCustomTo] = React.useState('')
  const [activeTab, setActiveTab] = React.useState<'quick' | 'custom'>('quick')

  const getCurrentLabel = () => {
    const range = dateRanges.find(r => r.value === value)
    return range?.label || 'بازه زمانی'
  }

  const handleQuickSelect = (rangeValue: DateRange) => {
    const range = dateRanges.find(r => r.value === rangeValue)
    if (range) {
      const now = Math.floor(Date.now() / 1000)
      const from = now - (range.days * 24 * 60 * 60)
      onChange(rangeValue, from, now)
      setOpen(false)
    }
  }

  const handleCustomSelect = () => {
    if (customFrom && customTo) {
      const fromDate = new Date(customFrom).getTime() / 1000
      const toDate = new Date(customTo).getTime() / 1000
      onChange('custom', fromDate, toDate)
      setOpen(false)
    }
  }

  const handlePresetSelect = (preset: 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear') => {
    const now = new Date()
    let fromDate: Date
    let toDate: Date = new Date()

    switch (preset) {
      case 'thisMonth':
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'lastMonth':
        fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        toDate = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case 'thisYear':
        fromDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'lastYear':
        fromDate = new Date(now.getFullYear() - 1, 0, 1)
        toDate = new Date(now.getFullYear(), 0, 0)
        break
    }

    onChange('custom', fromDate.getTime() / 1000, toDate.getTime() / 1000)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full md:w-[200px] justify-between bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600 hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-200",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="font-medium">{getCurrentLabel()}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="end">
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'quick' | 'custom')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="quick">بازه‌های سریع</TabsTrigger>
              <TabsTrigger value="custom">انتخاب دلخواه</TabsTrigger>
            </TabsList>
            
            {activeTab === 'quick' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {dateRanges.map((range) => (
                    <Button
                      key={range.value}
                      variant={value === range.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleQuickSelect(range.value)}
                      className={cn(
                        "justify-start text-xs transition-all duration-200",
                        value === range.value && "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                      )}
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
                
                <div className="border-t pt-3 mt-3">
                  <p className="text-xs text-muted-foreground mb-2">پیش‌فرض‌های ماه و سال:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePresetSelect('thisMonth')}
                      className="justify-start text-xs"
                    >
                      این ماه
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePresetSelect('lastMonth')}
                      className="justify-start text-xs"
                    >
                      ماه قبل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePresetSelect('thisYear')}
                      className="justify-start text-xs"
                    >
                      امسال
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePresetSelect('lastYear')}
                      className="justify-start text-xs"
                    >
                      پارسال
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'custom' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">از تاریخ:</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                      "dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    )}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">تا تاریخ:</label>
                  <input
                    type="date"
                  value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                      "dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    )}
                  />
                </div>
                
                <Button
                  onClick={handleCustomSelect}
                  disabled={!customFrom || !customTo}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                >
                  اعمال بازه زمانی
                </Button>
              </div>
            )}
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  )
}