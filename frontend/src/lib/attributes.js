// Details specific to each category (car make and mileage, rooms and area…). One definition,
// used by the listing form, the server's validation and the search filters.
// type: 'select' (options) | 'int' (min/max) | 'text'; filter: 'eq' | 'range' | 'min' | 'max'
const YEAR_NOW = new Date().getFullYear();

export const ATTRIBUTES = {
  vehicles: [
    { key: 'brand', type: 'select', filter: 'eq', options: ['toyota', 'mercedes', 'hyundai', 'nissan', 'peugeot', 'renault', 'kia', 'ford', 'mitsubishi', 'suzuki', 'honda', 'land-rover', 'bmw', 'volkswagen', 'isuzu', 'other'] },
    { key: 'model', type: 'text', max: 40 },
    { key: 'year', type: 'int', min: 1960, max: YEAR_NOW + 1, filter: 'range' },
    { key: 'mileage', type: 'int', min: 0, max: 3000000, filter: 'max', unit: 'km' },
    { key: 'gearbox', type: 'select', filter: 'eq', options: ['manual', 'automatic'] },
    { key: 'fuel', type: 'select', filter: 'eq', options: ['diesel', 'petrol', 'hybrid', 'electric'] },
  ],
  'real-estate': [
    { key: 'deal', type: 'select', filter: 'eq', options: ['sale', 'rent'] },
    { key: 'propertyType', type: 'select', filter: 'eq', options: ['house', 'apartment', 'land', 'shop', 'office', 'room'] },
    { key: 'rooms', type: 'int', min: 0, max: 50, filter: 'min' },
    { key: 'surface', type: 'int', min: 1, max: 10000000, filter: 'range', unit: 'm²' },
  ],
  'phones-electronics': [
    { key: 'brand', type: 'select', filter: 'eq', options: ['apple', 'samsung', 'huawei', 'xiaomi', 'tecno', 'infinix', 'oppo', 'itel', 'sony', 'lg', 'other'] },
    { key: 'storage', type: 'select', filter: 'eq', options: ['16', '32', '64', '128', '256', '512', '1024'], unit: 'GB' },
  ],
  // Livestock (and the Eid sheep market): sheep, goats, camels, cattle.
  livestock: [
    { key: 'animal', type: 'select', filter: 'eq', options: ['sheep', 'goat', 'camel', 'cow', 'other'] },
    { key: 'sex', type: 'select', filter: 'eq', options: ['male', 'female'] },
    { key: 'breed', type: 'select', filter: 'eq', options: ['touabire', 'peul', 'ladoum', 'local', 'mixed', 'other'] },
    { key: 'ageMonths', type: 'int', min: 0, max: 360, filter: 'range' },
    { key: 'weightKg', type: 'int', min: 1, max: 2000, filter: 'range', unit: 'kg' },
    { key: 'heads', type: 'int', min: 1, max: 5000 },
    { key: 'eidReady', type: 'select', filter: 'eq', options: ['yes', 'no'] },
  ],
  computers: [
    { key: 'brand', type: 'select', filter: 'eq', options: ['hp', 'dell', 'lenovo', 'apple', 'asus', 'acer', 'msi', 'other'] },
    { key: 'ram', type: 'select', filter: 'eq', options: ['4', '8', '16', '32', '64'], unit: 'GB' },
  ],
};

/** Brand names are the same in every language. */
export const BRAND_NAMES = {
  toyota: 'Toyota', mercedes: 'Mercedes-Benz', hyundai: 'Hyundai', nissan: 'Nissan', peugeot: 'Peugeot', renault: 'Renault', kia: 'Kia', ford: 'Ford',
  mitsubishi: 'Mitsubishi', suzuki: 'Suzuki', honda: 'Honda', 'land-rover': 'Land Rover', bmw: 'BMW', volkswagen: 'Volkswagen', isuzu: 'Isuzu',
  apple: 'Apple', samsung: 'Samsung', huawei: 'Huawei', xiaomi: 'Xiaomi', tecno: 'Tecno', infinix: 'Infinix', oppo: 'Oppo', itel: 'itel', sony: 'Sony', lg: 'LG',
  hp: 'HP', dell: 'Dell', lenovo: 'Lenovo', asus: 'Asus', acer: 'Acer', msi: 'MSI',
};

export const attributesFor = (categorySlug) => ATTRIBUTES[categorySlug] || [];
