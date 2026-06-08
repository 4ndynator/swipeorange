import { DEFAULT_PREFERENCES, type MenuData, type Preferences } from './types'

const DB_NAME = 'swipeorange-db'
const DB_VERSION = 1
const STORE_NAME = 'menu'
const MENU_KEY = 'primary'
const PREF_KEY = 'swipeorange.preferences'

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

export const loadMenu = async (): Promise<MenuData | null> => {
  try {
    const db = await openDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const request = tx.objectStore(STORE_NAME).get(MENU_KEY)
      request.onsuccess = () => resolve((request.result as MenuData | undefined) ?? null)
      request.onerror = () => reject(request.error)
    })
  } catch {
    return null
  }
}

export const saveMenu = async (menu: MenuData): Promise<void> => {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(menu, MENU_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export const loadPreferences = (): Preferences => {
  try {
    const raw = localStorage.getItem(PREF_KEY)
    if (!raw) {
      return DEFAULT_PREFERENCES
    }

    const parsed = JSON.parse(raw) as Partial<Preferences>
    return {
      mode: parsed.mode === 'admin' ? 'admin' : 'customer',
      language: parsed.language || DEFAULT_PREFERENCES.language,
      unavailableBehavior: parsed.unavailableBehavior === 'hide' ? 'hide' : 'mark',
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export const savePreferences = (prefs: Preferences): void => {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs))
  } catch {
    return
  }
}
