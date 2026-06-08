# Issue 02: Data model and local persistence

## Goal
Implement local data models and persistence for menu, categories, items, languages, preferences, and UI mode.

## Scope
- Typed menu schema
- Persistence in IndexedDB (menu data) and localStorage (preferences)
- Auto-save on changes
- Last-used mode persistence

## Acceptance Criteria
- Data survives refresh/restart
- Last-used mode is restored
- Corrupt persisted data is handled safely
