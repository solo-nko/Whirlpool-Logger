# New Entry

## Variables and Props

### Variables

#### Categories

- Name: `categories`
- Type: Category

### Props

## UI

### Category Tabs

- **Element/Component:** [VTabs](https://vuetifyjs.com/en/components/tabs/)
- **Display:** Yes
- **Usable:** Yes
- **Contents:**
  - For each element in Categories, add a tab:
    - Name: category.name
    - Component: [EditEntry](/design/client/components/entry_edit.md)
      - Props:
        - category: category.id
-

## Actions

### On Mounted

- Set [categories](#categories) using categories table from IndexedDB
