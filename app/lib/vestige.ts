/**
 * VESTIGE brand content and the fallbacks used when a store has not yet been
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
 * Placeholder campaign imagery. Dark, wide frames from Unsplash stand in for
 * the real campaign shoot; they carry no third-party branding.
 */
export const HERO_SLIDES_FALLBACK: HeroSlide[] = [
  {
    id: 'hero-1',
    eyebrow: 'FALL / WINTER 2026 COLLECTION',
    headline: 'OBSIDIAN LINE',
    copy: [
      'A STUDY IN VOLCANIC GLASS AND FOLDED WOOL.',
      'CUT ONCE, FINISHED BY HAND, NUMBERED IN SEQUENCE.',
      'FORTY PIECES RELEASED ACROSS THREE DROPS.',
      'ARCHIVE PRICING HOLDS FOR MEMBERS ONLY.',
    ],
    link: `/collections/${DROP_COLLECTION_HANDLE}`,
    image: {
      url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2400&q=70',
      altText: 'Campaign figure in low light wearing a long structured coat',
      width: 2400,
      height: 1600,
    },
  },
  {
    id: 'hero-2',
    eyebrow: 'FALL / WINTER 2026 COLLECTION',
    headline: 'ASH REGISTER',
    copy: [
      'DRY PIGMENT PRESSED INTO HEAVYWEIGHT COTTON.',
      'SEAMS LEFT VISIBLE AS A RECORD OF ASSEMBLY.',
      'EACH GARMENT CARRIES ITS OWN EDITION MARK.',
      'AVAILABLE WHILE THE RUN LASTS.',
    ],
    link: `/collections/${DROP_COLLECTION_HANDLE}`,
    image: {
      url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2400&q=70',
      altText: 'Dark editorial studio frame with draped fabric',
      width: 2400,
      height: 1600,
    },
  },
  {
    id: 'hero-3',
    eyebrow: 'FALL / WINTER 2026 COLLECTION',
    headline: 'STONE INDEX',
    copy: [
      'PROPORTIONS DRAWN FROM QUARRIED ARCHITECTURE.',
      'WEIGHTED HEMS THAT HOLD THEIR OWN SHAPE.',
      'NATURAL DYES THAT SHIFT WITH WEAR.',
      'NO RESTOCKS ONCE THE RUN CLOSES.',
    ],
    link: `/collections/${DROP_COLLECTION_HANDLE}`,
    image: {
      url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2400&q=70',
      altText: 'Two figures in dark outerwear against a shadowed wall',
      width: 2400,
      height: 1600,
    },
  },
  {
    id: 'hero-4',
    eyebrow: 'FALL / WINTER 2026 COLLECTION',
    headline: 'IRON SEASON',
    copy: [
      'OUTERWEAR BUILT TO OUTLAST ITS OWN DECADE.',
      'HARDWARE MACHINED FROM SOLID BAR STOCK.',
      'LININGS QUILTED FOR NORTHERN WINTERS.',
      'DELIVERED IN NUMBERED ARCHIVE BOXES.',
    ],
    link: `/collections/${DROP_COLLECTION_HANDLE}`,
    image: {
      url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=2400&q=70',
      altText: 'Low-light campaign frame of a figure in a heavy coat',
      width: 2400,
      height: 1600,
    },
  },
];

export const BRAND_STORY =
  'VESTIGE works from what is left behind. Each season begins in an archive — a fragment of masonry, a funerary textile, a tool worn smooth by a hand that is no longer here — and ends in a garment built to survive the same distance. We cut in small numbered runs, finish by hand in a single workshop, and release only when a piece is right rather than when a calendar says so. Nothing is restocked. What you buy becomes, in time, someone else’s artifact.';

export const FOOTER_LINKS = [
  {title: 'ABOUT', url: '/pages/about'},
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
      'VESTIGE is a small workshop making contemporary garments out of ancient evidence.',
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
