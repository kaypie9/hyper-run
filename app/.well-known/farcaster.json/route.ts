import { NextResponse } from 'next/server';

// make sure this route always runs on the server at request time
export const dynamic = 'force-dynamic';

const ROOT = process.env.NEXT_PUBLIC_URL || 'https://velocity-zeta-wine.vercel.app';

// your known-good association values (fallbacks)
const FALLBACK = {
  header:
    'eyJmaWQiOjE0MTYwOTEsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhCRGRmYjZhMTBENDdiOUU2OTk0NEE5Mzc3RjQyZDY1NzZBRDQ5YUE1In0',
  payload: 'eyJkb21haW4iOiJ2ZWxvY2l0eS16ZXRhLXdpbmUudmVyY2VsLmFwcCJ9',
  signature:
    'We8Iw18KjbQIqDHPT6o93UscO9S3vM0IhBo3bm9Zye52GV2UN2Lh0IZKfZjoA6USsROWnv4bgy0DOToUeXSkhxs=',
};

export async function GET() {
  const header = process.env.NEXT_PUBLIC_FARCASTER_HEADER || FALLBACK.header;
  const payload = process.env.NEXT_PUBLIC_FARCASTER_PAYLOAD || FALLBACK.payload;
  const signature =
    process.env.NEXT_PUBLIC_FARCASTER_SIGNATURE || FALLBACK.signature;

      // --- Base Builder block (owner required; allowed optional) ---
  const ownerAddress =
    process.env.NEXT_PUBLIC_BASE_BUILDER_OWNER ||
    '0xD1953dc7195a205B562e3DDdF45293Fa646Bab01'; // <- your owner
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
