import type { Language } from '@/lib/i18n/dictionary';

type LabelMap = Record<string, string>;

const categoryLabelsEn: LabelMap = {
  national_park: 'National park',
  municipal_park: 'Municipal park',
  private_reserve: 'Private reserve',
  beach: 'Beach',
  mountain: 'Mountain',
  trail: 'Trail',
  other: 'Other',
};

const categoryLabelsEs: LabelMap = {
  national_park: 'Parque nacional',
  municipal_park: 'Parque municipal',
  private_reserve: 'Reserva privada',
  beach: 'Playa',
  mountain: 'Montaña',
  trail: 'Sendero',
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
  yes: 'Se permiten perros',
  no: 'Sin perros',
  unknown: 'Política de mascotas desconocida',
};

const costTypeLabelsEn: LabelMap = {
  free: 'Free',
  paid: 'Paid',
  unknown: 'Cost unknown',
};

const costTypeLabelsEs: LabelMap = {
  free: 'Gratis',
  paid: 'Con entrada',
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

function byLanguage(language: Language, es: LabelMap, en: LabelMap): LabelMap {
  return language === 'es' ? es : en;
}

export function getCategoryLabels(language: Language) {
  return byLanguage(language, categoryLabelsEs, categoryLabelsEn);
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

export function getTerrainLabels(language: Language) {
  return byLanguage(language, terrainLabelsEs, terrainLabelsEn);
}

// English-only maps kept for server components that can't read the client
// language context yet (place detail page's practical-info fallback, etc.).
export const categoryLabels = categoryLabelsEn;
export const difficultyLabels = difficultyLabelsEn;
export const petFriendlyLabels = petFriendlyLabelsEn;
export const costTypeLabels = costTypeLabelsEn;
export const terrainLabels = terrainLabelsEn;
