import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const symbol = url.searchParams.get('symbol')
  const resolution = url.searchParams.get('resolution') || '60'
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  if (!symbol || !from || !to) return NextResponse.json({ error: 'params' }, { status: 400 })
  const key = process.env.WALLEX_API_KEY
  const qs = new URLSearchParams({ symbol, resolution, from, to })
  const res = await fetch(`https://api.wallex.ir/v1/udf/history?${qs}`, {
    headers: key ? { 'x-api-key': key } : {}
  })
  if (!res.ok) return NextResponse.json({ error: true }, { status: res.status })
  const data = await res.json()
  return NextResponse.json(data)
}