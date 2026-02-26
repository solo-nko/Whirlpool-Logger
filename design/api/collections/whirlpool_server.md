# Whirlpool Log (Server)

Describes the shape of a Whirlpool log as it will be stored on the cloud server.

## Columns

### ID

- **Name:** `id`
- **Type:** string
- **Min Length:** 26
- **Max Length:** 26
- **Validation:**
  - **RegEx:** `^[0-9A-HJKMNP-TV-Z]{26}$`
- **Autogenerate Pattern:** None

### Title

- **Name:** `title`
- **Type:** string
- **Hidden:** `false`
- **Min Length:** None
- **Max Length:** None
- **Validation:** None
- **Autogenerate Pattern:** None

### Status

- **Name:** `status`
- **Type:** relation (status)
- **Hidden:** `false`
- **Validation:** None
- **Autogenerate Pattern:** None

### Notes

- **Name:** `notes`
- **Type:** string (editor)
- **Hidden:** `false`
- **Max Size:** None

### Rating

- **Name:** `rating`
- **Type:** number
- **Hidden:** `false`

### Sync Code

- **Name:** `syncCode`
- **Type:** string
- **Hidden:** `false`
- **Min Length:** `10`
- **Max Length:** `10`
- **Validation:** `^[a-zA-Z0-9]{10}$`
- **Autogenerate Pattern:** None

### Date Deleted

### Date Created

### Date Updated

- Name: `updatedOn`
- Type: string (date)

### Date Created (Auto)

- Name: `created`
- Type: `string (date)`
- Hidden: `true`
- Remarks: This is automatically generated and updated by the server. It will not be used clientside.

### Date Updated (Auto)

- Name: `updated`
- Type: `string (date)`
- Hidden: `true`
- Remarks: This is automatically generated and updated by the server. It will not be used clientside.

## API Rules
