import { NextResponse } from 'next/server';

// make sure this route always runs on the server at request time
export const dynamic = 'force-dynamic';

const ROOT = process.env.NEXT_PUBLIC_URL || 'https://hyperrun-theta.vercel.app';

// your known-good association values (fallbacks)
const FALLBACK = {
  header:
    '',
  payload: '',
  signature:
    '',
};

export async function GET() {
  const header = process.env.NEXT_PUBLIC_FARCASTER_HEADER || FALLBACK.header;
  const payload = process.env.NEXT_PUBLIC_FARCASTER_PAYLOAD || FALLBACK.payload;
  const signature =
    process.env.NEXT_PUBLIC_FARCASTER_SIGNATURE || FALLBACK.signature;

      // --- Base Builder block (owner required; allowed optional) ---
  const ownerAddress =
    process.env.NEXT_PUBLIC_BASE_BUILDER_OWNER ||
    '0xaddress'; // <- your owner
  // Optional: comma-separated list of additional builder addresses
  const allowedCsv = (process.env.NEXT_PUBLIC_BASE_BUILDER_ALLOWED || '').trim();
  const allowedAddresses = allowedCsv
    ? allowedCsv.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined;

    
  return NextResponse.json({
    accountAssociation: { header, payload, signature },

        // 👇 add this block
    baseBuilder: {
      ownerAddress,
      ...(allowedAddresses?.length ? { allowedAddresses } : {}),
    },


    miniapp: {
      version: '1',
      name: 'Velocity',
      subtitle: 'run',
      description: 'Velocity mini app',
      screenshotUrls: [`${ROOT}/screenshot-portrait.png`],
      iconUrl: `${ROOT}/images/icon.png`,
      splashImageUrl: `${ROOT}/images/splash.png`,
      splashBackgroundColor: '#000000',
      homeUrl: ROOT,
      webhookUrl: `${ROOT}/api/webhook`,
      primaryCategory: 'games',
      tags: ['game', 'arcade'],
      heroImageUrl: `${ROOT}/images/splash.png`,
      tagline: 'dodge the obstacles',
      ogTitle: 'Velocity',
      ogDescription: 'tap to play',
      ogImageUrl: `${ROOT}/images/splash.png`,
    },
  });
}
