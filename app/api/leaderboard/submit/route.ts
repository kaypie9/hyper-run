import { NextResponse } from 'next/server'
const keyOf = (game: string) => `lb:${game}`

export async function POST(req: Request) {
  try {
    const { game = 'Velocity', member, score } = await req.json() as {
      game?: string; member: string; score: number
    }

    // basic validation
    const isAddr = typeof member === 'string' && /^0x[a-fA-F0-9]{40}$/.test(member)
    const okScore = Number.isFinite(score) && score >= 0 && score <= 1_000_000
    if (!isAddr || !okScore) return NextResponse.json({ error: 'bad_body' }, { status: 400 })

    const url = process.env.UPSTASH_REDIS_REST_URL!
    const token = process.env.UPSTASH_REDIS_REST_TOKEN!

    // ZADD GT keeps only if new score is greater than existing
    const cmd = JSON.stringify(['ZADD', keyOf(game), 'GT', score, member.toLowerCase()])

    const r = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: `[${cmd}]`,
      cache: 'no-store',
    })
    if (!r.ok) return NextResponse.json({ error: 'upstash_fail' }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
