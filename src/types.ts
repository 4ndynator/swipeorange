export type LocalizedText = Record<string, string>

export type ItemVisibility = 'visible' | 'hidden'
export type ItemAvailability = 'available' | 'unavailable' | 'hidden'
export type UnavailableBehavior = 'mark' | 'hide'

export interface VariantOption {
  id: string
  name: string
  priceDelta: number
}

export interface VariantGroup {
  id: string
  name: string
  options: VariantOption[]
}

export interface ModifierGroup {
  id: string
  name: string
  required: boolean
  options: VariantOption[]
}

export interface Category {
  id: string
  names: LocalizedText
  hidden: boolean
  order: number
}

export interface MenuItem {
  id: string
  categoryId: string
  names: LocalizedText
  descriptions: LocalizedText
  image: string
  basePrice: number
  badge: string
  visibility: ItemVisibility
  availability: ItemAvailability
  variants: VariantGroup[]
  modifiers: ModifierGroup[]
  order: number
}

export interface MenuData {
  languages: string[]
  defaultLanguage: string
  categories: Category[]
  items: MenuItem[]
  updatedAt: string
}

export interface Preferences {
  mode: 'admin' | 'customer'
  language: string
  unavailableBehavior: UnavailableBehavior
}

export const DEFAULT_MENU: MenuData = {
  languages: ['en', 'de'],
  defaultLanguage: 'en',
  categories: [],
  items: [],
  updatedAt: new Date().toISOString(),
}

export const DEFAULT_PREFERENCES: Preferences = {
  mode: 'customer',
  language: 'en',
  unavailableBehavior: 'mark',
}
