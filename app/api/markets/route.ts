import { NextResponse } from 'next/server'

export const revalidate = 30

export async function GET() {
  const key = '17108|2vBxYCn3sc96JsAO9HeNA0sh5fMX8iEOe98sCzw3'
  const res = await fetch('https://api.wallex.ir/hector/web/v1/markets', {
    headers: key ? { 'x-api-key': key } : {},
    next: { revalidate }
  })
  if (!res.ok) return NextResponse.json({ error: true }, { status: res.status })
  const data = await res.json()
  const markets = data?.result?.markets || []
  return NextResponse.json({ markets })
}
// todo