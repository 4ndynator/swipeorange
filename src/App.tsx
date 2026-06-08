import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { DEMO_MENU } from './demoData'
import { loadMenu, loadPreferences, saveMenu, savePreferences } from './storage'
import {
  DEFAULT_MENU,
  type Category,
  type MenuData,
  type MenuItem,
  type Preferences,
  type VariantOption,
} from './types'

const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

const sortByOrder = <T extends { order: number }>(items: T[]) => [...items].sort((a, b) => a.order - b.order)

const moveItem = <T,>(items: T[], index: number, direction: number): T[] => {
  const target = index + direction
  if (target < 0 || target >= items.length) {
    return items
  }

  const updated = [...items]
  ;[updated[index], updated[target]] = [updated[target], updated[index]]
  return updated
}

const toDisplay = (localized: Record<string, string>, language: string, fallback: string): string =>
  localized[language]?.trim() || localized[fallback]?.trim() || '—'

const formatPrice = (value: number): string => `€${value.toFixed(2)}`

const isStringRecord = (value: unknown): value is Record<string, string> =>
  !!value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.values(value as Record<string, unknown>).every((entry) => typeof entry === 'string')

const isVariantOption = (value: unknown): value is VariantOption =>
  !!value &&
  typeof value === 'object' &&
  typeof (value as VariantOption).id === 'string' &&
  typeof (value as VariantOption).name === 'string' &&
  typeof (value as VariantOption).priceDelta === 'number' &&
  Number.isFinite((value as VariantOption).priceDelta)

const isVariantGroup = (value: unknown): boolean =>
  !!value &&
  typeof value === 'object' &&
  typeof (value as { id: unknown }).id === 'string' &&
  typeof (value as { name: unknown }).name === 'string' &&
  Array.isArray((value as { options: unknown }).options) &&
  (value as { options: unknown[] }).options.every(isVariantOption)

const isModifierGroup = (value: unknown): boolean =>
  isVariantGroup(value) && typeof (value as { required: unknown }).required === 'boolean'

const parseOptionString = (raw: string): VariantOption[] =>
  raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [name, deltaRaw] = part.split(':').map((value) => value.trim())
      const parsed = Number(deltaRaw ?? 0)
      return { id: makeId(), name, priceDelta: Number.isNaN(parsed) ? 0 : parsed }
    })
    .filter((option) => option.name)

const isMenuData = (value: unknown): value is MenuData => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const parsed = value as Partial<MenuData>
  if (
    !Array.isArray(parsed.languages) ||
    !parsed.languages.length ||
    !parsed.languages.every((language) => typeof language === 'string' && language.length > 0) ||
    typeof parsed.defaultLanguage !== 'string' ||
    !parsed.languages.includes(parsed.defaultLanguage) ||
    !Array.isArray(parsed.categories) ||
    !Array.isArray(parsed.items) ||
    typeof parsed.updatedAt !== 'string'
  ) {
    return false
  }

  if (
    !parsed.categories.every(
      (category) =>
        !!category &&
        typeof category === 'object' &&
        typeof category.id === 'string' &&
        isStringRecord(category.names) &&
        typeof category.hidden === 'boolean' &&
        typeof category.order === 'number' &&
        Number.isFinite(category.order),
    )
  ) {
    return false
  }

  const categoryIds = new Set(parsed.categories.map((category) => category.id))
  return parsed.items.every(
    (item) =>
      !!item &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.categoryId === 'string' &&
      categoryIds.has(item.categoryId) &&
      isStringRecord(item.names) &&
      isStringRecord(item.descriptions) &&
      typeof item.image === 'string' &&
      typeof item.basePrice === 'number' &&
      Number.isFinite(item.basePrice) &&
      typeof item.badge === 'string' &&
      (item.visibility === 'visible' || item.visibility === 'hidden') &&
      (item.availability === 'available' || item.availability === 'unavailable' || item.availability === 'hidden') &&
      Array.isArray(item.variants) &&
      item.variants.every(isVariantGroup) &&
      Array.isArray(item.modifiers) &&
      item.modifiers.every(isModifierGroup) &&
      typeof item.order === 'number' &&
      Number.isFinite(item.order),
  )
}

function App() {
  const [menu, setMenu] = useState<MenuData>(DEFAULT_MENU)
  const [prefs, setPrefs] = useState<Preferences>(() => loadPreferences())
  const [screen, setScreen] = useState<'home' | 'admin' | 'customer'>(() => loadPreferences().mode)
  const [isLoaded, setLoaded] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState('all')
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const [newCategoryName, setNewCategoryName] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('0')
  const [newItemCategoryId, setNewItemCategoryId] = useState('')

  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const persisted = await loadMenu()
      if (!mounted) {
        return
      }

      if (persisted && isMenuData(persisted)) {
        setMenu(persisted)
      }

      setLoaded(true)
    }

    void init()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    const syncedMenu = { ...menu, updatedAt: new Date().toISOString() }
    void saveMenu(syncedMenu).catch(() => undefined)
  }, [menu, isLoaded])

  useEffect(() => {
    savePreferences(prefs)
  }, [prefs])

  const sortedCategories = useMemo(() => sortByOrder(menu.categories), [menu.categories])
  const activeLanguage = menu.languages.includes(prefs.language) ? prefs.language : menu.defaultLanguage

  const customerItems = useMemo(() => {
    const visibleCategoryIds = new Set(sortedCategories.filter((category) => !category.hidden).map((category) => category.id))

    return sortByOrder(menu.items)
      .filter((item) => item.visibility === 'visible' && item.availability !== 'hidden')
      .filter((item) => visibleCategoryIds.has(item.categoryId))
      .filter((item) => (prefs.unavailableBehavior === 'hide' ? item.availability !== 'unavailable' : true))
      .filter((item) => (activeCategoryId === 'all' ? true : item.categoryId === activeCategoryId))
      .filter((item) => toDisplay(item.names, activeLanguage, menu.defaultLanguage).toLowerCase().includes(search.toLowerCase()))
  }, [activeCategoryId, activeLanguage, menu.defaultLanguage, menu.items, prefs.unavailableBehavior, search, sortedCategories])

  const boundedIndex = customerItems.length ? Math.min(activeIndex, customerItems.length - 1) : 0
  const currentItem = customerItems[boundedIndex]

  const selectedItem = useMemo(
    () => menu.items.find((item) => item.id === selectedItemId) || currentItem || null,
    [menu.items, selectedItemId, currentItem],
  )

  const categoryName = (category: Category): string => toDisplay(category.names, activeLanguage, menu.defaultLanguage)

  const goToScreen = (target: 'home' | 'admin' | 'customer') => {
    setScreen(target)
    if (target === 'admin' || target === 'customer') {
      setPrefs((prev) => ({ ...prev, mode: target }))
    }
  }

  const updateCategory = (categoryId: string, updater: (category: Category) => Category) => {
    setMenu((prev) => ({
      ...prev,
      categories: prev.categories.map((category) => (category.id === categoryId ? updater(category) : category)),
    }))
  }

  const updateItem = (itemId: string, updater: (item: MenuItem) => MenuItem) => {
    setMenu((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === itemId ? updater(item) : item)),
    }))
  }

  const addCategory = () => {
    const value = newCategoryName.trim()
    if (!value) {
      return
    }

    setMenu((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          id: makeId(),
          names: { [prev.defaultLanguage]: value },
          hidden: false,
          order: prev.categories.length,
        },
      ],
    }))
    setNewCategoryName('')
  }

  const deleteCategory = (categoryId: string) => {
    const hasItems = menu.items.some((item) => item.categoryId === categoryId)
    const confirmed = hasItems
      ? window.confirm('This category still has items. Delete category and all related items?')
      : window.confirm('Delete this category?')

    if (!confirmed) {
      return
    }

    setMenu((prev) => {
      const categories = sortByOrder(prev.categories.filter((category) => category.id !== categoryId)).map((category, index) => ({
        ...category,
        order: index,
      }))

      const items = sortByOrder(prev.items.filter((item) => item.categoryId !== categoryId)).map((item, index) => ({
        ...item,
        order: index,
      }))

      return { ...prev, categories, items }
    })
  }

  const addItem = () => {
    const name = newItemName.trim()
    const categoryId = newItemCategoryId || sortedCategories[0]?.id

    if (!name || !categoryId) {
      return
    }

    const parsedPrice = Number(newItemPrice)
    setMenu((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: makeId(),
          categoryId,
          names: { [prev.defaultLanguage]: name },
          descriptions: { [prev.defaultLanguage]: newItemDescription.trim() },
          image: '',
          basePrice: Number.isNaN(parsedPrice) ? 0 : parsedPrice,
          badge: '',
          visibility: 'visible',
          availability: 'available',
          variants: [],
          modifiers: [],
          order: prev.items.length,
        },
      ],
    }))

    setNewItemName('')
    setNewItemDescription('')
    setNewItemPrice('0')
  }

  const deleteItem = (itemId: string) => {
    if (!window.confirm('Delete this item?')) {
      return
    }

    setMenu((prev) => ({
      ...prev,
      items: sortByOrder(prev.items.filter((item) => item.id !== itemId)).map((item, index) => ({ ...item, order: index })),
    }))
  }

  const duplicateItem = (item: MenuItem) => {
    const clone: MenuItem = {
      ...item,
      id: makeId(),
      names: Object.fromEntries(
        Object.entries(item.names).map(([lang, text]) => [lang, `${text}${lang === menu.defaultLanguage ? ' (Copy)' : ''}`]),
      ),
      variants: item.variants.map((group) => ({
        ...group,
        id: makeId(),
        options: group.options.map((option) => ({ ...option, id: makeId() })),
      })),
      modifiers: item.modifiers.map((group) => ({
        ...group,
        id: makeId(),
        options: group.options.map((option) => ({ ...option, id: makeId() })),
      })),
      order: menu.items.length,
    }

    setMenu((prev) => ({ ...prev, items: [...prev.items, clone] }))
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(menu, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'swipeorange-menu-backup.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    try {
      const raw = await file.text()
      const parsed = JSON.parse(raw) as unknown

      if (!isMenuData(parsed)) {
        window.alert('Import failed: invalid menu JSON structure.')
        return
      }

      if (!window.confirm('Import will overwrite your local data. Continue?')) {
        return
      }

      setMenu({ ...parsed, updatedAt: new Date().toISOString() })
    } catch {
      window.alert('Import failed: file could not be parsed.')
    }
  }

  const nextCard = () => {
    if (!customerItems.length) {
      return
    }

    setActiveIndex((prev) => (prev + 1) % customerItems.length)
  }

  const previousCard = () => {
    if (!customerItems.length) {
      return
    }

    setActiveIndex((prev) => (prev - 1 + customerItems.length) % customerItems.length)
  }

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartX.current
    if (startX === null) {
      return
    }

    const touch = event.changedTouches[0]
    touchStartX.current = null
    if (!touch) {
      return
    }

    const delta = touch.clientX - startX

    if (Math.abs(delta) < 30) {
      return
    }

    if (delta < 0) {
      nextCard()
    } else {
      previousCard()
    }
  }

  const resetData = () => {
    if (!window.confirm('Reset all local data? This cannot be undone.')) {
      return
    }

    setMenu(DEFAULT_MENU)
  }

  if (!isLoaded) {
    return <main className="app loading">Loading local menu…</main>
  }

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <h1>SwipeOrange</h1>
          <p>Local-only swipe-friendly interactive menu</p>
        </div>
        <div className="topbar-actions">
          <button type="button" onClick={() => goToScreen('home')}>
            Home
          </button>
          <button type="button" onClick={() => goToScreen('admin')}>
            Manage Menu
          </button>
          <button type="button" onClick={() => goToScreen('customer')}>
            Open Customer Menu
          </button>
        </div>
      </header>

      {screen === 'home' && (
        <section className="panel stack">
          <h2>Home</h2>
          <p>Set up or browse your local menu on this device. No server required.</p>
          <div className="actions-wrap">
            <button type="button" onClick={() => goToScreen('customer')}>
              Open Customer Menu
            </button>
            <button type="button" onClick={() => goToScreen('admin')}>
              Manage Menu
            </button>
            <button type="button" onClick={exportJson}>
              Export JSON
            </button>
            <label className="upload">
              Import JSON
              <input type="file" accept="application/json" onChange={handleImport} />
            </label>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Load demo data and overwrite current menu?')) {
                  setMenu({ ...DEMO_MENU, updatedAt: new Date().toISOString() })
                }
              }}
            >
              Load Demo Data
            </button>
          </div>
        </section>
      )}

      {screen === 'admin' && (
        <section className="admin-layout">
          <article className="panel stack">
            <h2>Settings</h2>
            <label>
              Default language
              <select
                value={menu.defaultLanguage}
                onChange={(event) => setMenu((prev) => ({ ...prev, defaultLanguage: event.target.value }))}
              >
                {menu.languages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Add language code
              <div className="inline">
                <input
                  placeholder="e.g. fr"
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') {
                      return
                    }

                    const value = (event.currentTarget.value || '').trim().toLowerCase()
                    if (!value || menu.languages.includes(value)) {
                      return
                    }

                    setMenu((prev) => ({ ...prev, languages: [...prev.languages, value] }))
                    event.currentTarget.value = ''
                  }}
                />
              </div>
            </label>
            <label>
              Unavailable item behavior
              <select
                value={prefs.unavailableBehavior}
                onChange={(event) =>
                  setPrefs((prev) => ({
                    ...prev,
                    unavailableBehavior: event.target.value === 'hide' ? 'hide' : 'mark',
                  }))
                }
              >
                <option value="mark">Show as unavailable</option>
                <option value="hide">Hide unavailable items</option>
              </select>
            </label>
            <div className="actions-wrap">
              <button type="button" onClick={exportJson}>
                Export JSON
              </button>
              <label className="upload">
                Import JSON
                <input type="file" accept="application/json" onChange={handleImport} />
              </label>
              <button type="button" className="danger" onClick={resetData}>
                Reset local data
              </button>
            </div>
          </article>

          <article className="panel stack">
            <h2>Categories</h2>
            <div className="inline">
              <input
                value={newCategoryName}
                placeholder="Category name"
                onChange={(event) => setNewCategoryName(event.target.value)}
              />
              <button type="button" onClick={addCategory}>
                Add Category
              </button>
            </div>
            <ul className="list">
              {sortedCategories.length === 0 && <li className="empty">No categories yet.</li>}
              {sortedCategories.map((category, index) => (
                <li key={category.id} className="item-card">
                  <strong>{categoryName(category)}</strong>
                  {menu.languages.map((language) => (
                    <label key={`${category.id}-${language}`}>
                      Name ({language})
                      <input
                        value={category.names[language] ?? ''}
                        placeholder={language === menu.defaultLanguage ? 'Required' : 'Optional'}
                        onChange={(event) =>
                          updateCategory(category.id, (current) => ({
                            ...current,
                            names: { ...current.names, [language]: event.target.value },
                          }))
                        }
                      />
                    </label>
                  ))}
                  <div className="actions-wrap">
                    <button type="button" onClick={() => updateCategory(category.id, (current) => ({ ...current, hidden: !current.hidden }))}>
                      {category.hidden ? 'Show' : 'Hide'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setMenu((prev) => ({
                          ...prev,
                          categories: moveItem(sortByOrder(prev.categories), index, -1).map((value, position) => ({
                            ...value,
                            order: position,
                          })),
                        }))
                      }
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setMenu((prev) => ({
                          ...prev,
                          categories: moveItem(sortByOrder(prev.categories), index, 1).map((value, position) => ({
                            ...value,
                            order: position,
                          })),
                        }))
                      }
                    >
                      ↓
                    </button>
                    <button type="button" className="danger" onClick={() => deleteCategory(category.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel stack">
            <h2>Items</h2>
            <div className="grid-two">
              <input value={newItemName} placeholder="Item name" onChange={(event) => setNewItemName(event.target.value)} />
              <input
                value={newItemDescription}
                placeholder="Short description"
                onChange={(event) => setNewItemDescription(event.target.value)}
              />
              <input
                value={newItemPrice}
                type="number"
                step="0.01"
                min="0"
                onChange={(event) => setNewItemPrice(event.target.value)}
              />
              <select value={newItemCategoryId} onChange={(event) => setNewItemCategoryId(event.target.value)}>
                <option value="">Select category</option>
                {sortedCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {categoryName(category)}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" onClick={addItem}>
              Add Item
            </button>

            <ul className="list">
              {sortByOrder(menu.items).length === 0 && <li className="empty">No items yet.</li>}
              {sortByOrder(menu.items).map((item, index) => (
                <li key={item.id} className="item-card">
                  <strong>{toDisplay(item.names, activeLanguage, menu.defaultLanguage)}</strong>
                  <label>
                    Category
                    <select
                      value={item.categoryId}
                      onChange={(event) => updateItem(item.id, (current) => ({ ...current, categoryId: event.target.value }))}
                    >
                      {sortedCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {categoryName(category)}
                        </option>
                      ))}
                    </select>
                  </label>
                  {menu.languages.map((language) => (
                    <div key={`${item.id}-lang-${language}`} className="grid-two">
                      <label>
                        Name ({language})
                        <input
                          value={item.names[language] ?? ''}
                          onChange={(event) =>
                            updateItem(item.id, (current) => ({
                              ...current,
                              names: { ...current.names, [language]: event.target.value },
                            }))
                          }
                        />
                      </label>
                      <label>
                        Description ({language})
                        <input
                          value={item.descriptions[language] ?? ''}
                          onChange={(event) =>
                            updateItem(item.id, (current) => ({
                              ...current,
                              descriptions: { ...current.descriptions, [language]: event.target.value },
                            }))
                          }
                        />
                      </label>
                    </div>
                  ))}
                  <div className="grid-two">
                    <label>
                      Image URL
                      <input
                        value={item.image}
                        placeholder="https://..."
                        onChange={(event) => updateItem(item.id, (current) => ({ ...current, image: event.target.value }))}
                      />
                    </label>
                    <label>
                      Badge
                      <input
                        value={item.badge}
                        placeholder="Special"
                        onChange={(event) => updateItem(item.id, (current) => ({ ...current, badge: event.target.value }))}
                      />
                    </label>
                    <label>
                      Base price
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.basePrice}
                        onChange={(event) =>
                          updateItem(item.id, (current) => ({
                            ...current,
                            basePrice: Number(event.target.value) || 0,
                          }))
                        }
                      />
                    </label>
                    <label>
                      Availability
                      <select
                        value={item.availability}
                        onChange={(event) =>
                          updateItem(item.id, (current) => ({
                            ...current,
                            availability: event.target.value as MenuItem['availability'],
                          }))
                        }
                      >
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    Visibility
                    <select
                      value={item.visibility}
                      onChange={(event) =>
                        updateItem(item.id, (current) => ({
                          ...current,
                          visibility: event.target.value as MenuItem['visibility'],
                        }))
                      }
                    >
                      <option value="visible">Visible</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </label>
                  <div className="stack nested">
                    <h3>Variants</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const name = window.prompt('Variant group name (e.g. Size)')?.trim()
                        const optionsRaw = window.prompt('Options format: Small:0, Large:1.5') ?? ''
                        const options = parseOptionString(optionsRaw)
                        if (!name || options.length === 0) {
                          return
                        }
                        updateItem(item.id, (current) => ({
                          ...current,
                          variants: [...current.variants, { id: makeId(), name, options }],
                        }))
                      }}
                    >
                      Add Variant Group
                    </button>
                    {item.variants.map((group) => (
                      <div key={group.id} className="row">
                        <span>
                          {group.name}: {group.options.map((option) => `${option.name} (${formatPrice(option.priceDelta)})`).join(', ')}
                        </span>
                        <button
                          type="button"
                          className="danger"
                          onClick={() =>
                            updateItem(item.id, (current) => ({
                              ...current,
                              variants: current.variants.filter((value) => value.id !== group.id),
                            }))
                          }
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="stack nested">
                    <h3>Modifiers</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const name = window.prompt('Modifier group name (e.g. Extras)')?.trim()
                        const required = window.confirm('Should this modifier group be required?')
                        const optionsRaw = window.prompt('Options format: Ice:0, Whipped cream:0.8') ?? ''
                        const options = parseOptionString(optionsRaw)
                        if (!name || options.length === 0) {
                          return
                        }
                        updateItem(item.id, (current) => ({
                          ...current,
                          modifiers: [...current.modifiers, { id: makeId(), name, required, options }],
                        }))
                      }}
                    >
                      Add Modifier Group
                    </button>
                    {item.modifiers.map((group) => (
                      <div key={group.id} className="row">
                        <span>
                          {group.name} {group.required ? '(Required)' : '(Optional)'}:{' '}
                          {group.options.map((option) => `${option.name} (${formatPrice(option.priceDelta)})`).join(', ')}
                        </span>
                        <button
                          type="button"
                          className="danger"
                          onClick={() =>
                            updateItem(item.id, (current) => ({
                              ...current,
                              modifiers: current.modifiers.filter((value) => value.id !== group.id),
                            }))
                          }
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="actions-wrap">
                    <button
                      type="button"
                      onClick={() =>
                        setMenu((prev) => ({
                          ...prev,
                          items: moveItem(sortByOrder(prev.items), index, -1).map((value, position) => ({
                            ...value,
                            order: position,
                          })),
                        }))
                      }
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setMenu((prev) => ({
                          ...prev,
                          items: moveItem(sortByOrder(prev.items), index, 1).map((value, position) => ({
                            ...value,
                            order: position,
                          })),
                        }))
                      }
                    >
                      ↓
                    </button>
                    <button type="button" onClick={() => duplicateItem(item)}>
                      Duplicate
                    </button>
                    <button type="button" className="danger" onClick={() => deleteItem(item.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </section>
      )}

      {screen === 'customer' && (
        <section className="stack">
          <article className="panel stack">
            <h2>Customer Menu</h2>
            <div className="grid-two">
              <label>
                Language
                <select
                  value={activeLanguage}
                  onChange={(event) => setPrefs((prev) => ({ ...prev, language: event.target.value }))}
                >
                  {menu.languages.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Category
                <select
                  value={activeCategoryId}
                  onChange={(event) => {
                    setActiveCategoryId(event.target.value)
                    setActiveIndex(0)
                  }}
                >
                  <option value="all">All categories</option>
                  {sortedCategories
                    .filter((category) => !category.hidden)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {categoryName(category)}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <label>
              Search by item name
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search menu" />
            </label>
          </article>

          <article className="panel stack">
            <div className="row between">
              <h3>Browse</h3>
              <p>
                {customerItems.length === 0 ? 'No matching items' : `${boundedIndex + 1} / ${customerItems.length}`}
              </p>
            </div>

            {currentItem ? (
              <div className="swipe-card" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <div className="image-wrap">
                  {currentItem.image ? (
                    <img src={currentItem.image} alt={toDisplay(currentItem.names, activeLanguage, menu.defaultLanguage)} />
                  ) : (
                    <div className="image-placeholder">No image</div>
                  )}
                </div>
                <div className="stack">
                  <div className="row between">
                    <h3>{toDisplay(currentItem.names, activeLanguage, menu.defaultLanguage)}</h3>
                    <strong>{formatPrice(currentItem.basePrice)}</strong>
                  </div>
                  {currentItem.badge && <span className="badge">{currentItem.badge}</span>}
                  {currentItem.availability === 'unavailable' && prefs.unavailableBehavior === 'mark' && (
                    <span className="status">Unavailable</span>
                  )}
                  <p>{toDisplay(currentItem.descriptions, activeLanguage, menu.defaultLanguage)}</p>
                  <div className="actions-wrap">
                    <button type="button" onClick={previousCard}>
                      ◀ Prev
                    </button>
                    <button type="button" onClick={nextCard}>
                      Next ▶
                    </button>
                    <button type="button" onClick={() => setSelectedItemId(currentItem.id)}>
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="empty">No items available for this filter.</p>
            )}
          </article>

          {selectedItem && (
            <article className="panel stack">
              <div className="row between">
                <h3>Item Details</h3>
                <button type="button" onClick={() => setSelectedItemId(null)}>
                  Close
                </button>
              </div>
              <p>{toDisplay(selectedItem.descriptions, activeLanguage, menu.defaultLanguage)}</p>
              <p>
                <strong>Base price:</strong> {formatPrice(selectedItem.basePrice)}
              </p>
              <div className="stack">
                <h4>Variants</h4>
                {selectedItem.variants.length ? (
                  <ul>
                    {selectedItem.variants.map((group) => (
                      <li key={group.id}>
                        <strong>{group.name}: </strong>
                        {group.options.map((option) => `${option.name} (${formatPrice(option.priceDelta)})`).join(', ')}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty">No variants</p>
                )}
              </div>
              <div className="stack">
                <h4>Modifiers</h4>
                {selectedItem.modifiers.length ? (
                  <ul>
                    {selectedItem.modifiers.map((group) => (
                      <li key={group.id}>
                        <strong>
                          {group.name} {group.required ? '(Required)' : '(Optional)'}:
                        </strong>{' '}
                        {group.options.map((option) => `${option.name} (${formatPrice(option.priceDelta)})`).join(', ')}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty">No modifiers</p>
                )}
              </div>
            </article>
          )}
        </section>
      )}
    </main>
  )
}

export default App
