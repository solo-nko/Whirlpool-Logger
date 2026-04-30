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

An internal instance/copy of the whirlpool, used for editing.

- **Name:** `editingModel`
- **Type:** [WhirlpoolLog](/design/client/models/whirlpool_log.md)

## UI

### Entry Form Inputs

Input boxes for filling out the Whirlpool log entry.

### Title

- **Element/Component:** Text Field
- **Validation:**
  - **Required:** Yes
  - **Max Length:** 100
  - **Other:** N/A
- **Display:** Yes
- **Usable:** Yes
- **Label:** "Title"
- **Placeholder:** N/A
- **Actions:**
  - On input, set `editingModel.title`

### Status

- **Element/Component**: VAutoComplete
- **Validation:**
  - **Required:** No
  - **Max Length:** 50
- **Display:** Yes
- **Usable:** Yes
- **Label:** "Status"
- **Placeholder:** N/A
- **Actions:**
  - Must select an existing option. No free input.
  - On input, set `editingModel.status`

### Chapter

- **Element/Component**: NumericalInput
- **Validation:**
  - **Required:** No
  - **Max Length:** N/A
  - **Other:** Must be a number
- **Display:**
  - If `entry.modifiedFields` contains a Chapter field where `hidden` is `true`, No
  - Otherwise, Yes
- **Usable:** Yes
- **Label:**
  - If `entry.modifiedFields` contains a Chapter field, use that field's `rename` value.
  - Otherwise, "Chapter"
- **Placeholder:**
  - If `entry.modifiedFields` contains a Chapter field, use that field's `placeholder` value.
  - Otherwise, N/A
- **Actions:**
  - On input, set `editingModel.chapter`

### Volume

- **Element/Component**: NumericalInput
- **Validation:**
  - **Required:** No
  - **Max Length:** 50
  - Must be a number
- **Display:**
  - If `entry.modifiedFields` contains a Volume field where `hidden` is `true`, No
  - Otherwise, Yes
- **Usable:** Yes
- **Label:**
  - If `entry.modifiedFields` contains a Volume field, use that field's `rename` value.
  - Otherwise, "Volume"
- **Placeholder:**
  - If `entry.modifiedFields` contains a Volume field, use that field's `placeholder` value.
  - Otherwise, N/A
- **Actions:**
  - On input, set `editingModel.volume`

### Rating

- **Element/Component**: Select
- **Validation:**
  - **Required:** No
  - **Max Length:** N/A
  - Must be a number
- **Display:**
  - If `entry.modifiedFields` contains a Rating field where `hidden` is `true`, No
  - Otherwise, Yes
- **Usable:** Yes
- **Label:**
  - If `entry.modifiedFields` contains a Rating field, use that field's `rename` value.
  - Otherwise, "Rating"
- **Placeholder:** N/A
- **Actions:**
  - On input, set `editingModel.rating`

### Series

- **Element/Component**: TextField
- **Validation:**
  - **Required:** No
  - **Max Length:** 50
- **Display:**
  - If `entry.modifiedFields` contains a Rating field where `hidden` is `true`, No
  - Otherwise, Yes
- **Usable:** Yes
- **Label:**
  - If `entry.modifiedFields` contains a Rating field, use that field's `rename` value.
  - Otherwise, "Rating"
- **Placeholder:** N/A
- **Actions:**
  - On input, set `editingModel.rating`

### Progress

- **Element/Component**: Text Field
- **Required:** No
- **Display:**
  - If `entry.modifiedFields` contains a Progress field where `hidden` is `true`, No
  - Otherwise, Yes
- **Usable:** Yes
- **Label:**
  - If `entry.modifiedFields` contains a Progress field, use that field's `rename` value.
  - Otherwise, "Progress"
- **Placeholder:**
  - If `entry.modifiedFields` contains a Progress field, use that field's `placeholder` value.
  - Otherwise, N/A
- **Actions:**
  - On input, set `editingModel.progress`

### Notes

- **Element/Component**: [TipTapEditor](wrapped_editor.md)
- **Required:** No
- **Display:**
  - If `entry.modifiedFields` contains a Notes field where `hidden` is `true`, No
  - Otherwise, Yes
- **Usable:** Yes
- **Label:** N/A
- **Placeholder:**
  - If `entry.modifiedFields` contains a Notes field, use that field's `placeholder` value.
  - Otherwise, "Write down your thoughts..."
- **Actions:**
  - On input, set `editingModel.notes`

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

- **Element/Component:** Button
- **Display:** Yes
- **Usable:** Yes
- **Contents:** "Set to Today"
- **Actions:** [Set To Today](#set-to-today-1)

### Save

- **Element/Component:** Button
- **Display:** Yes
- **Usable:** Yes
- **Contents:** "Save"
- **Actions:** [OnSave](#on-save)

### Cancel

- **Element/Component:** Button
- **Display:**
  - If [Entry](#entry) is defined, Yes
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

- Validate Entries
  - Ensure all required entries have values.
    - Title
    - Any fields in `extraFields` where `extraField.required` is `true`.
  -

### On Cancel

### Set to Today

- Set `editingLog.userUpdatedOn` to the current day.
