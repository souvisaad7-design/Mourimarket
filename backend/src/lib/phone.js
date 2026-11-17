// Mauritanian phone numbers: 8 digits starting with 2 (Chinguitel), 3 (Mattel)
// or 4 (Mauritel / fixed lines). Stored in one canonical form: +222XXXXXXXX.
const INVISIBLE = /[​-‏‪-‮⁦-⁩﻿]/g;
// Arabic-Indic and Persian digits typed on Arabic keyboards.
const DIGITS = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9' };

/** Returns "+222XXXXXXXX" or null when the input is not a valid Mauritanian number. */
export function normalizePhone(raw) {
  if (typeof raw !== 'string') return null;
  let digits = raw.replace(INVISIBLE, '').replace(/[٠-٩۰-۹]/g, (d) => DIGITS[d]).replace(/\D/g, '');
  if (digits.startsWith('00222')) digits = digits.slice(5);
  else if (digits.startsWith('222') && digits.length === 11) digits = digits.slice(3);
  return /^[234]\d{7}$/.test(digits) ? `+222${digits}` : null;
}
