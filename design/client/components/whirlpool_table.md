# Whirlpool Table

## Variables & Props

### Props

#### Category

### Variables

#### Whirlpools

- **Name:** `tableWhirlpools`
- **Type:** WhirlpoolLog[]

## UI

### Table

- **Element/Component:** VTable
- **Show:** Yes
- **Usable:** Yes

#### Header

- Search Box
- Columns
  - **Title**
    - Whirlpool media's title.
    - Sortable.
  - **Status**
    - Status assigned to whirlpool
    - If Status is `undefined`, use "None"
    - Sortable.
  - **Tags**
    - A list of up to three tags applied to the whirlpool
    - Sort in alphabetical order, ascending from A
    - Not Sortable.
  - **Date Updated**
    - The last time the whirlpool was updated.
    - Use whirlpool's `userUpdatedOn` property
    - Sortable.
  - **Date Created**
    - Date the whirlpool was first created.
    - Use whirlpool's `createdOn` property
    - Sortable.
  - **Actions**
    - Edit
      - Icon Button
      - On click, open Entry Editor Modal
    - Delete
      - Icon Button
      - On click, open Confirm Modal
    - Not Sortable

#### Footer

- Pagination Controls
  - Select how many items per page to show
    - Choose from 10, 25, 50

## Actions

### On Mounted

Get
