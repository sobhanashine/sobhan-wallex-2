'use client'
import * as React from 'react'
import dynamic from 'next/dynamic'
import { useMarketStore } from '@/store/marketStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface CandlestickData {
  x: Date
  y: [number, number, number, number] // [open, high, low, close]
}

export function ApexChart() {
  const { selected, resolution } = useMarketStore()
  const [loading, setLoading] = React.useState(false)
  const [series, setSeries] = React.useState<any[]>([])

  React.useEffect(() => {
    if (selected.length === 0) {
      setSeries([])
      return
    }

    const loadData = async () => {
      setLoading(true)
      try {
        const now = Math.floor(Date.now() / 1000)
        const from = now - 60 * 60 * 24 * 30
        
        const newSeries = await Promise.all(
          selected.map(async (symbol, index) => {
            const res = await fetch(`/api/candles?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${now}`)
            const data = await res.json()
            
            if (!data.t || !data.o || !data.h || !data.l || !data.c || data.s !== 'ok') {
              return null
            }

            const candleData: CandlestickData[] = data.t.map((t: number, i: number) => ({
              x: new Date(t * 1000),
              y: [Number(data.o[i]), Number(data.h[i]), Number(data.l[i]), Number(data.c[i])]
            }))

            return {
              name: symbol,
              data: candleData,
              type: 'candlestick'
            }
          })
        )

        setSeries(newSeries.filter(Boolean))
      } catch (error) {
        console.error('Error loading chart data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selected, resolution])

  if (selected.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center h-[420px]">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4 opacity-30">📈</div>
            <p className="text-lg text-muted-foreground font-light">رمزارزی را انتخاب کنید</p>
            <p className="text-sm text-muted-foreground/70 font-light">برای نمایش نمودار، روی رمزارز مورد نظر در جدول کلیک کنید</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const options = {
    chart: {
      type: 'candlestick' as const,
      height: 420,
      toolbar: {
        show: true,
        tools: {
          download: false,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      background: '#131722',
      foreColor: '#848e9c',
      fontFamily: 'var(--font-vazirmatn)',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#02c076',
          downward: '#f6465d'
        },
        wick: {
          useFillColor: true
        }
      }
    },
    grid: {
      show: true,
      borderColor: '#2a2e39',
      strokeDashArray: 2,
      position: 'back' as const,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    xaxis: {
      type: 'datetime' as const,
      labels: {
        datetimeFormatter: {
          year: 'yyyy',
          month: 'MMM yyyy',
          day: 'dd MMM',
          hour: 'HH:mm'
        },
        style: {
          fontSize: '11px',
          fontFamily: 'var(--font-vazirmatn)',
          colors: '#848e9c'
        }
      },
      axisBorder: {
        show: false,
        color: '#2a2e39'
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '11px',
          fontFamily: 'var(--font-vazirmatn)',
          colors: '#848e9c'
        },
        formatter: (value: number) => {
          return new Intl.NumberFormat('fa-IR').format(Math.round(value))
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      style: {
        fontSize: '12px',
        fontFamily: 'var(--font-vazirmatn)'
      },
      y: {
        formatter: (value: number) => {
          return new Intl.NumberFormat('fa-IR').format(Math.round(value))
        }
      }
    },
    legend: {
      show: selected.length > 1,
      position: 'top' as const,
      horizontalAlign: 'left' as const,
      fontSize: '12px',
      fontFamily: 'var(--font-vazirmatn)',
      labels: {
        colors: '#64748b'
      },
      markers: {
        size: 8,
        strokeWidth: 0,
        fillColors: ['#8884d8']
      }
    }
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 backdrop-blur-sm">
      <CardHeader className="pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-light bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            نمودار قیمت
          </CardTitle>
          <div className="flex items-center gap-2">
            {selected.map((symbol, idx) => (
              <Badge 
                key={symbol} 
                variant="secondary"
                className={cn(
                  "border-0 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30",
                  "backdrop-blur-sm font-light"
                )}
              >
                {symbol}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center h-[420px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-sm text-muted-foreground font-light">در حال بارگذاری نمودار...</p>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <ReactApexChart
              options={options}
              series={series}
              type="candlestick"
              height={420}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}