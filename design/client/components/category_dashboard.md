# Category Dashboard

## Overview

Contains a list of Whirlpools belonging to up to two different statuses.

## Variables & Props

### Props

#### Category

Category that this dashboard represents.

- **Name:** `category`
- **Type:** [Category](/design/client/models/category.md)
- **Required:** Yes
- **Default Value:** N/A

#### StatusOne

First and primary status.

- **Name:** `statusOne`
- **Type:** Status
- **Required:** Yes
- **Default Value:** N/A

#### StatusTwo

Secondary status.

- **Name:** `statusTwo`
- **Type:** Status
- **Required:** No
- **Default Value:** undefined

### Variables

#### Matching Whirlpools Status One

An array of whirlpools that match the given category and status(s).

- **Name:** `matchedWhirlpoolsOne`
- **Type:** WhirlpoolLog[]
- **Default Value:** []

#### Matching Whirlpools Status Two

An array of whirlpools that match the given category and status(s).

- **Name:** `matchedWhirlpoolsTwo`
- **Type:** WhirlpoolLog[]
- **Default Value:** []

## UI

### List One

- **Element/Component:** List
- **Required:** N/A
- **Display:** Yes
- **Usable:** Yes
- **Label:** N/A
- **Placeholder:** N/A
- **Contents:**
  - List Item

#### List Item

- **Element/Component:** ListItem
- **Required:** N/A
- **Display:** Yes
- **Usable:** Yes
- **Label:** WhirlpoolLog.`title`
- **Placeholder:** N/A
- **Contents:**
  - Title
  - Edit Button

### Divider

### List Two

## Actions
