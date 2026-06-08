import type { MenuData } from './types'

export const DEMO_MENU: MenuData = {
  languages: ['en', 'de'],
  defaultLanguage: 'en',
  updatedAt: new Date().toISOString(),
  categories: [
    { id: 'cat-1', names: { en: 'Coffee', de: 'Kaffee' }, hidden: false, order: 0 },
    { id: 'cat-2', names: { en: 'Desserts', de: 'Desserts' }, hidden: false, order: 1 },
  ],
  items: [
    {
      id: 'item-1',
      categoryId: 'cat-1',
      names: { en: 'Flat White', de: 'Flat White' },
      descriptions: {
        en: 'Double espresso with silky steamed milk.',
        de: 'Doppelter Espresso mit samtigem Milchschaum.',
      },
      image:
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
      basePrice: 3.8,
      badge: 'Popular',
      visibility: 'visible',
      availability: 'available',
      variants: [
        {
          id: 'var-1',
          name: 'Size',
          options: [
            { id: 'var-1-opt-1', name: 'Small', priceDelta: 0 },
            { id: 'var-1-opt-2', name: 'Large', priceDelta: 0.8 },
          ],
        },
      ],
      modifiers: [
        {
          id: 'mod-1',
          name: 'Milk',
          required: false,
          options: [
            { id: 'mod-1-opt-1', name: 'Oat', priceDelta: 0.5 },
            { id: 'mod-1-opt-2', name: 'Soy', priceDelta: 0.4 },
          ],
        },
      ],
      order: 0,
    },
    {
      id: 'item-2',
      categoryId: 'cat-2',
      names: { en: 'Cheesecake', de: 'Käsekuchen' },
      descriptions: {
        en: 'Creamy baked cheesecake with berry compote.',
        de: 'Cremiger Käsekuchen mit Beerenkompott.',
      },
      image:
        'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1200&q=80',
      basePrice: 4.6,
      badge: 'Special',
      visibility: 'visible',
      availability: 'available',
      variants: [],
      modifiers: [],
      order: 1,
    },
  ],
}
