export const languages = ['es', 'en'] as const;
export type Language = (typeof languages)[number];

const es = {
  brand: 'Lugares CR',
  header: {
    myList: 'Mi lista',
    signIn: 'Iniciar sesión',
    signOut: 'Cerrar sesión',
  },
  auth: {
    email: 'Correo',
    emailPlaceholder: 'tu@correo.com',
    sendMagicLink: 'Enviar enlace mágico',
    sending: 'Enviando…',
    checkEmail: 'Revisa tu correo para el enlace de acceso.',
  },
  browse: {
    suggestPlace: 'Sugerir un lugar',
    filters: 'Filtros',
    mapView: 'Vista de mapa',
    listView: 'Vista de lista',
    loadingPlaces: 'Cargando lugares…',
  },
  filters: {
    category: 'Categoría',
    difficulty: 'Dificultad',
    pets: 'Mascotas',
    cost: 'Costo',
    anyCategory: 'Cualquier categoría',
    anyDifficulty: 'Cualquier dificultad',
    anyPets: 'Cualquier mascota',
    anyCost: 'Cualquier costo',
    maxDistance: 'Distancia máxima',
    any: 'Cualquiera',
    clearFilters: 'Limpiar filtros',
    petsQuick: 'Perros',
  },
  placeActions: {
    save: 'Guardar en mi lista',
    saved: 'Guardado',
    markVisited: 'Marcar como visitado',
    visited: 'Visitado',
    signInPrompt: 'Inicia sesión (arriba a la derecha) para guardar lugares y llevar registro de tus visitas.',
  },
};

const en: typeof es = {
  brand: 'CR Outdoor Places',
  header: {
    myList: 'My List',
    signIn: 'Sign in',
    signOut: 'Sign out',
  },
  auth: {
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    sendMagicLink: 'Send magic link',
    sending: 'Sending…',
    checkEmail: 'Check your email for a sign-in link.',
  },
  browse: {
    suggestPlace: 'Suggest a place',
    filters: 'Filters',
    mapView: 'Map view',
    listView: 'List view',
    loadingPlaces: 'Loading places…',
  },
  filters: {
    category: 'Category',
    difficulty: 'Difficulty',
    pets: 'Pets',
    cost: 'Cost',
    anyCategory: 'Any category',
    anyDifficulty: 'Any difficulty',
    anyPets: 'Any pets',
    anyCost: 'Any cost',
    maxDistance: 'Max distance',
    any: 'Any',
    clearFilters: 'Clear filters',
    petsQuick: 'Dogs',
  },
  placeActions: {
    save: 'Save to my list',
    saved: 'Saved',
    markVisited: 'Mark as visited',
    visited: 'Visited',
    signInPrompt: 'Sign in (top right) to save places and track visits.',
  },
};

export const dictionaries = { es, en } satisfies Record<Language, typeof es>;

export type Dictionary = typeof es;
