// Strips diacritics and lowercases so "irazu" matches "Irazú", "catarata la
// paz" matches "Catarata La Paz", etc. — most of our seed place names carry
// Spanish accents that users commonly skip when typing.
export function normalizeForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}
