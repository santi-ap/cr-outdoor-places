import type { Language } from '@/lib/i18n/dictionary';

type LabelMap = Record<string, string>;

const categoryLabelsEn: LabelMap = {
  national_park: 'National park',
  municipal_park: 'Municipal park',
  private_reserve: 'Private reserve',
  other: 'Other',
};

const categoryLabelsEs: LabelMap = {
  national_park: 'Parque nacional',
  municipal_park: 'Parque municipal',
  private_reserve: 'Reserva privada',
  other: 'Otro',
};

const landscapeLabelsEn: LabelMap = {
  beach: 'Beach',
  mountain: 'Mountain',
  forest: 'Forest',
  trail: 'Trail',
  field: 'Field',
  other: 'Other',
};

const landscapeLabelsEs: LabelMap = {
  beach: 'Playa',
  mountain: 'Montaña',
  forest: 'Bosque',
  trail: 'Sendero',
  field: 'Campo',
  other: 'Otro',
};

const difficultyLabelsEn: LabelMap = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Hard',
};

const difficultyLabelsEs: LabelMap = {
  easy: 'Fácil',
  moderate: 'Moderado',
  hard: 'Difícil',
};

const petFriendlyLabelsEn: LabelMap = {
  yes: 'Pet-friendly',
  no: 'No pets',
  unknown: 'Pet policy unknown',
};

const petFriendlyLabelsEs: LabelMap = {
  yes: 'Mascotas',
  no: 'No mascotas',
  unknown: 'Política de mascotas desconocida',
};

const costTypeLabelsEn: LabelMap = {
  free: 'Free',
  paid: 'Paid',
  unknown: 'Cost unknown',
};

const costTypeLabelsEs: LabelMap = {
  free: 'Gratis',
  paid: 'Pagado',
  unknown: 'Costo desconocido',
};

const terrainLabelsEn: LabelMap = {
  paved: 'Paved',
  dirt: 'Dirt',
  rocky: 'Rocky',
  mixed: 'Mixed',
};

const terrainLabelsEs: LabelMap = {
  paved: 'Pavimentado',
  dirt: 'Tierra',
  rocky: 'Rocoso',
  mixed: 'Mixto',
};

// Suggestion form: pet policy and cost type both already have 'unknown' as
// a real, meaningful enum value (it's the column's own DB default) — so
// unlike category/landscape there's no separate "leave it blank" state to
// offer on top of that. The select always has one of these three chosen,
// defaulting to 'unknown', with fuller phrasing suited to a full-width
// form field rather than the compact filter-chip wording above.
const petFriendlySuggestionLabelsEn: LabelMap = {
  unknown: 'Unknown',
  yes: 'Pets allowed',
  no: 'Pets not allowed',
};

const petFriendlySuggestionLabelsEs: LabelMap = {
  unknown: 'Desconocido',
  yes: 'Se permiten mascotas',
  no: 'No se permiten mascotas',
};

const costTypeSuggestionLabelsEn: LabelMap = {
  unknown: 'Unknown',
  free: 'Free',
  paid: 'Paid',
};

const costTypeSuggestionLabelsEs: LabelMap = {
  unknown: 'Desconocido',
  free: 'Gratis',
  paid: 'Pagado',
};

function byLanguage(language: Language, es: LabelMap, en: LabelMap): LabelMap {
  return language === 'es' ? es : en;
}

export function getCategoryLabels(language: Language) {
  return byLanguage(language, categoryLabelsEs, categoryLabelsEn);
}

export function getLandscapeLabels(language: Language) {
  return byLanguage(language, landscapeLabelsEs, landscapeLabelsEn);
}

export function getDifficultyLabels(language: Language) {
  return byLanguage(language, difficultyLabelsEs, difficultyLabelsEn);
}

export function getPetFriendlyLabels(language: Language) {
  return byLanguage(language, petFriendlyLabelsEs, petFriendlyLabelsEn);
}

export function getCostTypeLabels(language: Language) {
  return byLanguage(language, costTypeLabelsEs, costTypeLabelsEn);
}

// Filter UIs shouldn't offer "unknown" as something to filter by — nobody
// wants to search for "pet policy unknown" — but the full label maps above
// still need the 'unknown' entry for display (detail page, suggestion form).
function withoutUnknown(labels: LabelMap): LabelMap {
  return Object.fromEntries(Object.entries(labels).filter(([key]) => key !== 'unknown'));
}

export function getPetFriendlyFilterLabels(language: Language) {
  return withoutUnknown(getPetFriendlyLabels(language));
}

export function getCostTypeFilterLabels(language: Language) {
  return withoutUnknown(getCostTypeLabels(language));
}

export function getPetFriendlySuggestionLabels(language: Language) {
  return byLanguage(language, petFriendlySuggestionLabelsEs, petFriendlySuggestionLabelsEn);
}

export function getCostTypeSuggestionLabels(language: Language) {
  return byLanguage(language, costTypeSuggestionLabelsEs, costTypeSuggestionLabelsEn);
}

export function getTerrainLabels(language: Language) {
  return byLanguage(language, terrainLabelsEs, terrainLabelsEn);
}
