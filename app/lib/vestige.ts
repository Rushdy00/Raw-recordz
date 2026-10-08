/**
 * RAW RECORDZ brand content and the fallbacks used when a store has not yet been
 * populated with the metafields / metaobjects the storefront reads.
 *
 * Every value here is original placeholder copy. Once a real store defines
 * `season.*` metafields and a `hero_slides` metaobject, the loaders prefer the
 * live values and these are never used.
 */

export const ANNOUNCEMENT = 'FREE SHIPPING OVER $300';

/** Handle of the collection the homepage drop section reads. */
export const DROP_COLLECTION_HANDLE = '2026fw-drop-1';

export const DROP_TITLE = 'RELEASED 08.24 | 2026FW DROP 1';

export const SEASON_TITLE = 'OBSIDIAN LINE';
export const SEASON_TAG = '2026 FW';

/** Metafield namespace/key pairs read from the Storefront API. */
export const METAFIELD_IDENTIFIERS = {
  seasonCore: {namespace: 'season', key: 'core'},
  seasonPhilosophy: {namespace: 'season', key: 'philosophy'},
  seasonDesignPrinciple: {namespace: 'season', key: 'design_principle'},
  editionSize: {namespace: 'product', key: 'edition_size'},
} as const;

/** Shape of one label/statement pair in the season concept block. */
export type SeasonStatement = {
  label: string;
  statement: string;
};

export const SEASON_FALLBACK: SeasonStatement[] = [
  {
    label: 'SEASON CORE',
    statement: 'Garments cut from the memory of stone and worn into the present.',
  },
  {
    label: 'SEASON PHILOSOPHY',
    statement: 'What survives a century should not announce itself loudly.',
  },
  {
    label: 'SEASON DESIGN PRINCIPLE',
    statement: 'Structure first, ornament never, patina earned over years.',
  },
];

/** One hero slide, mirroring the `hero_slides` metaobject fields. */
export type HeroSlide = {
  id: string;
  eyebrow: string;
  headline: string;
  copy: string[];
  link: string;
  image: {
    url: string;
    altText: string;
    width: number;
    height: number;
  } | null;
};

/**
 * Campaign imagery. The first slide is RAW RECORDZ's own frame, served from
 * `public/hero/`; the rest are dark, low-key editorial frames from Unsplash
 * standing in for the real shoot. They carry no third-party branding.
 *
 * Each was chosen for mean luminance under ~80/255 so the white display type
 * and the 0.34 scrim hold up. Keep that in mind when swapping them out —
 * `scripts/pick-images.mjs` prints the luminance of any candidate.
 */
export const HERO_SLIDES_FALLBACK: HeroSlide[] = [
  {
    id: 'hero-1',
    eyebrow: 'FALL / WINTER 2026 COLLECTION',
    headline: 'OBSIDIAN LINE',
    copy: [
      'RAW RECORDZ 26FW draws from volcanic glass and folded wool — surfaces that',
      'record pressure and time. Each garment is cut once, finished by hand and',
      'numbered in sequence, with forty pieces released across three drops.',
      'Nothing is restocked once a run closes.',
    ],
    link: `/collections/${DROP_COLLECTION_HANDLE}`,
    image: {
      url: '/hero/desert-fur.webp',
      altText:
        'Figure in a long fur coat and wide-leg raw denim leaning on a boulder in a grey desert',
      width: 1672,
      height: 941,
    },
  },
  {
    id: 'hero-2',
    eyebrow: 'FALL / WINTER 2026 COLLECTION',
    headline: 'ASH REGISTER',
    copy: [
      'Dry pigment is pressed into heavyweight cotton and left to settle',
      'unevenly, so no two pieces weather alike. Seams stay visible as a record',
      'of assembly, and every garment carries its own edition mark.',
      'Available only while the run lasts.',
    ],
    link: `/collections/${DROP_COLLECTION_HANDLE}`,
    image: {
      url: 'https://images.unsplash.com/photo-1779810677455-449ae4ee2bc7?auto=format&fit=crop&w=2400&q=70',
      altText: 'Sculptural jacket with voluminous sleeves against a black ground',
      width: 2400,
      height: 1600,
    },
  },
  {
    id: 'hero-3',
    eyebrow: 'FALL / WINTER 2026 COLLECTION',
    headline: 'STONE INDEX',
    copy: [
      'Proportions are drawn from quarried architecture — load-bearing lines',
      'translated into cloth. Weighted hems hold their own shape, and natural',
      'dyes shift with wear rather than fading uniformly.',
      'The index closes when the stone runs out.',
    ],
    link: `/collections/${DROP_COLLECTION_HANDLE}`,
    image: {
      url: 'https://images.unsplash.com/photo-1782528013685-812fbcd20085?auto=format&fit=crop&w=2400&q=70',
      altText: 'Figure in a fringed garment lit against a deep shadowed studio',
      width: 2400,
      height: 1600,
    },
  },
  {
    id: 'hero-4',
    eyebrow: 'FALL / WINTER 2026 COLLECTION',
    headline: 'IRON SEASON',
    copy: [
      'Outerwear built to outlast its own decade: hardware machined from solid',
      'bar stock, linings quilted for northern winters, and shells that stiffen',
      'against weather before they soften into shape.',
      'Delivered in numbered archive boxes.',
    ],
    link: `/collections/${DROP_COLLECTION_HANDLE}`,
    image: {
      url: 'https://images.unsplash.com/photo-1776256318694-922979ab0a94?auto=format&fit=crop&w=2400&q=70',
      altText: 'Desaturated street portrait of a figure in a heavy black coat',
      width: 2400,
      height: 1600,
    },
  },
];

/**
 * Footer brand statement, set as two short paragraphs beside the newsletter
 * signup. The longer archive story lives on /pages/about.
 */
export const BRAND_STORY_LINES = [
  'RAW RECORDZ builds a contemporary wardrobe shaped by archaeology, inherited craft and modern construction.',
  'The V Mark traces two folds of one ribbon, standing for what erodes and what is rebuilt around the body.',
];

/** Kept for the about page and anywhere the long form is wanted. */
export const BRAND_STORY =
  'RAW RECORDZ works from what is left behind. Each season begins in an archive — a fragment of masonry, a funerary textile, a tool worn smooth by a hand that is no longer here — and ends in a garment built to survive the same distance. We cut in small numbered runs, finish by hand in a single workshop, and release only when a piece is right rather than when a calendar says so. Nothing is restocked. What you buy becomes, in time, someone else’s artifact.';

/** Newsletter invitation shown above the footer signup field. */
export const NEWSLETTER_PITCH =
  'Join RAW RECORDZ members — get 10% off your first order, plus early access to every drop.';

/** Social accounts linked from the footer. */
export const SOCIAL_LINKS = [
  {name: 'Instagram', url: 'https://instagram.com'},
  {name: 'TikTok', url: 'https://tiktok.com'},
  {name: 'YouTube', url: 'https://youtube.com'},
  {name: 'LINE', url: 'https://line.me'},
  {name: 'WhatsApp', url: 'https://whatsapp.com'},
];

export const FOOTER_LINKS = [
  {title: 'ABOUT RAW RECORDZ', url: '/pages/about'},
  {title: 'CONTACT', url: '/pages/contact'},
  {title: 'FAQ', url: '/pages/faq'},
  {title: 'PRIVACY', url: '/pages/privacy'},
  {title: 'SHIPPING', url: '/pages/shipping'},
  {title: 'REFUND', url: '/pages/refund'},
];

/**
 * Navigation rows. Rows 1 and 2 hold dropdown entries that open the mega panel;
 * `panel` lists the links shown inside it.
 */
export type NavItem = {
  title: string;
  url: string;
  panel?: {title: string; url: string}[];
};

export const NAV_ROWS: NavItem[][] = [
  [
    {title: 'ALL', url: '/collections/all'},
    {title: '26 FW', url: `/collections/${DROP_COLLECTION_HANDLE}`},
    {title: 'LIMITED SERIES', url: '/collections/featured'},
    {
      title: 'TOPS',
      url: '/collections/tops',
      panel: [
        {title: 'ALL TOPS', url: '/collections/tops'},
        {title: 'OUTERWEAR', url: '/collections/tops'},
        {title: 'KNITWEAR', url: '/collections/tops'},
        {title: 'SHIRTING', url: '/collections/tops'},
        {title: 'JERSEY', url: '/collections/tops'},
      ],
    },
  ],
  [
    {
      title: 'BOTTOMS',
      url: '/collections/bottoms',
      panel: [
        {title: 'ALL BOTTOMS', url: '/collections/bottoms'},
        {title: 'TROUSERS', url: '/collections/bottoms'},
        {title: 'DENIM', url: '/collections/bottoms'},
        {title: 'SHORTS', url: '/collections/bottoms'},
      ],
    },
    {
      title: 'ACCESSORIES',
      url: '/collections/accessories',
      panel: [
        {title: 'ALL ACCESSORIES', url: '/collections/accessories'},
        {title: 'BAGS', url: '/collections/accessories'},
        {title: 'HARDWARE', url: '/collections/accessories'},
        {title: 'FOOTWEAR', url: '/collections/shoes'},
      ],
    },
    {
      title: 'COLLECTIONS',
      url: '/collections',
      panel: [
        {title: '2026 FW — OBSIDIAN LINE', url: `/collections/${DROP_COLLECTION_HANDLE}`},
        {title: '2026 SS — SALT RECORD', url: '/collections/all'},
        {title: '2025 FW — KILN', url: '/collections/all'},
        {title: 'ARCHIVE', url: '/collections'},
      ],
    },
  ],
  [{title: 'COMMUNITY', url: '/pages/community'}],
];

/** Static page copy, used when the store has no matching Shopify page. */
export const PAGE_FALLBACKS: Record<
  string,
  {title: string; body: string[]}
> = {
  about: {
    title: 'ABOUT',
    body: [
      'RAW RECORDZ is a small workshop making contemporary garments out of ancient evidence.',
      'We begin each season with an object that has already survived: a fragment of carved stone, a burial textile, a hand tool polished by decades of use. We study how it was made, what it was made to withstand, and what the passing of time did to it. The garment that follows is not a costume of that object. It is an attempt to build something with the same intention — to last, to be repaired rather than replaced, and to look better once it has been worn hard.',
      'Production is deliberately small. Every run is numbered and finished by hand in a single workshop. We do not restock. When a run closes, it stays closed, and the pieces that exist are the only ones that will.',
    ],
  },
  contact: {
    title: 'CONTACT',
    body: [
      'For orders, sizing and repairs, write to the studio and a person will answer.',
      'Studio enquiries: studio@example.com. Press and stockists: press@example.com. We answer within two business days, Monday to Friday. There is no phone line — we would rather write carefully than speak quickly.',
      'The workshop is not open to the public, but we host fitting appointments by request during each drop window.',
    ],
  },
  faq: {
    title: 'FAQ',
    body: [
      'HOW DOES SIZING RUN? True to size with a deliberately generous shoulder and a straight body. If you are between sizes and want a closer line, take the smaller one.',
      'WILL A SOLD-OUT PIECE RETURN? No. Every run is numbered and closed. Occasionally a cancelled order returns a single unit to stock, which is released without announcement.',
      'CAN I HAVE SOMETHING REPAIRED? Yes. We repair anything we have made, for as long as we are able to. Send a photograph to the studio and we will tell you what is possible and what it costs.',
      'DO YOU HOLD A WAITING LIST? Members receive drop access first. Beyond that we hold no list and honour no reservations.',
    ],
  },
  shipping: {
    title: 'SHIPPING',
    body: [
      'Orders leave the workshop within two business days of the drop closing.',
      'Domestic orders over $300 ship free and arrive in three to five business days. Under $300, a flat $12 applies. International shipping is calculated at checkout and typically arrives within seven to twelve business days; duties and import taxes are the responsibility of the recipient.',
      'Every parcel ships with tracking and requires a signature. If a delivery fails twice, the parcel returns to the studio and we will write to arrange a second attempt.',
    ],
  },
  refund: {
    title: 'REFUND',
    body: [
      'Unworn pieces may be returned within fourteen days of delivery.',
      'Garments must arrive with their edition tag attached and in original condition. Return shipping is paid by the customer unless the piece arrived faulty or incorrect, in which case we cover it entirely. Refunds are issued to the original payment method within five business days of the return reaching the workshop.',
      'Final-sale archive pieces and altered garments cannot be returned. This is stated on the product page before purchase.',
    ],
  },
  privacy: {
    title: 'PRIVACY',
    body: [
      'We collect the minimum required to send you a garment and, if you ask for it, an email about the next one.',
      'That means your name, address, contact details and order history. Payment details are handled by our payment processor and never reach our servers. We do not sell or share personal data with third parties for their own marketing.',
      'You can ask us at any time what we hold, request a copy, or ask us to delete it. Write to the studio and we will action it within thirty days.',
    ],
  },
  community: {
    title: 'COMMUNITY',
    body: [
      'Members see each drop first and keep archive pricing for as long as they remain members.',
      'Membership is free. It exists so that the people who actually wear the garments get access ahead of resellers. Members receive the drop calendar, early access windows, repair priority, and an invitation to the fitting appointments we run during each release.',
      'We write rarely — roughly once a season — and you can leave at any time from the footer of any message.',
    ],
  },
};

/** Countries offered in the region modal when the store has no market data. */
export const COUNTRY_FALLBACK = [
  {isoCode: 'US', name: 'United States', currency: 'USD', symbol: '$'},
  {isoCode: 'CA', name: 'Canada', currency: 'CAD', symbol: '$'},
  {isoCode: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£'},
  {isoCode: 'FR', name: 'France', currency: 'EUR', symbol: '€'},
  {isoCode: 'DE', name: 'Germany', currency: 'EUR', symbol: '€'},
  {isoCode: 'IT', name: 'Italy', currency: 'EUR', symbol: '€'},
  {isoCode: 'ES', name: 'Spain', currency: 'EUR', symbol: '€'},
  {isoCode: 'NL', name: 'Netherlands', currency: 'EUR', symbol: '€'},
  {isoCode: 'SE', name: 'Sweden', currency: 'SEK', symbol: 'kr'},
  {isoCode: 'NO', name: 'Norway', currency: 'NOK', symbol: 'kr'},
  {isoCode: 'DK', name: 'Denmark', currency: 'DKK', symbol: 'kr'},
  {isoCode: 'JP', name: 'Japan', currency: 'JPY', symbol: '¥'},
  {isoCode: 'KR', name: 'South Korea', currency: 'KRW', symbol: '₩'},
  {isoCode: 'CN', name: 'China', currency: 'CNY', symbol: '¥'},
  {isoCode: 'HK', name: 'Hong Kong SAR', currency: 'HKD', symbol: '$'},
  {isoCode: 'SG', name: 'Singapore', currency: 'SGD', symbol: '$'},
  {isoCode: 'AU', name: 'Australia', currency: 'AUD', symbol: '$'},
  {isoCode: 'NZ', name: 'New Zealand', currency: 'NZD', symbol: '$'},
  {isoCode: 'AE', name: 'United Arab Emirates', currency: 'AED', symbol: 'د.إ'},
  {isoCode: 'CH', name: 'Switzerland', currency: 'CHF', symbol: 'CHF'},
];

export const LANGUAGE_FALLBACK = [
  {isoCode: 'EN', name: 'English'},
  {isoCode: 'FR', name: 'Français'},
  {isoCode: 'DE', name: 'Deutsch'},
  {isoCode: 'JA', name: '日本語'},
];
