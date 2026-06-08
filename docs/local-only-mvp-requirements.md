# Local-Only MVP Requirements

## Product: Swipe-Friendly Interactive Menu App

## 1. Product Overview
This document defines a local-only MVP for a swipe-friendly interactive menu-style web application inspired by the public product behavior of Swipelime.

The product is a browser-based application that lets one operator create, edit, and present a visually rich digital menu on a single device with no server connection.

### Product principles
- Local-only operation
- No backend, no sync, no online services
- Mobile-first and swipe-friendly browsing
- Single-operator setup with customer-facing presentation mode
- Fast setup for a small venue, event, or prototype

## 2. MVP Goal
The MVP goal is to let a venue owner create and present a polished interactive menu locally on one device, with swipeable browsing, category navigation, item details, modifiers, variants, promotions, and multilingual support, without requiring any server connection.

### MVP success definition
The MVP is successful when a user can:
- create a menu locally from scratch,
- browse it in a customer mode on the same device,
- update availability and promotions instantly,
- switch between at least two languages,
- keep data after refresh or restart,
- export and import the menu as a local JSON backup.

## 3. Target Users
### Primary users
- Café owners
- Restaurant owners
- Food truck operators
- Bar or kiosk operators
- Internal demo or prototype users

### Secondary users
- Guests browsing the menu on a phone or tablet
- Designers validating the experience before adding online features

## 4. Scope and Non-Goals
### In scope
- Local menu setup and editing
- Categories and item ordering
- Swipe-friendly customer browsing
- Item detail views
- Variants and modifiers
- Promotions and badges
- Availability toggles
- Multi-language menu content
- Search and category filters
- Import/export of local data
- Offline-capable behavior after app load

### Non-goals
- No login or user accounts
- No cloud backup or remote sync
- No online ordering submission
- No payments
- No kitchen workflow
- No analytics backend
- No email, SMS, or push notifications
- No POS or third-party integrations
- No multi-device collaboration

## 5. Core Features
1. **Admin mode** for creating and maintaining the menu locally.
2. **Customer mode** for browsing the menu in a clean swipe-based interface.
3. **Category management** with ordering and visibility control.
4. **Item management** with image, description, price, and status.
5. **Variants and modifiers** for configurable menu items.
6. **Promotions** such as badges for specials, popular items, or limited-time offers.
7. **Language switching** for multilingual presentation.
8. **Local persistence** so all changes remain on the device.
9. **Import/export** for manual backup and restore.

## 6. User Stories
### Setup and administration
- As a venue owner, I want to create a menu locally so that I can start without signing up.
- As a venue owner, I want demo data available so that I can understand the app quickly.
- As a venue owner, I want my changes saved automatically so that I do not lose work.
- As a venue owner, I want a separate customer mode so that guests do not see editing controls.

### Categories and items
- As a venue owner, I want to create, edit, delete, and reorder categories so that the menu is organized.
- As a venue owner, I want to create, edit, duplicate, hide, and delete items so that I can manage the menu efficiently.
- As a venue owner, I want to upload or assign an image to an item so that the menu feels visual and modern.
- As a venue owner, I want to mark items available, unavailable, or hidden so that the customer view reflects what can be served.

### Variants, modifiers, and promotions
- As a venue owner, I want to add size or flavor variants so that customers can understand their options.
- As a venue owner, I want to add optional or required modifiers so that item customization is clear.
- As a venue owner, I want to highlight specials with badges so that promoted items stand out.

### Multi-language and backup
- As a venue owner, I want to enter translations for categories and items so that guests can browse in their language.
- As a venue owner, I want untranslated content to fall back to the default language so that the menu stays usable.
- As a venue owner, I want to export and import my menu as JSON so that I can back it up locally.

### Customer browsing
- As a guest, I want to swipe through items so that browsing feels fast and touch-friendly.
- As a guest, I want to filter by category so that I can jump to food, drinks, or desserts.
- As a guest, I want to search for an item by name so that I can find it quickly.
- As a guest, I want to tap into an item for more details so that I can review description, price, variants, and modifiers.
- As a guest, I want promoted items to be visually highlighted so that I notice specials.
- As a guest, I want to switch languages so that I can comfortably read the menu.

## 7. Functional Requirements
### 7.1 Modes
- The application shall provide an Admin mode and a Customer mode.
- The application shall allow switching between modes on the same device.
- The application shall preserve the last-used mode locally.

### 7.2 Category management
- The application shall allow a user to create, edit, delete, hide, show, and reorder categories.
- The application shall support translated category names.
- The application shall warn before deleting a category that still contains items.

### 7.3 Item management
- The application shall allow a user to create, edit, duplicate, delete, hide, show, and reorder items.
- Each item shall support a name, description, image, base price, category assignment, visibility state, and availability state.
- The application shall preview saved changes immediately in Customer mode.

### 7.4 Variants and modifiers
- The application shall allow a user to create variant groups with one or more options.
- Variant options shall support price adjustments.
- The application shall allow a user to create modifier groups with optional or required selection rules.
- Modifier options shall support price adjustments.

### 7.5 Promotions and visibility
- The application shall allow a user to assign promotional badges to items.
- The application shall allow a user to mark items as available, unavailable, or hidden.
- Hidden items shall not appear in Customer mode.
- Unavailable items shall either be hidden or clearly marked based on a local setting.

### 7.6 Language support
- The application shall support at least two languages in the MVP.
- The application shall allow translated names and descriptions for categories and items.
- The application shall fall back to the default language when a translation is missing.

### 7.7 Search and navigation
- The application shall support client-side search by item name.
- The application shall support category filtering.
- The application shall support swipe gestures and visible tap controls for browsing.

### 7.8 Persistence and backup
- The application shall store all menu data locally on the device.
- The application shall not require a network connection for core usage.
- The application shall export the full menu dataset to JSON.
- The application shall validate imported JSON before replacing existing data.
- The application shall confirm destructive actions such as import overwrite or reset.

## 8. Non-Functional Requirements
- The app should feel responsive on common mobile devices.
- Swipe and tap interactions should be smooth and predictable.
- The customer interface should remain usable with at least 200 locally stored menu items.
- Text should be readable with clear contrast and touch-friendly target sizes.
- The interface should be usable offline after the app has loaded.
- Data loss risk should be reduced through automatic local saving and explicit backup export.
- No feature in scope may depend on a remote API or server.

## 9. Simple UX Design
### UX principles
- Keep the experience mobile-first.
- Prefer one-handed navigation.
- Keep admin tasks straightforward and form-based.
- Keep customer browsing visual, fast, and low-friction.

### Primary screens
#### Home
- Buttons: **Open Customer Menu**, **Manage Menu**, **Import JSON**, **Load Demo Data**

#### Admin dashboard
- Sections: Categories, Items, Promotions, Languages, Settings, Export/Import
- Quick actions: Add Category, Add Item, Preview Customer Mode, Export JSON

#### Item editor
- Fields for image, name, description, price, category, status, variants, modifiers, and badges

#### Customer browse screen
- Large swipeable item card
- Visible category selector
- Search action
- Language switcher
- Promotion badges and price on each card

#### Item detail screen
- Larger image, description, price, variants, modifiers, and status messaging

## 10. Primary UX Flows
### First-time setup flow
1. User opens the app.
2. User chooses demo data or manual setup.
3. User adds categories.
4. User adds items and images.
5. User previews the menu in Customer mode.

### Add-item flow
1. User opens Admin mode.
2. User selects **Add Item**.
3. User enters item details.
4. User adds variants, modifiers, and badges if needed.
5. User saves and immediately previews the item.

### Customer browse flow
1. Guest opens Customer mode.
2. Guest swipes through featured or category-filtered items.
3. Guest taps an item to open details.
4. Guest switches language or category as needed.
5. Guest returns to browsing.

### Backup and restore flow
1. User opens Admin mode.
2. User exports the menu as JSON.
3. User later imports the saved JSON.
4. User confirms overwrite.
5. The app restores the local menu.

## 11. Acceptance Criteria
- A user can create categories and items without internet access.
- Menu data persists after refresh or browser restart.
- A guest can browse items through swipe interactions and tap into details.
- The customer view displays images, names, descriptions, and prices correctly.
- Variants and modifiers can be configured and shown on item detail screens.
- Hidden items never appear in Customer mode.
- Unavailable items are either clearly labeled or hidden according to a local setting.
- A user can switch between at least two languages.
- Exported JSON can be imported successfully.
- Invalid import data is rejected with a clear error message.
- No in-scope feature requires a server connection.

## 12. Edge Cases
- Empty menu on first launch
- Category with no items
- Item without an image
- Missing translation for one language
- Duplicate item or category names
- Very long descriptions or many modifiers
- Invalid or incomplete imported JSON
- Browser storage quota reached
- User accidentally deletes an item or category
- Hidden category containing items that would otherwise be visible

## 13. Risks and Constraints
### Risks
- Browser storage limits may constrain large image-heavy menus.
- Clearing browser data may erase the menu if no export exists.
- Local-only architecture prevents live sync across devices.
- Offline support depends on proper app-shell caching or local packaging.

### Constraints
- The MVP must not use a backend or remote database.
- The MVP is designed for one device and one local data set.
- All state changes must be handled on-device only.

## 14. Recommended Technical Direction
- Build the MVP as a responsive web app.
- Use IndexedDB for menu data and localStorage only for lightweight preferences.
- Use client-side state management to keep Admin and Customer modes in sync locally.
- Treat the app as an offline-first experience with cached static assets where possible.
- Prefer local image compression or size guidance to reduce storage pressure.

## 15. Future Phases
### Phase 2
- Local admin PIN
- Drag-and-drop ordering
- Schedule-based promotions and availability
- Better theming and layout customization
- QR code generation for local sharing

### Phase 3
- Optional LAN sync
- Optional backend mode
- Basket and order capture
- Payment integrations
- Multi-device menu management

## 16. Final MVP Definition
The MVP is a local-only, swipe-friendly interactive menu web app that allows a single operator to manage and present a digital menu with categories, item details, variants, modifiers, promotions, language switching, and backup export/import, all without any server connection.
