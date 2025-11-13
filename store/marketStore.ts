'use client'
import { create } from 'zustand'

export type Market = {
  symbol: string
  base_asset: string
  quote_asset: string
  fa_base_asset?: string
  fa_quote_asset?: string
  price: number
  change_24h: number
  volume_24h: number
  change_7D?: number
  is_spot?: boolean
  is_usdt_based?: boolean
  is_tmn_based?: boolean
}

export type SortKey = 'price' | 'change_24h' | 'volume_24h'
export type QuoteFilter = 'ALL' | 'USDT' | 'TMN'
export type Resolution = '60' | '240' | 'D' | 'W'
export type DateRange = 'today' | 'week' | 'month' | '3months' | '6months' | 'year' | 'custom'

type State = {
  markets: Market[]
  loading: boolean
  search: string
  sortKey: SortKey
  sortAsc: boolean
  quoteFilter: QuoteFilter
  selected: string[]
  resolution: Resolution
  dateRange: DateRange
  dateFrom: number
  dateTo: number
}

type Actions = {
  fetchMarkets: () => Promise<void>
  setSearch: (v: string) => void
  setSort: (k: SortKey) => void
  toggleSortOrder: () => void
  setQuoteFilter: (q: QuoteFilter) => void
  toggleSelected: (symbol: string) => void
  clearSelected: () => void
  setResolution: (r: Resolution) => void
  setDateRange: (range: DateRange, from?: number, to?: number) => void
}

export const useMarketStore = create<State & Actions>((set, get) => ({
  markets: [],
  loading: false,
  search: '',
  sortKey: 'change_24h',
  sortAsc: false,
  quoteFilter: 'USDT',
  selected: ['SOLUSDT', 'BTCUSDT'],
  resolution: 'D',
  dateRange: 'month',
  dateFrom: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60), // 30 days ago
  dateTo: Math.floor(Date.now() / 1000), // now
  async fetchMarkets() {
    set({ loading: true })
    const res = await fetch('/api/markets')
    const data = await res.json()
    type WallexMarket = {
      symbol: string
      base_asset: string
      quote_asset: string
      fa_base_asset?: string
      fa_quote_asset?: string
      price?: string | number
      change_24h?: string | number
      volume_24h?: string | number
      change_7D?: string | number
      stats?: { '24h_ch'?: number; '24h_volume'?: string | number; '7d_ch'?: number }
      is_spot?: boolean
      is_usdt_based?: boolean
      is_tmn_based?: boolean
    }
    const markets: Market[] = (data?.markets || []).map((m: WallexMarket) => ({
      symbol: m.symbol,
      base_asset: m.base_asset,
      quote_asset: m.quote_asset,
      fa_base_asset: m.fa_base_asset,
      fa_quote_asset: m.fa_quote_asset,
      price: Number(m.price),
      change_24h: Number(m.change_24h ?? m?.stats?.['24h_ch'] ?? 0),
      volume_24h: Number(m.volume_24h ?? m?.stats?.['24h_volume'] ?? 0),
      change_7D: Number(m.change_7D ?? m?.stats?.['7d_ch'] ?? 0),
      is_spot: Boolean(m.is_spot),
      is_usdt_based: Boolean(m.is_usdt_based),
      is_tmn_based: Boolean(m.is_tmn_based),
    }))
    set({ markets, loading: false })
  },
  setSearch(v) { set({ search: v }) },
  setSort(k) { set({ sortKey: k }) },
  toggleSortOrder() { set({ sortAsc: !get().sortAsc }) },
  setQuoteFilter(q) { set({ quoteFilter: q }) },
  toggleSelected(symbol) {
    const cur = get().selected
    set({ selected: cur.includes(symbol) ? cur.filter(s => s !== symbol) : [...cur, symbol].slice(0, 5) })
  },
  clearSelected() { set({ selected: [] }) },
  setResolution(r) { set({ resolution: r }) },
  setDateRange(range, from, to) {
    if (range === 'custom' && from && to) {
      set({ dateRange: range, dateFrom: from, dateTo: to })
    } else {
      // Calculate dates based on preset ranges
      const now = Math.floor(Date.now() / 1000)
      let fromTimestamp: number
      
      switch (range) {
        case 'today':
          fromTimestamp = now - (24 * 60 * 60) // 1 day
          break
        case 'week':
          fromTimestamp = now - (7 * 24 * 60 * 60) // 7 days
          break
        case 'month':
          fromTimestamp = now - (30 * 24 * 60 * 60) // 30 days
          break
        case '3months':
          fromTimestamp = now - (90 * 24 * 60 * 60) // 90 days
          break
        case '6months':
          fromTimestamp = now - (180 * 24 * 60 * 60) // 180 days
          break
        case 'year':
          fromTimestamp = now - (365 * 24 * 60 * 60) // 365 days
          break
        default:
          fromTimestamp = now - (30 * 24 * 60 * 60) // default to 30 days
      }
      
      set({ dateRange: range, dateFrom: fromTimestamp, dateTo: now })
    }
  },
}))