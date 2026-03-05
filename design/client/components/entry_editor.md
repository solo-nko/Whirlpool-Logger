# Edit Entry

## Variables and Props

### Props

#### Category

- **Name:** `category`
- **Required:** Yes
- **Type:** [Category](/design/client/models/category.md)

#### Entry

- **Name:** `entry`
- **Required:** No
- **Type:** [WhirlpoolLog](/design/client/models/whirlpool_log.md)

### Variables

#### Editing Log

Log

- **Name:** `editingModel`
- **Type:** [WhirlpoolLog](/design/client/models/whirlpool_log.md)

## UI

### Entry Form Inputs

Input boxes for filling out the Whirlpool log entry.

### Title

### Status

### Chapter

### Volume

### Rating

### Progress

### Notes

### Additional Fields

- **EXPERIMENTAL: Element/Component:** [VExpansionPanel](https://vuetifyjs.com/en/components/expansion-panels/)
- **Display:**
  - If category.extraFields.length is greater than 0, Yes. Otherwise, No.
  - Open by default?
- **Usable:** Yes
- **Content:**
  - Header: "Additional Fields"
  - For each item in category.extraFields, display an element.

### Date Updated

- **Element/Component:** VTextFieldInput
  - Type: Date
- **Display:** Yes
- **Usable:** Yes
- **Content:** "Date Updated"
- **Model:** [EditingLog](#editing-log)
  - `editingLog.userUpdatedOn`

### Set to Today

- **Element/Component:** VButton
- **Display:** Yes
- **Usable:** Yes
- **Contents:** "Set to Today"
- **Actions:** [Set To Today](#set-to-today-1)

### Save

### Cancel

- **Element/Component:** VButton
- **Display:**
  - If Entry is defined, Yes
  - Otherwise, No
- **Usable:** Yes
- **Contents:** "Cancel"
- **Actions:** [OnCancel](#on-cancel)

## Actions

### On Mounted

- Set [Editing Log](#editing-log) to an initial value:
  - If [Entry](#entry) has been set, set it to Entry
  - Otherwise, set to initial field values:
    - `id`: Generate new ULID()
    - `title`: Set to blank string
    - `updatedOn`: Set to a DateTime representing today.
    - `createdOn`: Set to a DateTime representing today.
    - `extraFields`: Set to an empty array of [FieldValue](/design/client/models/field_value.md)
    - `tags`: Set to an empty array of [Tag](/design/client/models/tag.md)

### On Save

### On Cancel

### Set to Today

- Set `editingLog.userUpdatedOn` to the current day.
