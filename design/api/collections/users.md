# Users

## Columns

### Server ID

- **Name:** `id`
- **Type:** string
- **Hidden:** `false`
- **Min Length:** `15`
- **Max length:** `15`
- **Validation:** `^[a-z0-9]+$`
- **Autogenerate pattern:** `[a-z0-9]{15}`
- **Nullable:** `false`

### Password

- **Name:** `password`
- **Type:** string
- **Hidden:** `true`
- **Min Length:** `8`
- **Max Length:** None

### Email

- **Name:** `email`
- **Type:** string (email)
- **Nullable:** `true`

### Sync Code

- **Name:** `syncCode`
- **Type:** string
- **Hidden:** `false`
- **Min Length:** `10`
- **Max Length:** `10`
- **Validation:** `^[a-zA-Z0-9]{10}$`
- **Autogenerate Pattern:** `[a-zA-Z0-9]{10}`

### Nickname

- **Name:** `nickname`
- **Type:** string
- **Hidden:** `true`
- **Remarks:** Not used for now.

### Last Synced

- **Name:** `lastSyncedOn`
- **Type:** string (date)
- **Hidden:** `false`

### Date Created (Auto)

- **Name:** `created`
- **Type:** string (auto-date)
- **Hidden:** `false`

### Date Updated (Auto)

- **Name:** `updated`
- **Type:** string (auto-date)
- **Hidden:** `false`

## Constraints and Indexes

- Unique: `tokenKey`
- Unique: `email`
- Unique: `syncCode`

## API Rules

### List/Search Rule

- Superusers only

### View Rule

- Superusers only

### Create Rule

- Open access

### Update Rule

- `@request.body.syncCode:changed = false`
  - Requests may not alter `syncCode`.

### Delete Rule

- Superusers only

## Options

### Auth Methods

- Identity/Password:
  - Enabled: `true`
  - Unique Identity Fields:
    - [Sync Code](#sync-code)
