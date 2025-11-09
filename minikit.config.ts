const ROOT = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

export const minikitConfig = {
  accountAssociation: {
    header: process.env.NEXT_PUBLIC_FARCASTER_HEADER || '',
    payload: process.env.NEXT_PUBLIC_FARCASTER_PAYLOAD || '',
    signature: process.env.NEXT_PUBLIC_FARCASTER_SIGNATURE || ''
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
  }
} as const;

export default minikitConfig;
