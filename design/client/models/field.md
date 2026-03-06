# Field

## Members

### Required

#### Id

- **Name:** `id`
- **Type:** ULID/string

#### Type

Type of data the field will hold.

- **Name:** `type`
- **Type:** [FieldType](#enum-fieldtype)

#### Label

- **Name:** `label`
- **Type:** string

#### Hidden

Whether the field is hidden/active.

- **Name:** `hidden`
- **Type:** boolean

### Optional

#### Placeholder

- **Name:** `placeholder`
- **Type:** string

### Enum FieldType

FieldType indicates what manner of field should be used for this field, as well as what type of data it should hold.

- **Name:** `FieldType`
- **Values**:
  - `TEXT` - string
  - `NUMBER` - number
  - `BOOL` - boolean
  - `DATE` - DateTime
