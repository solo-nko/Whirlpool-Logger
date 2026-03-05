# New Entry

## Variables and Props

### Variables

#### Categories

- Name: `categories`
- Type: [Category[]](/design/client/models/category.md)

### Props

## UI

### Category Tabs

- **Element/Component:** [VTabs](https://vuetifyjs.com/en/components/tabs/)
- **Display:** Yes
- **Usable:** Yes
- **Contents:**
  - For each `category` in [Categories](#categories), add a tab:
    - Name: `category.name`
    - Component: [EditEntry](/design/client/components/entry_editor.md)
      - Props:
        - category: `category`
-

## Actions

### On Mounted

- Set [Categories](#categories) using categories table from IndexedDB
