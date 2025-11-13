'use client'
import * as React from 'react'
import { createChart, ColorType, LineStyle, UTCTimestamp } from 'lightweight-charts'
import { useMarketStore } from '@/store/marketStore'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function sma(values: number[], period: number) {
  const out: number[] = []
  let sum = 0
  for (let i = 0; i < values.length; i++) {
    sum += values[i]
    if (i >= period) sum -= values[i - period]
    if (i >= period - 1) out.push(sum / period)
    else out.push(NaN)
  }
  return out
}
function ema(values: number[], period: number) {
  const out: number[] = []
  const k = 2 / (period + 1)
  let prev = values[0]
  for (let i = 0; i < values.length; i++) {
    const v = i === 0 ? values[i] : values[i] * k + prev * (1 - k)
    out.push(v)
    prev = v
  }
  return out
}

type CandleResponse = { s?: string; t?: number[]; o?: (number|string)[]; h?: (number|string)[]; l?: (number|string)[]; c?: (number|string)[] }

function hasCandles(d: CandleResponse) {
  return Array.isArray(d.t) && Array.isArray(d.o) && Array.isArray(d.h) && Array.isArray(d.l) && Array.isArray(d.c) && d.t!.length > 0
}

const palette = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

export function Chart() {
  const { selected, resolution } = useMarketStore()
  const ref = React.useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = React.useState<'none' | 'sma' | 'ema'>('none')
  const [period, setPeriod] = React.useState(20)
  const [loading, setLoading] = React.useState(false)
  const seriesRef = React.useRef<any[]>([])

  React.useEffect(() => {
    if (!ref.current) return
    
    // Clear any existing series before creating new chart
    seriesRef.current = []
    
    const chart = createChart(ref.current, {
      layout: { 
        background: { type: ColorType.Solid, color: 'transparent' }, 
        textColor: '#64748b',
        fontFamily: 'var(--font-vazirmatn)',
      },
      grid: { 
        vertLines: { color: 'rgba(148, 163, 184, 0.1)' }, 
        horzLines: { color: 'rgba(148, 163, 184, 0.1)' } 
      },
      rightPriceScale: { 
        borderColor: 'rgba(148, 163, 184, 0.2)',
        scaleMargins: { top: 0.1, bottom: 0.1 }
      },
      timeScale: { 
        borderColor: 'rgba(148, 163, 184, 0.2)',
        timeVisible: true,
        secondsVisible: false,
      },
      autoSize: true,
      crosshair: {
        vertLine: {
          color: 'rgba(139, 92, 246, 0.5)',
          labelBackgroundColor: '#8b5cf6',
        },
        horzLine: {
          color: 'rgba(139, 92, 246, 0.5)',
          labelBackgroundColor: '#8b5cf6',
        },
      },
    })
    
    const now = Math.floor(Date.now() / 1000)
    const from = now - 60 * 60 * 24 * 30
    
    const load = async () => {
      // Remove all existing series safely
      seriesRef.current.forEach(series => {
        if (series && typeof series === 'object') {
          try {
            chart.removeSeries(series)
          } catch (e) {
            console.warn('Failed to remove series:', e)
          }
        }
      })
      seriesRef.current = []
      
      if (selected.length === 0) {
        return
      }
      
      setLoading(true)
      
      try {
        if (selected.length === 1) {
          const symbol = selected[0]
          const res = await fetch(`/api/candles?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${now}`)
          const data: CandleResponse = await res.json()
          
          if (!hasCandles(data) || (data.s && data.s !== 'ok')) {
            setLoading(false)
            return
          }
          
          const series = chart.addCandlestickSeries({
            upColor: '#10b981',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#10b981',
            wickDownColor: '#ef4444',
          })
          
          // Track the series for removal
          seriesRef.current.push(series)
          
          const candles = data.t!.map((t, i) => ({
            time: t as UTCTimestamp,
            open: Number(data.o![i]),
            high: Number(data.h![i]),
            low: Number(data.l![i]),
            close: Number(data.c![i]),
          }))
          
          series.setData(candles)
          
          if (indicator !== 'none') {
            const closes = data.c!.map(Number)
            const calc = indicator === 'sma' ? sma(closes, period) : ema(closes, period)
            const line = chart.addLineSeries({ 
              color: '#8b5cf6', 
              lineStyle: LineStyle.Solid,
              lineWidth: 2,
              crosshairMarkerVisible: true,
              lastValueVisible: false,
            })
            
            // Track the indicator series
            seriesRef.current.push(line)
            const lineData = data.t!.map((t, i) => ({ time: t as UTCTimestamp, value: calc[i] }))
            line.setData(lineData.filter(d => !Number.isNaN(d.value)))
          }
        } else {
          await Promise.all(selected.map(async (symbol, idx) => {
            const res = await fetch(`/api/candles?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${now}`)
            const data: CandleResponse = await res.json()
            
            if (!hasCandles(data) || (data.s && data.s !== 'ok')) return
            
            const line = chart.addLineSeries({ 
              color: palette[idx % palette.length],
              lineWidth: 2,
              crosshairMarkerVisible: true,
              lastValueVisible: true,
              title: symbol,
            })
            
            // Track the line series
            seriesRef.current.push(line)
            
            const lineData = data.t!.map((t, i) => ({ 
              time: t as UTCTimestamp, 
              value: Number(data.c![i]) 
            }))
            
            line.setData(lineData)
          }))
        }
      } catch (error) {
        console.error('Error loading chart data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    load()
    return () => {
      // Clean up series before removing chart
      seriesRef.current.forEach(series => {
        if (series && typeof series === 'object') {
          try {
            chart.removeSeries(series)
          } catch (e) {
            // Ignore errors during cleanup
          }
        }
      })
      seriesRef.current = []
      chart.remove()
    }
  }, [selected, resolution, indicator, period])

  if (selected.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-purple-900/20">
        <CardContent className="flex items-center justify-center h-[420px]">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">📈</div>
            <p className="text-lg text-muted-foreground">رمزارزی را از لیست انتخاب کنید</p>
            <p className="text-sm text-muted-foreground">برای نمایش نمودار، روی رمزارز مورد نظر در جدول کلیک کنید</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-purple-900/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            نمودار قیمت
          </CardTitle>
          <div className="flex items-center gap-2">
            {selected.map((symbol, idx) => (
              <Badge 
                key={symbol} 
                variant="secondary"
                className="border-0 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30"
                style={{ 
                  borderLeft: `3px solid ${palette[idx % palette.length]}`,
                }}
              >
                {symbol}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">اندیکاتور:</Label>
            <Select value={indicator} onValueChange={(value) => setIndicator(value as 'none' | 'sma' | 'ema')}>
              <SelectTrigger className="w-32 bg-white/50 dark:bg-slate-700/50 border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">بدون اندیکاتور</SelectItem>
                <SelectItem value="sma">میانگین متحرک ساده (SMA)</SelectItem>
                <SelectItem value="ema">میانگین متحرک نمایی (EMA)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {indicator !== 'none' && (
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">دوره زمانی:</Label>
              <Input 
                type="number" 
                value={period} 
                min={2} 
                max={200} 
                onChange={(e) => setPeriod(Number(e.target.value))} 
                className="w-20 bg-white/50 dark:bg-slate-700/50 border-0"
              />
            </div>
          )}
        </div>
        
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 rounded-lg flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                در حال بارگذاری...
              </div>
            </div>
          )}
          <div ref={ref} className="h-[420px] w-full rounded-lg overflow-hidden" />
        </div>
      </CardContent>
    </Card>
  )
}