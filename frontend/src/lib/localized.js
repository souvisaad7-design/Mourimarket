/** Text the admin typed in three languages: the current one, else Arabic. */
export const pickLang = (obj, lang) => (obj && (obj[lang] || obj.ar)) || '';
