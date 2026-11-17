// Mauritanian cities / wilaya capitals, keyed by a stable slug.
export const CITIES = [
  { key: 'nouakchott', ar: 'نواكشوط', fr: 'Nouakchott', en: 'Nouakchott' },
  { key: 'nouadhibou', ar: 'نواذيبو', fr: 'Nouadhibou', en: 'Nouadhibou' },
  { key: 'rosso', ar: 'روصو', fr: 'Rosso', en: 'Rosso' },
  { key: 'kaedi', ar: 'كيهيدي', fr: 'Kaédi', en: 'Kaedi' },
  { key: 'kiffa', ar: 'كيفة', fr: 'Kiffa', en: 'Kiffa' },
  { key: 'zouerate', ar: 'ازويرات', fr: 'Zouérate', en: 'Zouerate' },
  { key: 'atar', ar: 'أطار', fr: 'Atar', en: 'Atar' },
  { key: 'selibaby', ar: 'سيلبابي', fr: 'Sélibaby', en: 'Selibaby' },
  { key: 'nema', ar: 'النعمة', fr: 'Néma', en: 'Nema' },
  { key: 'aioun', ar: 'العيون', fr: 'Aïoun', en: 'Aioun' },
  { key: 'aleg', ar: 'ألاك', fr: 'Aleg', en: 'Aleg' },
  { key: 'akjoujt', ar: 'أكجوجت', fr: 'Akjoujt', en: 'Akjoujt' },
  { key: 'tidjikja', ar: 'تجكجة', fr: 'Tidjikja', en: 'Tidjikja' },
  { key: 'boutilimit', ar: 'بوتلميت', fr: 'Boutilimit', en: 'Boutilimit' },
  { key: 'other', ar: 'مدينة أخرى', fr: 'Autre ville', en: 'Other city' },
];

export const CITY_KEYS = CITIES.map((c) => c.key);

export const REPORT_REASONS = ['scam', 'prohibited', 'wrong_category', 'duplicate', 'offensive', 'other'];

export const MAX_IMAGES = 8;

// Paid verification / featuring requests. Off by default: the site is free.
// Set PAID_UPGRADES=true in the environment to turn the feature back on.
export const paidUpgradesEnabled = () => process.env.PAID_UPGRADES === 'true';

// Paid upgrades, in MRU. A seller pays by mobile money, uploads the receipt, and an admin approves.
export const VERIFY_PRICE = 500;
export const FEATURE_PLANS = [
  { days: 7, price: 200 },
  { days: 15, price: 350 },
  { days: 30, price: 600 },
];
export const PAYMENT_METHODS = ['bankily', 'masrvi', 'sedad', 'other'];
