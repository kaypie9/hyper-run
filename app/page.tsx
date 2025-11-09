// app/page.tsx
export const metadata = {
  title: 'Hyper Run',
  description: 'Dodge • Jump • Slide — chain combos for speed',
  openGraph: {
    title: 'Hyper Run',
    description: 'Dodge • Jump • Slide — chain combos for speed',
    images: ['https://velocity-zeta-wine.vercel.app/images/icon.png'], // absolute URL
  },
  other: {
    'fc:frame': 'vNext', // optional: lets Farcaster know this page can be a frame
  },
};

import GameClient from '@/components/GameClient';

export default function Page() {
  return (
<main className="grid place-items-center h-[100svh] overflow-hidden p-0">
  <div className="p-4">
    <GameClient />
  </div>
</main>

  );
}
