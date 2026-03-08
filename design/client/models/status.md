# Status

## Members

### Required

#### Id

Id assigned to the status.

- **Name:** `id`
- **Type:** ULID/string

#### Name

Name of the status.

- **Name:** `name`
- **Type:** string

#### Date Created

- **Name:** `createdOn`
- **Type:** DateTime

### Optional

#### Description

Description of the status and what it means.

- **Name:** `description`
- **Type:** string

#### Display Order

Order the status should be displayed in. If undefined, it will be treated as low/0 priority.

- **Name:** `displayOrder`
- **Type:** number

#### Color

Color value, to use for visual customization. Should use hex value.

- **Name:** `color`
- **Type:** string

#### Date Deleted

When status was deleted. If it has not been deleted, this should be undefined.

- **Name:** `deletedOn`
- **Type:** DateTime
