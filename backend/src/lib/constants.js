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

// Default prices for paid upgrades, in MRU (the admin changes them in Admin → Payments).
// CITIES only seeds the `cities` table on the first run; the table is the source of truth. A seller pays by mobile money, uploads the receipt, and an admin approves.
export const VERIFY_PRICE = 500;
export const FEATURE_PLANS = [
  { days: 7, price: 200 },
  { days: 15, price: 350 },
  { days: 30, price: 600 },
];
export const PAYMENT_METHODS = ['bankily', 'masrvi', 'sedad', 'other'];

// Moughataas of Nouakchott (approximate centres), used to name the area of a position
// when the map service is not reachable, and offered when picking a place by hand.
export const AREAS = {
  nouakchott: [
    { key: 'tevragh-zeina', ar: 'تفرغ زينة', fr: 'Tevragh Zeina', en: 'Tevragh Zeina', lat: 18.104, lng: -15.975 },
    { key: 'ksar', ar: 'لكصر', fr: 'Ksar', en: 'Ksar', lat: 18.108, lng: -15.950 },
    { key: 'sebkha', ar: 'السبخة', fr: 'Sebkha', en: 'Sebkha', lat: 18.073, lng: -15.985 },
    { key: 'el-mina', ar: 'الميناء', fr: 'El Mina', en: 'El Mina', lat: 18.045, lng: -15.978 },
    { key: 'arafat', ar: 'عرفات', fr: 'Arafat', en: 'Arafat', lat: 18.050, lng: -15.942 },
    { key: 'dar-naim', ar: 'دار النعيم', fr: 'Dar Naïm', en: 'Dar Naim', lat: 18.118, lng: -15.917 },
    { key: 'toujounine', ar: 'توجنين', fr: 'Toujounine', en: 'Toujounine', lat: 18.072, lng: -15.893 },
    { key: 'teyarett', ar: 'تيارت', fr: 'Teyarett', en: 'Teyarett', lat: 18.140, lng: -15.950 },
    { key: 'riyad', ar: 'الرياض', fr: 'Riyad', en: 'Riyad', lat: 18.000, lng: -15.950 },
  ],
};
