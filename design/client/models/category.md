# Category

## Members

### Required

#### ID

- **Name:** `id`
- **Type:** ULID/string

#### Name

Name of the category.

- **Name:** `name`
- **Type:** string

#### Modified Fields

Modifications made to the default fields. This should be chosen from among the various input members
available in a Whirlpool Log. Each string refers to the `name` of the field.

- **Name:** `hiddenFields`
- **Type:** Array of objects containing the following:
  - `field`: string
    - Name of the field to customize
  - `rename`: string | undefined
    - Apply a new label to the field
  - `hidden`: boolean
    - Hide the field.

#### Additional Fields

Array of custom fields attached to this category.

- **Name:** `extraFields`
- **Type:** [Field[]](/design/client/models/field.md)

#### Statuses

Array of statuses attached to this category.

- **Name:** `statuses`
- **Type:** [Status[]](/design/client/models/status.md)

#### Date Updated

- **Name:** `updatedOn`
- **Type:** DateTime

#### Date Created

- **Name:** `createdOn`
- **Type:** DateTime

### Optional

#### Date Deleted

- **Name:** `deletedOn`
- **Type:** DateTime

#### Sync Code

Sync Code used for cloud sync.

- **Name:** `syncCode`
- **Type:** string

#### Unsynced Changes

Whether there are unsynced changes to the category.

**Name:** `unsyncedChanges`
**Type:** boolean

#### Color

Color to assign to the category. This will go unused for now.

- **Name:** `color`
- **Type:** `string`
