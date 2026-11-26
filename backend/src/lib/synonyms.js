// Words shorter than 3 letters and words that appear inside common unrelated words (e.g. «ابل» in
// «قابل», «عجل» in «مستعجل», "tent" in "content") are deliberately left out.
// Words Mauritanians use for the same thing, in Arabic, Hassaniya, French and English.
// Searching one word of a group also finds listings written with the others ("هاتف" finds
// "Téléphone", "تلفون", "portable"...). Plurals are listed too, so category names match.
export const SYNONYM_GROUPS = [
  // Phones and electronics
  ['هاتف', 'هواتف', 'تلفون', 'تلفونات', 'تليفون', 'جوال', 'جوالات', 'موبايل', 'محمول', 'portable', 'portables', 'telephone', 'telephones', 'smartphone', 'phone', 'phones', 'mobile'],
  ['ايفون', 'آيفون', 'iphone', 'apple'],
  ['سامسونج', 'سامسونغ', 'samsung', 'galaxy', 'جالكسي', 'غالاكسي'],
  ['تلفاز', 'تلفزيون', 'تلفزة', 'شاشة', 'television', 'ecran'],
  ['لابتوب', 'حاسوب', 'حواسيب', 'كمبيوتر', 'كومبيوتر', 'ordinateur', 'ordinateurs', 'laptop', 'computer', 'computers'],
  ['شاحن', 'chargeur', 'charger'],
  ['سماعة', 'سماعات', 'ecouteur', 'ecouteurs', 'casque', 'headphones', 'airpods'],
  // Vehicles
  ['سيارة', 'سيارات', 'وته', 'وتات', 'طوموبيل', 'voiture', 'voitures', 'vehicule', 'vehicules', 'auto', 'cars'],
  ['تويوتا', 'toyota'], ['هايلكس', 'هيلكس', 'هيلوكس', 'hilux'], ['مرسيدس', 'مرسدس', 'mercedes', 'benz'],
  ['دراجة', 'دراجات', 'موتو', 'موطو', 'moto', 'motos', 'scooter', 'motorcycle', 'motorbike'],
  ['شاحنة', 'شاحنات', 'كميون', 'camion', 'camions', 'truck'],
  ['اطار', 'اطارات', 'كاوتشو', 'pneu', 'pneus', 'tire', 'tyre'],
  // Property
  ['منزل', 'منازل', 'بيت', 'بيوت', 'فيلا', 'maison', 'maisons', 'villa', 'house', 'home'],
  ['شقة', 'شقق', 'ابارتمان', 'appartement', 'appartements', 'apartment', 'flat', 'studio'],
  ['كراء', 'ايجار', 'للايجار', 'للكراء', 'location', 'louer', 'rent', 'rental'],
  ['قطعة', 'ارض', 'اراضي', 'كزرة', 'terrain', 'terrains', 'parcelle', 'land', 'plot'],
  ['عقار', 'عقارات', 'immobilier', 'realestate'],
  // Home
  ['ثلاجة', 'ثلاجات', 'فريجيدير', 'refrigerateur', 'frigo', 'fridge', 'refrigerator'],
  ['مكيف', 'مكيفات', 'كليم', 'climatiseur', 'clim', 'climatisation'],
  ['غسالة', 'غسالات', 'machine', 'lavelinge', 'washer'],
  ['صالون', 'كنبة', 'كنب', 'salon', 'canape', 'sofa', 'couch'],
  ['سرير', 'اسرة', 'فراش', 'matelas', 'bed', 'mattress'],
  ['اثاث', 'مفروشات', 'meuble', 'meubles', 'furniture'],
  ['مولد', 'مولدات', 'جنراتور', 'groupe', 'electrogene', 'generateur', 'generator'],
  ['خيمة', 'خيام', 'tente', 'tentes'],
  // Clothes
  ['دراعة', 'دراريع', 'boubou', 'daraa'], ['ملحفة', 'ملاحف', 'melhfa', 'malahfa'],
  ['ملابس', 'لباس', 'ثياب', 'vetement', 'vetements', 'habits', 'clothes', 'clothing'],
  ['حذاء', 'احذية', 'صباط', 'chaussure', 'chaussures', 'shoes', 'sneakers'],
  // Animals
  ['خروف', 'خرفان', 'كبش', 'كباش', 'اضحية', 'اضاحي', 'mouton', 'moutons', 'belier', 'sheep'],
  ['جمل', 'جمال', 'ناقة', 'نوق', 'chameau', 'chameaux', 'dromadaire', 'camel', 'camels'],
  ['ماعز', 'معز', 'عنز', 'chevre', 'chevres', 'goat', 'goats'],
  ['بقرة', 'بقر', 'ابقار', 'vache', 'vaches', 'boeuf', 'cow', 'cattle'],
  // Condition, jobs, services
  ['جديد', 'جديدة', 'neuf', 'neuve', 'new'], ['مستعمل', 'مستعملة', 'occasion', 'used'],
  ['خدمة', 'خدمات', 'service', 'services'], ['دروس', 'تدريس', 'cours', 'lessons', 'tutoring'],
];

/** Same normalisation as search terms (imported lazily to avoid a cycle). */
let index = null;
export function synonymsOf(term, normalize) {
  if (!index) {
    index = new Map();
    for (const group of SYNONYM_GROUPS) {
      const words = [...new Set(group.map((w) => normalize(w).replace(/^(ال)(?=\S{2,})/, '')))];
      for (const w of words) index.set(w, [...new Set([...(index.get(w) || []), ...words.filter((x) => x.length >= 3)])]);
    }
  }
  return index.get(term) || [term];
}
