"use client"
import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ApexChart } from "@/components/chart/ApexChart"
import { useMarketStore } from "@/store/marketStore"
import { formatNumber } from "@/lib/utils"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function Home() {
  const {
    markets,
    loading,
    search,
    sortKey,
    sortAsc,
    quoteFilter,
    selected,
    resolution,
    fetchMarkets,
    setSearch,
    setSort,
    toggleSortOrder,
    setQuoteFilter,
    toggleSelected,
    clearSelected,
    setResolution,
  } = useMarketStore()

  const [open, setOpen] = React.useState(false)
  const [spotOnly, setSpotOnly] = React.useState(false)

  React.useEffect(() => {
    fetchMarkets()
  }, [fetchMarkets])

  const filtered = React.useMemo(() => {
    let data = markets
    // فقط SOL و BTC را نشان بده
    data = data.filter(m => 
      m.symbol.startsWith('SOL') || 
      m.symbol.startsWith('BTC')
    )
    if (search) data = data.filter(m => m.symbol.toLowerCase().includes(search.toLowerCase()) || (m.fa_base_asset || "").includes(search))
    if (quoteFilter === "USDT") data = data.filter(m => m.is_usdt_based)
    if (quoteFilter === "TMN") data = data.filter(m => m.is_tmn_based)
    if (spotOnly) data = data.filter(m => m.is_spot)
    data = [...data].sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      return sortAsc ? Number(va) - Number(vb) : Number(vb) - Number(va)
    })
    return data
  }, [markets, search, quoteFilter, spotOnly, sortKey, sortAsc])

  const resolutions = [
    { label: "1H", value: "60" },
    { label: "4H", value: "240" },
    { label: "1D", value: "D" },
    { label: "1W", value: "W" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Professional Exchange Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-screen-2xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <span className="text-card font-bold text-sm">W</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Wallex Exchange
                </span>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <Button variant="ghost" className="text-foreground hover:text-primary">بازارها</Button>
                <Button variant="ghost" className="text-foreground hover:text-primary">معامله</Button>
                <Button variant="ghost" className="text-foreground hover:text-primary">دارایی‌ها</Button>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
                ورود
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                ثبت‌نام
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Trading Interface */}
      <div className="mx-auto max-w-screen-2xl px-4 py-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          
          {/* Left Sidebar - Market List */}
          <div className="xl:col-span-1 space-y-4">
            <Card className="exchange-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-foreground">بازارها</CardTitle>
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                    {filtered.length} جفت‌ارز
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-3 border-b border-border/50">
                  <Input 
                    placeholder="🔍 جستجوی رمزارز..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)}
                    className="bg-secondary/50 border-0 text-sm"
                  />
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/50 hover:bg-secondary/30">
                        <TableHead className="text-right py-2 text-xs">نماد</TableHead>
                        <TableHead className="text-right py-2 text-xs">قیمت</TableHead>
                        <TableHead className="text-right py-2 text-xs">۲۴h</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(m => (
                        <TableRow 
                          key={m.symbol} 
                          className={`cursor-pointer border-b border-border/30 hover:bg-secondary/50 transition-colors ${
                            selected.includes(m.symbol) ? 'bg-primary/10 border-primary/30' : ''
                          }`}
                          onClick={() => toggleSelected(m.symbol)}
                        >
                          <TableCell className="py-2">
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">{m.symbol}</span>
                              <span className="text-xs text-muted-foreground">{m.fa_base_asset}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 font-medium text-sm">
                            {formatNumber(m.price)}
                          </TableCell>
                          <TableCell className={`py-2 font-medium text-sm ${
                            m.change_24h >= 0 ? 'text-success' : 'text-danger'
                          }`}>
                            {formatNumber(m.change_24h, { maximumFractionDigits: 2 })}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Chart */}
          <div className="xl:col-span-2 space-y-4">
            <Card className="exchange-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl text-foreground">
                      نمودار قیمت
                    </CardTitle>
                    {selected.length > 0 && (
                      <div className="flex items-center gap-2">
                        {selected.map(s => (
                          <Badge key={s} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Tabs value={resolution} onValueChange={(v) => setResolution(v as '60' | '240' | 'D' | 'W')}>
                    <TabsList className="bg-secondary border-0">
                      {resolutions.map(r => (
                        <TabsTrigger 
                          key={r.value} 
                          value={r.value}
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs"
                        >
                          {r.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96">
                  <ApexChart />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Order Form & Info */}
          <div className="xl:col-span-1 space-y-4">
            {/* Trading Info */}
            <Card className="exchange-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground">اطلاعات بازار</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filtered.slice(0, 1).map(m => (
                  <div key={m.symbol} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">قیمت فعلی</span>
                      <span className="font-bold text-primary">{formatNumber(m.price)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">تغییر ۲۴h</span>
                      <span className={`font-medium ${
                        m.change_24h >= 0 ? 'text-success' : 'text-danger'
                      }`}>
                        {formatNumber(m.change_24h, { maximumFractionDigits: 2 })}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">حجم ۲۴h</span>
                      <span className="font-medium">{formatNumber(m.volume_24h)}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="exchange-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground">عملیات سریع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-success hover:bg-success/90 text-white"
                  onClick={() => window.open('#buy', '_self')}
                >
                  خرید سریع
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-success/50 text-success hover:bg-success/10"
                  onClick={() => window.open('#sell', '_self')}
                >
                  فروش سریع
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={clearSelected}
                  disabled={selected.length === 0}
                >
                  پاک کردن انتخاب‌ها
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
